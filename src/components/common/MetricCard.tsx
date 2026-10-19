import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconTone?: 'lavender' | 'sage' | 'peach' | 'stone';
  badgeText?: string;
  badgeTone?: 'lavender' | 'sage' | 'peach' | 'stone';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconTone = 'stone',
  badgeText,
  badgeTone = 'sage',
}) => {
  const iconTones = {
    lavender: 'bg-[#F2EEFA] text-[#63518D] border-[#E2D9F4]',
    sage: 'bg-[#EEF5F0] text-[#41634B] border-[#D4E4D8]',
    peach: 'bg-[#FCF2EE] text-[#A65333] border-[#F4DACF]',
    stone: 'bg-[#F6F3EE] text-[#5C554D] border-[#E8E2D8]',
  };

  const badgeTones = {
    lavender: 'bg-[#F4F1FA] text-[#63518D]',
    sage: 'bg-[#F1F6F3] text-[#3D5F47]',
    peach: 'bg-[#FCF3EF] text-[#9A4A2C]',
    stone: 'bg-[#F7F4F0] text-[#554E46]',
  };

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#7C746B] tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#282522]">
              {value}
            </span>
            {badgeText && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeTones[badgeTone]}`}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconTones[iconTone]}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-[#70685F] leading-relaxed">
        {subtitle}
      </p>
    </Card>
  );
};
