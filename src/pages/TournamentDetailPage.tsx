import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSportsClub } from '../context/SportsClubContext';
import { useAuth } from '../context/AuthContext';
import { BracketView } from '../components/tournaments/BracketView';
import { LiveMatchModal } from '../components/tournaments/LiveMatchModal';
import { TeamBuilderModal } from '../components/tournaments/TeamBuilderModal';
import { TournamentRegisterModal } from '../components/tournaments/TournamentRegisterModal';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Shield, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  Plus,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    tournaments, 
    rounds, 
    matches, 
    teams, 
    advanceWinnerInBracket,
    generateFixturesForTournament
  } = useSportsClub();
  const { role, switchRole } = useAuth();
  const isAdmin = role === 'admin' || role === 'coach';
  const isMember = role === 'member' || role === 'admin' || role === 'coach';

  // State
  const [activeTab, setActiveTab] = useState<'bracket' | 'fixtures' | 'teams' | 'results' | 'overview'>('bracket');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // Modals closed by default!
  const [teamBuilderOpen, setTeamBuilderOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  // Find tournament by ID or slug
  const tournament = tournaments.find(t => t.id === id || t.slug === id);

  // Requirement (5): "show a 'Tournament not found' state for invalid /tournaments/:id"
  if (!tournament) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-[#0B0F17] border border-[#1E293B] shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/20 border border-[#FF3B30]/40 text-[#FF3B30] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-[#121824] text-[#FF3B30] font-mono text-xs font-bold uppercase">
              NOT FOUND
            </span>
            <h2 className="text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-3">
              TOURNAMENT NOT FOUND
            </h2>
            <p className="text-xs font-mono text-[#8B95A7] mt-2">
              No tournament matches the ID <code className="text-[#F5F7FA] bg-[#121824] px-1.5 py-0.5 rounded">{id}</code>. It may have concluded or the URL may be incorrect.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1E293B]">
            <Link
              to="/tournaments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Tournaments Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tournamentTeams = teams.filter(t => t.tournament_id === tournament.id);
  const tournamentMatches = matches.filter(m => m.tournament_id === tournament.id);

  const handleRegisterTeamClick = () => {
    if (!isMember) {
      setAuthPromptOpen(true);
      return;
    }
    setTeamBuilderOpen(true);
  };

  const handleRegisterIndividualClick = () => {
    if (!isMember) {
      setAuthPromptOpen(true);
      return;
    }
    setRegisterModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Link */}
      <Link
        to="/tournaments"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#8B95A7] hover:text-[#B8FF3D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Tournaments
      </Link>

      {/* Broadcast Tournament Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1E293B] bg-[#0B0F17] p-6 sm:p-10 shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 filter grayscale-[30%]"
          style={{ backgroundImage: `url(${tournament.banner_image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A0F] via-[#070A0F]/85 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#B8FF3D] text-[#070A0F] font-mono font-bold text-xs uppercase tracking-wider">
                {tournament.sport_name}
              </span>

              {tournament.status === 'live' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40 font-mono font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                  LIVE CHAMPIONSHIP
                </span>
              ) : tournament.status === 'registration_open' ? (
                <span className="px-3 py-1 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 font-mono font-bold text-xs">
                  REGISTRATION OPEN
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#121824] text-[#8B95A7] font-mono text-xs">
                  {tournament.status.toUpperCase()}
                </span>
              )}

              <span className="text-xs font-mono text-[#8B95A7] uppercase">
                {tournament.format} Format
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#F5F7FA] uppercase">
              {tournament.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8B95A7]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#B8FF3D]" />
                {tournament.start_date} to {tournament.end_date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#00F0FF]" />
                {tournament.current_teams_count} / {tournament.max_teams} Teams Seeded
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {tournament.min_team_size > 1 ? (
              <button
                onClick={handleRegisterTeamClick}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" />
                Register Your Team
              </button>
            ) : (
              <button
                onClick={handleRegisterIndividualClick}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Register Athlete Entry
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => generateFixturesForTournament(tournament.id)}
                className="px-4 py-3 rounded-xl bg-[#FF3B30]/20 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-[#070A0F] border border-[#FF3B30]/40 text-xs font-mono font-bold transition-all cursor-pointer"
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
                Click any match to launch the live broadcast center or view box scores.
              </p>
            </div>
            {isAdmin && (
              <span className="text-[11px] font-mono text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2.5 py-1 rounded-full">
                Admin Mode: Advance Winners Directly
              </span>
            )}
          </div>

          <BracketView
            tournamentId={tournament.id}
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
              {tournament.rules}
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

      {/* Match Modal */}
      <LiveMatchModal
        matchId={activeMatchId}
        onClose={() => setActiveMatchId(null)}
      />

      {/* Team Builder Modal - strictly gated by teamBuilderOpen */}
      <TeamBuilderModal
        isOpen={teamBuilderOpen}
        tournament={tournament}
        onClose={() => setTeamBuilderOpen(false)}
      />

      {/* Solo Register Modal - strictly gated by registerModalOpen */}
      <TournamentRegisterModal
        isOpen={registerModalOpen}
        tournament={tournament}
        onClose={() => setRegisterModalOpen(false)}
        onOpenTeamBuilder={() => {
          setRegisterModalOpen(false);
          setTeamBuilderOpen(true);
        }}
      />

      {/* Guest Login Alert Prompt */}
      {authPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0F]/85 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-[#0B0F17] border border-[#1E293B] p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#B8FF3D]/20 text-[#B8FF3D] flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
                MEMBER LOGIN REQUIRED
              </h3>
              <p className="text-xs font-mono text-[#8B95A7] mt-1">
                You are currently browsing as a Public Guest. To captain a squad and register for {tournament.title}, please sign in as an athlete.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setAuthPromptOpen(false)}
                className="flex-1 py-2 rounded-lg bg-[#121824] text-xs font-mono text-[#8B95A7]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  switchRole('member');
                  setAuthPromptOpen(false);
                  setTeamBuilderOpen(true);
                }}
                className="flex-1 py-2 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow"
              >
                Sign In & Register
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
