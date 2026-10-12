import { supabase } from '../supabase';
import { Venue } from '../types';

export const venuesApi = {
  async getAll(): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name');
    if (error) {
      console.warn('venuesApi.getAll:', error.message);
      return [];
    }
    return data || [];
  },

  async create(venue: Omit<Venue, 'id'>): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .insert([venue])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Venue>): Promise<Venue> {
    const { data, error } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
