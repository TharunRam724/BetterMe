import React, { useMemo } from 'react';
import { BookOpen, ArrowRight, Lock, Plus, Calendar, Tag, Check, Loader2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useBetterMe } from '../../services/serviceContext';
import { getLastNDaysLocal, formatShortDay } from '../../utils/dateUtils';

interface RecentJournalWidgetProps {
  onNavigateToJournal: () => void;
  onOpenNewEntry: () => void;
}

export const RecentJournalWidget: React.FC<RecentJournalWidgetProps> = ({
  onNavigateToJournal,
  onOpenNewEntry,
}) => {
  const { journalEntries, journalLoading } = useBetterMe();

  const last7Days = useMemo(() => getLastNDaysLocal(7), []);
  const last30Days = useMemo(() => getLastNDaysLocal(30), []);

  // Writing counts over time
  const totalCount = journalEntries.length;
  const entriesThisWeek = useMemo(() => {
    return journalEntries.filter((j) => last7Days.includes(j.date)).length;
  }, [journalEntries, last7Days]);

  const entriesThisMonth = useMemo(() => {
    return journalEntries.filter((j) => last30Days.includes(j.date)).length;
  }, [journalEntries, last30Days]);

  // Set of dates with at least one journal entry
  const datesWrittenSet = useMemo(() => {
    return new Set(journalEntries.map((j) => j.date));
  }, [journalEntries]);

  // Days written in the past 7 days (distinct days)
  const daysWrittenCount = last7Days.filter((d) => datesWrittenSet.has(d)).length;
  const consistencyPercent = Math.round((daysWrittenCount / 7) * 100);

  // Recent entry metadata only (Strict rule: do not display private journal body on dashboard)
  const recentHeaders = journalEntries.slice(0, 3);

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F6F1EA] border border-[#E9DFC0]/60 flex items-center justify-center text-[#735A38]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#2D2A26]">Journal & Writing Analytics</h3>
                <span className="flex items-center gap-1 text-[10px] font-medium text-[#7D7366] bg-[#F2EDE5] px-1.5 py-0.5 rounded">
                  <Lock className="w-2.5 h-2.5" />
                  Private Headers Only
                </span>
              </div>
              <p className="text-[11px] text-[#7A7369]">Consistency and entry volume</p>
            </div>
          </div>

          <button
            onClick={onNavigateToJournal}
            className="text-xs text-[#6B5A96] hover:text-[#52417A] font-semibold flex items-center gap-1 transition-colors"
          >
            <span>All ({totalCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Measurable Writing Counts & Consistency Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DB] text-center">
            <span className="text-[10px] uppercase font-bold text-[#7E7468] tracking-wider block">
              Total Entries
            </span>
            <span className="text-base font-bold text-[#2D2A26] block">{totalCount}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DB] text-center">
            <span className="text-[10px] uppercase font-bold text-[#7E7468] tracking-wider block">
              This Week
            </span>
            <span className="text-base font-bold text-[#2D2A26] block">{entriesThisWeek}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DB] text-center">
            <span className="text-[10px] uppercase font-bold text-[#7E7468] tracking-wider block">
              This Month
            </span>
            <span className="text-base font-bold text-[#2D2A26] block">{entriesThisMonth}</span>
          </div>
        </div>

        {/* 7-Day Consistency Rhythm Tracker */}
        <div className="p-3 rounded-2xl bg-[#F8F5F0] border border-[#E9E2D5] mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#3D372F] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#8A7E72]" />
              7-Day Writing Rhythm
            </span>
            <span className="text-[11px] font-bold text-[#685848]">
              {daysWrittenCount} of 7 days ({consistencyPercent}%)
            </span>
          </div>

          {/* 7-Day Days Strip */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {last7Days.map((dStr) => {
              const isWritten = datesWrittenSet.has(dStr);
              return (
                <div
                  key={dStr}
                  title={`${dStr}: ${isWritten ? 'Reflection written' : 'No reflection logged'}`}
                  className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isWritten
                      ? 'bg-[#EBF3ED] border-[#D1E4D6] text-[#2F5239]'
                      : 'bg-white/80 border-[#E8E1D5] text-[#91877C]'
                  }`}
                >
                  <span className="text-[9px] uppercase font-medium">{formatShortDay(dStr)}</span>
                  <div className="w-3.5 h-3.5 mt-0.5 flex items-center justify-center">
                    {isWritten ? (
                      <Check className="w-3 h-3 text-[#3F6B4C]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DDD5CA]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading / Empty / Metadata list */}
        {journalLoading && journalEntries.length === 0 ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#7A7369]">
            <Loader2 className="w-4 h-4 animate-spin text-[#8774B8]" />
            <span>Loading reflections from Supabase...</span>
          </div>
        ) : recentHeaders.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC] text-center space-y-1.5 my-2">
            <p className="text-xs text-[#6E665D]">No journal reflections found in your account.</p>
            <p className="text-[11px] text-[#8C847B]">
              Write your thoughts to build self-awareness and track writing consistency.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-[#8C8276] uppercase tracking-wider px-1">
              Recent Reflection Titles (Private Notes Hidden)
            </div>
            {recentHeaders.map((entry) => (
              <div
                key={entry.id}
                onClick={onNavigateToJournal}
                className="p-3 rounded-xl bg-[#FCFAF7] border border-[#ECE5DB] hover:border-[#DFD6C9] transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-[#2E2924] group-hover:text-[#5B4785] transition-colors truncate">
                    {entry.title || 'Untitled Reflection'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#786E63]">
                    <span>{entry.date}</span>
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-[#7D7368]">
                        <Tag className="w-2.5 h-2.5" />
                        {entry.tags.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-[#B5ABA0] group-hover:text-[#5B4785] transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-[#F2ECE3]">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenNewEntry}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="w-full text-xs"
        >
          New Reflection
        </Button>
      </div>
    </Card>
  );
};
