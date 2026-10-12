import React from 'react';
import { Link } from 'react-router-dom';
import { useSportsClub } from '../context/SportsClubContext';
import { Trophy, Calendar, Users, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export const TournamentsPage: React.FC = () => {
  const { tournaments } = useSportsClub();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <span className="text-xs font-mono uppercase text-[#B8FF3D] tracking-widest flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" />
          COLLEGIATE CHAMPIONSHIPS
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-1">
          TOURNAMENTS HUB
        </h1>
        <p className="text-sm text-[#8B95A7] mt-1 max-w-2xl">
          Browse active tournaments, explore multi-round knockout brackets, view team rosters, and track live fixtures.
        </p>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournaments.map((t) => {
          const isLive = t.status === 'live';
          const isOpen = t.status === 'registration_open';

          return (
            <div
              key={t.id}
              className="group rounded-3xl border border-[#1E293B] bg-[#0B0F17] hover:border-[#B8FF3D]/60 transition-all duration-300 overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              {/* Banner Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={t.banner_image}
                  alt={t.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#070A0F]/80 backdrop-blur-md border border-[#1E293B] text-[10px] font-mono uppercase font-bold text-[#B8FF3D]">
                    {t.sport_name}
                  </span>

                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40 text-xs font-mono font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                      LIVE
                    </span>
                  ) : isOpen ? (
                    <span className="px-3 py-1 rounded-full bg-[#B8FF3D]/20 text-[#B8FF3D] border border-[#B8FF3D]/40 text-xs font-mono font-bold">
                      REGISTRATION OPEN
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-[#121824] text-[#8B95A7] text-xs font-mono">
                      {t.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight group-hover:text-[#B8FF3D] transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-[#8B95A7] mt-2 line-clamp-2 leading-relaxed">
                    {t.rules}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-4 border-t border-[#1E293B]">
                  <div className="flex items-center gap-1.5 text-[#8B95A7]">
                    <Calendar className="w-4 h-4 text-[#B8FF3D]" />
                    <span>{t.start_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8B95A7]">
                    <Users className="w-4 h-4 text-[#00F0FF]" />
                    <span>{t.current_teams_count} / {t.max_teams} Teams</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8B95A7] uppercase">
                    {t.format} Elimination
                  </span>

                  <Link
                    to={`/tournaments/${t.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
                  >
                    <span>Enter Hub & Bracket</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
