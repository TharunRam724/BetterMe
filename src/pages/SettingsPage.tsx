import React, { useState } from 'react';
import {
  Download,
  Trash2,
  RotateCcw,
  Shield,
  Database,
  Lock,
  User,
  Check,
  FileText,
  LogOut,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useBetterMe } from '../services/serviceContext';
import { useAuth } from '../services/authContext';
import type { MoodEntry, Habit } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    preferences,
    updatePreferences,
    resetAllDevData,
    exportDataJSON,
    journalEntries,
    habits,
    moods,
    traits,
  } = useBetterMe();

  const [nameInput, setNameInput] = useState(preferences.name);
  const [lastPrefName, setLastPrefName] = useState(preferences.name);
  const [reminderTime, setReminderTime] = useState(preferences.dailyReminderTime);
  const [lastReminderTime, setLastReminderTime] = useState(preferences.dailyReminderTime);
  const [gentlePrompts, setGentlePrompts] = useState(preferences.enableGentlePrompts);
  const [lastGentlePrompts, setLastGentlePrompts] = useState(preferences.enableGentlePrompts);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sync input values if preferences update from remote Supabase fetch or storage
  if (preferences.name !== lastPrefName) {
    setLastPrefName(preferences.name);
    setNameInput(preferences.name);
  }
  if (preferences.dailyReminderTime !== lastReminderTime) {
    setLastReminderTime(preferences.dailyReminderTime);
    setReminderTime(preferences.dailyReminderTime);
  }
  if (preferences.enableGentlePrompts !== lastGentlePrompts) {
    setLastGentlePrompts(preferences.enableGentlePrompts);
    setGentlePrompts(preferences.enableGentlePrompts);
  }

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaved(false);
    setIsSaving(true);

    try {
      const trimmedName = nameInput.trim() || 'Friend';
      await updatePreferences({
        name: trimmedName,
        dailyReminderTime: reminderTime,
        enableGentlePrompts: gentlePrompts,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
      setSaveError(err.message || 'Failed to save preferences to database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Download complete JSON backup
  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `betterme-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download CSV export of habit streaks and mood scores
  const handleExportCSV = () => {
    let csvContent = 'Date,Type,TitleOrScore,EmotionsOrCategory\n';
    moods.forEach((m: MoodEntry) => {
      csvContent += `${m.date},Mood,${m.score},"${m.emotions.join(';')}"\n`;
    });
    habits.forEach((h: Habit) => {
      csvContent += `${h.createdAt.split('T')[0]},Habit,"${h.title}",${h.category}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `betterme-summary-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Supabase Account Status Card */}
      {user && (
        <Card className="p-6 sm:p-8 bg-gradient-to-r from-white via-[#FAFBF9] to-[#F3F7F4] border-[#DCE8DE]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E2EFE5] border border-[#CFE4D4] flex items-center justify-center text-[#3D6948]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#282522]">Supabase Account Active</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2EFE5] text-[#2E5A37]">
                    Authenticated
                  </span>
                </div>
                <p className="text-xs text-[#5C554D] mt-0.5 font-medium">{user.email}</p>
                <p className="text-[10px] text-[#8A8177] font-mono mt-0.5">UID: {user.id}</p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => signOut()}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-[#8A8177]" />}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      )}

      {/* Account Preferences Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#685591]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2A26]">Personal Preferences</h2>
            <p className="text-xs text-[#7A7369]">Configure how BetterMe addresses and assists you.</p>
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-5">
          {saveError && (
            <div className="p-3.5 rounded-2xl bg-[#FFF6F6] border border-[#F2D7D7] flex items-start gap-2.5 text-xs text-[#A34B4B] animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-[#C24141] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{saveError}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pref-name" className="block text-xs font-semibold text-[#544D45] mb-1">
                Preferred Display Name
              </label>
              <input
                id="pref-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="pref-reminder" className="block text-xs font-semibold text-[#544D45] mb-1">
                Evening Reflection Target Time
              </label>
              <input
                id="pref-reminder"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E3DBD0] bg-[#FCFAF7] text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#8774B8] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#ECE5DB]">
            <input
              id="pref-prompts"
              type="checkbox"
              checked={gentlePrompts}
              onChange={(e) => setGentlePrompts(e.target.checked)}
              className="w-4 h-4 rounded text-[#6B5A96] focus:ring-[#8774B8] border-[#D4CCD5]"
            />
            <label htmlFor="pref-prompts" className="text-xs text-[#524B43] cursor-pointer">
              Show subtle daily mindfulness prompts and inspirational principles
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved && !saveError ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#416B4A] font-medium bg-[#E8F3EB] px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                Preferences updated
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" size="sm" isLoading={isSaving} disabled={isSaving}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Privacy & Architecture Boundaries */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF2ED] border border-[#D5E5DA] flex items-center justify-center text-[#3D5F47]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2A26]">Privacy & Row-Level Security</h2>
            <p className="text-xs text-[#7A7369]">Honest data boundary commitments</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#5A5248]">
          <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#ECE5DC] flex items-start gap-3">
            <Lock className="w-4 h-4 text-[#8C765C] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#353029]">In-Memory Journal Privacy</p>
              <p className="mt-1 leading-relaxed text-[#6E655B]">
                Your personal journal reflections ({journalEntries.length} currently in session) are never written to unencrypted browser localStorage.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FCFAF7] border border-[#ECE5DC] flex items-start gap-3">
            <Database className="w-4 h-4 text-[#8C765C] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#353029]">Real Supabase Traits Table Integration</p>
              <p className="mt-1 leading-relaxed text-[#6E655B]">
                Your {traits.length} character traits are stored live on <code className="px-1.5 py-0.5 rounded bg-[#EFEAE2] font-mono text-[11px]">public.traits</code>. Row Level Security policies guarantee that only your account (<code className="font-mono text-[10px]">{user?.email || 'authenticated user'}</code>) can read, insert, update, or delete your traits.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Export Controls */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#F6F1EA] border border-[#E9DFC0]/60 flex items-center justify-center text-[#735A38]">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D2A26]">Data Export & Backup</h2>
            <p className="text-xs text-[#7A7369]">You always own 100% of your records.</p>
          </div>
        </div>

        <p className="text-xs text-[#6B6358] leading-relaxed">
          Export your records at any time. The JSON archive contains all habit definitions, mood ratings, character traits, and private reflections.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Complete Backup (JSON)
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            Export Summary (CSV)
          </Button>
        </div>
      </Card>

      {/* Deletion & Reset Controls */}
      <Card className="p-6 sm:p-8 border-[#F4DCDA] bg-[#FEFBFB]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDF0EF] border border-[#F6D2CF] flex items-center justify-center text-[#9E3939]">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#3B2626]">Reset Controls</h2>
            <p className="text-xs text-[#8C6B6B]">Restore initial seeds or clear session state</p>
          </div>
        </div>

        <p className="text-xs text-[#786161] leading-relaxed mb-4">
          Resetting will restore habits, moods, and reflections to the initial development sample seeds.
        </p>

        {isResetConfirmOpen ? (
          <div className="p-4 rounded-2xl bg-white border border-[#F3CDCA] space-y-3">
            <p className="text-xs font-semibold text-[#8C2C2C]">
              Are you sure? This will replace your active session edits with the initial development seeds.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  resetAllDevData();
                  setIsResetConfirmOpen(false);
                }}
              >
                Yes, Reset Sample Data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset to Initial Dev Seeds
          </Button>
        )}
      </Card>
    </div>
  );
};
