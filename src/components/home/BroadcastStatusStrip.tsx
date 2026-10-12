import React from 'react';
import { Link } from 'react-router-dom';
import { useSportsClub } from '../../context/SportsClubContext';
import { useTheme } from '../../context/ThemeContext';
import { Clock, Plus, ChevronRight } from 'lucide-react';

export const BroadcastStatusStrip: React.FC = () => {
  const { matches, tournaments } = useSportsClub();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled');
  const openTournaments = tournaments.filter(t => t.status === 'registration_open');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* 1. Live Segment */}
      <div className={`p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg relative overflow-hidden transition-colors border ${
        isLight
          ? 'bg-white border-rose-300 shadow-slate-200/50'
          : 'bg-[#0B0F17] border-[#FF3B30]/40'
      }`}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#DC2626] dark:text-[#FF3B30] uppercase">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] dark:bg-[#FF3B30] animate-ping" />
            1. LIVE ACTION
          </span>
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>CAMPUS PITCH</span>
        </div>

        {liveMatches.length > 0 ? (
          <div>
            <div className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
              {liveMatches[0].round_name} • {liveMatches[0].court_table}
            </div>
            <div className={`text-lg font-heading font-black mt-1 flex items-center justify-between ${
              isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
            }`}>
              <span>{liveMatches[0].team1?.name || 'TBD'}</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                isLight ? 'text-[#15803D] bg-emerald-50 border border-emerald-200' : 'text-[#B8FF3D] bg-[#070A0F]'
              }`}>
                {liveMatches[0].result?.team1_score ?? 0} : {liveMatches[0].result?.team2_score ?? 0}
              </span>
              <span>{liveMatches[0].team2?.name || 'TBD'}</span>
            </div>
            <div className="text-xs font-mono text-[#DC2626] dark:text-[#FF3B30] mt-1">
              Time: {liveMatches[0].result?.extra_info?.timeRemaining || "74'"}
            </div>
          </div>
        ) : (
          <div className={`text-xs font-mono py-2 ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
            No live match currently in progress. Next match scheduled at 4:00 PM.
          </div>
        )}

        <Link
          to={`/tournaments/${liveMatches[0]?.tournament_id || tournaments[0]?.id}`}
          className={`text-xs font-mono hover:underline flex items-center gap-1 pt-2 border-t ${
            isLight ? 'border-slate-200 text-[#15803D]' : 'border-[#1E293B] text-[#B8FF3D]'
          }`}
        >
          <span>Open Match Center</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Next Up Segment */}
      <div className={`p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg transition-colors border ${
        isLight
          ? 'bg-white border-[#CBD5E1] shadow-slate-200/50'
          : 'bg-[#0B0F17] border-[#1E293B]'
      }`}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-700 dark:text-[#00F0FF] uppercase">
            <Clock className="w-3.5 h-3.5" />
            2. NEXT FIXTURE
          </span>
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>SEEDED</span>
        </div>

        {upcomingMatches.length > 0 ? (
          <div>
            <div className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
              {upcomingMatches[0].round_name} • {new Date(upcomingMatches[0].start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
            <div className={`text-base font-heading font-black mt-1 truncate ${
              isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
            }`}>
              {upcomingMatches[0].team1?.name || 'TBD'} vs {upcomingMatches[0].team2?.name || 'TBD'}
            </div>
            <div className={`text-xs font-mono mt-1 ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
              Venue: {upcomingMatches[0].venue_name || 'Main Turf'}
            </div>
          </div>
        ) : (
          <div className={`text-xs font-mono py-2 ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
            All current round fixtures completed. Next round draws posting soon.
          </div>
        )}

        <Link
          to="/events"
          className={`text-xs font-mono hover:underline flex items-center gap-1 pt-2 border-t ${
            isLight ? 'border-slate-200 text-sky-700' : 'border-[#1E293B] text-[#00F0FF]'
          }`}
        >
          <span>View Master Schedule</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3. Registration Open Segment */}
      <div className={`p-5 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg transition-colors border ${
        isLight
          ? 'bg-white border-emerald-300 shadow-slate-200/50'
          : 'bg-[#0B0F17] border-[#B8FF3D]/40'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`flex items-center gap-1.5 text-xs font-mono font-bold uppercase ${
            isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
          }`}>
            <Plus className="w-3.5 h-3.5" />
            3. REGISTRATIONS OPEN
          </span>
          <span className={`text-[10px] font-mono font-bold ${
            isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
          }`}>LIMITED SLOTS</span>
        </div>

        {openTournaments.length > 0 ? (
          <div>
            <div className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
              {openTournaments[0].sport_name} • {openTournaments[0].format} Format
            </div>
            <div className={`text-base font-heading font-black mt-1 truncate ${
              isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
            }`}>
              {openTournaments[0].title}
            </div>
            <div className={`text-xs font-mono mt-1 ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
              Slots Filled: {openTournaments[0].current_teams_count} / {openTournaments[0].max_teams} Teams
            </div>
          </div>
        ) : (
          <div className={`text-xs font-mono py-2 ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
            Check back next Monday for Spring Tournament registrations.
          </div>
        )}

        <Link
          to={`/tournaments/${openTournaments[0]?.id || ''}`}
          className={`text-xs font-mono hover:underline flex items-center gap-1 pt-2 border-t ${
            isLight ? 'border-slate-200 text-[#15803D]' : 'border-[#1E293B] text-[#B8FF3D]'
          }`}
        >
          <span>Enter Tournament Hub</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};

