import type {
  Habit,
  HabitLog,
  MoodEntry,
  MoodEmotion,
  JournalEntry,
  Trait,
  WeeklyInsight,
  InsightType,
} from '../types';
import { getLastNDaysLocal, formatFriendlyDate } from './dateUtils';

export interface DataSufficiencyCheck {
  hasSufficientData: boolean;
  distinctMoodDays: number;
  activeHabitsCount: number;
  completedHabitLogsCount: number;
  journalCount: number;
  traitsCount: number;
  statusLabel: 'gathering_baseline' | 'emerging_patterns' | 'robust_insights';
  checklist: Array<{
    id: string;
    label: string;
    current: number;
    target: number;
    isComplete: boolean;
    helperText: string;
  }>;
}

export interface SmartInsightsResult {
  insights: WeeklyInsight[];
  sufficiency: DataSufficiencyCheck;
  metrics: {
    weeklyHabitRate: number;
    moodTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
    recentMoodAverage: number | null;
    priorMoodAverage: number | null;
    topEmotions: Array<{ emotion: MoodEmotion; count: number }>;
    journalCountThisWeek: number;
    activeStrengthsCount: number;
    activeGrowthAreasCount: number;
  };
}

/**
 * Pure algorithmic engine to analyze real user data across habits, moods,
 * journals, and traits using local calendar dates.
 *
 * Strict Rule: Never invent fake statistics or mock figures if data is absent.
 */
export function generateSmartInsights(params: {
  habits: Habit[];
  habitLogs: HabitLog[];
  moods: MoodEntry[];
  journalEntries: JournalEntry[];
  traits: Trait[];
}): SmartInsightsResult {
  const { habits, habitLogs, moods, journalEntries, traits } = params;

  const last14Days = getLastNDaysLocal(14);
  const current7Days = last14Days.slice(7); // Most recent 7 days (including today)
  const prior7Days = last14Days.slice(0, 7); // Previous 7 days

  const weekRangeLabel = `${formatFriendlyDate(current7Days[0])} – ${formatFriendlyDate(
    current7Days[current7Days.length - 1]
  )}`;

  // ----------------------------------------------------
  // 1. Data Sufficiency Assessment
  // ----------------------------------------------------
  const activeHabits = habits.filter((h) => !h.isArchived);
  
  // Deduplicate mood entries by date to count actual days logged
  const moodByDateMap = new Map<string, MoodEntry>();
  for (const m of moods) {
    if (!moodByDateMap.has(m.date) || new Date(m.createdAt) > new Date(moodByDateMap.get(m.date)!.createdAt)) {
      moodByDateMap.set(m.date, m);
    }
  }
  const uniqueMoodList = Array.from(moodByDateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const distinctMoodDays = uniqueMoodList.length;

  const completedHabitLogsCount = habitLogs.filter((l) => l.completed).length;
  const recentCompletedHabitLogs = habitLogs.filter(
    (l) => l.completed && current7Days.includes(l.date) && activeHabits.some((h) => h.id === l.habitId)
  ).length;

  const journalCount = journalEntries.length;
  const journalCountThisWeek = journalEntries.filter((j) => current7Days.includes(j.date)).length;

  const activeStrengths = traits.filter((t) => t.type === 'strength' && !t.isArchived);
  const activeGrowthAreas = traits.filter((t) => t.type === 'growth' && !t.isArchived);

  // Minimum sufficiency criteria: need either >=2 mood days or >=3 habit completions
  const hasMinimumSignals = distinctMoodDays >= 2 || recentCompletedHabitLogs >= 3 || journalCount >= 2;
  const hasRobustSignals = distinctMoodDays >= 4 && activeHabits.length >= 1 && recentCompletedHabitLogs >= 4;

  const checklist = [
    {
      id: 'mood',
      label: 'Daily Mood Reflections',
      current: distinctMoodDays,
      target: 2,
      isComplete: distinctMoodDays >= 2,
      helperText: 'Log your energy and feeling over at least 2 days to track emotional momentum.',
    },
    {
      id: 'habits',
      label: 'Habit Completions',
      current: recentCompletedHabitLogs,
      target: 3,
      isComplete: recentCompletedHabitLogs >= 3,
      helperText: 'Mark at least 3 habit completions this week to detect routine consistency.',
    },
    {
      id: 'journal',
      label: 'Mindful Reflections',
      current: journalCount,
      target: 1,
      isComplete: journalCount >= 1,
      helperText: 'Write a short reflection to connect mindset with daily experiences.',
    },
    {
      id: 'traits',
      label: 'Character Traits',
      current: traits.length,
      target: 1,
      isComplete: traits.length >= 1,
      helperText: 'Document at least 1 personal strength or growth opportunity.',
    },
  ];

  const sufficiency: DataSufficiencyCheck = {
    hasSufficientData: hasMinimumSignals,
    distinctMoodDays,
    activeHabitsCount: activeHabits.length,
    completedHabitLogsCount,
    journalCount,
    traitsCount: traits.length,
    statusLabel: hasRobustSignals
      ? 'robust_insights'
      : hasMinimumSignals
      ? 'emerging_patterns'
      : 'gathering_baseline',
    checklist,
  };

  // ----------------------------------------------------
  // 2. Metrics & Calculations
  // ----------------------------------------------------
  // Weekly habit completion rate
  const totalPossibleCompletions = activeHabits.length * 7;
  const weeklyHabitRate =
    totalPossibleCompletions > 0
      ? Math.round((recentCompletedHabitLogs / totalPossibleCompletions) * 100)
      : 0;

  // Mood trend (comparing current 7 days vs prior 7 days or first half vs second half)
  let moodTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data';
  let recentMoodAverage: number | null = null;
  let priorMoodAverage: number | null = null;

  if (distinctMoodDays >= 2) {
    const recentEntries = uniqueMoodList.filter((m) => current7Days.includes(m.date));
    const priorEntries = uniqueMoodList.filter((m) => prior7Days.includes(m.date));

    if (recentEntries.length >= 1 && priorEntries.length >= 1) {
      recentMoodAverage =
        Math.round((recentEntries.reduce((acc, m) => acc + m.score, 0) / recentEntries.length) * 10) / 10;
      priorMoodAverage =
        Math.round((priorEntries.reduce((acc, m) => acc + m.score, 0) / priorEntries.length) * 10) / 10;
    } else {
      // If records fall outside exact 7-day bounds, split chronologically
      const midpoint = Math.floor(uniqueMoodList.length / 2);
      const earlyHalf = uniqueMoodList.slice(0, midpoint);
      const lateHalf = uniqueMoodList.slice(midpoint);
      priorMoodAverage =
        Math.round((earlyHalf.reduce((acc, m) => acc + m.score, 0) / earlyHalf.length) * 10) / 10;
      recentMoodAverage =
        Math.round((lateHalf.reduce((acc, m) => acc + m.score, 0) / lateHalf.length) * 10) / 10;
    }

    const diff = recentMoodAverage - priorMoodAverage;
    if (diff >= 0.5) {
      moodTrend = 'improving';
    } else if (diff <= -0.5) {
      moodTrend = 'declining';
    } else {
      moodTrend = 'stable';
    }
  }

  // Emotion frequency
  const emotionCounts = new Map<MoodEmotion, number>();
  for (const m of uniqueMoodList) {
    if (m.emotions && Array.isArray(m.emotions)) {
      for (const e of m.emotions) {
        emotionCounts.set(e, (emotionCounts.get(e) || 0) + 1);
      }
    }
  }
  const topEmotions = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count);

  const metrics = {
    weeklyHabitRate,
    moodTrend,
    recentMoodAverage,
    priorMoodAverage,
    topEmotions,
    journalCountThisWeek,
    activeStrengthsCount: activeStrengths.length,
    activeGrowthAreasCount: activeGrowthAreas.length,
  };

  // ----------------------------------------------------
  // 3. Insight Generator
  // ----------------------------------------------------
  const generatedInsights: WeeklyInsight[] = [];

  // A. Habit Consistency Insights
  if (activeHabits.length > 0 && recentCompletedHabitLogs > 0) {
    // Find highest performing habit in current 7 days
    const habitStats = activeHabits.map((habit) => {
      const logsForHabit = habitLogs.filter(
        (l) => l.habitId === habit.id && current7Days.includes(l.date) && l.completed
      );
      const doneDays = logsForHabit.length;
      const rate = Math.round((doneDays / 7) * 100);
      return { habit, doneDays, rate };
    });

    habitStats.sort((a, b) => b.doneDays - a.doneDays);
    const topHabit = habitStats[0];

    if (topHabit && topHabit.doneDays >= 3) {
      generatedInsights.push({
        id: `ins-habit-top-${topHabit.habit.id}`,
        title: `Consistent Routine: ${topHabit.habit.title}`,
        type: topHabit.doneDays >= 6 ? 'milestone' : 'positive_trend',
        summary: `You successfully completed "${topHabit.habit.title}" on ${topHabit.doneDays} of the last 7 days (${topHabit.rate}% consistency).`,
        evidence: `Verified by ${topHabit.doneDays} local check-ins this week. Current streak: ${topHabit.habit.currentStreak || topHabit.doneDays} days.`,
        actionableTakeaway:
          topHabit.doneDays >= 6
            ? 'This habit is firmly rooted. Maintain the exact environment cue that initiates it.'
            : 'You have solid momentum here. Try tying this routine directly to an existing morning or evening anchor.',
        weekLabel: weekRangeLabel,
        category: 'habits',
        metricBadge: {
          label: `${topHabit.rate}% Completion`,
          tone: 'sage',
        },
      });
    }

    // High overall consistency milestone
    if (weeklyHabitRate >= 70 && activeHabits.length >= 2) {
      generatedInsights.push({
        id: 'ins-habit-overall-steadiness',
        title: 'High Overall Routine Steadiness',
        type: 'milestone',
        summary: `Across all ${activeHabits.length} active habits, your combined completion rate reached ${weeklyHabitRate}% this week.`,
        evidence: `${recentCompletedHabitLogs} total completions recorded across local calendar days.`,
        actionableTakeaway:
          'Resist the temptation to add new routines right now. Letting this rhythm stabilize builds lasting resilience.',
        weekLabel: weekRangeLabel,
        category: 'habits',
        metricBadge: {
          label: `${weeklyHabitRate}% Overall`,
          tone: 'sage',
        },
      });
    }

    // Gentle tuning for a struggling habit (completed <= 1 day despite >= 4 days active)
    const strugglingHabit = habitStats.find((s) => s.doneDays <= 1 && s.habit.targetDaysPerWeek >= 3);
    if (strugglingHabit) {
      generatedInsights.push({
        id: `ins-habit-nudge-${strugglingHabit.habit.id}`,
        title: `Gentle Habit Tuning: ${strugglingHabit.habit.title}`,
        type: 'gentle_nudge',
        summary: `"${strugglingHabit.habit.title}" was logged ${strugglingHabit.doneDays} time in the past 7 days.`,
        evidence: `Target is ${strugglingHabit.habit.targetDaysPerWeek} days/week, but execution was ${strugglingHabit.rate}% recently.`,
        actionableTakeaway:
          'Reduce the friction: scale this habit down to a 2-minute micro-version for the next 3 days so it feels effortless to start.',
        weekLabel: weekRangeLabel,
        category: 'habits',
        metricBadge: {
          label: 'Needs Tuning',
          tone: 'peach',
        },
      });
    }
  }

  // B. Mood Trend Insights
  if (distinctMoodDays >= 2 && recentMoodAverage !== null && priorMoodAverage !== null) {
    if (moodTrend === 'improving') {
      generatedInsights.push({
        id: 'ins-mood-improving',
        title: 'Positive Emotional Momentum',
        type: 'positive_trend',
        summary: `Your mood scores averaged ${recentMoodAverage.toFixed(1)} / 10 recently, trending upward from ${priorMoodAverage.toFixed(1)} / 10 in the prior window.`,
        evidence: `Synthesized from ${distinctMoodDays} unique daily mood ratings in your local history.`,
        actionableTakeaway:
          'Take note of the supportive practices (sleep, mindful walks, boundaries) that made this lift possible.',
        weekLabel: weekRangeLabel,
        category: 'mood',
        metricBadge: {
          label: `+${(recentMoodAverage - priorMoodAverage).toFixed(1)} Score Lift`,
          tone: 'lavender',
        },
      });
    } else if (moodTrend === 'declining') {
      generatedInsights.push({
        id: 'ins-mood-recovery',
        title: 'Gentle Energy & Recovery Observation',
        type: 'gentle_nudge',
        summary: `Your recent mood average (${recentMoodAverage.toFixed(1)} / 10) is slightly lower than your previous baseline (${priorMoodAverage.toFixed(1)} / 10).`,
        evidence: `Reflected across recent daily check-ins. Temporary dips are a normal physiological signal.`,
        actionableTakeaway:
          'Honor what your body is requesting: carve out an extra 30 minutes of unstructured rest and lower non-critical expectations.',
        weekLabel: weekRangeLabel,
        category: 'mood',
        metricBadge: {
          label: 'Rest Suggested',
          tone: 'peach',
        },
      });
    } else {
      generatedInsights.push({
        id: 'ins-mood-stable',
        title: 'Emotional Equilibrium & Stability',
        type: 'positive_trend',
        summary: `Your mood has held steady at an average of ${recentMoodAverage.toFixed(1)} / 10 across your logged days.`,
        evidence: `Consistency maintained across ${distinctMoodDays} logged check-ins with low volatility.`,
        actionableTakeaway:
          'Steady emotional regulation is a foundational win. Continue grounding yourself in your quiet daily checkpoints.',
        weekLabel: weekRangeLabel,
        category: 'mood',
        metricBadge: {
          label: `${recentMoodAverage.toFixed(1)} Avg Score`,
          tone: 'lavender',
        },
      });
    }

    // Emotion tag insight
    if (topEmotions.length > 0 && topEmotions[0].count >= 2) {
      const primaryEmotion = topEmotions[0];
      const pct = Math.round((primaryEmotion.count / distinctMoodDays) * 100);
      generatedInsights.push({
        id: `ins-emotion-${primaryEmotion.emotion.toLowerCase()}`,
        title: `Frequent State: ${primaryEmotion.emotion}`,
        type: 'positive_trend',
        summary: `You tagged "${primaryEmotion.emotion}" on ${primaryEmotion.count} recorded days (${pct}% of your mood check-ins).`,
        evidence: `Observed across your personal check-ins.`,
        actionableTakeaway: `Reflect on what environments or activities cultivate feelings of ${primaryEmotion.emotion.toLowerCase()} and schedule them intentionally.`,
        weekLabel: weekRangeLabel,
        category: 'mood',
        metricBadge: {
          label: `${primaryEmotion.emotion}`,
          tone: 'lavender',
        },
      });
    }
  }

  // C. Cross-Domain Correlation (Habits + Mood)
  // Only calculate if there are >= 3 distinct dates with BOTH a mood rating and habit logs
  const datesWithBoth = uniqueMoodList
    .map((m) => m.date)
    .filter((date) => habitLogs.some((l) => l.date === date));

  if (datesWithBoth.length >= 3 && activeHabits.length > 0) {
    const habitDayScores: number[] = [];
    const missedDayScores: number[] = [];

    for (const d of datesWithBoth) {
      const moodRecord = moodByDateMap.get(d);
      if (!moodRecord) continue;

      const completedCountOnDay = habitLogs.filter(
        (l) => l.date === d && l.completed && activeHabits.some((h) => h.id === l.habitId)
      ).length;

      if (completedCountOnDay >= 1) {
        habitDayScores.push(moodRecord.score);
      } else {
        missedDayScores.push(moodRecord.score);
      }
    }

    if (habitDayScores.length >= 2 && missedDayScores.length >= 1) {
      const avgOnHabitDays =
        Math.round((habitDayScores.reduce((a, b) => a + b, 0) / habitDayScores.length) * 10) / 10;
      const avgOnMissedDays =
        Math.round((missedDayScores.reduce((a, b) => a + b, 0) / missedDayScores.length) * 10) / 10;

      const diff = avgOnHabitDays - avgOnMissedDays;
      if (diff >= 0.4) {
        generatedInsights.push({
          id: 'ins-correlation-habits-mood',
          title: 'Daily Action & Mood Correlation',
          type: 'correlation',
          summary: `On days you completed at least one active habit, your mood averaged ${avgOnHabitDays.toFixed(1)} / 10 compared to ${avgOnMissedDays.toFixed(1)} / 10 on zero-habit days.`,
          evidence: `Directly measured across ${datesWithBoth.length} cross-referenced calendar days in your Supabase records.`,
          actionableTakeaway:
            'Completing even a single gentle routine provides an immediate emotional anchor. Focus on showing up rather than perfection.',
          weekLabel: weekRangeLabel,
          category: 'correlation',
          metricBadge: {
            label: `+${diff.toFixed(1)} Mood on Habit Days`,
            tone: 'sage',
          },
        });
      }
    }
  }

  // D. Journaling Insights
  if (journalCount >= 2) {
    generatedInsights.push({
      id: 'ins-journal-consistency',
      title: 'Mindful Journaling Practice',
      type: 'positive_trend',
      summary: `You have written ${journalCountThisWeek} journal entries this week (${journalCount} total in your private archive).`,
      evidence: `Recorded across your local sessions with reflections on daily experiences.`,
      actionableTakeaway:
        'Regular reflection externalizes mental dialogue and sharpens clarity. Continue capturing brief thoughts after meaningful events.',
      weekLabel: weekRangeLabel,
      category: 'journal',
      metricBadge: {
        label: `${journalCountThisWeek} Written This Week`,
        tone: 'stone',
      },
    });
  } else if (journalCount === 0 && (distinctMoodDays >= 3 || completedHabitLogsCount >= 3)) {
    generatedInsights.push({
      id: 'ins-journal-nudge',
      title: 'Untapped Clarity: Written Journaling',
      type: 'gentle_nudge',
      summary: `You have steady mood and habit tracking, but haven't explored written journaling reflections yet.`,
      evidence: `0 journal entries logged so far.`,
      actionableTakeaway:
        'Try jotting down 2-3 sentences about your primary feeling tonight. Free writing is proven to relieve cognitive overload.',
      weekLabel: weekRangeLabel,
      category: 'journal',
      metricBadge: {
        label: 'Opportunity',
        tone: 'stone',
      },
    });
  }

  // E. Personal Growth Traits Integration
  if (activeGrowthAreas.length > 0) {
    // Pick the most relevant growth trait
    const growthTrait = activeGrowthAreas[0];
    generatedInsights.push({
      id: `ins-trait-growth-${growthTrait.id}`,
      title: `Deliberate Practice: ${growthTrait.name}`,
      type: 'gentle_nudge',
      summary: `You marked "${growthTrait.name}" as an active growth opportunity under your ${growthTrait.category} development.`,
      evidence: growthTrait.focusPractice
        ? `Deliberate Practice Cue: "${growthTrait.focusPractice}"`
        : `Categorized under ${growthTrait.category} growth traits.`,
      actionableTakeaway:
        growthTrait.focusPractice ||
        `Pause and notice your instinctive reaction during challenging moments today. Apply your ${growthTrait.name} growth intention.`,
      weekLabel: weekRangeLabel,
      category: 'traits',
      metricBadge: {
        label: 'Growth Focus',
        tone: 'peach',
      },
    });
  } else if (activeStrengths.length > 0) {
    const strengthTrait = activeStrengths[0];
    generatedInsights.push({
      id: `ins-trait-strength-${strengthTrait.id}`,
      title: `Anchor in Strength: ${strengthTrait.name}`,
      type: 'positive_trend',
      summary: `Your documented strength in "${strengthTrait.name}" is an active asset in your character portfolio.`,
      evidence: `Documented in your ${strengthTrait.category} traits.`,
      actionableTakeaway:
        'When facing uncertainty or high-pressure tasks today, deliberately lean into this validated strength.',
      weekLabel: weekRangeLabel,
      category: 'traits',
      metricBadge: {
        label: 'Core Strength',
        tone: 'sage',
      },
    });
  }

  // Sort insights: correlations and milestones first, then positive trends, then gentle nudges
  const typeOrder: Record<InsightType, number> = {
    correlation: 1,
    milestone: 2,
    positive_trend: 3,
    gentle_nudge: 4,
  };
  generatedInsights.sort((a, b) => (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5));

  return {
    insights: generatedInsights,
    sufficiency,
    metrics,
  };
}
