import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  User, 
  ArrowLeft, 
  Lock, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const LoginPage: React.FC = () => {
  const { signIn, signInWithGoogle, updateUserAccount } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'login' | 'change_password' | 'password_updated'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedRole, setResolvedRole] = useState<'admin' | 'member'>('member');

  // Check URL query parameters for OAuth error redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setErrorMessage(decodeURIComponent(err));
    }
  }, []);

  // Handle standard credentials login (Student ID / Username / Email + Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setErrorMessage('Please enter both your Student ID/Email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn(usernameOrEmail, password);
      if (result.success) {
        const destRole = (result.role === 'admin' || result.role === 'coach') ? 'admin' : 'member';
        setResolvedRole(destRole);

        if (result.mustChangePassword) {
          setStep('change_password');
          return;
        }

        if (destRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      } else {
        setErrorMessage(result.message || 'Invalid credentials. Please verify your Student ID, username, or official email.');
      }
    } catch (err: any) {
      console.warn('Login attempt error:', err);
      setErrorMessage(err.message || 'Authentication service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth login
  const handleGoogleSignIn = async (testGoogleEmail?: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signInWithGoogle(testGoogleEmail);
      if (result.success) {
        navigate('/profile');
      } else {
        setErrorMessage(result.message || 'This Google account is not linked to an authorized Sri Vasavi Sports Club student account.');
      }
    } catch (err: any) {
      console.warn('Google login error:', err);
      setErrorMessage(err.message || 'Google authentication service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle first-login mandatory password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await updateUserAccount({ password: newPassword });
      setStep('password_updated');
      setTimeout(() => {
        if (resolvedRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper for local testing convenience (fills credentials only, does NOT override role)
  const handleFillDemo = (type: 'admin' | 'student_email' | 'student_id') => {
    setErrorMessage(null);
    if (type === 'admin') {
      setUsernameOrEmail('coach.cricket@svec.ac.in');
      setPassword('Coach@SVEC2026');
    } else if (type === 'student_id') {
      setUsernameOrEmail('24A81A0501');
      setPassword('Student@SVEC2026');
    } else {
      setUsernameOrEmail('student@svec.ac.in');
      setPassword('Student@SVEC2026');
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#F5F7FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] via-[#070A0F] to-[#0A101D] opacity-90" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#B8FF3D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Public Site & Theme Toggle */}
      <div className="relative z-10 max-w-md w-full mx-auto mb-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-[#8B95A7] hover:text-[#B8FF3D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Portal</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full mx-auto bg-[#0B101D] border border-[#1E293B] rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* Header with SVEC Crest */}
        <div className="text-center space-y-2 pb-6 border-b border-[#1E293B]">
          <div className="inline-flex items-center justify-center">
            <img 
              src="/svec-logo.png" 
              alt="Sri Vasavi Sports Club Logo" 
              className="w-14 h-14 object-contain"
            />
          </div>
          <h1 className="text-xl font-heading font-black tracking-tight text-[#F5F7FA]">
            SRI VASAVI SPORTS CLUB
          </h1>
          <p className="text-xs text-[#8B95A7]">
            Sri Vasavi Engineering College • Athletic Operations & Athlete Portal
          </p>
        </div>

        {/* STEP 1: AUTHENTICATION FORM */}
        {step === 'login' && (
          <div className="pt-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FF3B30]/15 border border-[#FF3B30]/40 text-[#FF6B6B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#FF3B30]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Option 1: Standard Username / Student ID / Email + Password */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Student ID / Username / Official Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8B95A7] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#070A0F] border border-[#1E293B] rounded-xl text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D] transition-colors font-mono"
                    placeholder="e.g. 24A81A0501 or name@svec.ac.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B95A7] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#070A0F] border border-[#1E293B] rounded-xl text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-[#B8FF3D]/20 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Password'}
              </button>
            </form>

            {/* Clean Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1E293B]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#0B101D] text-[#8B95A7] font-mono uppercase text-[10px]">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Option 2: Continue with Google */}
            <button
              type="button"
              onClick={() => handleGoogleSignIn()}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#080D16] hover:bg-[#121824] border border-[#1E293B] hover:border-[#CBD5E1]/40 text-xs font-heading font-black uppercase tracking-wider text-[#F5F7FA] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Development / Testing Quick Credentials Helper */}
            <div className="mt-5 pt-4 border-t border-[#1E293B] space-y-2">
              <div className="text-[10px] font-mono uppercase text-[#64748B] text-center tracking-wider">
                Testing Quick Credentials (Multi-Tab Isolated)
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin')}
                  className="px-2 py-1.5 rounded-lg bg-[#070A0F] hover:bg-[#121824] border border-[#1E293B] text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors flex items-center justify-center gap-1 cursor-pointer truncate"
                >
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('student_id')}
                  className="px-2 py-1.5 rounded-lg bg-[#070A0F] hover:bg-[#121824] border border-[#1E293B] text-[#B8FF3D] hover:border-[#B8FF3D]/40 transition-colors flex items-center justify-center gap-1 cursor-pointer truncate"
                >
                  <User className="w-3 h-3 shrink-0" />
                  <span>Roll No ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('student_email')}
                  className="px-2 py-1.5 rounded-lg bg-[#070A0F] hover:bg-[#121824] border border-[#1E293B] text-[#B8FF3D] hover:border-[#B8FF3D]/40 transition-colors flex items-center justify-center gap-1 cursor-pointer truncate"
                >
                  <User className="w-3 h-3 shrink-0" />
                  <span>Student Email</span>
                </button>
              </div>

              {/* Google OAuth Simulation Buttons for Acceptance Tests */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('student@gmail.com')}
                  className="px-2 py-1.5 rounded-lg bg-[#070A0F] hover:bg-[#121824] border border-[#1E293B] text-emerald-400 hover:border-emerald-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Simulates clicking Continue with Google with authorized Google Email"
                >
                  <span>Google: Linked Acc</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('unauthorized.random@gmail.com')}
                  className="px-2 py-1.5 rounded-lg bg-[#070A0F] hover:bg-[#121824] border border-[#1E293B] text-rose-400 hover:border-rose-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Simulates clicking Continue with Google with unlinked Google Email"
                >
                  <span>Google: Unlinked Acc</span>
                </button>
              </div>
            </div>

            {/* Institutional notice */}
            <div className="mt-5 pt-4 border-t border-[#1E293B] space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-[#8B95A7] leading-relaxed">
                <Info className="w-4 h-4 text-[#8B95A7] shrink-0 mt-0.5" />
                <span>
                  Student accounts are officially provisioned by the Physical Education Department. Google login is authorized only for accounts explicitly registered with an approved Google Email ID.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: FIRST-TIME MANDATORY PASSWORD CHANGE */}
        {step === 'change_password' && (
          <div className="pt-6 space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold block">First-Time Login Notice</span>
                Your account was provisioned with an initial password. Please choose a new private password before entering the portal.
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-[#FF3B30]/15 border border-[#FF3B30]/40 text-[#FF6B6B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#FF3B30]" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  New Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B95A7] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 bg-[#070A0F] border border-[#1E293B] rounded-xl text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D] transition-colors"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B95A7] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 bg-[#070A0F] border border-[#1E293B] rounded-xl text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D] transition-colors"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-[#B8FF3D]/20 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Enter Portal'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: PASSWORD UPDATED CONFIRMATION */}
        {step === 'password_updated' && (
          <div className="pt-8 pb-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-heading font-black text-[#F5F7FA]">
                Password Successfully Updated
              </h2>
              <p className="text-xs text-[#8B95A7] mt-1">
                Redirecting you to the {resolvedRole === 'admin' ? 'Operations Console' : 'Student Athlete Portal'}...
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Minimal institutional footer */}
      <div className="relative z-10 text-center mt-6 text-[11px] text-[#8B95A7]">
        Sri Vasavi Sports Club • Sri Vasavi Engineering College (Autonomous), Tadepalligudem
      </div>

    </div>
  );
};
