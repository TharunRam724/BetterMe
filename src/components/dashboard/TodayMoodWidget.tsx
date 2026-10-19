import React from 'react';
import { Smile, Heart, Clock, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useBetterMe } from '../../services/serviceContext';

interface TodayMoodWidgetProps {
  onOpenMoodModal: () => void;
  onNavigateToMood: () => void;
}

export const TodayMoodWidget: React.FC<TodayMoodWidgetProps> = ({
  onOpenMoodModal,
  onNavigateToMood,
}) => {
  const { todayMood } = useBetterMe();

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#685591]">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D2A26]">Daily Emotional Pulse</h3>
              <p className="text-[11px] text-[#7A7369]">Honest, mindful reflection</p>
            </div>
          </div>

          <button
            onClick={onNavigateToMood}
            className="text-xs text-[#6B5A96] hover:text-[#52417A] font-semibold flex items-center gap-1 transition-colors"
          >
            <span>History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayMood ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FBF9FD] border border-[#ECE5F6]">
              <div className="w-12 h-12 rounded-xl bg-[#EDE7F8] text-[#63518D] font-extrabold text-2xl flex items-center justify-center shrink-0">
                {todayMood.score}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#302B26]">
                    Rating {todayMood.score} / 10
                  </span>
                  <span className="text-[10px] text-[#867D73] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Today
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {todayMood.emotions.map((em) => (
                    <Badge key={em} tone="lavender" size="sm">
                      {em}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {todayMood.notes && (
              <p className="text-xs text-[#6E665C] bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE5DB] italic leading-relaxed">
                "{todayMood.notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-[#FDFCFA] rounded-2xl border border-dashed border-[#E3DBD0]">
            <Smile className="w-7 h-7 text-[#8B7BB5] mx-auto mb-2 opacity-80" />
            <p className="text-xs font-medium text-[#423C35]">No mood logged yet today</p>
            <p className="text-[11px] text-[#7E766D] mt-0.5 max-w-xs mx-auto">
              Checking in daily helps reveal subtle correlations with sleep and habits.
            </p>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-[#F2ECE3]">
        <Button
          variant={todayMood ? 'secondary' : 'subtle-lavender'}
          size="sm"
          onClick={onOpenMoodModal}
          className="w-full text-xs"
        >
          {todayMood ? 'Update Today\'s Mood' : 'Log Today\'s Mood (1 to 10)'}
        </Button>
      </div>
    </Card>
  );
};
