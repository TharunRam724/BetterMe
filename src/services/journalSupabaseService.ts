import { supabase } from './supabaseClient';
import type { JournalEntry } from '../types';

export interface SupabaseJournalRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  emotions: string[] | null;
  reflection: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string | null;
}

/**
 * Converts a Supabase journal_entries row to the application JournalEntry model.
 */
export function decodeDbToJournal(row: SupabaseJournalRow): JournalEntry {
  return {
    id: row.id,
    title: row.title || 'Untitled Reflection',
    content: row.content || '',
    date: row.entry_date || row.created_at.split('T')[0],
    tags: row.emotions || [],
    promptUsed: row.reflection || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

/**
 * Fetches all journal entries for the authenticated user from Supabase.
 */
export async function getJournalEntriesFromSupabase(): Promise<{
  data: JournalEntry[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Supabase getJournalEntries error:', error);
      return { data: [], error: new Error(error.message) };
    }

    const entries = (data as SupabaseJournalRow[]).map(decodeDbToJournal);
    return { data: entries, error: null };
  } catch (err: any) {
    return { data: [], error: new Error(err.message || 'Network error fetching journal entries.') };
  }
}

/**
 * Inserts a new journal entry into Supabase for the authenticated user.
 */
export async function createJournalEntryInSupabase(
  userId: string,
  entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ data: JournalEntry | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        title: entryData.title.trim() || 'Untitled Reflection',
        content: entryData.content.trim(),
        emotions: entryData.tags || [],
        reflection: entryData.promptUsed || null,
        entry_date: entryData.date,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: decodeDbToJournal(data as SupabaseJournalRow), error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to save journal entry.') };
  }
}

/**
 * Updates an existing journal entry in Supabase.
 */
export async function updateJournalEntryInSupabase(
  id: string,
  updates: Partial<JournalEntry>
): Promise<{ data: JournalEntry | null; error: Error | null }> {
  try {
    const payload: Partial<SupabaseJournalRow> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.content !== undefined) payload.content = updates.content.trim();
    if (updates.tags !== undefined) payload.emotions = updates.tags;
    if (updates.promptUsed !== undefined) payload.reflection = updates.promptUsed;
    if (updates.date !== undefined) payload.entry_date = updates.date;

    const { data, error } = await supabase
      .from('journal_entries')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: decodeDbToJournal(data as SupabaseJournalRow), error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to update journal entry.') };
  }
}

/**
 * Deletes a journal entry from Supabase.
 */
export async function deleteJournalEntryInSupabase(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err: any) {
    return { error: new Error(err.message || 'Failed to delete journal entry.') };
  }
}
