import { supabase } from './supabaseClient';
import type { Habit, HabitCategory, HabitLog } from '../types';

export interface SupabaseHabitRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  archived: boolean | null;
  created_at: string;
  updated_at: string | null;
}

export interface SupabaseHabitLogRow {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Encodes category, frequency, target days, and user description into habits.description column
 */
export function encodeHabitToDb(
  userId: string,
  habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'isArchived'>,
  archived = false
) {
  const category = habit.category || 'health';
  const frequency = habit.frequency || 'daily';
  const targetDays = habit.targetDaysPerWeek || 7;
  const userText = (habit.description || '').trim();

  const formattedDesc = userText
    ? `[Category:${category}|Freq:${frequency}|Target:${targetDays}]\n${userText}`
    : `[Category:${category}|Freq:${frequency}|Target:${targetDays}]`;

  return {
    user_id: userId,
    name: habit.title.trim(),
    description: formattedDesc,
    archived,
  };
}

/**
 * Decodes a Supabase row from public.habits into the application Habit model
 */
export function decodeDbToHabit(row: SupabaseHabitRow, logs: HabitLog[] = []): Habit {
  const rawDesc = row.description || '';
  let category: HabitCategory = 'health';
  let frequency: 'daily' | 'weekly' = 'daily';
  let targetDaysPerWeek = 7;
  let cleanDescription = rawDesc;

  // Parse [Category:...|Freq:...|Target:...] prefix if present
  const metaMatch = rawDesc.match(/^\[Category:([^|]+)\|Freq:([^|]+)\|Target:(\d+)\]\n?/);
  if (metaMatch) {
    const parsedCat = metaMatch[1].toLowerCase().trim() as HabitCategory;
    if (['health', 'mindfulness', 'focus', 'learning', 'connection'].includes(parsedCat)) {
      category = parsedCat;
    }
    const parsedFreq = metaMatch[2].toLowerCase().trim();
    if (parsedFreq === 'daily' || parsedFreq === 'weekly') {
      frequency = parsedFreq;
    }
    const parsedTarget = parseInt(metaMatch[3], 10);
    if (!isNaN(parsedTarget)) {
      targetDaysPerWeek = parsedTarget;
    }
    cleanDescription = rawDesc.slice(metaMatch[0].length).trim();
  }

  // Calculate streaks dynamically from logs
  const habitLogs = logs
    .filter((l) => l.habitId === row.id && l.completed)
    .map((l) => l.date);

  let currentStreak = 0;
  let longestStreak = 0;

  if (habitLogs.length > 0) {
    const dateSet = new Set(habitLogs);
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    const formatLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayStr = formatLocal(new Date(todayYear, todayMonth, todayDate));
    const yesterdayStr = formatLocal(new Date(todayYear, todayMonth, todayDate - 1));

    // Current streak: active if completed today, or completed yesterday (today still open)
    if (dateSet.has(todayStr)) {
      currentStreak = 1;
      let check = new Date(todayYear, todayMonth, todayDate - 1);
      while (dateSet.has(formatLocal(check))) {
        currentStreak++;
        check.setDate(check.getDate() - 1);
      }
    } else if (dateSet.has(yesterdayStr)) {
      currentStreak = 1;
      let check = new Date(todayYear, todayMonth, todayDate - 2);
      while (dateSet.has(formatLocal(check))) {
        currentStreak++;
        check.setDate(check.getDate() - 1);
      }
    } else {
      currentStreak = 0;
    }

    // Longest streak: maximum consecutive calendar days completed across all history
    const sortedUniqueDates = Array.from(dateSet).sort();
    let maxStreak = 0;
    let tempStreak = 0;
    let prevTime: number | null = null;

    for (const dStr of sortedUniqueDates) {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const currTime = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        ).getTime();

        if (prevTime === null) {
          tempStreak = 1;
        } else {
          const diffDays = Math.round((currTime - prevTime) / 86400000);
          if (diffDays === 1) {
            tempStreak += 1;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        prevTime = currTime;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      }
    }
    longestStreak = Math.max(maxStreak, currentStreak);
  }

  return {
    id: String(row.id),
    title: row.name,
    description: cleanDescription || undefined,
    category,
    frequency,
    targetDaysPerWeek,
    currentStreak,
    longestStreak,
    isArchived: Boolean(row.archived),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Fetch all habits from Supabase for the authenticated user
 */
export async function getHabitsFromSupabase(
  logs: HabitLog[] = []
): Promise<{ data: Habit[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getHabits error:', error);
      return { data: [], error: new Error(error.message) };
    }

    const habits = (data as SupabaseHabitRow[]).map((row) => decodeDbToHabit(row, logs));
    return { data: habits, error: null };
  } catch (err: any) {
    return { data: [], error: new Error(err.message || 'Network error fetching habits.') };
  }
}

/**
 * Create a new habit in Supabase
 */
export async function createHabitInSupabase(
  userId: string,
  habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'isArchived'>
): Promise<{ data: Habit | null; error: Error | null }> {
  try {
    const payload = encodeHabitToDb(userId, habit, false);
    const { data, error } = await supabase
      .from('habits')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase createHabit error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: decodeDbToHabit(data as SupabaseHabitRow, []), error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to create habit in database.') };
  }
}

/**
 * Update an existing habit in Supabase
 */
export async function updateHabitInSupabase(
  id: string,
  updates: Partial<Habit>,
  logs: HabitLog[] = []
): Promise<{ data: Habit | null; error: Error | null }> {
  try {
    const dbPayload: Partial<SupabaseHabitRow> = {};

    if (updates.title !== undefined) {
      dbPayload.name = updates.title.trim();
    }
    if (updates.isArchived !== undefined) {
      dbPayload.archived = updates.isArchived;
    }

    if (
      updates.category !== undefined ||
      updates.frequency !== undefined ||
      updates.targetDaysPerWeek !== undefined ||
      updates.description !== undefined
    ) {
      const category = updates.category || 'health';
      const frequency = updates.frequency || 'daily';
      const targetDays = updates.targetDaysPerWeek || 7;
      const userText = updates.description !== undefined ? updates.description.trim() : '';

      dbPayload.description = userText
        ? `[Category:${category}|Freq:${frequency}|Target:${targetDays}]\n${userText}`
        : `[Category:${category}|Freq:${frequency}|Target:${targetDays}]`;
    }

    dbPayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('habits')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateHabit error:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: decodeDbToHabit(data as SupabaseHabitRow, logs), error: null };
  } catch (err: any) {
    return { data: null, error: new Error(err.message || 'Failed to update habit in database.') };
  }
}

/**
 * Delete a habit and its logs in Supabase
 */
export async function deleteHabitInSupabase(id: string): Promise<{ error: Error | null }> {
  try {
    // 1. Delete associated logs
    const { error: logsError } = await supabase.from('habit_logs').delete().eq('habit_id', id);
    if (logsError) {
      console.error('Supabase delete habit_logs error:', logsError);
      return { error: new Error(`Failed to delete associated habit logs: ${logsError.message}`) };
    }

    // 2. Delete habit
    const { error: habitError } = await supabase.from('habits').delete().eq('id', id);
    if (habitError) {
      console.error('Supabase deleteHabit error:', habitError);
      return { error: new Error(habitError.message) };
    }
    return { error: null };
  } catch (err: any) {
    return { error: new Error(err.message || 'Failed to delete habit.') };
  }
}

/**
 * Fetch all habit completion logs from Supabase
 */
export async function getHabitLogsFromSupabase(): Promise<{ data: HabitLog[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Supabase getHabitLogs error:', error);
      return { data: [], error: new Error(error.message) };
    }

    const logs: HabitLog[] = (data as SupabaseHabitLogRow[]).map((row) => ({
      habitId: String(row.habit_id),
      date: row.log_date,
      completed: Boolean(row.completed),
    }));

    return { data: logs, error: null };
  } catch (err: any) {
    return { data: [], error: new Error(err.message || 'Error fetching habit logs.') };
  }
}

/**
 * Toggle habit completion status in habit_logs table
 */
export async function toggleHabitCompletionInSupabase(
  userId: string,
  habitId: string,
  date: string,
  currentLogs: HabitLog[]
): Promise<{ completed: boolean; error: Error | null }> {
  try {
    const existing = currentLogs.find((l) => l.habitId === habitId && l.date === date);
    const nextCompleted = existing ? !existing.completed : true;

    // Check if row already exists in database
    const { data: existingRows, error: fetchErr } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('log_date', date)
      .limit(1);

    if (fetchErr) {
      return { completed: false, error: new Error(fetchErr.message) };
    }

    if (existingRows && existingRows.length > 0) {
      const rowId = existingRows[0].id;
      const { error: updateErr } = await supabase
        .from('habit_logs')
        .update({ completed: nextCompleted, updated_at: new Date().toISOString() })
        .eq('id', rowId);

      if (updateErr) {
        return { completed: false, error: new Error(updateErr.message) };
      }
    } else {
      const { error: insertErr } = await supabase.from('habit_logs').insert([
        {
          user_id: userId,
          habit_id: habitId,
          log_date: date,
          completed: nextCompleted,
        },
      ]);

      if (insertErr) {
        return { completed: false, error: new Error(insertErr.message) };
      }
    }

    return { completed: nextCompleted, error: null };
  } catch (err: any) {
    return { completed: false, error: new Error(err.message || 'Error updating habit log.') };
  }
}
