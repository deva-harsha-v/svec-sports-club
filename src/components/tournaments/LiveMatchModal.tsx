import React, { useState } from 'react';
import { Match } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useSportsClub } from '../../context/SportsClubContext';
import { X, Flame, Shield, MapPin, Clock, Trophy, Check } from 'lucide-react';

interface LiveMatchModalProps {
  matchId: string | null;
  onClose: () => void;
}

export const LiveMatchModal: React.FC<LiveMatchModalProps> = ({ matchId, onClose }) => {
  const { matches, updateMatchScore } = useSportsClub();
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'coach';

  const match = matches.find(m => m.id === matchId);

  // Admin edit form state
  const [team1Score, setTeam1Score] = useState<number>(match?.result?.team1_score ?? 0);
  const [team2Score, setTeam2Score] = useState<number>(match?.result?.team2_score ?? 0);
  const [period, setPeriod] = useState<string>(match?.result?.extra_info?.period ?? '2nd Half');
  const [timeRemaining, setTimeRemaining] = useState<string>(match?.result?.extra_info?.timeRemaining ?? "74'");
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>(match?.result?.winner_team_id || '');
  const [newScorer, setNewScorer] = useState<string>('');
  const [scorers, setScorers] = useState<string[]>(match?.result?.extra_info?.scorers ?? []);

  if (!match) return null;

  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  const handleAdminSave = () => {
    updateMatchScore(
      match.id,
      Number(team1Score),
      Number(team2Score),
      selectedWinnerId || undefined,
      {
        period,
        timeRemaining,
        scorers
      }
    );
    onClose();
  };

  const handleAddScorer = () => {
    if (!newScorer.trim()) return;
    setScorers(prev => [...prev, newScorer.trim()]);
    setNewScorer('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0F]/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0B0F17] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 px-6 bg-[#070A0F] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                LIVE MATCH CENTER
              </span>
            ) : isCompleted ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#B8FF3D]/20 text-[#B8FF3D] text-xs font-mono font-bold">
                MATCH RESULT // VERIFIED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#121824] text-[#8B95A7] text-xs font-mono font-bold">
                UPCOMING FIXTURE
              </span>
            )}
            <span className="text-xs font-mono text-[#8B95A7]">
              {match.round_name} • {match.court_table || 'Court 1'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Broadcast Scoreboard Display */}
        <div className="p-8 bg-gradient-to-b from-[#121824] to-[#0B0F17] border-b border-[#1E293B] text-center">
          
          <div className="grid grid-cols-5 items-center gap-4">
            
            {/* Team 1 */}
            <div className="col-span-2 text-right">
              <div className="text-xs font-mono text-[#8B95A7]">
                {match.team1?.department || 'Department'}
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight truncate">
                {match.team1?.name || 'TBD'}
              </h3>
              <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                {match.team1?.hostel || 'Hostel'}
              </div>
            </div>

            {/* Score Center */}
            <div className="col-span-1 flex flex-col items-center">
              <div className="px-4 py-2 rounded-xl bg-[#070A0F] border border-[#1E293B] font-mono text-3xl sm:text-4xl font-black text-[#B8FF3D] tracking-wider lime-border-glow">
                {match.result?.team1_score ?? 0} : {match.result?.team2_score ?? 0}
              </div>
              <span className="text-[11px] font-mono uppercase text-[#FF3B30] font-bold mt-2 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                {match.result?.extra_info?.timeRemaining || "LIVE"}
              </span>
            </div>

            {/* Team 2 */}
            <div className="col-span-2 text-left">
              <div className="text-xs font-mono text-[#8B95A7]">
                {match.team2?.department || 'Department'}
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight truncate">
                {match.team2?.name || 'TBD'}
              </h3>
              <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                {match.team2?.hostel || 'Hostel'}
              </div>
            </div>

          </div>

          {/* Venue and match details */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#8B95A7]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#B8FF3D]" />
              {match.venue_name || 'Main Stadium Arena'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#00F0FF]" />
              {new Date(match.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

        </div>

        {/* Match Timeline / Scorers */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B95A7] mb-3">
              Match Events & Scorers
            </h4>
            {scorers.length > 0 ? (
              <div className="space-y-2">
                {scorers.map((scorer, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#121824] border border-[#1E293B] text-xs font-mono"
                  >
                    <span className="text-[#F5F7FA] font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#B8FF3D]" />
                      {scorer}
                    </span>
                    <span className="text-[#8B95A7]">Goal / Point Event</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-[#8B95A7] italic">
                No key event recorded yet.
              </p>
            )}
          </div>

          {/* Admin Score Control Console */}
          {isAdmin && (
            <div className="p-4 rounded-xl bg-[#070A0F] border border-[#FF3B30]/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#FF3B30] uppercase flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Live Score Control Panel
                </span>
                <span className="text-[10px] font-mono text-[#8B95A7]">Instant Realtime Sync</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[#8B95A7] block mb-1">
                    {match.team1?.name || 'Team 1'} Score:
                  </label>
                  <input
                    type="number"
                    value={team1Score}
                    onChange={(e) => setTeam1Score(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-lg font-mono text-[#F5F7FA]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#8B95A7] block mb-1">
                    {match.team2?.name || 'Team 2'} Score:
                  </label>
                  <input
                    type="number"
                    value={team2Score}
                    onChange={(e) => setTeam2Score(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-lg font-mono text-[#F5F7FA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-[#8B95A7] block mb-1">Match Time:</label>
                  <input
                    type="text"
                    value={timeRemaining}
                    onChange={(e) => setTimeRemaining(e.target.value)}
                    placeholder="e.g. 74' or Full Time"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-[#F5F7FA]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#8B95A7] block mb-1">Select Winner (Qualify):</label>
                  <select
                    value={selectedWinnerId}
                    onChange={(e) => setSelectedWinnerId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-[#F5F7FA]"
                  >
                    <option value="">In Progress (No Winner)</option>
                    {match.team1 && <option value={match.team1.id}>{match.team1.name} (Winner)</option>}
                    {match.team2 && <option value={match.team2.id}>{match.team2.name} (Winner)</option>}
                  </select>
                </div>
              </div>

              {/* Add event scorer */}
              <div>
                <label className="text-[11px] font-mono text-[#8B95A7] block mb-1">Add Scorer / Highlight:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newScorer}
                    onChange={(e) => setNewScorer(e.target.value)}
                    placeholder="e.g. Player Name (23')"
                    className="flex-grow px-3 py-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-[#F5F7FA]"
                  />
                  <button
                    onClick={handleAddScorer}
                    className="px-3 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1E293B] text-xs font-mono text-[#F5F7FA]"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdminSave}
                className="w-full py-2.5 rounded-lg bg-[#FF3B30] hover:bg-[#e03026] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all"
              >
                Apply Score & Broadcast Update
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
