import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Sport, 
  Venue, 
  Tournament, 
  TournamentTeam, 
  TournamentRound, 
  Match, 
  Ranking, 
  UpdateItem, 
  GalleryItem, 
  Registration, 
  Certificate 
} from '../lib/types';
import { 
  mockSports, 
  mockVenues, 
  mockTournaments, 
  mockTeams, 
  mockRounds, 
  mockMatches, 
  mockCampusCupStandings, 
  mockHostelCupStandings, 
  mockUpdates, 
  mockGallery, 
  mockRegistrations, 
  mockCertificates 
} from '../lib/mockData';
import { generateKnockoutFixtures } from '../lib/fixtureGenerator';

interface SportsClubContextType {
  sports: Sport[];
  venues: Venue[];
  tournaments: Tournament[];
  teams: TournamentTeam[];
  rounds: TournamentRound[];
  matches: Match[];
  campusCupStandings: Ranking[];
  hostelCupStandings: Ranking[];
  updates: UpdateItem[];
  gallery: GalleryItem[];
  registrations: Registration[];
  certificates: Certificate[];
  selectedSportFilter: string;
  setSelectedSportFilter: (slug: string) => void;
  // Mutations
  updateMatchScore: (
    matchId: string, 
    team1Score: number, 
    team2Score: number, 
    winnerTeamId?: string, 
    extraInfo?: any
  ) => void;
  advanceWinnerInBracket: (matchId: string, winnerTeamId: string) => void;
  registerParticipant: (data: Partial<Registration>) => Promise<Registration>;
  createTeam: (team: Omit<TournamentTeam, 'id' | 'status' | 'players_count'>) => Promise<TournamentTeam>;
  createTournament: (tourn: Omit<Tournament, 'id' | 'current_teams_count'>) => Promise<Tournament>;
  publishUpdate: (item: Omit<UpdateItem, 'id' | 'created_at'>) => Promise<UpdateItem>;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<GalleryItem>;
  checkInQrCode: (token: string) => { success: boolean; message: string; registration?: Registration };
  generateFixturesForTournament: (tournamentId: string) => void;
}

const SportsClubContext = createContext<SportsClubContextType | undefined>(undefined);

export const SportsClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sports] = useState<Sport[]>(mockSports);
  const [venues] = useState<Venue[]>(mockVenues);
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('svec_tournaments') || localStorage.getItem('titan_tournaments');
    return saved ? JSON.parse(saved) : mockTournaments;
  });
  const [teams, setTeams] = useState<TournamentTeam[]>(() => {
    const saved = localStorage.getItem('svec_teams') || localStorage.getItem('titan_teams');
    return saved ? JSON.parse(saved) : mockTeams;
  });
  const [rounds, setRounds] = useState<TournamentRound[]>(() => {
    const saved = localStorage.getItem('svec_rounds') || localStorage.getItem('titan_rounds');
    return saved ? JSON.parse(saved) : mockRounds;
  });
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('svec_matches') || localStorage.getItem('titan_matches');
    return saved ? JSON.parse(saved) : mockMatches;
  });
  const [campusCupStandings, setCampusCupStandings] = useState<Ranking[]>(() => {
    const saved = localStorage.getItem('svec_campus_cup') || localStorage.getItem('titan_campus_cup');
    return saved ? JSON.parse(saved) : mockCampusCupStandings;
  });
  const [hostelCupStandings, setHostelCupStandings] = useState<Ranking[]>(() => {
    const saved = localStorage.getItem('svec_hostel_cup') || localStorage.getItem('titan_hostel_cup');
    return saved ? JSON.parse(saved) : mockHostelCupStandings;
  });
  const [updates, setUpdates] = useState<UpdateItem[]>(() => {
    const saved = localStorage.getItem('svec_updates') || localStorage.getItem('titan_updates');
    return saved ? JSON.parse(saved) : mockUpdates;
  });
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('svec_gallery') || localStorage.getItem('titan_gallery');
    return saved ? JSON.parse(saved) : mockGallery;
  });
  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('svec_registrations') || localStorage.getItem('titan_registrations');
    return saved ? JSON.parse(saved) : mockRegistrations;
  });
  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('svec_certificates') || localStorage.getItem('titan_certificates');
    return saved ? JSON.parse(saved) : mockCertificates;
  });

  const [selectedSportFilter, setSelectedSportFilter] = useState<string>('all');

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem('svec_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('svec_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem('svec_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('svec_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('svec_updates', JSON.stringify(updates));
  }, [updates]);

  // Update live match scores
  const updateMatchScore = (
    matchId: string, 
    team1Score: number, 
    team2Score: number, 
    winnerTeamId?: string, 
    extraInfo?: any
  ) => {
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const isFinished = Boolean(winnerTeamId);
      return {
        ...m,
        status: isFinished ? 'completed' : 'live',
        result: {
          id: m.result?.id || `res_${matchId}`,
          match_id: matchId,
          team1_score: team1Score,
          team2_score: team2Score,
          winner_team_id: winnerTeamId || (team1Score > team2Score ? m.team1_id : team2Score > team1Score ? m.team2_id : undefined),
          extra_info: {
            ...m.result?.extra_info,
            ...extraInfo
          },
          verified_by_admin: true
        }
      };
    }));

    if (winnerTeamId) {
      advanceWinnerInBracket(matchId, winnerTeamId);
    }
  };

  // Move winner to next bracket node
  const advanceWinnerInBracket = (matchId: string, winnerTeamId: string) => {
    const currentMatch = matches.find(m => m.id === matchId);
    if (!currentMatch || !currentMatch.next_match_id) return;

    const winner = teams.find(t => t.id === winnerTeamId);
    if (!winner) return;

    // Update team status to qualified
    setTeams(prev => prev.map(t => {
      if (t.id === winnerTeamId) {
        return { ...t, status: 'qualified' };
      }
      if (t.id === (currentMatch.team1_id === winnerTeamId ? currentMatch.team2_id : currentMatch.team1_id)) {
        return { ...t, status: 'eliminated' };
      }
      return t;
    }));

    // Advance to next match node
    setMatches(prev => prev.map(m => {
      if (m.id !== currentMatch.next_match_id) return m;
      // Assign into team1 if empty, or team2
      if (!m.team1_id || m.team1_id === winnerTeamId) {
        return { ...m, team1_id: winnerTeamId, team1: winner };
      } else {
        return { ...m, team2_id: winnerTeamId, team2: winner };
      }
    }));
  };

  // Register participant
  const registerParticipant = async (data: Partial<Registration>): Promise<Registration> => {
    const newReg: Registration = {
      id: `reg_${Date.now()}`,
      tournament_id: data.tournament_id || '',
      tournament_title: data.tournament_title || 'Tournament',
      sport_name: data.sport_name || 'Sport',
      profile_id: data.profile_id || '',
      profile_name: data.profile_name || 'Participant',
      team_id: data.team_id,
      team_name: data.team_name,
      registration_type: data.registration_type || 'individual',
      status: 'approved',
      qr_code_token: `SVEC-QR-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };

    setRegistrations(prev => [newReg, ...prev]);

    // Update tournament current_teams_count
    if (data.tournament_id) {
      setTournaments(prev => prev.map(t => {
        if (t.id === data.tournament_id) {
          return { ...t, current_teams_count: t.current_teams_count + 1 };
        }
        return t;
      }));
    }

    return newReg;
  };

  // Create team
  const createTeam = async (teamData: Omit<TournamentTeam, 'id' | 'status' | 'players_count'>): Promise<TournamentTeam> => {
    const newTeam: TournamentTeam = {
      ...teamData,
      id: `team_${Date.now()}`,
      status: 'registered',
      players_count: 1
    };

    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  // Create tournament
  const createTournament = async (tournData: Omit<Tournament, 'id' | 'current_teams_count'>): Promise<Tournament> => {
    const newTourn: Tournament = {
      ...tournData,
      id: `tourn_${Date.now()}`,
      current_teams_count: 0
    };

    setTournaments(prev => [newTourn, ...prev]);
    return newTourn;
  };

  // Publish update
  const publishUpdate = async (itemData: Omit<UpdateItem, 'id' | 'created_at'>): Promise<UpdateItem> => {
    const newItem: UpdateItem = {
      ...itemData,
      id: `upd_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setUpdates(prev => [newItem, ...prev]);
    return newItem;
  };

  // Add gallery item
  const addGalleryItem = async (itemData: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal_${Date.now()}`
    };

    setGallery(prev => [newItem, ...prev]);
    return newItem;
  };

  // QR Code check-in
  const checkInQrCode = (token: string) => {
    const cleanToken = token.trim();
    const reg = registrations.find(r => r.qr_code_token.toLowerCase() === cleanToken.toLowerCase());

    if (!reg) {
      return { success: false, message: 'Invalid QR token. Athlete registration not found.' };
    }

    if (reg.status === 'checked_in') {
      return { 
        success: true, 
        message: `Athlete ${reg.profile_name} is already checked in for ${reg.tournament_title}.`,
        registration: reg 
      };
    }

    const updatedReg: Registration = {
      ...reg,
      status: 'checked_in',
      checked_in_at: new Date().toISOString()
    };

    setRegistrations(prev => prev.map(r => r.id === reg.id ? updatedReg : r));

    return { 
      success: true, 
      message: `Successfully verified and checked in ${reg.profile_name} for ${reg.tournament_title}!`,
      registration: updatedReg
    };
  };

  // Fixture generator action
  const generateFixturesForTournament = (tournamentId: string) => {
    const tourn = tournaments.find(t => t.id === tournamentId);
    if (!tourn) return;

    const tournTeams = teams.filter(t => t.tournament_id === tournamentId);
    if (tournTeams.length < 2) return;

    const defaultVenue = venues[0]?.id || 'ven_turf';
    const { rounds: genRounds, matches: genMatches } = generateKnockoutFixtures(
      tournamentId, 
      defaultVenue, 
      tournTeams, 
      tourn.start_date
    );

    setRounds(prev => [...prev.filter(r => r.tournament_id !== tournamentId), ...genRounds]);
    setMatches(prev => [...prev.filter(m => m.tournament_id !== tournamentId), ...genMatches]);
  };

  return (
    <SportsClubContext.Provider
      value={{
        sports,
        venues,
        tournaments,
        teams,
        rounds,
        matches,
        campusCupStandings,
        hostelCupStandings,
        updates,
        gallery,
        registrations,
        certificates,
        selectedSportFilter,
        setSelectedSportFilter,
        updateMatchScore,
        advanceWinnerInBracket,
        registerParticipant,
        createTeam,
        createTournament,
        publishUpdate,
        addGalleryItem,
        checkInQrCode,
        generateFixturesForTournament
      }}
    >
      {children}
    </SportsClubContext.Provider>
  );
};

export const useSportsClub = () => {
  const context = useContext(SportsClubContext);
  if (!context) {
    throw new Error('useSportsClub must be used within a SportsClubProvider');
  }
  return context;
};
