import { supabase } from './supabaseClient';

export interface SupabaseProfileRow {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Fetch the profile record for the specified user ID from Supabase
 */
export async function getProfileFromSupabase(
  userId: string
): Promise<{ data: SupabaseProfileRow | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getProfile error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as SupabaseProfileRow | null, error: null };
  } catch (err: any) {
    console.error('Unexpected error fetching profile from Supabase:', err);
    return { data: null, error: new Error(err.message || 'Failed to fetch user profile.') };
  }
}

/**
 * Update or insert the preferred display name in the Supabase profiles table for the authenticated user
 */
export async function updateProfileDisplayNameInSupabase(
  userId: string,
  displayName: string
): Promise<{ data: SupabaseProfileRow | null; error: Error | null }> {
  try {
    const trimmed = displayName.trim();
    const now = new Date().toISOString();

    // 1. Check whether a profile row already exists for this user ID
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking profile existence in Supabase:', checkError);
      return { data: null, error: new Error(checkError.message) };
    }

    if (existing) {
      // 2a. Update existing row
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: trimmed,
          updated_at: now,
        })
        .eq('id', userId)
        .select('id, display_name, created_at, updated_at')
        .single();

      if (error) {
        console.error('Supabase update profile error:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Also keep Supabase Auth user metadata synchronized
      try {
        await supabase.auth.updateUser({
          data: { display_name: trimmed },
        });
      } catch (authErr) {
        console.warn('Could not synchronize display_name with auth metadata:', authErr);
      }

      return { data: data as SupabaseProfileRow, error: null };
    } else {
      // 2b. Insert new profile row
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: trimmed,
          created_at: now,
          updated_at: now,
        })
        .select('id, display_name, created_at, updated_at')
        .single();

      if (error) {
        // If conflict occurs from concurrent creation, fall back to update
        if (error.code === '23505') {
          const retry = await supabase
            .from('profiles')
            .update({
              display_name: trimmed,
              updated_at: now,
            })
            .eq('id', userId)
            .select('id, display_name, created_at, updated_at')
            .single();

          if (retry.error) {
            return { data: null, error: new Error(retry.error.message) };
          }

          await supabase.auth.updateUser({ data: { display_name: trimmed } }).catch(() => {});
          return { data: retry.data as SupabaseProfileRow, error: null };
        }

        console.error('Supabase insert profile error:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Also keep Supabase Auth user metadata synchronized
      try {
        await supabase.auth.updateUser({
          data: { display_name: trimmed },
        });
      } catch (authErr) {
        console.warn('Could not synchronize display_name with auth metadata:', authErr);
      }

      return { data: data as SupabaseProfileRow, error: null };
    }
  } catch (err: any) {
    console.error('Unexpected error updating profile in Supabase:', err);
    return { data: null, error: new Error(err.message || 'Failed to save profile changes.') };
  }
}
