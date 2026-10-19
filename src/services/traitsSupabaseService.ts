import { supabase } from './supabaseClient';
import type { Trait, TraitType } from '../types';

export interface SupabaseTraitRow {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  notes: string | null;
  archived: boolean | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Encodes application Trait fields into Supabase DB schema columns:
 * - category: strictly adheres to database constraint traits_category_check ('strength' | 'growth')
 * - notes: encodes domain ([Domain:mindset]) alongside description and deliberate practice cue ([Practice Cue]: ...)
 */
export function encodeTraitToDb(
  userId: string,
  trait: Omit<Trait, 'id' | 'createdAt' | 'isArchived'>,
  archived = false
) {
  // DB check constraint traits_category_check permits 'strength' | 'growth'
  const dbCategory: 'strength' | 'growth' =
    trait.type === 'growth' ? 'growth' : 'strength';

  const domain = trait.category || 'mindset';
  const desc = (trait.description || '').trim();
  const cue = trait.focusPractice ? trait.focusPractice.trim() : '';

  // Store domain and deliberate practice cue in notes column so all rich frontend data persists
  let compositeNotes = `[Domain:${domain}]\n${desc}`;
  if (cue) {
    compositeNotes += `\n\n[Practice Cue]: ${cue}`;
  }

  return {
    user_id: userId,
    name: trait.name.trim(),
    category: dbCategory,
    notes: compositeNotes,
    archived,
  };
}

/**
 * Decodes a Supabase row from public.traits into the application Trait model:
 * - category column maps to trait.type ('strength' | 'growth')
 * - domain & practice cues are extracted from notes column
 */
export function decodeDbToTrait(row: SupabaseTraitRow): Trait {
  const catRaw = (row.category || 'strength').toLowerCase().trim();
  let type: TraitType = 'strength';
  let category: 'mindset' | 'emotional' | 'habits' | 'interpersonal' = 'mindset';

  // 1. Map category column to trait type ('strength' or 'growth')
  if (catRaw.includes('growth') || catRaw.includes('improve')) {
    type = 'growth';
  } else {
    type = 'strength';
  }

  // 2. Backward compatibility: if legacy category string contained colon
  if (catRaw.includes(':')) {
    const parts = catRaw.split(':');
    const cand = parts[1]?.toLowerCase().trim();
    if (['mindset', 'emotional', 'habits', 'interpersonal'].includes(cand)) {
      category = cand as any;
    }
  }

  // 3. Parse notes for [Domain:...] and [Practice Cue]:...
  let description = row.notes || '';
  let focusPractice: string | undefined = undefined;

  // Extract [Domain:...] tag from notes if present
  const domainMatch = description.match(/^\[Domain:([a-zA-Z]+)\]\n?/);
  if (domainMatch) {
    const cand = domainMatch[1].toLowerCase().trim();
    if (['mindset', 'emotional', 'habits', 'interpersonal'].includes(cand)) {
      category = cand as any;
    }
    description = description.replace(/^\[Domain:[a-zA-Z]+\]\n?/, '').trim();
  }

  // Extract [Practice Cue]:... from notes if present
  if (description.includes('[Practice Cue]:')) {
    const splitNotes = description.split('[Practice Cue]:');
    description = splitNotes[0].trim();
    focusPractice = splitNotes[1].trim();
  }

  return {
    id: String(row.id),
    name: row.name,
    description: description || 'No personal observation provided.',
    type,
    category,
    focusPractice,
    isArchived: Boolean(row.archived),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Fetch all traits for the current authenticated user (enforced by RLS)
 */
export async function getTraitsFromSupabase(): Promise<{ data: Trait[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('traits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getTraits error:', error);
      return { data: [], error: new Error(error.message) };
    }

    const traits = (data as SupabaseTraitRow[]).map(decodeDbToTrait);
    return { data: traits, error: null };
  } catch (err: any) {
    return { data: [], error: new Error(err.message || 'Network error fetching traits.') };
  }
}

/**
 * Create a new trait in Supabase
 */
export async function createTraitInSupabase(
  userId: string,
  trait: Omit<Trait, 'id' | 'createdAt' | 'isArchived'>
): Promise<{ data: Trait | null; error: Error | null }> {
  try {
    const payload = encodeTraitToDb(userId, trait, false);
    const { data, error } = await supabase
      .from('traits')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase createTrait error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: decodeDbToTrait(data as SupabaseTraitRow), error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to create trait in database.') };
  }
}

/**
 * Update an existing trait in Supabase
 */
export async function updateTraitInSupabase(
  id: string,
  updates: Partial<Trait>
): Promise<{ data: Trait | null; error: Error | null }> {
  try {
    const dbPayload: Partial<SupabaseTraitRow> = {};

    if (updates.name !== undefined) dbPayload.name = updates.name.trim();
    if (updates.isArchived !== undefined) dbPayload.archived = updates.isArchived;

    // Database traits_category_check expects 'strength' | 'growth'
    if (updates.type !== undefined) {
      dbPayload.category = updates.type === 'growth' ? 'growth' : 'strength';
    }

    if (
      updates.description !== undefined ||
      updates.category !== undefined ||
      updates.focusPractice !== undefined
    ) {
      let currentTrait: Trait | null = null;
      if (
        updates.category === undefined ||
        updates.description === undefined ||
        updates.focusPractice === undefined
      ) {
        const { data: existingRow } = await supabase
          .from('traits')
          .select('*')
          .eq('id', id)
          .single();
        if (existingRow) {
          currentTrait = decodeDbToTrait(existingRow as SupabaseTraitRow);
        }
      }

      const domain = updates.category || currentTrait?.category || 'mindset';
      const desc =
        updates.description !== undefined
          ? (updates.description || '').trim()
          : (currentTrait?.description || '').trim();
      const practice =
        updates.focusPractice !== undefined
          ? (updates.focusPractice || '').trim()
          : (currentTrait?.focusPractice || '').trim();

      let compositeNotes = `[Domain:${domain}]\n${desc}`;
      if (practice) {
        compositeNotes += `\n\n[Practice Cue]: ${practice}`;
      }
      dbPayload.notes = compositeNotes;
    }

    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('traits')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateTrait error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: decodeDbToTrait(data as SupabaseTraitRow), error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to update trait.') };
  }
}

/**
 * Delete a trait in Supabase
 */
export async function deleteTraitInSupabase(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('traits').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteTrait error:', error);
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err: any) {
    return { error: new Error(err.message || 'Failed to delete trait from database.') };
  }
}
