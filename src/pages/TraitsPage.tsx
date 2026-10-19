import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Archive,
  CheckCircle,
  Target,
  RefreshCw,
  AlertCircle,
  Loader2,
  Database,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import type { Trait, TraitType } from '../types';
import { useBetterMe } from '../services/serviceContext';

export const TraitsPage: React.FC = () => {
  const {
    traits,
    traitsLoading,
    traitsError,
    refreshTraits,
    createTrait,
    updateTrait,
    deleteTrait,
    backendProvider,
  } = useBetterMe();

  const [activeTab, setActiveTab] = useState<TraitType>('strength');
  const [showArchived, setShowArchived] = useState(false);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrait, setEditingTrait] = useState<Trait | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<TraitType>('strength');
  const [formCategory, setFormCategory] = useState<'mindset' | 'emotional' | 'habits' | 'interpersonal'>('mindset');
  const [formFocusPractice, setFormFocusPractice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const displayedTraits = traits.filter((t) => {
    const matchesArchived = showArchived ? t.isArchived : !t.isArchived;
    return matchesArchived && t.type === activeTab;
  });

  const handleOpenCreate = (defaultType = activeTab) => {
    setEditingTrait(null);
    setFormName('');
    setFormDescription('');
    setFormType(defaultType);
    setFormCategory('mindset');
    setFormFocusPractice('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trait: Trait) => {
    setEditingTrait(trait);
    setFormName(trait.name);
    setFormDescription(trait.description);
    setFormType(trait.type);
    setFormCategory(trait.category);
    setFormFocusPractice(trait.focusPractice || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) return;

    setFormError(null);
    setPageError(null);
    setIsSubmitting(true);
    try {
      if (editingTrait) {
        await updateTrait(editingTrait.id, {
          name: formName.trim(),
          description: formDescription.trim(),
          type: formType,
          category: formCategory,
          focusPractice: formFocusPractice.trim() || undefined,
        });
      } else {
        await createTrait({
          name: formName.trim(),
          description: formDescription.trim(),
          type: formType,
          category: formCategory,
          focusPractice: formFocusPractice.trim() || undefined,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Verify database connection and policies.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the trait "${name}" from Supabase?`)) {
      return;
    }
    setPageError(null);
    try {
      await deleteTrait(id);
    } catch (err: any) {
      setPageError(`Failed to delete "${name}": ${err.message}`);
    }
  };

  const handleToggleArchive = async (trait: Trait) => {
    setPageError(null);
    try {
      await updateTrait(trait.id, { isArchived: !trait.isArchived });
    } catch (err: any) {
      setPageError(`Failed to update archive status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real Supabase Connection Indicator & Error Banner */}
      {traitsError && (
        <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start justify-between gap-3 text-xs text-[#9E3939]">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Supabase Database Error:</p>
              <p className="mt-0.5">{traitsError}</p>
            </div>
          </div>
          <button
            onClick={() => refreshTraits()}
            className="shrink-0 flex items-center gap-1 font-semibold text-[#8C2E2E] hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {pageError && (
        <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start gap-2.5 text-xs text-[#9E3939]">
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

      {/* Header and Toggle Controls */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Positive Strengths vs Growth Areas Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F4EFEA] border border-[#E5DFD4] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('strength')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'strength'
                ? 'bg-white text-[#2D2A26] shadow-xs'
                : 'text-[#6C6359] hover:text-[#2D2A26]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-[#5B8266]" />
            <span>Strengths ({traits.filter((t) => t.type === 'strength' && !t.isArchived).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'growth'
                ? 'bg-white text-[#2D2A26] shadow-xs'
                : 'text-[#6C6359] hover:text-[#2D2A26]'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#8774B8]" />
            <span>Growth Areas ({traits.filter((t) => t.type === 'growth' && !t.isArchived).length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {backendProvider === 'supabase' && (
            <button
              onClick={() => refreshTraits()}
              disabled={traitsLoading}
              title="Refresh traits from Supabase"
              className="p-2 rounded-xl border border-[#E3DBD0] bg-[#FAF8F5] text-[#6E665C] hover:text-[#2D2A26] hover:bg-[#F2ECE3] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${traitsLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

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
            variant={activeTab === 'strength' ? 'subtle-sage' : 'subtle-lavender'}
            size="sm"
            onClick={() => handleOpenCreate(activeTab)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {activeTab === 'strength' ? 'Add Strength' : 'Add Growth Area'}
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {traitsLoading && (
        <div className="p-8 text-center bg-white/60 rounded-3xl border border-[#EAE3DA]">
          <Loader2 className="w-6 h-6 animate-spin text-[#6B5A96] mx-auto mb-2" />
          <p className="text-xs font-medium text-[#6B6359]">Synchronizing traits with Supabase...</p>
        </div>
      )}

      {/* Traits Grid */}
      {!traitsLoading && displayedTraits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTraits.map((trait) => (
            <Card
              key={trait.id}
              className={`p-6 flex flex-col justify-between transition-all ${
                trait.type === 'strength'
                  ? 'bg-gradient-to-br from-white to-[#F8FAF9] border-[#DFEAE2]'
                  : 'bg-gradient-to-br from-white to-[#F9F7FC] border-[#EAE3F5]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#2D2A26]">{trait.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge
                        tone={trait.type === 'strength' ? 'sage' : 'lavender'}
                        size="sm"
                      >
                        {trait.category}
                      </Badge>
                      <span className="text-[11px] text-[#867E74]">
                        {trait.type === 'strength' ? 'Positive Strength' : 'Area for Growth'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(trait)}
                      className="p-1.5 rounded-lg text-[#827A70] hover:text-[#2D2A26] hover:bg-[#F2ECE3] transition-colors"
                      aria-label="Edit trait"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(trait)}
                      className="p-1.5 rounded-lg text-[#827A70] hover:text-[#2D2A26] hover:bg-[#F2ECE3] transition-colors"
                      aria-label={trait.isArchived ? 'Restore trait' : 'Archive trait'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(trait.id, trait.name)}
                      className="p-1.5 rounded-lg text-[#9E4D4D] hover:bg-[#FDF0F0] transition-colors"
                      aria-label="Delete trait"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#5E574F] mt-2 leading-relaxed">
                  {trait.description}
                </p>
              </div>

              {trait.focusPractice && (
                <div className="mt-4 pt-3 border-t border-[#F0EBE2]">
                  <p className="text-[11px] font-semibold text-[#48423A]">
                    Deliberate Practice Rule:
                  </p>
                  <p className="text-xs text-[#6B6256] italic mt-0.5">
                    "{trait.focusPractice}"
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : !traitsLoading ? (
        <EmptyState
          icon={<Sparkles className="w-6 h-6 text-[#756A5E]" />}
          title={`No ${activeTab === 'strength' ? 'positive traits' : 'growth areas'} found`}
          message={
            activeTab === 'strength'
              ? 'Record the virtues and habits you already embody to cultivate healthy self-appreciation.'
              : 'Identify subtle behavioral tendencies you want to observe and consciously gently refine.'
          }
          action={{
            label: activeTab === 'strength' ? 'Add Strength' : 'Add Growth Area',
            onClick: () => handleOpenCreate(activeTab),
          }}
        />
      ) : null}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingTrait
            ? 'Edit Character Trait'
            : formType === 'strength'
            ? 'Add Positive Character Strength'
            : 'Add Growth Area Trait'
        }
        description="Persisted live in your Supabase database traits table with Row Level Security."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F6D0D0] flex items-start gap-2 text-xs text-[#9E3939]">
              <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{formError}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Trait Name
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Active Listening, or Overthinking Decisions"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#544D45] mb-1">
                Classification
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as TraitType)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
              >
                <option value="strength">Positive Strength</option>
                <option value="growth">Trait to Improve</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544D45] mb-1">
                Domain
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
              >
                <option value="mindset">Mindset</option>
                <option value="emotional">Emotional Composure</option>
                <option value="habits">Daily Habits</option>
                <option value="interpersonal">Interpersonal Communication</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Description or Personal Observation
            </label>
            <textarea
              required
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="How this trait manifests in your everyday decisions..."
              className="w-full text-xs p-3 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8] resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D45] mb-1">
              Daily Practice Cue (Actionable Anchor)
            </label>
            <input
              type="text"
              value={formFocusPractice}
              onChange={(e) => setFormFocusPractice(e.target.value)}
              placeholder="e.g. Pause for two seconds before responding in debate"
              className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#F2ECE3]">
            <span className="text-[10px] text-[#867E74] flex items-center gap-1">
              <Database className="w-3 h-3" />
              Stored in Supabase
            </span>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {editingTrait ? 'Save Updates' : 'Save Trait'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
