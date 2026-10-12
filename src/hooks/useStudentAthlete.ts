import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { profilesApi } from '../lib/api/profiles';
import { selectionTrialsApi } from '../lib/api/selectionTrials';
import { registrationsApi } from '../lib/api/registrations';
import { certificatesApi } from '../lib/api/certificates';
import { notificationsApi, StudentNotification } from '../lib/api/notifications';
import { Profile, SelectionRegistration, Registration, Certificate } from '../lib/types';

// Verified Sport Participation Record
export interface AthleteSportParticipation {
  id: string;
  sport_id: string;
  sport_name: string;
  sport_category?: string;
  sport_icon?: string;
  role_designation?: string;
  team_name?: string;
  jersey_number?: number;
  is_captain?: boolean;
  status: string;
  source: 'varsity_selection' | 'tournament_roster' | 'tournament_entry';
}

// Published Student Result Record
export interface StudentResult {
  id: string;
  type: 'selection_trial' | 'tournament_match' | 'podium_finish';
  title: string;
  sport_name: string;
  outcome: 'selected' | 'standby' | 'not_selected' | 'won' | 'runner_up' | 'participated';
  badge_label: string;
  date: string;
  details?: string;
  rank_achieved?: string;
  certificate_no?: string;
}

// Student Performance Statistics
export interface StudentPerformanceStatistics {
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  win_rate: number;
  tournament_appearances: number;
  selection_trials_attended: number;
  varsity_selections: number;
  certificates_count: number;
  has_recorded_stats: boolean;
}

// 1. Hook: useMyProfile
export function useMyProfile() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<Profile | null>({
    queryKey: ['student', 'profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      if (isSupabaseConfigured) {
        const profile = await profilesApi.getMyProfile();
        if (profile) return profile;
      }
      return currentUser;
    },
    enabled: !!userId,
  });
}

// 2. Hook: useMySports
export function useMySports() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<AthleteSportParticipation[]>({
    queryKey: ['student', 'sports', userId],
    queryFn: async () => {
      if (!userId) return [];
      const participations: AthleteSportParticipation[] = [];
      const seenSports = new Set<string>();

      if (isSupabaseConfigured) {
        try {
          // Check varsity team selections
          const { data: trialSelections } = await supabase
            .from('selection_registrations')
            .select(`
              id, status, evaluation_status,
              trial:selection_trials(id, title, results_published, sports(id, name, category, icon))
            `)
            .eq('profile_id', userId)
            .eq('evaluation_status', 'selected');

          (trialSelections || []).forEach((item: any) => {
            const sport = item.trial?.sports;
            if (sport?.name && !seenSports.has(sport.name.toLowerCase())) {
              seenSports.add(sport.name.toLowerCase());
              participations.push({
                id: item.id,
                sport_id: sport.id,
                sport_name: sport.name,
                sport_category: sport.category,
                sport_icon: sport.icon,
                role_designation: 'Varsity Selected Athlete',
                status: 'Active Varsity',
                source: 'varsity_selection'
              });
            }
          });

          // Check tournament roster memberships
          const { data: teamPlayers } = await supabase
            .from('tournament_players')
            .select(`
              id, jersey_number, is_captain,
              team:tournament_teams(
                name, status,
                tournament:tournaments(id, title, sports(id, name, category, icon))
              )
            `)
            .eq('profile_id', userId);

          (teamPlayers || []).forEach((tp: any) => {
            const sport = tp.team?.tournament?.sports;
            if (sport?.name && !seenSports.has(sport.name.toLowerCase())) {
              seenSports.add(sport.name.toLowerCase());
              participations.push({
                id: tp.id,
                sport_id: sport.id,
                sport_name: sport.name,
                sport_category: sport.category,
                sport_icon: sport.icon,
                team_name: tp.team?.name,
                jersey_number: tp.jersey_number || undefined,
                is_captain: !!tp.is_captain,
                role_designation: tp.is_captain ? 'Team Captain' : 'Varsity Squad Member',
                status: tp.team?.status === 'approved' ? 'Active Squad' : 'Registered',
                source: 'tournament_roster'
              });
            }
          });

          // Check direct tournament registrations
          const { data: tournRegs } = await supabase
            .from('registrations')
            .select(`
              id, status, registration_type,
              tournament:tournaments(id, title, sports(id, name, category, icon)),
              team:tournament_teams(name)
            `)
            .eq('profile_id', userId)
            .in('status', ['approved', 'checked_in']);

          (tournRegs || []).forEach((reg: any) => {
            const sport = reg.tournament?.sports;
            if (sport?.name && !seenSports.has(sport.name.toLowerCase())) {
              seenSports.add(sport.name.toLowerCase());
              participations.push({
                id: reg.id,
                sport_id: sport.id,
                sport_name: sport.name,
                sport_category: sport.category,
                sport_icon: sport.icon,
                team_name: reg.team?.name,
                role_designation: reg.registration_type === 'team' ? 'Team Member' : 'Competitor',
                status: 'Competitor',
                source: 'tournament_entry'
              });
            }
          });
        } catch (err) {
          console.warn('Error fetching student sports participations:', err);
        }
      }

      return participations;
    },
    enabled: !!userId,
  });
}

// 3. Hook: useMySelectionTrials
export function useMySelectionTrials() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<SelectionRegistration[]>({
    queryKey: ['student', 'trials', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await selectionTrialsApi.getMyRegistrations();
    },
    enabled: !!userId,
  });
}

// 4. Hook: useMyTournamentRegistrations
export function useMyTournamentRegistrations() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<Registration[]>({
    queryKey: ['student', 'tournamentRegistrations', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await registrationsApi.getMyRegistrations();
    },
    enabled: !!userId,
  });
}

// 5. Hook: useMyCertificates
export function useMyCertificates() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<Certificate[]>({
    queryKey: ['student', 'certificates', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await certificatesApi.getMyCertificates();
    },
    enabled: !!userId,
  });
}

// 6. Hook: useMyResults
export function useMyResults() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<StudentResult[]>({
    queryKey: ['student', 'results', userId],
    queryFn: async () => {
      if (!userId) return [];
      const results: StudentResult[] = [];

      // 1. Published selection trials
      const trials = await selectionTrialsApi.getMyRegistrations();
      trials.forEach(t => {
        if (t.results_published && t.evaluation_status && t.evaluation_status !== 'pending') {
          results.push({
            id: `trial-res-${t.id}`,
            type: 'selection_trial',
            title: t.trial_title || 'Varsity Selection Trial',
            sport_name: t.sport_name || 'Athletics',
            outcome: t.evaluation_status as any,
            badge_label: t.evaluation_status === 'selected' ? 'SELECTED' : t.evaluation_status === 'standby' ? 'STANDBY' : 'NOT SELECTED',
            date: t.registered_at,
            details: `Session: ${t.session_title || 'General'}`
          });
        }
      });

      // 2. Official Certificates / Podium finishes
      const certs = await certificatesApi.getMyCertificates();
      certs.forEach(c => {
        results.push({
          id: `cert-res-${c.id}`,
          type: 'podium_finish',
          title: c.tournament_title,
          sport_name: c.sport_name,
          outcome: c.rank_achieved.toLowerCase().includes('winner') ? 'won' : 'runner_up',
          badge_label: c.rank_achieved.toUpperCase(),
          date: c.issue_date,
          rank_achieved: c.rank_achieved,
          certificate_no: c.certificate_no
        });
      });

      return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    enabled: !!userId,
  });
}

// 7. Hook: useMyStatistics
export function useMyStatistics() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  return useQuery<StudentPerformanceStatistics>({
    queryKey: ['student', 'statistics', userId],
    queryFn: async () => {
      if (!userId) {
        return {
          matches_played: 0,
          matches_won: 0,
          matches_lost: 0,
          win_rate: 0,
          tournament_appearances: 0,
          selection_trials_attended: 0,
          varsity_selections: 0,
          certificates_count: 0,
          has_recorded_stats: false,
        };
      }

      let matchesPlayed = 0;
      let matchesWon = 0;
      let tournamentAppearances = 0;
      let trialsAttended = 0;
      let varsitySelections = 0;
      let certificatesCount = 0;

      if (isSupabaseConfigured) {
        try {
          // 1. Fetch user's team IDs
          const { data: teamsData } = await supabase
            .from('tournament_players')
            .select('team_id')
            .eq('profile_id', userId);

          const teamIds = (teamsData || []).map((t: any) => t.team_id).filter(Boolean);

          if (teamIds.length > 0) {
            // Completed matches involving these teams
            const { data: matchesData } = await supabase
              .from('matches')
              .select('id, team1_id, team2_id, winner_team_id, status')
              .eq('status', 'completed')
              .or(`team1_id.in.(${teamIds.join(',')}),team2_id.in.(${teamIds.join(',')})`);

            matchesPlayed = matchesData?.length || 0;
            matchesWon = (matchesData || []).filter((m: any) => teamIds.includes(m.winner_team_id)).length;
          }

          // 2. Tournament registrations
          const { data: tournRegs } = await supabase
            .from('registrations')
            .select('id, tournament_id')
            .eq('profile_id', userId)
            .in('status', ['approved', 'checked_in']);

          const uniqueTournaments = new Set((tournRegs || []).map((r: any) => r.tournament_id));
          tournamentAppearances = uniqueTournaments.size;

          // 3. Selection trial check-ins & selections
          const { data: trialRegs } = await supabase
            .from('selection_registrations')
            .select('id, status, evaluation_status, trial:selection_trials(results_published)')
            .eq('profile_id', userId);

          (trialRegs || []).forEach((tr: any) => {
            if (tr.status === 'checked_in') trialsAttended++;
            if (tr.trial?.results_published && tr.evaluation_status === 'selected') {
              varsitySelections++;
            }
          });

          // 4. Certificates count
          const { data: certs } = await supabase
            .from('certificates')
            .select('id')
            .eq('profile_id', userId)
            .eq('is_deleted', false)
            .eq('status', 'issued');

          certificatesCount = certs?.length || 0;
        } catch (err) {
          console.warn('Error computing real student statistics:', err);
        }
      }

      const matchesLost = Math.max(0, matchesPlayed - matchesWon);
      const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
      const hasRecordedStats = matchesPlayed > 0 || tournamentAppearances > 0 || trialsAttended > 0 || certificatesCount > 0;

      return {
        matches_played: matchesPlayed,
        matches_won: matchesWon,
        matches_lost: matchesLost,
        win_rate: winRate,
        tournament_appearances: tournamentAppearances,
        selection_trials_attended: trialsAttended,
        varsity_selections: varsitySelections,
        certificates_count: certificatesCount,
        has_recorded_stats: hasRecordedStats
      };
    },
    enabled: !!userId,
  });
}

// 8. Hook: useMyNotifications
export function useMyNotifications() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;
  const queryClient = useQueryClient();

  const query = useQuery<StudentNotification[]>({
    queryKey: ['student', 'notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const dbNotifications = await notificationsApi.getMyNotifications();

      // Synthesize dynamic notifications from active trial passes if DB empty
      const trialPasses = await selectionTrialsApi.getMyRegistrations();
      const syntheticAlerts: StudentNotification[] = [];

      trialPasses.forEach(tp => {
        if (tp.status === 'checked_in') {
          syntheticAlerts.push({
            id: `notif-checkin-${tp.id}`,
            profile_id: userId,
            title: 'Attendance Gate Verified',
            message: `Check-in confirmed for ${tp.trial_title || 'Selection Trial'} (${tp.session_title || 'Session'}).`,
            type: 'registration',
            read: true,
            created_at: tp.registered_at
          });
        }
        if (tp.results_published && tp.evaluation_status && tp.evaluation_status !== 'pending') {
          syntheticAlerts.push({
            id: `notif-result-${tp.id}`,
            profile_id: userId,
            title: 'Selection Trial Results Published',
            message: `Official results published for ${tp.trial_title}. Decision: ${tp.evaluation_status.toUpperCase()}.`,
            type: 'general',
            read: false,
            created_at: tp.registered_at
          });
        }
      });

      // Merge and sort
      const merged = [...dbNotifications];
      syntheticAlerts.forEach(syn => {
        if (!merged.some(m => m.id === syn.id)) {
          merged.push(syn);
        }
      });

      return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!userId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notifId: string) => notificationsApi.markAsRead(notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications', userId] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications', userId] });
    }
  });

  return {
    ...query,
    notifications: query.data || [],
    unreadCount: (query.data || []).filter(n => !n.read).length,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
}
