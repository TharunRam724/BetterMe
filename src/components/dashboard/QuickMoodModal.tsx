import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { MoodEmotion } from '../../types';
import { useBetterMe } from '../../services/serviceContext';

interface QuickMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_EMOTIONS: MoodEmotion[] = [
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

export const QuickMoodModal: React.FC<QuickMoodModalProps> = ({ isOpen, onClose }) => {
  const { todayMood, logMood } = useBetterMe();

  const [score, setScore] = useState<number>(7);
  const [selectedEmotions, setSelectedEmotions] = useState<MoodEmotion[]>(['Calm']);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    if (todayMood) {
      setScore(todayMood.score);
      setSelectedEmotions(todayMood.emotions);
      setNotes(todayMood.notes || '');
    } else {
      setScore(7);
      setSelectedEmotions(['Calm']);
      setNotes('');
    }
  }, [todayMood, isOpen]);

  const toggleEmotion = (emotion: MoodEmotion) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await logMood(score, selectedEmotions, notes.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save mood entry to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Mood & Energy Check-in"
      description="Take a moment to honestly gauge your inner weather on a scale of 1 to 10."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FFF6F6] border border-[#F2D7D7] text-xs text-[#A34B4B]">
            {errorMessage}
          </div>
        )}

        {/* Rating 1 to 10 scale */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-[#544D45] mb-2.5">
            <span>Rating Scale (1 = Depleted, 10 = Flourishing)</span>
            <span className="text-sm font-bold text-[#63518D] px-2 py-0.5 rounded-lg bg-[#EDE7F8]">
              {score} / 10
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = score === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore(num)}
                  aria-label={`Rate mood ${num} of 10`}
                  className={`h-9 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#6B5A96] text-white shadow-sm scale-105 ring-2 ring-[#6B5A96]/20'
                      : 'bg-[#F4EFE9] text-[#554D44] hover:bg-[#EAE4DC]'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Emotions Multiselect */}
        <div>
          <label className="block text-xs font-semibold text-[#544D45] mb-2">
            Emotion Labels (Select all that resonate)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_EMOTIONS.map((emotion) => {
              const isSelected = selectedEmotions.includes(emotion);
              return (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => toggleEmotion(emotion)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
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
            htmlFor="mood-notes"
            className="block text-xs font-semibold text-[#544D45] mb-1.5"
          >
            Optional Context or Gentle Notes
          </label>
          <textarea
            id="mood-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Good sleep, took an early morning walk..."
            className="w-full text-xs p-3 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A39B90] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2ECE3]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Save Mood Rating
          </Button>
        </div>
      </form>
    </Modal>
  );
};
