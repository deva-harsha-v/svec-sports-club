import React, { useState, useEffect } from 'react';
import { selectionTrialsApi } from '../lib/api/selectionTrials';
import { SelectionTrial, PublishedSelectionResult } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { TrialRegistrationModal } from '../components/trials/TrialRegistrationModal';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Search, 
  Filter 
} from 'lucide-react';

export const SelectionTrialsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [trials, setTrials] = useState<SelectionTrial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'results'>('all');
  const [selectedTrialForRegistration, setSelectedTrialForRegistration] = useState<SelectionTrial | null>(null);

  // Published results state
  const [publishedResults, setPublishedResults] = useState<PublishedSelectionResult[]>([]);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);

  const fetchTrials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await selectionTrialsApi.getPublicTrials();
      setTrials(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load selection trials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoadingResults(true);
      const data = await selectionTrialsApi.getPublishedResults();
      setPublishedResults(data);
    } catch (err) {
      console.warn('Failed to load published selection results');
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    fetchTrials();
    fetchResults();
  }, []);

  const formatIstDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatIstTime = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registration_open':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#B8FF3D]/15 text-[#B8FF3D] border border-[#B8FF3D]/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF3D] animate-ping" />
            Registration Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800] animate-pulse" />
            Trials In Progress
          </span>
        );
      case 'registration_closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#8B95A7]/15 text-[#CBD5E1] border border-[#8B95A7]/30 font-bold">
            Registration Closed
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#1E293B] text-[#8B95A7] border border-[#1E293B]">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#121824] text-[#8B95A7] border border-[#1E293B]">
            {status}
          </span>
        );
    }
  };

  const filteredTrials = trials.filter(t => {
    if (activeTab === 'open') return t.computed_status === 'registration_open';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#F5F7FA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Hero Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0B0F17] via-[#121824] to-[#0B0F17] border border-[#1E293B] p-6 sm:p-10 overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8FF3D]/10 border border-[#B8FF3D]/30 text-[#B8FF3D] font-mono text-xs uppercase tracking-wider">
              <img src="/svec-logo.png" alt="SVEC Logo" className="w-4 h-4 object-contain" />
              <span>Sri Vasavi Engineering College Athletics</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-tight text-[#F5F7FA]">
              OFFICIAL SELECTION TRIALS
            </h1>
            <p className="text-sm sm:text-base text-[#8B95A7] leading-relaxed">
              Official collegiate athletic trials for varsity teams. Valid for B.Tech & MBA students. All selections are conducted under Physical Education Department regulations.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#B8FF3D]/5 to-transparent pointer-events-none" />
        </div>

        {/* Circulars Reference Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#121824] border border-[#1E293B] flex items-center justify-center shrink-0 text-[#B8FF3D]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8B95A7]">Ref: SVEC/Admn./SJ/Circular/2026-27/117</span>
                <span className="text-[10px] font-mono text-[#8B95A7]">28-09-2026</span>
              </div>
              <h3 className="font-heading font-bold text-sm text-[#F5F7FA]">
                Cricket (Men) Selection Trials
              </h3>
              <p className="text-xs text-[#8B95A7]">
                Applicable for B.Tech 2nd, 3rd, 4th Year & MBA Men students.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="font-mono text-[#FFB800] text-[11px]">Deadline: 04-10-2026</span>
                <a 
                  href="https://tinyurl.com/3d73phrv" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#B8FF3D] hover:underline font-mono text-[11px]"
                >
                  <span>Official Form</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E293B] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#121824] border border-[#1E293B] flex items-center justify-center shrink-0 text-[#B8FF3D]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8B95A7]">Ref: SVEC/Admn./SJ/Circular/2026-27/118</span>
                <span className="text-[10px] font-mono text-[#8B95A7]">30-09-2026</span>
              </div>
              <h3 className="font-heading font-bold text-sm text-[#F5F7FA]">
                Table Tennis & Volleyball (Men & Women)
              </h3>
              <p className="text-xs text-[#8B95A7]">
                Applicable for all B.Tech and MBA students across all studying years.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="font-mono text-[#FFB800] text-[11px]">Deadline: 06-10-2026</span>
                <a 
                  href="https://tinyurl.com/2j9srhnc" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#B8FF3D] hover:underline font-mono text-[11px]"
                >
                  <span>Official Form</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#B8FF3D] text-[#070A0F]'
                  : 'bg-[#0B0F17] text-[#8B95A7] hover:text-[#F5F7FA] border border-[#1E293B]'
              }`}
            >
              All Trials ({trials.length})
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'open'
                  ? 'bg-[#B8FF3D] text-[#070A0F]'
                  : 'bg-[#0B0F17] text-[#8B95A7] hover:text-[#F5F7FA] border border-[#1E293B]'
              }`}
            >
              Registration Open ({trials.filter(t => t.computed_status === 'registration_open').length})
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'results'
                  ? 'bg-[#B8FF3D] text-[#070A0F]'
                  : 'bg-[#0B0F17] text-[#8B95A7] hover:text-[#F5F7FA] border border-[#1E293B]'
              }`}
            >
              Selected Teams ({publishedResults.length})
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <CardSkeleton count={3} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTrials} />
        ) : activeTab === 'results' ? (
          /* Published Selected Roster View */
          publishedResults.length === 0 ? (
            <EmptyState
              title="No Team Selections Published Yet"
              description="Official selection rosters will appear here once finalized by the Physical Education Department and approved by the Director."
            />
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#1E293B]">
                <h3 className="font-heading font-black text-lg text-[#F5F7FA] mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#B8FF3D]" />
                  <span>Officially Selected Athletes</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-[#8B95A7] font-mono uppercase">
                        <th className="py-3 px-4">Athlete Name</th>
                        <th className="py-3 px-4">Trial / Event</th>
                        <th className="py-3 px-4">Program & Branch</th>
                        <th className="py-3 px-4">Studying Year</th>
                        <th className="py-3 px-4">Selection Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60">
                      {publishedResults.map(res => (
                        <tr key={res.id} className="hover:bg-[#121824]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#F5F7FA]">{res.student_name}</td>
                          <td className="py-3.5 px-4 text-[#CBD5E1]">{res.trial_title}</td>
                          <td className="py-3.5 px-4 font-mono text-[#8B95A7]">{res.program} - {res.branch}</td>
                          <td className="py-3.5 px-4 font-mono text-[#8B95A7]">{res.year} Year</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              res.evaluation_status === 'selected'
                                ? 'bg-[#B8FF3D]/15 text-[#B8FF3D] border border-[#B8FF3D]/30'
                                : 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30'
                            }`}>
                              {res.evaluation_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        ) : filteredTrials.length === 0 ? (
          <EmptyState
            title="No Selection Trials Found"
            description="There are currently no active selection trials matching your filter criteria. Check back for upcoming athletic circulars."
          />
        ) : (
          /* Trials Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTrials.map(trial => (
              <div 
                key={trial.id}
                className="rounded-2xl bg-[#0B0F17] border border-[#1E293B] hover:border-[#1E293B]/90 transition-all p-6 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#8B95A7]">
                          Ref: {trial.circular_ref}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121824] border border-[#1E293B] uppercase text-[#CBD5E1]">
                          {trial.gender_scope === 'all' ? 'Men & Women' : trial.gender_scope}
                        </span>
                      </div>
                      <h3 className="font-heading font-black text-xl text-[#F5F7FA] tracking-tight">
                        {trial.title}
                      </h3>
                    </div>
                    {getStatusBadge(trial.computed_status)}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8B95A7] pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B8FF3D]" />
                      Deadline: <strong className="text-[#FFB800]">{formatIstDate(trial.registration_deadline_date)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B8FF3D]" />
                      Venue: <strong className="text-[#F5F7FA]">{trial.venue_name || 'Venue to be announced'}</strong>
                    </span>
                  </div>

                  {/* Instructions Summary */}
                  <div className="p-3.5 rounded-xl bg-[#121824]/60 border border-[#1E293B]/70 text-xs text-[#CBD5E1] space-y-1">
                    <div className="font-bold text-[#F5F7FA] flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FFB800]" />
                      Instructions:
                    </div>
                    <p className="text-[11px] text-[#8B95A7] leading-relaxed">
                      {trial.instructions}
                    </p>
                  </div>

                  {/* Official Session Schedule Breakdown */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#8B95A7]">
                      Scheduled Trial Sessions ({trial.sessions?.length || 0}):
                    </div>
                    <div className="space-y-1.5">
                      {(trial.sessions || []).map(session => (
                        <div 
                          key={session.id}
                          className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-[#121824]/40 border border-[#1E293B]/40 text-xs gap-2"
                        >
                          <span className="font-bold text-[#F5F7FA]">{session.session_title}</span>
                          <span className="font-mono text-[11px] text-[#B8FF3D] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatIstDate(session.start_time)} · {formatIstTime(session.start_time)}–{formatIstTime(session.end_time)} IST
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#1E293B] flex items-center gap-3">
                  {trial.computed_status === 'registration_open' ? (
                    <button
                      onClick={() => setSelectedTrialForRegistration(trial)}
                      className="flex-1 py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a5f024] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#B8FF3D]/10"
                    >
                      Register for Trials
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2.5 rounded-xl bg-[#121824] border border-[#1E293B] text-[#8B95A7] font-mono text-xs uppercase tracking-wider cursor-not-allowed"
                    >
                      {trial.computed_status === 'in_progress' ? 'Trials Underway' : 'Registration Closed'}
                    </button>
                  )}

                  <a
                    href={trial.official_registration_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#121824] hover:bg-[#1A2234] border border-[#1E293B] hover:border-[#B8FF3D]/40 text-xs font-mono text-[#CBD5E1] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="View Original Google Form Circular Link"
                  >
                    <span>Circular Link</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#B8FF3D]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Registration Modal */}
        {selectedTrialForRegistration && (
          <TrialRegistrationModal
            trial={selectedTrialForRegistration}
            isOpen={Boolean(selectedTrialForRegistration)}
            onClose={() => setSelectedTrialForRegistration(null)}
            onSuccess={() => {
              fetchTrials();
            }}
          />
        )}

      </div>
    </div>
  );
};
