import { supabase } from '../supabase';
import { GalleryItem } from '../types';

export const galleryApi = {
  async getAll(): Promise<GalleryItem[]> {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*, sports(name), tournaments(title)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('galleryApi.getAll:', error.message);
      return [];
    }

    return (data || []).map((g: any) => ({
      id: g.id,
      title: g.title,
      caption: g.caption || '',
      media_url: g.media_url,
      media_type: g.media_type,
      aspect_ratio: g.aspect_ratio || '16:9',
      featured: g.featured || false,
      sport_id: g.sport_id,
      sport_name: g.sports?.name,
      tournament_id: g.tournament_id,
      created_at: g.created_at
    }));
  },

  async create(item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> {
    const { data, error } = await supabase
      .from('gallery_items')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('gallery_items')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  }
};
