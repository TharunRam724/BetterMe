import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Smile,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Settings,
  HeartHandshake,
  Feather,
} from 'lucide-react';
import type { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  className = '',
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'mood',
      label: 'Daily Mood',
      icon: <Smile className="w-4 h-4" />,
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id: 'traits',
      label: 'Character Traits',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'insights',
      label: 'Insights & Trends',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings & Privacy',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      aria-label="Main sidebar navigation"
      className={`w-64 bg-[#FAF8F5] border-r border-[#EAE4DC] flex flex-col justify-between p-4 shrink-0 select-none ${className}`}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-[#EDE7F8] border border-[#DDD4F2] flex items-center justify-center text-[#6B5A96] shadow-[0_2px_6px_rgba(107,90,150,0.12)]">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-[#2D2A26] block">
              BetterMe
            </span>
            <span className="text-[11px] font-medium text-[#7D756C] tracking-wide">
              Mindful Personal Growth
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Application sections">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-[#EFEAE2] text-[#282522] shadow-[0_1px_2px_rgba(40,32,20,0.04)] font-semibold'
                    : 'text-[#635C54] hover:bg-[#F3EFE9] hover:text-[#282522]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive
                        ? 'text-[#65538D]'
                        : 'text-[#857D74] group-hover:text-[#4A443D]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E3ECE5] text-[#3D5F47]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Gentle Bottom Prompt / Reflection Card */}
      <div className="pt-4 border-t border-[#EAE4DC] mt-4">
        <div className="p-3.5 rounded-2xl bg-[#F4F1EA] border border-[#E7E0D4] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#574F46]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#6B5A96]" />
            <span>Gentle Daily Principle</span>
          </div>
          <p className="text-[11px] text-[#6C6359] leading-relaxed italic">
            "We do not rise to the level of our goals. We fall to the level of our systems."
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-[#867D72]">
            <span>Calm & Consistent</span>
            <span className="font-semibold text-[#53735D]">● Private Mode</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
