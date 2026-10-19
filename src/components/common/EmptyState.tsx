import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#E3DDD3] rounded-3xl bg-[#FCFAF7]">
      <div className="w-12 h-12 rounded-2xl bg-[#F4EFEA] text-[#786E64] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#2D2A26]">{title}</h3>
      <p className="mt-1 text-sm text-[#736B63] max-w-sm leading-relaxed">
        {message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 text-xs font-semibold px-4 py-2 bg-[#FAF8F5] text-[#554F48] hover:text-[#2D2A26] border border-[#DDD6CC] hover:border-[#C4BDB1] rounded-xl transition-all shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
