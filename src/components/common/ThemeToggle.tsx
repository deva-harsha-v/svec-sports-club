import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all duration-200 cursor-pointer border ${
        isDark
          ? 'bg-[#0B0F17] hover:bg-[#121824] border-[#1E293B] text-[#F5F7FA] hover:text-[#B8FF3D] hover:border-[#B8FF3D]/40'
          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800 hover:text-emerald-700 hover:border-slate-300 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 shrink-0" />
      )}
      {showLabel && (
        <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
