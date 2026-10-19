import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'accent-lavender' | 'accent-sage';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-[#ECE7DF] shadow-[0_1px_3px_rgba(40,32,20,0.03)]',
    elevated: 'bg-white border border-[#E8E2D8] shadow-[0_6px_20px_rgba(40,32,20,0.04)]',
    subtle: 'bg-[#FDFCFB] border border-[#F0EBE3]',
    'accent-lavender': 'bg-[#FAF8FD] border border-[#E9E3F5]',
    'accent-sage': 'bg-[#F7FAF8] border border-[#E1ECE4]',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
