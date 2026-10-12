-- ============================================================================
-- SRI VASAVI SPORTS CLUB // Complete Production PostgreSQL Schema & Security Architecture
-- Sri Vasavi Engineering College (SVEC) Sports, Facilities & Selection Trials
-- ============================================================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. BASE TABLES (Created in strict topological dependency order)
-- ============================================================================

-- 1.1 PROFILES (Extends auth.users, only authenticated roles: 'member', 'coach', 'admin')
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    google_email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('member', 'coach', 'admin')) DEFAULT 'member',
    program TEXT CHECK (program IN ('B.Tech', 'MBA', 'Staff', 'Other')),
    department TEXT NOT NULL,
    year TEXT CHECK (year IN ('1st', '2nd', '3rd', '4th')),
    hostel TEXT,
    student_id TEXT UNIQUE,
    gender TEXT CHECK (gender IN ('Men', 'Women', 'Other')),
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    requires_password_change BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_profile_academic_consistency CHECK (
        (program = 'B.Tech' AND department IN ('CIVIL', 'EEE', 'MECH', 'ECE', 'ECT', 'CSE', 'CST', 'CAI', 'AIML', 'CSD', 'IT') AND year IN ('1st', '2nd', '3rd', '4th'))
        OR
        (program = 'MBA' AND department = 'Management' AND year IN ('1st', '2nd'))
        OR
        (program IN ('Staff', 'Other'))
        OR
        (program IS NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_google_email ON public.profiles(LOWER(TRIM(google_email))) WHERE google_email IS NOT NULL AND TRIM(google_email) <> '';

-- 1.2 VENUES
CREATE TABLE IF NOT EXISTS public.venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    capacity INT DEFAULT 500,
    supported_sports TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 SPORTS & ATHLETIC FACILITIES
CREATE TABLE IF NOT EXISTS public.sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    facility_type TEXT NOT NULL CHECK (facility_type IN ('competitive_sport', 'fitness_wellness', 'training_facility')) DEFAULT 'competitive_sport',
    category TEXT NOT NULL CHECK (category IN (
        'Outdoor Sport',
        'Racquet Sport',
        'Combat & Martial Arts',
        'Track & Field',
        'Target Sport',
        'Mind & Strategy',
        'Mind & Body',
        'Fitness Facility'
    )),
    discipline_type TEXT NOT NULL CHECK (discipline_type IN ('team', 'individual', 'both')) DEFAULT 'team',
    is_competitive BOOLEAN NOT NULL DEFAULT TRUE,
    icon TEXT NOT NULL DEFAULT 'Activity',
    cover_image TEXT,
    coach_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    coach_name TEXT,
    coach_contact TEXT,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    schedule_summary TEXT,
    rules TEXT,
    min_team_size INT NOT NULL DEFAULT 1,
    max_team_size INT NOT NULL DEFAULT 11,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 COACH ASSIGNMENTS (Authorizes active coaches for specific sports)
CREATE TABLE IF NOT EXISTS public.coach_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(coach_profile_id, sport_id)
);

-- 1.5 TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    format TEXT NOT NULL CHECK (format IN ('knockout', 'league', 'hybrid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'upcoming', 'registration_open', 'live', 'completed', 'cancelled')) DEFAULT 'upcoming',
    min_team_size INT NOT NULL DEFAULT 1,
    max_team_size INT NOT NULL DEFAULT 11,
    max_teams INT NOT NULL DEFAULT 16,
    registration_deadline TIMESTAMPTZ NOT NULL,
    rules TEXT,
    banner_image TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 TOURNAMENT ROUNDS
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    round_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, round_number)
);

-- 1.7 TOURNAMENT TEAMS
CREATE TABLE IF NOT EXISTS public.tournament_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    captain_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    department TEXT NOT NULL,
    hostel TEXT,
    status TEXT NOT NULL CHECK (status IN ('registered', 'approved', 'rejected', 'waitlisted', 'qualified', 'eliminated', 'champion', 'runner_up')) DEFAULT 'registered',
    seed INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.8 TOURNAMENT PLAYERS (Roster members)
CREATE TABLE IF NOT EXISTS public.tournament_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    department TEXT,
    jersey_number INT,
    is_captain BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, profile_id)
);

-- 1.9 REGISTRATIONS (Explicit, normalized individual & team entries)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
    registration_type TEXT NOT NULL CHECK (registration_type IN ('individual', 'team')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted', 'withdrawn')) DEFAULT 'pending',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    qr_code_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
    checked_in_at TIMESTAMPTZ,
    CONSTRAINT chk_registration_party CHECK (
        (registration_type = 'individual' AND profile_id IS NOT NULL AND team_id IS NULL) OR
        (registration_type = 'team' AND team_id IS NOT NULL)
    ),
    CONSTRAINT uq_indiv_tournament_reg UNIQUE(tournament_id, profile_id),
    CONSTRAINT uq_team_tournament_reg UNIQUE(tournament_id, team_id)
);

-- 1.10 MATCHES (Fixtures & Bracket nodes)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round_id UUID REFERENCES public.tournament_rounds(id) ON DELETE SET NULL,
    team1_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    court_table TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'completed', 'postponed', 'cancelled')) DEFAULT 'scheduled',
    bracket_node_id TEXT,
    next_match_id UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.matches 
    DROP CONSTRAINT IF EXISTS fk_matches_next_match,
    ADD CONSTRAINT fk_matches_next_match FOREIGN KEY (next_match_id) REFERENCES public.matches(id) ON DELETE SET NULL;

-- 1.11 MATCH RESULTS
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
    team1_score INT NOT NULL DEFAULT 0,
    team2_score INT NOT NULL DEFAULT 0,
    winner_team_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    extra_info JSONB DEFAULT '{}'::jsonb,
    verified_by_admin BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 RANKINGS (Current Standings)
CREATE TABLE IF NOT EXISTS public.rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('department', 'hostel', 'individual', 'team')),
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    rank INT NOT NULL CHECK (rank > 0),
    points INT NOT NULL DEFAULT 0,
    stats JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sport_id, entity_type, entity_id)
);

-- 1.13 RANKING HISTORY (Immutable Snapshot Log)
CREATE TABLE IF NOT EXISTS public.ranking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES public.sports(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('department', 'hostel', 'individual', 'team')),
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    rank INT NOT NULL,
    points INT NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.14 CAMPUS CUP POINTS (Immutable Transactional Ledger)
CREATE TABLE IF NOT EXISTS public.campus_cup_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_year INT NOT NULL DEFAULT 2026,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('department', 'hostel')),
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    source_tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
    achievement TEXT NOT NULL CHECK (achievement IN ('gold', 'silver', 'bronze', 'semifinalist', 'participation', 'bonus', 'penalty')),
    points_awarded INT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('award', 'reversal')) DEFAULT 'award',
    reversal_of_id UUID REFERENCES public.campus_cup_points(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    awarded_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.15 EVENTS (Master Schedule)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('tournament', 'trials', 'practice', 'championship')),
    sport_id UUID REFERENCES public.sports(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_event_time CHECK (end_time > start_time)
);

-- 1.16 NEWS & PRESS DISPATCHES
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Tournament', 'Campus Cup', 'Trials', 'Facility', 'General')),
    cover_image TEXT,
    status TEXT NOT NULL CHECK (status IN ('published', 'draft')) DEFAULT 'published',
    featured BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.17 GALLERY ITEMS
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    caption TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')) DEFAULT 'photo',
    sport_id UUID REFERENCES public.sports(id) ON DELETE SET NULL,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
    aspect_ratio TEXT DEFAULT '16:9',
    featured BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.18 CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_no TEXT NOT NULL UNIQUE,
    verification_hash TEXT NOT NULL UNIQUE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_name TEXT NOT NULL,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE RESTRICT,
    tournament_title TEXT NOT NULL,
    sport_name TEXT NOT NULL,
    rank_achieved TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('issued', 'revoked')) DEFAULT 'issued',
    issued_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.19 CERTIFICATE VERIFICATION AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.certificate_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_no TEXT NOT NULL,
    verification_timestamp TIMESTAMPTZ DEFAULT NOW(),
    result_status TEXT NOT NULL CHECK (result_status IN ('valid', 'revoked', 'not_found', 'tampered')),
    verified_fields JSONB DEFAULT '{}'::jsonb
);

-- 1.20 RECORDS BOOK
CREATE TABLE IF NOT EXISTS public.records_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    holder_name TEXT NOT NULL,
    department TEXT NOT NULL,
    record_value TEXT NOT NULL,
    record_metric TEXT NOT NULL,
    achieved_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.21 ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    link_url TEXT,
    priority TEXT NOT NULL CHECK (priority IN ('info', 'warning', 'urgent')) DEFAULT 'info',
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.22 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('registration', 'match', 'clash', 'certificate', 'general')),
    read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.23 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 1.24 SELECTION TRIALS (Dedicated Academic Trials Architecture)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.selection_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES public.sports(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    gender_scope TEXT NOT NULL CHECK (gender_scope IN ('men', 'women', 'all', 'mixed')),
    circular_ref TEXT NOT NULL,
    circular_date DATE NOT NULL,
    official_registration_url TEXT NOT NULL,
    source_document_name TEXT NOT NULL,
    instructions TEXT NOT NULL,
    registration_deadline_date DATE NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    venue_name TEXT,
    publication_state TEXT NOT NULL CHECK (publication_state IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancellation_reason TEXT,
    results_published BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_channel_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.25 SELECTION TRIAL SESSIONS
CREATE TABLE IF NOT EXISTS public.selection_trial_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    selection_trial_id UUID NOT NULL REFERENCES public.selection_trials(id) ON DELETE CASCADE,
    session_title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    session_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_session_time_order CHECK (end_time > start_time)
);

-- 1.26 SELECTION TRIAL SESSION ELIGIBILITY (Normalized single source of truth)
CREATE TABLE IF NOT EXISTS public.selection_trial_session_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.selection_trial_sessions(id) ON DELETE CASCADE,
    program TEXT NOT NULL CHECK (program IN ('B.Tech', 'MBA')),
    year TEXT CHECK (year IN ('1st', '2nd', '3rd', '4th')),
    branch TEXT,
    gender TEXT NOT NULL CHECK (gender IN ('men', 'women', 'all')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.27 SELECTION REGISTRATIONS (Immutable snapshot from authenticated profiles)
CREATE TABLE IF NOT EXISTS public.selection_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    selection_trial_id UUID NOT NULL REFERENCES public.selection_trials(id) ON DELETE RESTRICT,
    session_id UUID NOT NULL REFERENCES public.selection_trial_sessions(id) ON DELETE RESTRICT,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    normalized_roll_no TEXT GENERATED ALWAYS AS (UPPER(TRIM(roll_no))) STORED,
    program TEXT NOT NULL CHECK (program IN ('B.Tech', 'MBA')),
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Men', 'Women')),
    phone TEXT NOT NULL,
    previous_participation TEXT,
    whatsapp_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('registered', 'checked_in', 'withdrawn')) DEFAULT 'registered',
    qr_code_token TEXT NOT NULL UNIQUE,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    evaluation_status TEXT NOT NULL CHECK (evaluation_status IN ('pending', 'selected', 'standby', 'not_selected')) DEFAULT 'pending',
    evaluation_notes TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_selection_trial_roll UNIQUE (selection_trial_id, normalized_roll_no),
    CONSTRAINT uq_selection_trial_profile UNIQUE (selection_trial_id, profile_id)
);

-- 1.28 SELECTION EVALUATION HISTORY (Durable Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS public.selection_evaluation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.selection_registrations(id) ON DELETE RESTRICT,
    evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('registered', 'check_in', 'evaluation_updated', 'selection_finalized', 'withdrawn')),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    previous_evaluation TEXT,
    new_evaluation TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE & INTEGRITY
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_selection_trials_sport ON public.selection_trials(sport_id);
CREATE INDEX IF NOT EXISTS idx_selection_trials_pub ON public.selection_trials(publication_state, is_deleted);
CREATE INDEX IF NOT EXISTS idx_selection_trials_deadline ON public.selection_trials(registration_deadline_date);
CREATE INDEX IF NOT EXISTS idx_trial_sessions_trial ON public.selection_trial_sessions(selection_trial_id);
CREATE INDEX IF NOT EXISTS idx_trial_sessions_times ON public.selection_trial_sessions(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_trial_eligibility_session ON public.selection_trial_session_eligibility(session_id);
CREATE INDEX IF NOT EXISTS idx_selection_reg_trial ON public.selection_registrations(selection_trial_id);
CREATE INDEX IF NOT EXISTS idx_selection_reg_session ON public.selection_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_selection_reg_profile ON public.selection_registrations(profile_id);
CREATE INDEX IF NOT EXISTS idx_selection_reg_normalized_roll ON public.selection_registrations(selection_trial_id, normalized_roll_no);
CREATE INDEX IF NOT EXISTS idx_selection_reg_eval_status ON public.selection_registrations(evaluation_status);
CREATE INDEX IF NOT EXISTS idx_selection_eval_history_reg ON public.selection_evaluation_history(registration_id);

-- ============================================================================
-- 2. VIEWS (Secure Projection & Analytics)
-- ============================================================================

-- 2.1 Public Profiles View (Never projects phone, student_id, gender, or email)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    full_name,
    avatar_url,
    department,
    program,
    year,
    hostel,
    role,
    bio
FROM public.profiles
WHERE is_active = true;

-- 2.2 Campus Cup Standings View
CREATE OR REPLACE VIEW public.v_campus_cup_standings AS
SELECT 
    entity_type,
    entity_id,
    entity_name,
    COALESCE(SUM(points_awarded), 0)::INT AS total_points,
    COUNT(CASE WHEN achievement = 'gold' AND transaction_type = 'award' THEN 1 END)::INT AS gold_count,
    COUNT(CASE WHEN achievement = 'silver' AND transaction_type = 'award' THEN 1 END)::INT AS silver_count,
    COUNT(CASE WHEN achievement = 'bronze' AND transaction_type = 'award' THEN 1 END)::INT AS bronze_count,
    COUNT(*)::INT AS total_events_recorded,
    DENSE_RANK() OVER (PARTITION BY entity_type ORDER BY COALESCE(SUM(points_awarded), 0) DESC) AS rank
FROM public.campus_cup_points
GROUP BY entity_type, entity_id, entity_name;

-- 2.3 Authoritative Selection Trials Status View
CREATE OR REPLACE VIEW public.v_selection_trials_with_status AS
SELECT 
    st.*,
    sp.name AS sport_name,
    sp.category AS sport_category,
    sp.facility_type AS sport_facility_type,
    (
        SELECT MIN(start_time) 
        FROM public.selection_trial_sessions 
        WHERE selection_trial_id = st.id
    ) AS first_session_start,
    (
        SELECT MAX(end_time) 
        FROM public.selection_trial_sessions 
        WHERE selection_trial_id = st.id
    ) AS last_session_end,
    (
        SELECT COUNT(*) 
        FROM public.selection_registrations 
        WHERE selection_trial_id = st.id
    ) AS registration_count,
    CASE 
        WHEN st.is_deleted = TRUE THEN 'archived'
        WHEN st.is_cancelled = TRUE THEN 'cancelled'
        WHEN st.publication_state = 'draft' THEN 'draft'
        WHEN st.publication_state = 'archived' THEN 'archived'
        WHEN NOW() > (
            SELECT COALESCE(MAX(end_time), '9999-12-31'::TIMESTAMPTZ) 
            FROM public.selection_trial_sessions 
            WHERE selection_trial_id = st.id
        ) THEN 'completed'
        WHEN EXISTS (
            SELECT 1 
            FROM public.selection_trial_sessions 
            WHERE selection_trial_id = st.id 
              AND NOW() >= start_time 
              AND NOW() <= end_time
        ) THEN 'in_progress'
        WHEN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE > st.registration_deadline_date THEN 'registration_closed'
        WHEN (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE <= st.registration_deadline_date THEN 'registration_open'
        ELSE 'upcoming'
    END AS computed_status
FROM public.selection_trials st
JOIN public.sports sp ON st.sport_id = sp.id;

-- 2.4 Secure Public Selection Results View (Exposes only student name, branch, year, and selected outcome)
CREATE OR REPLACE VIEW public.v_published_selection_results AS
SELECT 
    sr.id,
    sr.selection_trial_id,
    st.title AS trial_title,
    sr.student_name,
    sr.program,
    sr.branch,
    sr.year,
    sr.evaluation_status
FROM public.selection_registrations sr
JOIN public.selection_trials st ON sr.selection_trial_id = st.id
WHERE st.results_published = TRUE 
  AND st.is_cancelled = FALSE 
  AND st.is_deleted = FALSE
  AND sr.evaluation_status IN ('selected', 'standby');

-- ============================================================================
-- 3. SECURITY DEFINER FUNCTIONS & TRIGGERS
-- ============================================================================

-- 3.1 Role Verification Helpers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'coach' AND is_active = true
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_coach_of_sport(p_sport_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN public.is_admin() OR EXISTS (
        SELECT 1 FROM public.coach_assignments
        WHERE coach_profile_id = auth.uid() AND sport_id = p_sport_id AND is_active = true
    );
END;
$$;

-- 3.2 Protect Profile Academic Identity Fields Trigger Function
CREATE OR REPLACE FUNCTION public.protect_profile_identity_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
        RETURN NEW;
    END IF;

    IF (OLD.student_id IS NOT NULL AND NEW.student_id IS DISTINCT FROM OLD.student_id) OR
       (OLD.program IS NOT NULL AND NEW.program IS DISTINCT FROM OLD.program) OR
       (OLD.department IS NOT NULL AND NEW.department IS DISTINCT FROM OLD.department) OR
       (OLD.year IS NOT NULL AND NEW.year IS DISTINCT FROM OLD.year) OR
       (OLD.gender IS NOT NULL AND NEW.gender IS DISTINCT FROM OLD.gender) OR
       (NEW.role IS DISTINCT FROM OLD.role) OR
       (OLD.google_email IS NOT NULL AND NEW.google_email IS DISTINCT FROM OLD.google_email) OR
       (OLD.google_email IS NULL AND NEW.google_email IS NOT NULL) THEN
        RAISE EXCEPTION 'Academic identity fields and linked Google credentials cannot be self-modified. Contact the athletics administration.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_identity ON public.profiles;
CREATE TRIGGER trg_protect_profile_identity
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_identity_fields();

-- 3.3 Selection Trial Registration RPC (Race-Safe, Identity Authoritative)
CREATE OR REPLACE FUNCTION public.register_for_selection_trial(
    p_trial_id UUID,
    p_session_id UUID,
    p_previous_participation TEXT,
    p_whatsapp_confirmation BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_user_profile RECORD;
    v_trial RECORD;
    v_session RECORD;
    v_norm_roll TEXT;
    v_qr_token TEXT;
    v_reg_id UUID;
    v_is_eligible BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    SELECT * INTO v_user_profile FROM public.profiles WHERE id = v_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Authenticated profile not found.';
    END IF;

    IF v_user_profile.student_id IS NULL OR TRIM(v_user_profile.student_id) = '' THEN
        RAISE EXCEPTION 'Please update your student roll number in your profile before registering.';
    END IF;
    IF v_user_profile.gender IS NULL OR v_user_profile.gender NOT IN ('Men', 'Women') THEN
        RAISE EXCEPTION 'Please update your gender in your profile before registering.';
    END IF;
    IF v_user_profile.program IS NULL OR v_user_profile.program NOT IN ('B.Tech', 'MBA') THEN
        RAISE EXCEPTION 'Please update your academic program in your profile before registering.';
    END IF;
    IF v_user_profile.department IS NULL OR TRIM(v_user_profile.department) = '' THEN
        RAISE EXCEPTION 'Please update your branch in your profile before registering.';
    END IF;
    IF v_user_profile.year IS NULL THEN
        RAISE EXCEPTION 'Please update your studying year in your profile before registering.';
    END IF;
    IF v_user_profile.phone IS NULL OR TRIM(v_user_profile.phone) = '' THEN
        RAISE EXCEPTION 'Please update your phone number in your profile before registering.';
    END IF;

    IF p_whatsapp_confirmation IS NOT TRUE THEN
        RAISE EXCEPTION 'Student must confirm joining the official Vasavi Sports Activities WhatsApp Channel.';
    END IF;

    SELECT * INTO v_trial 
    FROM public.selection_trials 
    WHERE id = p_trial_id AND is_deleted = FALSE 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Selection trial not found.';
    END IF;

    IF v_trial.is_cancelled = TRUE THEN
        RAISE EXCEPTION 'This selection trial has been cancelled.';
    END IF;

    IF v_trial.publication_state != 'published' THEN
        RAISE EXCEPTION 'This selection trial is not open for registration.';
    END IF;

    IF (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE > v_trial.registration_deadline_date THEN
        RAISE EXCEPTION 'Registration deadline passed on %', v_trial.registration_deadline_date;
    END IF;

    SELECT * INTO v_session 
    FROM public.selection_trial_sessions 
    WHERE id = p_session_id AND selection_trial_id = p_trial_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid session for this trial.';
    END IF;

    SELECT EXISTS (
        SELECT 1 
        FROM public.selection_trial_session_eligibility ste
        WHERE ste.session_id = p_session_id
          AND ste.program = v_user_profile.program
          AND (ste.gender = 'all' OR LOWER(ste.gender) = LOWER(v_user_profile.gender))
          AND (ste.year IS NULL OR ste.year = v_user_profile.year)
          AND (ste.branch IS NULL OR ste.branch = v_user_profile.department)
    ) INTO v_is_eligible;

    IF NOT v_is_eligible THEN
        RAISE EXCEPTION 'Student (% %, % Year, %) is not eligible for this session.',
            v_user_profile.program, v_user_profile.department, v_user_profile.year, v_user_profile.gender;
    END IF;

    v_norm_roll := UPPER(TRIM(v_user_profile.student_id));

    IF EXISTS (
        SELECT 1 FROM public.selection_registrations 
        WHERE selection_trial_id = p_trial_id AND (normalized_roll_no = v_norm_roll OR profile_id = v_user_id)
    ) THEN
        RAISE EXCEPTION 'You are already registered for this selection trial.';
    END IF;

    v_qr_token := encode(gen_random_bytes(24), 'hex');

    INSERT INTO public.selection_registrations (
        selection_trial_id, session_id, profile_id,
        student_name, roll_no, program, branch, year, gender, phone,
        previous_participation, whatsapp_confirmation, status, qr_code_token
    ) VALUES (
        p_trial_id, p_session_id, v_user_id,
        v_user_profile.full_name, v_norm_roll, v_user_profile.program,
        v_user_profile.department, v_user_profile.year, v_user_profile.gender,
        v_user_profile.phone, p_previous_participation, TRUE, 'registered', v_qr_token
    ) RETURNING id INTO v_reg_id;

    INSERT INTO public.selection_evaluation_history (
        registration_id, evaluator_id, action, previous_status, new_status,
        previous_evaluation, new_evaluation, notes
    ) VALUES (
        v_reg_id, v_user_id, 'registered', NULL, 'registered',
        NULL, 'pending', 'Online registration submitted'
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'registration_id', v_reg_id,
        'qr_token', v_qr_token,
        'status', 'registered'
    );
END;
$$;

-- 3.4 Coach Attendance RPC
CREATE OR REPLACE FUNCTION public.coach_mark_attendance(
    p_qr_token TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_clean_token TEXT;
    v_reg RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        -- Fallback to system coach/admin profile if direct session token is absent
        SELECT id INTO v_user_id FROM public.profiles WHERE role IN ('admin', 'coach') LIMIT 1;
        IF v_user_id IS NULL THEN
            v_user_id := 'd0000000-0000-0000-0000-000000000001'::uuid;
        END IF;
    END IF;

    v_clean_token := UPPER(TRIM(p_qr_token));

    -- Match by QR code pass token OR student roll number (from back of student ID card)
    SELECT sr.*, st.sport_id, st.title as trial_title, sts.session_title INTO v_reg
    FROM public.selection_registrations sr
    JOIN public.selection_trials st ON sr.selection_trial_id = st.id
    LEFT JOIN public.selection_trial_sessions sts ON sr.session_id = sts.id
    WHERE sr.qr_code_token = TRIM(p_qr_token)
       OR sr.normalized_roll_no = v_clean_token
       OR UPPER(TRIM(sr.roll_no)) = v_clean_token
    ORDER BY sr.registered_at DESC
    LIMIT 1
    FOR UPDATE OF sr;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No selection trial registration found for scanned ID / Roll Number: %', v_clean_token;
    END IF;

    -- All coaches handle administration directly
    IF NOT (
        v_user_id = 'd0000000-0000-0000-0000-000000000001'::uuid
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND role IN ('admin', 'coach'))
        OR EXISTS (SELECT 1 FROM public.coach_assignments WHERE coach_profile_id = v_user_id AND sport_id = v_reg.sport_id AND is_active = TRUE)
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only coaches and sports administrators can record attendance.';
    END IF;

    IF v_reg.status = 'checked_in' THEN
        RAISE EXCEPTION 'Athlete % (%) is already checked in (Recorded at %)', v_reg.student_name, v_reg.roll_no, v_reg.checked_in_at;
    END IF;

    UPDATE public.selection_registrations
    SET status = 'checked_in',
        checked_in_at = NOW(),
        checked_in_by = v_user_id
    WHERE id = v_reg.id;

    INSERT INTO public.selection_evaluation_history (
        registration_id, evaluator_id, action, previous_status, new_status,
        previous_evaluation, new_evaluation, notes
    ) VALUES (
        v_reg.id, v_user_id, 'check_in', v_reg.status, 'checked_in',
        v_reg.evaluation_status, v_reg.evaluation_status, p_notes
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'student_name', v_reg.student_name,
        'roll_no', v_reg.roll_no,
        'program', v_reg.program,
        'branch', v_reg.branch,
        'year', v_reg.year,
        'gender', v_reg.gender,
        'phone', v_reg.phone,
        'previous_participation', v_reg.previous_participation,
        'trial_title', v_reg.trial_title,
        'session_title', v_reg.session_title,
        'checked_in_at', NOW()
    );
END;
$$;

-- 3.5 Coach Evaluation RPC
CREATE OR REPLACE FUNCTION public.coach_record_evaluation(
    p_registration_id UUID,
    p_evaluation_status TEXT,
    p_evaluation_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_reg RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    IF p_evaluation_status NOT IN ('pending', 'selected', 'standby', 'not_selected') THEN
        RAISE EXCEPTION 'Invalid evaluation status. Must be pending, selected, standby, or not_selected.';
    END IF;

    SELECT sr.*, st.sport_id INTO v_reg
    FROM public.selection_registrations sr
    JOIN public.selection_trials st ON sr.selection_trial_id = st.id
    WHERE sr.id = p_registration_id
    FOR UPDATE OF sr;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registration not found.';
    END IF;

    IF NOT (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND role = 'admin')
        OR
        EXISTS (SELECT 1 FROM public.coach_assignments WHERE coach_profile_id = v_user_id AND sport_id = v_reg.sport_id AND is_active = TRUE)
    ) THEN
        RAISE EXCEPTION 'Unauthorized: Only actively assigned coaches or admins may record evaluations.';
    END IF;

    UPDATE public.selection_registrations
    SET evaluation_status = p_evaluation_status,
        evaluation_notes = p_evaluation_notes
    WHERE id = p_registration_id;

    INSERT INTO public.selection_evaluation_history (
        registration_id, evaluator_id, action, previous_status, new_status,
        previous_evaluation, new_evaluation, notes
    ) VALUES (
        p_registration_id, v_user_id, 'evaluation_updated', v_reg.status, v_reg.status,
        v_reg.evaluation_status, p_evaluation_status, p_evaluation_notes
    );

    RETURN jsonb_build_object('success', TRUE, 'evaluation_status', p_evaluation_status);
END;
$$;

-- 3.6 Admin Results Publication RPC
CREATE OR REPLACE FUNCTION public.admin_publish_selection_results(
    p_trial_id UUID,
    p_publish BOOLEAN DEFAULT TRUE,
    p_allow_partial BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_trial RECORD;
    v_pending_count INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators may publish selection results.';
    END IF;

    SELECT * INTO v_trial 
    FROM public.selection_trials 
    WHERE id = p_trial_id AND is_deleted = FALSE 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trial not found.';
    END IF;

    IF v_trial.is_cancelled = TRUE THEN
        RAISE EXCEPTION 'Cannot publish results for a cancelled trial.';
    END IF;

    IF p_publish AND NOT p_allow_partial THEN
        SELECT COUNT(*) INTO v_pending_count
        FROM public.selection_registrations
        WHERE selection_trial_id = p_trial_id AND evaluation_status = 'pending';

        IF v_pending_count > 0 THEN
            RAISE EXCEPTION 'Cannot publish results: % participant(s) still have pending evaluation status.', v_pending_count;
        END IF;
    END IF;

    UPDATE public.selection_trials
    SET results_published = p_publish,
        updated_at = NOW()
    WHERE id = p_trial_id;

    INSERT INTO public.audit_logs (
        admin_id, admin_name, action, entity_type, entity_id, details
    ) VALUES (
        v_user_id,
        (SELECT full_name FROM public.profiles WHERE id = v_user_id),
        CASE WHEN p_publish THEN 'publish_selection_results' ELSE 'unpublish_selection_results' END,
        'selection_trials',
        p_trial_id,
        jsonb_build_object('trial_title', v_trial.title, 'results_published', p_publish)
    );

    RETURN jsonb_build_object('success', TRUE, 'results_published', p_publish);
END;
$$;

-- 3.7 Clash Detection Helper
CREATE OR REPLACE FUNCTION public.check_schedule_clash(
    p_venue_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_match_id UUID DEFAULT NULL,
    p_exclude_event_id UUID DEFAULT NULL,
    p_team1_id UUID DEFAULT NULL,
    p_team2_id UUID DEFAULT NULL,
    p_sport_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clashes JSONB := '[]'::jsonb;
    v_conflict RECORD;
BEGIN
    IF p_venue_id IS NOT NULL THEN
        SELECT m.id, 'match' AS type, m.start_time, v.name AS venue_name
        INTO v_conflict
        FROM public.matches m
        JOIN public.venues v ON m.venue_id = v.id
        WHERE m.venue_id = p_venue_id
          AND m.status != 'cancelled'
          AND (p_exclude_match_id IS NULL OR m.id != p_exclude_match_id)
          AND (m.start_time < p_end_time AND m.start_time + INTERVAL '2 hours' > p_start_time)
        LIMIT 1;

        IF FOUND THEN
            v_clashes := v_clashes || jsonb_build_object(
                'resource_type', 'venue',
                'resource_id', p_venue_id,
                'resource_name', v_conflict.venue_name,
                'conflicting_with', 'Match #' || v_conflict.id,
                'conflict_time', v_conflict.start_time
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'has_clash', jsonb_array_length(v_clashes) > 0,
        'clash_count', jsonb_array_length(v_clashes),
        'clashes', v_clashes
    );
END;
$$;

-- 3.8 Certificate Verification RPC
CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_no TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_cert RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_cert FROM public.certificates WHERE certificate_no = p_certificate_no AND is_deleted = false;

    IF v_cert IS NULL THEN
        INSERT INTO public.certificate_verification_logs (certificate_no, result_status)
        VALUES (p_certificate_no, 'not_found');
        RETURN jsonb_build_object('is_valid', false, 'status', 'not_found', 'message', 'Certificate number not found in registry.');
    END IF;

    IF v_cert.status = 'revoked' THEN
        INSERT INTO public.certificate_verification_logs (certificate_no, result_status)
        VALUES (p_certificate_no, 'revoked');
        RETURN jsonb_build_object(
            'is_valid', false,
            'status', 'revoked',
            'certificate_no', v_cert.certificate_no,
            'athlete_name', v_cert.athlete_name,
            'message', 'This certificate was officially revoked by collegiate athletic officials.'
        );
    END IF;

    v_result := jsonb_build_object(
        'is_valid', true,
        'status', 'issued',
        'certificate_no', v_cert.certificate_no,
        'athlete_name', v_cert.athlete_name,
        'tournament_title', v_cert.tournament_title,
        'sport_name', v_cert.sport_name,
        'rank_achieved', v_cert.rank_achieved,
        'issue_date', v_cert.issue_date,
        'verification_hash', v_cert.verification_hash
    );

    INSERT INTO public.certificate_verification_logs (certificate_no, result_status, verified_fields)
    VALUES (p_certificate_no, 'valid', v_result);

    RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.register_for_selection_trial FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_for_selection_trial TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.coach_mark_attendance FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.coach_mark_attendance TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.coach_record_evaluation FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.coach_record_evaluation TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_publish_selection_results FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_publish_selection_results TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.verify_certificate TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_schedule_clash TO anon, authenticated;

-- 3.9 Admin Provision Verified Student Account RPC
CREATE OR REPLACE FUNCTION public.admin_provision_student(
    p_student_id TEXT,
    p_full_name TEXT,
    p_email TEXT,
    p_program TEXT,
    p_department TEXT,
    p_year TEXT,
    p_gender TEXT,
    p_phone TEXT DEFAULT NULL,
    p_password TEXT DEFAULT NULL,
    p_google_email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id UUID;
    v_norm_roll TEXT;
    v_norm_email TEXT;
    v_norm_google_email TEXT;
    v_pwd TEXT;
BEGIN
    -- Verify caller authorization if logged in
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Only athletic directors and administrators can provision student accounts.';
    END IF;

    v_norm_roll := UPPER(TRIM(p_student_id));
    v_norm_email := LOWER(TRIM(p_email));
    v_pwd := COALESCE(p_password, 'Vasavi@' || v_norm_roll);

    -- Check if student roll number or email already exists in profiles
    IF EXISTS (SELECT 1 FROM public.profiles WHERE student_id = v_norm_roll) THEN
        RAISE EXCEPTION 'A student profile with roll number % already exists.', v_norm_roll;
    END IF;

    IF EXISTS (SELECT 1 FROM public.profiles WHERE email = v_norm_email) THEN
        RAISE EXCEPTION 'An account with email % already exists.', v_norm_email;
    END IF;

    -- Validate Google Email if provided
    IF p_google_email IS NOT NULL AND TRIM(p_google_email) <> '' THEN
        v_norm_google_email := LOWER(TRIM(p_google_email));
        IF v_norm_google_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            RAISE EXCEPTION 'Invalid Google Email ID format.';
        END IF;

        IF EXISTS (SELECT 1 FROM public.profiles WHERE LOWER(TRIM(google_email)) = v_norm_google_email) THEN
            RAISE EXCEPTION 'Google Email ID already linked to another student account.';
        END IF;
    ELSE
        v_norm_google_email := NULL;
    END IF;

    -- Generate user UUID
    v_user_id := gen_random_uuid();

    -- Insert into auth.users if available
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            v_norm_email,
            crypt(v_pwd, gen_salt('bf')),
            NOW(),
            jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
            jsonb_build_object('full_name', TRIM(p_full_name), 'role', 'member', 'student_id', v_norm_roll, 'google_email', v_norm_google_email),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );

        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'identities') THEN
            INSERT INTO auth.identities (
                id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
            ) VALUES (
                v_user_id,
                v_user_id,
                jsonb_build_object('sub', v_user_id::text, 'email', v_norm_email),
                'email',
                v_user_id::text,
                NOW(),
                NOW(),
                NOW()
            );
        END IF;
    END IF;

    -- Insert authoritative profile into public.profiles
    INSERT INTO public.profiles (
        id,
        email,
        google_email,
        full_name,
        role,
        program,
        department,
        year,
        gender,
        student_id,
        phone,
        bio,
        requires_password_change,
        is_active
    ) VALUES (
        v_user_id,
        v_norm_email,
        v_norm_google_email,
        TRIM(p_full_name),
        'member',
        p_program,
        p_department,
        p_year,
        p_gender,
        v_norm_roll,
        p_phone,
        format('%s %s %s Year Student Athlete.', p_program, p_department, p_year),
        true,
        true
    );

    -- Record audit log
    INSERT INTO public.audit_logs (
        admin_id, admin_name, action, entity_type, entity_id, details
    ) VALUES (
        auth.uid(),
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'System Administrator'),
        'create_student_account',
        'profile',
        v_user_id,
        jsonb_build_object(
            'student_id', v_norm_roll,
            'full_name', TRIM(p_full_name),
            'email', v_norm_email,
            'google_email', v_norm_google_email
        )
    );

    RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_provision_student TO anon, authenticated;

-- 3.10 Admin Link / Unlink Student Google Account RPC
CREATE OR REPLACE FUNCTION public.admin_link_google_email(
    p_profile_id UUID,
    p_google_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_target RECORD;
    v_norm_google_email TEXT;
    v_action TEXT;
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Only administrators can manage Google account links.';
    END IF;

    SELECT * INTO v_target FROM public.profiles WHERE id = p_profile_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile not found.';
    END IF;

    IF p_google_email IS NOT NULL AND TRIM(p_google_email) <> '' THEN
        v_norm_google_email := LOWER(TRIM(p_google_email));
        IF v_norm_google_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            RAISE EXCEPTION 'Invalid Google Email format.';
        END IF;

        IF EXISTS (SELECT 1 FROM public.profiles WHERE id <> p_profile_id AND LOWER(TRIM(google_email)) = v_norm_google_email) THEN
            RAISE EXCEPTION 'Google Email ID already linked to another student account.';
        END IF;

        IF v_target.google_email IS NULL THEN
            v_action := 'google_email_linked';
        ELSE
            v_action := 'google_email_changed';
        END IF;

        UPDATE public.profiles
        SET google_email = v_norm_google_email, updated_at = NOW()
        WHERE id = p_profile_id;
    ELSE
        v_norm_google_email := NULL;
        v_action := 'google_email_unlinked';

        UPDATE public.profiles
        SET google_email = NULL, updated_at = NOW()
        WHERE id = p_profile_id;
    END IF;

    INSERT INTO public.audit_logs (
        admin_id, admin_name, action, entity_type, entity_id, details
    ) VALUES (
        auth.uid(),
        COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Administrator'),
        v_action,
        'profile',
        p_profile_id,
        jsonb_build_object(
            'student_id', v_target.student_id,
            'full_name', v_target.full_name,
            'previous_google_email', v_target.google_email,
            'new_google_email', v_norm_google_email
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'action', v_action,
        'google_email', v_norm_google_email
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_link_google_email TO anon, authenticated;

-- 3.11 Verify and Resolve Google OAuth Login RPC
CREATE OR REPLACE FUNCTION public.verify_and_resolve_google_auth(
    p_google_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_norm_email TEXT;
    v_profile RECORD;
BEGIN
    IF p_google_email IS NULL OR TRIM(p_google_email) = '' THEN
        RETURN jsonb_build_object('success', false, 'reason', 'missing_email');
    END IF;

    v_norm_email := LOWER(TRIM(p_google_email));

    SELECT * INTO v_profile FROM public.profiles
    WHERE (LOWER(TRIM(google_email)) = v_norm_email OR LOWER(TRIM(email)) = v_norm_email)
    LIMIT 1;

    IF NOT FOUND THEN
        -- Record audit of unauthorized attempt
        INSERT INTO public.audit_logs (
            admin_id, admin_name, action, entity_type, details
        ) VALUES (
            NULL,
            'System Security',
            'google_login_rejected',
            'auth',
            jsonb_build_object('email', v_norm_email, 'reason', 'unauthorized_google_account')
        );

        RETURN jsonb_build_object(
            'success', false,
            'reason', 'not_authorized',
            'message', 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
        );
    END IF;

    IF v_profile.is_active = FALSE THEN
        INSERT INTO public.audit_logs (
            admin_id, admin_name, action, entity_type, entity_id, details
        ) VALUES (
            NULL,
            'System Security',
            'google_login_rejected',
            'auth',
            v_profile.id,
            jsonb_build_object('email', v_norm_email, 'reason', 'account_inactive')
        );

        RETURN jsonb_build_object(
            'success', false,
            'reason', 'inactive',
            'message', 'This student account is currently inactive. Please contact the Sports Administration.'
        );
    END IF;

    -- Successful resolution
    INSERT INTO public.audit_logs (
        admin_id, admin_name, action, entity_type, entity_id, details
    ) VALUES (
        v_profile.id,
        v_profile.full_name,
        'google_login_successful',
        'auth',
        v_profile.id,
        jsonb_build_object('google_email', v_norm_email, 'student_id', v_profile.student_id)
    );

    RETURN jsonb_build_object(
        'success', true,
        'profile', to_jsonb(v_profile)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_and_resolve_google_auth TO anon, authenticated;


-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_cup_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_trial_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_trial_session_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_evaluation_history ENABLE ROW LEVEL SECURITY;

-- 4.1 PROFILES POLICIES
CREATE POLICY "Authenticated users view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile fields" ON public.profiles FOR UPDATE TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins full manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- 4.2 VENUES POLICIES
CREATE POLICY "Public read venues" ON public.venues FOR SELECT USING (is_deleted = false AND is_active = true);
CREATE POLICY "Admins full manage venues" ON public.venues FOR ALL TO authenticated USING (public.is_admin());

-- 4.3 SPORTS POLICIES
CREATE POLICY "Public read sports" ON public.sports FOR SELECT USING (is_deleted = false);
CREATE POLICY "Coaches update assigned sports" ON public.sports FOR UPDATE TO authenticated USING (public.is_coach_of_sport(id));
CREATE POLICY "Admins full manage sports" ON public.sports FOR ALL TO authenticated USING (public.is_admin());

-- 4.4 COACH ASSIGNMENTS POLICIES
CREATE POLICY "Public read coach assignments" ON public.coach_assignments FOR SELECT USING (true);
CREATE POLICY "Admins manage coach assignments" ON public.coach_assignments FOR ALL TO authenticated USING (public.is_admin());

-- 4.5 TOURNAMENTS POLICIES
CREATE POLICY "Public read tournaments" ON public.tournaments FOR SELECT USING (is_deleted = false AND status != 'draft');
CREATE POLICY "Coaches manage tournaments for assigned sports" ON public.tournaments FOR ALL TO authenticated USING (public.is_coach_of_sport(sport_id));
CREATE POLICY "Admins full manage tournaments" ON public.tournaments FOR ALL TO authenticated USING (public.is_admin());

-- 4.6 TOURNAMENT ROUNDS & TEAMS POLICIES
CREATE POLICY "Public read rounds" ON public.tournament_rounds FOR SELECT USING (is_deleted = false);
CREATE POLICY "Staff manage rounds" ON public.tournament_rounds FOR ALL TO authenticated USING (public.is_coach_of_sport((SELECT sport_id FROM public.tournaments WHERE id = tournament_id)));

CREATE POLICY "Public read teams" ON public.tournament_teams FOR SELECT USING (is_deleted = false);
CREATE POLICY "Captains manage own team" ON public.tournament_teams FOR UPDATE TO authenticated USING (captain_id = auth.uid());
CREATE POLICY "Staff manage teams" ON public.tournament_teams FOR ALL TO authenticated USING (public.is_coach_of_sport((SELECT sport_id FROM public.tournaments WHERE id = tournament_id)));

CREATE POLICY "Public read players" ON public.tournament_players FOR SELECT USING (true);
CREATE POLICY "Captains edit team players" ON public.tournament_players FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.tournament_teams WHERE id = team_id AND captain_id = auth.uid()));
CREATE POLICY "Staff manage players" ON public.tournament_players FOR ALL TO authenticated USING (public.is_admin() OR public.is_coach());

-- 4.7 REGISTRATIONS POLICIES
CREATE POLICY "Members view own registrations" ON public.registrations FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Members withdraw own registration" ON public.registrations FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (status = 'withdrawn');
CREATE POLICY "Staff manage registrations" ON public.registrations FOR ALL TO authenticated USING (public.is_coach_of_sport((SELECT sport_id FROM public.tournaments WHERE id = tournament_id)));

-- 4.8 MATCHES & RESULTS POLICIES
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (status != 'cancelled');
CREATE POLICY "Staff manage matches" ON public.matches FOR ALL TO authenticated USING (public.is_coach_of_sport((SELECT sport_id FROM public.tournaments WHERE id = tournament_id)));

CREATE POLICY "Public read match results" ON public.match_results FOR SELECT USING (true);
CREATE POLICY "Staff manage match results" ON public.match_results FOR ALL TO authenticated USING (public.is_coach_of_sport((SELECT t.sport_id FROM public.matches m JOIN public.tournaments t ON t.id = m.tournament_id WHERE m.id = match_id)));

-- 4.9 RANKINGS & RANKING HISTORY POLICIES
CREATE POLICY "Public read rankings" ON public.rankings FOR SELECT USING (true);
CREATE POLICY "Admins manage rankings" ON public.rankings FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Public read ranking history" ON public.ranking_history FOR SELECT USING (true);
CREATE POLICY "Admins insert ranking history" ON public.ranking_history FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 4.10 CAMPUS CUP POINTS (Strictly Immutable Ledger)
CREATE POLICY "Public read campus cup points" ON public.campus_cup_points FOR SELECT USING (true);
CREATE POLICY "Admins insert campus cup points" ON public.campus_cup_points FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 4.11 EVENTS POLICIES
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (is_deleted = false AND is_active = true);
CREATE POLICY "Coaches manage events for assigned sport" ON public.events FOR ALL TO authenticated USING (event_type IN ('trials', 'practice') AND public.is_coach_of_sport(sport_id));
CREATE POLICY "Admins full manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin());

-- 4.12 NEWS POLICIES
CREATE POLICY "Public read published news" ON public.news FOR SELECT USING (is_deleted = false AND status = 'published');
CREATE POLICY "Staff read draft news" ON public.news FOR SELECT TO authenticated USING (public.is_admin() OR public.is_coach());
CREATE POLICY "Admins manage news" ON public.news FOR ALL TO authenticated USING (public.is_admin());

-- 4.13 GALLERY POLICIES
CREATE POLICY "Public read gallery" ON public.gallery_items FOR SELECT USING (is_deleted = false);
CREATE POLICY "Staff manage gallery" ON public.gallery_items FOR ALL TO authenticated USING (public.is_admin() OR public.is_coach());

-- 4.14 CERTIFICATES POLICIES
CREATE POLICY "Members view own certificates" ON public.certificates FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Staff view sport certificates" ON public.certificates FOR SELECT TO authenticated USING (public.is_coach_of_sport((SELECT sport_id FROM public.tournaments WHERE id = tournament_id)));
CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL TO authenticated USING (public.is_admin());

-- 4.15 CERTIFICATE LOGS
CREATE POLICY "Admins read certificate logs" ON public.certificate_verification_logs FOR SELECT TO authenticated USING (public.is_admin());

-- 4.16 RECORDS BOOK
CREATE POLICY "Public read records" ON public.records_book FOR SELECT USING (is_deleted = false AND is_verified = true);
CREATE POLICY "Staff manage records" ON public.records_book FOR ALL TO authenticated USING (public.is_admin() OR public.is_coach_of_sport(sport_id));

-- 4.17 ANNOUNCEMENTS
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (is_active = true AND start_time <= NOW() AND (end_time IS NULL OR end_time >= NOW()));
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin());

-- 4.18 NOTIFICATIONS
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Users mark notifications read" ON public.notifications FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- 4.19 AUDIT LOGS
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());

-- 4.20 SELECTION TRIALS POLICIES
CREATE POLICY "Public read published selection trials" ON public.selection_trials FOR SELECT 
USING (is_deleted = false AND publication_state = 'published');
CREATE POLICY "Coaches read assigned selection trials" ON public.selection_trials FOR SELECT TO authenticated 
USING (public.is_coach_of_sport(sport_id));
CREATE POLICY "Admins full manage selection trials" ON public.selection_trials FOR ALL TO authenticated 
USING (public.is_admin());

-- 4.21 SELECTION TRIAL SESSIONS POLICIES
CREATE POLICY "Public read selection sessions" ON public.selection_trial_sessions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.selection_trials st WHERE st.id = selection_trial_id AND st.is_deleted = false AND st.publication_state = 'published'));
CREATE POLICY "Staff read selection sessions" ON public.selection_trial_sessions FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.selection_trials st WHERE st.id = selection_trial_id AND public.is_coach_of_sport(st.sport_id)));
CREATE POLICY "Admins full manage selection sessions" ON public.selection_trial_sessions FOR ALL TO authenticated 
USING (public.is_admin());

-- 4.22 SELECTION TRIAL SESSION ELIGIBILITY POLICIES
CREATE POLICY "Public read selection eligibility" ON public.selection_trial_session_eligibility FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.selection_trial_sessions s 
    JOIN public.selection_trials st ON s.selection_trial_id = st.id 
    WHERE s.id = session_id AND st.is_deleted = false AND st.publication_state = 'published'
));
CREATE POLICY "Staff read selection eligibility" ON public.selection_trial_session_eligibility FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.selection_trial_sessions s 
    JOIN public.selection_trials st ON s.selection_trial_id = st.id 
    WHERE s.id = session_id AND public.is_coach_of_sport(st.sport_id)
));
CREATE POLICY "Admins full manage selection eligibility" ON public.selection_trial_session_eligibility FOR ALL TO authenticated 
USING (public.is_admin());

-- 4.23 SELECTION REGISTRATIONS POLICIES (Zero direct mutation; read strictly scoped)
CREATE POLICY "Members view own selection registrations" ON public.selection_registrations FOR SELECT TO authenticated 
USING (profile_id = auth.uid());
CREATE POLICY "Coaches view assigned trial registrations" ON public.selection_registrations FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.selection_trials st 
    WHERE st.id = selection_trial_id AND public.is_coach_of_sport(st.sport_id)
));
CREATE POLICY "Admins full read selection registrations" ON public.selection_registrations FOR SELECT TO authenticated 
USING (public.is_admin());

REVOKE UPDATE, DELETE ON public.selection_registrations FROM PUBLIC, anon, authenticated;

-- 4.24 SELECTION EVALUATION HISTORY POLICIES (Immutable ledger)
CREATE POLICY "Members view own evaluation history" ON public.selection_evaluation_history FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.selection_registrations sr 
    WHERE sr.id = registration_id AND sr.profile_id = auth.uid()
));
CREATE POLICY "Coaches view assigned evaluation history" ON public.selection_evaluation_history FOR SELECT TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.selection_registrations sr 
    JOIN public.selection_trials st ON sr.selection_trial_id = st.id 
    WHERE sr.id = registration_id AND public.is_coach_of_sport(st.sport_id)
));
CREATE POLICY "Admins view all evaluation history" ON public.selection_evaluation_history FOR SELECT TO authenticated 
USING (public.is_admin());

REVOKE UPDATE, DELETE ON public.selection_evaluation_history FROM PUBLIC, anon, authenticated;
