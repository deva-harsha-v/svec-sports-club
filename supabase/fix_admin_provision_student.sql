-- ====================================================================
-- SRI VASAVI SPORTS CLUB // SUPABASE FIX SCRIPT
-- Resolves: "Could not find the function public.admin_provision_student in the schema cache"
-- ====================================================================

-- 1. Ensure public.profiles table has the required columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;

-- 2. Partial unique index for case-insensitive Google Email lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_google_email 
ON public.profiles(LOWER(TRIM(google_email))) 
WHERE google_email IS NOT NULL;

-- 3. Drop all previous overloads of admin_provision_student to avoid signature conflicts
DROP FUNCTION IF EXISTS public.admin_provision_student(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_provision_student(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 4. Re-create admin_provision_student RPC with full parameters & Google Email support
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

-- 5. Grant execute permissions to anon and authenticated
GRANT EXECUTE ON FUNCTION public.admin_provision_student TO anon, authenticated;

-- 6. Also ensure admin_link_google_email and verify_and_resolve_google_auth are installed
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

    RETURN jsonb_build_object(
        'success', true,
        'action', v_action,
        'google_email', v_norm_google_email
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_link_google_email TO anon, authenticated;

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
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'not_authorized',
            'message', 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
        );
    END IF;

    IF v_profile.is_active = FALSE THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'inactive',
            'message', 'This student account is currently inactive. Please contact the Sports Administration.'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'profile', row_to_json(v_profile)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_and_resolve_google_auth TO anon, authenticated;

-- 7. Force PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
