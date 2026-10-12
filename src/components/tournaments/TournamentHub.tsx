import React, { useState } from 'react';
import { Tournament } from '../../lib/types';
import { useSportsClub } from '../../context/SportsClubContext';
import { useAuth } from '../../context/AuthContext';
import { BracketView } from './BracketView';
import { LiveMatchModal } from './LiveMatchModal';
import { TeamBuilderModal } from './TeamBuilderModal';
import { TournamentRegisterModal } from './TournamentRegisterModal';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Shield, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Plus
} from 'lucide-react';

interface TournamentHubProps {
  initialSportSlug?: string;
}

export const TournamentHub: React.FC<TournamentHubProps> = ({ initialSportSlug }) => {
  const { 
    tournaments, 
    rounds, 
    matches, 
    teams, 
    advanceWinnerInBracket,
    generateFixturesForTournament
  } = useSportsClub();
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'coach';

  // Selected tournament state
  const [selectedTournId, setSelectedTournId] = useState<string>(() => {
    if (initialSportSlug) {
      const match = tournaments.find(t => t.sport_name?.toLowerCase() === initialSportSlug.toLowerCase());
      if (match) return match.id;
    }
    return tournaments[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'bracket' | 'fixtures' | 'teams' | 'results'>('bracket');

  // Modals
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [teamBuilderOpen, setTeamBuilderOpen] = useState(false);

  const currentTournament = tournaments.find(t => t.id === selectedTournId) || tournaments[0];
  const tournamentTeams = teams.filter(t => t.tournament_id === currentTournament?.id);
  const tournamentMatches = matches.filter(m => m.tournament_id === currentTournament?.id);

  if (!currentTournament) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Tournament Selector Strip */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {tournaments.map((t) => {
          const isSelected = t.id === currentTournament.id;
          const isLive = t.status === 'live';
          const isOpen = t.status === 'registration_open';

          return (
            <button
              key={t.id}
              onClick={() => setSelectedTournId(t.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                isSelected
                  ? 'bg-[#121824] border-[#B8FF3D] text-[#F5F7FA] shadow-lg shadow-[#B8FF3D]/10'
                  : 'bg-[#0B0F17] border-[#1E293B] text-[#8B95A7] hover:border-[#8B95A7] hover:text-[#F5F7FA]'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#8B95A7]">
                    {t.sport_name}
                  </span>
                  {isLive && (
                    <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                  )}
                  {isOpen && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#B8FF3D]/20 text-[#B8FF3D] font-bold">
                      OPEN
                    </span>
                  )}
                </div>
                <span className={`text-xs font-heading font-bold truncate max-w-[200px] ${
                  isSelected ? 'text-[#B8FF3D]' : 'text-[#F5F7FA]'
                }`}>
                  {t.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Broadcast Tournament Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1E293B] bg-[#0B0F17] p-6 sm:p-10 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 filter grayscale-[30%]"
          style={{ backgroundImage: `url(${currentTournament.banner_image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A0F] via-[#070A0F]/85 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#B8FF3D] text-[#070A0F] font-mono font-bold text-xs uppercase tracking-wider">
                {currentTournament.sport_name}
              </span>

              {currentTournament.status === 'live' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40 font-mono font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                  LIVE CHAMPIONSHIP
                </span>
              ) : currentTournament.status === 'registration_open' ? (
                <span className="px-3 py-1 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-mono font-bold text-xs">
                  REGISTRATION OPEN
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#121824] text-[#8B95A7] font-mono text-xs">
                  {currentTournament.status.toUpperCase()}
                </span>
              )}

              <span className="text-xs font-mono text-[#8B95A7] uppercase">
                {currentTournament.format} Format
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#F5F7FA] uppercase">
              {currentTournament.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8B95A7]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#B8FF3D]" />
                {currentTournament.start_date} to {currentTournament.end_date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#00F0FF]" />
                {currentTournament.current_teams_count} / {currentTournament.max_teams} Teams Seeded
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {currentTournament.status === 'registration_open' && (
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                Register for Tournament
              </button>
            )}

            {currentTournament.min_team_size > 1 && (
              <button
                onClick={() => setTeamBuilderOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#121824] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#B8FF3D]/50 text-xs font-mono text-[#F5F7FA] transition-all"
              >
                <Users className="w-4 h-4 text-[#B8FF3D]" />
                Captain Squad Builder
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => generateFixturesForTournament(currentTournament.id)}
                className="px-4 py-3 rounded-xl bg-[#FF3B30]/20 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-[#070A0F] border border-[#FF3B30]/40 text-xs font-mono font-bold transition-all"
                title="Regenerate single-elimination knockout bracket"
              >
                Auto-Generate Fixtures
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="mt-8 pt-6 border-t border-[#1E293B]/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'bracket', label: 'Bracket View', icon: Trophy },
            { id: 'fixtures', label: 'Fixtures & Matches', icon: Flame },
            { id: 'teams', label: 'Teams & Qualifiers', icon: Users },
            { id: 'results', label: 'Match Results', icon: CheckCircle2 },
            { id: 'overview', label: 'Rules & Info', icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isTabActive
                    ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/20'
                    : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Main Tab Panels */}
      {activeTab === 'bracket' && (
        <div className="rounded-2xl border border-[#1E293B] bg-[#070A0F] p-4 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <span className="text-xs font-mono uppercase text-[#B8FF3D] font-bold">
                INTERACTIVE KNOCKOUT TREE
              </span>
              <p className="text-xs text-[#8B95A7] font-mono mt-0.5">
                Click any match to launch the live broadcast center or view final box scores.
              </p>
            </div>
            {isAdmin && (
              <span className="text-[11px] font-mono text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2.5 py-1 rounded-full">
                Admin Mode: Advance Winners Directly
              </span>
            )}
          </div>

          <BracketView
            tournamentId={currentTournament.id}
            rounds={rounds}
            matches={matches}
            teams={teams}
            onSelectMatch={matchId => setActiveMatchId(matchId)}
            onAdminSetWinner={(matchId, winnerTeamId) => {
              advanceWinnerInBracket(matchId, winnerTeamId);
            }}
          />
        </div>
      )}

      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournamentMatches.map((m) => {
              const isLive = m.status === 'live';
              const isDone = m.status === 'completed';

              return (
                <div
                  key={m.id}
                  onClick={() => setActiveMatchId(m.id)}
                  className={`p-5 rounded-2xl border bg-[#0B0F17] hover:border-[#B8FF3D]/60 transition-all cursor-pointer ${
                    isLive ? 'border-[#FF3B30]' : 'border-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-3">
                    <span className="text-[#8B95A7] uppercase">
                      {m.round_name} • {m.court_table || 'Arena'}
                    </span>
                    {isLive ? (
                      <span className="text-[#FF3B30] font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                        LIVE ({m.result?.extra_info?.timeRemaining || "74'"})
                      </span>
                    ) : isDone ? (
                      <span className="text-[#B8FF3D] font-semibold">FINAL RESULT</span>
                    ) : (
                      <span className="text-[#8B95A7] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(m.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-5 items-center gap-2 font-heading font-black text-lg">
                    <div className="col-span-2 truncate text-right">
                      {m.team1?.name || 'TBD'}
                    </div>

                    <div className="col-span-1 text-center font-mono text-xl text-[#B8FF3D]">
                      {m.result ? `${m.result.team1_score} - ${m.result.team2_score}` : 'vs'}
                    </div>

                    <div className="col-span-2 truncate text-left">
                      {m.team2?.name || 'TBD'}
                    </div>
                  </div>

                  {m.result?.extra_info?.scorers && (
                    <div className="mt-3 pt-3 border-t border-[#1E293B] text-xs font-mono text-[#8B95A7] truncate">
                      Scorers: {m.result.extra_info.scorers.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tournamentTeams.map((team) => {
            const isQualified = team.status === 'qualified';
            const isEliminated = team.status === 'eliminated';
            const isChampion = team.status === 'champion';

            return (
              <div
                key={team.id}
                className="p-5 rounded-2xl border border-[#1E293B] bg-[#0B0F17] hover:border-[#B8FF3D]/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8B95A7]">
                    Seed #{team.seed || '—'}
                  </span>
                  {isQualified ? (
                    <span className="px-2 py-0.5 rounded bg-[#B8FF3D]/20 text-[#B8FF3D] font-mono text-[10px] font-bold">
                      QUALIFIED
                    </span>
                  ) : isEliminated ? (
                    <span className="px-2 py-0.5 rounded bg-[#FF3B30]/20 text-[#FF3B30] font-mono text-[10px] font-bold">
                      ELIMINATED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[#121824] text-[#8B95A7] font-mono text-[10px]">
                      REGISTERED
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-heading font-black text-xl text-[#F5F7FA] uppercase tracking-tight">
                    {team.name}
                  </h4>
                  <p className="text-xs font-mono text-[#8B95A7] mt-0.5">
                    {team.department} • {team.hostel}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#8B95A7]">
                  <span>Captain: {team.captain_name || 'Captain'}</span>
                  <span>{team.players_count || 14} Squad</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          {tournamentMatches.filter(m => m.status === 'completed').length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0B0F17] border border-[#1E293B] text-xs font-mono text-[#8B95A7]">
              No matches completed yet. Tournament is currently in progress.
            </div>
          ) : (
            tournamentMatches
              .filter(m => m.status === 'completed')
              .map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveMatchId(m.id)}
                  className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] hover:border-[#B8FF3D]/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#B8FF3D]">
                      {m.round_name} • RESULT VERIFIED
                    </span>
                    <div className="text-xl font-heading font-black text-[#F5F7FA]">
                      {m.team1?.name} ({m.result?.team1_score}) vs {m.team2?.name} ({m.result?.team2_score})
                    </div>
                    {m.result?.extra_info?.scorers && (
                      <p className="text-xs font-mono text-[#8B95A7]">
                        Highlights: {m.result.extra_info.scorers.join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-mono text-[#B8FF3D] font-bold">
                      Winner: {teams.find(t => t.id === m.result?.winner_team_id)?.name || 'Qualified'}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="p-8 rounded-2xl bg-[#0B0F17] border border-[#1E293B] space-y-6">
          <div>
            <h3 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
              Tournament Rules & Format
            </h3>
            <p className="text-sm text-[#8B95A7] mt-2 leading-relaxed">
              {currentTournament.rules}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1E293B]">
            <div>
              <span className="text-xs font-mono text-[#8B95A7] uppercase block">
                Campus Cup Points
              </span>
              <p className="text-sm font-bold text-[#F5F7FA] mt-1">
                Gold: 100 pts | Silver: 60 pts | SF: 30 pts
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-[#8B95A7] uppercase block">
                Disciplinary Protocol
              </span>
              <p className="text-sm font-bold text-[#F5F7FA] mt-1">
                2 Yellow Cards = 1 Match Suspension
              </p>
            </div>

            <div>
              <span className="text-xs font-mono text-[#8B95A7] uppercase block">
                Certificates
              </span>
              <p className="text-sm font-bold text-[#B8FF3D] mt-1">
                Auto-Issued at Tournament Conclusion
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <LiveMatchModal
        matchId={activeMatchId}
        onClose={() => setActiveMatchId(null)}
      />

      <TournamentRegisterModal
        isOpen={registerModalOpen}
        tournament={currentTournament}
        onClose={() => setRegisterModalOpen(false)}
        onOpenTeamBuilder={() => setTeamBuilderOpen(true)}
      />

      <TeamBuilderModal
        isOpen={teamBuilderOpen}
        tournament={currentTournament}
        onClose={() => setTeamBuilderOpen(false)}
      />

    </div>
  );
};
