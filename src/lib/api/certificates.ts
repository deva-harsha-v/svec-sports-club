import { supabase } from '../supabase';
import { Certificate } from '../types';

export const certificatesApi = {
  async getMyCertificates(): Promise<Certificate[]> {
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase
      .from('certificates')
      .select('*')
      .eq('is_deleted', false)
      .eq('status', 'issued');

    if (user) {
      query = query.eq('profile_id', user.id);
    }

    const { data, error } = await query.order('issue_date', { ascending: false });

    if (error) {
      console.warn('certificatesApi.getMyCertificates:', error.message);
      return [];
    }

    return data || [];
  },

  async verifyCertificate(certificateNo: string): Promise<{
    is_valid: boolean;
    status: string;
    certificate_no?: string;
    athlete_name?: string;
    tournament_title?: string;
    sport_name?: string;
    rank_achieved?: string;
    issue_date?: string;
    verification_hash?: string;
    message?: string;
  }> {
    const { data, error } = await supabase.rpc('verify_certificate', {
      p_certificate_no: certificateNo.trim()
    });

    if (error) throw error;
    return data;
  },

  async issueCertificate(cert: Omit<Certificate, 'id' | 'created_at' | 'verification_hash'>): Promise<Certificate> {
    const hash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        ...cert,
        verification_hash: hash
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
