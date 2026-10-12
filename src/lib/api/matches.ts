import { supabase } from '../supabase';
import { Match, MatchResult } from '../types';

export const matchesApi = {
  async getAll(tournamentId?: string): Promise<Match[]> {
    let query = supabase
      .from('matches')
      .select(`
        *,
        round:tournament_rounds(round_name),
        team1:tournament_teams!matches_team1_id_fkey(*),
        team2:tournament_teams!matches_team2_id_fkey(*),
        venue:venues(name),
        match_results(*)
      `);

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }

    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) {
      console.warn('matchesApi.getAll:', error.message);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      tournament_id: m.tournament_id,
      round_id: m.round_id,
      round_name: m.round?.round_name || m.round_name,
      team1_id: m.team1_id,
      team2_id: m.team2_id,
      team1: m.team1,
      team2: m.team2,
      venue_id: m.venue_id,
      venue_name: m.venue?.name,
      court_table: m.court_table,
      start_time: m.start_time,
      status: m.status,
      bracket_node_id: m.bracket_node_id,
      next_match_id: m.next_match_id,
      result: m.match_results && m.match_results.length > 0 ? m.match_results[0] : undefined
    }));
  },

  async updateScore(
    matchId: string,
    team1Score: number,
    team2Score: number,
    winnerTeamId?: string,
    extraInfo?: any
  ): Promise<MatchResult> {
    // Check if result already exists
    const { data: existing } = await supabase
      .from('match_results')
      .select('id')
      .eq('match_id', matchId)
      .maybeSingle();

    let resultData;
    if (existing) {
      const { data, error } = await supabase
        .from('match_results')
        .update({
          team1_score: team1Score,
          team2_score: team2Score,
          winner_team_id: winnerTeamId || null,
          extra_info: extraInfo || {},
          verified_by_admin: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    } else {
      const { data, error } = await supabase
        .from('match_results')
        .insert([{
          match_id: matchId,
          team1_score: team1Score,
          team2_score: team2Score,
          winner_team_id: winnerTeamId || null,
          extra_info: extraInfo || {},
          verified_by_admin: true,
          verified_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    }

    // Update match status to completed
    await supabase
      .from('matches')
      .update({ status: 'completed' })
      .eq('id', matchId);

    // If winner specified, advance in bracket
    if (winnerTeamId) {
      try {
        await supabase.rpc('advance_bracket_match', {
          p_match_id: matchId,
          p_winner_team_id: winnerTeamId
        });
      } catch (err) {
        console.warn('advance_bracket_match rpc note:', err);
      }
    }

    return resultData;
  },

  async advanceWinner(matchId: string, winnerTeamId: string): Promise<void> {
    const { error } = await supabase.rpc('advance_bracket_match', {
      p_match_id: matchId,
      p_winner_team_id: winnerTeamId
    });
    if (error) throw error;
  },

  async create(match: Partial<Match>): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .insert([match])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async batchCreate(matches: Partial<Match>[]): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .insert(matches)
      .select();
    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: Partial<Match>): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
