import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while communicating with the athletic database.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#FF3B30]/5 border border-[#FF3B30]/20 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/15 border border-[#FF3B30]/30 flex items-center justify-center mb-4 text-[#FF3B30]">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="font-heading font-black text-lg text-[#F5F7FA] tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-[#8B95A7] max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#121824] hover:bg-[#1A2234] border border-[#1E293B] hover:border-[#FF3B30]/50 text-xs font-mono text-[#F5F7FA] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#FF3B30]" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
