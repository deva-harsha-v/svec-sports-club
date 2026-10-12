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
  FileText
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

  // React Query Data Layer
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

  // Safe Roll Number resolution
  const rollNumber = profile?.student_id || profile?.normalized_roll_no || 'Unassigned';
  const academicProgram = profile?.program || 'B.Tech';
  const academicBranch = profile?.department || 'Unassigned Branch';
  const academicYear = profile?.year || 'Current Year';

  // Navigation Panel Structure (Strictly No Emojis, No Decorative Symbols)
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
      {/* 1. INSTITUTIONAL PORTAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#B8FF3D] tracking-widest font-semibold">
            Sri Vasavi Engineering College • Athletic Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-0.5">
            Student Sports Portal
          </h1>
          <p className="text-xs text-[#8B95A7] mt-0.5">
            Authoritative athletic credentials, participation records, and official evaluation results.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          <Link
            to="/trials"
            className="px-3 py-1.5 rounded-xl bg-[#0B101D] hover:bg-[#121927] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] transition-colors"
          >
            Open Trials
          </Link>
          <Link
            to="/tournaments"
            className="px-3 py-1.5 rounded-xl bg-[#0B101D] hover:bg-[#121927] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] transition-colors"
          >
            Tournaments
          </Link>
        </div>
      </div>

      {/* Mobile Bar to toggle Navigation on small screens */}
      <div className="lg:hidden p-3 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Current Section</div>
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

      {/* 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: COMPACT STUDENT NAVIGATION PANEL             */}
        {/* ========================================================= */}
        <aside className={`w-full lg:w-64 xl:w-72 shrink-0 space-y-4 ${mobileSidePanelOpen ? 'block' : 'hidden lg:block'}`}>
          
          {/* Compact Student Identity Block (No Large Squares, No Decorative Graphics) */}
          <div className="p-4 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-2">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#1E293B]"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#121824] border border-[#1E293B] text-[#B8FF3D] font-heading font-black text-sm flex items-center justify-center shrink-0">
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
                <div className="text-[11px] font-mono text-[#B8FF3D] truncate font-medium">
                  {rollNumber}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#8B95A7]">
              <span className="truncate">{academicProgram} • {academicBranch}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#121824] text-[#CBD5E1] font-semibold text-[10px] shrink-0 ml-1">
                {academicYear}
              </span>
            </div>
          </div>

          {/* Clean Text-Based Contents Navigation Panel */}
          <nav className="p-2 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4">
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
                        <span className="px-1.5 py-0.5 rounded-md bg-[#FF3B30] text-white text-[10px] font-bold">
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
          <div className="pt-1">
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

          {/* 1. TAB: ATHLETE PASSPORT (IDENTITY & PROFILE - STRICTLY NO QR CODE) */}
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
                <div className="rounded-2xl p-5 sm:p-6 bg-[#0B101D] border border-[#1E293B] space-y-6 shadow-xl">
                  
                  {/* Institutional Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#1E293B]">
                    <div className="flex items-center gap-3">
                      <img src="/svec-logo.png" alt="SVEC Logo" className="w-9 h-9 object-contain" />
                      <div>
                        <div className="font-heading font-black text-[#F5F7FA] text-sm tracking-wider">
                          SRI VASAVI ENGINEERING COLLEGE
                        </div>
                        <div className="text-[10px] font-mono text-[#8B95A7] uppercase tracking-wider">
                          DEPARTMENT OF PHYSICAL EDUCATION & SPORTS
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#B8FF3D] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-[#121824] border border-[#1E293B]">
                        {sports.length > 0 ? 'ACTIVE COMPETITIVE ATHLETE' : 'ROSTER VERIFIED'}
                      </span>
                    </div>
                  </div>

                  {/* Compact Student Identity Block (Replaces Large Non-Functional Square Box) */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#080D16] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#1E293B]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#121824] border border-[#1E293B] text-[#B8FF3D] font-heading font-black text-base flex items-center justify-center shrink-0">
                          {profile?.full_name?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-mono uppercase text-[#8B95A7] tracking-wider font-semibold">
                          STUDENT ATHLETE
                        </div>
                        <h2 className="text-xl sm:text-2xl font-heading font-black text-[#F5F7FA] tracking-tight">
                          {profile?.full_name || 'Student Athlete'}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5 text-xs font-mono">
                          <span className="text-[#B8FF3D] font-bold">
                            {rollNumber}
                          </span>
                          <span className="text-[#64748B]">•</span>
                          <span className="text-[#8B95A7]">
                            {profile?.email || 'student@svec.ac.in'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-[#121824] border border-[#1E293B] text-[11px] font-mono text-[#CBD5E1]">
                        Institutional Record Verified
                      </span>
                    </div>
                  </div>

                  {/* Academic Parameters (Read-Only) */}
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

                  {/* Verified Sports Participation Chips */}
                  <div className="pt-4 border-t border-[#1E293B] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#8B95A7] block tracking-wider font-semibold">
                      VERIFIED SPORTS PARTICIPATION:
                    </span>
                    {sports.length === 0 ? (
                      <div className="text-xs font-mono text-[#64748B]">
                        No active sports participation recorded. Apply for open selection trials to join varsity rosters.
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        {sports.map(s => (
                          <span 
                            key={s.id}
                            className="px-2.5 py-1 rounded-lg bg-[#121824] border border-[#1E293B] text-[#B8FF3D] font-mono text-xs font-bold flex items-center gap-1.5"
                          >
                            <span>{s.sport_name}</span>
                            {s.is_captain && <span className="text-[10px] text-amber-300 font-bold">(Captain)</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary Performance Metric Cards */}
                  <div className="pt-4 border-t border-[#1E293B] space-y-2">
                    <span className="text-[10px] font-mono uppercase text-[#8B95A7] block tracking-wider font-semibold">
                      ATHLETIC RECORD OVERVIEW:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                        <div className="text-lg font-heading font-black text-[#F5F7FA]">{stats?.matches_played || 0}</div>
                        <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Matches</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                        <div className="text-lg font-heading font-black text-[#B8FF3D]">{stats?.matches_won || 0}</div>
                        <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Wins</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                        <div className="text-lg font-heading font-black text-[#00F0FF]">{stats?.win_rate || 0}%</div>
                        <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Win Rate</div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B]">
                        <div className="text-lg font-heading font-black text-amber-400">{certificates.length}</div>
                        <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Certificates</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* 2. TAB: MY SPORTS (ACTUAL PARTICIPATION) */}
          {activeTab === 'sports' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                    Verified Sports Participation
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Varsity squad memberships and approved tournament rosters.
                  </p>
                </div>
                <button
                  onClick={() => refetchSports()}
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-[#8B95A7] hover:text-[#F5F7FA] text-xs font-mono"
                >
                  Refresh
                </button>
              </div>

              {loadingSports ? (
                <div className="p-8 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-center text-xs font-mono text-[#8B95A7]">
                  Loading sports participation records...
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
                    className="px-4 py-2 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase tracking-wider"
                  >
                    View Selection Trials
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sports.map(s => (
                    <div
                      key={s.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#121824] text-[#B8FF3D] text-[10px] font-mono uppercase font-bold border border-[#1E293B]">
                          {s.status}
                        </span>
                        <span className="text-[11px] font-mono text-[#8B95A7]">
                          {s.sport_category || 'Competitive Sport'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-heading font-black text-[#F5F7FA] uppercase">
                          {s.sport_name}
                        </h3>
                        <p className="text-xs font-mono text-[#00F0FF] mt-0.5">
                          {s.role_designation}
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
                          <span className="text-[10px] text-[#8B95A7] uppercase block">Authority:</span>
                          <span className="text-[#CBD5E1]">SVEC Physical Education</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. TAB: MY APPLICATIONS (APPLICATIONS SUMMARY) */}
          {activeTab === 'applications' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                  My Applications
                </h2>
                <p className="text-xs text-[#8B95A7]">
                  All trial registrations, tournament entries, and their real-time application status.
                </p>
              </div>

              {/* Combined Applications List */}
              <div className="space-y-4">
                {/* Selection Trials Section */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-[#8B95A7] font-semibold">
                    Selection Trial Applications ({trialPasses.length})
                  </div>

                  {trialPasses.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#64748B]">
                      No selection trial applications submitted yet.
                    </div>
                  ) : (
                    trialPasses.map(pass => (
                      <div
                        key={pass.id}
                        className="p-4 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-heading font-black text-[#F5F7FA]">
                            {pass.trial_title || 'Varsity Selection Trial'}
                          </div>
                          <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                            Sport: {pass.sport_name || 'General'} • Session: {pass.session_title || 'General'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#B8FF3D] font-bold">
                            {pass.status === 'checked_in' ? 'Checked In' : 'Registered'}
                          </span>
                          <button
                            onClick={() => setActiveTab('trials')}
                            className="px-3 py-1 rounded-md bg-[#121824] hover:bg-[#1E293B] text-xs font-mono text-[#F5F7FA] border border-[#1E293B]"
                          >
                            View Pass
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Tournament Entries Section */}
                <div className="space-y-3 pt-4 border-t border-[#1E293B]">
                  <div className="text-xs font-mono uppercase text-[#8B95A7] font-semibold">
                    Tournament Entries ({tournamentRegs.length})
                  </div>

                  {tournamentRegs.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#64748B]">
                      No tournament registrations submitted yet.
                    </div>
                  ) : (
                    tournamentRegs.map(reg => (
                      <div
                        key={reg.id}
                        className="p-4 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-heading font-black text-[#F5F7FA]">
                            {reg.tournament_title}
                          </div>
                          <div className="text-xs font-mono text-[#8B95A7] mt-0.5">
                            Sport: {reg.sport_name} • Format: {reg.registration_type}
                            {reg.team_name && ` • Squad: ${reg.team_name}`}
                          </div>
                        </div>

                        <div>
                          <span className="px-2.5 py-1 rounded-md bg-[#121824] border border-[#1E293B] text-xs font-mono text-[#00F0FF] font-bold">
                            {reg.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. TAB: MY RESULTS (PUBLISHED RESULTS ONLY) */}
          {activeTab === 'results' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
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
                <div className="space-y-3">
                  {results.map(r => (
                    <div
                      key={r.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                        <div className="text-base font-heading font-black text-[#F5F7FA] mt-1">
                          {r.title}
                        </div>
                        {r.details && (
                          <div className="text-xs font-mono text-[#8B95A7] mt-0.5">{r.details}</div>
                        )}
                      </div>

                      <div>
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

          {/* 5. TAB: SELECTION TRIALS (OPEN TRIALS DISCOVERY) */}
          {activeTab === 'trials_browse' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                    Selection Trials
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Upcoming varsity trials available for registration.
                  </p>
                </div>
                <Link
                  to="/trials"
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#B8FF3D]"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openTrials.map(trial => (
                    <div
                      key={trial.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3"
                    >
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

                      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                        <span className="text-xs font-mono text-[#8B95A7]">
                          Venue: {trial.venue_name || 'College Grounds'}
                        </span>
                        <Link
                          to="/trials"
                          className="px-3 py-1 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase"
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

          {/* 6. TAB: TRIAL PASSES (OPERATIONAL GATE QR CHECK-IN) */}
          {activeTab === 'trials' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                    Selection Trial Passes
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Gate attendance passes. Present the operational QR code to the coach or gate scanner on arrival.
                  </p>
                </div>
                <button
                  onClick={() => refetchTrials()}
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#8B95A7]"
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
                    className="px-4 py-2 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase"
                  >
                    Browse Open Trials
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {trialPasses.map(pass => (
                    <div
                      key={pass.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4"
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

                      {/* Operational Gate Pass QR (Scoped Strictly to Gate Check-In) */}
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
                            size={64} 
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

          {/* 7. TAB: TOURNAMENTS */}
          {activeTab === 'tournaments' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                    Tournament Registrations
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Inter-department and intramural tournament entries.
                  </p>
                </div>
                <Link
                  to="/tournaments"
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#B8FF3D]"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tournamentRegs.map(reg => (
                    <div
                      key={reg.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3"
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

          {/* 8. TAB: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                    Campus Athletic Events
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Official sports calendar, inter-collegiate meets, and fitness events.
                  </p>
                </div>
                <Link
                  to="/events"
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#B8FF3D]"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campusEvents.map(evt => (
                    <div
                      key={evt.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3"
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

          {/* 9. TAB: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                    Official Certificates
                  </h2>
                  <p className="text-xs text-[#8B95A7]">
                    Official athletic certificates issued by the SVEC Physical Education Department.
                  </p>
                </div>
                <button
                  onClick={() => refetchCerts()}
                  className="px-3 py-1.5 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#8B95A7]"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {certificates.map(cert => (
                    <div
                      key={cert.id}
                      className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase font-bold text-amber-400">
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

                      <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-2">
                        <div className="space-y-0.5 text-[10px] font-mono text-[#8B95A7]">
                          <div>Cert No: {cert.certificate_no}</div>
                          {cert.verification_hash && (
                            <div className="truncate max-w-[150px]">Verification ID: {cert.verification_hash}</div>
                          )}
                        </div>

                        <button
                          onClick={() => downloadCertificatePdf(cert)}
                          className="px-3 py-1.5 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-heading font-bold text-xs uppercase cursor-pointer"
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

          {/* 10. TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
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

          {/* 11. TAB: ACCOUNT & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-heading font-black text-[#F5F7FA] uppercase">
                  Account & Password Settings
                </h2>
                <p className="text-xs text-[#8B95A7]">
                  Update your contact details and security password.
                </p>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#FF3B30]/15 border-[#FF3B30]/30 text-[#FF6B6B]'
                }`}>
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* Profile Form */}
                <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4">
                  <h3 className="text-sm font-heading font-black text-[#F5F7FA]">
                    Contact Information
                  </h3>

                  <form onSubmit={handleUpdateProfile} className="space-y-3">
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
                        <span>Roll Number: </span>
                        <span className="text-[#F5F7FA] font-bold block">{rollNumber}</span>
                      </div>
                      <div>
                        <span>Department: </span>
                        <span className="text-[#F5F7FA] font-bold block truncate">{academicBranch}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full py-2 px-3 rounded-xl bg-[#121824] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] cursor-pointer mt-2"
                    >
                      {savingProfile ? 'Saving...' : 'Save Details'}
                    </button>
                  </form>
                </div>

                {/* Password Form */}
                <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-4">
                  <h3 className="text-sm font-heading font-black text-[#F5F7FA]">
                    Change Password
                  </h3>

                  <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-[#8B95A7]">New Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] text-[#8B95A7] hover:text-[#F5F7FA]"
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
                      className="w-full py-2 px-3 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-bold text-xs uppercase tracking-wider cursor-pointer mt-2"
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
