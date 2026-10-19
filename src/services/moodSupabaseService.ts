import { supabase } from './supabaseClient';
import type { MoodEntry, MoodEmotion } from '../types';

export interface SupabaseMoodRow {
  id: string;
  user_id: string;
  score: number;
  emotions: string[] | null;
  notes: string | null;
  entry_date?: string;
  date?: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Converts a Supabase mood or regulation row to the application MoodEntry model.
 */
export function decodeDbToMood(row: SupabaseMoodRow): MoodEntry {
  return {
    id: row.id,
    date: row.entry_date || row.date || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    score: Number(row.score) || 5,
    emotions: (row.emotions || []) as MoodEmotion[],
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Helper to determine which table exists between 'mood_entries' and 'regulation'
 */
async function getEffectiveTable(): Promise<'mood_entries' | 'regulation'> {
  // Test mood_entries first
  const { error } = await supabase.from('mood_entries').select('id').limit(1);
  if (!error || !error.message.includes('schema cache')) {
    return 'mood_entries';
  }
  return 'regulation';
}

/**
 * Fetches all mood/regulation entries for the authenticated user from Supabase.
 */
export async function getMoodEntriesFromSupabase(): Promise<{
  data: MoodEntry[];
  error: Error | null;
}> {
  try {
    const table = await getEffectiveTable();
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table has entry_date, try ordering by entry_date
      const retry = await supabase
        .from(table)
        .select('*');

      if (retry.error) {
        console.error(`Supabase getMoodEntries from ${table} error:`, retry.error);
        return { data: [], error: new Error(retry.error.message) };
      }
      const entries = (retry.data as SupabaseMoodRow[]).map(decodeDbToMood);
      return { data: entries, error: null };
    }

    const entries = (data as SupabaseMoodRow[]).map(decodeDbToMood);
    return { data: entries, error: null };
  } catch (err: any) {
    return { data: [], error: new Error(err.message || 'Network error fetching mood entries.') };
  }
}

/**
 * Inserts or updates a mood/regulation entry for a specific date in Supabase.
 * Strictly guarantees that 'notes' is never null, preventing NOT NULL constraint violations
 * on relation "regulation" or "mood_entries".
 */
export async function saveMoodEntryToSupabase(
  userId: string,
  entry: {
    score: number;
    emotions: MoodEmotion[];
    notes?: string;
    date: string;
  }
): Promise<{ data: MoodEntry | null; error: Error | null }> {
  try {
    const table = await getEffectiveTable();

    // Guard: 'notes' column has a NOT NULL constraint on relation "regulation".
    // If notes is optional or empty, save an empty string ("") instead of null.
    const safeNotes = typeof entry.notes === 'string' ? entry.notes.trim() : '';

    // Check if an entry already exists for this date to perform update/upsert
    const { data: existing, error: findError } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', entry.date)
      .maybeSingle();

    if (findError) {
      console.warn(`Checking existing record in ${table}:`, findError.message);
    }

    if (existing?.id) {
      // 1. UPDATE operation on existing record
      const updatePayload: Record<string, any> = {
        score: entry.score,
        emotions: entry.emotions || [],
        notes: safeNotes, // Always string "", NEVER null
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(table)
        .update(updatePayload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error(`Supabase update error on ${table}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      return { data: decodeDbToMood(data as SupabaseMoodRow), error: null };
    } else {
      // 2. INSERT operation for new record
      const insertPayload: Record<string, any> = {
        user_id: userId,
        entry_date: entry.date,
        score: entry.score,
        emotions: entry.emotions || [],
        notes: safeNotes, // Always string "", NEVER null
      };

      const { data, error } = await supabase
        .from(table)
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        console.error(`Supabase insert error on ${table}:`, error);
        return { data: null, error: new Error(error.message) };
      }
      return { data: decodeDbToMood(data as SupabaseMoodRow), error: null };
    }
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to save mood entry.') };
  }
}
