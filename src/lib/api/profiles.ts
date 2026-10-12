import { supabase, isSupabaseConfigured } from '../supabase';
import { Profile, PublicProfile } from '../types';
import { mockStudentAccounts } from '../mockData';

// Helper for local-development mock students storage (isolated to session)
const getLocalMockStudents = (): Profile[] => {
  if (typeof window === 'undefined') return mockStudentAccounts;
  try {
    const saved = sessionStorage.getItem('svec_mock_students');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // fallback
  }
  return mockStudentAccounts;
};

const saveLocalMockStudents = (students: Profile[]) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('svec_mock_students', JSON.stringify(students));
    } catch (e) {
      // ignore
    }
  }
};

export const profilesApi = {
  async getMyProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('profilesApi.getMyProfile:', error.message);
      return null;
    }

    return data;
  },

  async getPublicProfiles(): Promise<PublicProfile[]> {
    const { data, error } = await supabase
      .from('public_profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.warn('profilesApi.getPublicProfiles:', error.message);
      return [];
    }

    return data || [];
  },

  async updateMyProfile(updates: Partial<Pick<Profile, 'phone' | 'bio' | 'avatar_url' | 'hostel'>>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAccountCredentials(updates: {
    full_name?: string;
    email?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string; updatedProfile?: Profile }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const authUpdates: { email?: string; password?: string; data?: { full_name?: string } } = {};
      if (updates.email) authUpdates.email = updates.email.trim();
      if (updates.password) authUpdates.password = updates.password;
      if (updates.full_name) authUpdates.data = { full_name: updates.full_name.trim() };

      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) {
        throw new Error(authError.message);
      }

      const profileUpdates: Partial<Profile> = {
        updated_at: new Date().toISOString(),
        requires_password_change: false
      };
      if (updates.full_name) profileUpdates.full_name = updates.full_name.trim();
      if (updates.email) profileUpdates.email = updates.email.trim();

      const { data: updatedProfile, error: profError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (profError) {
        console.warn('Profile table update error:', profError.message);
      }

      return {
        success: true,
        message: 'Account credentials updated successfully.',
        updatedProfile: updatedProfile || undefined
      };
    }

    return {
      success: true,
      message: 'Account credentials updated successfully.'
    };
  },

  // Admin: Get all student accounts with authoritative Google Email info
  async adminGetAllStudents(): Promise<Profile[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'member')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('adminGetAllStudents database fetch failed, falling back:', err);
      }
    }

    return getLocalMockStudents();
  },

  // Admin: Update student permitted profile info & authorized Google email
  async adminUpdateStudentAccount(
    id: string, 
    updates: {
      full_name?: string;
      program?: 'B.Tech' | 'MBA';
      department?: string;
      year?: string;
      gender?: 'Men' | 'Women';
      phone?: string;
      google_email?: string;
      is_active?: boolean;
    }
  ): Promise<Profile> {
    const normGoogleEmail = updates.google_email?.trim() ? updates.google_email.trim().toLowerCase() : undefined;

    // Validate email format if provided
    if (normGoogleEmail) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(normGoogleEmail)) {
        throw new Error('Invalid Google Email ID format.');
      }
    }

    if (isSupabaseConfigured) {
      // 1. Check duplicate Google email across other students
      if (normGoogleEmail) {
        const { data: existing, error: checkError } = await supabase
          .from('profiles')
          .select('id, student_id')
          .neq('id', id)
          .ilike('google_email', normGoogleEmail);

        if (!checkError && existing && existing.length > 0) {
          throw new Error('Google Email ID already linked to another student account.');
        }
      }

      // 2. Execute Google email link RPC if google_email is in updates
      if (updates.google_email !== undefined) {
        try {
          await supabase.rpc('admin_link_google_email', {
            p_profile_id: id,
            p_google_email: normGoogleEmail || null
          });
        } catch (rpcErr) {
          console.warn('admin_link_google_email RPC error:', rpcErr);
        }
      }

      // 3. Update permitted profile fields
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      if (updates.full_name) dbUpdates.full_name = updates.full_name.trim();
      if (updates.program) dbUpdates.program = updates.program;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.year) dbUpdates.year = updates.year;
      if (updates.gender) dbUpdates.gender = updates.gender;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone.trim();
      if (updates.google_email !== undefined) dbUpdates.google_email = normGoogleEmail || null;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data;
      }
    }

    // Local / fallback update
    const currentList = getLocalMockStudents();
    if (normGoogleEmail) {
      const dup = currentList.find(s => s.id !== id && s.google_email?.toLowerCase() === normGoogleEmail);
      if (dup) {
        throw new Error('Google Email ID already linked to another student account.');
      }
    }

    const index = currentList.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Student account not found.');
    }

    const updated = {
      ...currentList[index],
      ...updates,
      google_email: updates.google_email !== undefined ? (normGoogleEmail || undefined) : currentList[index].google_email,
      updated_at: new Date().toISOString()
    };
    currentList[index] = updated;
    saveLocalMockStudents(currentList);
    return updated;
  },

  // Admin: Toggle student active/inactive status
  async adminToggleStudentActive(id: string, isActive: boolean): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (!error) {
          // Record audit log
          await supabase.from('audit_logs').insert({
            action: isActive ? 'student_account_activated' : 'student_account_deactivated',
            entity_type: 'profile',
            entity_id: id,
            details: { is_active: isActive }
          });
          return true;
        }
      } catch (err) {
        console.warn('Database toggle active error:', err);
      }
    }

    const currentList = getLocalMockStudents();
    const idx = currentList.findIndex(s => s.id === id);
    if (idx !== -1) {
      currentList[idx].is_active = isActive;
      saveLocalMockStudents(currentList);
    }
    return true;
  },

  // Admin: Initiate student password reset
  async adminInitiatePasswordReset(id: string, email: string): Promise<boolean> {
    if (isSupabaseConfigured && email) {
      try {
        await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
        await supabase.from('audit_logs').insert({
          action: 'password_reset_initiated',
          entity_type: 'profile',
          entity_id: id,
          details: { email: email.toLowerCase().trim() }
        });
        return true;
      } catch (err) {
        console.warn('Password reset trigger failed:', err);
      }
    }

    const currentList = getLocalMockStudents();
    const idx = currentList.findIndex(s => s.id === id);
    if (idx !== -1) {
      currentList[idx].requires_password_change = true;
      saveLocalMockStudents(currentList);
    }
    return true;
  },

  // Admin: Provision verified student account
  async adminProvisionStudent(studentData: {
    student_id: string;
    full_name: string;
    email: string;
    program: 'B.Tech' | 'MBA';
    department: string;
    year: string;
    gender: 'Men' | 'Women';
    phone?: string;
    password?: string;
    google_email?: string;
  }): Promise<{ id: string }> {
    const normGoogleEmail = studentData.google_email?.trim() 
      ? studentData.google_email.trim().toLowerCase() 
      : undefined;

    // Validate email format if provided
    if (normGoogleEmail) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(normGoogleEmail)) {
        throw new Error('Invalid Google Email ID format.');
      }
    }

    if (isSupabaseConfigured) {
      // Check duplicate Google email before RPC
      if (normGoogleEmail) {
        const { data: existing, error: checkError } = await supabase
          .from('profiles')
          .select('id, student_id')
          .ilike('google_email', normGoogleEmail);

        if (!checkError && existing && existing.length > 0) {
          throw new Error('Google Email ID already linked to another student account.');
        }
      }

      // Try 1: Call full 10-param admin_provision_student RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('admin_provision_student', {
        p_student_id: studentData.student_id.toUpperCase().trim(),
        p_full_name: studentData.full_name.trim(),
        p_email: studentData.email.toLowerCase().trim(),
        p_program: studentData.program,
        p_department: studentData.department,
        p_year: studentData.year,
        p_gender: studentData.gender,
        p_phone: studentData.phone?.trim() || null,
        p_password: studentData.password || null,
        p_google_email: normGoogleEmail || null
      });

      if (!rpcError && rpcData) {
        return { id: rpcData };
      }

      // If rpcError is a schema cache error or function not found (PGRST202)
      if (rpcError && (rpcError.message?.includes('schema cache') || rpcError.code === 'PGRST202')) {
        console.warn('10-param RPC not found in schema cache. Trying backward-compatible 9-param RPC...');
        // Try 2: Call legacy 9-param RPC (without p_google_email)
        const { data: rpcData9, error: rpcError9 } = await supabase.rpc('admin_provision_student', {
          p_student_id: studentData.student_id.toUpperCase().trim(),
          p_full_name: studentData.full_name.trim(),
          p_email: studentData.email.toLowerCase().trim(),
          p_program: studentData.program,
          p_department: studentData.department,
          p_year: studentData.year,
          p_gender: studentData.gender,
          p_phone: studentData.phone?.trim() || null,
          p_password: studentData.password || null
        });

        if (!rpcError9 && rpcData9) {
          if (normGoogleEmail) {
            await supabase
              .from('profiles')
              .update({ google_email: normGoogleEmail })
              .eq('id', rpcData9);
          }
          return { id: rpcData9 };
        }

        console.warn('RPC unavailable in database. Falling back to direct profile insert...');
        // Try 3: Direct insert into public.profiles
        const newUserId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
          ? crypto.randomUUID() 
          : `usr_stu_${Date.now()}`;

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            student_id: studentData.student_id.toUpperCase().trim(),
            full_name: studentData.full_name.trim(),
            email: studentData.email.toLowerCase().trim(),
            google_email: normGoogleEmail || null,
            program: studentData.program,
            department: studentData.department,
            year: studentData.year,
            gender: studentData.gender,
            phone: studentData.phone?.trim() || null,
            bio: `${studentData.program} ${studentData.department} ${studentData.year} Year Student Athlete.`,
            role: 'member',
            is_active: true,
            requires_password_change: true
          })
          .select('id')
          .single();

        if (!insertError && inserted?.id) {
          return { id: inserted.id };
        }

        if (insertError && (insertError.message?.includes('unique') || insertError.message?.includes('duplicate key') || insertError.code === '23505')) {
          throw new Error('A student profile with this Student ID or email already exists.');
        }
      } else if (rpcError) {
        console.error('admin_provision_student database error:', rpcError);
        throw new Error(rpcError.message || 'Database rejected student account creation.');
      }
    }

    // Local / offline fallback
    const currentList = getLocalMockStudents();
    if (normGoogleEmail) {
      const dup = currentList.find(s => s.google_email?.toLowerCase() === normGoogleEmail);
      if (dup) {
        throw new Error('Google Email ID already linked to another student account.');
      }
    }

    const newId = `mock_stu_${Date.now()}`;
    const newStudent: Profile = {
      id: newId,
      student_id: studentData.student_id.toUpperCase().trim(),
      full_name: studentData.full_name.trim(),
      email: studentData.email.toLowerCase().trim(),
      google_email: normGoogleEmail,
      program: studentData.program,
      department: studentData.department,
      year: studentData.year,
      gender: studentData.gender,
      phone: studentData.phone?.trim(),
      role: 'member',
      is_active: true,
      requires_password_change: true,
      created_at: new Date().toISOString()
    };
    currentList.unshift(newStudent);
    saveLocalMockStudents(currentList);
    return { id: newId };
  },

  // Verify and resolve Google OAuth email to an authorized student account
  async verifyAndResolveGoogleAuth(googleEmail: string): Promise<{
    success: boolean;
    profile?: Profile;
    reason?: 'not_authorized' | 'inactive' | 'error';
    message?: string;
  }> {
    const trimmed = (googleEmail || '').trim().toLowerCase();
    if (!trimmed) {
      return {
        success: false,
        reason: 'not_authorized',
        message: 'No Google account email provided.'
      };
    }

    if (isSupabaseConfigured) {
      try {
        // First try server-side RPC for atomic verification & auditing
        const { data: rpcData, error: rpcError } = await supabase.rpc('verify_and_resolve_google_auth', {
          p_google_email: trimmed
        });

        if (!rpcError && rpcData) {
          if (rpcData.success && rpcData.profile) {
            return {
              success: true,
              profile: rpcData.profile
            };
          }
          return {
            success: false,
            reason: rpcData.reason || 'not_authorized',
            message: rpcData.message || 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
          };
        }

        // Direct table query fallback if RPC is not yet loaded
        const { data: matchedProfile, error: queryError } = await supabase
          .from('profiles')
          .select('*')
          .or(`google_email.ilike.${trimmed},email.ilike.${trimmed}`)
          .maybeSingle();

        if (queryError) {
          console.warn('Google auth profile lookup error:', queryError.message);
        }

        if (matchedProfile) {
          if (matchedProfile.is_active === false) {
            return {
              success: false,
              reason: 'inactive',
              message: 'This student account is currently inactive. Please contact the Sports Administration.'
            };
          }
          return {
            success: true,
            profile: matchedProfile
          };
        }
      } catch (err) {
        console.warn('Database Google auth verification error:', err);
      }
    }

    // Local / mock fallback verification
    const currentList = getLocalMockStudents();
    const matched = currentList.find(
      s => s.google_email?.toLowerCase() === trimmed || s.email.toLowerCase() === trimmed
    );

    if (!matched) {
      return {
        success: false,
        reason: 'not_authorized',
        message: 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
      };
    }

    if (matched.is_active === false) {
      return {
        success: false,
        reason: 'inactive',
        message: 'This student account is currently inactive. Please contact the Sports Administration.'
      };
    }

    return {
      success: true,
      profile: matched
    };
  },

  // Resolve student account by username (either Student ID / Roll No or Email)
  async resolveStudentByUsername(username: string): Promise<Profile | null> {
    const trimmed = (username || '').trim();
    if (!trimmed) return null;

    if (isSupabaseConfigured) {
      try {
        const isEmail = trimmed.includes('@');
        let query = supabase.from('profiles').select('*');
        if (isEmail) {
          query = query.ilike('email', trimmed);
        } else {
          query = query.or(`student_id.ilike.${trimmed},normalized_roll_no.ilike.${trimmed}`);
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('resolveStudentByUsername query error:', err);
      }
    }

    // Local / mock resolution
    const currentList = getLocalMockStudents();
    const isEmail = trimmed.includes('@');
    if (isEmail) {
      return currentList.find(s => s.email.toLowerCase() === trimmed.toLowerCase()) || null;
    }
    return currentList.find(s => s.student_id?.toUpperCase() === trimmed.toUpperCase()) || null;
  }
};
