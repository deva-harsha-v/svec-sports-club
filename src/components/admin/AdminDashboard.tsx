import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  tournamentsApi, 
  newsApi, 
  certificatesApi, 
  selectionTrialsApi,
  profilesApi,
  eventsApi,
  campusCupApi,
  sportsApi
} from '../../lib/api';
import { 
  Tournament, 
  NewsItem, 
  SelectionTrial, 
  SelectionRegistration, 
  SelectionEvaluationHistory,
  Profile,
  Sport,
  ClubEvent
} from '../../lib/types';
import { supabase } from '../../lib/supabase';
import { downloadCertificatePdf } from '../../lib/certificateGenerator';

export interface AdminActionNotification {
  id: string;
  type: 'evaluation_pending' | 'deadline_approaching' | 'ready_to_publish' | 'attendance_pending';
  title: string;
  subtitle: string;
  description: string;
  trialId: string;
  targetFilter?: 'pending' | 'all' | 'selected';
  targetStatusFilter?: 'checked_in' | 'registered' | 'all';
  badge: string;
  badgeColor: 'amber' | 'lime' | 'cyan';
  count?: number;
}
import { 
  ShieldCheck, 
  Trophy, 
  QrCode, 
  Plus, 
  Newspaper, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Calendar,
  Layers,
  Search,
  Filter,
  Download,
  UserCheck,
  History,
  Send,
  Eye,
  ExternalLink,
  Clock,
  X,
  Camera,
  RotateCcw,
  UserPlus,
  Activity,
  BarChart2,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  FileText,
  Scan,
  MoreVertical,
  Check,
  Key,
  Lock,
  Edit,
  Mail,
  EyeOff
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, role, signOut, updateUserAccount } = useAuth();
  const navigate = useNavigate();

  // Active Sidebar Panel
  const [activePanel, setActivePanel] = useState<
    'trials' | 'tournaments' | 'news' | 'certificates' | 'students' | 'sports' | 'events' | 'rankings' | 'audit' | 'account'
  >('trials');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selection Trials State
  const [trials, setTrials] = useState<SelectionTrial[]>([]);
  const [selectedTrialId, setSelectedTrialId] = useState<string>('');
  const [roster, setRoster] = useState<SelectionRegistration[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [evalFilter, setEvalFilter] = useState('all');

  // Notification Center State
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminActionNotification[]>([]);

  // Check-In State
  const [checkInToken, setCheckInToken] = useState('');
  const [checkInFeedback, setCheckInFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Evaluation & History Modals
  const [evalModalReg, setEvalModalReg] = useState<SelectionRegistration | null>(null);
  const [evalDecision, setEvalDecision] = useState<'selected' | 'standby' | 'not_selected'>('selected');
  const [evalNotes, setEvalNotes] = useState('');
  const [evalScore, setEvalScore] = useState<number>(85);
  const [evaluating, setEvaluating] = useState(false);

  const [historyModalReg, setHistoryModalReg] = useState<SelectionRegistration | null>(null);
  const [historyLogs, setHistoryLogs] = useState<SelectionEvaluationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Tournaments State
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // News State
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<'Tournament' | 'Campus Cup' | 'Trials' | 'Facility' | 'General'>('Trials');
  const [newsCover, setNewsCover] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');

  // Certificates State
  const [certAthlete, setCertAthlete] = useState('');
  const [certTourn, setCertTourn] = useState('Inter-Department Athletics Meet 2026');
  const [certSport, setCertSport] = useState('Cricket');
  const [certRank, setCertRank] = useState('Winner / Gold Medal');
  const [certSuccess, setCertSuccess] = useState('');

  // Student accounts management state
  const [studentsList, setStudentsList] = useState<Profile[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilterProgram, setStudentFilterProgram] = useState('all');
  const [studentFilterStatus, setStudentFilterStatus] = useState('all');
  const [studentsSubTab, setStudentsSubTab] = useState<'roster' | 'create'>('roster');

  // Student accounts creation state
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentProgram, setNewStudentProgram] = useState<'B.Tech' | 'MBA'>('B.Tech');
  const [newStudentDept, setNewStudentDept] = useState('CSE');
  const [newStudentYear, setNewStudentYear] = useState('2nd');
  const [newStudentGender, setNewStudentGender] = useState<'Men' | 'Women'>('Men');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentGoogleEmail, setNewStudentGoogleEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentConfirmPassword, setNewStudentConfirmPassword] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');
  const [studentError, setStudentError] = useState('');

  // Editing student modal state
  const [editingStudent, setEditingStudent] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editProgram, setEditProgram] = useState<'B.Tech' | 'MBA'>('B.Tech');
  const [editDept, setEditDept] = useState('CSE');
  const [editYear, setEditYear] = useState('2nd');
  const [editGender, setEditGender] = useState<'Men' | 'Women'>('Men');
  const [editPhone, setEditPhone] = useState('');
  const [editGoogleEmail, setEditGoogleEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Account & Security Settings State
  const [accountFullName, setAccountFullName] = useState(currentUser?.full_name || '');
  const [accountEmail, setAccountEmail] = useState(currentUser?.email || '');
  const [accountCurrentPassword, setAccountCurrentPassword] = useState('');
  const [accountNewPassword, setAccountNewPassword] = useState('');
  const [accountConfirmPassword, setAccountConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountUpdating, setAccountUpdating] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setAccountFullName(currentUser.full_name || '');
      setAccountEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const data = await profilesApi.adminGetAllStudents();
      setStudentsList(data);
    } catch (err) {
      console.warn('Failed to load students in dashboard:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activePanel === 'students') {
      loadStudents();
    }
  }, [activePanel]);

  // Load selection trials
  const loadTrials = async () => {
    try {
      const data = await selectionTrialsApi.getPublicTrials();
      setTrials(data);
      if (data.length > 0 && !selectedTrialId) {
        setSelectedTrialId(data[0].id);
      }
    } catch (err) {
      console.warn('Failed to load trials in dashboard:', err);
    }
  };

  // Load roster for selected trial
  const loadRoster = async () => {
    if (!selectedTrialId) return;
    try {
      setLoadingRoster(true);
      const data = await selectionTrialsApi.getRoster(selectedTrialId, {
        search: searchQuery,
        branch: branchFilter,
        year: yearFilter,
        gender: genderFilter,
        status: statusFilter,
        evaluationStatus: evalFilter
      });
      setRoster(data);
    } catch (err) {
      console.warn('Failed to load roster:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  const loadTournaments = async () => {
    try {
      const data = await tournamentsApi.getAll();
      setTournaments(data);
    } catch (err) {
      console.warn('Failed to load tournaments:', err);
    }
  };

  // Load Action-Required Notifications
  const loadNotifications = async () => {
    try {
      const trialsData = trials.length > 0 ? trials : await selectionTrialsApi.getPublicTrials();
      if (!trialsData || trialsData.length === 0) return;

      const { data: regsData } = await supabase
        .from('selection_registrations')
        .select('id, selection_trial_id, evaluation_status, status');

      const alerts: AdminActionNotification[] = [];
      const regsByTrial = new Map<string, any[]>();

      (regsData || []).forEach((r: any) => {
        const list = regsByTrial.get(r.selection_trial_id) || [];
        list.push(r);
        regsByTrial.set(r.selection_trial_id, list);
      });

      trialsData.forEach((trial) => {
        const trialRegs = regsByTrial.get(trial.id) || [];
        const pendingEvals = trialRegs.filter((r: any) => r.evaluation_status === 'pending');
        const checkedIn = trialRegs.filter((r: any) => r.status === 'checked_in');
        const notCheckedIn = trialRegs.filter((r: any) => r.status === 'registered');

        // 1. PENDING EVALUATIONS ALERT (Primary / High Priority)
        if (pendingEvals.length > 0 && trial.publication_state !== 'published') {
          alerts.push({
            id: `eval-${trial.id}`,
            type: 'evaluation_pending',
            title: `${pendingEvals.length} evaluation${pendingEvals.length === 1 ? '' : 's'} pending`,
            subtitle: trial.title,
            description: 'Review athlete evaluations before publishing results.',
            trialId: trial.id,
            targetFilter: 'pending',
            badge: `${pendingEvals.length} PENDING`,
            badgeColor: 'amber',
            count: pendingEvals.length
          });
        }

        // 2. READY TO PUBLISH
        if (trialRegs.length > 0 && pendingEvals.length === 0 && trial.publication_state !== 'published') {
          alerts.push({
            id: `publish-${trial.id}`,
            type: 'ready_to_publish',
            title: 'All evaluations complete',
            subtitle: trial.title,
            description: 'All registered candidates evaluated. Click to publish official results.',
            trialId: trial.id,
            targetFilter: 'selected',
            badge: 'READY TO PUBLISH',
            badgeColor: 'lime'
          });
        }

        // 3. REGISTRATION DEADLINE APPROACHING (Calculated dynamically)
        if (trial.registration_deadline_date && trial.publication_state !== 'published') {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const deadline = new Date(trial.registration_deadline_date);
          deadline.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays >= 0 && diffDays <= 7) {
            const label = diffDays === 0 ? 'Closes today' : diffDays === 1 ? 'Closes tomorrow' : `Closes in ${diffDays} days`;
            alerts.push({
              id: `deadline-${trial.id}`,
              type: 'deadline_approaching',
              title: `Registration deadline: ${label}`,
              subtitle: trial.title,
              description: `Deadline date: ${trial.registration_deadline_date}. Review candidate roster and quotas.`,
              trialId: trial.id,
              targetFilter: 'all',
              badge: label.toUpperCase(),
              badgeColor: diffDays <= 1 ? 'amber' : 'cyan'
            });
          }
        }

        // 4. ATTENDANCE CHECK-IN ACTIVE
        if (checkedIn.length > 0 && notCheckedIn.length > 0) {
          alerts.push({
            id: `checkin-${trial.id}`,
            type: 'attendance_pending',
            title: `${notCheckedIn.length} athlete${notCheckedIn.length === 1 ? '' : 's'} pending check-in`,
            subtitle: trial.title,
            description: `${checkedIn.length} checked in out of ${trialRegs.length} registered.`,
            trialId: trial.id,
            targetFilter: 'all',
            targetStatusFilter: 'registered',
            badge: 'CHECK-IN',
            badgeColor: 'cyan',
            count: notCheckedIn.length
          });
        }
      });

      setNotifications(alerts);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  };

  const handleNotificationClick = (item: AdminActionNotification) => {
    setActivePanel('trials');
    if (item.trialId) {
      setSelectedTrialId(item.trialId);
    }
    if (item.targetFilter) {
      setEvalFilter(item.targetFilter);
    } else {
      setEvalFilter('all');
    }
    if (item.targetStatusFilter) {
      setStatusFilter(item.targetStatusFilter);
    } else {
      setStatusFilter('all');
    }
    setNotificationOpen(false);

    // Smooth scroll to the trials roster table
    setTimeout(() => {
      const el = document.getElementById('trials-roster-table');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  useEffect(() => {
    loadTrials();
    loadTournaments();
    loadNotifications();

    // Live Real-Time Supabase WebSocket Subscriptions
    const channel = supabase
      .channel('admin_operations_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'selection_registrations' },
        () => {
          loadNotifications();
          loadRoster();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'selection_trials' },
        () => {
          loadNotifications();
          loadTrials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (trials.length > 0) {
      loadNotifications();
    }
  }, [trials]);

  useEffect(() => {
    if (selectedTrialId) {
      loadRoster();
    }
  }, [selectedTrialId, searchQuery, branchFilter, yearFilter, genderFilter, statusFilter, evalFilter]);

  // Handle Token / QR Pass Check-In
  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInToken.trim()) return;

    setIsCheckingIn(true);
    setCheckInFeedback(null);
    try {
      const res = await selectionTrialsApi.coachMarkAttendance(checkInToken.trim());
      const branchText = res.branch ? ` • ${res.program || 'B.Tech'} ${res.branch}` : '';
      const timeStr = res.checked_in_at ? new Date(res.checked_in_at).toLocaleTimeString('en-IN') : new Date().toLocaleTimeString('en-IN');
      setCheckInFeedback({
        type: 'success',
        message: `Athlete ${res.student_name} (${res.roll_no})${branchText} verified & checked in at ${timeStr}.`
      });
      setCheckInToken('');
      await loadRoster();
      await loadNotifications();
      setTimeout(() => setCheckInFeedback(null), 5000);
    } catch (err: any) {
      setCheckInFeedback({
        type: 'error',
        message: err.message || 'Invalid QR token or student ineligible.'
      });
      setTimeout(() => setCheckInFeedback(null), 7000);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Handle Evaluation Save
  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalModalReg) return;

    setEvaluating(true);
    try {
      await selectionTrialsApi.coachRecordEvaluation(
        evalModalReg.id,
        evalDecision,
        evalNotes.trim() || undefined
      );

      setEvalModalReg(null);
      setEvalNotes('');
      await loadRoster();
      await loadNotifications();
    } catch (err: any) {
      alert(`Evaluation failed: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  // Open Evaluation History Modal
  const handleOpenHistory = async (reg: SelectionRegistration) => {
    setHistoryModalReg(reg);
    setLoadingHistory(true);
    try {
      const logs = await selectionTrialsApi.getEvaluationHistory(reg.id);
      setHistoryLogs(logs);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Publish / Unpublish Toggle
  const handleTogglePublish = async () => {
    if (!selectedTrialId) return;
    const currentTrial = trials.find(t => t.id === selectedTrialId);
    if (!currentTrial) return;

    const isCurrentlyPublished = currentTrial.publication_state === 'published';
    const action = isCurrentlyPublished ? 'unpublish' : 'publish';

    if (!confirm(`Are you sure you want to ${action} results for ${currentTrial.title}?`)) {
      return;
    }

    try {
      await selectionTrialsApi.adminPublishResults(selectedTrialId, !isCurrentlyPublished);
      await loadTrials();
      await loadNotifications();
      alert(`Results successfully ${isCurrentlyPublished ? 'unpublished' : 'published'}!`);
    } catch (err: any) {
      alert(`Publication failed: ${err.message}`);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (roster.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    try {
      const headers = ['Roll Number', 'Full Name', 'Program', 'Branch', 'Year', 'Gender', 'Phone', 'Attendance Status', 'Evaluation Outcome'];
      const rows = roster.map(r => [
        `"${r.roll_no || ''}"`,
        `"${r.student_name || ''}"`,
        `"${r.program || ''}"`,
        `"${r.branch || ''}"`,
        `"${r.year || ''}"`,
        `"${r.gender || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.status}"`,
        `"${r.evaluation_status}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `selection_roster_${selectedTrialId || 'trial'}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  // Create Student Account Handler (Admin only)
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    setStudentSuccess('');

    if (!newStudentRoll.trim() || !newStudentName.trim()) {
      setStudentError('Roll Number and Full Name are required.');
      return;
    }

    if (newStudentPassword && newStudentPassword !== newStudentConfirmPassword) {
      setStudentError('Initial passwords do not match. Please verify.');
      return;
    }

    if (newStudentGoogleEmail.trim()) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(newStudentGoogleEmail.trim())) {
        setStudentError('Please enter a valid Google Email ID format (e.g. name@gmail.com).');
        return;
      }
    }

    try {
      const email = newStudentEmail.trim() || `${newStudentRoll.trim().toLowerCase()}@srivasaviengg.ac.in`;
      await profilesApi.adminProvisionStudent({
        student_id: newStudentRoll.trim().toUpperCase(),
        full_name: newStudentName.trim(),
        email: email,
        google_email: newStudentGoogleEmail.trim() || undefined,
        program: newStudentProgram,
        department: newStudentDept,
        year: newStudentYear,
        gender: newStudentGender,
        phone: newStudentPhone.trim() || undefined,
        password: newStudentPassword || undefined
      });

      setStudentSuccess(`Student account for ${newStudentName} (${newStudentRoll.toUpperCase()}) created successfully.`);
      setNewStudentRoll('');
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentGoogleEmail('');
      setNewStudentPhone('');
      setNewStudentPassword('');
      setNewStudentConfirmPassword('');
      loadStudents();
      setStudentsSubTab('roster');
      setTimeout(() => setStudentSuccess(''), 5000);
    } catch (err: any) {
      console.error('Account creation failed:', err);
      setStudentError(err.message || 'Account creation failed in database.');
    }
  };

  const openEditStudent = (student: Profile) => {
    setEditingStudent(student);
    setEditName(student.full_name || '');
    setEditProgram((student.program as any) || 'B.Tech');
    setEditDept(student.department || 'CSE');
    setEditYear(student.year || '1st');
    setEditGender((student.gender as any) || 'Men');
    setEditPhone(student.phone || '');
    setEditGoogleEmail(student.google_email || '');
    setEditIsActive(student.is_active !== false);
    setEditError('');
  };

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditSaving(true);
    setEditError('');
    try {
      await profilesApi.adminUpdateStudentAccount(editingStudent.id, {
        full_name: editName.trim(),
        program: editProgram,
        department: editDept,
        year: editYear,
        gender: editGender,
        phone: editPhone.trim(),
        google_email: editGoogleEmail.trim(),
        is_active: editIsActive
      });
      setEditingStudent(null);
      loadStudents();
      setStudentSuccess(`Student account for ${editingStudent.student_id} updated successfully.`);
      setTimeout(() => setStudentSuccess(''), 4000);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update student profile.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleStudentActive = async (student: Profile) => {
    try {
      const nextStatus = student.is_active === false;
      await profilesApi.adminToggleStudentActive(student.id, nextStatus);
      loadStudents();
      setStudentSuccess(`Account ${student.student_id} marked as ${nextStatus ? 'ACTIVE' : 'INACTIVE'}.`);
      setTimeout(() => setStudentSuccess(''), 3000);
    } catch (err: any) {
      console.warn('Failed to toggle status:', err);
    }
  };

  const handleResetPassword = async (student: Profile) => {
    try {
      await profilesApi.adminInitiatePasswordReset(student.id, student.email);
      setStudentSuccess(`Password reset initiated for ${student.full_name} (${student.student_id}).`);
      setTimeout(() => setStudentSuccess(''), 4000);
      loadStudents();
    } catch (err: any) {
      console.warn('Failed to initiate reset:', err);
    }
  };

  // Publish News
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim()) return;

    try {
      await newsApi.create({
        title: newsTitle.trim(),
        summary: newsSummary.trim(),
        content: newsContent.trim() || newsSummary.trim(),
        category: newsCategory,
        cover_image: newsCover.trim() || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
        featured: true,
        author_name: currentUser?.full_name || 'Athletics Committee'
      });

      setNewsSuccess('Circular / News published successfully to public portal!');
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setTimeout(() => setNewsSuccess(''), 4000);
    } catch (err: any) {
      alert(`News publishing failed: ${err.message}`);
    }
  };

  // Issue Certificate
  const handleIssueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certAthlete.trim()) {
      alert('Athlete name is required.');
      return;
    }

    try {
      const certNo = `SVEC-CERT-${Date.now().toString().slice(-6)}`;
      const cert = await certificatesApi.issueCertificate({
        certificate_no: certNo,
        profile_id: currentUser?.id || 'a0000000-0000-0000-0000-000000000001',
        athlete_name: certAthlete.trim(),
        tournament_id: 't0000000-0000-0000-0000-000000000001',
        tournament_title: certTourn.trim(),
        sport_name: certSport.trim(),
        rank_achieved: certRank,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'issued'
      });

      downloadCertificatePdf(cert);
      setCertSuccess(`Issued ${cert.certificate_no} for ${certAthlete}! PDF downloaded.`);
      setCertAthlete('');
      setTimeout(() => setCertSuccess(''), 4000);
    } catch (err: any) {
      alert(`Certificate issue failed: ${err.message}`);
    }
  };

  // Handle Username / Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFullName.trim()) {
      setAccountFeedback({ type: 'error', message: 'Username / Full Name cannot be empty.' });
      return;
    }
    setAccountUpdating(true);
    setAccountFeedback(null);
    try {
      const res = await updateUserAccount({
        full_name: accountFullName.trim(),
        email: accountEmail.trim()
      });
      setAccountFeedback({ type: 'success', message: res.message || 'Username and official email updated successfully!' });
      setTimeout(() => setAccountFeedback(null), 5000);
    } catch (err: any) {
      setAccountFeedback({ type: 'error', message: err.message || 'Failed to update account.' });
    } finally {
      setAccountUpdating(false);
    }
  };

  // Handle Password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountNewPassword.length < 6) {
      setAccountFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (accountNewPassword !== accountConfirmPassword) {
      setAccountFeedback({ type: 'error', message: 'New passwords do not match. Please verify and re-enter.' });
      return;
    }
    setPasswordUpdating(true);
    setAccountFeedback(null);
    try {
      const res = await updateUserAccount({
        password: accountNewPassword
      });
      setAccountCurrentPassword('');
      setAccountNewPassword('');
      setAccountConfirmPassword('');
      setAccountFeedback({ type: 'success', message: 'Password updated successfully!' });
      setTimeout(() => setAccountFeedback(null), 5000);
    } catch (err: any) {
      setAccountFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setPasswordUpdating(false);
    }
  };

  // Helper to clear all filters
  const hasActiveFilters = searchQuery !== '' || branchFilter !== 'all' || yearFilter !== 'all' || genderFilter !== 'all' || statusFilter !== 'all' || evalFilter !== 'all';
  const handleClearFilters = () => {
    setSearchQuery('');
    setBranchFilter('all');
    setYearFilter('all');
    setGenderFilter('all');
    setStatusFilter('all');
    setEvalFilter('all');
  };

  const selectedTrial = trials.find(t => t.id === selectedTrialId);

  // Breakdown metrics computed from actual roster
  const checkedInCount = roster.filter(r => r.status === 'checked_in').length;
  const selectedCount = roster.filter(r => r.evaluation_status === 'selected').length;
  const pendingCount = roster.filter(r => r.evaluation_status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-[#070A0F] text-[#F5F7FA]">
      
      {/* ==================================================================== */}
      {/* 1. LEFT ADMIN SIDEBAR                                                */}
      {/* ==================================================================== */}
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#080D16] border-r border-[#161F30] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top: Branding & Official Crest */}
        <div className="p-5 flex flex-col items-center text-center border-b border-[#161F30]/60 relative">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-[#8B95A7] hover:text-[#F5F7FA] lg:hidden p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-24 h-24 flex items-center justify-center mb-3">
            <img 
              src="/svec-logo.png" 
              alt="Sri Vasavi Sports Club Crest" 
              className="w-full h-full object-contain drop-shadow-md" 
            />
          </div>

          <h2 className="font-heading font-black text-sm text-[#F5F7FA] tracking-wide">
            Sri Vasavi Sports Club
          </h2>
          <p className="text-[10px] text-[#8B95A7] font-medium tracking-wide">
            Athletic Operations Console
          </p>
        </div>

        {/* Middle: Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          
          {/* Selection Trials */}
          <button
            onClick={() => { setActivePanel('trials'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'trials'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Selection Trials</span>
          </button>

          {/* Tournaments */}
          <button
            onClick={() => { setActivePanel('tournaments'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'tournaments'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>Tournaments</span>
          </button>

          {/* News & Circulars */}
          <button
            onClick={() => { setActivePanel('news'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'news'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <Newspaper className="w-4 h-4 shrink-0" />
            <span>News & Circulars</span>
          </button>

          {/* Certificates */}
          <button
            onClick={() => { setActivePanel('certificates'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'certificates'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Certificates</span>
          </button>

          {/* Student Accounts */}
          <button
            onClick={() => { setActivePanel('students'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'students'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Student Accounts</span>
          </button>

          {/* Sports & Facilities */}
          <button
            onClick={() => { setActivePanel('sports'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'sports'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Sports & Facilities</span>
          </button>

          {/* Events & Calendar */}
          <button
            onClick={() => { setActivePanel('events'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'events'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Events & Calendar</span>
          </button>

          {/* Rankings & Campus Cup */}
          <button
            onClick={() => { setActivePanel('rankings'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'rankings'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Rankings & Campus Cup</span>
          </button>

          {/* Audit Logs */}
          <button
            onClick={() => { setActivePanel('audit'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'audit'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Audit Logs</span>
          </button>

          {/* Account & Security Settings */}
          <button
            onClick={() => { setActivePanel('account'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              activePanel === 'account'
                ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/15'
                : 'text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]'
            }`}
          >
            <Key className="w-4 h-4 shrink-0" />
            <span>Account & Security</span>
          </button>

        </nav>

        {/* Bottom: Athletic Silhouette & College Designation */}
        <div className="p-4 border-t border-[#161F30]/60 relative overflow-hidden bg-gradient-to-t from-[#06090E] to-transparent">
          
          {/* Official athletic runners silhouette graphic */}
          <div className="rounded-xl overflow-hidden mb-3 bg-[#0A1423]/40">
            <img 
              src="/admin-runners.png" 
              alt="Athletics Silhouette" 
              className="w-full h-auto object-cover select-none pointer-events-none block" 
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-0.5 h-6 bg-[#B8FF3D] rounded-full shrink-0" />
            <div className="text-[10px] leading-tight text-[#8B95A7]">
              <div className="font-semibold text-[#CBD5E1]">Sri Vasavi Engineering College</div>
              <div className="text-[#64748B]">Tadepalligudem</div>
            </div>
          </div>
        </div>

      </aside>

      {/* ==================================================================== */}
      {/* 2. MAIN WORKSPACE WITH TOP HEADER                                    */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Admin Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#080D16]/95 backdrop-blur-md border-b border-[#161F30] px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Hamburger & Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg bg-[#0E1420] border border-[#1E293B] text-[#8B95A7] hover:text-[#F5F7FA] lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <img 
                src="/svec-logo.png" 
                alt="SVEC Logo" 
                className="w-7 h-7 object-contain rounded" 
              />
              <div className="leading-tight">
                <div className="font-heading font-black text-xs sm:text-sm text-[#F5F7FA] tracking-wide">
                  Sri Vasavi Sports Club
                </div>
                <div className="text-[10px] text-[#8B95A7]">
                  Athletic Operations Console
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search Field */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search athletes, trials, tournaments..."
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0E1420] border border-[#1E293B] text-xs text-[#F5F7FA] placeholder-[#64748B] focus:outline-none focus:border-[#B8FF3D]/50 transition-colors"
              />
            </div>
          </div>

          {/* Right: Utility Actions & Admin Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`relative p-2 rounded-xl border text-[#8B95A7] hover:text-[#F5F7FA] transition-all cursor-pointer ${
                  notificationOpen 
                    ? 'bg-[#151D2D] border-[#B8FF3D]/50 text-[#F5F7FA] shadow-lg shadow-[#B8FF3D]/10' 
                    : 'bg-[#0E1420] border-[#1E293B] hover:border-[#334155]'
                }`}
                title="Action-Required Notifications"
                aria-label="Notification Center"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF3B30] text-white text-[10px] font-black flex items-center justify-center border-2 border-[#080D16] shadow-sm animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationOpen && (
                <>
                  {/* Invisible Backdrop to close on outside click */}
                  <div 
                    onClick={() => setNotificationOpen(false)}
                    className="fixed inset-0 z-40" 
                  />

                  {/* Popover Panel */}
                  <div className="absolute right-0 mt-2.5 w-[340px] sm:w-[400px] rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-2xl shadow-black/90 z-50 overflow-hidden divide-y divide-[#161F30] animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* Header */}
                    <div className="p-3.5 px-4 flex items-center justify-between bg-[#080D16]/90 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-xs text-[#F5F7FA] tracking-wide uppercase">
                          Action Required
                        </span>
                        {notifications.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#B8FF3D]/15 text-[#B8FF3D] border border-[#B8FF3D]/30 uppercase">
                            {notifications.length} Pending
                          </span>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <button
                          onClick={() => setNotifications([])}
                          className="text-[11px] text-[#8B95A7] hover:text-[#CBD5E1] transition-colors cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[#161F30]/60 no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-12 px-6 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                          <div className="font-bold text-xs text-[#F5F7FA]">All Caught Up</div>
                          <p className="text-[11px] text-[#64748B] mt-1">
                            No urgent operational items requiring admin intervention.
                          </p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className="p-3.5 px-4 hover:bg-[#121927] transition-all cursor-pointer group flex gap-3.5 items-start text-left"
                          >
                            {/* Icon Indicator */}
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              item.type === 'evaluation_pending'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : item.type === 'ready_to_publish'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              {item.type === 'evaluation_pending' ? (
                                <Bell className="w-4 h-4 text-amber-400" />
                              ) : item.type === 'ready_to_publish' ? (
                                <Award className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Clock className="w-4 h-4 text-cyan-400" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs text-[#F5F7FA] group-hover:text-[#B8FF3D] transition-colors truncate">
                                  {item.title}
                                </span>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                                  item.badgeColor === 'amber'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    : item.badgeColor === 'lime'
                                    ? 'bg-[#B8FF3D]/15 text-[#B8FF3D] border border-[#B8FF3D]/30'
                                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                }`}>
                                  {item.badge}
                                </span>
                              </div>

                              <div className="text-[11px] font-semibold text-[#CBD5E1] truncate">
                                {item.subtitle}
                              </div>

                              <p className="text-[11px] text-[#8B95A7] leading-relaxed">
                                {item.description}
                              </p>

                              <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-[#B8FF3D]">
                                <span>Go to Selection Trials</span>
                                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Authenticated Coach & Admin Identity */}
            <button
              onClick={() => setActivePanel('account')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#0E1420] hover:bg-[#151D2D] border border-[#1E293B] hover:border-[#00F0FF]/40 text-left transition-all cursor-pointer"
              title="Manage Username & Password Settings"
            >
              <div className="w-6 h-6 rounded-full bg-[#00F0FF] text-[#070A0F] font-black text-xs flex items-center justify-center shrink-0">
                {currentUser?.full_name?.charAt(0) || 'C'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#F5F7FA]">
                {currentUser?.full_name || 'Coach & Administrator'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 tracking-wider">
                COACH & ADMIN
              </span>
              <Key className="w-3 h-3 text-[#8B95A7] hidden sm:block" />
            </button>

            {/* Public Portal Button */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1420] hover:bg-[#151D2D] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-xs font-medium text-[#F5F7FA] transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#B8FF3D]" />
              <span>Public Portal</span>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E1420] hover:bg-[#FF3B30]/15 border border-[#1E293B] hover:border-[#FF3B30]/40 text-xs font-medium text-[#8B95A7] hover:text-[#FF6B6B] transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>

          </div>

        </header>

        {/* ==================================================================== */}
        {/* 3. OPERATIONS CONTENT BODY                                           */}
        {/* ==================================================================== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-5 max-w-[1500px] w-full mx-auto">
          
          {/* PANEL 1: SELECTION TRIALS (Default Operational Console) */}
          {activePanel === 'trials' && (
            <div className="space-y-5">
              
              {/* Page Title & Operational Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black tracking-widest text-[#B8FF3D] uppercase">
                    SELECTION TRIALS
                  </div>
                  <h1 className="text-2xl font-heading font-black text-[#F5F7FA] tracking-tight">
                    Selection Trials
                  </h1>
                  <p className="text-xs text-[#8B95A7] mt-0.5">
                    Manage registrations, attendance, evaluations and published results.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigate('/admin/scan')}
                    className="px-3.5 py-2 rounded-xl bg-[#0E1420] hover:bg-[#151D2D] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-xs font-semibold text-[#F5F7FA] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#B8FF3D]" />
                    <span>Camera Scanner</span>
                  </button>

                  <button
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 rounded-xl bg-[#0E1420] hover:bg-[#151D2D] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-xs font-semibold text-[#F5F7FA] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#B8FF3D]" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* 3 Summary Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Card 1: Active Trial */}
                <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-4.5 flex flex-col justify-between space-y-3 shadow-lg shadow-black/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#CBD5E1]">Active Trial</span>
                  </div>

                  <div>
                    <select
                      value={selectedTrialId}
                      onChange={(e) => setSelectedTrialId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-xs font-medium text-[#F5F7FA] focus:outline-none cursor-pointer transition-colors"
                    >
                      {trials.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-[#161F30]/60 flex items-center gap-2 text-xs text-[#8B95A7]">
                    <FileText className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                    <span className="truncate font-mono text-[11px]">
                      {selectedTrial?.circular_ref || 'Official SVEC Circular'}
                    </span>
                    {selectedTrial?.official_registration_url && (
                      <a 
                        href={selectedTrial.official_registration_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#B8FF3D] hover:underline ml-auto shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card 2: Trial Status */}
                <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-4.5 flex flex-col justify-between space-y-3 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#CBD5E1]">Trial Status</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      selectedTrial?.publication_state === 'published'
                        ? 'bg-[#141E30] text-[#8B95A7] border border-[#1E293B]'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {selectedTrial?.publication_state === 'published' ? 'REGISTRATION CLOSED' : 'REGISTRATION OPEN'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-1.5 text-[#8B95A7]">
                      <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Deadline</span>
                      <span className="font-semibold text-[#F5F7FA] ml-1">
                        {selectedTrial?.registration_deadline_date || 'Ongoing'}
                      </span>
                    </div>

                    <button
                      onClick={handleTogglePublish}
                      className="px-3 py-1.5 rounded-lg bg-[#B8FF3D] hover:bg-[#a3eb2d] text-[#070A0F] font-bold text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      {selectedTrial?.publication_state === 'published' ? 'Unpublish' : 'Publish Results'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#161F30]/60 flex items-center justify-between text-xs text-[#8B95A7]">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Results Published</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedTrial?.publication_state === 'published'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#FF3B30]/15 text-[#FF6B6B] border border-[#FF3B30]/30'
                    }`}>
                      {selectedTrial?.publication_state === 'published' ? 'Published' : 'Not Published'}
                    </span>
                  </div>
                </div>

                {/* Card 3: Registered Athletes */}
                <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-4.5 flex flex-col justify-between space-y-2 shadow-lg shadow-black/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#CBD5E1]">Registered Athletes</span>
                  </div>

                  <div className="font-heading font-black text-3xl text-[#F5F7FA]">
                    {roster.length}
                  </div>

                  <div className="pt-2 border-t border-[#161F30]/60 grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-[#8B95A7]">Checked In</span>
                      <span className="font-bold text-[#F5F7FA] ml-auto">{checkedInCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-[#8B95A7]">Selected</span>
                      <span className="font-bold text-[#F5F7FA] ml-auto">{selectedCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-[#8B95A7]">Pending</span>
                      <span className="font-bold text-[#F5F7FA] ml-auto">{pendingCount}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Athlete Check-In Card */}
              <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-4.5 space-y-3 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#F5F7FA]">Athlete Check-In</h3>
                    <p className="text-xs text-[#8B95A7]">Scan student ID card QR or enter roll number to record attendance.</p>
                  </div>
                </div>

                {checkInFeedback && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    checkInFeedback.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-[#FF3B30]/15 border-[#FF3B30]/30 text-[#FF6B6B]'
                  }`}>
                    {checkInFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{checkInFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="flex-1 relative">
                    <Scan className="w-4 h-4 text-[#8B95A7] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={checkInToken}
                      onChange={(e) => setCheckInToken(e.target.value)}
                      placeholder="Scan Student ID card QR or enter Roll No (e.g. 24A81A0501)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] placeholder-[#64748B] focus:outline-none focus:border-[#B8FF3D] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCheckingIn || !checkInToken.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a3eb2d] disabled:opacity-50 text-[#070A0F] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CHECK IN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/scan')}
                    className="px-4 py-2.5 rounded-xl bg-[#080D16] hover:bg-[#151D2D] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-xs font-semibold text-[#F5F7FA] flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4 text-[#B8FF3D]" />
                    <span>Camera</span>
                  </button>
                </form>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-3 flex flex-wrap items-center gap-2.5 shadow-lg shadow-black/20">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search athlete name or roll number..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] placeholder-[#64748B] focus:outline-none focus:border-[#B8FF3D]/50 transition-colors"
                  />
                </div>

                {/* Branch */}
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#CBD5E1] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Branches</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="EEE">EEE</option>
                  <option value="AIML">AIML</option>
                  <option value="AIDS">AIDS</option>
                  <option value="CAI">CAI</option>
                  <option value="CST">CST</option>
                  <option value="Management">Management</option>
                </select>

                {/* Year */}
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#CBD5E1] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Years</option>
                  <option value="1st">1st Year</option>
                  <option value="2nd">2nd Year</option>
                  <option value="3rd">3rd Year</option>
                  <option value="4th">4th Year</option>
                </select>

                {/* Gender */}
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#CBD5E1] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Genders</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>

                {/* Attendance */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#CBD5E1] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Attendance</option>
                  <option value="checked_in">Checked In</option>
                  <option value="registered">Not Checked In</option>
                </select>

                {/* Outcome */}
                <select
                  value={evalFilter}
                  onChange={(e) => setEvalFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#CBD5E1] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Outcomes</option>
                  <option value="pending">Pending</option>
                  <option value="selected">Selected</option>
                  <option value="standby">Standby</option>
                  <option value="not_selected">Not Selected</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-2 rounded-xl border border-[#1E293B] hover:border-cyan-500/40 bg-[#080D16] text-xs font-medium text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                )}
              </div>

              {/* High-Density Registrations Table */}
              <div id="trials-roster-table" className="bg-[#0B101D] border border-[#192338] rounded-2xl overflow-hidden shadow-lg shadow-black/20">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#080D16] border-b border-[#192338] text-[11px] font-bold uppercase tracking-wider text-[#8B95A7]">
                        <th className="py-3 px-4">ROLL NO</th>
                        <th className="py-3 px-4">STUDENT</th>
                        <th className="py-3 px-4">PROGRAM & BRANCH</th>
                        <th className="py-3 px-4">YEAR</th>
                        <th className="py-3 px-4">GENDER</th>
                        <th className="py-3 px-4">ATTENDANCE</th>
                        <th className="py-3 px-4">OUTCOME</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#131A2B]">
                      {loadingRoster ? (
                        <tr>
                          <td colSpan={8} className="py-16 text-center text-[#8B95A7]">
                            <div className="inline-block animate-spin w-6 h-6 border-2 border-[#B8FF3D] border-t-transparent rounded-full mb-2" />
                            <div>Loading registrations roster...</div>
                          </td>
                        </tr>
                      ) : roster.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#0E1526] border border-[#1E293B] flex items-center justify-center mx-auto text-[#3B4D6E] mb-3">
                              <Users className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-sm text-[#F5F7FA] mb-1">No athletes found</h4>
                            <p className="text-xs text-[#64748B]">
                              {hasActiveFilters 
                                ? 'No registrations match the current filters.' 
                                : 'No athletes registered for this trial session yet.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        roster.map((r) => (
                          <tr key={r.id} className="hover:bg-[#0E1526] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#CBD5E1]">
                              {r.roll_no || 'N/A'}
                            </td>

                            <td className="py-3.5 px-4 font-semibold text-[#F5F7FA]">
                              {r.student_name}
                            </td>

                            <td className="py-3.5 px-4 text-[#8B95A7]">
                              {r.program || 'B.Tech'} • {r.branch || 'General'}
                            </td>

                            <td className="py-3.5 px-4 text-[#CBD5E1]">
                              {r.year || '—'}
                            </td>

                            <td className="py-3.5 px-4 text-[#CBD5E1]">
                              {r.gender || '—'}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                r.status === 'checked_in'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-[#131B2E] text-[#64748B] border border-[#1E293B]'
                              }`}>
                                {r.status === 'checked_in' ? 'Checked In' : 'Not Checked In'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize ${
                                r.evaluation_status === 'selected'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : r.evaluation_status === 'standby'
                                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                  : r.evaluation_status === 'not_selected'
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}>
                                {r.evaluation_status === 'not_selected' ? 'Not Selected' : (r.evaluation_status || 'Pending')}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEvalModalReg(r);
                                    setEvalDecision(r.evaluation_status === 'pending' ? 'selected' : (r.evaluation_status as any));
                                  }}
                                  className="p-1.5 rounded-lg bg-[#0E1526] hover:bg-[#151D2D] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-[#8B95A7] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                                  title="Evaluate Athlete"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleOpenHistory(r)}
                                  className="p-1.5 rounded-lg bg-[#0E1526] hover:bg-[#151D2D] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-[#8B95A7] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                                  title="View Audit Log"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Pagination info */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#080D16] border-t border-[#192338] text-xs text-[#8B95A7]">
                  <div>
                    Showing 1 to {roster.length} of {roster.length} registrations
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 rounded flex items-center justify-center text-[#8B95A7] hover:text-[#F5F7FA] disabled:opacity-40" disabled>
                      &lt;
                    </button>
                    <span className="w-6 h-6 rounded bg-[#B8FF3D] text-[#070A0F] font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <button className="w-6 h-6 rounded flex items-center justify-center text-[#8B95A7] hover:text-[#F5F7FA] disabled:opacity-40" disabled>
                      &gt;
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PANEL 2: TOURNAMENTS */}
          {activePanel === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-heading font-black text-[#F5F7FA]">Inter-Department Tournaments</h2>
                  <p className="text-xs text-[#8B95A7]">Official athletic championships, knockout fixtures and team squads.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournaments.map(t => (
                  <div key={t.id} className="bg-[#0B101D] border border-[#192338] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B8FF3D]/15 text-[#B8FF3D] border border-[#B8FF3D]/30 uppercase">
                        {t.status}
                      </span>
                      <span className="text-xs text-[#8B95A7]">{t.sport_name}</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#F5F7FA]">{t.title}</h3>
                    <p className="text-xs text-[#8B95A7] line-clamp-2">{t.rules}</p>
                    <div className="text-[11px] text-[#64748B] flex items-center justify-between pt-2 border-t border-[#161F30]">
                      <span>{t.current_teams_count} / {t.max_teams} Teams</span>
                      <span>Format: {t.format}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PANEL 3: NEWS & CIRCULARS */}
          {activePanel === 'news' && (
            <div className="max-w-2xl mx-auto bg-[#0B101D] border border-[#192338] rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-base font-heading font-black text-[#F5F7FA] flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#B8FF3D]" />
                  <span>Publish Official Circular / Athletic Announcement</span>
                </h2>
                <p className="text-xs text-[#8B95A7] mt-0.5">Post verified circulars and tournament briefings.</p>
              </div>

              {newsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{newsSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePublishNews} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#8B95A7] font-medium mb-1">Circular Title *</label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="e.g. SVEC Inter-Department Athletics Meet 2026-27"
                    className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8B95A7] font-medium mb-1">Category</label>
                    <select
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                    >
                      <option value="Trials">Selection Trials</option>
                      <option value="Tournament">Tournament</option>
                      <option value="Campus Cup">Campus Cup</option>
                      <option value="Facility">Facility & Infrastructure</option>
                      <option value="General">General Notice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8B95A7] font-medium mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      value={newsCover}
                      onChange={(e) => setNewsCover(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8B95A7] font-medium mb-1">Executive Summary *</label>
                  <textarea
                    rows={2}
                    required
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="Brief 1-2 sentence overview for news card..."
                    className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#8B95A7] font-medium mb-1">Full Circular Content</label>
                  <textarea
                    rows={4}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Complete body, schedule, rules and reporting instructions..."
                    className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a3eb2d] text-[#070A0F] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>PUBLISH CIRCULAR TO PORTAL</span>
                </button>
              </form>
            </div>
          )}

          {/* PANEL 4: CERTIFICATES */}
          {activePanel === 'certificates' && (
            <div className="max-w-2xl mx-auto bg-[#0B101D] border border-[#192338] rounded-2xl p-5 space-y-4">
              <div>
                <h2 className="text-base font-heading font-black text-[#F5F7FA] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#B8FF3D]" />
                  <span>Issue Cryptographically Verifiable Athletic Certificate</span>
                </h2>
                <p className="text-xs text-[#8B95A7] mt-0.5">Generate tamper-proof achievement certificates with verification QR codes.</p>
              </div>

              {certSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{certSuccess}</span>
                </div>
              )}

              <form onSubmit={handleIssueCert} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#8B95A7] font-medium mb-1">Athlete Full Name *</label>
                  <input
                    type="text"
                    required
                    value={certAthlete}
                    onChange={(e) => setCertAthlete(e.target.value)}
                    placeholder="e.g. K. Rajesh"
                    className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8B95A7] font-medium mb-1">Tournament Title</label>
                    <input
                      type="text"
                      value={certTourn}
                      onChange={(e) => setCertTourn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#8B95A7] font-medium mb-1">Sport Name</label>
                    <input
                      type="text"
                      value={certSport}
                      onChange={(e) => setCertSport(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8B95A7] font-medium mb-1">Rank / Achievement</label>
                  <select
                    value={certRank}
                    onChange={(e) => setCertRank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                  >
                    <option value="Winner / Gold Medal">Winner / Gold Medal</option>
                    <option value="Runners-up / Silver Medal">Runners-up / Silver Medal</option>
                    <option value="Second Runners-up / Bronze Medal">Second Runners-up / Bronze Medal</option>
                    <option value="Certificate of Merit">Certificate of Merit</option>
                    <option value="Official Participation">Official Participation</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a3eb2d] text-[#070A0F] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>GENERATE & DOWNLOAD VERIFIABLE CERTIFICATE PDF</span>
                </button>
              </form>
            </div>
          )}

          {/* PANEL 5: STUDENT ACCOUNTS & AUTHENTICATION */}
          {activePanel === 'students' && (
            <div className="space-y-6">
              
              {/* Header & Sub-Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                <div>
                  <h1 className="text-xl font-heading font-black text-[#F5F7FA] flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-[#B8FF3D]" />
                    <span>Student Accounts & Authentication</span>
                  </h1>
                  <p className="text-xs text-[#8B95A7] mt-0.5">
                    Officially provisioned student athletes, authorized Google OAuth logins, and academic credentials.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-[#0B101D] rounded-xl border border-[#1E293B]">
                  <button
                    onClick={() => setStudentsSubTab('roster')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      studentsSubTab === 'roster'
                        ? 'bg-[#B8FF3D] text-[#070A0F]'
                        : 'text-[#8B95A7] hover:text-[#F5F7FA]'
                    }`}
                  >
                    Student Roster ({studentsList.length})
                  </button>
                  <button
                    onClick={() => setStudentsSubTab('create')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      studentsSubTab === 'create'
                        ? 'bg-[#B8FF3D] text-[#070A0F]'
                        : 'text-[#8B95A7] hover:text-[#F5F7FA]'
                    }`}
                  >
                    + Provision Account
                  </button>
                </div>
              </div>

              {studentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{studentSuccess}</span>
                </div>
              )}

              {studentError && (
                <div className="p-3 rounded-xl bg-[#FF3B30]/15 text-[#FF6B6B] border border-[#FF3B30]/30 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              {/* SUBTAB 1: ROSTER & ACCOUNTS TABLE */}
              {studentsSubTab === 'roster' && (
                <div className="space-y-4">
                  {/* Search and Filters Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2 relative">
                      <Search className="w-4 h-4 text-[#8B95A7] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name, roll no, college email, or Google Email..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                      />
                    </div>

                    <div>
                      <select
                        value={studentFilterProgram}
                        onChange={(e) => setStudentFilterProgram(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                      >
                        <option value="all">All Programs</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="MBA">MBA</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={studentFilterStatus}
                        onChange={(e) => setStudentFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#0B101D] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Student Accounts Table */}
                  <div className="rounded-2xl bg-[#0B101D] border border-[#1E293B] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#070A0F] text-[#8B95A7] uppercase text-[10px] tracking-wider border-b border-[#1E293B]">
                          <tr>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Student ID</th>
                            <th className="px-4 py-3">College Email</th>
                            <th className="px-4 py-3">Google Email ID</th>
                            <th className="px-4 py-3">Program & Branch</th>
                            <th className="px-4 py-3">Year</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B]/60">
                          {loadingStudents ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-[#8B95A7]">
                                Loading student accounts...
                              </td>
                            </tr>
                          ) : (
                            studentsList
                              .filter(s => {
                                const q = studentSearch.toLowerCase().trim();
                                const matchesSearch = !q || 
                                  (s.full_name?.toLowerCase().includes(q)) ||
                                  (s.student_id?.toLowerCase().includes(q)) ||
                                  (s.email?.toLowerCase().includes(q)) ||
                                  (s.google_email?.toLowerCase().includes(q));
                                const matchesProg = studentFilterProgram === 'all' || s.program === studentFilterProgram;
                                const matchesStat = studentFilterStatus === 'all' || 
                                  (studentFilterStatus === 'active' && s.is_active !== false) ||
                                  (studentFilterStatus === 'inactive' && s.is_active === false);
                                return matchesSearch && matchesProg && matchesStat;
                              })
                              .map(s => (
                                <tr key={s.id} className="hover:bg-[#121824]/40 transition-colors">
                                  <td className="px-4 py-3 font-medium text-[#F5F7FA]">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-[#121824] border border-[#1E293B] text-[#B8FF3D] font-heading font-black text-xs flex items-center justify-center shrink-0">
                                        {s.full_name?.charAt(0) || 'A'}
                                      </div>
                                      <span className="font-heading font-bold">{s.full_name}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-[#B8FF3D] font-bold">
                                    {s.student_id || s.normalized_roll_no || 'Unassigned'}
                                  </td>
                                  <td className="px-4 py-3 text-[#8B95A7]">
                                    {s.email}
                                  </td>
                                  <td className="px-4 py-3">
                                    {s.google_email ? (
                                      <span className="px-2 py-0.5 rounded-lg bg-[#121824] text-emerald-400 border border-emerald-500/30 text-[11px] inline-flex items-center gap-1.5 font-bold">
                                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                        </svg>
                                        <span>{s.google_email}</span>
                                      </span>
                                    ) : (
                                      <span className="text-[#64748B] text-[10px]">Not Linked</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-[#CBD5E1]">
                                    {s.program} • {s.department}
                                  </td>
                                  <td className="px-4 py-3 text-[#8B95A7]">
                                    {s.year} Year
                                  </td>
                                  <td className="px-4 py-3">
                                    {s.is_active !== false ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[9px] font-bold">
                                        ACTIVE
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 text-[9px] font-bold">
                                        INACTIVE
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => openEditStudent(s)}
                                        title="Edit profile & Google account"
                                        className="p-1.5 rounded-lg bg-[#121824] hover:bg-[#192338] border border-[#1E293B] text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors cursor-pointer"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleToggleStudentActive(s)}
                                        title={s.is_active !== false ? 'Suspend account' : 'Activate account'}
                                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono transition-colors cursor-pointer ${
                                          s.is_active !== false
                                            ? 'bg-[#121824] text-[#8B95A7] border-[#1E293B] hover:text-[#FF3B30] hover:border-[#FF3B30]/40'
                                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                        }`}
                                      >
                                        {s.is_active !== false ? 'Suspend' : 'Activate'}
                                      </button>
                                      <button
                                        onClick={() => handleResetPassword(s)}
                                        title="Initiate password reset"
                                        className="p-1.5 rounded-lg bg-[#121824] hover:bg-[#192338] border border-[#1E293B] text-[#8B95A7] hover:text-[#B8FF3D] hover:border-[#B8FF3D]/40 transition-colors cursor-pointer"
                                      >
                                        <Key className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: PROVISION STUDENT ACCOUNT FORM */}
              {studentsSubTab === 'create' && (
                <div className="max-w-2xl mx-auto bg-[#0B101D] border border-[#192338] rounded-2xl p-6 space-y-5">
                  <div>
                    <h2 className="text-base font-heading font-black text-[#F5F7FA] flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#B8FF3D]" />
                      <span>Provision Verified Student Account</span>
                    </h2>
                    <p className="text-xs text-[#8B95A7] mt-0.5">
                      Student athletic accounts must be officially provisioned by the Physical Education Department. Public self-registration is closed to maintain verified academic integrity.
                    </p>
                  </div>

                  <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
                    {/* Student Identity Section */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono uppercase text-[#B8FF3D] font-bold tracking-wider pb-1 border-b border-[#1E293B]">
                        STUDENT IDENTITY
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Student Roll Number *</label>
                          <input
                            type="text"
                            required
                            value={newStudentRoll}
                            onChange={(e) => setNewStudentRoll(e.target.value.toUpperCase())}
                            placeholder="e.g. 24A81A0501"
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                          />
                        </div>

                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            placeholder="e.g. V. Deva Harsha"
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Program *</label>
                          <select
                            value={newStudentProgram}
                            onChange={(e) => setNewStudentProgram(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                          >
                            <option value="B.Tech">B.Tech</option>
                            <option value="MBA">MBA</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Department / Branch *</label>
                          <select
                            value={newStudentDept}
                            onChange={(e) => setNewStudentDept(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                          >
                            {newStudentProgram === 'B.Tech' ? (
                              <>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                                <option value="EEE">EEE</option>
                                <option value="AIML">AIML</option>
                                <option value="AIDS">AIDS</option>
                                <option value="CAI">CAI</option>
                                <option value="CST">CST</option>
                              </>
                            ) : (
                              <option value="Management">Management</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Studying Year *</label>
                          <select
                            value={newStudentYear}
                            onChange={(e) => setNewStudentYear(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                          >
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            {newStudentProgram === 'B.Tech' && (
                              <>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Gender *</label>
                          <select
                            value={newStudentGender}
                            onChange={(e) => setNewStudentGender(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                          >
                            <option value="Men">Men</option>
                            <option value="Women">Women</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Mobile / WhatsApp No</label>
                          <input
                            type="tel"
                            value={newStudentPhone}
                            onChange={(e) => setNewStudentPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#8B95A7] font-medium mb-1">College Email ID</label>
                        <input
                          type="email"
                          value={newStudentEmail}
                          onChange={(e) => setNewStudentEmail(e.target.value)}
                          placeholder="e.g. 24A81A0501@srivasaviengg.ac.in"
                          className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                        />
                      </div>

                      {/* Google Email ID Field */}
                      <div>
                        <label className="block text-[#8B95A7] font-medium mb-1">
                          Google Email ID
                        </label>
                        <input
                          type="email"
                          value={newStudentGoogleEmail}
                          onChange={(e) => setNewStudentGoogleEmail(e.target.value)}
                          placeholder="e.g. student@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                        />
                        <span className="text-[10px] text-[#8B95A7] mt-0.5 block">
                          Google account authorized for student login.
                        </span>
                      </div>
                    </div>

                    {/* Account Credentials Section */}
                    <div className="space-y-3 pt-2">
                      <div className="text-[10px] font-mono uppercase text-[#00F0FF] font-bold tracking-wider pb-1 border-b border-[#1E293B]">
                        ACCOUNT CREDENTIALS
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Initial Password</label>
                          <input
                            type="password"
                            value={newStudentPassword}
                            onChange={(e) => setNewStudentPassword(e.target.value)}
                            placeholder="Defaults to Vasavi@<RollNo>"
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Confirm Initial Password</label>
                          <input
                            type="password"
                            value={newStudentConfirmPassword}
                            onChange={(e) => setNewStudentConfirmPassword(e.target.value)}
                            placeholder="Re-enter initial password"
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-[#8B95A7]">
                        Students logging in via password will be required to change their password on first login. Students using Continue with Google bypass password setup securely.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a3eb2d] text-[#070A0F] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>PROVISION VERIFIED STUDENT ACCOUNT</span>
                    </button>
                  </form>
                </div>
              )}

              {/* EDIT STUDENT ACCOUNT MODAL */}
              {editingStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                      <div>
                        <h3 className="text-sm font-heading font-black text-[#F5F7FA]">
                          Edit Student Account
                        </h3>
                        <span className="text-xs font-mono text-[#B8FF3D]">
                          {editingStudent.student_id} • {editingStudent.email}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditingStudent(null)}
                        className="text-[#8B95A7] hover:text-[#F5F7FA] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {editError && (
                      <div className="p-3 rounded-xl bg-[#FF3B30]/15 text-[#FF6B6B] border border-[#FF3B30]/30 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{editError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveStudentEdit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[#8B95A7] font-medium mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Program</label>
                          <select
                            value={editProgram}
                            onChange={(e) => setEditProgram(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                          >
                            <option value="B.Tech">B.Tech</option>
                            <option value="MBA">MBA</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Branch</label>
                          <input
                            type="text"
                            value={editDept}
                            onChange={(e) => setEditDept(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[#8B95A7] font-medium mb-1">Year</label>
                          <select
                            value={editYear}
                            onChange={(e) => setEditYear(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none"
                          >
                            <option value="1st">1st Year</option>
                            <option value="2nd">2nd Year</option>
                            <option value="3rd">3rd Year</option>
                            <option value="4th">4th Year</option>
                          </select>
                        </div>
                      </div>

                      {/* Google Email ID Field */}
                      <div>
                        <label className="block text-[#8B95A7] font-medium mb-1">
                          Authorized Google Email ID
                        </label>
                        <input
                          type="email"
                          value={editGoogleEmail}
                          onChange={(e) => setEditGoogleEmail(e.target.value)}
                          placeholder="e.g. student@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs font-mono text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                        />
                        <span className="text-[10px] text-[#8B95A7] mt-0.5 block">
                          Google account authorized for student login. Clear field to unlink.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[#8B95A7] font-medium mb-1">Account Status</label>
                        <div className="flex items-center gap-3 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="student_active_status"
                              checked={editIsActive === true}
                              onChange={() => setEditIsActive(true)}
                              className="accent-[#B8FF3D]"
                            />
                            <span className="text-emerald-400 font-bold">Active</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="student_active_status"
                              checked={editIsActive === false}
                              onChange={() => setEditIsActive(false)}
                              className="accent-[#FF3B30]"
                            />
                            <span className="text-rose-400 font-bold">Inactive / Suspended</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1E293B]">
                        <button
                          type="button"
                          onClick={() => setEditingStudent(null)}
                          className="px-3 py-2 rounded-xl bg-[#121824] text-[#8B95A7] hover:text-[#F5F7FA] text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editSaving}
                          className="px-4 py-2 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-bold text-xs cursor-pointer hover:bg-[#a3eb2d] disabled:opacity-50"
                        >
                          {editSaving ? 'Saving Changes...' : 'Save Student Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* PANEL 6: SPORTS & FACILITIES */}
          {activePanel === 'sports' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-heading font-black text-[#F5F7FA]">Sports & Athletic Facilities</h2>
                <p className="text-xs text-[#8B95A7]">The 20 official SVEC sports offerings, rules and equipment specifications.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {[
                  'Shuttle Badminton', 'Kho-Kho', 'Yoga', 'Basketball', 'Handball',
                  'Netball', 'Fencing', 'Taekwondo', 'Self-Defence', 'Table Tennis',
                  'Ball Badminton', 'Chess', 'Cricket', 'Volleyball', 'Kabaddi',
                  'Football', 'Athletics', 'Archery', 'Gymnasium', 'Open Gym'
                ].map((sport, i) => (
                  <div key={i} className="bg-[#0B101D] border border-[#192338] rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#080D16] border border-[#1E293B] flex items-center justify-center text-[#B8FF3D] shrink-0 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-[#F5F7FA]">{sport}</div>
                      <div className="text-[10px] text-[#64748B]">Official SVEC Discipline</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PANEL 7: EVENTS & CALENDAR */}
          {activePanel === 'events' && (
            <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-heading font-black text-[#F5F7FA]">Master Athletic Events Schedule</h2>
              <p className="text-xs text-[#8B95A7]">Collegiate athletic events, tournament rounds, and varsity trials fixtures.</p>
              <div className="p-8 text-center text-xs text-[#64748B]">
                Calendar fixtures are synchronized with selection trials and campus tournaments.
              </div>
            </div>
          )}

          {/* PANEL 8: RANKINGS & CAMPUS CUP */}
          {activePanel === 'rankings' && (
            <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-heading font-black text-[#F5F7FA]">Campus Cup Points Standings</h2>
              <p className="text-xs text-[#8B95A7]">Departmental and hostel leaderboard points ledger.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-[#080D16] border border-[#1E293B] text-center">
                  <div className="text-xl font-black text-[#B8FF3D]">CSE</div>
                  <div className="text-xs text-[#8B95A7]">100 Pts • Gold</div>
                </div>
                <div className="p-4 rounded-xl bg-[#080D16] border border-[#1E293B] text-center">
                  <div className="text-xl font-black text-[#CBD5E1]">MECH</div>
                  <div className="text-xs text-[#8B95A7]">100 Pts • Gold</div>
                </div>
                <div className="p-4 rounded-xl bg-[#080D16] border border-[#1E293B] text-center">
                  <div className="text-xl font-black text-[#CBD5E1]">ECE</div>
                  <div className="text-xs text-[#8B95A7]">60 Pts • Silver</div>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 9: AUDIT LOGS */}
          {activePanel === 'audit' && (
            <div className="bg-[#0B101D] border border-[#192338] rounded-2xl p-5 space-y-3">
              <h2 className="text-base font-heading font-black text-[#F5F7FA]">Security & Operations Audit Trail</h2>
              <p className="text-xs text-[#8B95A7]">Immutable log of attendance check-ins, evaluation updates, and certificate issuances.</p>
              <div className="p-8 text-center text-xs text-[#64748B]">
                All administrative operations are cryptographically verified and recorded.
              </div>
            </div>
          )}

          {/* PANEL 10: ACCOUNT & SECURITY SETTINGS */}
          {activePanel === 'account' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
                <div>
                  <div className="text-[10px] font-black tracking-widest text-[#00F0FF] uppercase flex items-center gap-1.5">
                    <Key className="w-3 h-3" />
                    <span>FACULTY CREDENTIALS & SECURITY</span>
                  </div>
                  <h1 className="text-2xl font-heading font-black text-[#F5F7FA] tracking-tight">
                    Account & Security Settings
                  </h1>
                  <p className="text-xs text-[#8B95A7] mt-0.5">
                    Manage your username, official coach credentials, and authentication password.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                    Coach & Sports Administrator
                  </span>
                </div>
              </div>

              {/* Feedback Alert Banner */}
              {accountFeedback && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
                  accountFeedback.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#FF3B30]/15 border-[#FF3B30]/30 text-[#FF6B6B]'
                }`}>
                  {accountFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-[#FF3B30]" />
                  )}
                  <div className="text-xs font-medium">
                    {accountFeedback.message}
                  </div>
                  <button 
                    onClick={() => setAccountFeedback(null)}
                    className="ml-auto text-xs text-[#8B95A7] hover:text-[#F5F7FA] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* CARD 1: USERNAME & PROFILE DETAILS */}
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#161F30]">
                    <div className="w-9 h-9 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] flex items-center justify-center font-bold">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-heading font-black text-[#F5F7FA]">
                        Username & Faculty Identity
                      </h2>
                      <p className="text-[11px] text-[#8B95A7]">
                        Change your display name and registered email address
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                        Username / Full Name
                      </label>
                      <input
                        type="text"
                        value={accountFullName}
                        onChange={(e) => setAccountFullName(e.target.value)}
                        placeholder="e.g., Coach & Sports Administrator"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F0FF] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        placeholder="e.g., coach.cricket@svec.ac.in"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#00F0FF] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                          Assigned Department
                        </label>
                        <div className="px-3 py-2 rounded-xl bg-[#080D16]/50 border border-[#1E293B] text-xs text-[#8B95A7]">
                          Physical Education
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#64748B] mb-1">
                          System Authority
                        </label>
                        <div className="px-3 py-2 rounded-xl bg-[#080D16]/50 border border-[#1E293B] text-xs text-[#00F0FF] font-medium">
                          Full Sports Admin
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={accountUpdating}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#00F0FF] hover:bg-[#00d6e6] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-[#00F0FF]/20 disabled:opacity-50 mt-2"
                    >
                      {accountUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>

                {/* CARD 2: PASSWORD & AUTHENTICATION */}
                <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#161F30]">
                    <div className="w-9 h-9 rounded-xl bg-[#B8FF3D]/15 text-[#B8FF3D] flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-heading font-black text-[#F5F7FA]">
                        Change Account Password
                      </h2>
                      <p className="text-[11px] text-[#8B95A7]">
                        Set a new password for coach and sports administration access
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-[#CBD5E1]">
                          New Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] text-[#8B95A7] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                        >
                          {showPassword ? 'Hide Password' : 'Show Password'}
                        </button>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={accountNewPassword}
                        onChange={(e) => setAccountNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#CBD5E1] mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={accountConfirmPassword}
                        onChange={(e) => setAccountConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D] transition-colors"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B] text-[11px] text-[#8B95A7] space-y-1">
                      <div className="font-semibold text-[#CBD5E1]">Security Guidance:</div>
                      <div>• Password applies immediately to future logins.</div>
                      <div>• All coaches share administrative powers across selection trials, tournaments, and attendance gates.</div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordUpdating}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-[#B8FF3D]/20 disabled:opacity-50 mt-2"
                    >
                      {passwordUpdating ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>

              </div>

              {/* CARD 3: UNIFIED ROLE & SYSTEM PERMISSIONS BANNER */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#00F0FF]/10 via-[#0B101D] to-[#B8FF3D]/10 border border-[#1E293B] space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                  <span className="font-heading font-black text-xs text-[#F5F7FA] uppercase tracking-wider">
                    Single Unified Role: Faculty Coach & Sports Administrator
                  </span>
                </div>
                <p className="text-xs text-[#8B95A7] leading-relaxed">
                  In accordance with department policies, faculty coaches independently handle all administration tasks without requiring a separate administrative layer. Coaches possess full credentials to schedule selection trials, verify student athlete ID card QR scans, record evaluation ratings, publish final rosters, and issue verifiable digital certificates.
                </p>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==================================================================== */}
      {/* 4. MODALS (Evaluate Modal & Evaluation History Modal)                */}
      {/* ==================================================================== */}

      {/* Modal: Record Athlete Evaluation */}
      {evalModalReg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0B101D] border border-[#192338] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#161F30]">
              <div>
                <h3 className="font-heading font-black text-sm text-[#F5F7FA]">
                  Evaluate Athlete
                </h3>
                <p className="text-xs text-[#8B95A7]">
                  {evalModalReg.student_name} ({evalModalReg.roll_no})
                </p>
              </div>
              <button 
                onClick={() => setEvalModalReg(null)}
                className="p-1 rounded-lg text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8B95A7] font-medium mb-1">Decision Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvalDecision('selected')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      evalDecision === 'selected'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-[#080D16] text-[#8B95A7] border-[#1E293B]'
                    }`}
                  >
                    Select
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalDecision('standby')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      evalDecision === 'standby'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                        : 'bg-[#080D16] text-[#8B95A7] border-[#1E293B]'
                    }`}
                  >
                    Standby
                  </button>

                  <button
                    type="button"
                    onClick={() => setEvalDecision('not_selected')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      evalDecision === 'not_selected'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : 'bg-[#080D16] text-[#8B95A7] border-[#1E293B]'
                    }`}
                  >
                    Not Selected
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#8B95A7] font-medium mb-1">
                  Overall Score: {evalScore}/100
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={evalScore}
                  onChange={(e) => setEvalScore(Number(e.target.value))}
                  className="w-full accent-[#B8FF3D] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[#8B95A7] font-medium mb-1">Evaluation Notes</label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="Technical assessment, fitness level, game awareness..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080D16] border border-[#1E293B] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#B8FF3D]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvalModalReg(null)}
                  className="flex-1 py-2 rounded-xl bg-[#080D16] hover:bg-[#151D2D] border border-[#1E293B] text-[#8B95A7] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={evaluating}
                  className="flex-1 py-2 rounded-xl bg-[#B8FF3D] hover:bg-[#a3eb2d] disabled:opacity-50 text-[#070A0F] text-xs font-bold cursor-pointer"
                >
                  {evaluating ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Evaluation Audit History */}
      {historyModalReg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0B101D] border border-[#192338] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#161F30]">
              <div>
                <h3 className="font-heading font-black text-sm text-[#F5F7FA]">
                  Evaluation Audit Trail
                </h3>
                <p className="text-xs text-[#8B95A7]">
                  {historyModalReg.student_name} ({historyModalReg.roll_no})
                </p>
              </div>
              <button 
                onClick={() => setHistoryModalReg(null)}
                className="p-1 rounded-lg text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 text-xs no-scrollbar">
              {loadingHistory ? (
                <div className="py-8 text-center text-[#8B95A7]">Loading audit history...</div>
              ) : historyLogs.length === 0 ? (
                <div className="py-8 text-center text-[#64748B]">No evaluation log entries recorded yet.</div>
              ) : (
                historyLogs.map((log, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#080D16] border border-[#1E293B] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wide text-[#B8FF3D]">
                        {log.new_evaluation ? log.new_evaluation.replace('_', ' ') : log.action.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-[#CBD5E1] text-xs">{log.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setHistoryModalReg(null)}
              className="w-full py-2 rounded-xl bg-[#080D16] hover:bg-[#151D2D] border border-[#1E293B] text-xs font-semibold text-[#CBD5E1] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
