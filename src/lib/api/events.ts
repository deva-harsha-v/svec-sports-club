import { supabase } from '../supabase';
import { ClubEvent } from '../types';

export const eventsApi = {
  async getAll(): Promise<ClubEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*, sports(name), venues(name)')
      .eq('is_deleted', false)
      .eq('is_active', true)
      .order('start_time', { ascending: true });

    if (error) {
      console.warn('eventsApi.getAll:', error.message);
      return [];
    }

    return (data || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      event_type: e.event_type,
      sport_id: e.sport_id,
      sport_name: e.sports?.name,
      venue_id: e.venue_id,
      venue_name: e.venues?.name,
      start_time: e.start_time,
      end_time: e.end_time,
      is_active: e.is_active,
      created_at: e.created_at
    }));
  },

  async create(event: Omit<ClubEvent, 'id' | 'created_at'>): Promise<ClubEvent> {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<ClubEvent>): Promise<ClubEvent> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  }
};
