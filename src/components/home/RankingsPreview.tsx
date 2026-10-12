import React from 'react';
import { Link } from 'react-router-dom';
import { useSportsClub } from '../../context/SportsClubContext';
import { useTheme } from '../../context/ThemeContext';
import { Trophy, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export const RankingsPreview: React.FC = () => {
  const { campusCupStandings } = useSportsClub();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const topTeams = campusCupStandings.slice(0, 4);

  return (
    <div className={`p-8 rounded-3xl shadow-2xl space-y-6 transition-colors duration-200 ${
      isLight ? 'bg-white border border-[#CBD5E1] shadow-slate-200/60' : 'bg-[#0B0F17] border border-[#1E293B]'
    }`}>
      <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b ${
        isLight ? 'border-slate-200' : 'border-[#1E293B]'
      }`}>
        <div>
          <span className={`text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold ${
            isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
          }`}>
            <Trophy className="w-3.5 h-3.5" />
            CHAMPIONSHIP CUP PREVIEW
          </span>
          <h3 className={`text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight mt-1 ${
            isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
          }`}>
            CAMPUS SPORTS CUP LEADERS
          </h3>
        </div>

        <Link
          to="/leaderboard"
          className={`text-xs font-mono hover:underline flex items-center gap-1 font-bold ${
            isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
          }`}
        >
          <span>View Full Leaderboard & Points</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topTeams.map((team, idx) => {
          const isFirst = idx === 0;

          return (
            <div
              key={team.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isFirst
                  ? isLight
                    ? 'bg-gradient-to-t from-emerald-50 to-white border-2 border-[#15803D] shadow-md shadow-emerald-700/10'
                    : 'bg-gradient-to-t from-[#182232] to-[#0B0F17] border-2 border-[#B8FF3D] shadow-lg shadow-[#B8FF3D]/10'
                  : isLight
                    ? 'bg-[#F8FAFC] border border-[#CBD5E1]'
                    : 'bg-[#121824] border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-black text-sm ${
                  isFirst 
                    ? 'bg-[#B8FF3D] text-[#070A0F]' 
                    : isLight
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-[#070A0F] text-[#8B95A7]'
                }`}>
                  #{team.rank}
                </span>

                {team.change_direction === 'up' && (
                  <span className={`text-xs font-mono flex items-center ${
                    isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
                  }`}>
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +1
                  </span>
                )}
                {team.change_direction === 'down' && (
                  <span className={`text-xs font-mono flex items-center ${
                    isLight ? 'text-[#DC2626]' : 'text-[#FF3B30]'
                  }`}>
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -1
                  </span>
                )}
              </div>

              <div className="my-3">
                <h4 className={`font-heading font-bold text-base truncate ${
                  isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
                }`}>
                  {team.entity_name}
                </h4>
                <div className={`text-[11px] font-mono mt-0.5 ${
                  isLight ? 'text-slate-600' : 'text-[#8B95A7]'
                }`}>
                  🥇 {team.stats?.goldMedals || 0} Golds • {team.stats?.won || 0} Wins
                </div>
              </div>

              <div className={`pt-2 border-t flex items-center justify-between ${
                isLight ? 'border-slate-200' : 'border-[#1E293B]/60'
              }`}>
                <span className={`text-xl font-heading font-black ${
                  isFirst 
                    ? isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
                    : isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
                }`}>
                  {team.points} <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>PTS</span>
                </span>
                {isFirst && (
                  <span className={`text-[10px] font-mono uppercase font-bold ${
                    isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
                  }`}>
                    CUP LEADER
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

