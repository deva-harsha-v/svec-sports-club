import { supabase } from '../supabase';
import { NewsItem } from '../types';

export const newsApi = {
  async getAll(): Promise<NewsItem[]> {
    const { data, error } = await supabase
      .from('news')
      .select('*, profiles(full_name)')
      .eq('is_deleted', false)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('newsApi.getAll:', error.message);
      return [];
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      content: n.content,
      category: n.category,
      cover_image: n.cover_image,
      featured: n.featured || false,
      author_id: n.author_id,
      author_name: n.profiles?.full_name || 'Athletics Media Team',
      status: n.status,
      created_at: n.created_at,
      updated_at: n.updated_at
    }));
  },

  async create(item: Omit<NewsItem, 'id' | 'created_at'>): Promise<NewsItem> {
    const { data, error } = await supabase
      .from('news')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<NewsItem>): Promise<NewsItem> {
    const { data, error } = await supabase
      .from('news')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('news')
      .update({ is_deleted: true })
      .eq('id', id);
    if (error) throw error;
  }
};
