import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Compass, Loader2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useBetterMe } from '../../services/serviceContext';
import { getLastNDaysLocal } from '../../utils/dateUtils';

interface PersonalGrowthWidgetProps {
  onNavigateToTraits: () => void;
}

export const PersonalGrowthWidget: React.FC<PersonalGrowthWidgetProps> = ({
  onNavigateToTraits,
}) => {
  const { traits, traitsLoading, habits, habitLogs, journalEntries } = useBetterMe();

  const activeTraits = traits.filter((t) => !t.isArchived);
  const strengths = activeTraits.filter((t) => t.type === 'strength');
  const growthAreas = activeTraits.filter((t) => t.type === 'growth');

  // Measurable domain breakdown
  const categoryCounts = activeTraits.reduce<Record<string, number>>((acc, t) => {
    const cat = t.category || 'mindset';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const distinctCategories = Object.keys(categoryCounts).length;

  // Calculate 7-day habit completion rate
  const last7Days = getLastNDaysLocal(7);
  const activeHabits = habits.filter((h) => !h.isArchived);
  const totalPossibleCompletions = activeHabits.length * 7;
  const completedLogsIn7Days = habitLogs.filter(
    (l) => l.completed && last7Days.includes(l.date) && activeHabits.some((h) => h.id === l.habitId)
  ).length;

  const weeklyHabitRate =
    totalPossibleCompletions > 0
      ? Math.round((completedLogsIn7Days / totalPossibleCompletions) * 100)
      : 0;

  // 7-day journal count
  const weeklyJournalCount = journalEntries.filter((j) => last7Days.includes(j.date)).length;

  return (
    <Card className="p-6 bg-gradient-to-br from-[#FAF8F5] via-[#F6F8F6] to-[#FAF7FC] border-[#E2DDD3]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#685591]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#2D2A26]">Personal Growth Summary</h3>
              <Badge tone="lavender" size="sm">
                Measurable Data
              </Badge>
            </div>
            <p className="text-[11px] text-[#7A7369]">Character traits & recorded routines</p>
          </div>
        </div>

        <button
          onClick={onNavigateToTraits}
          className="text-xs text-[#5D4B82] hover:text-[#423361] font-semibold flex items-center gap-1 transition-colors"
        >
          <span>All Traits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {traitsLoading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#7A7369]">
          <Loader2 className="w-4 h-4 animate-spin text-[#8774B8]" />
          <span>Loading growth metrics...</span>
        </div>
      ) : activeTraits.length === 0 ? (
        <div className="p-5 rounded-2xl bg-white/70 border border-[#E9E2D5] text-center space-y-2">
          <p className="text-xs text-[#6B6256]">
            No character traits recorded yet in your Supabase database.
          </p>
          <button
            onClick={onNavigateToTraits}
            className="text-xs font-semibold text-[#5D4B82] hover:underline"
          >
            + Document your first strength or growth area
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Measurable Stats Pill Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/80 border border-[#E8E2D6] text-center">
              <span className="text-[10px] uppercase font-bold text-[#4B7055] tracking-wider block">
                Strengths
              </span>
              <span className="text-lg font-bold text-[#2D2A26] mt-0.5 block">
                {strengths.length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 border border-[#E8E2D6] text-center">
              <span className="text-[10px] uppercase font-bold text-[#96632B] tracking-wider block">
                Growth Areas
              </span>
              <span className="text-lg font-bold text-[#2D2A26] mt-0.5 block">
                {growthAreas.length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 border border-[#E8E2D6] text-center">
              <span className="text-[10px] uppercase font-bold text-[#6B5A96] tracking-wider block">
                Domains
              </span>
              <span className="text-lg font-bold text-[#2D2A26] mt-0.5 block">
                {distinctCategories}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 border border-[#E8E2D6] text-center">
              <span className="text-[10px] uppercase font-bold text-[#3B6647] tracking-wider block">
                Weekly Routine
              </span>
              <span className="text-lg font-bold text-[#2D2A26] mt-0.5 block">
                {weeklyHabitRate}%
              </span>
            </div>
          </div>

          {/* Factual, Measurable Data Progress Summary (Strict: No unsupported psychological claims) */}
          <div className="p-3.5 rounded-2xl bg-white/75 border border-[#E6E0D4] text-xs text-[#524B43] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#5B8266] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#2D2A26]">Data-Driven Observation: </span>
              <span>
                You currently have {strengths.length} strength{strengths.length === 1 ? '' : 's'} and{' '}
                {growthAreas.length} growth area{growthAreas.length === 1 ? '' : 's'} identified
                {distinctCategories > 0 ? ` across ${distinctCategories} focus domains` : ''}. In the past 7 days, your active habit completion rate is{' '}
                {weeklyHabitRate}% across {activeHabits.length} routine{activeHabits.length === 1 ? '' : 's'}, accompanied by {weeklyJournalCount} journal reflection{weeklyJournalCount === 1 ? '' : 's'}.
              </span>
            </div>
          </div>

          {/* Domains breakdown tags */}
          {distinctCategories > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-[#7C746A] mr-1 flex items-center gap-1">
                <Compass className="w-3 h-3" /> Focus domains:
              </span>
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-lg bg-[#F4EFEA] border border-[#E6DFD4] text-[11px] font-medium text-[#574E45] capitalize"
                >
                  {cat}: {count}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
