import React from 'react';

export type BadgeTone = 'lavender' | 'sage' | 'peach' | 'stone' | 'amber';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'stone',
  size = 'md',
  className = '',
  icon,
}) => {
  const toneStyles: Record<BadgeTone, string> = {
    lavender: 'bg-[#F4F1FA] text-[#63518D] border-[#E5DEFA]',
    sage: 'bg-[#F1F6F3] text-[#41634B] border-[#D6E6DC]',
    peach: 'bg-[#FDF4F0] text-[#A65333] border-[#F6DCD2]',
    stone: 'bg-[#F7F5F2] text-[#5A544D] border-[#E8E3DC]',
    amber: 'bg-[#FEF8ED] text-[#8C601E] border-[#F9E8CB]',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${toneStyles[tone]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
