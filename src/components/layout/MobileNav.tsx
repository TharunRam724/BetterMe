import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Smile,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Settings,
  X,
  Feather,
} from 'lucide-react';
import type { NavigationTab } from '../../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'mood',
      label: 'Mood',
      icon: <Smile className="w-5 h-5" />,
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      id: 'traits',
      label: 'Traits',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Off-canvas Side Drawer for tablet / mobile */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#25221F]/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#EAE4DC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#6B5A96]">
                    <Feather className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#2D2A26] block">
                      BetterMe
                    </span>
                    <span className="text-[10px] text-[#787167]">Mindful Growth</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-[#787066] hover:bg-[#EFEAE2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1.5" aria-label="Mobile navigation">
                {navItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-[#EAE4DB] text-[#282522] font-semibold'
                          : 'text-[#615A52] hover:bg-[#F3EFE9]'
                      }`}
                    >
                      <span className={isActive ? 'text-[#685591]' : 'text-[#877F76]'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#EAE4DC] text-xs text-[#80766B]">
              <p className="font-semibold text-[#4F473E]">Local Session Mode</p>
              <p className="text-[11px] text-[#7D7367] mt-0.5">
                Supabase backend ready for Phase 2.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (compact quick access on small screens) */}
      <nav
        aria-label="Mobile quick tab bar"
        className="lg:hidden fixed bottom-0 inset-x-0 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#EAE4DC] z-30 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#65538D] font-bold'
                  : 'text-[#7D756C] hover:text-[#38332D]'
              }`}
            >
              <span className={`p-1 rounded-md ${isActive ? 'bg-[#EDE7F8]' : ''}`}>
                {item.icon}
              </span>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
