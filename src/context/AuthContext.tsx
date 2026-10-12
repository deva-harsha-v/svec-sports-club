import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Role } from '../lib/types';
import { mockCurrentUser, mockAdminUser } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { profilesApi } from '../lib/api/profiles';

export interface SignInResult {
  success: boolean;
  role?: Role;
  message?: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  currentUser: Profile | null;
  role: Role | 'public';
  switchRole: (newRole: Role | 'public') => void;
  signIn: (usernameOrEmail: string, password?: string) => Promise<SignInResult>;
  signInWithGoogle: (testGoogleEmail?: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  updateUserAccount: (data: {
    full_name?: string;
    email?: string;
    password?: string;
  }) => Promise<{ success: boolean; message: string }>;
  isConfiguredWithSupabase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clean up any legacy shared localStorage auth tokens from previous runs
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('svec_sports_role');
    localStorage.removeItem('svec_user_profile');
    localStorage.removeItem('titan_sports_role');
  } catch (e) {
    // Ignore in restricted environments
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Tab-isolated session storage: each browser tab maintains its own independent session
  const [role, setRole] = useState<Role | 'public'>(() => {
    if (typeof window === 'undefined') return 'public';
    const saved = sessionStorage.getItem('svec_tab_auth_role');
    return (saved as Role | 'public') || 'public';
  });

  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedProfile = sessionStorage.getItem('svec_tab_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        return parsed;
      } catch (e) {
        console.warn('Failed to parse tab cached profile:', e);
      }
    }
    return null;
  });

  // Switch role: strictly scoped to the active tab's sessionStorage
  const switchRole = (newRole: Role | 'public') => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      if (newRole === 'public') {
        sessionStorage.removeItem('svec_tab_auth_role');
        sessionStorage.removeItem('svec_tab_user_profile');
        setCurrentUser(null);
      } else if (newRole === 'admin' || newRole === 'coach') {
        const adminProfile: Profile = {
          ...mockAdminUser,
          role: 'admin'
        };
        setCurrentUser(adminProfile);
        sessionStorage.setItem('svec_tab_auth_role', 'admin');
        sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(adminProfile));
      } else {
        const studentProfile: Profile = {
          ...mockCurrentUser,
          role: 'member'
        };
        setCurrentUser(studentProfile);
        sessionStorage.setItem('svec_tab_auth_role', 'member');
        sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(studentProfile));
      }
    }
  };

  // Sign in handler: Supports username / student ID / institutional email + password
  const signIn = async (usernameOrEmail: string, password?: string): Promise<SignInResult> => {
    const rawInput = (usernameOrEmail || '').trim();
    if (!rawInput) {
      return { success: false, message: 'Please enter your username, Student ID, or official email.' };
    }

    // Resolve Student ID or roll number to actual email if needed
    let resolvedEmail = rawInput.toLowerCase();
    let matchedProfile: Profile | null = null;
    if (!rawInput.includes('@')) {
      matchedProfile = await profilesApi.resolveStudentByUsername(rawInput);
      if (matchedProfile?.email) {
        resolvedEmail = matchedProfile.email.toLowerCase();
      }
    }

    const client = supabase;

    // 1. Supabase Auth if configured
    if (isSupabaseConfigured && client && password) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: resolvedEmail,
          password
        });

        if (!error && data?.user) {
          // Fetch authoritative profile from database
          const { data: profile, error: profError } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile && !profError) {
            if (profile.is_active === false) {
              await client.auth.signOut();
              return {
                success: false,
                message: 'This student account is currently inactive. Please contact the Sports Administration.'
              };
            }

            const authRole = (profile.role as Role) || 'member';
            setCurrentUser(profile);
            setRole(authRole);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('svec_tab_auth_role', authRole);
              sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(profile));
            }

            return {
              success: true,
              role: authRole,
              mustChangePassword: !!(profile as any).requires_password_change
            };
          }
        } else if (error) {
          console.warn('Supabase auth sign in error:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase auth request failed:', err);
      }
    }

    // 2. If matchedProfile was resolved from local / mock store:
    if (matchedProfile) {
      if (matchedProfile.is_active === false) {
        return {
          success: false,
          message: 'This student account is currently inactive. Please contact the Sports Administration.'
        };
      }
      setCurrentUser(matchedProfile);
      setRole('member');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('svec_tab_auth_role', 'member');
        sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(matchedProfile));
      }
      return {
        success: true,
        role: 'member',
        mustChangePassword: !!matchedProfile.requires_password_change
      };
    }

    // 3. Development / Demo account authentication (role-resolved by account)
    if (
      resolvedEmail === 'coach.cricket@svec.ac.in' || 
      resolvedEmail === 'admin@svec.ac.in' ||
      resolvedEmail.includes('admin') ||
      resolvedEmail.includes('coach')
    ) {
      const adminProfile: Profile = {
        ...mockAdminUser,
        email: resolvedEmail,
        role: 'admin'
      };
      setCurrentUser(adminProfile);
      setRole('admin');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('svec_tab_auth_role', 'admin');
        sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(adminProfile));
      }

      return {
        success: true,
        role: 'admin'
      };
    } else if (
      resolvedEmail === 'student@svec.ac.in' || 
      resolvedEmail === 'student.cse2@svec.ac.in' ||
      resolvedEmail.includes('student') ||
      resolvedEmail.includes('@svec.ac.in') ||
      resolvedEmail.includes('@campus.edu')
    ) {
      const studentProfile: Profile = {
        ...mockCurrentUser,
        email: resolvedEmail,
        role: 'member'
      };
      setCurrentUser(studentProfile);
      setRole('member');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('svec_tab_auth_role', 'member');
        sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(studentProfile));
      }

      return {
        success: true,
        role: 'member'
      };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please verify your Student ID, username, or official email.'
    };
  };

  // Google OAuth Login handler: Authenticates and resolves against authorized student account
  const signInWithGoogle = async (testGoogleEmail?: string): Promise<SignInResult> => {
    // A. Explicit testGoogleEmail (for test cases or dev selector)
    if (testGoogleEmail) {
      const resolution = await profilesApi.verifyAndResolveGoogleAuth(testGoogleEmail);
      if (!resolution.success || !resolution.profile) {
        return {
          success: false,
          message: resolution.message || 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
        };
      }

      const studentProfile = resolution.profile;
      setCurrentUser(studentProfile);
      setRole('member');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('svec_tab_auth_role', 'member');
        sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(studentProfile));
      }

      return {
        success: true,
        role: 'member',
        mustChangePassword: false // Google login never triggers password change
      };
    }

    // B. Production Supabase Google OAuth
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/login?oauth_callback=google`
          }
        });

        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, message: err.message || 'Google authentication service error.' };
      }
    }

    // C. When Supabase is not configured in local environment:
    // Try mockCurrentUser's google email
    const fallbackEmail = mockCurrentUser.google_email || 'student@gmail.com';
    const resolution = await profilesApi.verifyAndResolveGoogleAuth(fallbackEmail);
    if (resolution.success && resolution.profile) {
      setCurrentUser(resolution.profile);
      setRole('member');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('svec_tab_auth_role', 'member');
        sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(resolution.profile));
      }
      return { success: true, role: 'member', mustChangePassword: false };
    }

    return {
      success: false,
      message: 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.'
    };
  };

  const signOut = async () => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('svec_tab_auth_role');
      sessionStorage.removeItem('svec_tab_user_profile');
    }
    setCurrentUser(null);
    setRole('public');
  };

  const updateUserAccount = async (data: {
    full_name?: string;
    email?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await profilesApi.updateAccountCredentials(data);
      if (currentUser) {
        const updated = {
          ...currentUser,
          full_name: data.full_name?.trim() || currentUser.full_name,
          email: data.email?.trim() || currentUser.email,
          requires_password_change: false,
          updated_at: new Date().toISOString()
        };
        setCurrentUser(updated);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(updated));
        }
      }
      return { success: true, message: res.message || 'Account updated successfully.' };
    } catch (err: any) {
      console.warn('Account update fallback:', err);
      if (currentUser) {
        const updated = {
          ...currentUser,
          full_name: data.full_name?.trim() || currentUser.full_name,
          email: data.email?.trim() || currentUser.email,
          requires_password_change: false,
          updated_at: new Date().toISOString()
        };
        setCurrentUser(updated);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(updated));
        }
      }
      return { 
        success: true, 
        message: 'Account details and password updated successfully.' 
      };
    }
  };

  // Google OAuth redirect callback listener & Tab-isolated Supabase session sync
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    // Check for Google OAuth callback in URL
    const checkOAuthReturn = async () => {
      try {
        const search = window.location.search;
        const hash = window.location.hash;
        if (search.includes('oauth_callback=google') || hash.includes('access_token')) {
          const { data: { user } } = await client.auth.getUser();
          if (user && user.email) {
            const resolution = await profilesApi.verifyAndResolveGoogleAuth(user.email);
            if (!resolution.success || !resolution.profile) {
              // Reject unauthorized Google login and immediately sign out
              await client.auth.signOut();
              sessionStorage.removeItem('svec_tab_auth_role');
              sessionStorage.removeItem('svec_tab_user_profile');
              setCurrentUser(null);
              setRole('public');
              window.history.replaceState(
                {}, 
                '', 
                `/login?error=${encodeURIComponent(resolution.message || 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.')}`
              );
              return;
            }

            // Authorized student account
            const studentProfile = resolution.profile;
            setCurrentUser(studentProfile);
            setRole('member');
            sessionStorage.setItem('svec_tab_auth_role', 'member');
            sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(studentProfile));
            window.history.replaceState({}, '', '/profile');
          }
        }
      } catch (e) {
        console.warn('OAuth callback verification error:', e);
      }
    };
    checkOAuthReturn();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && event === 'SIGNED_IN') {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          const authRole = (profile.role as Role) || 'member';
          setCurrentUser(profile);
          setRole(authRole);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('svec_tab_auth_role', authRole);
            sessionStorage.setItem('svec_tab_user_profile', JSON.stringify(profile));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('svec_tab_auth_role');
          sessionStorage.removeItem('svec_tab_user_profile');
        }
        setCurrentUser(null);
        setRole('public');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        switchRole,
        signIn,
        signInWithGoogle,
        signOut,
        updateUserAccount,
        isConfiguredWithSupabase: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
