import { supabase } from '../supabase';
import { Registration } from '../types';

export interface RegisterTournamentParams {
  tournamentId: string;
  registrationType: 'individual' | 'team';
  teamName?: string;
  rosterUserIds?: string[];
}

export const registrationsApi = {
  async getAll(tournamentId?: string): Promise<Registration[]> {
    let query = supabase
      .from('registrations')
      .select('*, tournaments(title, sports(name)), profiles(full_name), tournament_teams(name)');
    
    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('registrationsApi.getAll:', error.message);
      return [];
    }

    return (data || []).map((r: any) => ({
      ...r,
      tournament_title: r.tournaments?.title || '',
      sport_name: r.tournaments?.sports?.name || '',
      profile_name: r.profiles?.full_name || '',
      team_name: r.tournament_teams?.name || r.team_name || ''
    }));
  },

  async getMyRegistrations(): Promise<Registration[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('registrations')
      .select('*, tournaments(id, title, status, start_date, sports(name), venues(name)), profiles(full_name), tournament_teams(name, status)')
      .eq('profile_id', user.id)
      .order('registered_at', { ascending: false });

    if (error) {
      console.warn('registrationsApi.getMyRegistrations:', error.message);
      return [];
    }

    return (data || []).map((r: any) => ({
      ...r,
      tournament_title: r.tournaments?.title || '',
      tournament_status: r.tournaments?.status || 'upcoming',
      tournament_start_date: r.tournaments?.start_date,
      venue_name: r.tournaments?.venues?.name,
      sport_name: r.tournaments?.sports?.name || '',
      profile_name: r.profiles?.full_name || '',
      team_name: r.tournament_teams?.name || r.team_name || ''
    }));
  },

  async register(params: RegisterTournamentParams): Promise<{
    registration_id: string;
    status: 'approved' | 'waitlisted' | 'pending';
    qr_token: string;
    team_id?: string;
  }> {
    const { data, error } = await supabase.rpc('register_for_tournament', {
      p_tournament_id: params.tournamentId,
      p_registration_type: params.registrationType,
      p_team_name: params.teamName || null,
      p_roster_user_ids: params.rosterUserIds || []
    });

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'approved' | 'waitlisted' | 'checked_in' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async checkInQr(token: string): Promise<{ success: boolean; message: string; registration?: Registration }> {
    const { data, error } = await supabase
      .from('registrations')
      .select('*, tournaments(title), profiles(full_name)')
      .eq('qr_code_token', token)
      .maybeSingle();

    if (error || !data) {
      return { success: false, message: 'Invalid or expired QR token.' };
    }

    if (data.status === 'checked_in') {
      return {
        success: false,
        message: `Athlete/Team already checked in at ${new Date(data.checked_in_at).toLocaleTimeString()}`,
        registration: data
      };
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('registrations')
      .update({ status: 'checked_in', checked_in_at: now })
      .eq('id', data.id);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return {
      success: true,
      message: `Successfully checked in for ${data.tournaments?.title || 'Tournament'}!`,
      registration: { ...data, status: 'checked_in', checked_in_at: now }
    };
  }
};
