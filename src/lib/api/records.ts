import { supabase } from '../supabase';
import { RecordBookEntry } from '../types';

export const recordsApi = {
  async getAll(): Promise<RecordBookEntry[]> {
    const { data, error } = await supabase
      .from('records_book')
      .select('*, sports(name)')
      .eq('is_deleted', false)
      .eq('is_verified', true)
      .order('achieved_date', { ascending: false });

    if (error) {
      console.warn('recordsApi.getAll:', error.message);
      return [];
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      sport_id: r.sport_id,
      sport_name: r.sports?.name,
      title: r.title,
      holder_name: r.holder_name,
      department: r.department,
      record_value: r.record_value,
      record_metric: r.record_metric,
      achieved_date: r.achieved_date,
      is_verified: r.is_verified,
      created_at: r.created_at
    }));
  },

  async create(record: Omit<RecordBookEntry, 'id' | 'created_at'>): Promise<RecordBookEntry> {
    const { data, error } = await supabase
      .from('records_book')
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
