import { supabase } from '../supabase';
import { CampusCupStanding, CampusCupPoint } from '../types';

export const campusCupApi = {
  async getStandings(): Promise<CampusCupStanding[]> {
    const { data, error } = await supabase
      .from('v_campus_cup_standings')
      .select('*')
      .order('rank', { ascending: true });

    if (error) {
      console.warn('campusCupApi.getStandings:', error.message);
      return [];
    }

    return (data || []).map((s: any) => ({
      entity_type: s.entity_type,
      entity_id: s.entity_id,
      entity_name: s.entity_name,
      total_points: s.total_points || 0,
      gold_count: s.gold_count || 0,
      silver_count: s.silver_count || 0,
      bronze_count: s.bronze_count || 0,
      total_events_recorded: s.total_events_recorded || 0,
      rank: s.rank || 1
    }));
  },

  async getLedger(): Promise<CampusCupPoint[]> {
    const { data, error } = await supabase
      .from('campus_cup_points')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('campusCupApi.getLedger:', error.message);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      entity_type: p.entity_type,
      entity_name: p.entity_name,
      tournament_id: p.source_tournament_id,
      points_awarded: p.points_awarded,
      transaction_type: p.transaction_type,
      reason: p.reason,
      awarded_by: p.profiles?.full_name || 'Athletics Committee',
      created_at: p.created_at
    }));
  },

  async recordAward(point: {
    entity_type: 'department' | 'hostel';
    entity_id: string;
    entity_name: string;
    achievement: string;
    points_awarded: number;
    reason: string;
    source_tournament_id?: string;
  }): Promise<void> {
    const { error } = await supabase.from('campus_cup_points').insert([{
      ...point,
      transaction_type: 'award'
    }]);

    if (error) throw error;
  }
};
