import { supabase } from '../supabase';
import { Tournament, TournamentRound, TournamentTeam, TournamentPlayer } from '../types';

export const tournamentsApi = {
  async getAll(): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, sports(name), venues(name)')
      .order('start_date', { ascending: false });
    if (error) {
      console.warn('tournamentsApi.getAll:', error.message);
      return [];
    }
    return (data || []).map((t: any) => ({
      ...t,
      sport_name: t.sports?.name || t.sport_name || '',
      venue_name: t.venues?.name || t.venue_name || '',
      current_teams_count: t.current_teams_count || 0
    }));
  },

  async getById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, sports(name), venues(name)')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return {
      ...data,
      sport_name: data.sports?.name || data.sport_name || '',
      venue_name: data.venues?.name || data.venue_name || '',
      current_teams_count: data.current_teams_count || 0
    };
  },

  async getBySlug(slug: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, sports(name), venues(name)')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) return null;
    return {
      ...data,
      sport_name: data.sports?.name || data.sport_name || '',
      venue_name: data.venues?.name || data.venue_name || '',
      current_teams_count: data.current_teams_count || 0
    };
  },

  async create(tournament: Omit<Tournament, 'id' | 'current_teams_count'>): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournament])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Rounds
  async getRounds(tournamentId: string): Promise<TournamentRound[]> {
    const { data, error } = await supabase
      .from('tournament_rounds')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true });
    if (error) {
      console.warn('tournamentsApi.getRounds:', error.message);
      return [];
    }
    return data || [];
  },

  // Teams
  async getTeams(tournamentId?: string): Promise<TournamentTeam[]> {
    let query = supabase.from('tournament_teams').select('*, profiles(full_name)');
    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }
    const { data, error } = await query.order('name');
    if (error) {
      console.warn('tournamentsApi.getTeams:', error.message);
      return [];
    }
    return (data || []).map((team: any) => ({
      ...team,
      captain_name: team.profiles?.full_name || team.captain_name || ''
    }));
  },

  async createTeam(team: Omit<TournamentTeam, 'id' | 'created_at'>): Promise<TournamentTeam> {
    const { data, error } = await supabase
      .from('tournament_teams')
      .insert([team])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getPlayers(teamId: string): Promise<TournamentPlayer[]> {
    const { data, error } = await supabase
      .from('tournament_players')
      .select('*, profiles(full_name, department)')
      .eq('team_id', teamId);
    if (error) return [];
    return (data || []).map((p: any) => ({
      ...p,
      full_name: p.profiles?.full_name || p.full_name || '',
      department: p.profiles?.department || p.department || ''
    }));
  }
};
