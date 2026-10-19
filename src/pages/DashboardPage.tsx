import React, { useState } from 'react';
import {
  Smile,
  CheckCircle2,
  Flame,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { WelcomeHeader } from '../components/dashboard/WelcomeHeader';
import { TodayMoodWidget } from '../components/dashboard/TodayMoodWidget';
import { HabitProgressWidget } from '../components/dashboard/HabitProgressWidget';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { RecentJournalWidget } from '../components/dashboard/RecentJournalWidget';
import { PersonalGrowthWidget } from '../components/dashboard/PersonalGrowthWidget';
import { SmartInsightsWidget } from '../components/dashboard/SmartInsightsWidget';
import { QuickMoodModal } from '../components/dashboard/QuickMoodModal';
import { QuickJournalModal } from '../components/dashboard/QuickJournalModal';
import { QuickHabitModal } from '../components/dashboard/QuickHabitModal';
import { MetricCard } from '../components/common/MetricCard';
import type { NavigationTab } from '../types';
import { useBetterMe } from '../services/serviceContext';
import { getLocalDateString, getLastNDaysLocal } from '../utils/dateUtils';

interface DashboardPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    todayMood,
    habits,
    habitLogs,
    journalEntries,
    habitsLoading,
    moodsLoading,
    journalLoading,
    traitsLoading,
    habitsError,
    moodsError,
    journalError,
    traitsError,
    refreshAll,
  } = useBetterMe();

  const todayStr = getLocalDateString();
  const last7Days = getLastNDaysLocal(7);

  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute habit stats
  const activeHabits = habits.filter((h) => !h.isArchived);
  const completedToday = activeHabits.filter((h) =>
    habitLogs.some((l) => l.habitId === h.id && l.date === todayStr && l.completed)
  ).length;

  const todayHabitRate =
    activeHabits.length > 0 ? Math.round((completedToday / activeHabits.length) * 100) : 0;

  // Weekly habit rate
  const totalPossibleIn7Days = activeHabits.length * 7;
  const completedIn7Days = habitLogs.filter(
    (l) => l.completed && last7Days.includes(l.date) && activeHabits.some((h) => h.id === l.habitId)
  ).length;
  const weeklyHabitRate =
    totalPossibleIn7Days > 0 ? Math.round((completedIn7Days / totalPossibleIn7Days) * 100) : 0;

  // Streaks
  const topCurrentStreak = activeHabits.reduce(
    (max, h) => Math.max(max, h.currentStreak || 0),
    0
  );
  const topBestStreak = activeHabits.reduce(
    (max, h) => Math.max(max, h.longestStreak || 0),
    0
  );

  // Journal metrics
  const journalCountThisWeek = journalEntries.filter((j) => last7Days.includes(j.date)).length;

  // Global loading and error indicators
  const isAnyLoading =
    isRefreshing || habitsLoading || moodsLoading || journalLoading || traitsLoading;
  const anyError = habitsError || moodsError || journalError || traitsError;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <WelcomeHeader />

        <button
          onClick={handleManualRefresh}
          disabled={isAnyLoading}
          aria-label="Refresh all dashboard analytics"
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5DFD4] hover:bg-[#F9F7F4] text-xs font-semibold text-[#574E45] shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnyLoading ? 'animate-spin text-[#8774B8]' : ''}`} />
          <span>{isAnyLoading ? 'Refreshing...' : 'Refresh Analytics'}</span>
        </button>
      </div>

      {/* Database Error Banner if any */}
      {anyError && (
        <div className="p-3.5 rounded-2xl bg-[#FFF6F6] border border-[#F2D4D4] flex items-center justify-between gap-3 text-xs text-[#8F3B3B]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C44D4D]" />
            <span>Database synchronization notice: {anyError}</span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="font-bold underline hover:text-[#5F2424] shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top Growth Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Mood"
          value={todayMood ? `${todayMood.score} / 10` : 'Not Logged'}
          subtitle={
            todayMood && todayMood.emotions.length > 0
              ? todayMood.emotions.slice(0, 2).join(', ')
              : 'Record your energy'
          }
          icon={<Smile className="w-5 h-5" />}
          iconTone="lavender"
          badgeText={todayMood ? 'Logged' : 'Pending'}
          badgeTone={todayMood ? 'lavender' : 'stone'}
        />

        <MetricCard
          title="Habit Completion"
          value={`${todayHabitRate}%`}
          subtitle={`${completedToday} of ${activeHabits.length} today • ${weeklyHabitRate}% 7d avg`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconTone="sage"
          badgeText={
            activeHabits.length === 0
              ? 'No Habits'
              : todayHabitRate === 100
              ? 'All Done'
              : 'In Progress'
          }
          badgeTone="sage"
        />

        <MetricCard
          title="Streak Analytics"
          value={`${topCurrentStreak} days`}
          subtitle={`Best all-time: ${topBestStreak} days consecutive`}
          icon={<Flame className="w-5 h-5" />}
          iconTone="peach"
          badgeText={topCurrentStreak > 0 ? 'Active' : 'Unstarted'}
          badgeTone="peach"
        />

        <MetricCard
          title="Writing Consistency"
          value={`${journalEntries.length} entries`}
          subtitle={`${journalCountThisWeek} written this week`}
          icon={<BookOpen className="w-5 h-5" />}
          iconTone="stone"
          badgeText="Private"
          badgeTone="stone"
        />
      </div>

      {/* Phase 4: Smart Behavioral Insights Section */}
      <SmartInsightsWidget
        onNavigateToInsights={() => onNavigate('insights')}
        onOpenMoodModal={() => setIsMoodModalOpen(true)}
        onOpenJournalModal={() => setIsJournalModalOpen(true)}
        onOpenHabitModal={() => setIsHabitModalOpen(true)}
        onNavigateToTraits={() => onNavigate('traits')}
      />

      {/* Main Dual-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Habits & Journal) */}
        <div className="lg:col-span-6 space-y-6">
          <HabitProgressWidget
            onNavigateToHabits={() => onNavigate('habits')}
            onOpenCreateHabit={() => setIsHabitModalOpen(true)}
          />

          <RecentJournalWidget
            onNavigateToJournal={() => onNavigate('journal')}
            onOpenNewEntry={() => setIsJournalModalOpen(true)}
          />
        </div>

        {/* Right Column (Mood, Rhythm Chart & Measurable Growth Summary) */}
        <div className="lg:col-span-6 space-y-6">
          <TodayMoodWidget
            onOpenMoodModal={() => setIsMoodModalOpen(true)}
            onNavigateToMood={() => onNavigate('mood')}
          />

          <WeeklyTrendChart onOpenMoodModal={() => setIsMoodModalOpen(true)} />

          <PersonalGrowthWidget onNavigateToTraits={() => onNavigate('traits')} />
        </div>
      </div>

      {/* Interactive Modals */}
      <QuickMoodModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
      />

      <QuickJournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
      />

      <QuickHabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
      />
    </div>
  );
};
