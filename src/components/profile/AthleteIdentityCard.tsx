import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { downloadCertificatePdf } from '../../lib/certificateGenerator';
import { 
  Award, 
  Trophy, 
  Calendar, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  Lock, 
  User, 
  Mail, 
  AlertCircle, 
  X, 
  Bell, 
  Clock, 
  RefreshCw, 
  Users, 
  MapPin, 
  Check, 
  ChevronRight, 
  Flame, 
  FileCheck, 
  Menu, 
  FileText,
  Sparkles,
  ArrowRight,
  Layers,
  LogOut,
  Ticket,
  TrendingUp,
  BarChart2,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  useMyProfile, 
  useMySports, 
  useMySelectionTrials, 
  useMyTournamentRegistrations, 
  useMyCertificates, 
  useMyResults, 
  useMyStatistics, 
  useMyNotifications 
} from '../../hooks/useStudentAthlete';
import { selectionTrialsApi, eventsApi } from '../../lib/api';
import { SelectionTrial, ClubEvent } from '../../lib/types';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { CampusCupLeaderboard } from '../leaderboards/CampusCupLeaderboard';

export const AthleteIdentityCard: React.FC = () => {
  const { updateUserAccount, signOut } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [searchParams, setSearchParams] = useSearchParams();

  const validTabs = [
    'dashboard',
    'id_card', 
    'sports', 
    'applications',
    'results', 
    'trials_browse',
    'trials', 
    'tournaments', 
    'events',
    'certificates', 
    'leaderboard',
    'notifications', 
    'security'
  ] as const;
  type TabType = typeof validTabs[number];

  const queryTab = searchParams.get('tab') as TabType;
  const initialTab: TabType = validTabs.includes(queryTab)
    ? (queryTab === 'id_card' ? 'dashboard' : queryTab)
    : 'dashboard';

  const [activeTab, setActiveTabState] = useState<TabType>(initialTab);
  const [mobileSidePanelOpen, setMobileSidePanelOpen] = useState(false);

  // Sync tab state with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTabState(tabParam === 'id_card' ? 'dashboard' : tabParam);
    }
  }, [searchParams]);

  const setActiveTab = (tab: TabType) => {
    const targetTab = tab === 'id_card' ? 'dashboard' : tab;
    setActiveTabState(targetTab);
    setSearchParams({ tab: targetTab });
  };

  // React Query Data Layer (All real database data)
  const { data: profile, isLoading: loadingProfile, isError: errorProfile, refetch: refetchProfile } = useMyProfile();
  const { data: sports = [], isLoading: loadingSports, isError: errorSports, refetch: refetchSports } = useMySports();
  const { data: trialPasses = [], isLoading: loadingTrials, isError: errorTrials, refetch: refetchTrials } = useMySelectionTrials();
  const { data: tournamentRegs = [], isLoading: loadingTourns, isError: errorTourns, refetch: refetchTourns } = useMyTournamentRegistrations();
  const { data: certificates = [], isLoading: loadingCerts, isError: errorCerts, refetch: refetchCerts } = useMyCertificates();
  const { data: results = [], isLoading: loadingResults, isError: errorResults, refetch: refetchResults } = useMyResults();
  const { data: stats, isLoading: loadingStats, isError: errorStats, refetch: refetchStats } = useMyStatistics();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    isLoading: loadingNotifs, 
    isError: errorNotifs, 
    refetch: refetchNotifs 
  } = useMyNotifications();

  // Additional state for open trials & events browsing
  const [openTrials, setOpenTrials] = useState<SelectionTrial[]>([]);
  const [loadingOpenTrials, setLoadingOpenTrials] = useState(false);
  const [campusEvents, setCampusEvents] = useState<ClubEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (activeTab === 'trials_browse') {
      setLoadingOpenTrials(true);
      selectionTrialsApi.getPublicTrials()
        .then((data: SelectionTrial[]) => setOpenTrials(data))
        .catch((err: any) => console.warn('Could not load trials:', err))
        .finally(() => setLoadingOpenTrials(false));
    }
    if (activeTab === 'events') {
      setLoadingEvents(true);
      eventsApi.getAll()
        .then(data => setCampusEvents(data))
        .catch(err => console.warn('Could not load events:', err))
        .finally(() => setLoadingEvents(false));
    }
  }, [activeTab]);

  // Account editing form state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize account fields when profile loads
  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '');
      setProfileEmail(profile.email || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setFeedback({ type: 'error', message: 'Name cannot be empty.' });
      return;
    }
    setSavingProfile(true);
    setFeedback(null);
    try {
      const res = await updateUserAccount({
        full_name: profileName.trim(),
        email: profileEmail.trim()
      });
      setFeedback({ type: 'success', message: res.message || 'Profile updated successfully.' });
      refetchProfile();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match. Please re-enter.' });
      return;
    }
    setSavingPassword(true);
    setFeedback(null);
    try {
      const res = await updateUserAccount({
        password: newPassword
      });
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: 'Password updated successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Safe Roll Number & Academic resolution
  const rollNumber = profile?.student_id || profile?.normalized_roll_no || 'Unassigned';
  const academicProgram = profile?.program || 'B.Tech';
  const academicBranch = profile?.department || 'Department Unassigned';
  const formatAcademicYear = (yr?: string | number) => {
    if (!yr) return '2nd';
    const s = String(yr).trim();
    if (s === '1') return '1st';
    if (s === '2') return '2nd';
    if (s === '3') return '3rd';
    if (s === '4') return '4th';
    return s.replace(/year/i, '').trim();
  };
  const academicYear = formatAcademicYear(profile?.year);

  // Navigation Panel Structure
  interface NavItem {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badge?: number;
  }
  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'sports', label: 'My Sports', icon: Activity, count: sports.length },
        { id: 'applications', label: 'My Applications', icon: FileCheck, count: trialPasses.length + tournamentRegs.length },
        { id: 'results', label: 'My Results', icon: Award, count: results.length },
        { id: 'certificates', label: 'Certificates', icon: Trophy, count: certificates.length },
      ]
    },
    {
      title: 'PARTICIPATION',
      items: [
        { id: 'trials_browse', label: 'Selection Trials', icon: Clock },
        { id: 'trials', label: 'Trial Passes', icon: Ticket, count: trialPasses.length },
        { id: 'tournaments', label: 'Tournaments', icon: Trophy, count: tournamentRegs.length },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'leaderboard', label: 'Rankings', icon: TrendingUp },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: 'security', label: 'Account & Security', icon: Settings },
      ]
    }
  ];

  const currentTabLabel = navSections
    .flatMap(s => s.items)
    .find(i => i.id === (activeTab === 'id_card' ? 'dashboard' : activeTab))?.label || 'Dashboard';

  // 1. Single most relevant upcoming activity
  const nextUpActivity = React.useMemo(() => {
    const activeTrial = (trialPasses || []).find(p => p.status !== 'withdrawn');
    if (activeTrial) {
      let timeStr = 'Time TBA';
      let dateStr = 'Date TBA';
      if (activeTrial.start_time) {
        try {
          const d = new Date(activeTrial.start_time);
          dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {}
      } else if (activeTrial.registered_at) {
        try {
          const d = new Date(activeTrial.registered_at);
          dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {}
      }
      return {
        title: activeTrial.trial_title || activeTrial.sport_name || 'Selection Trial',
        subtitle: 'Official Selection Trial',
        schedule: `${dateStr} · ${timeStr}`,
        venue: activeTrial.venue_name || 'Sports Ground',
        status: activeTrial.status === 'checked_in' ? 'Checked In' : 'Registered',
        isTrial: true,
        tab: 'trials' as TabType
      };
    }

    const activeTourn = (tournamentRegs || []).find(r => r.status !== 'rejected' && r.status !== 'withdrawn');
    if (activeTourn) {
      return {
        title: activeTourn.tournament_title || 'Tournament Entry',
        subtitle: activeTourn.sport_name ? `${activeTourn.sport_name} Tournament` : 'College Tournament',
        schedule: 'Upcoming Tournament',
        venue: 'Campus Grounds',
        status: activeTourn.status ? activeTourn.status.charAt(0).toUpperCase() + activeTourn.status.slice(1) : 'Active',
        isTrial: false,
        tab: 'tournaments' as TabType
      };
    }

    return null;
  }, [trialPasses, tournamentRegs]);

  // 2. Latest 1-2 applications
  const latestApplications = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      type: string;
      date: string;
      status: string;
      statusClass: string;
    }> = [];

    (trialPasses || []).forEach(p => {
      const dt = p.registered_at || p.created_at;
      let dateFormatted = 'Recent';
      if (dt) {
        try {
          dateFormatted = new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        } catch {}
      }
      const isSelected = p.evaluation_status === 'selected';
      const isStandby = p.evaluation_status === 'standby';
      const displayStatus = isSelected ? 'Selected' : isStandby ? 'Standby' : p.status === 'checked_in' ? 'Checked In' : 'Registered';

      list.push({
        id: `trial_${p.id}`,
        title: p.trial_title || p.sport_name || 'Selection Trial',
        type: 'Selection Trial',
        date: dateFormatted,
        status: displayStatus,
        statusClass: isSelected
          ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
          : 'text-[#B8FF3D] bg-[#B8FF3D]/10 border-[#B8FF3D]/30'
      });
    });

    (tournamentRegs || []).forEach(r => {
      let dateFormatted = 'Recent';
      if (r.created_at) {
        try {
          dateFormatted = new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        } catch {}
      }
      list.push({
        id: `tourn_${r.id}`,
        title: r.tournament_title || 'Tournament Registration',
        type: 'Tournament',
        date: dateFormatted,
        status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Registered',
        statusClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
      });
    });

    return list.slice(0, 2);
  }, [trialPasses, tournamentRegs]);

  // 3. Latest 1-2 results
  const latestResults = React.useMemo(() => {
    return (results || []).slice(0, 2);
  }, [results]);

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* Mobile Drawer Bar for small screens */}
      <div className="lg:hidden p-3.5 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex items-center justify-between shadow-lg">
        <div>
          <div className="text-[10px] font-mono text-[#8B95A7] uppercase font-semibold">ACTIVE SECTION</div>
          <div className="text-xs font-heading font-black text-[#F5F7FA] uppercase">
            {currentTabLabel}
          </div>
        </div>

        <button
          onClick={() => setMobileSidePanelOpen(!mobileSidePanelOpen)}
          className="px-3.5 py-1.5 rounded-xl bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#B8FF3D] font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>{mobileSidePanelOpen ? 'Close Menu' : 'Contents'}</span>
        </button>
      </div>

      {/* 3-PART DESKTOP COMPOSITION */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: DEDICATED STUDENT NAVIGATION SIDEBAR         */}
        {/* ========================================================= */}
        <aside className={`w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-20 space-y-3.5 ${
          mobileSidePanelOpen ? 'block' : 'hidden lg:block'
        }`}>
          
          {/* Sidebar Header Card */}
          <div className="p-4 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex items-center gap-3 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[#00F0FF] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-heading font-black text-[#F5F7FA] uppercase tracking-wider">
                STUDENT PORTAL
              </div>
              <div className="text-[11px] text-[#8B95A7] truncate">
                Sri Vasavi Engineering College
              </div>
            </div>
          </div>

          {/* Grouped Contents Navigation Panel */}
          <nav className="p-3 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4 transition-colors">
            {navSections.map((section, sIdx) => (
              <div key={section.title || `sec_${sIdx}`} className="space-y-1">
                {section.title && (
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#64748B] font-bold">
                    {section.title}
                  </div>
                )}
                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidePanelOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#B8FF3D] text-[#070A0F] shadow-md shadow-[#B8FF3D]/15'
                          : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#070A0F]' : 'text-[#8B95A7]'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#FF3B30] text-white text-[10px] font-bold font-mono">
                          {item.badge}
                        </span>
                      ) : item.count !== undefined ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-[#070A0F]/15 text-[#070A0F]' : 'bg-[#121824] text-[#8B95A7]'
                        }`}>
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sign Out Action */}
          <div>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-3 rounded-xl bg-[#0B101D] hover:bg-rose-500/10 border border-[#1E293B] hover:border-rose-500/40 text-xs font-mono font-bold text-[#8B95A7] hover:text-rose-400 flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: MAIN CONTENT VIEWPORT                       */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-6">

          {/* Section Breadcrumb & Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div className="space-y-1">
              <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#B8FF3D]">
                SRI VASAVI ENGINEERING COLLEGE &nbsp;/&nbsp; STUDENT PORTAL
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
                STUDENT DASHBOARD
              </h1>
              <p className="text-xs text-[#8B95A7]">
                Your academic sports participation, upcoming activities, and achievements.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('trials_browse')}
                className="px-3.5 py-2 rounded-xl bg-[#0B101D] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] hover:text-[#B8FF3D] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Browse Trials</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00F0FF]" />
              </button>
              
              <button
                onClick={() => setActiveTab('tournaments')}
                className="px-3.5 py-2 rounded-xl bg-[#0B101D] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] hover:text-[#B8FF3D] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Tournaments</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00F0FF]" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: STUDENT DASHBOARD (CLEAN & MOBILE-FIRST)           */}
          {/* ========================================================= */}
          {(activeTab === 'dashboard' || activeTab === 'id_card') && (
            <div className="space-y-5">
              {loadingProfile ? (
                <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0B101D] border-[#1E293B]'
                }`}>
                  <div className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
                    Loading Student Profile...
                  </div>
                </div>
              ) : errorProfile ? (
                <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                  isLight ? 'bg-white border-rose-300 shadow-sm' : 'bg-[#0B101D] border-rose-500/30'
                }`}>
                  <div className={`text-sm font-heading font-bold ${isLight ? 'text-slate-900' : 'text-[#F5F7FA]'}`}>
                    Unable to load profile
                  </div>
                  <button onClick={() => refetchProfile()} className="text-xs font-mono text-[#B8FF3D] underline cursor-pointer">
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Column (Desktop: 7 cols, Mobile: full width) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* 1. STUDENT PROFILE */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0B101D] border-[#1E293B]'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name}
                              className="w-12 h-12 rounded-full object-cover border border-[#1E293B] shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[#B8FF3D] font-heading font-black text-lg flex items-center justify-center shrink-0">
                              {profile?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h2 className={`text-base sm:text-lg font-heading font-bold truncate ${
                              isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                            }`}>
                              {profile?.full_name || 'Student'}
                            </h2>
                            <div className={`text-xs font-mono font-medium truncate ${
                              isLight ? 'text-slate-700' : 'text-[#8B95A7]'
                            }`}>
                              <span className={isLight ? 'text-emerald-700 font-bold' : 'text-[#B8FF3D] font-bold'}>
                                {rollNumber}
                              </span>
                              <span className="mx-1.5 opacity-40">·</span>
                              <span>{academicBranch}</span>
                              <span className="mx-1.5 opacity-40">·</span>
                              <span>{academicYear}</span>
                            </div>
                            <div className={`text-[11px] font-mono truncate mt-0.5 ${
                              isLight ? 'text-slate-500' : 'text-[#64748B]'
                            }`}>
                              {profile?.email || 'student@svec.ac.in'}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 border ${
                          isLight 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          Active
                        </span>
                      </div>
                    </div>

                    {/* 2. MY SPORTS */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-colors space-y-3 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0B101D] border-[#1E293B]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-[#B8FF3D]'}`} />
                          <h3 className={`text-xs font-mono uppercase tracking-wider font-bold ${
                            isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                          }`}>
                            MY SPORTS
                          </h3>
                        </div>
                        {sports.length > 0 && (
                          <button
                            onClick={() => setActiveTab('sports')}
                            className={`text-xs font-mono cursor-pointer ${
                              isLight ? 'text-emerald-700 hover:underline' : 'text-[#00F0FF] hover:underline'
                            }`}
                          >
                            View All
                          </button>
                        )}
                      </div>

                      {sports.length === 0 ? (
                        <div className={`p-4 rounded-xl border text-center space-y-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                        }`}>
                          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#8B95A7]'}`}>
                            No sports registered yet.
                          </p>
                          <Link
                            to="/sports"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            <span>Explore Sports</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {sports.slice(0, 3).map((s) => (
                            <div
                              key={s.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className={`text-xs font-heading font-bold truncate ${
                                  isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                                }`}>
                                  {s.sport_name}
                                </div>
                                <div className={`text-[11px] font-mono ${
                                  isLight ? 'text-slate-500' : 'text-[#8B95A7]'
                                }`}>
                                  {s.role_designation || (s.is_captain ? 'Captain' : 'Active Varsity Player')}
                                  {s.team_name ? ` · ${s.team_name}` : ''}
                                </div>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                                s.is_captain
                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                  : isLight
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-[#B8FF3D]/10 text-[#B8FF3D] border border-[#B8FF3D]/30'
                              }`}>
                                {s.is_captain ? 'Captain' : 'Active'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. NEXT UP */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-colors space-y-3 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0B101D] border-[#1E293B]'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-[#00F0FF]'}`} />
                        <h3 className={`text-xs font-mono uppercase tracking-wider font-bold ${
                          isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                        }`}>
                          NEXT UP
                        </h3>
                      </div>

                      {!nextUpActivity ? (
                        <div className={`p-4 rounded-xl border text-center ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                        }`}>
                          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#8B95A7]'}`}>
                            No upcoming sports activities.
                          </p>
                        </div>
                      ) : (
                        <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className={`text-xs font-heading font-bold truncate ${
                                isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                              }`}>
                                {nextUpActivity.title}
                              </div>
                              <div className={`text-[11px] font-mono mt-0.5 ${
                                isLight ? 'text-slate-600' : 'text-[#8B95A7]'
                              }`}>
                                {nextUpActivity.schedule}
                              </div>
                            </div>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 border ${
                              isLight 
                                ? 'bg-sky-50 border-sky-200 text-sky-800' 
                                : 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                            }`}>
                              {nextUpActivity.status}
                            </span>
                          </div>

                          <div className="pt-1">
                            <button
                              onClick={() => setActiveTab(nextUpActivity.tab)}
                              className={`text-xs font-mono font-bold flex items-center gap-1 cursor-pointer ${
                                isLight ? 'text-emerald-700 hover:underline' : 'text-[#B8FF3D] hover:underline'
                              }`}
                            >
                              <span>{nextUpActivity.isTrial ? 'View Trial' : 'View Tournament'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column (Desktop: 5 cols, Mobile: full width) */}
                  <div className="lg:col-span-5 space-y-4">

                    {/* 4. MY APPLICATIONS */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-colors space-y-3 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0B101D] border-[#1E293B]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          <h3 className={`text-xs font-mono uppercase tracking-wider font-bold ${
                            isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                          }`}>
                            MY APPLICATIONS
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('applications')}
                          className={`text-xs font-mono cursor-pointer ${
                            isLight ? 'text-emerald-700 hover:underline' : 'text-[#00F0FF] hover:underline'
                          }`}
                        >
                          View All
                        </button>
                      </div>

                      {latestApplications.length === 0 ? (
                        <div className={`p-4 rounded-xl border text-center space-y-2 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                        }`}>
                          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#8B95A7]'}`}>
                            No applications submitted yet.
                          </p>
                          <button
                            onClick={() => setActiveTab('trials_browse')}
                            className={`text-xs font-mono underline cursor-pointer ${
                              isLight ? 'text-emerald-700' : 'text-[#B8FF3D]'
                            }`}
                          >
                            Browse Open Trials
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {latestApplications.map(app => (
                            <div
                              key={app.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className={`text-xs font-heading font-bold truncate ${
                                  isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                                }`}>
                                  {app.title}
                                </div>
                                <div className={`text-[11px] font-mono ${
                                  isLight ? 'text-slate-500' : 'text-[#8B95A7]'
                                }`}>
                                  {app.type} · {app.date}
                                </div>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 border ${app.statusClass}`}>
                                {app.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 5. RESULTS */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-colors space-y-3 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0B101D] border-[#1E293B]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                          <h3 className={`text-xs font-mono uppercase tracking-wider font-bold ${
                            isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                          }`}>
                            RESULTS
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('results')}
                          className={`text-xs font-mono cursor-pointer ${
                            isLight ? 'text-emerald-700 hover:underline' : 'text-[#00F0FF] hover:underline'
                          }`}
                        >
                          View Results
                        </button>
                      </div>

                      {results.length === 0 ? (
                        <div className={`p-4 rounded-xl border text-center ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                        }`}>
                          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#8B95A7]'}`}>
                            No results published yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {results.slice(0, 2).map((res) => (
                            <div
                              key={res.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080D16] border-[#1E293B]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className={`text-xs font-heading font-bold truncate ${
                                  isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                                }`}>
                                  {res.sport_name}
                                </div>
                                <div className={`text-[11px] font-mono ${
                                  isLight ? 'text-slate-500' : 'text-[#8B95A7]'
                                }`}>
                                  {res.details || res.title}
                                </div>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 border ${
                                res.outcome === 'selected' || res.outcome === 'won'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-[#121824] border-[#1E293B] text-[#8B95A7]'
                              }`}>
                                {res.badge_label || (res.outcome ? res.outcome.charAt(0).toUpperCase() + res.outcome.slice(1) : 'Published')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 6. CERTIFICATES */}
                    <div className={`p-4 sm:p-5 rounded-2xl border transition-colors flex items-center justify-between gap-3 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0B101D] border-[#1E293B]'
                    }`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-heading font-bold truncate ${
                            isLight ? 'text-slate-900' : 'text-[#F5F7FA]'
                          }`}>
                            Certificates
                          </div>
                          <div className={`text-[11px] font-mono ${
                            isLight ? 'text-slate-500' : 'text-[#8B95A7]'
                          }`}>
                            {certificates.length > 0 ? `${certificates.length} available` : 'No certificates yet'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('certificates')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                            : 'bg-[#121824] hover:bg-[#1E293B] border-[#1E293B] text-[#F5F7FA]'
                        }`}
                      >
                        View
                      </button>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MY SPORTS (DESKTOP MULTI-COLUMN GRID)              */}
          {/* ========================================================= */}
          {activeTab === 'sports' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Verified Sports Participation
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Varsity squad memberships and approved tournament rosters.
                  </p>
                </div>
                <button
                  onClick={() => refetchSports()}
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-[#8B95A7] hover:text-[#F5F7FA] text-xs font-mono self-start sm:self-auto cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {loadingSports ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading sports records...
                </div>
              ) : sports.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-3">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">
                    No active sports participation
                  </div>
                  <p className="text-xs text-[#8B95A7] max-w-md mx-auto">
                    You have no active team memberships or varsity selections on file. Register for open selection trials to try out for official college squads.
                  </p>
                  <button
                    onClick={() => setActiveTab('trials_browse')}
                    className="px-4 py-2 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    View Selection Trials
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sports.map(s => (
                    <div
                      key={s.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3 shadow-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#121824] text-[#B8FF3D] text-[10px] font-mono uppercase font-bold border border-[#1E293B]">
                          {s.status}
                        </span>
                        <span className="text-[11px] font-mono text-[#8B95A7]">
                          {s.sport_category || 'Varsity Sport'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-heading font-black text-[#F5F7FA] uppercase">
                          {s.sport_name}
                        </h3>
                        <p className="text-xs font-mono text-[#00F0FF] mt-0.5">
                          {s.role_designation || 'Varsity Player'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E293B] text-xs font-mono">
                        {s.team_name && (
                          <div>
                            <span className="text-[10px] text-[#8B95A7] uppercase block">Squad:</span>
                            <span className="text-[#F5F7FA] font-bold">{s.team_name}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] text-[#8B95A7] uppercase block">Clearance:</span>
                          <span className="text-[#CBD5E1]">SVEC Sports Dept</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: MY APPLICATIONS (DESKTOP 2-COLUMN BALANCED)        */}
          {/* ========================================================= */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                  My Applications & Entries
                </h2>
                <p className="text-xs text-[#8B95A7]">
                  All trial registrations, tournament entries, and real-time review status.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                
                {/* Selection Trials Applications */}
                <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-4 transition-colors">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <h3 className="text-sm font-heading font-black text-[#F5F7FA] uppercase tracking-wide">
                      Selection Trial Applications ({trialPasses.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('trials_browse')}
                      className="text-xs font-mono text-[#B8FF3D] hover:underline"
                    >
                      + Browse Trials
                    </button>
                  </div>

                  {trialPasses.length === 0 ? (
                    <div className="p-5 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs font-mono text-[#64748B] text-center">
                      No selection trial applications submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trialPasses.map(pass => (
                        <div
                          key={pass.id}
                          className="p-3.5 rounded-xl bg-[#080D16] border border-[#1E293B] flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-heading font-bold text-[#F5F7FA]">
                              {pass.trial_title || 'Varsity Selection Trial'}
                            </div>
                            <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                              {pass.sport_name || 'Athletics'} • {pass.session_title || 'General Session'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#121824] text-[10px] font-mono text-[#B8FF3D] font-bold">
                              {pass.status === 'checked_in' ? 'Checked In' : 'Registered'}
                            </span>
                            <button
                              onClick={() => setActiveTab('trials')}
                              className="px-2.5 py-1 rounded bg-[#121824] hover:bg-[#1E293B] text-[11px] font-mono text-[#CBD5E1]"
                            >
                              Pass
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tournament Entries */}
                <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-4 transition-colors">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <h3 className="text-sm font-heading font-black text-[#F5F7FA] uppercase tracking-wide">
                      Tournament Entries ({tournamentRegs.length})
                    </h3>
                    <Link
                      to="/tournaments"
                      className="text-xs font-mono text-[#B8FF3D] hover:underline"
                    >
                      + Tournaments
                    </Link>
                  </div>

                  {tournamentRegs.length === 0 ? (
                    <div className="p-5 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs font-mono text-[#64748B] text-center">
                      No tournament registrations submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tournamentRegs.map(reg => (
                        <div
                          key={reg.id}
                          className="p-3.5 rounded-xl bg-[#080D16] border border-[#1E293B] flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-sm font-heading font-bold text-[#F5F7FA]">
                              {reg.tournament_title}
                            </div>
                            <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                              {reg.sport_name} • {reg.registration_type} {reg.team_name && `(${reg.team_name})`}
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded bg-[#121824] text-[10px] font-mono text-[#00F0FF] font-bold">
                            {reg.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: MY RESULTS (DESKTOP 2-COLUMN GRID)                 */}
          {/* ========================================================= */}
          {activeTab === 'results' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                  My Results & Achievements
                </h2>
                <p className="text-xs text-[#8B95A7]">
                  Published selection trial decisions and official tournament match outcomes.
                </p>
              </div>

              {loadingResults ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading published results...
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-2">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">
                    No published results available yet
                  </div>
                  <p className="text-xs text-[#8B95A7]">
                    Official outcomes appear here once trial evaluations or tournament match results are published by the Athletics Department.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {results.map(r => (
                    <div
                      key={r.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex flex-col justify-between gap-3 shadow-lg transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#121824] text-[#8B95A7]">
                            {r.sport_name}
                          </span>
                          <span className="text-xs font-mono text-[#64748B]">
                            {new Date(r.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-base font-heading font-black text-[#F5F7FA] mt-1.5">
                          {r.title}
                        </div>
                        {r.details && (
                          <div className="text-xs font-mono text-[#8B95A7] mt-1">{r.details}</div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#64748B]">Official Decision</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase border ${
                          r.outcome === 'selected' || r.outcome === 'won'
                            ? 'bg-[#121824] text-[#B8FF3D] border-[#B8FF3D]/40'
                            : r.outcome === 'standby'
                            ? 'bg-[#121824] text-amber-400 border-amber-400/40'
                            : 'bg-[#121824] text-[#8B95A7] border-[#1E293B]'
                        }`}>
                          {r.badge_label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SELECTION TRIALS (DESKTOP 3-COLUMN DISCOVERY)       */}
          {/* ========================================================= */}
          {activeTab === 'trials_browse' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Open Selection Trials
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Upcoming varsity trials available for student athlete registration.
                  </p>
                </div>
                <Link
                  to="/trials"
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#B8FF3D] self-start sm:self-auto"
                >
                  Full Trials Schedule
                </Link>
              </div>

              {loadingOpenTrials ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading upcoming selection trials...
                </div>
              ) : openTrials.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-2">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">
                    No open selection trials currently active
                  </div>
                  <p className="text-xs text-[#8B95A7]">
                    New selection trials will be scheduled soon by the Physical Education Department.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {openTrials.map(trial => (
                    <div
                      key={trial.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3 shadow-lg flex flex-col justify-between transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#121824] text-[#B8FF3D] border border-[#1E293B] font-bold">
                            {(trial.computed_status || 'upcoming').replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-mono text-[#8B95A7]">
                            {trial.sport_name || 'Athletics'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-heading font-black text-[#F5F7FA]">
                            {trial.title}
                          </h3>
                          <p className="text-xs text-[#8B95A7] mt-1 line-clamp-2">
                            {trial.instructions || 'Official SVEC Varsity Selection Trial.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                        <span className="text-xs font-mono text-[#8B95A7]">
                          {trial.venue_name || 'College Grounds'}
                        </span>
                        <Link
                          to="/trials"
                          className="px-3 py-1.5 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase"
                        >
                          View & Apply
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: TRIAL PASSES (ENTRY CHECK-IN PASSES)               */}
          {/* ========================================================= */}
          {activeTab === 'trials' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Selection Trial Passes
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Selection trial entry passes. Present this check-in pass to the coach on arrival.
                  </p>
                </div>
                <button
                  onClick={() => refetchTrials()}
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#8B95A7] self-start sm:self-auto cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {loadingTrials ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading trial passes...
                </div>
              ) : trialPasses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-3">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">
                    No trial passes found
                  </div>
                  <p className="text-xs text-[#8B95A7]">
                    Register for an open selection trial to receive your official check-in pass.
                  </p>
                  <button
                    onClick={() => setActiveTab('trials_browse')}
                    className="px-4 py-2 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase cursor-pointer"
                  >
                    Browse Open Trials
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {trialPasses.map(pass => (
                    <div
                      key={pass.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4 shadow-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md bg-[#121824] text-[#B8FF3D] border border-[#1E293B] text-xs font-mono font-bold">
                          {pass.status === 'checked_in' ? 'Checked In' : 'Registered'}
                        </span>
                        <span className="text-xs font-mono text-[#8B95A7]">
                          {pass.sport_name || 'Athletics'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-heading font-black text-[#F5F7FA]">
                          {pass.trial_title || 'Varsity Selection Trial'}
                        </h3>
                        <p className="text-xs font-mono text-[#00F0FF] mt-0.5">
                          Session: {pass.session_title || 'General Session'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#8B95A7]">
                        <div>
                          <span className="text-[10px] block uppercase">Venue:</span>
                          <span className="text-[#F5F7FA] font-bold">{pass.venue_name || 'SVEC Sports Arena'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] block uppercase">Evaluation:</span>
                          <span className="text-[#F5F7FA] font-bold">
                            {pass.results_published ? pass.evaluation_status : 'Pending Publication'}
                          </span>
                        </div>
                      </div>

                      {/* Check-In Pass QR */}
                      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-[#8B95A7] uppercase block">
                            Check-In Token
                          </span>
                          <span className="text-xs font-mono text-[#F5F7FA] font-bold block mt-0.5">
                            {pass.qr_code_token || pass.id}
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B] block mt-0.5">
                            Present for coach check-in scan
                          </span>
                        </div>

                        <div className="p-2 bg-white rounded-xl shrink-0">
                          <QRCodeSVG 
                            value={pass.qr_code_token || pass.id} 
                            size={68} 
                            level="M" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: TOURNAMENTS (DESKTOP 3-COLUMN GRID)                 */}
          {/* ========================================================= */}
          {activeTab === 'tournaments' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Tournament Registrations
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Inter-department and intramural tournament entries.
                  </p>
                </div>
                <Link
                  to="/tournaments"
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#B8FF3D] self-start sm:self-auto"
                >
                  Browse Tournaments
                </Link>
              </div>

              {loadingTourns ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading tournament records...
                </div>
              ) : tournamentRegs.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-2">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">
                    No tournament registrations found
                  </div>
                  <p className="text-xs text-[#8B95A7]">
                    You have not registered for any tournaments. Browse open tournaments to compete.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {tournamentRegs.map(reg => (
                    <div
                      key={reg.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3 shadow-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#121824] text-[#B8FF3D] border border-[#1E293B] text-xs font-mono font-bold">
                          {reg.status}
                        </span>
                        <span className="text-xs font-mono text-[#8B95A7]">
                          {reg.sport_name}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-heading font-black text-[#F5F7FA]">
                          {reg.tournament_title}
                        </h3>
                        <p className="text-xs font-mono text-[#8B95A7] mt-0.5">
                          Format: {reg.registration_type}
                          {reg.team_name && ` • Squad: ${reg.team_name}`}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#8B95A7]">
                        <span>Registered</span>
                        <span className="text-[#F5F7FA] font-bold">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: EVENTS (DESKTOP 3-COLUMN GRID)                     */}
          {/* ========================================================= */}
          {activeTab === 'events' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Campus Athletic Events
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Official sports calendar, inter-collegiate meets, and fitness events.
                  </p>
                </div>
                <Link
                  to="/events"
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#B8FF3D] self-start sm:self-auto"
                >
                  Full Event Calendar
                </Link>
              </div>

              {loadingEvents ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading campus events...
                </div>
              ) : campusEvents.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-2">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">
                    No upcoming events scheduled
                  </div>
                  <p className="text-xs text-[#8B95A7]">
                    Check back soon for new athletic events.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {campusEvents.map(evt => (
                    <div
                      key={evt.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3 shadow-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[#121824] text-[#B8FF3D] text-[10px] font-mono uppercase font-bold border border-[#1E293B]">
                          {evt.event_type}
                        </span>
                        <span className="text-xs font-mono text-[#8B95A7]">
                          {evt.sport_name || 'All Sports'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-heading font-black text-[#F5F7FA]">
                          {evt.title}
                        </h3>
                        {evt.description && (
                          <p className="text-xs text-[#8B95A7] mt-1 line-clamp-2">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#8B95A7]">
                        <span>Venue: {evt.venue_name || 'Campus Arena'}</span>
                        <span className="text-[#F5F7FA]">
                          {new Date(evt.start_time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: CERTIFICATES (DESKTOP 3-COLUMN SHOWCASE)           */}
          {/* ========================================================= */}
          {activeTab === 'certificates' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Official Certificates
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Official athletic certificates issued by the SVEC Physical Education Department.
                  </p>
                </div>
                <button
                  onClick={() => refetchCerts()}
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#8B95A7] self-start sm:self-auto cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {loadingCerts ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading certificates...
                </div>
              ) : certificates.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-2">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">
                    No certificates issued yet
                  </div>
                  <p className="text-xs text-[#8B95A7]">
                    Official certificates are issued upon podium finishes in college tournaments and sanctioned events.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {certificates.map(cert => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4 shadow-lg transition-colors flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                            {cert.rank_achieved}
                          </span>
                          <span className="text-[10px] font-mono text-[#8B95A7]">
                            {new Date(cert.issue_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-heading font-black text-[#F5F7FA]">
                            {cert.tournament_title}
                          </h3>
                          <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                            Sport: {cert.sport_name} • Issued to {cert.athlete_name}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                        <div className="space-y-0.5 text-[10px] font-mono text-[#8B95A7] truncate">
                          <div>No: {cert.certificate_no}</div>
                        </div>

                        <button
                          onClick={() => downloadCertificatePdf(cert)}
                          className="px-3 py-1.5 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase cursor-pointer shrink-0"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 10: NOTIFICATIONS                                     */}
          {/* ========================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Notifications Center
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Actionable sports notices, trial confirmations, and official results.
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#B8FF3D] cursor-pointer"
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {loadingNotifs ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  No notifications found.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer ${
                        !n.read 
                          ? 'bg-[#0E1524] border-[#B8FF3D]/40' 
                          : 'bg-[#0B101D] border-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-heading font-black ${!n.read ? 'text-[#F5F7FA]' : 'text-[#CBD5E1]'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#8B95A7] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 11: ACCOUNT & SECURITY (DESKTOP BALANCED 2-COLUMN)     */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                  Account & Password Settings
                </h2>
                <p className="text-xs text-[#8B95A7]">
                  Update your contact details and private account credentials.
                </p>
              </div>

              {feedback && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#FF3B30]/15 border-[#FF3B30]/30 text-[#FF6B6B]'
                }`}>
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Profile Contact Form */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-4 transition-colors">
                  <h3 className="text-sm font-heading font-black text-[#F5F7FA] uppercase tracking-wide">
                    Contact Information
                  </h3>

                  <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[#8B95A7] mb-1">Display Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B95A7] mb-1">Official Email</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#8B95A7] pt-1">
                      <div>
                        <span>Student Roll No:</span>
                        <span className="text-[#F5F7FA] font-bold block">{rollNumber}</span>
                      </div>
                      <div>
                        <span>Department:</span>
                        <span className="text-[#F5F7FA] font-bold block truncate">{academicBranch}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#121824] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] cursor-pointer mt-2 transition-colors"
                    >
                      {savingProfile ? 'Saving...' : 'Save Details'}
                    </button>
                  </form>
                </div>

                {/* Password Update Form */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-4 transition-colors">
                  <h3 className="text-sm font-heading font-black text-[#F5F7FA] uppercase tracking-wide">
                    Change Password
                  </h3>

                  <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-[#8B95A7]">New Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] text-[#8B95A7] hover:text-[#F5F7FA] cursor-pointer"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B95A7] mb-1">Confirm New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-bold text-xs uppercase tracking-wider cursor-pointer mt-2 transition-all shadow-md shadow-[#B8FF3D]/20"
                    >
                      {savingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 12: CAMPUS CUP LEADERBOARD                            */}
          {/* ========================================================= */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <CampusCupLeaderboard />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
