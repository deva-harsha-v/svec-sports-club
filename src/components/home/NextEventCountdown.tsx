import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSportsClub } from '../../context/SportsClubContext';
import { useTheme } from '../../context/ThemeContext';
import { Clock, MapPin, Trophy, ArrowRight } from 'lucide-react';

export const NextEventCountdown: React.FC = () => {
  const { matches, tournaments } = useSportsClub();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Find next upcoming match or live match
  const liveMatch = matches.find(m => m.status === 'live');
  const nextMatch = matches.find(m => m.status === 'scheduled');
  const targetMatch = nextMatch || liveMatch || matches[0];
  const tournament = tournaments.find(t => t.id === targetMatch?.tournament_id) || tournaments[0];

  const targetDate = targetMatch ? new Date(targetMatch.start_time).getTime() : Date.now() + 86400000;

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = targetDate - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetMatch) return null;

  return (
    <div className={`relative rounded-3xl overflow-hidden p-6 sm:p-8 shadow-2xl transition-colors duration-200 ${
      isLight
        ? 'bg-white border border-[#CBD5E1] shadow-slate-200/60'
        : 'bg-gradient-to-r from-[#0B0F17] via-[#121824] to-[#0B0F17] border border-[#1E293B]'
    }`}>
      
      {/* Background Accent Mesh */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
        isLight ? 'bg-emerald-500/5' : 'bg-[#B8FF3D]/5'
      }`} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Left Event Metadata */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-xs uppercase tracking-wider ${
              isLight
                ? 'bg-emerald-50 text-[#15803D] border border-emerald-300'
                : 'bg-[#B8FF3D]/20 text-[#B8FF3D] border border-[#B8FF3D]/30'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              NEXT FEATURED FIXTURE
            </span>
            <span className={`text-xs font-mono uppercase ${isLight ? 'text-slate-500' : 'text-[#8B95A7]'}`}>
              {tournament?.sport_name} • {targetMatch.round_name}
            </span>
          </div>

          <h3 className={`text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight ${
            isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
          }`}>
            {targetMatch.team1?.name || 'CS Strikers'}{' '}
            <span className={isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'}>vs</span>{' '}
            {targetMatch.team2?.name || 'Mechanical Warriors'}
          </h3>

          <div className={`flex flex-wrap items-center gap-4 text-xs font-mono ${
            isLight ? 'text-[#475569]' : 'text-[#8B95A7]'
          }`}>
            <span className="flex items-center gap-1.5">
              <MapPin className={`w-3.5 h-3.5 ${isLight ? 'text-sky-700' : 'text-[#00F0FF]'}`} />
              {targetMatch.venue_name || 'Main Stadium Turf Arena'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Trophy className={`w-3.5 h-3.5 ${isLight ? 'text-amber-700' : 'text-[#FFB800]'}`} />
              {tournament?.title}
            </span>
          </div>
        </div>

        {/* Center/Right Countdown Timer Units */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
            
            <div className={`p-3 sm:p-4 rounded-2xl min-w-[64px] sm:min-w-[76px] ${
              isLight ? 'bg-[#F8FAFC] border border-[#CBD5E1]' : 'bg-[#070A0F] border border-[#1E293B]'
            }`}>
              <div className={`text-2xl sm:text-3xl font-heading font-black ${
                isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
              }`}>
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className={`text-[9px] font-mono uppercase mt-0.5 tracking-wider ${
                isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
              }`}>
                DAYS
              </div>
            </div>

            <div className={`p-3 sm:p-4 rounded-2xl min-w-[64px] sm:min-w-[76px] ${
              isLight ? 'bg-[#F8FAFC] border border-[#CBD5E1]' : 'bg-[#070A0F] border border-[#1E293B]'
            }`}>
              <div className={`text-2xl sm:text-3xl font-heading font-black ${
                isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
              }`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className={`text-[9px] font-mono uppercase mt-0.5 tracking-wider ${
                isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
              }`}>
                HOURS
              </div>
            </div>

            <div className={`p-3 sm:p-4 rounded-2xl min-w-[64px] sm:min-w-[76px] ${
              isLight ? 'bg-[#F8FAFC] border border-[#CBD5E1]' : 'bg-[#070A0F] border border-[#1E293B]'
            }`}>
              <div className={`text-2xl sm:text-3xl font-heading font-black ${
                isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
              }`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className={`text-[9px] font-mono uppercase mt-0.5 tracking-wider ${
                isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
              }`}>
                MINUTES
              </div>
            </div>

            <div className={`p-3 sm:p-4 rounded-2xl min-w-[64px] sm:min-w-[76px] ${
              isLight ? 'bg-[#F8FAFC] border border-[#CBD5E1]' : 'bg-[#070A0F] border border-[#1E293B]'
            }`}>
              <div className={`text-2xl sm:text-3xl font-heading font-black ${
                isLight ? 'text-[#DC2626]' : 'text-[#FF3B30]'
              }`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className={`text-[9px] font-mono uppercase mt-0.5 tracking-wider ${
                isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
              }`}>
                SECONDS
              </div>
            </div>

          </div>

          {/* Action Link */}
          <Link
            to={`/tournaments/${tournament?.id || ''}`}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap self-stretch sm:self-auto justify-center ${
              isLight ? 'shadow-md shadow-[#B8FF3D]/25' : 'lime-glow'
            }`}
          >
            <span>View Bracket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
};
