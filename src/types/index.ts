export type NavigationTab =
  | 'dashboard'
  | 'journal'
  | 'mood'
  | 'habits'
  | 'traits'
  | 'insights'
  | 'settings';

export type MoodEmotion =
  | 'Calm'
  | 'Grateful'
  | 'Energized'
  | 'Focused'
  | 'Content'
  | 'Reflective'
  | 'Anxious'
  | 'Fatigued'
  | 'Overwhelmed'
  | 'Restless';

export interface MoodEntry {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  score: number; // 1 to 10 scale
  emotions: MoodEmotion[];
  notes?: string;
  createdAt: string;
}

export type HabitCategory =
  | 'mindfulness'
  | 'health'
  | 'focus'
  | 'learning'
  | 'connection';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  targetDaysPerWeek: number;
  currentStreak: number;
  longestStreak: number;
  isArchived: boolean;
  createdAt: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  moodScore?: number;
  promptUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export type TraitType = 'strength' | 'growth'; // positive traits vs traits to improve

export interface Trait {
  id: string;
  name: string;
  description: string;
  type: TraitType;
  category: 'mindset' | 'emotional' | 'habits' | 'interpersonal';
  focusPractice?: string;
  isArchived: boolean;
  createdAt: string;
}

export type InsightType =
  | 'positive_trend'
  | 'gentle_nudge'
  | 'correlation'
  | 'milestone';

export interface WeeklyInsight {
  id: string;
  title: string;
  type: InsightType;
  summary: string;
  evidence: string;
  actionableTakeaway?: string;
  weekLabel: string;
  category?: 'habits' | 'mood' | 'journal' | 'traits' | 'correlation';
  metricBadge?: {
    label: string;
    tone: 'sage' | 'lavender' | 'peach' | 'stone';
  };
  confidenceScore?: number;
}

export interface UserPreferences {
  name: string;
  dailyReminderTime: string;
  enableGentlePrompts: boolean;
  privateMode: boolean; // Indicates data is session-isolated
  colorTone: 'pastel-warm' | 'sage-pure' | 'lavender-evening';
}
