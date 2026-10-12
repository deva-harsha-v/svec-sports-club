import React, { useState } from 'react';
import { useSportsClub } from '../../context/SportsClubContext';
import { useTheme } from '../../context/ThemeContext';
import { UpdateItem } from '../../lib/types';
import { Newspaper, Calendar, User, ArrowRight, X, Sparkles } from 'lucide-react';

export const EditorialNewsFeed: React.FC = () => {
  const { updates } = useSportsClub();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedArticle, setSelectedArticle] = useState<UpdateItem | null>(null);

  const featured = updates.find(u => u.featured) || updates[0];
  const secondaries = updates.filter(u => u.id !== featured?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Feed Header */}
      <div className={`pb-6 border-b ${isLight ? 'border-slate-200' : 'border-[#1E293B]'}`}>
        <span className={`text-xs font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold ${
          isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          PRESS & DISPATCHES
        </span>
        <h2 className={`text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight mt-1 ${
          isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
        }`}>
          SRI VASAVI SPORTS DESK
        </h2>
        <p className={`text-sm mt-1 max-w-xl ${
          isLight ? 'text-slate-600' : 'text-[#8B95A7]'
        }`}>
          Official tournament highlights, roster updates, facility announcements, and Campus Cup analyses.
        </p>
      </div>

      {/* Featured Big Story Card */}
      {featured && (
        <div 
          onClick={() => setSelectedArticle(featured)}
          className={`group relative rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[420px] border ${
            isLight
              ? 'bg-white border-[#CBD5E1] hover:border-[#15803D] shadow-slate-200/60'
              : 'bg-[#0B0F17] border-[#1E293B] hover:border-[#B8FF3D]/60'
          }`}
        >
          {/* Cover Media */}
          <div data-media-card="true" className="lg:col-span-7 relative h-64 lg:h-full overflow-hidden">
            <img
              src={featured.cover_image}
              alt={featured.title}
              className="w-full h-full object-cover filter contrast-125 group-hover:scale-105 transition-transform duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r ${
              isLight ? 'from-white/90 via-transparent to-transparent' : 'from-[#070A0F] via-transparent to-transparent opacity-80'
            }`} />
          </div>

          {/* Text Content */}
          <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between space-y-4">
            <div>
              <span className={`px-3 py-1 rounded-md font-mono font-bold text-xs uppercase tracking-wider ${
                isLight ? 'bg-emerald-100 text-[#15803D]' : 'bg-[#B8FF3D] text-[#070A0F]'
              }`}>
                FEATURED STORY // {featured.category}
              </span>

              <h3 className={`text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight mt-4 transition-colors leading-tight ${
                isLight ? 'text-[#0F172A] group-hover:text-[#15803D]' : 'text-[#F5F7FA] group-hover:text-[#B8FF3D]'
              }`}>
                {featured.title}
              </h3>

              <p className={`text-sm mt-3 leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-[#8B95A7]'
              }`}>
                {featured.summary}
              </p>
            </div>

            <div className={`pt-6 border-t flex items-center justify-between text-xs font-mono ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-[#1E293B] text-[#8B95A7]'
            }`}>
              <span>By {featured.author_name}</span>
              <span className={`flex items-center gap-1 font-bold ${
                isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'
              }`}>
                Read Story <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secondaries.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className={`group rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-xl border ${
              isLight
                ? 'bg-white border-[#CBD5E1] hover:border-[#15803D] shadow-slate-200/50'
                : 'bg-[#0B0F17] border-[#1E293B] hover:border-[#B8FF3D]/40'
            }`}
          >
            {item.cover_image && (
              <div data-media-card="true" className="relative h-48 overflow-hidden">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded backdrop-blur-md text-[10px] font-mono font-bold uppercase ${
                  isLight ? 'bg-white/90 text-[#15803D]' : 'bg-[#070A0F]/80 text-[#B8FF3D]'
                }`}>
                  {item.category}
                </span>
              </div>
            )}

            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <h4 className={`text-lg font-heading font-black uppercase tracking-tight transition-colors ${
                  isLight ? 'text-[#0F172A] group-hover:text-[#15803D]' : 'text-[#F5F7FA] group-hover:text-[#B8FF3D]'
                }`}>
                  {item.title}
                </h4>
                <p className={`text-xs mt-2 line-clamp-3 leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-[#8B95A7]'
                }`}>
                  {item.summary}
                </p>
              </div>

              <div className={`pt-4 border-t flex items-center justify-between text-[11px] font-mono ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-[#1E293B] text-[#8B95A7]'
              }`}>
                <span>{item.author_name}</span>
                <span>{new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Story Modal */}
      {selectedArticle && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${
          isLight ? 'bg-slate-900/40' : 'bg-[#070A0F]/85'
        }`}>
          <div 
            className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col border transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-slate-300/60' : 'bg-[#0B0F17] border-[#1E293B]'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {selectedArticle.cover_image && (
              <div data-media-card="true" className="relative h-56 w-full flex-shrink-0">
                <img
                  src={selectedArticle.cover_image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:text-[#B8FF3D]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <span className={`px-2.5 py-1 rounded font-mono text-xs uppercase font-bold ${
                isLight ? 'bg-emerald-100 text-[#15803D]' : 'bg-[#B8FF3D]/20 text-[#B8FF3D]'
              }`}>
                {selectedArticle.category}
              </span>

              <h3 className={`text-2xl sm:text-3xl font-heading font-black uppercase tracking-tight ${
                isLight ? 'text-[#0F172A]' : 'text-[#F5F7FA]'
              }`}>
                {selectedArticle.title}
              </h3>

              <div className={`flex items-center gap-3 text-xs font-mono pb-4 border-b ${
                isLight ? 'border-slate-200 text-slate-500' : 'border-[#1E293B] text-[#8B95A7]'
              }`}>
                <span>Reported by {selectedArticle.author_name}</span>
                <span>•</span>
                <span>{new Date(selectedArticle.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className={`text-sm space-y-4 leading-relaxed font-body ${
                isLight ? 'text-slate-800' : 'text-[#F5F7FA]'
              }`}>
                <p className={`font-semibold text-base ${isLight ? 'text-[#15803D]' : 'text-[#B8FF3D]'}`}>
                  {selectedArticle.summary}
                </p>
                <p className={`whitespace-pre-line ${isLight ? 'text-slate-600' : 'text-[#8B95A7]'}`}>
                  {selectedArticle.content}
                </p>
              </div>
            </div>

            <div className={`p-4 border-t text-right flex-shrink-0 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#070A0F] border-[#1E293B]'
            }`}>
              <button
                onClick={() => setSelectedArticle(null)}
                className={`px-5 py-2 rounded-lg text-xs font-mono ${
                  isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-[#121824] hover:bg-[#1E293B] text-[#F5F7FA]'
                }`}
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
