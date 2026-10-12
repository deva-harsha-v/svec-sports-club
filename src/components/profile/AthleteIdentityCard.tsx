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
  ArrowRight
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

export const AthleteIdentityCard: React.FC = () => {
  const { updateUserAccount, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const validTabs = [
    'id_card', 
    'sports', 
    'applications',
    'results', 
    'trials_browse',
    'trials', 
    'tournaments', 
    'events',
    'certificates', 
    'notifications', 
    'security'
  ] as const;
  type TabType = typeof validTabs[number];

  const queryTab = searchParams.get('tab') as TabType;
  const [activeTab, setActiveTabState] = useState<TabType>(
    validTabs.includes(queryTab) ? queryTab : 'id_card'
  );
  const [mobileSidePanelOpen, setMobileSidePanelOpen] = useState(false);

  // Sync tab state with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTabState(tabParam);
    }
  }, [searchParams]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
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
  const academicYear = profile?.year || 'Current Year';

  // Navigation Panel Structure
  interface NavItem {
    id: TabType;
    label: string;
    count?: number;
    badge?: number;
  }
  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: 'STUDENT SPORTS',
      items: [
        { id: 'id_card', label: 'Athlete Passport' },
        { id: 'sports', label: 'My Sports', count: sports.length },
        { id: 'applications', label: 'My Applications', count: trialPasses.length + tournamentRegs.length },
        { id: 'results', label: 'My Results', count: results.length },
      ]
    },
    {
      title: 'PARTICIPATION',
      items: [
        { id: 'trials_browse', label: 'Selection Trials' },
        { id: 'trials', label: 'Trial Passes', count: trialPasses.length },
        { id: 'tournaments', label: 'Tournaments', count: tournamentRegs.length },
        { id: 'events', label: 'Events' },
        { id: 'certificates', label: 'Certificates', count: certificates.length },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { id: 'notifications', label: 'Notifications', badge: unreadCount > 0 ? unreadCount : undefined },
        { id: 'security', label: 'Account & Security' },
      ]
    }
  ];

  const currentTabLabel = navSections
    .flatMap(s => s.items)
    .find(i => i.id === activeTab)?.label || 'Athlete Passport';

  // Active gate pass preview for passport widget
  const primaryPass = trialPasses.length > 0 ? trialPasses[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      
      {/* 1. COMPACT FLOATING INSTITUTIONAL TOP BAR */}
      <header className="p-4 sm:p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <img 
            src="/svec-logo.png" 
            alt="SVEC Crest" 
            className="w-10 h-10 object-contain drop-shadow"
          />
          <div>
            <div className="text-[10px] font-mono uppercase text-[#B8FF3D] font-bold tracking-widest">
              Sri Vasavi Engineering College • Athletic Operations
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
              Student Athlete Portal
            </h1>
            <p className="text-xs text-[#8B95A7]">
              Authoritative varsity credentials, roster memberships, and official results.
            </p>
          </div>
        </div>

        {/* Quick Utility Actions & Theme Toggle */}
        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          <ThemeToggle />
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#121824] text-[#B8FF3D] border-[#B8FF3D]/40'
                : 'bg-[#080D16] text-[#8B95A7] hover:text-[#F5F7FA] border-[#1E293B]'
            }`}
            title="Notifications Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF3B30] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <Link
            to="/trials"
            className="px-3 py-1.5 rounded-xl bg-[#080D16] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#CBD5E1] transition-colors"
          >
            Open Trials
          </Link>
          
          <Link
            to="/tournaments"
            className="px-3 py-1.5 rounded-xl bg-[#080D16] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#CBD5E1] transition-colors"
          >
            Tournaments
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Bar for small screens */}
      <div className="lg:hidden p-3 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-[#8B95A7] uppercase">ACTIVE SECTION</div>
          <div className="text-xs font-heading font-black text-[#F5F7FA] uppercase">
            {currentTabLabel}
          </div>
        </div>

        <button
          onClick={() => setMobileSidePanelOpen(!mobileSidePanelOpen)}
          className="px-3 py-1.5 rounded-xl bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#B8FF3D] flex items-center gap-1.5 cursor-pointer"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>{mobileSidePanelOpen ? 'Close Menu' : 'Contents'}</span>
        </button>
      </div>

      {/* 2. BALANCED 2-COLUMN DESKTOP WORKSPACE */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: DEDICATED STUDENT NAVIGATION SIDEBAR         */}
        {/* ========================================================= */}
        <aside className={`w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-20 space-y-4 ${
          mobileSidePanelOpen ? 'block' : 'hidden lg:block'
        }`}>
          
          {/* Athlete Overview ID Card */}
          <div className="p-4 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3 transition-colors">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-11 h-11 rounded-xl object-cover border border-[#1E293B]"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#121824] border border-[#1E293B] text-[#B8FF3D] font-heading font-black text-sm flex items-center justify-center shrink-0">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-mono uppercase text-[#8B95A7] tracking-wider font-semibold">
                  STUDENT ATHLETE
                </div>
                <div className="text-sm font-heading font-black text-[#F5F7FA] truncate">
                  {profile?.full_name || 'Student Athlete'}
                </div>
                <div className="text-[11px] font-mono text-[#B8FF3D] truncate font-bold">
                  {rollNumber}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#8B95A7]">
              <span className="truncate">{academicProgram} • {academicBranch}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#121824] text-[#CBD5E1] font-bold text-[10px] shrink-0 ml-1">
                {academicYear}
              </span>
            </div>
          </div>

          {/* Grouped Contents Navigation Panel */}
          <nav className="p-2.5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4 transition-colors">
            {navSections.map(section => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#64748B] font-bold">
                  {section.title}
                </div>
                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidePanelOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-[#121824] text-[#B8FF3D] font-bold border border-[#B8FF3D]/40'
                          : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]/60'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined ? (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#FF3B30] text-white text-[10px] font-bold">
                          {item.badge}
                        </span>
                      ) : item.count !== undefined ? (
                        <span className={`text-[10px] font-mono ${isActive ? 'text-[#B8FF3D]' : 'text-[#64748B]'}`}>
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
              className="w-full py-2 px-3 rounded-xl bg-[#0B101D] hover:bg-[#FF3B30]/10 border border-[#1E293B] hover:border-[#FF3B30]/40 text-xs font-mono text-[#8B95A7] hover:text-[#FF3B30] transition-colors cursor-pointer text-center"
            >
              Sign Out
            </button>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: MAIN CONTENT VIEWPORT                       */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: ATHLETE PASSPORT (DESKTOP MULTI-COLUMN REDESIGN)     */}
          {/* ========================================================= */}
          {activeTab === 'id_card' && (
            <div className="space-y-6">
              {loadingProfile ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center space-y-2">
                  <div className="text-xs font-mono text-[#8B95A7]">Loading Athlete Profile...</div>
                </div>
              ) : errorProfile ? (
                <div className="p-6 rounded-2xl bg-[#0B101D] border border-[#FF3B30]/30 text-center space-y-2">
                  <div className="text-sm font-heading font-black text-[#F5F7FA]">Unable to load profile</div>
                  <button onClick={() => refetchProfile()} className="text-xs font-mono text-[#B8FF3D] underline">Retry</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Primary Column: Official Varsity Credential (7 Cols) */}
                  <div className="xl:col-span-7 space-y-6">
                    
                    {/* Official Athlete Passport Document */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-5 transition-colors">
                      
                      {/* Document Header */}
                      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
                        <div className="flex items-center gap-3">
                          <img src="/svec-logo.png" alt="SVEC Logo" className="w-8 h-8 object-contain" />
                          <div>
                            <div className="font-heading font-black text-[#F5F7FA] text-xs tracking-wider uppercase">
                              SRI VASAVI ENGINEERING COLLEGE
                            </div>
                            <div className="text-[9px] font-mono text-[#8B95A7] uppercase tracking-wider">
                              DEPARTMENT OF PHYSICAL EDUCATION & ATHLETICS
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-lg bg-[#121824] border border-[#1E293B] text-[10px] font-mono text-[#B8FF3D] font-bold uppercase tracking-wider">
                          {sports.length > 0 ? 'VARSITY ATHLETE' : 'RECORD VERIFIED'}
                        </span>
                      </div>

                      {/* Athlete Identity Row */}
                      <div className="p-4 rounded-xl bg-[#080D16] border border-[#1E293B] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name}
                              className="w-12 h-12 rounded-xl object-cover border border-[#1E293B]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#121824] border border-[#1E293B] text-[#B8FF3D] font-heading font-black text-lg flex items-center justify-center shrink-0">
                              {profile?.full_name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-[10px] font-mono uppercase text-[#8B95A7] font-semibold">
                              STUDENT ATHLETE
                            </div>
                            <h2 className="text-xl font-heading font-black text-[#F5F7FA] tracking-tight truncate">
                              {profile?.full_name || 'Student Athlete'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs font-mono">
                              <span className="text-[#B8FF3D] font-bold">
                                {rollNumber}
                              </span>
                              <span className="text-[#64748B]">•</span>
                              <span className="text-[#8B95A7] truncate">
                                {profile?.email || 'student@svec.ac.in'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:block text-right text-[10px] font-mono text-[#8B95A7]">
                          <span className="inline-block px-2 py-0.5 rounded bg-[#121824] text-[#CBD5E1]">
                            ID VERIFIED
                          </span>
                        </div>
                      </div>

                      {/* 4 Academic Parameter Quadrants */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <span className="text-[#8B95A7] text-[10px] uppercase block">Program</span>
                          <span className="text-[#F5F7FA] font-bold block mt-0.5">{academicProgram}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <span className="text-[#8B95A7] text-[10px] uppercase block">Branch</span>
                          <span className="text-[#F5F7FA] font-bold block mt-0.5 truncate">{academicBranch}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <span className="text-[#8B95A7] text-[10px] uppercase block">Year</span>
                          <span className="text-[#F5F7FA] font-bold block mt-0.5">{academicYear}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <span className="text-[#8B95A7] text-[10px] uppercase block">Category</span>
                          <span className="text-[#F5F7FA] font-bold block mt-0.5">{profile?.gender || 'Men'}</span>
                        </div>
                      </div>

                      {/* Bio / Institutional Record Note */}
                      <div className="pt-2 text-xs font-mono text-[#8B95A7] leading-relaxed">
                        {profile?.bio || `${academicProgram} ${academicBranch} ${academicYear} Collegiate Athlete at Sri Vasavi Engineering College.`}
                      </div>

                    </div>

                    {/* Varsity Squad Selections */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-4 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-heading font-black text-[#F5F7FA] uppercase tracking-wide">
                          Varsity Squad Membership
                        </h3>
                        <button
                          onClick={() => setActiveTab('sports')}
                          className="text-xs font-mono text-[#B8FF3D] hover:underline"
                        >
                          View Details ({sports.length})
                        </button>
                      </div>

                      {sports.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#080D16] border border-[#1E293B] text-center space-y-2">
                          <p className="text-xs font-mono text-[#8B95A7]">
                            No active squad selections recorded yet. Register for selection trials to compete for varsity slots.
                          </p>
                          <button
                            onClick={() => setActiveTab('trials_browse')}
                            className="px-3 py-1.5 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase"
                          >
                            Explore Open Trials
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {sports.map(s => (
                            <div 
                              key={s.id}
                              className="p-3.5 rounded-xl bg-[#080D16] border border-[#1E293B] space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-heading font-bold text-sm text-[#F5F7FA]">
                                  {s.sport_name}
                                </span>
                                {s.is_captain && (
                                  <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded">
                                    Captain
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-mono text-[#00F0FF]">
                                {s.role_designation || 'Active Varsity Player'}
                              </div>
                              {s.team_name && (
                                <div className="text-[10px] font-mono text-[#8B95A7]">
                                  Squad: {s.team_name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Athletic Overview Metrics */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-4 transition-colors">
                      <h3 className="text-sm font-heading font-black text-[#F5F7FA] uppercase tracking-wide">
                        Athletic Record Overview
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <div className="text-xl font-heading font-black text-[#F5F7FA]">
                            {stats?.matches_played || 0}
                          </div>
                          <div className="text-[10px] font-mono text-[#8B95A7] uppercase mt-0.5">Matches</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <div className="text-xl font-heading font-black text-[#B8FF3D]">
                            {stats?.matches_won || 0}
                          </div>
                          <div className="text-[10px] font-mono text-[#8B95A7] uppercase mt-0.5">Wins</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <div className="text-xl font-heading font-black text-[#00F0FF]">
                            {stats?.win_rate || 0}%
                          </div>
                          <div className="text-[10px] font-mono text-[#8B95A7] uppercase mt-0.5">Win Rate</div>
                        </div>
                        <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                          <div className="text-xl font-heading font-black text-amber-400">
                            {certificates.length}
                          </div>
                          <div className="text-[10px] font-mono text-[#8B95A7] uppercase mt-0.5">Certificates</div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Secondary Column: Operational Gate Pass Widget & Shortcuts (5 Cols) */}
                  <div className="xl:col-span-5 space-y-6">
                    
                    {/* Operational Gate Pass QR Preview Widget */}
                    <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-4 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-[#B8FF3D]" />
                          <h3 className="text-sm font-heading font-black text-[#F5F7FA] uppercase tracking-wide">
                            Gate Attendance Pass
                          </h3>
                        </div>
                        {trialPasses.length > 0 && (
                          <button
                            onClick={() => setActiveTab('trials')}
                            className="text-xs font-mono text-[#B8FF3D] hover:underline"
                          >
                            All Passes ({trialPasses.length})
                          </button>
                        )}
                      </div>

                      {primaryPass ? (
                        <div className="p-4 rounded-xl bg-[#080D16] border border-[#1E293B] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-[#121824] text-[#B8FF3D] font-mono text-[10px] font-bold">
                              {primaryPass.status === 'checked_in' ? 'CHECKED IN' : 'CONFIRMED PASS'}
                            </span>
                            <span className="text-[11px] font-mono text-[#8B95A7]">
                              {primaryPass.sport_name || 'Athletics'}
                            </span>
                          </div>

                          <div>
                            <div className="text-sm font-heading font-bold text-[#F5F7FA]">
                              {primaryPass.trial_title || 'Varsity Selection Trial'}
                            </div>
                            <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                              Session: {primaryPass.session_title || 'General'} • {primaryPass.venue_name || 'SVEC Sports Arena'}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-3">
                            <div className="text-[10px] font-mono text-[#8B95A7]">
                              <span className="block text-[#64748B] uppercase">Gate Pass Token</span>
                              <span className="font-bold text-[#F5F7FA]">{primaryPass.qr_code_token || primaryPass.id}</span>
                              <span className="block text-[9px] text-[#64748B] mt-0.5">Ready for scanner</span>
                            </div>

                            <div className="p-2 bg-white rounded-xl shrink-0">
                              <QRCodeSVG
                                value={primaryPass.qr_code_token || primaryPass.id}
                                size={68}
                                level="M"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-[#080D16] border border-[#1E293B] text-center space-y-2">
                          <p className="text-xs font-mono text-[#8B95A7]">
                            No active gate passes found. Register for upcoming trials to obtain your official check-in QR pass.
                          </p>
                          <button
                            onClick={() => setActiveTab('trials_browse')}
                            className="px-3 py-1.5 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase"
                          >
                            Browse Open Trials
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Direct Shortcuts Hub */}
                    <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-xl space-y-3 transition-colors">
                      <h3 className="text-xs font-mono uppercase text-[#8B95A7] font-bold tracking-wider">
                        PORTAL SHORTCUTS
                      </h3>
                      
                      <div className="space-y-1.5">
                        <button
                          onClick={() => setActiveTab('applications')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080D16] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileCheck className="w-4 h-4 text-[#B8FF3D]" />
                            <span>My Applications & Entries</span>
                          </div>
                          <span className="text-[#8B95A7]">{trialPasses.length + tournamentRegs.length}</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('certificates')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080D16] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>Official Certificates</span>
                          </div>
                          <span className="text-[#8B95A7]">{certificates.length}</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('results')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080D16] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <Trophy className="w-4 h-4 text-[#00F0FF]" />
                            <span>Published Trial & Match Results</span>
                          </div>
                          <span className="text-[#8B95A7]">{results.length}</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('security')}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080D16] hover:bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <Lock className="w-4 h-4 text-[#8B95A7]" />
                            <span>Account & Password Security</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
                        </button>
                      </div>
                    </div>

                    {/* Department Clearance Notice */}
                    <div className="p-4 rounded-2xl bg-[#080D16] border border-[#1E293B] space-y-1.5 text-xs font-mono text-[#8B95A7]">
                      <div className="text-[10px] uppercase font-bold text-[#CBD5E1]">
                        Institutional Verification
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Student profiles are officially provisioned by Sri Vasavi Engineering College Physical Education Department.
                      </p>
                      <div className="text-[10px] text-[#64748B] pt-1">
                        SVEC (Autonomous) • Affiliated to JNTUK Kakinada
                      </div>
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
          {/* TAB 6: TRIAL PASSES (DESKTOP 2-COLUMN QR GATE CHECK-IN)   */}
          {/* ========================================================= */}
          {activeTab === 'trials' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA] uppercase">
                    Selection Trial Passes
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Gate attendance passes. Present this operational QR code to the coach or gate scanner on arrival.
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
                    Register for an open selection trial to receive your official operational gate pass.
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

                      {/* Operational Gate Pass QR */}
                      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-[#8B95A7] uppercase block">
                            Gate Pass Token
                          </span>
                          <span className="text-xs font-mono text-[#F5F7FA] font-bold block mt-0.5">
                            {pass.qr_code_token || pass.id}
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B] block mt-0.5">
                            Present for barcode/QR scanner
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
                    Actionable sports notices, gate attendance confirmations, and official results.
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

        </main>
      </div>
    </div>
  );
};
