import React, { useState } from 'react';
import { useSportsClub } from '../../context/SportsClubContext';
import { Calendar, Clock, MapPin, Trophy, Flame, Filter } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  type: 'Championship' | 'Match' | 'Trials' | 'Practice';
  sport: string;
  venue: string;
  date: string;
  time: string;
  status: 'live' | 'upcoming' | 'completed';
}

export const TimelineCalendar: React.FC = () => {
  const { matches, tournaments } = useSportsClub();
  const [filterType, setFilterType] = useState<string>('All');

  // Synthesize timeline events from matches and tournaments
  const events: EventItem[] = [
    ...matches.map((m, idx) => ({
      id: `ev_m_${m.id}`,
      title: `${m.team1?.name || 'TBD'} vs ${m.team2?.name || 'TBD'} (${m.round_name})`,
      type: 'Match' as const,
      sport: tournaments.find(t => t.id === m.tournament_id)?.sport_name || 'Sport',
      venue: m.venue_name || 'Main Stadium',
      date: new Date(m.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: m.status as any
    })),
    {
      id: 'ev_trials_basket',
      title: 'Varsity Basketball Spring Selection Trials',
      type: 'Trials',
      sport: 'Basketball',
      venue: 'Indoor Sports Complex - Court A',
      date: 'Oct 05, 2026',
      time: '04:30 PM',
      status: 'upcoming'
    },
    {
      id: 'ev_trials_track',
      title: 'Annual Inter-Hostel Athletics Track Heats',
      type: 'Championship',
      sport: 'Track & Field',
      venue: 'Olympic 400m Synthetic Track',
      date: 'Oct 09, 2026',
      time: '06:00 AM',
      status: 'upcoming'
    },
    {
      id: 'ev_trials_cricket',
      title: "Chancellor's Trophy Cricket Squad Net Trials",
      type: 'Trials',
      sport: 'Cricket',
      venue: 'Campus Cricket Oval',
      date: 'Oct 14, 2026',
      time: '03:00 PM',
      status: 'upcoming'
    }
  ];

  const filteredEvents = filterType === 'All'
    ? events
    : events.filter(e => e.type === filterType);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <span className="text-xs font-mono uppercase text-[#B8FF3D] tracking-widest">
            COLLEGIATE SPORTS TIMELINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
            CAMPUS SPORTS SCHEDULE
          </h2>
          <p className="text-sm text-[#8B95A7] mt-1">
            Chronological schedule of live matches, varsity selection trials, and championships.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Match', 'Trials', 'Championship'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filterType === type
                  ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/20'
                  : 'bg-[#0B0F17] text-[#8B95A7] border border-[#1E293B] hover:text-[#F5F7FA]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="relative border-l-2 border-[#1E293B] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
        {filteredEvents.map((item, index) => {
          const isLive = item.status === 'live';

          return (
            <div key={item.id} className="relative group">
              
              {/* Timeline Node Point */}
              <div 
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                  isLive 
                    ? 'bg-[#FF3B30] border-[#FF3B30] animate-ping' 
                    : 'bg-[#070A0F] border-[#B8FF3D] group-hover:bg-[#B8FF3D]'
                }`} 
              />

              {/* Event Card */}
              <div className="p-6 rounded-2xl bg-[#0B0F17] border border-[#1E293B] group-hover:border-[#B8FF3D]/50 transition-all duration-300 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#121824] border border-[#1E293B] text-[10px] font-mono text-[#B8FF3D] uppercase font-bold">
                      {item.sport}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#070A0F] text-[10px] font-mono text-[#8B95A7] uppercase">
                      {item.type}
                    </span>
                  </div>

                  {isLive ? (
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF3B30]">
                      <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                      IN PROGRESS LIVE
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#8B95A7] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#B8FF3D]" />
                      {item.time}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
                  {item.title}
                </h3>

                <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center justify-between text-xs font-mono text-[#8B95A7] gap-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" />
                    {item.venue}
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
