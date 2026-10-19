import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'subtle-lavender'
  | 'subtle-sage'
  | 'ghost'
  | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#4A453E] hover:bg-[#3B3630] text-[#FAF8F5] focus-visible:ring-[#8774B8] shadow-sm',
    secondary:
      'bg-white hover:bg-[#FAF8F5] text-[#3D3833] border border-[#E5DFD5] hover:border-[#D5CDC1] focus-visible:ring-[#8774B8] shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    'subtle-lavender':
      'bg-[#F3EFFB] hover:bg-[#EAE4F7] text-[#63518D] border border-[#E4DCF5] focus-visible:ring-[#8774B8]',
    'subtle-sage':
      'bg-[#EEF5F0] hover:bg-[#E3EEE6] text-[#3D5F47] border border-[#D5E5DA] focus-visible:ring-[#5B8266]',
    ghost:
      'bg-transparent hover:bg-[#F4EFEA] text-[#554F48] hover:text-[#2E2A26] focus-visible:ring-stone-400',
    danger:
      'bg-[#FDF2F2] hover:bg-[#FCE8E8] text-[#9E3939] border border-[#F6D0D0] focus-visible:ring-red-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
