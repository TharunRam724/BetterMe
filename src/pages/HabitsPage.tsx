import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Archive,
  Edit3,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
  Database,
  Trash2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import type { Habit, HabitCategory } from '../types';
import { useBetterMe } from '../services/serviceContext';
import { getLocalDateString } from '../utils/dateUtils';

const CATEGORIES: { id: HabitCategory; label: string }[] = [
  { id: 'health', label: 'Physical Health' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'focus', label: 'Focus & Productivity' },
  { id: 'learning', label: 'Learning' },
  { id: 'connection', label: 'Connection' },
];

export const HabitsPage: React.FC = () => {
  const {
    habits,
    habitLogs,
    habitsLoading,
    habitsError,
    refreshHabits,
    toggleHabitCompletion,
    createHabit,
    updateHabit,
    deleteHabit,
    backendProvider,
  } = useBetterMe();

  const [targetDate, setTargetDate] = useState<string>(getLocalDateString());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<HabitCategory>('mindfulness');
  const [formFrequency, setFormFrequency] = useState<'daily' | 'weekly'>('daily');
  const [formTargetDays, setFormTargetDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const displayedHabits = habits.filter((h) => {
    const matchesArchived = showArchived ? h.isArchived : !h.isArchived;
    const matchesCategory = filterCategory === 'all' || h.category === filterCategory;
    return matchesArchived && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('health');
    setFormFrequency('daily');
    setFormTargetDays(7);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormTitle(habit.title);
    setFormDescription(habit.description || '');
    setFormCategory(habit.category);
    setFormFrequency(habit.frequency);
    setFormTargetDays(habit.targetDaysPerWeek);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setFormError(null);
    setPageError(null);
    setIsSubmitting(true);
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          category: formCategory,
          frequency: formFrequency,
          targetDaysPerWeek: formTargetDays,
        });
      } else {
        await createHabit({
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          category: formCategory,
          frequency: formFrequency,
          targetDaysPerWeek: formTargetDays,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save habit to Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCompletion = async (habitId: string) => {
    setPageError(null);
    try {
      await toggleHabitCompletion(habitId, targetDate);
    } catch (err: any) {
      setPageError(`Failed to update completion: ${err.message}`);
    }
  };

  const handleToggleArchive = async (habit: Habit) => {
    setPageError(null);
    try {
      await updateHabit(habit.id, { isArchived: !habit.isArchived });
    } catch (err: any) {
      setPageError(`Failed to update archive status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the habit "${title}" from Supabase?`)) {
      return;
    }
    setPageError(null);
    try {
      await deleteHabit(id);
    } catch (err: any) {
      setPageError(`Failed to delete habit: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Error Banner */}
      {habitsError && (
        <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start justify-between gap-3 text-xs text-[#9E3939] animate-in fade-in duration-150">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Supabase Habits Error:</p>
              <p className="mt-0.5">{habitsError}</p>
            </div>
          </div>
          <button
            onClick={() => refreshHabits()}
            className="shrink-0 flex items-center gap-1 font-semibold text-[#8C2E2E] hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {pageError && (
        <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start gap-2.5 text-xs text-[#9E3939] animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
          <p className="flex-1">{pageError}</p>
          <button
            onClick={() => setPageError(null)}
            className="text-[11px] font-semibold text-[#8C2E2E] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <Card className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#7A6F62]" />
            <span className="text-xs font-semibold text-[#48423B]">Viewing Date:</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-[#E3DBD0] bg-[#FAF8F5] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
            />
          </div>

          {targetDate !== getLocalDateString() && (
            <button
              onClick={() => setTargetDate(getLocalDateString())}
              className="text-[11px] font-semibold text-[#5B8266] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {backendProvider === 'supabase' && (
            <button
              onClick={() => refreshHabits()}
              disabled={habitsLoading}
              title="Refresh habits from Supabase"
              className="p-2 rounded-xl border border-[#E3DBD0] bg-[#FAF8F5] text-[#6E665C] hover:text-[#2D2A26] hover:bg-[#F2ECE3] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${habitsLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-[#E3DBD0] bg-[#FAF8F5] text-[#3B352E] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
              showArchived
                ? 'bg-[#EAE4DC] border-[#DDD5C9] text-[#302B25] font-semibold'
                : 'bg-[#FAF8F5] border-[#E3DBD0] text-[#696157] hover:bg-[#F2ECE3]'
            }`}
          >
            {showArchived ? 'Viewing Archived' : 'Show Archived'}
          </button>

          <Button
            variant="subtle-sage"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Habit
          </Button>
        </div>
      </Card>

      {/* Loading state */}
      {habitsLoading && (
        <div className="p-8 text-center bg-white/60 rounded-3xl border border-[#EAE3DA]">
          <Loader2 className="w-6 h-6 animate-spin text-[#5B8266] mx-auto mb-2" />
          <p className="text-xs font-medium text-[#6B6359]">Synchronizing habits with Supabase...</p>
        </div>
      )}

      {/* Habits Grid */}
      {!habitsLoading && displayedHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedHabits.map((habit) => {
            const isCompleted = habitLogs.some(
              (l) => l.habitId === habit.id && l.date === targetDate && l.completed
            );

            return (
              <Card
                key={habit.id}
                className={`p-5 transition-all flex flex-col justify-between ${
                  isCompleted ? 'bg-[#FAFCFA] border-[#D7E8DC]' : 'hover:border-[#DDD4C7]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCompletion(habit.id)}
                        aria-label={`Toggle completion for ${habit.title}`}
                        className={`transition-colors shrink-0 ${
                          isCompleted ? 'text-[#486952]' : 'text-[#A0988E] hover:text-[#5B8266]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 fill-[#E2EFE5]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <h3
                        className={`text-sm font-bold text-[#2D2A26] ${
                          isCompleted ? 'line-through text-[#666057]' : ''
                        }`}
                      >
                        {habit.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(habit)}
                        className="p-1.5 rounded-lg text-[#827A70] hover:text-[#2D2A26] hover:bg-[#F2ECE3] transition-colors"
                        aria-label="Edit habit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleArchive(habit)}
                        className="p-1.5 rounded-lg text-[#827A70] hover:text-[#2D2A26] hover:bg-[#F2ECE3] transition-colors"
                        aria-label={habit.isArchived ? 'Restore habit' : 'Archive habit'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id, habit.title)}
                        className="p-1.5 rounded-lg text-[#9E4D4D] hover:bg-[#FDF0F0] transition-colors"
                        aria-label="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {habit.description && (
                    <p className="text-xs text-[#70685E] ml-7 mb-3 leading-relaxed">
                      {habit.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#F2ECE3] mt-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="sage" size="sm">
                      {habit.category}
                    </Badge>
                    <span className="text-[11px] text-[#857D74]">
                      {habit.frequency === 'daily' ? 'Daily' : `${habit.targetDaysPerWeek}x/week`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#7A7165]">
                    {habit.currentStreak > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-[#8C5D3D] bg-[#FCF2EE] px-2 py-0.5 rounded-md border border-[#F4DACF]">
                        <Flame className="w-3 h-3 text-[#D97757]" />
                        {habit.currentStreak} day streak
                      </span>
                    )}
                    <span>Best: {habit.longestStreak}d</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : !habitsLoading ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6 text-[#756A5E]" />}
          title={showArchived ? 'No archived habits' : 'No habits found in Supabase'}
          message={
            showArchived
              ? 'Archived routines will appear here when you store inactive habits.'
              : 'Add your first intentional routine to save it to your Supabase account.'
          }
          action={{
            label: 'Add Habit',
            onClick: handleOpenCreate,
          }}
        />
      ) : null}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
        description="Persisted live in your Supabase database habits table."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start gap-2 text-xs text-[#9E3939] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{formError}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. 5-Minute Evening Wind-down"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Habit Trigger or Cue (Optional)
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. After brushing teeth before getting into bed"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#544D45] mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as HabitCategory)}
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
                Frequency
              </label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value as 'daily' | 'weekly')}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5B8266]"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#F2ECE3]">
            {backendProvider === 'supabase' ? (
              <span className="text-[10px] text-[#7A7369] flex items-center gap-1">
                <Database className="w-3 h-3 text-[#5B8266]" />
                Saves to Supabase habits table
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="subtle-sage" size="sm" isLoading={isSubmitting}>
                {editingHabit ? 'Save Changes' : 'Create Habit'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
