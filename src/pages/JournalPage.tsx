import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import type { JournalEntry } from '../types';
import { useBetterMe } from '../services/serviceContext';
import { getLocalDateString } from '../utils/dateUtils';

export const JournalPage: React.FC = () => {
  const { journalEntries, journalLoading, journalError, createJournalEntry, updateJournalEntry, deleteJournalEntry } = useBetterMe();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formMoodScore, setFormMoodScore] = useState<number | undefined>(7);
  const [formPrompt, setFormPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Collect unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    journalEntries.forEach((entry) => entry.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [journalEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !selectedDate || entry.date === selectedDate;
      const matchesTag = !selectedTag || entry.tags.includes(selectedTag);
      return matchesSearch && matchesDate && matchesTag;
    });
  }, [journalEntries, searchQuery, selectedDate, selectedTag]);

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setFormTitle('');
    setFormContent('');
    setFormTags('Reflective, Evening');
    setFormMoodScore(7);
    setFormPrompt('What did you discover about yourself today?');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormContent(entry.content);
    setFormTags(entry.tags.join(', '));
    setFormMoodScore(entry.moodScore);
    setFormPrompt(entry.promptUsed || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      const tags = formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingEntry) {
        await updateJournalEntry(editingEntry.id, {
          title: formTitle.trim(),
          content: formContent.trim(),
          tags: tags.length > 0 ? tags : ['General'],
          moodScore: formMoodScore,
          promptUsed: formPrompt.trim() || undefined,
        });
      } else {
        const todayStr = getLocalDateString();
        await createJournalEntry({
          title: formTitle.trim(),
          content: formContent.trim(),
          date: todayStr,
          tags: tags.length > 0 ? tags : ['General'],
          moodScore: formMoodScore,
          promptUsed: formPrompt.trim() || undefined,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save reflection to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionError(null);
    try {
      await deleteJournalEntry(id);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete reflection from database.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Error Banner if any */}
      {(actionError || journalError) && (
        <div className="p-3.5 rounded-2xl bg-[#FFF6F6] border border-[#F2D7D7] flex items-center justify-between text-xs text-[#A34B4B]">
          <span>{actionError || journalError}</span>
          <button
            onClick={() => setActionError(null)}
            className="font-semibold underline ml-2 hover:text-[#7A3333]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Privacy Notice Capsule */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-[#F7F4EE] border border-[#E9E1D3]">
        <div className="flex items-center gap-2.5 text-xs text-[#5C5349]">
          <Lock className="w-4 h-4 text-[#8C7B68] shrink-0" />
          <span>
            <strong>Database Security:</strong> Reflections are protected with user Row Level Security and encrypted SSL in Supabase.
          </span>
          {journalLoading && (
            <span className="text-[#8774B8] font-medium ml-2 animate-pulse">Syncing...</span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Reflection
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C847A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections by title or content keywords..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E4DDD2] bg-[#FAF8F5] text-[#2D2A26] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
            />
          </div>

          {/* Date Picker */}
          <div className="md:col-span-4 relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C847A]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E4DDD2] bg-[#FAF8F5] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
            />
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-medium text-[#7C746B] mr-1">Filter Tag:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                selectedTag === null
                  ? 'bg-[#4A453E] text-white border-[#4A453E]'
                  : 'bg-[#FAF8F5] text-[#675F56] border-[#E5DFD4] hover:bg-[#F2EDE5]'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  selectedTag === tag
                    ? 'bg-[#EDE7F8] text-[#58457E] border-[#D4C7EE] font-semibold'
                    : 'bg-[#FAF8F5] text-[#675F56] border-[#E5DFD4] hover:bg-[#F2EDE5]'
                }`}
              >
                #{tag}
              </button>
            ))}
            {(searchQuery || selectedDate || selectedTag) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDate('');
                  setSelectedTag(null);
                }}
                className="text-[11px] text-[#A64E33] hover:underline ml-auto font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Journal Entries List */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-6 transition-all hover:border-[#DDD5C8]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-base font-bold text-[#2D2A26]">{entry.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#80776C]">
                    <span>{entry.date}</span>
                    {entry.moodScore && (
                      <>
                        <span>•</span>
                        <Badge tone="lavender" size="sm">
                          Mood {entry.moodScore}/10
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 rounded-lg text-[#766E63] hover:text-[#2D2A26] hover:bg-[#F2EDE5] transition-colors"
                    aria-label="Edit journal entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded-lg text-[#9E4D4D] hover:bg-[#FDF0F0] transition-colors"
                    aria-label="Delete journal entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {entry.promptUsed && (
                <div className="mb-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#ECE5DB] flex items-center gap-2 text-xs text-[#6B6155] italic">
                  <Sparkles className="w-3.5 h-3.5 text-[#8774B8] shrink-0" />
                  <span>Prompt: "{entry.promptUsed}"</span>
                </div>
              )}

              <p className="text-sm text-[#4A433A] leading-relaxed whitespace-pre-line">
                {entry.content}
              </p>

              <div className="mt-4 pt-3 border-t border-[#F4EFE9] flex items-center gap-1.5 flex-wrap">
                {entry.tags.map((tag) => (
                  <Badge key={tag} tone="stone" size="sm" icon={<Tag className="w-2.5 h-2.5" />}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-6 h-6 text-[#756A5E]" />}
          title="No reflections found"
          message={
            searchQuery || selectedDate || selectedTag
              ? 'Try relaxing your filter criteria or search terms.'
              : 'Your journal is clear. Take a breath and capture your first thoughts today.'
          }
          action={{
            label: 'Create Reflection',
            onClick: handleOpenCreate,
          }}
        />
      )}

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? 'Edit Mindful Reflection' : 'New Mindful Reflection'}
        description="A private space for untangling thoughts and acknowledging daily small wins."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FFF6F6] border border-[#F2D7D7] text-xs text-[#A34B4B]">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Reflection Title
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Recognizing progress in small routines"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Optional Prompt or Question
            </label>
            <input
              type="text"
              value={formPrompt}
              onChange={(e) => setFormPrompt(e.target.value)}
              placeholder="e.g. What brought a quiet smile today?"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Your Writing
            </label>
            <textarea
              required
              rows={6}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Write candidly and without judging your words..."
              className="w-full text-xs p-3 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A0988E] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#544D45] mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="Health, Peace, Work"
                className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D45] mb-1">
                Associated Mood Score (1-10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formMoodScore || ''}
                onChange={(e) => setFormMoodScore(Number(e.target.value) || undefined)}
                placeholder="7"
                className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2ECE3]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {editingEntry ? 'Update Entry' : 'Save Reflection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
