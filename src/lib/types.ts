export type Role = 'member' | 'coach' | 'admin';
export type Program = 'B.Tech' | 'MBA' | 'Staff' | 'Other';
export type Gender = 'Men' | 'Women' | 'Other';

export interface Profile {
  id: string;
  email: string;
  google_email?: string;
  full_name: string;
  role: Role;
  program?: Program;
  department: string;
  year?: string;
  hostel?: string;
  student_id?: string;
  normalized_roll_no?: string;
  gender?: Gender;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  requires_password_change?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  program?: Program;
  department: string;
  year?: string;
  hostel?: string;
  bio?: string;
}

export type SportFacilityType = 'competitive_sport' | 'fitness_wellness' | 'training_facility';
export type SportCategory = 
  | 'Outdoor Sport'
  | 'Racquet Sport'
  | 'Combat & Martial Arts'
  | 'Track & Field'
  | 'Target Sport'
  | 'Mind & Strategy'
  | 'Mind & Body'
  | 'Fitness Facility';

export interface Sport {
  id: string;
  name: string;
  slug: string;
  description?: string;
  facility_type: SportFacilityType;
  category: SportCategory;
  discipline_type: 'team' | 'individual' | 'both';
  is_competitive: boolean;
  icon: string;
  cover_image?: string;
  coach_profile_id?: string;
  coach_name?: string;
  coach_contact?: string;
  venue_id?: string;
  venue?: string;
  schedule_summary?: string;
  rules?: string;
  min_team_size: number;
  max_team_size: number;
  is_deleted?: boolean;
  is_active?: boolean;
  active_athletes_count?: number;
}

export interface CoachAssignment {
  id: string;
  coach_profile_id: string;
  sport_id: string;
  is_active: boolean;
  assigned_at: string;
  assigned_by?: string;
  coach_name?: string;
  sport_name?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  supported_sports: string[];
  is_active: boolean;
  is_deleted?: boolean;
}

export interface Tournament {
  id: string;
  sport_id: string;
  sport_name?: string;
  title: string;
  slug: string;
  format: 'knockout' | 'league' | 'hybrid';
  start_date: string;
  end_date: string;
  status: 'draft' | 'upcoming' | 'registration_open' | 'live' | 'completed' | 'cancelled';
  min_team_size: number;
  max_team_size: number;
  max_teams: number;
  current_teams_count: number;
  registration_deadline: string;
  rules: string;
  banner_image: string;
  venue_id?: string;
  venue_name?: string;
}

export interface TournamentRound {
  id: string;
  tournament_id: string;
  round_number: number;
  round_name: string;
  status: 'pending' | 'active' | 'completed';
}

export interface TournamentTeam {
  id: string;
  tournament_id: string;
  name: string;
  captain_id: string;
  captain_name?: string;
  department: string;
  hostel?: string;
  status: 'registered' | 'approved' | 'rejected' | 'waitlisted' | 'qualified' | 'eliminated' | 'champion' | 'runner_up';
  seed?: number;
  players_count?: number;
  logo_url?: string;
  created_at?: string;
}

export interface TournamentPlayer {
  id: string;
  team_id: string;
  profile_id?: string;
  full_name: string;
  department?: string;
  jersey_number?: number;
  is_captain: boolean;
  created_at?: string;
}

export interface MatchResult {
  id: string;
  match_id: string;
  team1_score: number;
  team2_score: number;
  winner_team_id?: string;
  extra_info?: {
    period?: string;
    timeRemaining?: string;
    penalties?: string;
    scorers?: string[];
    mvp?: string;
    sets?: string[];
    currentSet?: number;
  };
  verified_by_admin: boolean;
  verified_at?: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  round_id?: string;
  round_name?: string;
  team1_id?: string;
  team2_id?: string;
  team1?: TournamentTeam;
  team2?: TournamentTeam;
  venue_id?: string;
  venue_name?: string;
  court_table?: string;
  start_time: string;
  status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';
  bracket_node_id?: string;
  next_match_id?: string;
  result?: MatchResult;
}

export interface Registration {
  id: string;
  tournament_id: string;
  tournament_title?: string;
  sport_name?: string;
  profile_id?: string;
  profile_name?: string;
  team_id?: string;
  team_name?: string;
  registration_type: 'individual' | 'team';
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted' | 'withdrawn' | 'checked_in';
  qr_code_token: string;
  checked_in_at?: string;
  created_at: string;
}

export interface CampusCupPoint {
  id: string;
  entity_type: 'department' | 'hostel';
  entity_name: string;
  tournament_id?: string;
  points_awarded: number;
  transaction_type: 'award' | 'reversal';
  reason: string;
  awarded_by?: string;
  created_at: string;
}

export interface CampusCupStanding {
  id?: string;
  entity_type: 'department' | 'hostel';
  entity_id?: string;
  entity_name: string;
  total_points?: number;
  points?: number;
  gold_count?: number;
  silver_count?: number;
  bronze_count?: number;
  total_events_recorded?: number;
  rank: number;
  previous_rank?: number;
  change_direction?: 'up' | 'down' | 'same';
  stats?: {
    played?: number;
    won?: number;
    lost?: number;
    goldMedals?: number;
    silverMedals?: number;
    bronzeMedals?: number;
    gold?: number;
    silver?: number;
    bronze?: number;
    [key: string]: any;
  };
}

export type Ranking = CampusCupStanding;

export interface PlayerStatistic {
  id: string;
  profile_id: string;
  sport_id: string;
  sport_name: string;
  matches_played: number;
  wins: number;
  mvp_count: number;
  stat_metrics: Record<string, string | number>;
}

export interface RankingHistory {
  id: string;
  entity_type: 'department' | 'hostel' | 'individual' | 'team';
  entity_id: string;
  entity_name: string;
  sport_id?: string;
  rank: number;
  points: number;
  snapshot_date: string;
  created_at: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Tournament' | 'Campus Cup' | 'Trials' | 'Facility' | 'General';
  cover_image?: string;
  status?: 'published' | 'draft';
  featured: boolean;
  author_id?: string;
  author_name?: string;
  created_at: string;
  updated_at?: string;
}

export type UpdateItem = NewsItem;

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'tournament' | 'trials' | 'practice' | 'championship';
  sport_id?: string;
  sport_name?: string;
  venue_id?: string;
  venue_name?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at?: string;
}

export interface GalleryItem {
  id: string;
  tournament_id?: string;
  sport_id?: string;
  sport_name?: string;
  title: string;
  caption?: string;
  media_url: string;
  media_type: 'photo' | 'video';
  aspect_ratio: string;
  featured: boolean;
  created_at?: string;
}

export interface Certificate {
  id: string;
  certificate_no: string;
  profile_id: string;
  athlete_name: string;
  tournament_id: string;
  tournament_title: string;
  sport_name: string;
  rank_achieved: string;
  issue_date: string;
  verification_hash: string;
  status: 'issued' | 'revoked';
  pdf_url?: string;
  created_at?: string;
}

export interface RecordBookEntry {
  id: string;
  sport_id: string;
  sport_name?: string;
  title: string;
  holder_name: string;
  department: string;
  record_value: string;
  record_metric: string;
  achieved_date: string;
  is_verified: boolean;
  created_at?: string;
}

export interface Announcement {
  id: string;
  message: string;
  link_url?: string;
  priority: 'info' | 'warning' | 'urgent';
  start_time: string;
  end_time?: string;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: 'registration' | 'match' | 'clash' | 'certificate' | 'general';
  read: boolean;
  link_url?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: any;
  created_at: string;
}

export interface ClashDetectionResult {
  has_clash: boolean;
  clash_count: number;
  clashes: Array<{
    resource_type: 'venue' | 'team' | 'sport';
    resource_id: string;
    resource_name: string;
    conflicting_with: string;
    conflict_time: string;
  }>;
}

// ============================================================================
// SELECTION TRIALS & ACADEMIC REGISTRATION TYPES
// ============================================================================

export type SelectionTrialStatus = 
  | 'upcoming' 
  | 'registration_open' 
  | 'registration_closed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'
  | 'draft'
  | 'archived';

export interface SelectionTrialSessionEligibility {
  id: string;
  session_id: string;
  program: 'B.Tech' | 'MBA';
  year?: string;
  branch?: string;
  gender: 'men' | 'women' | 'all';
}

export interface SelectionTrialSession {
  id: string;
  selection_trial_id: string;
  session_title: string;
  start_time: string;
  end_time: string;
  session_notes?: string;
  eligibility?: SelectionTrialSessionEligibility[];
}

export interface SelectionTrial {
  id: string;
  sport_id: string;
  sport_name?: string;
  sport_category?: SportCategory;
  sport_facility_type?: SportFacilityType;
  title: string;
  slug: string;
  gender_scope: 'men' | 'women' | 'all' | 'mixed';
  circular_ref: string;
  circular_date: string;
  official_registration_url: string;
  source_document_name: string;
  instructions: string;
  registration_deadline_date: string;
  venue_id?: string;
  venue_name?: string;
  publication_state: 'draft' | 'published' | 'archived';
  is_cancelled: boolean;
  cancellation_reason?: string;
  results_published: boolean;
  whatsapp_channel_url?: string;
  computed_status: SelectionTrialStatus;
  first_session_start?: string;
  last_session_end?: string;
  registration_count?: number;
  sessions?: SelectionTrialSession[];
  created_at?: string;
}

export interface SelectionRegistration {
  id: string;
  selection_trial_id: string;
  trial_title?: string;
  sport_name?: string;
  results_published?: boolean;
  circular_no?: string;
  session_id: string;
  session_title?: string;
  start_time?: string;
  end_time?: string;
  venue_name?: string;
  profile_id: string;
  student_name: string;
  roll_no: string;
  normalized_roll_no?: string;
  program: 'B.Tech' | 'MBA';
  branch: string;
  year: string;
  gender: 'Men' | 'Women';
  phone: string;
  previous_participation?: string;
  whatsapp_confirmation: boolean;
  status: 'registered' | 'checked_in' | 'withdrawn';
  qr_code_token?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  evaluation_status: 'pending' | 'selected' | 'standby' | 'not_selected';
  evaluation_notes?: string;
  registered_at: string;
  created_at?: string;
}

export interface SelectionEvaluationHistory {
  id: string;
  registration_id: string;
  evaluator_id?: string;
  evaluator_name?: string;
  action: 'registered' | 'check_in' | 'evaluation_updated' | 'selection_finalized' | 'withdrawn';
  previous_status?: string;
  new_status: string;
  previous_evaluation?: string;
  new_evaluation: string;
  notes?: string;
  created_at: string;
}

export interface PublishedSelectionResult {
  id: string;
  selection_trial_id: string;
  trial_title: string;
  student_name: string;
  program: string;
  branch: string;
  year: string;
  evaluation_status: 'selected' | 'standby';
}
