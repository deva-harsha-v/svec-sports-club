import React, { useState } from 'react';
import { useSportsClub } from '../../context/SportsClubContext';
import { Trophy, TrendingUp, TrendingDown, Minus, Medal, Award, Flame } from 'lucide-react';

export const CampusCupLeaderboard: React.FC = () => {
  const { campusCupStandings, hostelCupStandings } = useSportsClub();
  const [viewMode, setViewMode] = useState<'department' | 'hostel'>('department');

  const standings = viewMode === 'department' ? campusCupStandings : hostelCupStandings;
  const sorted = [...standings].sort((a, b) => a.rank - b.rank);

  const top3 = sorted.slice(0, 3);
  const remaining = sorted.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title & Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#B8FF3D] mb-1">
            <Trophy className="w-4 h-4" />
            CHANCELLOR’S ANNUAL TROPHY
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#F5F7FA] uppercase">
            CAMPUS SPORTS CUP
          </h2>
          <p className="text-sm text-[#8B95A7] mt-1 max-w-xl">
            Overall collegiate supremacy table calculated from official tournament placements across all sports.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-[#0B0F17] border border-[#1E293B]">
          <button
            onClick={() => setViewMode('department')}
            className={`px-5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
              viewMode === 'department'
                ? 'bg-[#B8FF3D] text-[#070A0F] shadow-lg shadow-[#B8FF3D]/20'
                : 'text-[#8B95A7] hover:text-[#F5F7FA]'
            }`}
          >
            Inter-Department Cup
          </button>
          <button
            onClick={() => setViewMode('hostel')}
            className={`px-5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
              viewMode === 'hostel'
                ? 'bg-[#B8FF3D] text-[#070A0F] shadow-lg shadow-[#B8FF3D]/20'
                : 'text-[#8B95A7] hover:text-[#F5F7FA]'
            }`}
          >
            Inter-Hostel Shield
          </button>
        </div>
      </div>

      {/* Podium Cards for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-end">
        
        {/* 2nd Place (Silver) */}
        {top3[1] && (
          <div className="order-2 md:order-1 rounded-3xl p-6 bg-gradient-to-t from-[#121824] to-[#0B0F17] border border-[#8B95A7]/40 shadow-xl relative overflow-hidden h-[320px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-full bg-[#8B95A7]/20 border border-[#8B95A7] text-[#F5F7FA] font-heading font-black text-lg flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-mono uppercase text-[#8B95A7]">
                RUNNER-UP
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
                {top3[1].entity_name}
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono text-[#8B95A7] mt-2">
                <span>🥇 {top3[1].stats?.goldMedals || 0}</span>
                <span>🥈 {top3[1].stats?.silverMedals || 0}</span>
                <span>🥉 {top3[1].stats?.bronzeMedals || 0}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
              <span className="text-3xl font-heading font-black text-[#F5F7FA]">
                {top3[1].points} <span className="text-xs font-mono text-[#8B95A7]">PTS</span>
              </span>
              {top3[1].change_direction === 'up' && (
                <span className="flex items-center text-xs text-[#B8FF3D] font-mono">
                  <TrendingUp className="w-4 h-4 mr-0.5" /> +1
                </span>
              )}
              {top3[1].change_direction === 'down' && (
                <span className="flex items-center text-xs text-[#FF3B30] font-mono">
                  <TrendingDown className="w-4 h-4 mr-0.5" /> -1
                </span>
              )}
            </div>
          </div>
        )}

        {/* 1st Place (Gold / Leader) */}
        {top3[0] && (
          <div className="order-1 md:order-2 rounded-3xl p-8 bg-gradient-to-t from-[#182232] to-[#0B0F17] border-2 border-[#B8FF3D] shadow-2xl relative overflow-hidden h-[360px] flex flex-col justify-between lime-glow">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#B8FF3D]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-full bg-[#B8FF3D] text-[#070A0F] font-heading font-black text-2xl flex items-center justify-center shadow-lg shadow-[#B8FF3D]/30">
                1
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8FF3D]/20 text-[#B8FF3D] text-xs font-mono font-bold">
                <Trophy className="w-3.5 h-3.5" />
                CUP LEADER
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-[#B8FF3D] font-bold">
                CHAMPIONSHIP STANDINGS
              </span>
              <h3 className="text-3xl sm:text-4xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-1">
                {top3[0].entity_name}
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono text-[#F5F7FA] mt-3">
                <span className="px-2 py-0.5 rounded bg-[#121824]">🥇 {top3[0].stats?.goldMedals || 0} Golds</span>
                <span className="px-2 py-0.5 rounded bg-[#121824]">🥈 {top3[0].stats?.silverMedals || 0} Silvers</span>
                <span className="px-2 py-0.5 rounded bg-[#121824]">🥉 {top3[0].stats?.bronzeMedals || 0} Bronzes</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
              <div>
                <span className="text-4xl font-heading font-black text-[#B8FF3D]">
                  {top3[0].points}
                </span>
                <span className="text-xs font-mono text-[#8B95A7] ml-1.5">TOTAL PTS</span>
              </div>
              <span className="flex items-center text-xs text-[#B8FF3D] font-mono font-bold">
                <Flame className="w-4 h-4 mr-0.5 text-[#FF3B30]" /> PACE-SETTER
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {top3[2] && (
          <div className="order-3 rounded-3xl p-6 bg-gradient-to-t from-[#121824] to-[#0B0F17] border border-[#FFB800]/30 shadow-xl relative overflow-hidden h-[300px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-full bg-[#FFB800]/20 border border-[#FFB800] text-[#FFB800] font-heading font-black text-lg flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-mono uppercase text-[#FFB800]">
                PODIUM
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
                {top3[2].entity_name}
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono text-[#8B95A7] mt-2">
                <span>🥇 {top3[2].stats?.goldMedals || 0}</span>
                <span>🥈 {top3[2].stats?.silverMedals || 0}</span>
                <span>🥉 {top3[2].stats?.bronzeMedals || 0}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
              <span className="text-3xl font-heading font-black text-[#F5F7FA]">
                {top3[2].points} <span className="text-xs font-mono text-[#8B95A7]">PTS</span>
              </span>
              <span className="text-xs font-mono text-[#8B95A7]">
                Stable Rank
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Ranked Cards for Remaining Teams */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-widest text-[#8B95A7] mb-2">
          CHAMPIONSHIP CHASE PACK
        </h4>

        {remaining.map((item) => {
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] hover:border-[#B8FF3D]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 rounded-xl bg-[#121824] border border-[#1E293B] flex items-center justify-center font-heading font-bold text-sm text-[#8B95A7]">
                  #{item.rank}
                </span>

                <div>
                  <h4 className="font-heading font-bold text-lg text-[#F5F7FA]">
                    {item.entity_name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#8B95A7] mt-0.5">
                    <span>Played: {item.stats?.played || 0}</span>
                    <span>•</span>
                    <span>Wins: {item.stats?.won || 0}</span>
                    <span>•</span>
                    <span>Golds: {item.stats?.goldMedals || 0}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-[#1E293B]">
                {/* Movement badge */}
                <div className="flex items-center text-xs font-mono">
                  {item.change_direction === 'up' && (
                    <span className="flex items-center text-[#B8FF3D]">
                      <TrendingUp className="w-4 h-4 mr-1" /> Rank Up
                    </span>
                  )}
                  {item.change_direction === 'down' && (
                    <span className="flex items-center text-[#FF3B30]">
                      <TrendingDown className="w-4 h-4 mr-1" /> Rank Down
                    </span>
                  )}
                  {item.change_direction === 'same' && (
                    <span className="flex items-center text-[#8B95A7]">
                      <Minus className="w-4 h-4 mr-1" /> Unchanged
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-2xl font-heading font-black text-[#F5F7FA]">
                    {item.points}
                  </span>
                  <span className="text-xs font-mono text-[#8B95A7] ml-1">PTS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configurable Placement Points System Formula Banner */}
      <div className="p-6 rounded-2xl bg-[#070A0F] border border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="border-r border-[#1E293B] last:border-0 pr-4">
          <div className="text-xs font-mono text-[#FFB800] font-bold">1ST PLACE (GOLD)</div>
          <div className="text-2xl font-heading font-black text-[#F5F7FA] mt-1">+100 PTS</div>
        </div>

        <div className="border-r border-[#1E293B] last:border-0 pr-4">
          <div className="text-xs font-mono text-[#8B95A7] font-bold">2ND PLACE (SILVER)</div>
          <div className="text-2xl font-heading font-black text-[#F5F7FA] mt-1">+60 PTS</div>
        </div>

        <div className="border-r border-[#1E293B] last:border-0 pr-4">
          <div className="text-xs font-mono text-[#8B95A7] font-bold">SEMIFINALS (BRONZE)</div>
          <div className="text-2xl font-heading font-black text-[#F5F7FA] mt-1">+30 PTS</div>
        </div>

        <div>
          <div className="text-xs font-mono text-[#8B95A7] font-bold">PARTICIPATION</div>
          <div className="text-2xl font-heading font-black text-[#F5F7FA] mt-1">+10 PTS</div>
        </div>
      </div>

    </div>
  );
};
