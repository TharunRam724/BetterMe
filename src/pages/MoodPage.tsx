import React, { useState } from 'react';
import { Smile, Clock, Calendar, Check, MessageSquare } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import type { MoodEmotion } from '../types';
import { useBetterMe } from '../services/serviceContext';

const EMOTIONS: MoodEmotion[] = [
  'Calm',
  'Grateful',
  'Focused',
  'Content',
  'Energized',
  'Reflective',
  'Anxious',
  'Fatigued',
  'Overwhelmed',
  'Restless',
];

export const MoodPage: React.FC = () => {
  const { moods, todayMood, logMood } = useBetterMe();

  const [score, setScore] = useState<number>(todayMood?.score || 7);
  const [selectedEmotions, setSelectedEmotions] = useState<MoodEmotion[]>(
    todayMood?.emotions || ['Calm', 'Focused']
  );
  const [notes, setNotes] = useState<string>(todayMood?.notes || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleEmotion = (e: MoodEmotion) => {
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((item) => item !== e) : [...prev, e]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await logMood(score, selectedEmotions, notes.trim() || undefined);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save mood entry to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#685591]">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#2D2A26]">
                  {todayMood ? "Update Today's Rating" : "Log Today's Mood & Energy"}
                </h2>
                <p className="text-xs text-[#7A7369]">
                  Scale 1 (Deeply Depleted) to 10 (Thriving & Centered)
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-[#FFF6F6] border border-[#F2D7D7] text-xs text-[#A34B4B]">
                  {errorMessage}
                </div>
              )}

              {/* Scale Selector */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#544D45] mb-3">
                  <span>Selected Score:</span>
                  <span className="text-sm font-bold text-[#63518D] px-2.5 py-1 rounded-xl bg-[#EDE7F8]">
                    {score} / 10
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = score === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setScore(num)}
                        aria-label={`Select mood rating ${num} of 10`}
                        className={`h-11 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-[#6B5A96] text-white shadow-md scale-105 ring-2 ring-[#6B5A96]/20'
                            : 'bg-[#F4EFE9] text-[#554D44] hover:bg-[#EAE4DC]'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emotion Labels */}
              <div>
                <label className="block text-xs font-semibold text-[#544D45] mb-2.5">
                  Emotion & Energy Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map((emotion) => {
                    const isSelected = selectedEmotions.includes(emotion);
                    return (
                      <button
                        key={emotion}
                        type="button"
                        onClick={() => toggleEmotion(emotion)}
                        className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-[#EDE7F8] border-[#D4C6EE] text-[#5C4A82] font-semibold shadow-xs'
                            : 'bg-[#FAF8F5] border-[#E6E0D6] text-[#696157] hover:bg-[#F2ECE3]'
                        }`}
                      >
                        {emotion}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label
                  htmlFor="mood-page-notes"
                  className="block text-xs font-semibold text-[#544D45] mb-1.5"
                >
                  Optional Notes (Sleep quality, context, observations)
                </label>
                <textarea
                  id="mood-page-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Felt rested after 8 hours sleep; productive work session without rushing..."
                  className="w-full text-xs p-3 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A39B90] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {isSaved ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#416B4A] font-medium bg-[#E8F3EB] px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    Today's mood updated
                  </span>
                ) : (
                  <span className="text-[11px] text-[#857C72]">
                    Updates reflect immediately in trend charts.
                  </span>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                >
                  Save Daily Rating
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Trend Chart Column */}
        <div className="lg:col-span-5 space-y-6">
          <WeeklyTrendChart />
        </div>
      </div>

      {/* Mood History Timeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#7B6E60]" />
            <h3 className="text-sm font-bold text-[#2D2A26]">Recent Mood Records</h3>
          </div>
          <span className="text-xs text-[#827A70]">{moods.length} total entries</span>
        </div>

        <div className="space-y-3">
          {moods.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-[#FCFAF7] border border-[#ECE5DB] gap-3"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EDE7F8] text-[#63518D] font-extrabold text-base flex items-center justify-center shrink-0">
                  {entry.score}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#2F2A25]">{entry.date}</span>
                    <span className="text-[10px] text-[#8C847A] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Scale {entry.score}/10
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.emotions.map((em) => (
                      <Badge key={em} tone="lavender" size="sm">
                        {em}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {entry.notes && (
                <div className="sm:max-w-xs text-xs text-[#6C6359] italic bg-white/70 px-3 py-1.5 rounded-xl border border-[#ECE5DB] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#91877A] shrink-0" />
                  <span className="truncate">"{entry.notes}"</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
