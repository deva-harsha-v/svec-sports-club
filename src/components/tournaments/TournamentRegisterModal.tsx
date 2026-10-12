import React, { useState } from 'react';
import { Tournament } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useSportsClub } from '../../context/SportsClubContext';
import { X, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TournamentRegisterModalProps {
  isOpen: boolean;
  tournament: Tournament | null;
  onClose: () => void;
  onOpenTeamBuilder: () => void;
}

export const TournamentRegisterModal: React.FC<TournamentRegisterModalProps> = ({
  isOpen,
  tournament,
  onClose,
  onOpenTeamBuilder
}) => {
  const { currentUser, role } = useAuth();
  const { registerParticipant } = useSportsClub();

  const [regType, setRegType] = useState<'individual' | 'team'>('individual');
  const [successResult, setSuccessResult] = useState<{ token: string; title: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !tournament) return null;

  const isTeamSport = tournament.min_team_size > 1;

  const handleRegisterSolo = async () => {
    setIsSubmitting(true);
    try {
      const reg = await registerParticipant({
        tournament_id: tournament.id,
        tournament_title: tournament.title,
        sport_name: tournament.sport_name,
        profile_id: currentUser?.id || 'usr_athlete_01',
        profile_name: currentUser?.full_name || 'Athlete',
        registration_type: 'individual',
        status: 'approved'
      });

      setSuccessResult({
        token: reg.qr_code_token,
        title: tournament.title
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0F]/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0B0F17] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8B95A7] hover:text-[#F5F7FA] hover:bg-[#121824]"
        >
          <X className="w-5 h-5" />
        </button>

        {successResult ? (
          /* Confirmation Screen with scannable QR badge */
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B8FF3D]/20 text-[#B8FF3D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#B8FF3D]">
                REGISTRATION CONFIRMED
              </span>
              <h3 className="text-2xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-1">
                {successResult.title}
              </h3>
              <p className="text-xs text-[#8B95A7] mt-1">
                Your athlete credentials have been verified and seeded. Present this digital pass at the venue entrance.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-xl inline-block shadow-xl my-2">
              <QRCodeSVG
                value={successResult.token}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="text-xs font-mono text-[#8B95A7]">
              PASS TOKEN: <span className="text-[#F5F7FA] font-bold">{successResult.token}</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-[#B8FF3D] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow mt-4"
            >
              Done & Return to Hub
            </button>
          </div>
        ) : (
          /* Registration Form & Eligibility Overview */
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-[#B8FF3D]">
                <ShieldCheck className="w-4 h-4" />
                OFFICIAL ENTRY PORTAL
              </div>
              <h3 className="text-2xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-1">
                {tournament.title}
              </h3>
              <p className="text-xs text-[#8B95A7] mt-1 font-mono">
                Deadline: {new Date(tournament.registration_deadline).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Athlete Verification Details */}
            <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] space-y-2">
              <div className="text-[11px] font-mono uppercase text-[#8B95A7]">
                Authenticated Athlete Identity:
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#F5F7FA] font-bold">{currentUser?.full_name || 'Authenticated Student'}</span>
                <span className="text-[#B8FF3D]">{currentUser?.student_id || 'ID Pending'}</span>
              </div>
              <div className="text-[11px] text-[#8B95A7] font-mono">
                {[currentUser?.program, currentUser?.department, currentUser?.year].filter(Boolean).join(' • ') || 'Institutional Profile Verified'}
              </div>
            </div>

            {/* Choice: Team vs Solo */}
            {isTeamSport ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#070A0F] border border-[#1E293B] text-xs font-mono space-y-2">
                  <span className="text-[#B8FF3D] font-bold uppercase block">
                    Team Sport Format ({tournament.min_team_size} - {tournament.max_team_size} Players)
                  </span>
                  <p className="text-[#8B95A7]">
                    This tournament requires a full squad registration. If you are captaining a squad, click below to build your roster and assign jersey numbers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTeamBuilder();
                  }}
                  className="w-full py-3 rounded-lg bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
                >
                  Launch Captain Squad Builder →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#070A0F] border border-[#1E293B] text-xs font-mono space-y-1">
                  <span className="text-[#B8FF3D] font-bold uppercase block">
                    Individual Entry Confirmed
                  </span>
                  <p className="text-[#8B95A7]">
                    You are registering as an individual competitor. Your department and points will be credited to the Campus Sports Cup.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRegisterSolo}
                  className="w-full py-3 rounded-lg bg-[#B8FF3D] hover:bg-[#a6ed28] disabled:opacity-50 text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
                >
                  {isSubmitting ? 'Confirming Entry...' : 'Confirm Registration & Issue Pass'}
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
