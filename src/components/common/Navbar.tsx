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
  LayoutDashboard
} from 'lucide-react';
import { useMyNotifications } from '../../hooks/useStudentAthlete';

export const Navbar: React.FC = () => {
  const { currentUser, role, signOut } = useAuth();
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
      <nav className="bg-[#070A0F]/90 backdrop-blur-xl border border-[#1E293B]/80 rounded-2xl shadow-2xl px-3 sm:px-5 py-1.5 sm:py-2">
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
              <div className="flex items-center gap-1 font-heading font-black tracking-tight text-xs sm:text-sm text-[#F5F7FA]">
                <span>SRI VASAVI</span>
                <span className="text-[#B8FF3D]">SPORTS CLUB</span>
              </div>
              <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#8B95A7] font-mono">
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
                          : 'bg-[#121824] text-[#B8FF3D] border border-[#B8FF3D]/40'
                        : item.highlight
                          ? 'text-[#B8FF3D] hover:bg-[#B8FF3D]/10'
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

          {/* Right Action: Auth / User Profile / Notifications */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* If Member / Student Athlete Logged In */}
            {isStudent && (
              <>
                {/* Notifications Bell */}
                <Link
                  to="/profile?tab=notifications"
                  className="relative p-2 rounded-xl bg-[#0B0F17] hover:bg-[#121824] border border-[#1E293B] text-[#8B95A7] hover:text-[#F5F7FA] transition-all cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3B30] text-white text-[9px] font-mono font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Student User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-heading font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      userDropdownOpen
                        ? 'bg-[#B8FF3D] text-[#070A0F] border-[#B8FF3D]'
                        : 'bg-[#0B0F17] text-[#F5F7FA] border-[#1E293B] hover:border-[#B8FF3D] hover:text-[#B8FF3D]'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#B8FF3D]/20 border border-[#B8FF3D]/50 flex items-center justify-center text-[10px] text-[#B8FF3D] font-mono font-bold">
                      {displayName.charAt(0)}
                    </div>
                    <span>{displayName}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                      {/* Identity Card Header */}
                      <div className="p-3 rounded-xl bg-[#070A0F] border border-[#1E293B] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase text-[#B8FF3D] font-bold">STUDENT ATHLETE</span>
                          <span className="w-2 h-2 rounded-full bg-[#B8FF3D]" />
                        </div>
                        <div className="text-xs font-heading font-black text-[#F5F7FA] truncate">
                          {currentUser?.full_name || 'Student Athlete'}
                        </div>
                        <div className="text-[10px] font-mono text-[#8B95A7]">
                          {studentRollNo ? `ROLL: ${studentRollNo}` : 'ID VERIFIED'}
                        </div>
                      </div>

                      {/* Dropdown Navigation Links to Side Panel Sections */}
                      <div className="pt-1 space-y-0.5">
                        <Link
                          to="/profile?tab=id_card"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#B8FF3D]" />
                          <span>Digital Athlete ID</span>
                        </Link>

                        <Link
                          to="/profile?tab=sports"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
                          <span>My Sports Participation</span>
                        </Link>

                        <Link
                          to="/profile?tab=trials"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#B8FF3D]" />
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF] hover:text-[#070A0F] font-heading font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Coach & Admin Console</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="p-3 rounded-xl bg-[#070A0F] border border-[#1E293B] space-y-0.5">
                      <span className="text-[9px] font-mono uppercase text-[#00F0FF] font-bold">STAFF ACCESS</span>
                      <div className="text-xs font-heading font-black text-[#F5F7FA] truncate">
                        {currentUser?.full_name || 'Coach & Admin'}
                      </div>
                      <div className="text-[10px] font-mono text-[#8B95A7]">Physical Education Dept</div>
                    </div>

                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#CBD5E1] hover:text-[#F5F7FA] hover:bg-[#121824] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>Admin Dashboard</span>
                    </Link>

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

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {isStudent && unreadCount > 0 && (
              <Link
                to="/profile?tab=notifications"
                className="relative p-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-[#B8FF3D]"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF3B30] text-[8px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-[#0B0F17] border border-[#1E293B] text-[#F5F7FA]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1E293B] mt-2 pt-2 pb-3 space-y-1">
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
                        ? 'bg-[#121824] text-[#B8FF3D] border border-[#B8FF3D]/40'
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
            <div className="pt-2 border-t border-[#1E293B] space-y-1.5">
              {isAdminOrCoach ? (
                <>
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00F0FF]/20 text-[#00F0FF] font-heading font-bold text-xs uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Coach & Admin Console
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#FF3B30] hover:bg-[#FF3B30]/10"
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
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#B8FF3D]/20 text-[#B8FF3D] font-heading font-bold text-xs uppercase tracking-wider"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{currentUser?.full_name || 'My Athlete Profile'}</span>
                    </div>
                    {studentRollNo && <span className="text-[10px] font-mono text-[#8B95A7]">{studentRollNo}</span>}
                  </NavLink>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-[#FF3B30] hover:bg-[#FF3B30]/10"
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
