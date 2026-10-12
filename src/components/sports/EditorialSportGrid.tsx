import React, { useState, useEffect } from 'react';
import { Sport } from '../../lib/types';
import { useSportsClub } from '../../context/SportsClubContext';
import { sportsApi } from '../../lib/api/sports';
import { SportDetailModal } from './SportDetailModal';
import { Users, MapPin, ArrowUpRight, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface EditorialSportGridProps {
  onNavigateToTournaments: (sportSlug?: string) => void;
}

export const EditorialSportGrid: React.FC<EditorialSportGridProps> = ({
  onNavigateToTournaments
}) => {
  const { sports: contextSports } = useSportsClub();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [sportsList, setSportsList] = useState<Sport[]>(contextSports);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    sportsApi.getAll().then(data => {
      if (isMounted && data && data.length > 0) {
        setSportsList(data);
      }
    }).catch(() => {
      // Fallback already populated with contextSports
    });
    return () => { isMounted = false; };
  }, []);

  // Update when contextSports changes if state is empty
  useEffect(() => {
    if (sportsList.length === 0 && contextSports.length > 0) {
      setSportsList(contextSports);
    }
  }, [contextSports, sportsList.length]);

  const facilityTypeTabs = [
    { id: 'all', label: 'All Offerings', count: sportsList.length },
    { 
      id: 'competitive_sport', 
      label: 'Competitive Sports', 
      count: sportsList.filter(s => s.facility_type === 'competitive_sport').length 
    },
    { 
      id: 'fitness_wellness', 
      label: 'Fitness & Wellness', 
      count: sportsList.filter(s => s.facility_type === 'fitness_wellness').length 
    },
    { 
      id: 'training_facility', 
      label: 'Training Facilities', 
      count: sportsList.filter(s => s.facility_type === 'training_facility').length 
    },
  ];

  // Derive unique categories from active sportsList
  const uniqueCategories = ['all', ...Array.from(new Set(sportsList.map(s => s.category)))];

  const filteredSports = sportsList.filter(sport => {
    if (facilityTypeFilter !== 'all' && sport.facility_type !== facilityTypeFilter) {
      return false;
    }
    if (categoryFilter !== 'all' && sport.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  // Bento layout mapping: vary spans for varied editorial rhythm
  const getBentoSpan = (index: number) => {
    switch (index % 6) {
      case 0:
        return 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-[420px]'; // Large Hero Tile
      case 1:
        return 'col-span-1 md:col-span-1 lg:col-span-1 row-span-1 h-[260px]';
      case 2:
        return 'col-span-1 md:col-span-1 lg:col-span-1 row-span-1 h-[260px]';
      case 3:
        return 'col-span-1 md:col-span-2 lg:col-span-1 row-span-1 h-[260px]';
      case 4:
        return 'col-span-1 md:col-span-1 lg:col-span-1 row-span-1 h-[260px]';
      case 5:
        return 'col-span-1 md:col-span-3 lg:col-span-2 row-span-1 h-[260px]'; // Wide Panoramic
      default:
        return 'col-span-1 h-[260px]';
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header & Filter Controls */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b ${
        isLight ? 'border-slate-200' : 'border-[#1E293B]'
      }`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-1 ${
            isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            SRI VASAVI ENGINEERING COLLEGE ATHLETICS
          </div>
          <h2 className={`text-3xl sm:text-5xl font-heading font-black tracking-tight uppercase ${
            isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
          }`}>
            SPORTS & ATHLETIC DIRECTORY
          </h2>
          <p className={`text-sm mt-1 max-w-xl ${
            isLight ? 'text-slate-600' : 'text-[#8B95A7]'
          }`}>
            Explore 20 official athletic disciplines, competitive varsity sports, campus fitness offerings, and dedicated training facilities.
          </p>
        </div>

        {/* Primary Facility Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {facilityTypeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFacilityTypeFilter(tab.id);
                setCategoryFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap ${
                facilityTypeFilter === tab.id
                  ? 'bg-[#B8FF3D] text-[#070A0F] shadow-md shadow-[#B8FF3D]/20'
                  : isLight
                    ? 'bg-white text-slate-700 border border-slate-200 hover:text-slate-900 hover:border-slate-400'
                    : 'bg-[#0B0F17] text-[#8B95A7] border border-[#1E293B] hover:text-[#F5F7FA] hover:border-[#8B95A7]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Category Filter Pills (if more than 1 category) */}
      {uniqueCategories.length > 2 && (
        <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 border-b ${
          isLight ? 'border-slate-200' : 'border-[#1E293B]/60'
        }`}>
          <span className={`text-[11px] font-mono uppercase shrink-0 mr-1 ${
            isLight ? 'text-slate-500' : 'text-[#8B95A7]'
          }`}>Discipline:</span>
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                    : 'bg-[#121824] text-[#B8FF3D] border border-[#B8FF3D]/40 font-bold'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900 bg-slate-100'
                    : 'text-[#8B95A7] hover:text-[#F5F7FA] bg-[#070A0F]'
              }`}
            >
              {cat === 'all' ? 'All Disciplines' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredSports.map((sport, index) => {
          const spanClass = getBentoSpan(index);
          const isLarge = index === 0;

          return (
            <div
              key={sport.id}
              data-media-card="true"
              onClick={() => setSelectedSport(sport)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 bg-[#0B0F17] ${
                isLight ? 'border-slate-300 shadow-md hover:border-[#15803D]' : 'border-[#1E293B] hover:border-[#B8FF3D]/60'
              } ${spanClass}`}
            >
              {/* Background Cover Image with Hover Zoom */}
              <img
                src={sport.cover_image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80'}
                alt={sport.name}
                className="absolute inset-0 w-full h-full object-cover object-center filter contrast-125 group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-[#070A0F]/50 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />
              <div className="absolute inset-0 bg-[#070A0F]/20 group-hover:bg-transparent transition-colors" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-[#070A0F]/80 backdrop-blur-md border border-[#1E293B] text-[10px] font-mono uppercase font-bold text-[#B8FF3D] tracking-wider">
                    {sport.category}
                  </span>
                  {sport.facility_type !== 'competitive_sport' && (
                    <span className="px-2 py-0.5 rounded bg-[#121824]/90 text-[9px] font-mono text-[#CBD5E1] uppercase border border-[#1E293B]">
                      {sport.facility_type === 'fitness_wellness' ? 'Wellness' : 'Facility'}
                    </span>
                  )}
                </div>

                <div className="w-8 h-8 rounded-full bg-[#070A0F]/80 border border-[#1E293B] flex items-center justify-center text-[#8B95A7] group-hover:text-[#070A0F] group-hover:bg-[#B8FF3D] group-hover:border-[#B8FF3D] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom Content & Stat Reveal */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end">
                <h3 className={`font-heading font-black text-[#F5F7FA] uppercase tracking-tight group-hover:text-[#B8FF3D] transition-colors duration-300 ${
                  isLarge ? 'text-3xl sm:text-4xl' : 'text-2xl'
                }`}>
                  {sport.name}
                </h3>

                {/* Venue tag */}
                <div className="flex items-center gap-1.5 text-xs text-[#8B95A7] mt-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#B8FF3D]" />
                  <span className="line-clamp-1">{sport.venue || 'Venue to be announced'}</span>
                </div>

                {/* Hover Stat Reveal */}
                <div className="mt-3 pt-3 border-t border-[#1E293B]/70 flex items-center justify-between text-xs font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5 text-[#F5F7FA]">
                    <Users className="w-3.5 h-3.5 text-[#B8FF3D]" />
                    <span>{sport.active_athletes_count ?? 0} Athletes</span>
                  </div>

                  <span className="text-[11px] text-[#8B95A7] group-hover:text-[#B8FF3D] transition-colors">
                    {sport.coach_name ? `Coach ${sport.coach_name.split(' ')[0]} →` : 'Coach to be assigned →'}
                  </span>
                </div>
              </div>

              {/* Accent Border Highlight on Hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#B8FF3D]/40 rounded-2xl pointer-events-none transition-colors" />
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <SportDetailModal
        sport={selectedSport}
        onClose={() => setSelectedSport(null)}
        onViewTournaments={(slug) => onNavigateToTournaments(slug)}
      />

    </section>
  );
};
