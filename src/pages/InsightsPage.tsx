import React from 'react';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Smile,
  Award,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { useBetterMe } from '../services/serviceContext';

export const InsightsPage: React.FC = () => {
  const { insights, habits, habitLogs, insightsSufficiency, insightsMetrics } = useBetterMe();

  const completedLogs = habitLogs.filter((l) => l.completed).length;
  const totalLogs = habitLogs.length;
  const habitRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  const { statusLabel, checklist } = insightsSufficiency;

  return (
    <div className="space-y-6">
      {/* Top Evidence Summary Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF8F5] via-[#F5F8F6] to-[#FAF7FD] border border-[#E7DFD4] space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF2ED] border border-[#D5E5DA] flex items-center justify-center text-[#5B8266] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D2A26]">
                Evidence-Based Growth Observations
              </h2>
              <p className="text-xs text-[#7A7268]">
                Real-time pattern analysis generated strictly from authenticated Supabase records
              </p>
            </div>
          </div>

          <Badge
            tone={
              statusLabel === 'robust_insights'
                ? 'sage'
                : statusLabel === 'emerging_patterns'
                ? 'lavender'
                : 'stone'
            }
            size="md"
          >
            {statusLabel === 'robust_insights'
              ? 'Verified Patterns'
              : statusLabel === 'emerging_patterns'
              ? 'Emerging Patterns'
              : 'Building Baseline'}
          </Badge>
        </div>

        <p className="text-xs text-[#6B6256] max-w-3xl leading-relaxed pt-1">
          These weekly summaries synthesize your recorded habit consistency with daily mood check-ins. Rather than generic advice or simulated statistics, these observations highlight what actually correlates with calm and high energy in your personal routine.
        </p>
      </div>

      {/* Two Column Grid: Charts on Left, Observations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <WeeklyTrendChart />

          {/* Habit Completion Breakdown Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF2ED] border border-[#D5E5DA] flex items-center justify-center text-[#3D5F47]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2A26]">Routines & Habit Consistency</h3>
                  <p className="text-[11px] text-[#7A7369]">Logged completions across active habits</p>
                </div>
              </div>

              <span className="text-xs font-bold text-[#44654F] px-2.5 py-1 rounded-full bg-[#E5F0E8]">
                {habitRate}% Overall Logged
              </span>
            </div>

            {habits.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE5D8] text-center text-xs text-[#7D756B]">
                No habits added yet. Create routines in the Habits tab to track consistency.
              </div>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => {
                  const logsForHabit = habitLogs.filter((l) => l.habitId === habit.id);
                  const habitDoneCount = logsForHabit.filter((l) => l.completed).length;
                  const habitTotal = logsForHabit.length || 1;
                  const pct = Math.round((habitDoneCount / habitTotal) * 100);

                  return (
                    <div key={habit.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#3B352E]">{habit.title}</span>
                        <span className="text-[11px] text-[#7C746B]">
                          {habitDoneCount} of {habitTotal} days ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#EDE7DF] overflow-hidden">
                        <div
                          className="h-full bg-[#688D72] rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3D352B]">
                <Smile className="w-4 h-4 text-[#8774B8]" />
                <span>Mood Rhythm Status</span>
              </div>
              <div className="text-sm font-extrabold text-[#2E2822] flex items-center gap-1.5">
                {insightsMetrics.moodTrend === 'improving' ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#5B8266]" />
                    <span className="text-[#3D6646]">Upward Lift</span>
                  </>
                ) : insightsMetrics.moodTrend === 'declining' ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-[#C45E5E]" />
                    <span className="text-[#8F3B3B]">Rest Phase</span>
                  </>
                ) : insightsMetrics.recentMoodAverage !== null ? (
                  <>
                    <Minus className="w-4 h-4 text-[#8774B8]" />
                    <span>{insightsMetrics.recentMoodAverage.toFixed(1)} / 10 Steady</span>
                  </>
                ) : (
                  <span className="text-xs text-[#8A8175] font-normal">Building baseline</span>
                )}
              </div>
              <div className="text-[11px] text-[#786F64]">
                {insightsSufficiency.distinctMoodDays > 0
                  ? `Computed from ${insightsSufficiency.distinctMoodDays} daily check-ins`
                  : 'No mood ratings logged yet'}
              </div>
            </Card>

            <Card className="p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3D352B]">
                <Award className="w-4 h-4 text-[#5B8266]" />
                <span>Character Traits</span>
              </div>
              <div className="text-sm font-extrabold text-[#2E2822]">
                {insightsMetrics.activeStrengthsCount} Strengths • {insightsMetrics.activeGrowthAreasCount} Growth
              </div>
              <div className="text-[11px] text-[#786F64]">
                Documented intentional growth areas
              </div>
            </Card>
          </div>
        </div>

        {/* Weekly Observations Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-[#6D655C] uppercase tracking-wider">
              Synthesized Findings
            </h3>
            <span className="text-[11px] font-semibold text-[#8C8377]">
              {insights.length} Pattern{insights.length === 1 ? '' : 's'} Detected
            </span>
          </div>

          {insights.length === 0 ? (
            /* Insufficient data state */
            <Card className="p-5 space-y-4 bg-[#FAF8F5] border-[#E8E1D5]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EDE7F8] flex items-center justify-center text-[#6B5A96] shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2E2822]">
                    Building Your Evidence Baseline
                  </h4>
                  <p className="text-xs text-[#635B50] leading-relaxed mt-1">
                    Smart Insights requires actual recorded history to identify patterns. We strictly refuse to display fake statistics.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EAE3D6]">
                <div className="text-[11px] font-bold text-[#4B4339] uppercase tracking-wider">
                  Signal Requirements:
                </div>
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-[#E9E2D6] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center ${
                          item.isComplete ? 'bg-[#5B8266] text-white' : 'bg-[#EFEAE2] text-[#8C8276]'
                        }`}
                      >
                        {item.isComplete ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <span className="text-[9px] font-bold">
                            {item.current}/{item.target}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-[#3B352D]">{item.label}</span>
                    </div>
                    <span className="text-[11px] text-[#7A7165]">
                      {item.isComplete ? 'Ready' : `${item.target - item.current} more needed`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            insights.map((insight) => (
              <Card
                key={insight.id}
                className="p-5 space-y-3 bg-[#FAF8F5] border-[#E8E1D5] shadow-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
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
                      {insight.type.replace('_', ' ')}
                    </Badge>
                    {insight.metricBadge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2EDE4] text-[#4E473E]">
                        {insight.metricBadge.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8C847A] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {insight.weekLabel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#2E2822]">{insight.title}</h4>
                <p className="text-xs text-[#5D554C] leading-relaxed">{insight.summary}</p>

                <div className="p-3 rounded-xl bg-white border border-[#E9E2D6] space-y-2 text-xs">
                  <div className="text-[11px] text-[#786F64]">
                    <strong className="text-[#3D3730]">Verifiable Log Evidence: </strong>
                    {insight.evidence}
                  </div>
                  {insight.actionableTakeaway && (
                    <div className="pt-2 border-t border-[#F2ECE3] flex items-start gap-2 text-[#466950]">
                      <Sparkles className="w-3.5 h-3.5 text-[#5B8266] shrink-0 mt-0.5" />
                      <div className="text-xs leading-snug">
                        <strong className="font-semibold text-[#30533A]">Actionable Takeaway: </strong>
                        <span>{insight.actionableTakeaway}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}

          <div className="p-4 rounded-2xl bg-[#F6F2EC] border border-[#E8DFD3] flex items-start gap-2.5 text-xs text-[#736A5F]">
            <AlertCircle className="w-4 h-4 text-[#8A7A66] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              All insights are generated from authenticated habit logs, self-reported mood tags, and private personal growth records in your local calendar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
