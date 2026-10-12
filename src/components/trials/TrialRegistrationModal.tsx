import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SelectionTrial, SelectionTrialSession } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { selectionTrialsApi } from '../../lib/api/selectionTrials';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ExternalLink, 
  FileText, 
  User, 
  IdCard, 
  Phone, 
  Building, 
  GraduationCap
} from 'lucide-react';

interface TrialRegistrationModalProps {
  trial: SelectionTrial;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TrialRegistrationModal: React.FC<TrialRegistrationModalProps> = ({
  trial,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, role } = useAuth();

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [previousParticipation, setPreviousParticipation] = useState<string>('');
  const [whatsappConfirmed, setWhatsappConfirmed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    registrationId: string;
    qrToken: string;
    sessionTitle: string;
  } | null>(null);

  // Check if profile is complete
  const isProfileComplete = Boolean(
    currentUser &&
    currentUser.student_id &&
    currentUser.gender &&
    currentUser.program &&
    currentUser.department &&
    currentUser.year &&
    currentUser.phone
  );

  // Filter eligible sessions for this authenticated user
  const eligibleSessions = (trial.sessions || []).filter(session => {
    if (!currentUser || !isProfileComplete) return true; // Show all until filtered
    if (!session.eligibility || session.eligibility.length === 0) return true;

    return session.eligibility.some(rule => {
      // Program check
      if (rule.program !== currentUser.program) return false;
      // Gender check
      if (rule.gender !== 'all' && rule.gender.toLowerCase() !== currentUser.gender?.toLowerCase()) return false;
      // Year check (if specified in rule)
      if (rule.year && rule.year !== currentUser.year) return false;
      // Branch check (if specified in rule)
      if (rule.branch && rule.branch !== currentUser.department) return false;
      return true;
    });
  });

  // Default to the first eligible session
  useEffect(() => {
    if (eligibleSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(eligibleSessions[0].id);
    }
  }, [eligibleSessions, selectedSessionId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setErrorMessage('Please sign in with your student account to register for trials.');
      return;
    }

    if (!isProfileComplete) {
      setErrorMessage('Please complete all academic profile fields (Roll No, Program, Branch, Year, Gender, Phone) before registering.');
      return;
    }

    if (!selectedSessionId) {
      setErrorMessage('Please select an eligible session for your year and gender.');
      return;
    }

    if (!whatsappConfirmed) {
      setErrorMessage('Mandatory requirement: You must confirm joining the official Vasavi Sports Activities WhatsApp Channel.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await selectionTrialsApi.registerForTrial({
        trialId: trial.id,
        sessionId: selectedSessionId,
        previousParticipation: previousParticipation.trim(),
        whatsappConfirmation: true
      });

      const chosenSession = trial.sessions?.find(s => s.id === selectedSessionId);

      setRegistrationSuccess({
        registrationId: res.registration_id,
        qrToken: res.qr_token,
        sessionTitle: chosenSession?.session_title || 'Selection Trial Session'
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check eligibility requirements or deadline.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatIstTime = (isoTime: string) => {
    return new Date(isoTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatIstDate = (isoTime: string) => {
    return new Date(isoTime).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0F]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Strip */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#121824]/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#B8FF3D]/10 text-[#B8FF3D] border border-[#B8FF3D]/20">
                Official Selection Trial
              </span>
              <span className="text-xs font-mono text-[#8B95A7]">
                Ref: {trial.circular_ref}
              </span>
            </div>
            <h2 className="font-heading font-black text-lg text-[#F5F7FA] mt-1 tracking-tight">
              {trial.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* Success Screen */}
          {registrationSuccess ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#B8FF3D]/15 text-[#B8FF3D] border border-[#B8FF3D]/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="font-heading font-black text-2xl text-[#F5F7FA]">
                  REGISTRATION CONFIRMED
                </h3>
                <p className="text-sm text-[#8B95A7] mt-1">
                  You are registered for {registrationSuccess.sessionTitle}
                </p>
              </div>

              {/* QR Pass Card */}
              <div className="max-w-xs mx-auto p-5 rounded-xl bg-[#121824] border border-[#1E293B] text-center space-y-3">
                <div className="bg-white p-3 rounded-lg inline-block shadow-inner">
                  <QRCodeSVG value={registrationSuccess.qrToken} size={150} level="H" />
                </div>
                <div className="font-mono text-xs text-[#8B95A7]">
                  Athlete Pass: <span className="text-[#F5F7FA] font-bold">{currentUser?.student_id}</span>
                </div>
                <div className="text-[11px] text-[#B8FF3D] font-mono uppercase tracking-wider bg-[#B8FF3D]/10 py-1 rounded">
                  Present to coach at trial venue
                </div>
              </div>

              {/* Official Instructions Callout */}
              <div className="text-left p-4 rounded-xl bg-[#1E293B]/40 border border-[#1E293B] space-y-2 text-xs text-[#CBD5E1]">
                <div className="font-bold text-[#F5F7FA] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#FFB800]" />
                  <span>Mandatory Instructions for Trial Day:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#8B95A7]">
                  <li>Candidate must carry official SVEC college ID card.</li>
                  <li>Players must wear sports shoes.</li>
                  <li>Candidate must bring their own sports kit.</li>
                  <li>Report 15 minutes before the session start time.</li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#B8FF3D] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider hover:bg-[#a5f024] transition-all cursor-pointer"
              >
                Close Pass
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Official Notice Alert Box */}
              <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B8FF3D]">
                    <FileText className="w-4 h-4" />
                    <span>Official Circular Guidelines</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8B95A7]">
                    Dated: {new Date(trial.circular_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {trial.instructions}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#8B95A7] border-t border-[#1E293B]/60">
                  <span>Deadline: <strong className="text-[#FFB800]">{new Date(trial.registration_deadline_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                  <span>Venue: <strong className="text-[#F5F7FA]">{trial.venue_name || 'Venue to be announced'}</strong></span>
                  <a 
                    href={trial.official_registration_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-[#B8FF3D] hover:underline"
                  >
                    <span>Official Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Identity Verification Section (Authenticated & Read-Only) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#F5F7FA] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#B8FF3D]" />
                    <span>Verified Student Academic Identity</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[#8B95A7]">From Authenticated Profile</span>
                </div>

                {!currentUser ? (
                  <div className="p-4 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-xs text-[#FF3B30]">
                    You are not signed in. Please log in with your SVEC student credentials to proceed.
                  </div>
                ) : !isProfileComplete ? (
                  <div className="p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 text-xs text-[#FFB800] space-y-2">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Incomplete Academic Profile
                    </p>
                    <p className="text-[#8B95A7]">
                      Your profile is missing academic fields required for official trials (Roll No, Program, Branch, Year, Gender, Phone). Please complete your profile.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#121824]/60 border border-[#1E293B] text-xs">
                    <div>
                      <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Name</div>
                      <div className="font-semibold text-[#F5F7FA] truncate">{currentUser.full_name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Roll Number</div>
                      <div className="font-mono font-bold text-[#B8FF3D]">{currentUser.student_id}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Program & Branch</div>
                      <div className="font-semibold text-[#F5F7FA]">{currentUser.program} - {currentUser.department}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Studying Year</div>
                      <div className="font-semibold text-[#F5F7FA]">{currentUser.year} Year</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Gender</div>
                      <div className="font-semibold text-[#F5F7FA]">{currentUser.gender}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#8B95A7] uppercase">Phone</div>
                      <div className="font-mono text-[#CBD5E1]">{currentUser.phone}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Session Selector */}
              <div className="space-y-3">
                <label className="block font-heading font-bold text-xs uppercase tracking-wider text-[#F5F7FA]">
                  Select Trial Session *
                </label>

                {eligibleSessions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] text-xs text-[#8B95A7]">
                    No sessions in this trial match your program ({currentUser?.program}), year ({currentUser?.year}), or gender ({currentUser?.gender}).
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eligibleSessions.map(session => (
                      <label
                        key={session.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedSessionId === session.id
                            ? 'bg-[#B8FF3D]/10 border-[#B8FF3D] text-[#F5F7FA]'
                            : 'bg-[#121824]/50 border-[#1E293B] text-[#8B95A7] hover:border-[#1E293B]/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="trial_session"
                          value={session.id}
                          checked={selectedSessionId === session.id}
                          onChange={() => setSelectedSessionId(session.id)}
                          className="mt-1 accent-[#B8FF3D]"
                        />
                        <div className="flex-1 text-xs">
                          <div className="font-bold text-[#F5F7FA]">{session.session_title}</div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-[11px] text-[#8B95A7]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#B8FF3D]" />
                              {formatIstDate(session.start_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#B8FF3D]" />
                              {formatIstTime(session.start_time)} – {formatIstTime(session.end_time)} IST
                            </span>
                          </div>
                          {session.session_notes && (
                            <div className="mt-1 text-[11px] text-[#CBD5E1]/80 italic">
                              {session.session_notes}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Previous Participation Events Field */}
              <div className="space-y-1.5">
                <label className="block font-heading font-bold text-xs uppercase tracking-wider text-[#F5F7FA]">
                  Previous Participation Events (JNTUK or Tournaments)
                </label>
                <textarea
                  rows={2}
                  value={previousParticipation}
                  onChange={(e) => setPreviousParticipation(e.target.value)}
                  placeholder="e.g. Represented college at JNTUK inter-collegiate meet 2025, or district tournament participant (optional)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121824] border border-[#1E293B] text-xs text-[#F5F7FA] placeholder-[#8B95A7]/60 focus:outline-none focus:border-[#B8FF3D]"
                />
              </div>

              {/* Mandatory WhatsApp Confirmation Requirement */}
              <div className="p-3.5 rounded-xl bg-[#121824]/90 border border-[#1E293B] space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappConfirmed}
                    onChange={(e) => setWhatsappConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#B8FF3D] w-4 h-4 cursor-pointer"
                  />
                  <div className="text-xs text-[#CBD5E1] leading-relaxed">
                    <span className="font-bold text-[#F5F7FA]">
                      I confirm that I have joined the official Vasavi Sports Activities WhatsApp Channel. *
                    </span>
                    <p className="text-[11px] text-[#8B95A7] mt-0.5">
                      All official selection trial timings, reporting updates, and weather notices will be communicated directly through the official SVEC WhatsApp channel.
                    </p>
                  </div>
                </label>
                {trial.whatsapp_channel_url && (
                  <div className="pl-7 pt-1">
                    <a
                      href={trial.whatsapp_channel_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#B8FF3D] hover:underline font-mono"
                    >
                      <span>Join SVEC Sports Channel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#FF3B30]/15 border border-[#FF3B30]/30 text-xs text-[#FF3B30] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#121824] border border-[#1E293B] text-xs font-mono uppercase tracking-wider text-[#8B95A7] hover:text-[#F5F7FA] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !currentUser || !isProfileComplete || eligibleSessions.length === 0}
                  className="flex-2 py-3 rounded-xl bg-[#B8FF3D] hover:bg-[#a5f024] disabled:opacity-50 disabled:cursor-not-allowed text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#B8FF3D]/10"
                >
                  {submitting ? 'Submitting Registration...' : 'Submit Trial Registration'}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
