import React, { useState } from 'react';
import { Feather, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './services/authContext';
import { ServiceProvider } from './services/serviceContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { JournalPage } from './pages/JournalPage';
import { MoodPage } from './pages/MoodPage';
import { HabitsPage } from './pages/HabitsPage';
import { TraitsPage } from './pages/TraitsPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuickMoodModal } from './components/dashboard/QuickMoodModal';
import { QuickJournalModal } from './components/dashboard/QuickJournalModal';
import type { NavigationTab } from './types';

export const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isQuickMoodOpen, setIsQuickMoodOpen] = useState(false);
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);

  // 1. Loading splash while persistent session is verified
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#6B5A96] mb-3 shadow-[0_4px_12px_rgba(107,90,150,0.12)]">
          <Feather className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#7D7368]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8774B8]" />
          <span>Opening your mindful space...</span>
        </div>
      </div>
    );
  }

  // 2. Protect private pages: require authentication
  if (!user) {
    return <AuthPage />;
  }

  // 3. Authenticated App shell
  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'journal':
        return <JournalPage />;
      case 'mood':
        return <MoodPage />;
      case 'habits':
        return <HabitsPage />;
      case 'traits':
        return <TraitsPage />;
      case 'insights':
        return <InsightsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <AppLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onOpenQuickMood={() => setIsQuickMoodOpen(true)}
      onOpenQuickJournal={() => setIsQuickJournalOpen(true)}
    >
      {renderActivePage()}

      {/* Global Quick Action Modals accessible from any page */}
      <QuickMoodModal
        isOpen={isQuickMoodOpen}
        onClose={() => setIsQuickMoodOpen(false)}
      />

      <QuickJournalModal
        isOpen={isQuickJournalOpen}
        onClose={() => setIsQuickJournalOpen(false)}
      />
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ServiceProvider>
        <AppContent />
      </ServiceProvider>
    </AuthProvider>
  );
};

export default App;
