import React, { useState } from 'react';
import { AlertCircle, Database } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { HabitCategory } from '../../types';
import { useBetterMe } from '../../services/serviceContext';

interface QuickHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: HabitCategory; label: string }[] = [
  { id: 'health', label: 'Physical Health' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'focus', label: 'Focus & Work' },
  { id: 'learning', label: 'Learning' },
  { id: 'connection', label: 'Connection' },
];

export const QuickHabitModal: React.FC<QuickHabitModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createHabit, backendProvider } = useBetterMe();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('mindfulness');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await createHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        frequency,
        targetDaysPerWeek,
      });

      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save habit to Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Intentional Habit"
      description="Choose a small, clearly defined action you wish to repeat consistently."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start gap-2 text-xs text-[#9E3939] animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        <div>
          <label htmlFor="habit-title" className="block text-xs font-semibold text-[#544D45] mb-1">
            Habit Name
          </label>
          <input
            id="habit-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 10-Minute Morning Sunlight Walk"
            className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A39B90] focus:outline-none focus:ring-2 focus:ring-[#5B8266] focus:bg-white"
          />
        </div>

        <div>
          <label htmlFor="habit-desc" className="block text-xs font-semibold text-[#544D45] mb-1">
            Brief Purpose or Cue (Optional)
          </label>
          <input
            id="habit-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Immediately after brewing morning tea"
            className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A39B90] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Frequency Target
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setFrequency('daily');
                  setTargetDaysPerWeek(7);
                }}
                className={`flex-1 text-xs py-2 px-3 rounded-xl border transition-all ${
                  frequency === 'daily'
                    ? 'bg-[#EAF2ED] border-[#CDE1D3] text-[#3D5F47] font-semibold'
                    : 'bg-[#FCFAF7] border-[#E3DBD0] text-[#696157]'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => {
                  setFrequency('weekly');
                  setTargetDaysPerWeek(3);
                }}
                className={`flex-1 text-xs py-2 px-3 rounded-xl border transition-all ${
                  frequency === 'weekly'
                    ? 'bg-[#EAF2ED] border-[#CDE1D3] text-[#3D5F47] font-semibold'
                    : 'bg-[#FCFAF7] border-[#E3DBD0] text-[#696157]'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F2ECE3]">
          {backendProvider === 'supabase' ? (
            <span className="text-[10px] text-[#7A7369] flex items-center gap-1">
              <Database className="w-3 h-3 text-[#5B8266]" />
              Saves directly to Supabase
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="subtle-sage"
              size="sm"
              isLoading={isSubmitting}
            >
              Create Habit
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
