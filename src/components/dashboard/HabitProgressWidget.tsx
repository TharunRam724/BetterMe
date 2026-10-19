import React from 'react';
import { CheckCircle2, Circle, Flame, ArrowRight, Plus, Trophy, Loader2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useBetterMe } from '../../services/serviceContext';
import { getLocalDateString, getLastNDaysLocal } from '../../utils/dateUtils';

interface HabitProgressWidgetProps {
  onNavigateToHabits: () => void;
  onOpenCreateHabit: () => void;
}

export const HabitProgressWidget: React.FC<HabitProgressWidgetProps> = ({
  onNavigateToHabits,
  onOpenCreateHabit,
}) => {
  const { habits, habitLogs, habitsLoading, toggleHabitCompletion } = useBetterMe();
  const todayStr = getLocalDateString();

  const activeHabits = habits.filter((h) => !h.isArchived);

  // 1. Today's completion rate
  const completedToday = activeHabits.filter((h) => {
    return habitLogs.some((l) => l.habitId === h.id && l.date === todayStr && l.completed);
  }).length;

  const totalCount = activeHabits.length;
  const todayRate = totalCount > 0 ? Math.round((completedToday / totalCount) * 100) : 0;

  // 2. Weekly completion rate (last 7 calendar days)
  const last7Days = getLastNDaysLocal(7);
  const totalPossibleIn7Days = totalCount * 7;
  const completedIn7Days = habitLogs.filter(
    (l) => l.completed && last7Days.includes(l.date) && activeHabits.some((h) => h.id === l.habitId)
  ).length;

  const weeklyRate =
    totalPossibleIn7Days > 0 ? Math.round((completedIn7Days / totalPossibleIn7Days) * 100) : 0;

  // 3. Current streak and best streak across active habits
  const currentTopStreak = activeHabits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0);
  const bestAllTimeStreak = activeHabits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF2ED] border border-[#D5E5DA] flex items-center justify-center text-[#3D5F47]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26]">Habit Analytics & Routines</h3>
              <p className="text-[11px] text-[#7A7369]">
                {completedToday} of {totalCount} completed today
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToHabits}
            className="text-xs text-[#41644B] hover:text-[#2A4432] font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Analytics Summary Stats Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E3ECE5] text-center">
            <span className="text-[10px] text-[#55785D] uppercase font-bold tracking-wider block">
              Today's Rate
            </span>
            <span className="text-base font-bold text-[#2D2A26] block">{todayRate}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E3ECE5] text-center">
            <span className="text-[10px] text-[#55785D] uppercase font-bold tracking-wider block">
              7-Day Rate
            </span>
            <span className="text-base font-bold text-[#2D2A26] block">{weeklyRate}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FDF9F6] border border-[#ECE0D6] text-center">
            <span className="text-[10px] text-[#9A6237] uppercase font-bold tracking-wider block">
              Top Streak
            </span>
            <span className="text-base font-bold text-[#2D2A26] block flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#D97757]" />
              {currentTopStreak}d
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#F9F7FD] border border-[#E5DEEF] text-center">
            <span className="text-[10px] text-[#69548E] uppercase font-bold tracking-wider block">
              Best Streak
            </span>
            <span className="text-base font-bold text-[#2D2A26] block flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#8774B8]" />
              {bestAllTimeStreak}d
            </span>
          </div>
        </div>

        {/* Progress Bar in Sage */}
        <div className="mb-4">
          <div className="w-full h-2 rounded-full bg-[#EFE9DF] overflow-hidden">
            <div
              className="h-full bg-[#5B8266] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${todayRate}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#7E776F] mt-1.5 font-medium">
            <span>{todayRate}% of today's targets reached</span>
            <span>{Math.max(0, totalCount - completedToday)} remaining</span>
          </div>
        </div>

        {/* Loading / Empty / Habit List */}
        {habitsLoading && habits.length === 0 ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#7A7369]">
            <Loader2 className="w-4 h-4 animate-spin text-[#5B8266]" />
            <span>Loading habits from Supabase...</span>
          </div>
        ) : activeHabits.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC] text-center space-y-1.5 my-2">
            <p className="text-xs text-[#6E665D]">No active habits found in your account.</p>
            <p className="text-[11px] text-[#8C847B]">
              Add daily routines to start tracking real completion rates and streaks.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeHabits.slice(0, 4).map((habit) => {
              const isCompleted = habitLogs.some(
                (l) => l.habitId === habit.id && l.date === todayStr && l.completed
              );

              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleHabitCompletion(habit.id, todayStr);
                    }
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-[#F2F7F4] border-[#DCEBE0] text-[#2F4435]'
                      : 'bg-[#FAF8F5] border-[#ECE6DC] text-[#4F473E] hover:bg-[#F4EFEA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`transition-colors shrink-0 ${
                        isCompleted ? 'text-[#486952]' : 'text-[#A0988E]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 fill-[#E2EFE5]" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </span>
                    <span
                      className={`text-xs font-medium truncate ${
                        isCompleted ? 'line-through opacity-75' : ''
                      }`}
                    >
                      {habit.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {habit.currentStreak > 0 && (
                      <span
                        title={`Current streak: ${habit.currentStreak} days`}
                        className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/80 border border-[#E3DBD0] text-[#8C5D3D]"
                      >
                        <Flame className="w-3 h-3 text-[#D97757]" />
                        {habit.currentStreak}d
                      </span>
                    )}
                    {habit.longestStreak > habit.currentStreak && habit.longestStreak > 0 && (
                      <span
                        title={`Best streak: ${habit.longestStreak} days`}
                        className="flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded-md bg-[#FAF7FD] border border-[#DDD4F2] text-[#69548E]"
                      >
                        <Trophy className="w-2.5 h-2.5 text-[#8774B8]" />
                        {habit.longestStreak}d
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-[#F2ECE3]">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenCreateHabit}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="w-full text-xs"
        >
          Add New Habit
        </Button>
      </div>
    </Card>
  );
};
