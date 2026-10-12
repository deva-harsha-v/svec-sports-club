-- ============================================================================
-- SRI VASAVI SPORTS CLUB // Authoritative Seed Data
-- Sri Vasavi Engineering College (SVEC) Sports, Facilities & Official Selection Trials
-- ============================================================================

-- 0. AUTH USERS (Seed auth accounts if table exists in Supabase environment)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
        ) VALUES 
            ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@svec.ac.in', crypt('Admin@SVEC2026', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Physical Director"}', NOW(), NOW(), 'authenticated', 'authenticated'),
            ('c0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'coach.cricket@svec.ac.in', crypt('Coach@SVEC2026', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Cricket Coach"}', NOW(), NOW(), 'authenticated', 'authenticated'),
            ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'student.cse2@svec.ac.in', crypt('Student@SVEC2026', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"K. Rajesh"}', NOW(), NOW(), 'authenticated', 'authenticated'),
            ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'student.ece3@svec.ac.in', crypt('Student@SVEC2026', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"M. Suresh"}', NOW(), NOW(), 'authenticated', 'authenticated'),
            ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'student.mech4@svec.ac.in', crypt('Student@SVEC2026', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"V. Akhil"}', NOW(), NOW(), 'authenticated', 'authenticated'),
            ('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'student.mba@svec.ac.in', crypt('Student@SVEC2026', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"P. Venkat"}', NOW(), NOW(), 'authenticated', 'authenticated'),
            ('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'student.cai3@svec.ac.in', crypt('Student@SVEC2026', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"S. Haritha"}', NOW(), NOW(), 'authenticated', 'authenticated')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'identities') THEN
        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
        ) VALUES 
            ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', format('{"sub":"%s","email":"%s"}', 'a0000000-0000-0000-0000-000000000001', 'admin@svec.ac.in')::jsonb, 'email', 'a0000000-0000-0000-0000-000000000001', NOW(), NOW(), NOW()),
            ('c0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', format('{"sub":"%s","email":"%s"}', 'c0000000-0000-0000-0000-000000000002', 'coach.cricket@svec.ac.in')::jsonb, 'email', 'c0000000-0000-0000-0000-000000000002', NOW(), NOW(), NOW()),
            ('d0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', format('{"sub":"%s","email":"%s"}', 'd0000000-0000-0000-0000-000000000003', 'student.cse2@svec.ac.in')::jsonb, 'email', 'd0000000-0000-0000-0000-000000000003', NOW(), NOW(), NOW()),
            ('d0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', format('{"sub":"%s","email":"%s"}', 'd0000000-0000-0000-0000-000000000004', 'student.ece3@svec.ac.in')::jsonb, 'email', 'd0000000-0000-0000-0000-000000000004', NOW(), NOW(), NOW()),
            ('d0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', format('{"sub":"%s","email":"%s"}', 'd0000000-0000-0000-0000-000000000005', 'student.mech4@svec.ac.in')::jsonb, 'email', 'd0000000-0000-0000-0000-000000000005', NOW(), NOW(), NOW()),
            ('d0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', format('{"sub":"%s","email":"%s"}', 'd0000000-0000-0000-0000-000000000006', 'student.mba@svec.ac.in')::jsonb, 'email', 'd0000000-0000-0000-0000-000000000006', NOW(), NOW(), NOW()),
            ('d0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000007', format('{"sub":"%s","email":"%s"}', 'd0000000-0000-0000-0000-000000000007', 'student.cai3@svec.ac.in')::jsonb, 'email', 'd0000000-0000-0000-0000-000000000007', NOW(), NOW(), NOW())
        ON CONFLICT (provider, provider_id) DO NOTHING;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 1. BASELINE ACADEMIC PROFILES
INSERT INTO public.profiles (id, email, full_name, role, program, department, year, gender, student_id, phone, bio)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'admin@svec.ac.in', 'Physical Director', 'admin', 'Staff', 'Physical Education', NULL, 'Men', 'EMP-PED-001', '+91 94401 00001', 'Director of Physical Education & Sports, Sri Vasavi Engineering College.'),
    ('c0000000-0000-0000-0000-000000000002', 'coach.cricket@svec.ac.in', 'Cricket Coach', 'coach', 'Staff', 'Physical Education', NULL, 'Men', 'EMP-COA-002', '+91 94401 00002', 'Varsity Cricket Coach.'),
    ('d0000000-0000-0000-0000-000000000003', 'student.cse2@svec.ac.in', 'K. Rajesh', 'member', 'B.Tech', 'CSE', '2nd', 'Men', '24A81A0501', '+91 98480 11111', 'B.Tech CSE 2nd Year Athlete.'),
    ('d0000000-0000-0000-0000-000000000004', 'student.ece3@svec.ac.in', 'M. Suresh', 'member', 'B.Tech', 'ECE', '3rd', 'Men', '23A81A0401', '+91 98480 22222', 'B.Tech ECE 3rd Year Athlete.'),
    ('d0000000-0000-0000-0000-000000000005', 'student.mech4@svec.ac.in', 'V. Akhil', 'member', 'B.Tech', 'MECH', '4th', 'Men', '22A81A0301', '+91 98480 33333', 'B.Tech MECH 4th Year Athlete.'),
    ('d0000000-0000-0000-0000-000000000006', 'student.mba@svec.ac.in', 'P. Venkat', 'member', 'MBA', 'Management', '1st', 'Men', '25A81E0001', '+91 98480 44444', 'MBA 1st Year Athlete.'),
    ('d0000000-0000-0000-0000-000000000007', 'student.cai3@svec.ac.in', 'S. Haritha', 'member', 'B.Tech', 'CAI', '3rd', 'Women', '23A81A4301', '+91 98480 55555', 'B.Tech CAI 3rd Year Athlete.')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    program = EXCLUDED.program,
    department = EXCLUDED.department,
    year = EXCLUDED.year,
    gender = EXCLUDED.gender,
    student_id = EXCLUDED.student_id,
    phone = EXCLUDED.phone;

-- 2. VENUES (Actual SVEC campus locations)
INSERT INTO public.venues (id, name, location, capacity, supported_sports)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'SVEC Sports Ground', 'College Campus Ground', 2500, ARRAY['Cricket', 'Football', 'Athletics', 'Volleyball', 'Kho-Kho', 'Kabaddi', 'Basketball', 'Handball', 'Ball Badminton']),
    ('e0000000-0000-0000-0000-000000000002', 'SVEC Indoor Sports Complex', 'Student Amenities Block', 500, ARRAY['Table Tennis', 'Shuttle Badminton', 'Chess', 'Yoga', 'Taekwondo', 'Fencing', 'Self-Defence'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    capacity = EXCLUDED.capacity,
    supported_sports = EXCLUDED.supported_sports;

-- 3. THE 20 OFFICIAL SVEC SPORTS & ATHLETIC FACILITIES
INSERT INTO public.sports (
    id, name, slug, facility_type, category, discipline_type, is_competitive, icon, description, rules, min_team_size, max_team_size
) VALUES
    ('f0000000-0000-0000-0000-000000000001', 'Shuttle Badminton', 'shuttle-badminton', 'competitive_sport', 'Racquet Sport', 'both', true, 'Zap', 'Singles and doubles collegiate badminton championship on synthetic courts.', 'Standard BWF rules. Best of 3 sets of 21 points.', 1, 2),
    ('f0000000-0000-0000-0000-000000000002', 'Kho-Kho', 'kho-kho', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Activity', 'Traditional Indian tag team sport demanding extreme agility and stamina.', 'Official KKFI regulations. 9 players per side with chasers and runners.', 9, 12),
    ('f0000000-0000-0000-0000-000000000003', 'Yoga', 'yoga', 'fitness_wellness', 'Mind & Body', 'individual', false, 'Heart', 'Comprehensive holistic wellness and asana practice sessions promoting student mental health and flexibility.', 'Standard yogic practice protocols under certified guidance.', 1, 1),
    ('f0000000-0000-0000-0000-000000000004', 'Basketball', 'basketball', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Trophy', 'Varsity basketball team program with official floodlit court fixtures.', 'FIBA standard 4 quarters of 10 minutes.', 5, 10),
    ('f0000000-0000-0000-0000-000000000005', 'Handball', 'handball', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Target', 'Fast-paced team handball competitions and training on marked courts.', 'IHF regulations. Two 30-minute halves.', 7, 14),
    ('f0000000-0000-0000-0000-000000000006', 'Netball', 'netball', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Target', 'Precision ball sport emphasizing team coordination and court positioning.', 'INF international tournament rules. 7 players per team.', 7, 12),
    ('f0000000-0000-0000-0000-000000000007', 'Fencing', 'fencing', 'competitive_sport', 'Combat & Martial Arts', 'individual', true, 'Shield', 'Olympic sword discipline testing tactical acumen, reflexes, and precision footwork.', 'FIE foil, epee, and sabre regulations.', 1, 1),
    ('f0000000-0000-0000-0000-000000000008', 'Taekwondo', 'taekwondo', 'competitive_sport', 'Combat & Martial Arts', 'individual', true, 'Flame', 'World Taekwondo martial art discipline emphasizing high kicks and defensive sparring.', 'WT competition sparring rules with protective gear.', 1, 1),
    ('f0000000-0000-0000-0000-000000000009', 'Self-Defence', 'self-defence', 'training_facility', 'Combat & Martial Arts', 'individual', false, 'ShieldAlert', 'Practical personal safety and situational defense conditioning workshops.', 'Safety-first progressive resistance training.', 1, 1),
    ('f0000000-0000-0000-0000-000000000010', 'Table Tennis', 'table-tennis', 'competitive_sport', 'Racquet Sport', 'both', true, 'Circle', 'Fast indoor table tennis trials and varsity singles/doubles tournaments.', 'ITTF rules. 11-point sets with alternating service.', 1, 2),
    ('f0000000-0000-0000-0000-000000000011', 'Ball Badminton', 'ball-badminton', 'competitive_sport', 'Racquet Sport', 'team', true, 'Wind', 'Traditional Indian racquet team sport played with woolen yellow ball.', 'Ball Badminton Federation of India official rules. 5 players per side.', 5, 10),
    ('f0000000-0000-0000-0000-000000000012', 'Chess', 'chess', 'competitive_sport', 'Mind & Strategy', 'individual', true, 'Brain', 'Collegiate mind sport championship featuring standard and rapid time controls.', 'FIDE touch-move and electronic clock regulations.', 1, 1),
    ('f0000000-0000-0000-0000-000000000013', 'Cricket', 'cricket', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Crosshair', 'Varsity cricket team selections, inter-department tournaments, and JNTUK trials.', 'BCCI / ICC standard playing conditions.', 11, 16),
    ('f0000000-0000-0000-0000-000000000014', 'Volleyball', 'volleyball', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Compass', 'Men and women volleyball selections on standard sand and hard outdoor courts.', 'FIVB rules. Best of 3 or 5 sets of 25 points with rotation.', 6, 12),
    ('f0000000-0000-0000-0000-000000000015', 'Kabaddi', 'kabaddi', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Award', 'High-intensity contact sport testing raider skill and defensive team coordination.', 'AKFI standard mat/court regulations. 7 active players per side.', 7, 12),
    ('f0000000-0000-0000-0000-000000000016', 'Football', 'football', 'competitive_sport', 'Outdoor Sport', 'team', true, 'Activity', '11-a-side association football championship on standard natural turf.', 'FIFA Laws of the Game.', 11, 16),
    ('f0000000-0000-0000-0000-000000000017', 'Athletics', 'athletics', 'competitive_sport', 'Track & Field', 'individual', true, 'Zap', 'Track events (100m, 200m, 400m, relays) and field jumps/throws.', 'AFI track and field rules with electronic timing.', 1, 4),
    ('f0000000-0000-0000-0000-000000000018', 'Archery', 'archery', 'competitive_sport', 'Target Sport', 'individual', true, 'Target', 'Target precision archery discipline with recurve and compound equipment.', 'World Archery standard target face scoring protocols.', 1, 1),
    ('f0000000-0000-0000-0000-000000000019', 'Gymnasium', 'gymnasium', 'training_facility', 'Fitness Facility', 'individual', false, 'Dumbbell', 'Dedicated multi-station indoor gym equipped with free weights and strength resistance machines.', 'Athletics department gym safety and supervision guidelines.', 1, 1),
    ('f0000000-0000-0000-0000-000000000020', 'Open Gym', 'open-gym', 'training_facility', 'Fitness Facility', 'individual', false, 'Sun', 'Open-air bodyweight and calisthenics fitness installation accessible across athletic grounds.', 'Outdoor fitness station safety protocols.', 1, 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    facility_type = EXCLUDED.facility_type,
    category = EXCLUDED.category,
    discipline_type = EXCLUDED.discipline_type,
    is_competitive = EXCLUDED.is_competitive,
    description = EXCLUDED.description,
    rules = EXCLUDED.rules;

-- 4. ACTIVE COACH ASSIGNMENTS
INSERT INTO public.coach_assignments (id, coach_profile_id, sport_id, is_active, assigned_by)
VALUES
    ('ca000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000013', true, 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (coach_profile_id, sport_id) DO UPDATE SET is_active = true;

-- 5. OFFICIAL SELECTION TRIALS (From Official SVEC Circulars 117 & 118)

-- 5.1 Cricket (Men) — Circular 117
INSERT INTO public.selection_trials (
    id, sport_id, title, slug, gender_scope, circular_ref, circular_date,
    official_registration_url, source_document_name, instructions,
    registration_deadline_date, venue_name, publication_state, whatsapp_channel_url
) VALUES (
    'da000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000013',
    'SVEC Cricket (Men) Selection Trials 2026-27',
    'cricket-men-selection-trials-2026-27',
    'men',
    'SVEC/Admn./SJ/Circular/2026-27/117',
    '2026-09-28',
    'https://tinyurl.com/3d73phrv',
    '117Cricket(Men)SelectionTrials-2026-27.pdf',
    'Candidate must carry ID card. Players must wear shoes. Candidate must bring their own sports kit.',
    '2026-10-04',
    NULL,
    'published',
    'https://whatsapp.com/channel/svec-sports-activities'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    circular_ref = EXCLUDED.circular_ref,
    circular_date = EXCLUDED.circular_date,
    official_registration_url = EXCLUDED.official_registration_url,
    source_document_name = EXCLUDED.source_document_name,
    instructions = EXCLUDED.instructions,
    registration_deadline_date = EXCLUDED.registration_deadline_date,
    publication_state = EXCLUDED.publication_state;

-- Cricket Sessions
INSERT INTO public.selection_trial_sessions (id, selection_trial_id, session_title, start_time, end_time, session_notes)
VALUES
    ('ea000000-0000-0000-0000-000000000001', 'da000000-0000-0000-0000-000000000001', 'B.Tech 2nd Year Selection Trial', '2026-10-05 15:40:00+05:30', '2026-10-05 18:30:00+05:30', 'Reporting time: 3:30 PM with college ID card and personal kit.'),
    ('ea000000-0000-0000-0000-000000000002', 'da000000-0000-0000-0000-000000000001', 'B.Tech 3rd Year Selection Trial', '2026-10-06 15:40:00+05:30', '2026-10-06 18:30:00+05:30', 'Reporting time: 3:30 PM with college ID card and personal kit.'),
    ('ea000000-0000-0000-0000-000000000003', 'da000000-0000-0000-0000-000000000001', 'B.Tech 4th Year & MBA Selection Trial', '2026-10-07 15:40:00+05:30', '2026-10-07 18:30:00+05:30', 'Reporting time: 3:30 PM with college ID card and personal kit.')
ON CONFLICT (id) DO UPDATE SET
    session_title = EXCLUDED.session_title,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    session_notes = EXCLUDED.session_notes;

-- Cricket Session Eligibility (Normalized combinations)
DELETE FROM public.selection_trial_session_eligibility WHERE session_id IN (
    'ea000000-0000-0000-0000-000000000001', 'ea000000-0000-0000-0000-000000000002', 'ea000000-0000-0000-0000-000000000003'
);
INSERT INTO public.selection_trial_session_eligibility (session_id, program, year, branch, gender)
VALUES
    -- Session 1: B.Tech 2nd Year Men only
    ('ea000000-0000-0000-0000-000000000001', 'B.Tech', '2nd', NULL, 'men'),
    -- Session 2: B.Tech 3rd Year Men only
    ('ea000000-0000-0000-0000-000000000002', 'B.Tech', '3rd', NULL, 'men'),
    -- Session 3: B.Tech 4th Year Men AND MBA Men (all years)
    ('ea000000-0000-0000-0000-000000000003', 'B.Tech', '4th', NULL, 'men'),
    ('ea000000-0000-0000-0000-000000000003', 'MBA', NULL, NULL, 'men');

-- 5.2 Table Tennis (Men & Women) — Circular 118
INSERT INTO public.selection_trials (
    id, sport_id, title, slug, gender_scope, circular_ref, circular_date,
    official_registration_url, source_document_name, instructions,
    registration_deadline_date, venue_name, publication_state, whatsapp_channel_url
) VALUES (
    'da000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000010',
    'SVEC Table Tennis (Men & Women) Selection Trials 2026-27',
    'table-tennis-selection-trials-2026-27',
    'all',
    'SVEC/Admn./SJ/Circular/2026-27/118',
    '2026-09-30',
    'https://tinyurl.com/2j9srhnc',
    '118SelectionTrialsTTandVolleyball(M&W).pdf',
    'Candidate must carry ID card. Candidate must bring their own sports kit.',
    '2026-10-06',
    NULL,
    'published',
    'https://whatsapp.com/channel/svec-sports-activities'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    circular_ref = EXCLUDED.circular_ref,
    circular_date = EXCLUDED.circular_date,
    official_registration_url = EXCLUDED.official_registration_url,
    source_document_name = EXCLUDED.source_document_name,
    instructions = EXCLUDED.instructions,
    registration_deadline_date = EXCLUDED.registration_deadline_date,
    publication_state = EXCLUDED.publication_state;

-- Table Tennis Sessions
INSERT INTO public.selection_trial_sessions (id, selection_trial_id, session_title, start_time, end_time, session_notes)
VALUES
    ('ea000000-0000-0000-0000-000000000004', 'da000000-0000-0000-0000-000000000002', 'Table Tennis (Women) Selection Trial', '2026-10-07 15:30:00+05:30', '2026-10-07 16:30:00+05:30', 'Applicable to all B.Tech and MBA Women students.'),
    ('ea000000-0000-0000-0000-000000000005', 'da000000-0000-0000-0000-000000000002', 'Table Tennis (Men) Selection Trial', '2026-10-07 16:30:00+05:30', '2026-10-07 18:30:00+05:30', 'Applicable to all B.Tech and MBA Men students.')
ON CONFLICT (id) DO UPDATE SET
    session_title = EXCLUDED.session_title,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    session_notes = EXCLUDED.session_notes;

-- Table Tennis Eligibility
DELETE FROM public.selection_trial_session_eligibility WHERE session_id IN (
    'ea000000-0000-0000-0000-000000000004', 'ea000000-0000-0000-0000-000000000005'
);
INSERT INTO public.selection_trial_session_eligibility (session_id, program, year, branch, gender)
VALUES
    -- Session 1: Women (B.Tech & MBA)
    ('ea000000-0000-0000-0000-000000000004', 'B.Tech', NULL, NULL, 'women'),
    ('ea000000-0000-0000-0000-000000000004', 'MBA', NULL, NULL, 'women'),
    -- Session 2: Men (B.Tech & MBA)
    ('ea000000-0000-0000-0000-000000000005', 'B.Tech', NULL, NULL, 'men'),
    ('ea000000-0000-0000-0000-000000000005', 'MBA', NULL, NULL, 'men');

-- 5.3 Volleyball (Men & Women) — Circular 118
INSERT INTO public.selection_trials (
    id, sport_id, title, slug, gender_scope, circular_ref, circular_date,
    official_registration_url, source_document_name, instructions,
    registration_deadline_date, venue_name, publication_state, whatsapp_channel_url
) VALUES (
    'da000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000014',
    'SVEC Volleyball (Men & Women) Selection Trials 2026-27',
    'volleyball-selection-trials-2026-27',
    'all',
    'SVEC/Admn./SJ/Circular/2026-27/118',
    '2026-09-30',
    'https://tinyurl.com/2j9srhnc',
    '118SelectionTrialsTTandVolleyball(M&W).pdf',
    'Candidate must carry ID card. Candidate must bring their own sports kit.',
    '2026-10-06',
    NULL,
    'published',
    'https://whatsapp.com/channel/svec-sports-activities'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    circular_ref = EXCLUDED.circular_ref,
    circular_date = EXCLUDED.circular_date,
    official_registration_url = EXCLUDED.official_registration_url,
    source_document_name = EXCLUDED.source_document_name,
    instructions = EXCLUDED.instructions,
    registration_deadline_date = EXCLUDED.registration_deadline_date,
    publication_state = EXCLUDED.publication_state;

-- Volleyball Sessions
INSERT INTO public.selection_trial_sessions (id, selection_trial_id, session_title, start_time, end_time, session_notes)
VALUES
    ('ea000000-0000-0000-0000-000000000006', 'da000000-0000-0000-0000-000000000003', 'Volleyball (Women) Selection Trial', '2026-10-08 15:30:00+05:30', '2026-10-08 16:30:00+05:30', 'Applicable to all B.Tech and MBA Women students.'),
    ('ea000000-0000-0000-0000-000000000007', 'da000000-0000-0000-0000-000000000003', 'Volleyball (Men) Selection Trial', '2026-10-12 16:30:00+05:30', '2026-10-12 18:30:00+05:30', 'Applicable to all B.Tech and MBA Men students.')
ON CONFLICT (id) DO UPDATE SET
    session_title = EXCLUDED.session_title,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    session_notes = EXCLUDED.session_notes;

-- Volleyball Eligibility
DELETE FROM public.selection_trial_session_eligibility WHERE session_id IN (
    'ea000000-0000-0000-0000-000000000006', 'ea000000-0000-0000-0000-000000000007'
);
INSERT INTO public.selection_trial_session_eligibility (session_id, program, year, branch, gender)
VALUES
    -- Session 1: Women (B.Tech & MBA)
    ('ea000000-0000-0000-0000-000000000006', 'B.Tech', NULL, NULL, 'women'),
    ('ea000000-0000-0000-0000-000000000006', 'MBA', NULL, NULL, 'women'),
    -- Session 2: Men (B.Tech & MBA)
    ('ea000000-0000-0000-0000-000000000007', 'B.Tech', NULL, NULL, 'men'),
    ('ea000000-0000-0000-0000-000000000007', 'MBA', NULL, NULL, 'men');

-- 6. REAL HISTORICAL/CAMPUS CUP STANDINGS
INSERT INTO public.campus_cup_points (season_year, entity_type, entity_id, entity_name, achievement, points_awarded, reason, awarded_by)
VALUES
    (2026, 'department', 'dept_cse', 'CSE', 'gold', 100, 'Champions of Inter-Department Athletics Meet 2026', 'a0000000-0000-0000-0000-000000000001'),
    (2026, 'department', 'dept_ece', 'ECE', 'silver', 60, 'Runners-up in Inter-Department Cricket Tournament', 'a0000000-0000-0000-0000-000000000001'),
    (2026, 'department', 'dept_mech', 'MECH', 'gold', 100, 'Winners of Inter-Department Volleyball Championship', 'a0000000-0000-0000-0000-000000000001'),
    (2026, 'department', 'dept_cai', 'CAI', 'bronze', 30, 'Semifinalists in Table Tennis Singles', 'a0000000-0000-0000-0000-000000000001');

-- 7. OFFICIAL ATHLETIC ANNOUNCEMENTS
INSERT INTO public.announcements (message, link_url, priority, start_time)
VALUES
    ('Official Selection Trials for Cricket (Men), Table Tennis (M&W), and Volleyball (M&W) are currently underway. Candidate must carry ID card.', '/trials', 'urgent', NOW());
