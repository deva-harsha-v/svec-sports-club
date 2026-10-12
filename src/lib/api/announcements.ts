import { supabase } from '../supabase';
import { Announcement } from '../types';

export const announcementsApi = {
  async getActive(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('start_time', { ascending: false });

    if (error) {
      console.warn('announcementsApi.getActive:', error.message);
      return [];
    }

    return data || [];
  },

  async create(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement> {
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcement])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) throw error;
  }
};
