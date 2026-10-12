import { supabase } from '../supabase';
import { 
  SelectionTrial, 
  SelectionTrialSession, 
  SelectionTrialSessionEligibility, 
  SelectionRegistration, 
  SelectionEvaluationHistory, 
  PublishedSelectionResult 
} from '../types';

export interface RegisterTrialParams {
  trialId: string;
  sessionId: string;
  previousParticipation?: string;
  whatsappConfirmation: boolean;
}

export interface RosterFilters {
  search?: string;
  branch?: string;
  year?: string;
  gender?: string;
  status?: string;
  evaluationStatus?: string;
}

export const selectionTrialsApi = {
  // Public & Member methods
  async getPublicTrials(): Promise<SelectionTrial[]> {
    const { data: trials, error } = await supabase
      .from('v_selection_trials_with_status')
      .select('*')
      .in('computed_status', ['upcoming', 'registration_open', 'registration_closed', 'in_progress', 'completed'])
      .order('circular_date', { ascending: false });

    if (error) {
      console.warn('selectionTrialsApi.getPublicTrials:', error.message);
      return [];
    }

    if (!trials || trials.length === 0) return [];

    // Fetch sessions and eligibility for these trials
    const trialIds = trials.map(t => t.id);
    const { data: sessions } = await supabase
      .from('selection_trial_sessions')
      .select('*, selection_trial_session_eligibility(*)')
      .in('selection_trial_id', trialIds)
      .order('start_time', { ascending: true });

    const sessionMap = new Map<string, SelectionTrialSession[]>();
    (sessions || []).forEach((s: any) => {
      const list = sessionMap.get(s.selection_trial_id) || [];
      list.push({
        id: s.id,
        selection_trial_id: s.selection_trial_id,
        session_title: s.session_title,
        start_time: s.start_time,
        end_time: s.end_time,
        session_notes: s.session_notes,
        eligibility: (s.selection_trial_session_eligibility || []).map((e: any) => ({
          id: e.id,
          session_id: e.session_id,
          program: e.program,
          year: e.year,
          branch: e.branch,
          gender: e.gender
        }))
      });
      sessionMap.set(s.selection_trial_id, list);
    });

    return trials.map(t => ({
      ...t,
      sessions: sessionMap.get(t.id) || []
    }));
  },

  async getTrialBySlug(slug: string): Promise<SelectionTrial | null> {
    const { data: trial, error } = await supabase
      .from('v_selection_trials_with_status')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !trial) {
      console.warn('selectionTrialsApi.getTrialBySlug:', error?.message);
      return null;
    }

    const { data: sessions } = await supabase
      .from('selection_trial_sessions')
      .select('*, selection_trial_session_eligibility(*)')
      .eq('selection_trial_id', trial.id)
      .order('start_time', { ascending: true });

    return {
      ...trial,
      sessions: (sessions || []).map((s: any) => ({
        id: s.id,
        selection_trial_id: s.selection_trial_id,
        session_title: s.session_title,
        start_time: s.start_time,
        end_time: s.end_time,
        session_notes: s.session_notes,
        eligibility: (s.selection_trial_session_eligibility || []).map((e: any) => ({
          id: e.id,
          session_id: e.session_id,
          program: e.program,
          year: e.year,
          branch: e.branch,
          gender: e.gender
        }))
      }))
    };
  },

  async getTrialById(id: string): Promise<SelectionTrial | null> {
    const { data: trial, error } = await supabase
      .from('v_selection_trials_with_status')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !trial) return null;

    const { data: sessions } = await supabase
      .from('selection_trial_sessions')
      .select('*, selection_trial_session_eligibility(*)')
      .eq('selection_trial_id', trial.id)
      .order('start_time', { ascending: true });

    return {
      ...trial,
      sessions: (sessions || []).map((s: any) => ({
        id: s.id,
        selection_trial_id: s.selection_trial_id,
        session_title: s.session_title,
        start_time: s.start_time,
        end_time: s.end_time,
        session_notes: s.session_notes,
        eligibility: (s.selection_trial_session_eligibility || []).map((e: any) => ({
          id: e.id,
          session_id: e.session_id,
          program: e.program,
          year: e.year,
          branch: e.branch,
          gender: e.gender
        }))
      }))
    };
  },

  async getMyRegistrations(): Promise<SelectionRegistration[]> {
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase
      .from('selection_registrations')
      .select(`
        *,
        trial:selection_trials(id, title, results_published, circular_no, sport_id, sports(name)),
        session:selection_trial_sessions(id, session_title, start_time, end_time, venues(name))
      `);

    if (user) {
      query = query.eq('profile_id', user.id);
    }

    const { data, error } = await query.order('registered_at', { ascending: false });

    if (error) {
      console.warn('selectionTrialsApi.getMyRegistrations:', error.message);
      return [];
    }

    return (data || []).map((r: any) => ({
      ...r,
      trial_title: r.trial?.title,
      sport_name: r.trial?.sports?.name,
      circular_no: r.trial?.circular_no,
      session_title: r.session?.session_title,
      start_time: r.session?.start_time,
      end_time: r.session?.end_time,
      venue_name: r.session?.venues?.name,
      results_published: !!r.trial?.results_published,
      // If results not published yet, mask evaluation status
      evaluation_status: r.trial?.results_published ? r.evaluation_status : 'pending',
      // Strictly remove confidential evaluation notes for student view
      evaluation_notes: null
    }));
  },

  async registerForTrial(params: RegisterTrialParams): Promise<{
    registration_id: string;
    qr_token: string;
    status: string;
  }> {
    const { data, error } = await supabase.rpc('register_for_selection_trial', {
      p_trial_id: params.trialId,
      p_session_id: params.sessionId,
      p_previous_participation: params.previousParticipation || null,
      p_whatsapp_confirmation: params.whatsappConfirmation
    });

    if (error) throw error;
    return data;
  },

  // Coach & Admin methods
  async getRoster(trialId: string, filters?: RosterFilters): Promise<SelectionRegistration[]> {
    let query = supabase
      .from('selection_registrations')
      .select(`
        *,
        trial:selection_trials(title),
        session:selection_trial_sessions(session_title)
      `)
      .eq('selection_trial_id', trialId);

    if (filters?.branch && filters.branch !== 'all') {
      query = query.eq('branch', filters.branch);
    }
    if (filters?.year && filters.year !== 'all') {
      query = query.eq('year', filters.year);
    }
    if (filters?.gender && filters.gender !== 'all') {
      query = query.eq('gender', filters.gender);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.evaluationStatus && filters.evaluationStatus !== 'all') {
      query = query.eq('evaluation_status', filters.evaluationStatus);
    }

    const { data, error } = await query.order('registered_at', { ascending: true });

    if (error) {
      console.warn('selectionTrialsApi.getRoster:', error.message);
      return [];
    }

    let results = (data || []).map((r: any) => ({
      ...r,
      trial_title: r.trial?.title,
      session_title: r.session?.session_title
    }));

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      results = results.filter(
        r => r.student_name.toLowerCase().includes(q) || r.roll_no.toLowerCase().includes(q)
      );
    }

    return results;
  },

  async coachMarkAttendance(qrToken: string, notes?: string): Promise<{
    student_name: string;
    roll_no: string;
    checked_in_at: string;
    program?: string;
    branch?: string;
    year?: string;
    gender?: string;
    phone?: string;
    previous_participation?: string;
    trial_title?: string;
    session_title?: string;
  }> {
    const trimmed = qrToken.trim();
    // Extract roll number if embedded in URL or raw text (e.g. 24A81A0501)
    const rollMatch = trimmed.match(/[0-9]{2}[A-Za-z0-9]{8}/i);
    const identifier = rollMatch && !trimmed.startsWith('SVEC-QR-') ? rollMatch[0].toUpperCase() : trimmed;

    const { data, error } = await supabase.rpc('coach_mark_attendance', {
      p_qr_token: identifier,
      p_notes: notes || null
    });

    if (error) throw error;
    return data;
  },

  async coachRecordEvaluation(
    registrationId: string,
    evaluationStatus: 'pending' | 'selected' | 'standby' | 'not_selected',
    notes?: string
  ): Promise<{ evaluation_status: string }> {
    const { data, error } = await supabase.rpc('coach_record_evaluation', {
      p_registration_id: registrationId,
      p_evaluation_status: evaluationStatus,
      p_evaluation_notes: notes || null
    });

    if (error) throw error;
    return data;
  },

  async adminPublishResults(trialId: string, publish: boolean = true, allowPartial: boolean = false): Promise<void> {
    const { error } = await supabase.rpc('admin_publish_selection_results', {
      p_trial_id: trialId,
      p_publish: publish,
      p_allow_partial: allowPartial
    });

    if (error) throw error;
  },

  async getPublishedResults(trialId?: string): Promise<PublishedSelectionResult[]> {
    let query = supabase.from('v_published_selection_results').select('*');
    if (trialId) {
      query = query.eq('selection_trial_id', trialId);
    }
    const { data, error } = await query.order('student_name', { ascending: true });
    if (error) {
      console.warn('selectionTrialsApi.getPublishedResults:', error.message);
      return [];
    }
    return data || [];
  },

  async getEvaluationHistory(registrationId: string): Promise<SelectionEvaluationHistory[]> {
    const { data, error } = await supabase
      .from('selection_evaluation_history')
      .select('*, profiles(full_name)')
      .eq('registration_id', registrationId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map((h: any) => ({
      ...h,
      evaluator_name: h.profiles?.full_name || 'System / Coach'
    }));
  },

  // Export roster as CSV (Admin/Coach only)
  async exportRosterCsv(trialId: string): Promise<string> {
    const roster = await this.getRoster(trialId);
    if (!roster || roster.length === 0) return '';

    const headers = [
      'Roll Number',
      'Student Name',
      'Program',
      'Branch',
      'Year',
      'Gender',
      'Phone',
      'Session',
      'Status',
      'Evaluation Status',
      'Registration Time',
      'Check-in Time'
    ];

    const rows = roster.map(r => [
      `"${r.roll_no}"`,
      `"${r.student_name}"`,
      `"${r.program}"`,
      `"${r.branch}"`,
      `"${r.year}"`,
      `"${r.gender}"`,
      `"${r.phone}"`,
      `"${r.session_title || ''}"`,
      `"${r.status}"`,
      `"${r.evaluation_status}"`,
      `"${new Date(r.registered_at).toLocaleString()}"`,
      `"${r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : 'Not Checked In'}"`
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
};
