import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DevDataBanner } from '../common/DevDataBanner';
import type { NavigationTab } from '../../types';

interface AppLayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenQuickJournal: () => void;
  onOpenQuickMood: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickJournal,
  onOpenQuickMood,
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#2D2A26]">
      {/* Dev Mode & Architecture Notice Banner */}
      <DevDataBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop / Large Screen Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          className="hidden lg:flex"
        />

        {/* Mobile Navigation Drawer & Bottom Bar */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          currentTab={currentTab}
          onSelectTab={onSelectTab}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 lg:pb-8">
          <Header
            currentTab={currentTab}
            onOpenMobileMenu={() => setIsMobileNavOpen(true)}
            onOpenQuickJournal={onOpenQuickJournal}
            onOpenQuickMood={onOpenQuickMood}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
