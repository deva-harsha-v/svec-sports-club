import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Zap, 
  Trophy, 
  Calendar, 
  Newspaper, 
  Image, 
  ShieldCheck, 
  User, 
  Menu, 
  X, 
  Grid,
  LogIn,
  UserCheck,
  Bell,
  LogOut,
  ChevronDown,
  Activity,
  QrCode,
  Award,
  Key,
  Flame,
  LayoutDashboard,
  Search
} from 'lucide-react';
import { useMyNotifications } from '../../hooks/useStudentAthlete';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { currentUser, role, signOut } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Unread notifications for student
  const { unreadCount } = useMyNotifications();

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  // 1. Navigation items based on auth state
  const isStudent = role === 'member';
  const isAdminOrCoach = role === 'admin' || role === 'coach';

  interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  const publicNavItems: NavItem[] = [
    { to: '/sports', label: 'Sports', icon: Grid },
    { to: '/trials', label: 'Trials', icon: UserCheck },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/leaderboard', label: 'Leaderboard', icon: Zap },
    { to: '/news', label: 'News', icon: Newspaper },
    { to: '/gallery', label: 'Gallery', icon: Image },
  ];

  const studentNavItems: NavItem[] = [
    { to: '/profile', label: 'Athlete Passport', icon: ShieldCheck, highlight: true },
    { to: '/trials', label: 'Trials', icon: UserCheck },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/sports', label: 'Sports', icon: Grid },
    { to: '/leaderboard', label: 'Leaderboard', icon: Zap },
    { to: '/events', label: 'Events', icon: Calendar },
  ];

  const staffNavItems: NavItem[] = [
    { to: '/admin', label: 'Admin Console', icon: LayoutDashboard, highlight: true },
    { to: '/trials', label: 'Trials', icon: UserCheck },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/sports', label: 'Sports', icon: Grid },
    { to: '/events', label: 'Events', icon: Calendar },
  ];

  const activeNavItems = isStudent 
    ? studentNavItems 
    : isAdminOrCoach 
    ? staffNavItems 
    : publicNavItems;

  const displayName = currentUser?.full_name?.split(' ')[0] || (isStudent ? 'Athlete' : 'Staff');
  const studentRollNo = currentUser?.student_id || currentUser?.normalized_roll_no;

  return (
    <header className="sticky top-2 sm:top-3 z-50 px-3 sm:px-6 max-w-7xl mx-auto w-full transition-all duration-200">
      <nav className={`backdrop-blur-xl rounded-2xl shadow-2xl px-3 sm:px-5 py-1.5 sm:py-2 transition-colors duration-200 ${
        isLight
          ? 'bg-white/95 border border-[#E2E8F0] shadow-slate-200/50'
          : 'bg-[#070A0F]/90 border border-[#1E293B]/80'
      }`}>
        <div className="flex items-center justify-between h-12">
          
          {/* Brand Logo -> Link to / */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <img 
              src="/svec-logo.png" 
              alt="Sri Vasavi Sports Club Logo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div className="leading-tight">
              <div className={`flex items-center gap-1 font-heading font-black tracking-tight text-xs sm:text-sm ${
                isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
              }`}>
                <span>SRI VASAVI</span>
                <span className={isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'}>SPORTS CLUB</span>
              </div>
              <div className={`text-[8px] sm:text-[9px] uppercase tracking-widest font-mono ${
                isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
              }`}>
                SVEC ATHLETICS
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? item.highlight 
                          ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/20'
                          : isLight
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                            : 'bg-[#121824] text-[#B8FF3D] border border-[#B8FF3D]/40'
                        : item.highlight
                          ? isLight
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-[#B8FF3D] hover:bg-[#B8FF3D]/10'
                          : isLight
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#0B0F17]'
                    }`
                  }
                >
                  <Icon className="w-3 h-3" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Right Action: Auth / User Profile / Notifications / Theme */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* If Member / Student Athlete Logged In */}
            {isStudent && (
              <>
                {/* Search Quick Action */}
                <Link
                  to="/sports"
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-[#E2E8F0] text-slate-600 hover:text-slate-900'
                      : 'bg-[#0B0F17] hover:bg-[#121824] border-[#1E293B] text-[#8B95A7] hover:text-[#F5F7FA]'
                  }`}
                  title="Search Sports & Trials"
                >
                  <Search className="w-4 h-4" />
                </Link>

                {/* Notifications Bell */}
                <Link
                  to="/profile?tab=notifications"
                  className={`relative p-2 rounded-full border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-[#E2E8F0] text-slate-600 hover:text-slate-900'
                      : 'bg-[#0B0F17] hover:bg-[#121824] border-[#1E293B] text-[#8B95A7] hover:text-[#F5F7FA]'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3B30] text-white text-[9px] font-mono font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Theme Toggle switch */}
                <ThemeToggle />

                {/* Student User Dropdown Capsule */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                      userDropdownOpen
                        ? 'bg-[#B8FF3D] text-[#070A0F] border-[#B8FF3D]'
                        : isLight
                          ? 'bg-slate-50 text-slate-900 border-[#E2E8F0] hover:border-[#15803D]'
                          : 'bg-[#0B0F17] text-[#F5F7FA] border-[#1E293B] hover:border-[#B8FF3D]/60'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-[10px] text-[#B8FF3D] font-mono font-bold">
                      {displayName.charAt(0)}
                    </div>
                    <span>{displayName}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 text-[#8B95A7] ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50 ${
                      isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#0B101D] border-[#1E293B]'
                    }`}>
                      {/* Identity Card Header */}
                      <div className={`p-3 rounded-xl border space-y-1 ${
                        isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#070A0F] border-[#1E293B]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono uppercase font-bold ${
                            isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
                          }`}>STUDENT ATHLETE</span>
                          <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-[#15803D]' : 'bg-[#B8FF3D]'}`} />
                        </div>
                        <div className={`text-xs font-heading font-black truncate ${
                          isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
                        }`}>
                          {currentUser?.full_name || 'Student Athlete'}
                        </div>
                        <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
                          {studentRollNo ? `ROLL: ${studentRollNo}` : 'ID VERIFIED'}
                        </div>
                      </div>

                      {/* Dropdown Navigation Links to Side Panel Sections */}
                      <div className="pt-1 space-y-0.5">
                        <Link
                          to="/profile?tab=id_card"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                            isLight
                              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                              : 'text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824]'
                          }`}
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'}`} />
                          <span>Digital Athlete ID</span>
                        </Link>

                        <Link
                          to="/profile?tab=sports"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                            isLight
                              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                              : 'text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824]'
                          }`}
                        >
                          <Activity className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`} />
                          <span>My Sports Participation</span>
                        </Link>

                        <Link
                          to="/profile?tab=trials"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                            isLight
                              ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                              : 'text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824]'
                          }`}
                        >
                          <QrCode className={`w-3.5 h-3.5 ${isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'}`} />
                          <span>Selection Trial Passes</span>
                        </Link>

                        <Link
                          to="/profile?tab=tournaments"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tournaments</span>
                        </Link>

                        <Link
                          to="/profile?tab=results"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                        >
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                          <span>My Results</span>
                        </Link>

                        <Link
                          to="/profile?tab=certificates"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                        >
                          <Award className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Certificates</span>
                        </Link>

                        <Link
                          to="/profile?tab=security"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                        >
                          <Key className="w-3.5 h-3.5 text-[#8B95A7]" />
                          <span>Account & Password</span>
                        </Link>
                      </div>

                      {/* Sign Out Divider */}
                      <div className="pt-1 border-t border-[#1E293B]">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* If Admin / Coach Logged In */}
            {isAdminOrCoach && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-heading font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    isLight
                      ? 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
                      : 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/30 hover:bg-[#00F0FF] hover:text-[#070A0F]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Coach & Admin Console</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50 ${
                    isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#0B101D] border-[#1E293B]'
                  }`}>
                    <div className={`p-3 rounded-xl border space-y-0.5 ${
                      isLight ? 'bg-slate-50 border-[#E2E8F0]' : 'bg-[#070A0F] border-[#1E293B]'
                    }`}>
                      <span className={`text-[9px] font-mono uppercase font-bold ${
                        isLight ? 'text-sky-700' : 'text-[#00F0FF]'
                      }`}>STAFF ACCESS</span>
                      <div className={`text-xs font-heading font-black truncate ${
                        isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
                      }`}>
                        {currentUser?.full_name || 'Coach & Admin'}
                      </div>
                      <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>Physical Education Dept</div>
                    </div>

                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                        isLight
                          ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824]'
                      }`}
                    >
                      <LayoutDashboard className={`w-3.5 h-3.5 ${isLight ? 'text-sky-700' : 'text-[#00F0FF]'}`} />
                      <span>Admin Dashboard</span>
                    </Link>

                    <div className={`pt-1 border-t ${isLight ? 'border-[#E2E8F0]' : 'border-[#1E293B]'}`}>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#DC2626] hover:bg-red-50 dark:hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* If Public Visitor / Not Logged In */}
            {!currentUser && role === 'public' && (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-[11px] uppercase tracking-wider hover:lime-glow transition-all cursor-pointer shadow-md shadow-[#B8FF3D]/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

          </div>

          {/* Mobile Actions & Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle className="p-1.5" />
            
            {isStudent && unreadCount > 0 && (
              <Link
                to="/profile?tab=notifications"
                className={`relative p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-slate-50 border-[#E2E8F0] text-[#15803D]'
                    : 'bg-[#0B0F17] border-[#1E293B] text-[#B8FF3D]'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#DC2626] text-[8px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 rounded-lg border ${
                isLight
                  ? 'bg-slate-50 border-[#E2E8F0] text-slate-800'
                  : 'bg-[#0B0F17] border-[#1E293B] text-[#F5F7FA]'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t mt-2 pt-2 pb-3 space-y-1 ${
            isLight ? 'border-[#E2E8F0]' : 'border-[#1E293B]'
          }`}>
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? isLight
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                          : 'bg-[#121824] text-[#B8FF3D] border border-[#B8FF3D]/40'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-[#8B95A7] hover:text-[#F5F7FA]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}

            {/* Mobile Auth / Profile Controls */}
            <div className={`pt-2 border-t space-y-1.5 ${isLight ? 'border-[#E2E8F0]' : 'border-[#1E293B]'}`}>
              {isAdminOrCoach ? (
                <>
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-heading font-bold text-xs uppercase tracking-wider ${
                      isLight
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-[#00F0FF]/20 text-[#00F0FF]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Coach & Admin Console
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#DC2626] hover:bg-red-50 dark:hover:bg-[#FF3B30]/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </>
              ) : isStudent ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-heading font-bold text-xs uppercase tracking-wider ${
                      isLight
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-[#B8FF3D]/20 text-[#B8FF3D]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{currentUser?.full_name || 'My Athlete Profile'}</span>
                    </div>
                    {studentRollNo && <span className={`text-[10px] font-mono ${isLight ? 'text-slate-600' : 'text-[#8B95A7]'}`}>{studentRollNo}</span>}
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#DC2626] hover:bg-red-50 dark:hover:bg-[#FF3B30]/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block py-2 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase tracking-wider text-center"
                >
                  Sign In / Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
