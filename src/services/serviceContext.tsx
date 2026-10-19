import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  Habit,
  HabitLog,
  JournalEntry,
  MoodEntry,
  MoodEmotion,
  Trait,
  WeeklyInsight,
  UserPreferences,
} from '../types';
import {
  DEV_SAMPLE_HABITS,
  DEV_SAMPLE_HABIT_LOGS,
  DEV_SAMPLE_JOURNAL_ENTRIES,
  DEV_SAMPLE_MOODS,
  DEV_SAMPLE_TRAITS,
} from './mockData';
import { useAuth } from './authContext';
import {
  getTraitsFromSupabase,
  createTraitInSupabase,
  updateTraitInSupabase,
  deleteTraitInSupabase,
} from './traitsSupabaseService';
import {
  getHabitsFromSupabase,
  createHabitInSupabase,
  updateHabitInSupabase,
  deleteHabitInSupabase,
  getHabitLogsFromSupabase,
  toggleHabitCompletionInSupabase,
} from './habitsSupabaseService';
import {
  getMoodEntriesFromSupabase,
  saveMoodEntryToSupabase,
} from './moodSupabaseService';
import {
  getJournalEntriesFromSupabase,
  createJournalEntryInSupabase,
  updateJournalEntryInSupabase,
  deleteJournalEntryInSupabase,
} from './journalSupabaseService';
import {
  getProfileFromSupabase,
  updateProfileDisplayNameInSupabase,
} from './profileSupabaseService';
import { supabase } from './supabaseClient';
import { getLocalDateString } from '../utils/dateUtils';
import {
  generateSmartInsights,
  type SmartInsightsResult,
  type DataSufficiencyCheck,
} from '../utils/insightsEngine';

export interface BetterMeContextType {
  // Mode flag & backend indicator
  isDevMode: boolean;
  backendProvider: 'mock_service' | 'supabase';
  refreshAll: () => Promise<void>;

  // Mood operations
  moods: MoodEntry[];
  todayMood: MoodEntry | undefined;
  moodsLoading: boolean;
  moodsError: string | null;
  refreshMoods: () => Promise<void>;
  logMood: (score: number, emotions: MoodEmotion[], notes?: string, date?: string) => Promise<MoodEntry>;

  // Real Supabase Habit operations
  habits: Habit[];
  habitLogs: HabitLog[];
  habitsLoading: boolean;
  habitsError: string | null;
  refreshHabits: () => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<boolean>;
  createHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'isArchived'>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Journal operations
  journalEntries: JournalEntry[];
  journalLoading: boolean;
  journalError: string | null;
  refreshJournal: () => Promise<void>;
  createJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<JournalEntry>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<JournalEntry>;
  deleteJournalEntry: (id: string) => Promise<void>;

  // Real Supabase Trait operations
  traits: Trait[];
  traitsLoading: boolean;
  traitsError: string | null;
  refreshTraits: () => Promise<void>;
  createTrait: (trait: Omit<Trait, 'id' | 'createdAt' | 'isArchived'>) => Promise<Trait>;
  updateTrait: (id: string, updates: Partial<Trait>) => Promise<Trait>;
  archiveTrait: (id: string) => Promise<void>;
  deleteTrait: (id: string) => Promise<void>;

  // Insights & Smart Pattern Recognition
  insights: WeeklyInsight[];
  insightsSufficiency: DataSufficiencyCheck;
  insightsMetrics: SmartInsightsResult['metrics'];

  // Settings & Preferences
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetAllDevData: () => void;
  exportDataJSON: () => string;
}

const BetterMeContext = createContext<BetterMeContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Dynamic backend provider flag based on whether Supabase user is active
  const backendProvider: 'mock_service' | 'supabase' = user ? 'supabase' : 'mock_service';
  const isDevMode = !user;

  // Today's date string YYYY-MM-DD (local calendar date accurate)
  const todayStr = getLocalDateString();

  // Moods state
  const [moods, setMoods] = useState<MoodEntry[]>(DEV_SAMPLE_MOODS);
  const [moodsLoading, setMoodsLoading] = useState<boolean>(false);
  const [moodsError, setMoodsError] = useState<string | null>(null);
  
  // Real Supabase-connected Habits and Habit Logs state
  const [habits, setHabits] = useState<Habit[]>(DEV_SAMPLE_HABITS);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(DEV_SAMPLE_HABIT_LOGS);
  const [habitsLoading, setHabitsLoading] = useState<boolean>(false);
  const [habitsError, setHabitsError] = useState<string | null>(null);

  // Journal entries state
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(DEV_SAMPLE_JOURNAL_ENTRIES);
  const [journalLoading, setJournalLoading] = useState<boolean>(false);
  const [journalError, setJournalError] = useState<string | null>(null);
  
  // Real Supabase-connected Traits state
  const [traits, setTraits] = useState<Trait[]>(DEV_SAMPLE_TRAITS);
  const [traitsLoading, setTraitsLoading] = useState<boolean>(false);
  const [traitsError, setTraitsError] = useState<string | null>(null);

  // Dynamic Smart Insights Engine deriving validated observations from real Supabase records
  const smartInsightsResult = useMemo(() => {
    return generateSmartInsights({
      habits,
      habitLogs,
      moods,
      journalEntries,
      traits,
    });
  }, [habits, habitLogs, moods, journalEntries, traits]);

  const insights = smartInsightsResult.insights;
  const insightsSufficiency = smartInsightsResult.sufficiency;
  const insightsMetrics = smartInsightsResult.metrics;

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    let localPref: Partial<UserPreferences> = {};
    try {
      const key = user?.id ? `betterme_pref_${user.id}` : 'betterme_pref_default';
      const stored = localStorage.getItem(key);
      if (stored) localPref = JSON.parse(stored);
    } catch {}

    const meta = user?.user_metadata || {};
    return {
      name: meta.display_name || localPref.name || user?.email?.split('@')[0] || 'Friend',
      dailyReminderTime: meta.daily_reminder_time || localPref.dailyReminderTime || '20:30',
      enableGentlePrompts: meta.enable_gentle_prompts ?? localPref.enableGentlePrompts ?? true,
      privateMode: true,
      colorTone: 'pastel-warm',
    };
  });

  // Keep preferences in sync with Supabase profiles table, user metadata, and local cache
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch display_name from public.profiles
      const { data, error } = await getProfileFromSupabase(user.id);

      // 2. Read cached preferences from localStorage
      let localPref: Partial<UserPreferences> = {};
      try {
        const stored = localStorage.getItem(`betterme_pref_${user.id}`);
        if (stored) localPref = JSON.parse(stored);
      } catch {}

      // 3. Read metadata from user
      const meta = user.user_metadata || {};

      const savedName =
        !error && data?.display_name
          ? data.display_name
          : meta.display_name || localPref.name || user.email?.split('@')[0] || 'Friend';

      const savedReminder =
        meta.daily_reminder_time || localPref.dailyReminderTime || '20:30';

      const savedPrompts =
        meta.enable_gentle_prompts ?? localPref.enableGentlePrompts ?? true;

      setPreferences((prev) => ({
        ...prev,
        name: savedName,
        dailyReminderTime: savedReminder,
        enableGentlePrompts: savedPrompts,
      }));
    } catch (err) {
      console.error('Failed to load profile from Supabase:', err);
    }
  }, [user]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Load real habits & completion logs from Supabase when user logs in
  const refreshHabits = useCallback(async () => {
    if (!user) {
      setHabits(DEV_SAMPLE_HABITS);
      setHabitLogs(DEV_SAMPLE_HABIT_LOGS);
      setHabitsLoading(false);
      setHabitsError(null);
      return;
    }

    setHabitsLoading(true);
    setHabitsError(null);
    try {
      // 1. Fetch completion logs
      const logsRes = await getHabitLogsFromSupabase();
      let logs = habitLogs;
      if (!logsRes.error) {
        logs = logsRes.data;
        setHabitLogs(logsRes.data);
      }

      // 2. Fetch habits with streak computation
      const habitsRes = await getHabitsFromSupabase(logs);
      if (habitsRes.error) {
        setHabitsError(habitsRes.error.message);
      } else {
        setHabits(habitsRes.data);
      }
    } catch (err: any) {
      setHabitsError(err.message || 'Error loading habits from Supabase.');
    } finally {
      setHabitsLoading(false);
    }
  }, [user]);

  // Load real traits from Supabase when user logs in
  const refreshTraits = useCallback(async () => {
    if (!user) {
      setTraits(DEV_SAMPLE_TRAITS);
      setTraitsLoading(false);
      setTraitsError(null);
      return;
    }

    setTraitsLoading(true);
    setTraitsError(null);
    try {
      const { data, error } = await getTraitsFromSupabase();
      if (error) {
        setTraitsError(error.message);
      } else {
        setTraits(data);
      }
    } catch (err: any) {
      setTraitsError(err.message || 'Error loading traits from Supabase.');
    } finally {
      setTraitsLoading(false);
    }
  }, [user]);

  // Load real mood entries from Supabase
  const refreshMoods = useCallback(async () => {
    if (!user) {
      setMoods(DEV_SAMPLE_MOODS);
      setMoodsLoading(false);
      setMoodsError(null);
      return;
    }

    setMoodsLoading(true);
    setMoodsError(null);
    try {
      const { data, error } = await getMoodEntriesFromSupabase();
      if (error) {
        setMoodsError(error.message);
      } else {
        setMoods(data);
      }
    } catch (err: any) {
      setMoodsError(err.message || 'Error loading mood entries from Supabase.');
    } finally {
      setMoodsLoading(false);
    }
  }, [user]);

  // Load real journal entries from Supabase
  const refreshJournal = useCallback(async () => {
    if (!user) {
      setJournalEntries(DEV_SAMPLE_JOURNAL_ENTRIES);
      setJournalLoading(false);
      setJournalError(null);
      return;
    }

    setJournalLoading(true);
    setJournalError(null);
    try {
      const { data, error } = await getJournalEntriesFromSupabase();
      if (error) {
        setJournalError(error.message);
      } else {
        setJournalEntries(data);
      }
    } catch (err: any) {
      setJournalError(err.message || 'Error loading journal entries from Supabase.');
    } finally {
      setJournalLoading(false);
    }
  }, [user]);

  // Refresh all application data from Supabase concurrently
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshProfile(), refreshHabits(), refreshTraits(), refreshMoods(), refreshJournal()]);
  }, [refreshProfile, refreshHabits, refreshTraits, refreshMoods, refreshJournal]);

  useEffect(() => {
    refreshHabits();
    refreshTraits();
    refreshMoods();
    refreshJournal();
  }, [refreshHabits, refreshTraits, refreshMoods, refreshJournal]);

  // Today's mood record if logged
  const todayMood = useMemo(() => {
    return moods.find((m) => m.date === todayStr);
  }, [moods, todayStr]);

  // Mood: Log or update rating (persisted to Supabase for authenticated user)
  const logMood = useCallback(
    async (score: number, emotions: MoodEmotion[], notes?: string, date = todayStr): Promise<MoodEntry> => {
      setMoodsError(null);
      if (user) {
        setMoodsLoading(true);
        const { data, error } = await saveMoodEntryToSupabase(user.id, {
          score,
          emotions,
          notes,
          date,
        });
        setMoodsLoading(false);

        if (error || !data) {
          const msg = error?.message || 'Failed to save mood entry to Supabase.';
          setMoodsError(msg);
          throw new Error(msg);
        }

        setMoods((prev) => {
          const existingIdx = prev.findIndex((m) => m.date === date);
          if (existingIdx >= 0) {
            return prev.map((item, idx) => (idx === existingIdx ? data : item));
          }
          return [data, ...prev].sort((a, b) => b.date.localeCompare(a.date));
        });
        return data;
      } else {
        const existingIndex = moods.findIndex((m) => m.date === date);
        const newRecord: MoodEntry = {
          id: existingIndex >= 0 ? moods[existingIndex].id : `mood-${Date.now()}`,
          date,
          score,
          emotions,
          notes,
          createdAt: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          setMoods((prev) => prev.map((item, idx) => (idx === existingIndex ? newRecord : item)));
        } else {
          setMoods((prev) => [newRecord, ...prev]);
        }
        return newRecord;
      }
    },
    [user, moods, todayStr]
  );

  // Habits: Real Supabase Toggle completion status for date
  const toggleHabitCompletion = useCallback(
    async (habitId: string, date: string): Promise<boolean> => {
      setHabitsError(null);
      if (user) {
        const { completed, error } = await toggleHabitCompletionInSupabase(
          user.id,
          habitId,
          date,
          habitLogs
        );

        if (error) {
          setHabitsError(error.message);
          throw new Error(error.message);
        }

        // Update local logs state
        const updatedLogs: HabitLog[] = [
          ...habitLogs.filter((l) => !(l.habitId === habitId && l.date === date)),
          { habitId, date, completed },
        ];
        setHabitLogs(updatedLogs);

        // Update streaks dynamically on local habit
        setHabits((prev) =>
          prev.map((h) => {
            if (h.id !== habitId) return h;
            const newStreak = completed ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1);
            return {
              ...h,
              currentStreak: newStreak,
              longestStreak: Math.max(h.longestStreak, newStreak),
            };
          })
        );

        return completed;
      } else {
        // Fallback for offline mock
        const existing = habitLogs.find((l) => l.habitId === habitId && l.date === date);
        const newStatus = existing ? !existing.completed : true;

        setHabitLogs((prev) => {
          const filtered = prev.filter((l) => !(l.habitId === habitId && l.date === date));
          return [...filtered, { habitId, date, completed: newStatus }];
        });

        setHabits((prev) =>
          prev.map((h) => {
            if (h.id !== habitId) return h;
            const newStreak = newStatus ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1);
            return {
              ...h,
              currentStreak: newStreak,
              longestStreak: Math.max(h.longestStreak, newStreak),
            };
          })
        );

        return newStatus;
      }
    },
    [user, habitLogs]
  );

  // Habits: Real Supabase Create
  const createHabit = useCallback(
    async (
      habitData: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'isArchived'>
    ): Promise<Habit> => {
      setHabitsError(null);
      if (user) {
        const { data, error } = await createHabitInSupabase(user.id, habitData);
        if (error || !data) {
          const msg = error?.message || 'Failed to create habit in Supabase database.';
          setHabitsError(msg);
          throw new Error(msg);
        }
        setHabits((prev) => [data, ...prev]);
        return data;
      } else {
        const newHabit: Habit = {
          ...habitData,
          id: `habit-${Date.now()}`,
          currentStreak: 0,
          longestStreak: 0,
          isArchived: false,
          createdAt: new Date().toISOString(),
        };
        setHabits((prev) => [newHabit, ...prev]);
        return newHabit;
      }
    },
    [user]
  );

  // Habits: Real Supabase Update
  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>): Promise<Habit> => {
      setHabitsError(null);
      if (user) {
        const { data, error } = await updateHabitInSupabase(id, updates, habitLogs);
        if (error || !data) {
          const msg = error?.message || 'Failed to update habit in database.';
          setHabitsError(msg);
          throw new Error(msg);
        }
        setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
        return data;
      } else {
        const exists = habits.find((h) => h.id === id);
        if (!exists) throw new Error('Habit not found');
        const updated = { ...exists, ...updates };
        setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
        return updated;
      }
    },
    [user, habitLogs, habits]
  );

  // Habits: Real Supabase Archive
  const archiveHabit = useCallback(
    async (id: string): Promise<void> => {
      await updateHabit(id, { isArchived: true });
    },
    [updateHabit]
  );

  // Habits: Real Supabase Delete
  const deleteHabit = useCallback(
    async (id: string): Promise<void> => {
      setHabitsError(null);
      if (user) {
        const { error } = await deleteHabitInSupabase(id);
        if (error) {
          setHabitsError(error.message);
          throw new Error(error.message);
        }
        setHabits((prev) => prev.filter((h) => h.id !== id));
        setHabitLogs((prev) => prev.filter((l) => l.habitId !== id));
      } else {
        setHabits((prev) => prev.filter((h) => h.id !== id));
        setHabitLogs((prev) => prev.filter((l) => l.habitId !== id));
      }
    },
    [user]
  );

  // Journal: Create (Persisted to Supabase for authenticated users)
  const createJournalEntry = useCallback(
    async (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> => {
      setJournalError(null);
      if (user) {
        setJournalLoading(true);
        const { data, error } = await createJournalEntryInSupabase(user.id, entryData);
        setJournalLoading(false);
        if (error || !data) {
          const msg = error?.message || 'Failed to save journal entry to database.';
          setJournalError(msg);
          throw new Error(msg);
        }
        setJournalEntries((prev) => [data, ...prev]);
        return data;
      } else {
        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          ...entryData,
          id: `journal-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        setJournalEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      }
    },
    [user]
  );

  // Journal: Update
  const updateJournalEntry = useCallback(
    async (id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> => {
      setJournalError(null);
      if (user) {
        setJournalLoading(true);
        const { data, error } = await updateJournalEntryInSupabase(id, updates);
        setJournalLoading(false);
        if (error || !data) {
          const msg = error?.message || 'Failed to update journal entry in database.';
          setJournalError(msg);
          throw new Error(msg);
        }
        setJournalEntries((prev) => prev.map((j) => (j.id === id ? data : j)));
        return data;
      } else {
        const item = journalEntries.find((j) => j.id === id);
        if (!item) throw new Error('Journal entry not found');
        const updated: JournalEntry = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        setJournalEntries((prev) => prev.map((j) => (j.id === id ? updated : j)));
        return updated;
      }
    },
    [user, journalEntries]
  );

  // Journal: Delete
  const deleteJournalEntry = useCallback(
    async (id: string): Promise<void> => {
      setJournalError(null);
      if (user) {
        setJournalLoading(true);
        const { error } = await deleteJournalEntryInSupabase(id);
        setJournalLoading(false);
        if (error) {
          setJournalError(error.message);
          throw new Error(error.message);
        }
        setJournalEntries((prev) => prev.filter((j) => j.id !== id));
      } else {
        setJournalEntries((prev) => prev.filter((j) => j.id !== id));
      }
    },
    [user]
  );

  // Traits: Real Supabase Create
  const createTrait = useCallback(
    async (traitData: Omit<Trait, 'id' | 'createdAt' | 'isArchived'>): Promise<Trait> => {
      setTraitsError(null);
      if (user) {
        const { data, error } = await createTraitInSupabase(user.id, traitData);
        if (error || !data) {
          const msg = error?.message || 'Failed to create trait in Supabase.';
          setTraitsError(msg);
          throw new Error(msg);
        }
        setTraits((prev) => [data, ...prev]);
        return data;
      } else {
        const newTrait: Trait = {
          ...traitData,
          id: `trait-${Date.now()}`,
          isArchived: false,
          createdAt: new Date().toISOString(),
        };
        setTraits((prev) => [newTrait, ...prev]);
        return newTrait;
      }
    },
    [user]
  );

  // Traits: Real Supabase Update
  const updateTrait = useCallback(
    async (id: string, updates: Partial<Trait>): Promise<Trait> => {
      setTraitsError(null);
      if (user) {
        const { data, error } = await updateTraitInSupabase(id, updates);
        if (error || !data) {
          const msg = error?.message || 'Failed to update trait in Supabase.';
          setTraitsError(msg);
          throw new Error(msg);
        }
        setTraits((prev) => prev.map((t) => (t.id === id ? data : t)));
        return data;
      } else {
        const item = traits.find((t) => t.id === id);
        if (!item) throw new Error('Trait not found');
        const updated = { ...item, ...updates };
        setTraits((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      }
    },
    [user, traits]
  );

  // Traits: Real Supabase Archive
  const archiveTrait = useCallback(
    async (id: string): Promise<void> => {
      await updateTrait(id, { isArchived: true });
    },
    [updateTrait]
  );

  // Traits: Real Supabase Delete
  const deleteTrait = useCallback(
    async (id: string): Promise<void> => {
      setTraitsError(null);
      if (user) {
        const { error } = await deleteTraitInSupabase(id);
        if (error) {
          setTraitsError(error.message);
          throw new Error(error.message);
        }
        setTraits((prev) => prev.filter((t) => t.id !== id));
      } else {
        setTraits((prev) => prev.filter((t) => t.id !== id));
      }
    },
    [user]
  );

  // Preferences: Real Supabase profile persistence for display_name, and user_metadata / localStorage for time & prompts
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<void> => {
      let confirmedName = updates.name;

      if (user) {
        // 1. If display_name is being updated, save to public.profiles table
        if (updates.name !== undefined) {
          const { data, error } = await updateProfileDisplayNameInSupabase(user.id, updates.name);
          if (error) {
            throw error;
          }
          confirmedName = data?.display_name ?? updates.name;
        }

        // 2. Persist to Supabase Auth metadata
        const metaUpdates: Record<string, any> = {};
        if (confirmedName !== undefined) metaUpdates.display_name = confirmedName;
        if (updates.dailyReminderTime !== undefined) metaUpdates.daily_reminder_time = updates.dailyReminderTime;
        if (updates.enableGentlePrompts !== undefined) metaUpdates.enable_gentle_prompts = updates.enableGentlePrompts;

        try {
          await supabase.auth.updateUser({ data: metaUpdates });
        } catch (authErr) {
          console.warn('Could not update user metadata:', authErr);
        }

        // 3. Persist to localStorage cache
        try {
          const storageKey = `betterme_pref_${user.id}`;
          const current = localStorage.getItem(storageKey);
          const parsed = current ? JSON.parse(current) : {};
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              ...parsed,
              ...updates,
              ...(confirmedName !== undefined ? { name: confirmedName } : {}),
            })
          );
        } catch (storageErr) {
          console.warn('Could not cache preferences in localStorage:', storageErr);
        }

        setPreferences((prev) => ({
          ...prev,
          ...updates,
          name: confirmedName ?? prev.name,
        }));
      } else {
        // Dev mode without auth
        try {
          const current = localStorage.getItem('betterme_pref_default');
          const parsed = current ? JSON.parse(current) : {};
          localStorage.setItem('betterme_pref_default', JSON.stringify({ ...parsed, ...updates }));
        } catch {}
        setPreferences((prev) => ({ ...prev, ...updates }));
      }
    },
    [user]
  );

  // Reset to initial development seeds
  const resetAllDevData = useCallback(() => {
    setMoods(DEV_SAMPLE_MOODS);
    setJournalEntries(DEV_SAMPLE_JOURNAL_ENTRIES);
    if (!user) {
      setHabits(DEV_SAMPLE_HABITS);
      setHabitLogs(DEV_SAMPLE_HABIT_LOGS);
      setTraits(DEV_SAMPLE_TRAITS);
    }
  }, [user]);

  // Export all data as sanitized JSON for user backup
  const exportDataJSON = useCallback(() => {
    const payload = {
      app: 'BetterMe',
      exportedAt: new Date().toISOString(),
      user: user?.email || 'Anonymous',
      disclaimer: 'Personal development export. Private journal entries included.',
      moods,
      habits,
      habitLogs,
      journalEntries,
      traits,
      preferences,
    };
    return JSON.stringify(payload, null, 2);
  }, [user, moods, habits, habitLogs, journalEntries, traits, preferences]);

  const value = useMemo(
    () => ({
      isDevMode,
      backendProvider,
      refreshAll,
      moods,
      todayMood,
      moodsLoading,
      moodsError,
      refreshMoods,
      logMood,
      habits,
      habitLogs,
      habitsLoading,
      habitsError,
      refreshHabits,
      toggleHabitCompletion,
      createHabit,
      updateHabit,
      archiveHabit,
      deleteHabit,
      journalEntries,
      journalLoading,
      journalError,
      refreshJournal,
      createJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      traits,
      traitsLoading,
      traitsError,
      refreshTraits,
      createTrait,
      updateTrait,
      archiveTrait,
      deleteTrait,
      insights,
      insightsSufficiency,
      insightsMetrics,
      preferences,
      updatePreferences,
      resetAllDevData,
      exportDataJSON,
    }),
    [
      isDevMode,
      backendProvider,
      refreshAll,
      moods,
      todayMood,
      moodsLoading,
      moodsError,
      refreshMoods,
      logMood,
      habits,
      habitLogs,
      habitsLoading,
      habitsError,
      refreshHabits,
      toggleHabitCompletion,
      createHabit,
      updateHabit,
      archiveHabit,
      deleteHabit,
      journalEntries,
      journalLoading,
      journalError,
      refreshJournal,
      createJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
      traits,
      traitsLoading,
      traitsError,
      refreshTraits,
      createTrait,
      updateTrait,
      archiveTrait,
      deleteTrait,
      insights,
      insightsSufficiency,
      insightsMetrics,
      preferences,
      updatePreferences,
      resetAllDevData,
      exportDataJSON,
    ]
  );

  return <BetterMeContext.Provider value={value}>{children}</BetterMeContext.Provider>;
};

export const useBetterMe = (): BetterMeContextType => {
  const context = useContext(BetterMeContext);
  if (!context) {
    throw new Error('useBetterMe must be used within a ServiceProvider');
  }
  return context;
};
