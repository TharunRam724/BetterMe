import React, { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useBetterMe } from '../../services/serviceContext';
import { getLocalDateString } from '../../utils/dateUtils';

interface QuickJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INSPIRATIONAL_PROMPTS = [
  'What went well today, however small?',
  'Where did I notice tension, and how did I care for it?',
  'What did I learn about my habits or attention?',
  'One person or moment I am genuinely grateful for right now:',
];

export const QuickJournalModal: React.FC<QuickJournalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createJournalEntry, todayMood } = useBetterMe();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(INSPIRATIONAL_PROMPTS[0]);
  const [tagsInput, setTagsInput] = useState('Mindfulness, Evening');
  const [moodScore, setMoodScore] = useState<number | undefined>(todayMood?.score || 7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const todayStr = getLocalDateString();
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await createJournalEntry({
        title: title.trim(),
        content: content.trim(),
        date: todayStr,
        tags: tags.length > 0 ? tags : ['Reflection'],
        moodScore,
        promptUsed: selectedPrompt,
      });

      setTitle('');
      setContent('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save reflection to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mindful Journal Entry"
      description="Reflect honestly on your day. Privately stored for your account."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#FFF6F6] border border-[#F2D7D7] text-xs text-[#A34B4B]">
            {errorMessage}
          </div>
        )}

        {/* Strict privacy banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0E8] border border-[#E7DFD2] text-[11px] text-[#695F54]">
          <Lock className="w-3.5 h-3.5 text-[#8A7966] shrink-0" />
          <span>
            Strict Privacy Notice: In accordance with personal privacy guidelines, entries are kept in local memory and are never saved to unencrypted localStorage.
          </span>
        </div>

        {/* Prompt selector */}
        <div>
          <label className="block text-xs font-semibold text-[#544D45] mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6B5A96]" />
            <span>Gentle Prompt (Optional)</span>
          </label>
          <select
            value={selectedPrompt}
            onChange={(e) => {
              setSelectedPrompt(e.target.value);
              if (!title) {
                setTitle(e.target.value.replace('?', ''));
              }
            }}
            className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#38332D] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
          >
            {INSPIRATIONAL_PROMPTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="journal-title" className="block text-xs font-semibold text-[#544D45] mb-1">
            Reflection Title
          </label>
          <input
            id="journal-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quieting the evening noise"
            className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A39B90] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="journal-content" className="block text-xs font-semibold text-[#544D45] mb-1">
            Your Reflection
          </label>
          <textarea
            id="journal-content"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely and without self-censorship..."
            className="w-full text-xs p-3 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] placeholder-[#A39B90] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white resize-none leading-relaxed"
          />
        </div>

        {/* Tags & Mood score row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="journal-tags" className="block text-xs font-semibold text-[#544D45] mb-1">
              Tags (comma separated)
            </label>
            <input
              id="journal-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Habits, Calm, Learning"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
            />
          </div>

          <div>
            <label htmlFor="journal-mood" className="block text-xs font-semibold text-[#544D45] mb-1">
              Associated Mood Score (1-10)
            </label>
            <input
              id="journal-mood"
              type="number"
              min={1}
              max={10}
              value={moodScore || ''}
              onChange={(e) => setMoodScore(Number(e.target.value) || undefined)}
              placeholder="7"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
            />
          </div>
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
            Save Reflection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
