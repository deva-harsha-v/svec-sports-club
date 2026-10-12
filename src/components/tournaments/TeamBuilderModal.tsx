import React, { useState } from 'react';
import { Tournament, TournamentTeam } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useSportsClub } from '../../context/SportsClubContext';
import { X, Users, Shield, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface TeamBuilderModalProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onTeamCreated?: (team: TournamentTeam) => void;
}

interface PlayerEntry {
  name: string;
  department: string;
  jersey: string;
}

export const TeamBuilderModal: React.FC<TeamBuilderModalProps> = ({
  isOpen,
  tournament,
  onClose,
  onTeamCreated
}) => {
  const { currentUser } = useAuth();
  const { createTeam, registerParticipant } = useSportsClub();

  const [teamName, setTeamName] = useState('');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science');
  const [hostel, setHostel] = useState(currentUser?.hostel || 'Aryabhatta Hostel');
  
  const [players, setPlayers] = useState<PlayerEntry[]>([
    {
      name: currentUser?.full_name || 'Captain',
      department: currentUser?.department || 'Computer Science',
      jersey: '10'
    }
  ]);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerDept, setNewPlayerDept] = useState('Computer Science');
  const [newPlayerJersey, setNewPlayerJersey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !tournament) return null;

  const minSize = tournament.min_team_size || 5;
  const maxSize = tournament.max_team_size || 11;

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      setErrorMsg('Please enter player full name.');
      return;
    }
    if (players.length >= maxSize) {
      setErrorMsg(`Maximum team capacity (${maxSize} players) reached.`);
      return;
    }

    setPlayers(prev => [
      ...prev,
      {
        name: newPlayerName.trim(),
        department: newPlayerDept,
        jersey: newPlayerJersey.trim() || `${prev.length + 1}`
      }
    ]);
    setNewPlayerName('');
    setNewPlayerJersey('');
    setErrorMsg('');
  };

  const handleRemovePlayer = (index: number) => {
    if (index === 0) {
      setErrorMsg('Cannot remove the team captain.');
      return;
    }
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setErrorMsg('Please provide a team title.');
      return;
    }
    if (players.length < minSize) {
      setErrorMsg(`Tournament requires at least ${minSize} players. You have ${players.length}.`);
      return;
    }

    try {
      const created = await createTeam({
        tournament_id: tournament.id,
        name: teamName.trim(),
        captain_id: currentUser?.id || 'usr_athlete_01',
        captain_name: currentUser?.full_name || 'Captain',
        department,
        hostel
      });

      // Register the team
      await registerParticipant({
        tournament_id: tournament.id,
        tournament_title: tournament.title,
        sport_name: tournament.sport_name,
        profile_id: currentUser?.id || 'usr_athlete_01',
        profile_name: currentUser?.full_name || 'Captain',
        team_id: created.id,
        team_name: created.name,
        registration_type: 'team',
        status: 'approved'
      });

      setSuccessMsg(`Team "${created.name}" created and registered successfully!`);
      onTeamCreated?.(created);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error creating team.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0F]/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0B0F17] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 px-6 bg-[#070A0F] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#B8FF3D]" />
            <div>
              <h3 className="font-heading font-black text-lg text-[#F5F7FA] uppercase tracking-tight">
                CAPTAIN SQUAD BUILDER
              </h3>
              <p className="text-xs font-mono text-[#8B95A7]">
                {tournament.title} • Min: {minSize} | Max: {maxSize} Players
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#8B95A7] hover:text-[#F5F7FA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#FF3B30]/15 border border-[#FF3B30]/30 text-xs font-mono text-[#FF3B30]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#B8FF3D]/15 border border-[#B8FF3D]/30 text-xs font-mono text-[#B8FF3D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          {/* Team Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="text-xs font-mono text-[#8B95A7] block mb-1">Squad Name *</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. CS Strikers"
                className="w-full px-3 py-2 rounded-lg bg-[#121824] border border-[#1E293B] text-sm text-[#F5F7FA] font-heading font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#8B95A7] block mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#121824] border border-[#1E293B] text-xs text-[#F5F7FA] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#8B95A7] block mb-1">Hostel</label>
              <input
                type="text"
                value={hostel}
                onChange={e => setHostel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#121824] border border-[#1E293B] text-xs text-[#F5F7FA] font-mono"
              />
            </div>
          </div>

          {/* Player Roster List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase text-[#B8FF3D] tracking-wider">
                Official Squad Roster ({players.length} / {maxSize})
              </label>
              <span className={`text-[11px] font-mono ${players.length >= minSize ? 'text-[#B8FF3D]' : 'text-[#FF3B30]'}`}>
                {players.length >= minSize ? '✓ Eligibility Met' : `Need ${minSize - players.length} more`}
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {players.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#121824] border border-[#1E293B] text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-[#070A0F] border border-[#1E293B] flex items-center justify-center font-bold text-[#B8FF3D]">
                      #{p.jersey}
                    </span>
                    <div>
                      <div className="font-semibold text-[#F5F7FA]">
                        {p.name} {idx === 0 && <span className="text-[10px] text-[#B8FF3D] font-mono">(Captain)</span>}
                      </div>
                      <div className="text-[10px] text-[#8B95A7]">{p.department}</div>
                    </div>
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(idx)}
                      className="p-1 rounded text-[#8B95A7] hover:text-[#FF3B30] hover:bg-[#0B0F17]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Player Input Row */}
          {players.length < maxSize && (
            <div className="p-3 rounded-xl bg-[#070A0F] border border-[#1E293B] space-y-2">
              <span className="text-[11px] font-mono text-[#8B95A7] uppercase block">
                Add Team Member
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Player full name"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-[#121824] border border-[#1E293B] text-xs text-[#F5F7FA]"
                />
                <input
                  type="text"
                  placeholder="Jersey #"
                  value={newPlayerJersey}
                  onChange={e => setNewPlayerJersey(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-[#121824] border border-[#1E293B] text-xs text-[#F5F7FA] font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-[#B8FF3D]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#1E293B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#121824] text-xs font-mono text-[#8B95A7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={players.length < minSize}
              className="px-6 py-2.5 rounded-lg bg-[#B8FF3D] hover:bg-[#a6ed28] disabled:opacity-40 disabled:cursor-not-allowed text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
            >
              Register & Lock Squad
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
