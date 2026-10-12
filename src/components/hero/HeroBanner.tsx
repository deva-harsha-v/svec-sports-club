import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronRight, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeroBannerProps {
  onExploreTournaments: () => void;
  onViewCampusCup: () => void;
  onOpenRegister: () => void;
}

const taglines = [
  { phrase: 'DEFEND YOUR COLORS.', sport: 'INTER-DEPARTMENT CHAMPIONSHIP', accent: '#B8FF3D', lightAccent: '#15803D', bg: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&auto=format&fit=crop&q=80' },
  { phrase: 'OWN THE COURT.', sport: 'VARSITY BASKETBALL SUPER LEAGUE', accent: '#00F0FF', lightAccent: '#0369A1', bg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&auto=format&fit=crop&q=80' },
  { phrase: 'CHASE THE PODIUM.', sport: 'ANNUAL TRACK & FIELD CLASSIC', accent: '#FFB800', lightAccent: '#B45309', bg: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&auto=format&fit=crop&q=80' },
  { phrase: 'BLEED BLUE & GOLD.', sport: 'CHANCELLOR CRICKET OVAL T20', accent: '#B8FF3D', lightAccent: '#15803D', bg: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1600&auto=format&fit=crop&q=80' }
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreTournaments,
  onViewCampusCup,
  onOpenRegister
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const current = taglines[index];

  return (
    <div className={`relative min-h-[82vh] lg:min-h-[88vh] flex items-center justify-center overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-[#F8FAFC] border-b border-[#E2E8F0]' : 'bg-[#070A0F] border-b border-[#1E293B]'
    }`}>
      
      {/* Background sports imagery with controlled theme opacity */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.bg}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: isLight ? 0.20 : 0.65, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center contrast-110 pointer-events-none"
          style={{ backgroundImage: `url(${current.bg})` }}
        />
      </AnimatePresence>

      {/* Broadcast Gradients tailored per theme for guaranteed legibility */}
      {isLight ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/85 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC]/95 via-[#F8FAFC]/80 to-[#F8FAFC]/40 pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-[#070A0F]/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070A0F]/90 via-[#070A0F]/60 to-transparent pointer-events-none" />
        </>
      )}

      {/* Grid Pattern Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: isLight
            ? `linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)`
            : `linear-gradient(#F5F7FA 1px, transparent 1px), linear-gradient(90deg, #F5F7FA 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        
        {/* Championship Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm transition-colors ${
            isLight
              ? 'bg-white/95 border border-[#E2E8F0] shadow-sm'
              : 'bg-[#121824]/90 border border-[#1E293B]'
          }`}
        >
          <span className={`text-[11px] font-mono uppercase tracking-wider ${
            isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
          }`}>
            COLLEGIATE SEASON 2026 //
          </span>
          <span className={`text-[11px] font-mono font-bold uppercase ${
            isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
          }`}>
            {current.sport}
          </span>
        </motion.div>

        {/* Rotating Headline */}
        <div className="h-[140px] sm:h-[180px] lg:h-[220px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={current.phrase}
              initial={{ opacity: 0, y: 30, skewY: 1 }}
              animate={{ opacity: 1, y: 0, skewY: 0 }}
              exit={{ opacity: 0, y: -30, skewY: -1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-heading font-black tracking-tighter uppercase leading-[0.9] ${
                isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
              }`}
            >
              {current.phrase.split(' ')[0]}{' '}
              <span 
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: isLight
                    ? `linear-gradient(135deg, ${current.lightAccent}, #0F172A)`
                    : `linear-gradient(135deg, ${current.accent}, #F5F7FA)`
                }}
              >
                {current.phrase.split(' ').slice(1).join(' ')}
              </span>
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Editorial Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-6 text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed ${
            isLight ? 'text-[#475569]' : 'text-[#8B95A7]'
          }`}
        >
          The official arena for collegiate athletics, championship brackets, live scoring, 
          and the prestigious{' '}
          <span className={`font-semibold ${isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'}`}>
            Campus Sports Cup
          </span>
          . Step up, defend your department, and earn your place in history.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <button
            onClick={onExploreTournaments}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              isLight ? 'shadow-md shadow-[#B8FF3D]/25' : 'lime-glow'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#070A0F]" />
            Tournaments & Brackets
          </button>

          <button
            onClick={onViewCampusCup}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-lg font-heading font-bold text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] shadow-sm'
                : 'bg-[#0B0F17] hover:bg-[#121824] text-[#F5F7FA] border border-[#1E293B] hover:border-[#B8FF3D]/50'
            }`}
          >
            <span>Campus Sports Cup</span>
            <ChevronRight className={`w-4 h-4 ${isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'}`} />
          </button>

          <button
            onClick={onOpenRegister}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-lg text-xs font-mono transition-colors ${
              isLight
                ? 'text-[#475569] hover:text-[#15803D]'
                : 'text-[#8B95A7] hover:text-[#B8FF3D]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Join or Build a Team</span>
          </button>
        </motion.div>

        {/* High-Impact Stat Strip (Bottom of Hero) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className={`mt-14 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t ${
            isLight ? 'border-[#E2E8F0]' : 'border-[#1E293B]/80'
          }`}
        >
          <div className={`border-l-2 pl-3 ${isLight ? 'border-[#15803D]' : 'border-[#B8FF3D]'}`}>
            <div className={`text-3xl sm:text-4xl font-heading font-black tracking-tight ${
              isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
            }`}>
              1,240<span className={isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'}>+</span>
            </div>
            <div className={`text-xs uppercase font-mono mt-0.5 ${
              isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
            }`}>
              Varsity Athletes
            </div>
          </div>

          <div className={`border-l-2 pl-3 ${isLight ? 'border-[#CBD5E1]' : 'border-[#1E293B]'}`}>
            <div className={`text-3xl sm:text-4xl font-heading font-black tracking-tight ${
              isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
            }`}>
              14
            </div>
            <div className={`text-xs uppercase font-mono mt-0.5 ${
              isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
            }`}>
              Active Trophies
            </div>
          </div>

          <div className={`border-l-2 pl-3 ${isLight ? 'border-[#CBD5E1]' : 'border-[#1E293B]'}`}>
            <div className={`text-3xl sm:text-4xl font-heading font-black tracking-tight ${
              isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
            }`}>
              4
            </div>
            <div className={`text-xs uppercase font-mono mt-0.5 ${
              isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
            }`}>
              Olympic Venues
            </div>
          </div>

          <div className={`border-l-2 pl-3 ${isLight ? 'border-[#15803D]' : 'border-[#B8FF3D]'}`}>
            <div className={`text-3xl sm:text-4xl font-heading font-black tracking-tight ${
              isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
            }`}>
              480 <span className={`text-xs font-normal ${isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'}`}>PTS</span>
            </div>
            <div className={`text-xs uppercase font-mono mt-0.5 ${
              isLight ? 'text-[#64748B]' : 'text-[#8B95A7]'
            }`}>
              Cup Leader: CS
            </div>
          </div>
        </motion.div>

      </div>

      {/* Progress Dots for Tagline Rotation */}
      <div className="absolute right-6 bottom-6 hidden md:flex items-center gap-2 z-20">
        {taglines.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
              i === index 
                ? (isLight ? 'w-8 bg-[#15803D]' : 'w-8 bg-[#B8FF3D]') 
                : (isLight ? 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]' : 'w-2 bg-[#1E293B] hover:bg-[#8B95A7]')
            }`}
          />
        ))}
      </div>

    </div>
  );
};

