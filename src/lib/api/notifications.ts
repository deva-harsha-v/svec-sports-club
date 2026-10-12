import { supabase } from '../supabase';

export interface StudentNotification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: 'registration' | 'match' | 'clash' | 'certificate' | 'general';
  read: boolean;
  link_url?: string;
  created_at: string;
}

export const notificationsApi = {
  async getMyNotifications(): Promise<StudentNotification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('notificationsApi.getMyNotifications:', error.message);
      return [];
    }

    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.warn('notificationsApi.markAsRead:', error.message);
    }
  },

  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('profile_id', user.id)
      .eq('read', false);

    if (error) {
      console.warn('notificationsApi.markAllAsRead:', error.message);
    }
  }
};
