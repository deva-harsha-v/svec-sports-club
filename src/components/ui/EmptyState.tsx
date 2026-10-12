import React from 'react';
import { LucideIcon, Trophy } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Trophy,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#0B0F17]/60 border border-[#1E293B]/70 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-[#121824] border border-[#1E293B] flex items-center justify-center mb-4 text-[#8B95A7]">
        <Icon className="w-8 h-8 text-[#B8FF3D]/70" />
      </div>
      <h3 className="font-heading font-black text-lg sm:text-xl text-[#F5F7FA] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#8B95A7] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-lg bg-[#B8FF3D] hover:bg-[#a6ec2e] text-[#070A0F] font-heading font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-[#B8FF3D]/10"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
