import React from 'react';
import { Sport } from '../../lib/types';
import { useTheme } from '../../context/ThemeContext';
import { X, Calendar, MapPin, User, Shield, Users, ArrowUpRight } from 'lucide-react';

interface SportDetailModalProps {
  sport: Sport | null;
  onClose: () => void;
  onViewTournaments: (sportSlug: string) => void;
}

export const SportDetailModal: React.FC<SportDetailModalProps> = ({
  sport,
  onClose,
  onViewTournaments
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!sport) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${
      isLight ? 'bg-slate-900/40' : 'bg-[#070A0F]/80'
    }`}>
      <div 
        className={`relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col border transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-slate-300/60' : 'bg-[#0B0F17] border-[#1E293B]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image Banner (Always dark photographic treatment with crisp white text) */}
        <div data-media-card="true" className="relative h-64 sm:h-72 w-full overflow-hidden flex-shrink-0">
          <img
            src={sport.cover_image}
            alt={sport.name}
            className="w-full h-full object-cover filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 border border-white/20 text-white hover:text-[#B8FF3D] hover:border-[#B8FF3D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sport Title & Category */}
          <div className="absolute bottom-6 left-6 right-6">
            <span className="px-3 py-1 rounded bg-[#B8FF3D] text-[#070A0F] font-mono font-bold text-xs uppercase tracking-wider">
              {sport.category}
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase tracking-tight mt-2 drop-shadow-md">
              {sport.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-[#8B95A7] text-xs font-mono uppercase">
                <Users className="w-4 h-4 text-[#B8FF3D]" />
                Active Athletes
              </div>
              <div className="text-2xl font-heading font-bold text-[#F5F7FA] mt-1">
                {sport.active_athletes_count}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B]">
              <div className="flex items-center gap-2 text-[#8B95A7] text-xs font-mono uppercase">
                <MapPin className="w-4 h-4 text-[#00F0FF]" />
                Primary Venue
              </div>
              <div className="text-sm font-semibold text-[#F5F7FA] mt-1 line-clamp-1">
                {sport.venue || 'Venue to be announced'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-[#8B95A7] text-xs font-mono uppercase">
                <Calendar className="w-4 h-4 text-[#FFB800]" />
                Official Trials
              </div>
              <div className="text-sm font-semibold text-[#F5F7FA] mt-1">
                Annual College Trials
              </div>
            </div>
          </div>

          {/* Schedule & Practice */}
          <div className="p-5 rounded-xl bg-[#121824] border border-[#1E293B] space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#B8FF3D] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Practice & Training Timetable
            </h4>
            <p className="text-sm font-medium text-[#F5F7FA]">
              {sport.schedule_summary || 'Training timetable scheduled by Physical Education Department.'}
            </p>
            <p className="text-xs text-[#8B95A7]">
              All varsity team members are required to attend scheduled training sessions to maintain roster eligibility.
            </p>
          </div>

          {/* Coach Contact */}
          <div className="p-5 rounded-xl bg-[#121824] border border-[#1E293B] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#8B95A7] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B8FF3D]" />
                Head Coach
              </div>
              <div className="text-base font-heading font-bold text-[#F5F7FA] mt-0.5">
                {sport.coach_name ? `Coach ${sport.coach_name}` : 'Coach to be assigned'}
              </div>
              <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                {sport.coach_contact || 'Contact Physical Education Department'}
              </div>
            </div>
            {sport.coach_contact && sport.coach_contact.includes('@') && (
              <a
                href={`mailto:${sport.coach_contact.split('|')[0].trim()}`}
                className="px-3.5 py-2 rounded-lg bg-[#0B0F17] border border-[#1E293B] hover:border-[#B8FF3D] text-xs font-mono text-[#F5F7FA] transition-colors"
              >
                Contact Coach
              </a>
            )}
          </div>

          {/* Official Rules & Equipment */}
          <div className="p-5 rounded-xl bg-[#121824] border border-[#1E293B] space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B95A7] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B8FF3D]" />
              Tournament Rules & Eligibility
            </h4>
            <p className="text-sm text-[#8B95A7] leading-relaxed">
              {sport.rules}
            </p>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-[#070A0F] border-t border-[#1E293B] flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-mono text-[#8B95A7] hidden sm:inline">
            SRI VASAVI SPORTS CLUB // SVEC
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#121824] hover:bg-[#1E293B] text-xs font-mono text-[#F5F7FA]"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onViewTournaments(sport.slug);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
            >
              <span>View Tournaments</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
