import React from 'react';
import { Menu, Plus, Smile, Calendar, LogOut, User } from 'lucide-react';
import type { NavigationTab } from '../../types';
import { Button } from '../common/Button';
import { useAuth } from '../../services/authContext';
import { useBetterMe } from '../../services/serviceContext';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onOpenQuickJournal: () => void;
  onOpenQuickMood: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenQuickJournal,
  onOpenQuickMood,
}) => {
  const { user, signOut } = useAuth();
  const { preferences } = useBetterMe();

  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Mindful Overview',
      subtitle: 'Gentle tracking of your daily rhythm, habits, and self-reflections.',
    },
    journal: {
      title: 'Personal Journal',
      subtitle: 'Space for unhurried thought, self-inquiry, and emotional unloading.',
    },
    mood: {
      title: 'Daily Mood & Energy',
      subtitle: 'Observe your emotional weather without self-judgment.',
    },
    habits: {
      title: 'Consistent Habits',
      subtitle: 'Small, repeated actions that compound into lasting transformation.',
    },
    traits: {
      title: 'Character Traits',
      subtitle: 'Cultivating strengths and giving deliberate attention to growth areas.',
    },
    insights: {
      title: 'Observations & Patterns',
      subtitle: 'Evidence-based feedback synthesized from your consistency and logs.',
    },
    settings: {
      title: 'Preferences & Privacy',
      subtitle: 'Export records, configure tone, and inspect data boundaries.',
    },
  };

  const currentInfo = titles[currentTab] || {
    title: 'BetterMe',
    subtitle: 'Personal growth companion',
  };

  // Format today's date in friendly calm format
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="bg-[#FAF8F5]/90 backdrop-blur-sm border-b border-[#EAE4DC] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#5F574E] hover:bg-[#EFE9E0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8774B8]"
          aria-label="Open mobile navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#282522]">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-[#7A7268] mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Calm Date Capsule */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2EDE5] border border-[#E3DBD0] text-xs font-medium text-[#655E55]">
          <Calendar className="w-3.5 h-3.5 text-[#8A8174]" />
          <span>{todayFormatted}</span>
        </div>

        {/* Quick Mood Button */}
        <Button
          variant="subtle-lavender"
          size="sm"
          onClick={onOpenQuickMood}
          leftIcon={<Smile className="w-3.5 h-3.5" />}
          className="hidden sm:inline-flex"
        >
          Log Mood
        </Button>

        {/* Quick Journal Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenQuickJournal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          <span className="hidden xs:inline">New Entry</span>
          <span className="xs:hidden">Write</span>
        </Button>

        {/* User Account / Logout */}
        {user && (
          <div className="flex items-center gap-1.5 pl-1 sm:pl-2 sm:border-l sm:border-[#EAE3DA]">
            <span
              title={preferences.name || user.email}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F4EFE9] border border-[#E5DDD2] text-[11px] font-medium text-[#5E564E] max-w-[140px] truncate"
            >
              <User className="w-3 h-3 text-[#7A7167] shrink-0" />
              <span className="truncate">{preferences.name || user.email}</span>
            </span>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              aria-label="Sign out"
              className="p-2 rounded-xl text-[#787066] hover:text-[#9E3939] hover:bg-[#FDF2F2] transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
