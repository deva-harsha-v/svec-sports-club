import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../components/hero/HeroBanner';
import { NextEventCountdown } from '../components/home/NextEventCountdown';
import { BroadcastStatusStrip } from '../components/home/BroadcastStatusStrip';
import { EditorialSportGrid } from '../components/sports/EditorialSportGrid';
import { EditorialNewsFeed } from '../components/news/EditorialNewsFeed';
import { RankingsPreview } from '../components/home/RankingsPreview';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Full-Screen Hero with rotating sport taglines */}
      <HeroBanner
        onExploreTournaments={() => navigate('/tournaments')}
        onViewCampusCup={() => navigate('/leaderboard')}
        onOpenRegister={() => navigate('/tournaments')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Official SVEC Selection Trials Circular Banner */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-[#121824] via-[#0B0F17] to-[#121824] border border-[#B8FF3D]/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <img
              src="/svec-logo.png"
              alt="Sri Vasavi Sports Club Logo"
              className="w-12 h-12 object-contain shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#B8FF3D]/15 text-[#B8FF3D] font-bold">
                  Official Circulars 117 & 118
                </span>
                <span className="text-xs font-mono text-[#8B95A7]">Sri Vasavi Engineering College</span>
              </div>
              <h3 className="text-lg font-heading font-bold text-[#F5F7FA] mt-1">
                Varsity Selection Trials Active (Cricket Men, Table Tennis & Volleyball M/W)
              </h3>
              <p className="text-xs text-[#8B95A7]">
                Official athletic selection trials for B.Tech & MBA varsity squads. Check session schedules and register for your trial pass.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/trials')}
            className="px-5 py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 lime-glow"
          >
            Enter Trials Hub →
          </button>
        </div>

        {/* 2. "Next Event" Countdown Card */}
        <NextEventCountdown />

        {/* 3. Live / Next / Registration Strip */}
        <BroadcastStatusStrip />

        {/* 4. Editorial Sport Tiles */}
        <EditorialSportGrid
          onNavigateToTournaments={(sportSlug) => {
            navigate(sportSlug ? `/tournaments` : '/tournaments');
          }}
        />

        {/* 5. Campus Cup Rankings Preview */}
        <RankingsPreview />

        {/* 6. Latest News Stories */}
        <EditorialNewsFeed />
      </div>

    </div>
  );
};
