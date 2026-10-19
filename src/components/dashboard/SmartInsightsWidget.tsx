import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Calendar,
  BookOpen,
  Award,
  Plus,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useBetterMe } from '../../services/serviceContext';

interface SmartInsightsWidgetProps {
  onNavigateToInsights: () => void;
  onOpenMoodModal?: () => void;
  onOpenJournalModal?: () => void;
  onOpenHabitModal?: () => void;
  onNavigateToTraits?: () => void;
}

export const SmartInsightsWidget: React.FC<SmartInsightsWidgetProps> = ({
  onNavigateToInsights,
  onOpenMoodModal,
  onOpenJournalModal,
  onOpenHabitModal,
  onNavigateToTraits,
}) => {
  const { insights, insightsSufficiency, insightsMetrics } = useBetterMe();

  const { hasSufficientData, statusLabel, checklist } = insightsSufficiency;
  const completedChecklistCount = checklist.filter((item) => item.isComplete).length;

  return (
    <Card className="p-6 bg-gradient-to-br from-[#FAF8F5] via-[#FCFAF8] to-[#F5F8F6] border-[#E3DDD2] shadow-sm">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EDE7F8] border border-[#DCD2F2] flex items-center justify-center text-[#6B5A96] shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#2D2A26]">
                Smart Behavioral Insights
              </h3>
              <Badge
                tone={
                  statusLabel === 'robust_insights'
                    ? 'sage'
                    : statusLabel === 'emerging_patterns'
                    ? 'lavender'
                    : 'stone'
                }
                size="sm"
              >
                {statusLabel === 'robust_insights'
                  ? 'Verified Patterns'
                  : statusLabel === 'emerging_patterns'
                  ? 'Emerging Patterns'
                  : 'Building Baseline'}
              </Badge>
            </div>
            <p className="text-xs text-[#756D63]">
              Real-time pattern analysis calculated from your local check-in records
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToInsights}
          className="self-start sm:self-auto text-xs font-semibold text-[#5B8266] hover:text-[#3B5B43] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E0D9CD] shadow-xs hover:bg-[#F9F7F4] transition-all"
        >
          <span>Full Insights Tab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Case 1: Insufficient Data - Graceful, encouraging onboarding guidance */}
      {!hasSufficientData ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/80 border border-[#E8E1D5] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3B342C]">
                <Compass className="w-4 h-4 text-[#8774B8]" />
                <span>Gathering Your Behavioral Signals ({completedChecklistCount} of {checklist.length} milestones)</span>
              </div>
              <span className="text-[11px] font-semibold text-[#8C8276]">
                Strict Zero-Fabrication Guarantee
              </span>
            </div>

            <p className="text-xs text-[#635B50] leading-relaxed">
              BetterMe never invents fake statistics, simulated correlations, or mock trends. As soon as you log a few days of actual activity, evidence-based patterns will appear here automatically.
            </p>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-[#EDE7DF] overflow-hidden mt-2">
              <div
                className="h-full bg-[#8774B8] rounded-full transition-all duration-500"
                style={{ width: `${(completedChecklistCount / checklist.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actionable Milestones Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                  item.isComplete
                    ? 'bg-[#F2F7F4] border-[#D4E5DB]'
                    : 'bg-white/70 border-[#E8E1D5]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.isComplete
                          ? 'bg-[#5B8266] text-white'
                          : 'bg-[#F0EBE2] text-[#8C8276]'
                      }`}
                    >
                      {item.isComplete ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">
                          {item.current}/{item.target}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2E2822]">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#786F64] leading-snug">
                        {item.helperText}
                      </div>
                    </div>
                  </div>
                </div>

                {!item.isComplete && (
                  <div className="self-end pt-1">
                    {item.id === 'mood' && onOpenMoodModal && (
                      <button
                        onClick={onOpenMoodModal}
                        className="text-[11px] font-bold text-[#8774B8] hover:text-[#675496] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Log Today&apos;s Mood</span>
                      </button>
                    )}
                    {item.id === 'habits' && onOpenHabitModal && (
                      <button
                        onClick={onOpenHabitModal}
                        className="text-[11px] font-bold text-[#5B8266] hover:text-[#3B5B43] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add / Track Habit</span>
                      </button>
                    )}
                    {item.id === 'journal' && onOpenJournalModal && (
                      <button
                        onClick={onOpenJournalModal}
                        className="text-[11px] font-bold text-[#8A7968] hover:text-[#5F5142] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Write Reflection</span>
                      </button>
                    )}
                    {item.id === 'traits' && onNavigateToTraits && (
                      <button
                        onClick={onNavigateToTraits}
                        className="text-[11px] font-bold text-[#8774B8] hover:text-[#675496] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Trait</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Case 2: Sufficient Data - Render actual verified insight cards */
        <div className="space-y-4">
          {/* Quick Real-Time Metric Indicators Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white/70 border border-[#E9E2D6] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EAF2ED] flex items-center justify-center text-[#466950] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#7D756B] uppercase font-semibold">Habit Rate</div>
                <div className="font-bold text-[#2E2822]">{insightsMetrics.weeklyHabitRate}% 7d avg</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EDE7F8] flex items-center justify-center text-[#6B5A96] shrink-0">
                {insightsMetrics.moodTrend === 'improving' ? (
                  <TrendingUp className="w-4 h-4 text-[#5B8266]" />
                ) : insightsMetrics.moodTrend === 'declining' ? (
                  <TrendingDown className="w-4 h-4 text-[#C45E5E]" />
                ) : (
                  <Minus className="w-4 h-4 text-[#8774B8]" />
                )}
              </div>
              <div>
                <div className="text-[10px] text-[#7D756B] uppercase font-semibold">Mood Rhythm</div>
                <div className="font-bold text-[#2E2822]">
                  {insightsMetrics.moodTrend === 'improving'
                    ? 'Upward Lift'
                    : insightsMetrics.moodTrend === 'declining'
                    ? 'Rest Phase'
                    : insightsMetrics.recentMoodAverage !== null
                    ? `${insightsMetrics.recentMoodAverage.toFixed(1)} Steady`
                    : 'Tracking'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F5EFE6] flex items-center justify-center text-[#7A6B5B] shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#7D756B] uppercase font-semibold">Journaling</div>
                <div className="font-bold text-[#2E2822]">
                  {insightsMetrics.journalCountThisWeek} this week
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FBEFEA] flex items-center justify-center text-[#B05B3B] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-[#7D756B] uppercase font-semibold">Growth Traits</div>
                <div className="font-bold text-[#2E2822]">
                  {insightsMetrics.activeStrengthsCount} str • {insightsMetrics.activeGrowthAreasCount} growth
                </div>
              </div>
            </div>
          </div>

          {/* Top 2 Featured Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 2).map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-2xl bg-white border border-[#E7E0D4] space-y-3 flex flex-col justify-between shadow-xs hover:border-[#D5CDBD] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        tone={
                          insight.type === 'correlation'
                            ? 'sage'
                            : insight.type === 'milestone'
                            ? 'peach'
                            : insight.type === 'positive_trend'
                            ? 'lavender'
                            : 'peach'
                        }
                        size="sm"
                      >
                        {insight.type === 'correlation'
                          ? 'Correlation'
                          : insight.type === 'milestone'
                          ? 'Milestone'
                          : insight.type === 'positive_trend'
                          ? 'Positive Trend'
                          : 'Gentle Nudge'}
                      </Badge>
                      {insight.metricBadge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2EDE4] text-[#4E473E]">
                          {insight.metricBadge.label}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-[#8C8377] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {insight.weekLabel}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#2E2822]">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-[#5C544B] leading-relaxed">
                    {insight.summary}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#F2ECE3]">
                  <div className="text-[11px] text-[#7A7165]">
                    <strong className="text-[#3A332B]">Verifiable Record: </strong>
                    {insight.evidence}
                  </div>

                  {insight.actionableTakeaway && (
                    <div className="p-2.5 rounded-xl bg-[#F7FBF8] border border-[#DCEDE1] flex items-start gap-2 text-[#3D6346] text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#5B8266] shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <strong className="font-semibold text-[#294B31]">Actionable Suggestion: </strong>
                        <span>{insight.actionableTakeaway}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note & link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[11px] text-[#7C7368]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#5B8266]" />
              <span>
                Derived from {insightsSufficiency.distinctMoodDays} mood check-ins, {insightsSufficiency.completedHabitLogsCount} habit logs, and {insightsSufficiency.journalCount} private reflections.
              </span>
            </div>

            <button
              onClick={onNavigateToInsights}
              className="text-xs font-bold text-[#5B8266] hover:text-[#3B5B43] flex items-center gap-1"
            >
              <span>Explore All {insights.length} Insights</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};
