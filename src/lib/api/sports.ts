import { supabase } from '../supabase';
import { Sport } from '../types';

export const sportsApi = {
  async getAll(): Promise<Sport[]> {
    const { data, error } = await supabase
      .from('sports')
      .select('*, venues(name)')
      .eq('is_deleted', false)
      .order('name');

    if (error) {
      console.warn('sportsApi.getAll:', error.message);
      return [];
    }

    return (data || []).map((s: any) => ({
      ...s,
      venue: s.venues?.name || s.venue_summary || s.venue || undefined,
      rules: s.rules || '',
      active_athletes_count: s.active_athletes_count || 0
    }));
  },

  async getBySlug(slug: string): Promise<Sport | null> {
    const { data, error } = await supabase
      .from('sports')
      .select('*, venues(name)')
      .eq('slug', slug)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      venue: data.venues?.name || data.venue_summary || data.venue || undefined,
      rules: data.rules || ''
    };
  },

  async getById(id: string): Promise<Sport | null> {
    const { data, error } = await supabase
      .from('sports')
      .select('*, venues(name)')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      venue: data.venues?.name || data.venue_summary || data.venue || undefined,
      rules: data.rules || ''
    };
  },

  async create(sport: Omit<Sport, 'id'>): Promise<Sport> {
    const { data, error } = await supabase
      .from('sports')
      .insert([sport])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Sport>): Promise<Sport> {
    const { data, error } = await supabase
      .from('sports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sports')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  }
};
