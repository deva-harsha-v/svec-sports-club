import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match, TournamentRound, TournamentTeam } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { Trophy, CheckCircle, ChevronRight, Flame } from 'lucide-react';

interface BracketViewProps {
  tournamentId: string;
  rounds: TournamentRound[];
  matches: Match[];
  teams: TournamentTeam[];
  onSelectMatch: (matchId: string) => void;
  onAdminSetWinner?: (matchId: string, winnerTeamId: string) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({
  tournamentId,
  rounds,
  matches,
  teams,
  onSelectMatch,
  onAdminSetWinner
}) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'coach';

  // Filter for this tournament
  const tournRounds = rounds
    .filter(r => r.tournament_id === tournamentId)
    .sort((a, b) => a.round_number - b.round_number);

  const tournMatches = matches.filter(m => m.tournament_id === tournamentId);

  // Find the champion if final match is completed
  const finalMatch = tournMatches.find(m => m.round_name?.toLowerCase().includes('final') || m.bracket_node_id === 'FINAL_1');
  const championTeam = finalMatch?.result?.winner_team_id
    ? teams.find(t => t.id === finalMatch.result?.winner_team_id)
    : null;

  return (
    <div className="w-full overflow-x-auto py-8 no-scrollbar">
      
      {/* Champion Banner if determined */}
      <AnimatePresence>
        {championTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#FFB800]/20 via-[#B8FF3D]/20 to-[#FFB800]/20 border-2 border-[#FFB800] text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-[#FFB800] animate-bounce" />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFB800]">
                  OFFICIAL TOURNAMENT CHAMPION
                </span>
                <h3 className="text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
                  {championTeam.name}
                </h3>
              </div>
            </div>
            <div className="text-xs font-mono text-[#8B95A7] mt-2">
              Representing {championTeam.department} • {championTeam.hostel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bracket Rounds Column Grid */}
      <div className="flex items-center min-w-[900px] justify-between gap-8 px-4">
        {tournRounds.map((round, rIndex) => {
          const roundMatches = tournMatches
            .filter(m => m.round_id === round.id || m.round_name === round.round_name)
            .sort((a, b) => (a.bracket_node_id || '').localeCompare(b.bracket_node_id || ''));

          return (
            <div key={round.id} className="flex-1 flex flex-col">
              
              {/* Round Header */}
              <div className="mb-6 pb-2 border-b border-[#1E293B] text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B95A7]">
                  ROUND {round.round_number}
                </span>
                <h4 className="font-heading font-bold text-sm uppercase text-[#F5F7FA]">
                  {round.round_name}
                </h4>
              </div>

              {/* Match Nodes */}
              <div className="flex flex-col justify-around gap-8 flex-grow">
                {roundMatches.map((match) => {
                  const team1 = teams.find(t => t.id === match.team1_id) || match.team1;
                  const team2 = teams.find(t => t.id === match.team2_id) || match.team2;
                  const isLive = match.status === 'live';
                  const isCompleted = match.status === 'completed';
                  const winnerId = match.result?.winner_team_id;

                  return (
                    <motion.div
                      key={match.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35 }}
                      className={`relative rounded-xl border bg-[#0B0F17] overflow-hidden transition-all duration-300 shadow-lg ${
                        isLive 
                          ? 'border-[#FF3B30] shadow-[#FF3B30]/10' 
                          : isCompleted 
                          ? 'border-[#1E293B] hover:border-[#B8FF3D]/50' 
                          : 'border-[#1E293B]'
                      }`}
                    >
                      {/* Node Status Bar */}
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#070A0F] border-b border-[#1E293B] text-[10px] font-mono">
                        <span className="text-[#8B95A7] font-semibold">
                          {match.court_table || `Match ${match.bracket_node_id || ''}`}
                        </span>

                        {isLive ? (
                          <span className="flex items-center gap-1 text-[#FF3B30] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-ping" />
                            LIVE ({match.result?.extra_info?.timeRemaining || "74'"})
                          </span>
                        ) : isCompleted ? (
                          <span className="text-[#B8FF3D] font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            FINAL
                          </span>
                        ) : (
                          <span className="text-[#8B95A7]">
                            {new Date(match.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Team 1 Slot */}
                      <div
                        onClick={() => onSelectMatch(match.id)}
                        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors border-b border-[#1E293B]/50 ${
                          winnerId === team1?.id 
                            ? 'bg-[#B8FF3D]/10 text-[#F5F7FA]' 
                            : 'hover:bg-[#121824] text-[#8B95A7]'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <span className="text-[10px] font-mono text-[#8B95A7] w-4">
                            {team1?.seed ? `#${team1.seed}` : '—'}
                          </span>
                          <span className={`text-xs font-heading font-bold truncate ${
                            winnerId === team1?.id ? 'text-[#B8FF3D]' : 'text-[#F5F7FA]'
                          }`}>
                            {team1?.name || 'TBD (Awaiting Round)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm font-bold ${
                            winnerId === team1?.id ? 'text-[#B8FF3D]' : 'text-[#F5F7FA]'
                          }`}>
                            {match.result?.team1_score ?? (isCompleted ? 0 : '-')}
                          </span>

                          {/* Admin advance winner button */}
                          {isAdmin && team1 && !winnerId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdminSetWinner?.(match.id, team1.id);
                              }}
                              title="Mark team as winner & qualify"
                              className="px-1.5 py-0.5 rounded bg-[#B8FF3D]/20 hover:bg-[#B8FF3D] text-[#B8FF3D] hover:text-[#070A0F] text-[9px] font-mono font-bold"
                            >
                              WIN
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Team 2 Slot */}
                      <div
                        onClick={() => onSelectMatch(match.id)}
                        className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                          winnerId === team2?.id 
                            ? 'bg-[#B8FF3D]/10 text-[#F5F7FA]' 
                            : 'hover:bg-[#121824] text-[#8B95A7]'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <span className="text-[10px] font-mono text-[#8B95A7] w-4">
                            {team2?.seed ? `#${team2.seed}` : '—'}
                          </span>
                          <span className={`text-xs font-heading font-bold truncate ${
                            winnerId === team2?.id ? 'text-[#B8FF3D]' : 'text-[#F5F7FA]'
                          }`}>
                            {team2?.name || 'TBD (Awaiting Round)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm font-bold ${
                            winnerId === team2?.id ? 'text-[#B8FF3D]' : 'text-[#F5F7FA]'
                          }`}>
                            {match.result?.team2_score ?? (isCompleted ? 0 : '-')}
                          </span>

                          {/* Admin advance winner button */}
                          {isAdmin && team2 && !winnerId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdminSetWinner?.(match.id, team2.id);
                              }}
                              title="Mark team as winner & qualify"
                              className="px-1.5 py-0.5 rounded bg-[#B8FF3D]/20 hover:bg-[#B8FF3D] text-[#B8FF3D] hover:text-[#070A0F] text-[9px] font-mono font-bold"
                            >
                              WIN
                            </button>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
