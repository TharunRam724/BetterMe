import React from 'react';
import { Sparkles, Sun, Moon, Sunset } from 'lucide-react';
import { useBetterMe } from '../../services/serviceContext';

export const WelcomeHeader: React.FC = () => {
  const { preferences, todayMood } = useBetterMe();

  // Dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: <Sun className="w-4 h-4 text-[#D97757]" /> };
    if (hour < 18) return { text: 'Good afternoon', icon: <Sunset className="w-4 h-4 text-[#C48644]" /> };
    return { text: 'Good evening', icon: <Moon className="w-4 h-4 text-[#685591]" /> };
  };

  const greeting = getGreeting();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F6F2EC] via-[#F8F5F0] to-[#F3EFF8] border border-[#ECE5DB] p-6 sm:p-8 shadow-[0_2px_8px_rgba(40,32,20,0.02)]">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-[#E7DFD4] text-xs font-semibold text-[#574F46] mb-3">
            {greeting.icon}
            <span>{greeting.text}, {preferences.name}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#282522]">
            Welcome to your calm space for daily growth.
          </h2>

          <p className="mt-1 text-sm text-[#6B6359] max-w-2xl leading-relaxed">
            Take a slow breath. Notice where you are right now, acknowledge what you have already done today, and move with steady intention.
          </p>
        </div>

        {todayMood ? (
          <div className="shrink-0 bg-white/80 border border-[#E7DFD4] rounded-2xl p-4 min-w-[200px] shadow-sm">
            <span className="text-[11px] font-semibold text-[#7D756C] uppercase tracking-wider block">
              Today's Recorded Mood
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#63518D]">
                {todayMood.score}
              </span>
              <span className="text-xs text-[#8A8177]">/ 10</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#EDE7F8] text-[#5E4B88] ml-auto">
                {todayMood.score >= 8 ? 'Thriving' : todayMood.score >= 6 ? 'Steady' : 'Tender'}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[#6A6258] truncate">
              {todayMood.emotions.join(', ') || 'No emotion labels'}
            </p>
          </div>
        ) : (
          <div className="shrink-0 bg-white/70 border border-dashed border-[#DFD7CB] rounded-2xl p-4 min-w-[200px] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EDE7F8] text-[#6E5D98] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#3D3730]">Mood Unrecorded</p>
              <p className="text-[11px] text-[#787066]">A quick check-in takes 15 seconds</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
