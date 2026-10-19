import type {
  Habit,
  HabitLog,
  JournalEntry,
  MoodEntry,
  Trait,
  WeeklyInsight,
} from '../types';

/**
 * DEV NOTICE:
 * The following data items are strictly for local interface testing and visual layout verification.
 * They represent realistic patterns for wellness tracking and will be replaced by the Supabase client
 * upon backend integration in Phase 2.
 */

export const DEV_LABEL = 'DEVELOPMENT SAMPLE DATA';

export const DEV_SAMPLE_MOODS: MoodEntry[] = [
  {
    id: 'dev-mood-1',
    date: '2026-10-12',
    score: 7,
    emotions: ['Reflective', 'Content'],
    notes: 'Took a steady morning walk before opening email.',
    createdAt: '2026-10-12T08:30:00Z',
  },
  {
    id: 'dev-mood-2',
    date: '2026-10-13',
    score: 8,
    emotions: ['Focused', 'Calm'],
    notes: 'Deep work sprint went well, minimal task switching.',
    createdAt: '2026-10-13T09:15:00Z',
  },
  {
    id: 'dev-mood-3',
    date: '2026-10-14',
    score: 6,
    emotions: ['Fatigued'],
    notes: 'Slept late, needed extra tea to refocus after lunch.',
    createdAt: '2026-10-14T14:00:00Z',
  },
  {
    id: 'dev-mood-4',
    date: '2026-10-15',
    score: 8,
    emotions: ['Energized', 'Grateful'],
    notes: 'Finished reading chapter on attentional control.',
    createdAt: '2026-10-15T19:20:00Z',
  },
  {
    id: 'dev-mood-5',
    date: '2026-10-16',
    score: 9,
    emotions: ['Calm', 'Content'],
    notes: 'No meetings afternoon. Cooking dinner with music.',
    createdAt: '2026-10-16T20:10:00Z',
  },
  {
    id: 'dev-mood-6',
    date: '2026-10-17',
    score: 7,
    emotions: ['Reflective'],
    notes: 'Light weekend planning and digital declutter.',
    createdAt: '2026-10-17T11:45:00Z',
  },
  {
    id: 'dev-mood-7',
    date: '2026-10-18',
    score: 8,
    emotions: ['Calm', 'Focused'],
    notes: 'Feeling grounded and ready for intentional habits.',
    createdAt: '2026-10-18T10:00:00Z',
  },
];

export const DEV_SAMPLE_HABITS: Habit[] = [
  {
    id: 'dev-h-1',
    title: '15-Minute Sunlight Walk',
    description: 'Get natural photons within an hour of waking to calibrate circadian rhythm.',
    category: 'health',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    currentStreak: 6,
    longestStreak: 14,
    isArchived: false,
    createdAt: '2026-10-01T07:00:00Z',
  },
  {
    id: 'dev-h-2',
    title: 'Mindful Evening Journaling',
    description: 'Unload mental tabs and note one moment of genuine appreciation.',
    category: 'mindfulness',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    currentStreak: 4,
    longestStreak: 9,
    isArchived: false,
    createdAt: '2026-10-02T21:00:00Z',
  },
  {
    id: 'dev-h-3',
    title: 'Distraction-Free Deep Work Block',
    description: '45 minutes single-tasking without notifications or open tabs.',
    category: 'focus',
    frequency: 'daily',
    targetDaysPerWeek: 5,
    currentStreak: 3,
    longestStreak: 5,
    isArchived: false,
    createdAt: '2026-10-03T09:00:00Z',
  },
  {
    id: 'dev-h-4',
    title: 'Hydration Target (2.5L)',
    description: 'Keep water carafe filled and drink steadily throughout the day.',
    category: 'health',
    frequency: 'daily',
    targetDaysPerWeek: 7,
    currentStreak: 7,
    longestStreak: 21,
    isArchived: false,
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'dev-h-5',
    title: 'Thoughtful Message to a Friend',
    description: 'Reach out without an agenda to strengthen personal bonds.',
    category: 'connection',
    frequency: 'weekly',
    targetDaysPerWeek: 2,
    currentStreak: 2,
    longestStreak: 4,
    isArchived: false,
    createdAt: '2026-10-05T12:00:00Z',
  },
];

export const DEV_SAMPLE_HABIT_LOGS: HabitLog[] = [
  { habitId: 'dev-h-1', date: '2026-10-18', completed: true },
  { habitId: 'dev-h-2', date: '2026-10-18', completed: false },
  { habitId: 'dev-h-3', date: '2026-10-18', completed: true },
  { habitId: 'dev-h-4', date: '2026-10-18', completed: true },
  { habitId: 'dev-h-5', date: '2026-10-18', completed: false },
  { habitId: 'dev-h-1', date: '2026-10-17', completed: true },
  { habitId: 'dev-h-2', date: '2026-10-17', completed: true },
  { habitId: 'dev-h-3', date: '2026-10-17', completed: true },
  { habitId: 'dev-h-4', date: '2026-10-17', completed: true },
];

export const DEV_SAMPLE_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'dev-j-1',
    title: 'Observing the urge to rush',
    content:
      'Notice how readily I jump between browser tabs when a task feels slightly unclear. Pausing for three slow breaths before switching windows helped me finish the document draft without friction.',
    date: '2026-10-18',
    tags: ['Mindfulness', 'Focus', 'Self-Awareness'],
    moodScore: 8,
    promptUsed: 'What did you notice about your attention today?',
    createdAt: '2026-10-18T16:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z',
  },
  {
    id: 'dev-j-2',
    title: 'Grounded progress over quick fixes',
    content:
      'Consistency is rarely exciting in the moment; it is quiet and repetitive. Enjoying the rhythm of cooking wholesome meals and keeping screen time low after 9 PM.',
    date: '2026-10-16',
    tags: ['Habits', 'Peace', 'Routine'],
    moodScore: 9,
    promptUsed: 'Where did you choose patience over haste?',
    createdAt: '2026-10-16T21:30:00Z',
    updatedAt: '2026-10-16T21:30:00Z',
  },
  {
    id: 'dev-j-3',
    title: 'Resetting after an overwhelmed morning',
    content:
      'Woke up with racing thoughts about back-to-back commitments. Stepped outside for ten minutes without my phone. The physical shift in temperature helped break the cognitive spiral.',
    date: '2026-10-14',
    tags: ['Reset', 'Emotional Health'],
    moodScore: 6,
    promptUsed: 'How did you support yourself through discomfort?',
    createdAt: '2026-10-14T15:10:00Z',
    updatedAt: '2026-10-14T15:10:00Z',
  },
];

export const DEV_SAMPLE_TRAITS: Trait[] = [
  {
    id: 'dev-t-1',
    name: 'Active Listening',
    description: 'Holding space for others to finish their thoughts without mentally preparing my rebuttal.',
    type: 'strength',
    category: 'interpersonal',
    focusPractice: 'Count to two after the speaker finishes before responding.',
    isArchived: false,
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'dev-t-2',
    name: 'Intentional Calmness',
    description: 'Maintaining nervous system composure when external timelines tighten.',
    type: 'strength',
    category: 'emotional',
    focusPractice: 'Physiological sigh before answering urgent inquiries.',
    isArchived: false,
    createdAt: '2026-09-20T11:00:00Z',
  },
  {
    id: 'dev-t-3',
    name: 'Overthinking Minor Decisions',
    description: 'Spending disproportionate mental energy researching trivial purchases or choices.',
    type: 'growth',
    category: 'mindset',
    focusPractice: 'Apply a 2-minute decision rule for items under $30.',
    isArchived: false,
    createdAt: '2026-10-01T14:00:00Z',
  },
  {
    id: 'dev-t-4',
    name: 'Saying No to Overcommitment',
    description: 'Politely declining requests that conflict with restorative evening hours.',
    type: 'growth',
    category: 'habits',
    focusPractice: 'Sleep on non-critical volunteer requests before answering.',
    isArchived: false,
    createdAt: '2026-10-05T09:30:00Z',
  },
];

export const DEV_SAMPLE_INSIGHTS: WeeklyInsight[] = [
  {
    id: 'dev-ins-1',
    title: 'Morning Movement & Evening Calm Correlation',
    type: 'correlation',
    summary: 'On days you logged a sunlight walk before 10 AM, evening mood scores averaged 8.4 vs 6.5 on sedentary days.',
    evidence: 'Based on 14 recorded days with cross-referenced habit logs and daily mood metrics.',
    actionableTakeaway: 'Prioritize even a 10-minute walk on busy days to anchor your autonomic nervous system.',
    weekLabel: 'Week of Oct 12 - 18',
  },
  {
    id: 'dev-ins-2',
    title: 'Habit Consistency Milestone',
    type: 'milestone',
    summary: 'You maintained a 7-day hydration streak and 6-day morning walk streak this week.',
    evidence: '82% overall habit completion rate across 5 active routines.',
    actionableTakeaway: 'Celebrate this steady momentum. You do not need to add more habits right now.',
    weekLabel: 'Week of Oct 12 - 18',
  },
  {
    id: 'dev-ins-3',
    title: 'Gentle Observation: Mid-Week Energy Dip',
    type: 'gentle_nudge',
    summary: 'Wednesday afternoons frequently align with feelings of fatigue in both mood ratings and reflection tags.',
    evidence: '3 of the past 4 Wednesdays logged mood scores below your 7.6 baseline.',
    actionableTakeaway: 'Consider scheduling a 20-minute restorative break or scheduling fewer meetings on Wednesday afternoons.',
    weekLabel: 'Week of Oct 12 - 18',
  },
];
