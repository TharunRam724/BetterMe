import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Smile, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '../common/Card';
import { useBetterMe } from '../../services/serviceContext';
import { getLastNDaysLocal, formatShortDay } from '../../utils/dateUtils';

interface WeeklyTrendChartProps {
  onOpenMoodModal?: () => void;
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ onOpenMoodModal }) => {
  const { moods, moodsLoading, moodsError, refreshMoods } = useBetterMe();
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');

  const daysCount = timeframe === '7d' ? 7 : 30;
  const daysRange = useMemo(() => getLastNDaysLocal(daysCount), [daysCount]);

  // Map mood records by date
  const moodMap = useMemo(() => {
    const map = new Map<string, { score: number; emotions: string[]; notes?: string }>();
    for (const m of moods) {
      if (m.date) {
        map.set(m.date, {
          score: m.score,
          emotions: m.emotions || [],
          notes: m.notes,
        });
      }
    }
    return map;
  }, [moods]);

  // Prepare chart data points for the timeframe
  const chartData = useMemo(() => {
    return daysRange.map((dateStr) => {
      const entry = moodMap.get(dateStr);
      return {
        date: dateStr,
        day: formatShortDay(dateStr),
        score: entry ? entry.score : null,
        emotions: entry ? entry.emotions.join(', ') : '',
        hasData: Boolean(entry),
      };
    });
  }, [daysRange, moodMap]);

  // Actual entries within selected timeframe
  const entriesInTimeframe = useMemo(() => {
    return moods.filter((m) => daysRange.includes(m.date));
  }, [moods, daysRange]);

  const averageScore = useMemo(() => {
    if (entriesInTimeframe.length === 0) return null;
    const sum = entriesInTimeframe.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / entriesInTimeframe.length).toFixed(1);
  }, [entriesInTimeframe]);

  const maxScore = useMemo(() => {
    if (entriesInTimeframe.length === 0) return null;
    return Math.max(...entriesInTimeframe.map((m) => m.score));
  }, [entriesInTimeframe]);

  const minScore = useMemo(() => {
    if (entriesInTimeframe.length === 0) return null;
    return Math.min(...entriesInTimeframe.map((m) => m.score));
  }, [entriesInTimeframe]);

  return (
    <Card className="p-6">
      {/* Top Header & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#685591]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D2A26]">Emotional Rhythm & Trends</h3>
            <p className="text-[11px] text-[#7A7369]">
              {timeframe === '7d' ? '7-Day' : '30-Day'} Observed ratings (Scale 1–10) •{' '}
              {averageScore !== null ? (
                <>
                  avg: <span className="font-semibold text-[#574480]">{averageScore} / 10</span>
                  {maxScore !== null && minScore !== null && (
                    <span className="text-[#8B847A] ml-1">
                      (range {minScore}–{maxScore})
                    </span>
                  )}
                </>
              ) : (
                <span className="italic text-[#9C9388]">No logs in this range</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe Toggle Buttons */}
          <div className="flex items-center bg-[#F4EFEA] p-0.5 rounded-xl border border-[#E8E2D6] text-xs">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeframe === '7d'
                  ? 'bg-white text-[#2D2A26] shadow-sm font-bold'
                  : 'text-[#7D756C] hover:text-[#2D2A26]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeframe === '30d'
                  ? 'bg-white text-[#2D2A26] shadow-sm font-bold'
                  : 'text-[#7D756C] hover:text-[#2D2A26]'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={() => refreshMoods()}
            title="Refresh mood data from Supabase"
            aria-label="Refresh mood records"
            className="p-1.5 rounded-xl text-[#7A7266] hover:text-[#2D2A26] hover:bg-[#F2ECE3] border border-transparent hover:border-[#E5DDD0] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${moodsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {moodsLoading && moods.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center gap-2 text-xs text-[#7A7369]">
          <Loader2 className="w-5 h-5 animate-spin text-[#8774B8]" />
          <span>Fetching your mood logs from Supabase...</span>
        </div>
      ) : moodsError ? (
        <div className="h-56 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FFF6F6] border border-[#F2D7D7] text-center">
          <p className="text-xs text-[#A34B4B] font-medium">{moodsError}</p>
          <button
            onClick={() => refreshMoods()}
            className="mt-2 text-xs font-semibold text-[#8B3A3A] underline"
          >
            Try reloading
          </button>
        </div>
      ) : entriesInTimeframe.length === 0 ? (
        /* Honest empty state when no mood entries exist */
        <div className="h-56 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#FCFAF7] border border-[#ECE5DB] text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#685591]">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2E2A25]">No Mood Entries in this Period</h4>
            <p className="text-[11px] text-[#7A7369] mt-0.5 max-w-sm">
              You haven't logged your daily mood for this {timeframe === '7d' ? 'week' : 'month'}.
              Record your energy to visualize trends and emotional baselines.
            </p>
          </div>
          {onOpenMoodModal && (
            <button
              onClick={onOpenMoodModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#EDE7F8] hover:bg-[#E2D8F2] text-[#55427C] text-xs font-semibold border border-[#D9CDEE] transition-all"
            >
              + Log Today's Mood
            </button>
          )}
        </div>
      ) : (
        /* Chart Display */
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="moodPastelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8774B8" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#8774B8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECE7DF" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#E8E2D8' }}
                tick={{ fill: '#7C746B', fontSize: timeframe === '7d' ? 11 : 9 }}
                interval={timeframe === '7d' ? 0 : 3}
              />
              <YAxis
                domain={[1, 10]}
                ticks={[2, 4, 6, 8, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8C847A', fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    if (data.score === null) {
                      return (
                        <div className="bg-white/95 backdrop-blur-sm border border-[#E8E1D5] p-2.5 rounded-xl shadow-[0_4px_12px_rgba(40,32,20,0.06)] text-xs">
                          <p className="font-semibold text-[#665D53]">{data.date}</p>
                          <p className="text-[11px] text-[#91867A] italic mt-0.5">No rating logged</p>
                        </div>
                      );
                    }
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-[#E8E1D5] p-2.5 rounded-xl shadow-[0_4px_12px_rgba(40,32,20,0.06)] text-xs">
                        <p className="font-semibold text-[#2D2A26] flex items-center justify-between gap-3">
                          <span>{data.date} ({data.day})</span>
                          <span className="text-[#63518D] font-bold text-sm">{data.score} / 10</span>
                        </p>
                        {data.emotions && (
                          <p className="text-[11px] text-[#736B62] mt-1 max-w-[200px]">
                            {data.emotions}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                connectNulls={true}
                stroke="#725E9E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#moodPastelGradient)"
                activeDot={{ r: 5, fill: '#63518D', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
