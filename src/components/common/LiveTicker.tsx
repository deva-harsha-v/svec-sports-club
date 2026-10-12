import React from 'react';
import { useSportsClub } from '../../context/SportsClubContext';
import { Flame, Clock, ChevronRight } from 'lucide-react';

interface LiveTickerProps {
  onSelectMatch?: (matchId: string) => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ onSelectMatch }) => {
  const { matches, tournaments } = useSportsClub();

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled').slice(0, 3);

  const displayItems = liveMatches.length > 0 ? liveMatches : upcomingMatches;

  return (
    <div className="bg-[#05070B] border-b border-[#1E293B] text-xs py-2 px-4 select-none relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Indicator */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-4">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF3B30]/15 border border-[#FF3B30]/40 text-[#FF3B30] font-bold text-[10px] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-ping" />
            LIVE FEED
          </div>
          <span className="text-[#8B95A7] hidden sm:inline text-[11px] font-mono">
            SVEC ATHLETICS // FIXTURES & RESULTS
          </span>
        </div>

        {/* Center Ticker / Carousel */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 text-nowrap flex-grow">
          {displayItems.map((m) => {
            const tournament = tournaments.find(t => t.id === m.tournament_id);
            const isLive = m.status === 'live';

            return (
              <button
                key={m.id}
                onClick={() => onSelectMatch?.(m.id)}
                className="flex items-center gap-3 bg-[#0B0F17] hover:bg-[#121824] transition-colors border border-[#1E293B] hover:border-[#B8FF3D]/50 px-3 py-1 rounded text-left group cursor-pointer"
              >
                <span className="text-[10px] text-[#8B95A7] font-medium uppercase tracking-wider">
                  {tournament?.sport_name || 'SPORT'} • {m.round_name || 'Match'}
                </span>

                <div className="flex items-center gap-2 font-mono font-bold text-[#F5F7FA]">
                  <span className={`${m.result?.winner_team_id === m.team1_id ? 'text-[#B8FF3D]' : ''}`}>
                    {m.team1?.name || 'TBD'}
                  </span>
                  
                  {isLive ? (
                    <span className="px-1.5 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30] text-[11px] font-bold">
                      {m.result?.team1_score ?? 0} - {m.result?.team2_score ?? 0}
                    </span>
                  ) : (
                    <span className="text-[#8B95A7] text-[11px]">vs</span>
                  )}

                  <span className={`${m.result?.winner_team_id === m.team2_id ? 'text-[#B8FF3D]' : ''}`}>
                    {m.team2?.name || 'TBD'}
                  </span>
                </div>

                {isLive ? (
                  <span className="text-[#B8FF3D] text-[10px] font-mono font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#FF3B30]" />
                    {m.result?.extra_info?.timeRemaining || "LIVE"}
                  </span>
                ) : (
                  <span className="text-[#8B95A7] text-[10px] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(m.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}

                <ChevronRight className="w-3 h-3 text-[#4B5565] group-hover:text-[#B8FF3D] transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Right Status */}
        <div className="hidden lg:flex items-center gap-3 pl-4 flex-shrink-0 text-[#8B95A7] text-[11px] font-mono border-l border-[#1E293B]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#B8FF3D]" />
            SERVER SYNC ACTIVE
          </span>
        </div>

      </div>
    </div>
  );
};
