import React, { useState } from 'react';
import { useSportsClub } from '../../context/SportsClubContext';
import { UpdateItem } from '../../lib/types';
import { Newspaper, Calendar, User, ArrowRight, X, Sparkles } from 'lucide-react';

export const EditorialNewsFeed: React.FC = () => {
  const { updates } = useSportsClub();
  const [selectedArticle, setSelectedArticle] = useState<UpdateItem | null>(null);

  const featured = updates.find(u => u.featured) || updates[0];
  const secondaries = updates.filter(u => u.id !== featured?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Feed Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <span className="text-xs font-mono uppercase text-[#B8FF3D] tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          PRESS & DISPATCHES
        </span>
        <h2 className="text-3xl sm:text-5xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-1">
          SRI VASAVI SPORTS DESK
        </h2>
        <p className="text-sm text-[#8B95A7] mt-1 max-w-xl">
          Official tournament highlights, roster updates, facility announcements, and Campus Cup analyses.
        </p>
      </div>

      {/* Featured Big Story Card */}
      {featured && (
        <div 
          onClick={() => setSelectedArticle(featured)}
          className="group relative rounded-3xl overflow-hidden border border-[#1E293B] hover:border-[#B8FF3D]/60 transition-all duration-300 bg-[#0B0F17] cursor-pointer shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[420px]"
        >
          {/* Cover Media */}
          <div className="lg:col-span-7 relative h-64 lg:h-full overflow-hidden">
            <img
              src={featured.cover_image}
              alt={featured.title}
              className="w-full h-full object-cover filter contrast-125 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#070A0F] via-transparent to-transparent opacity-80" />
          </div>

          {/* Text Content */}
          <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between space-y-4">
            <div>
              <span className="px-3 py-1 rounded-md bg-[#B8FF3D] text-[#070A0F] font-mono font-bold text-xs uppercase tracking-wider">
                FEATURED STORY // {featured.category}
              </span>

              <h3 className="text-2xl sm:text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-4 group-hover:text-[#B8FF3D] transition-colors leading-tight">
                {featured.title}
              </h3>

              <p className="text-sm text-[#8B95A7] mt-3 leading-relaxed">
                {featured.summary}
              </p>
            </div>

            <div className="pt-6 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#8B95A7]">
              <span>By {featured.author_name}</span>
              <span className="text-[#B8FF3D] flex items-center gap-1 font-bold">
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
            className="group rounded-2xl border border-[#1E293B] bg-[#0B0F17] hover:border-[#B8FF3D]/40 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between shadow-xl"
          >
            {item.cover_image && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#070A0F]/80 backdrop-blur-md text-[10px] font-mono text-[#B8FF3D] font-bold uppercase">
                  {item.category}
                </span>
              </div>
            )}

            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-lg font-heading font-black text-[#F5F7FA] uppercase tracking-tight group-hover:text-[#B8FF3D] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-[#8B95A7] mt-2 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono text-[#8B95A7]">
                <span>{item.author_name}</span>
                <span>{new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Story Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0F]/85 backdrop-blur-md animate-fade-in">
          <div 
            className="relative w-full max-w-2xl bg-[#0B0F17] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {selectedArticle.cover_image && (
              <div className="relative h-56 w-full flex-shrink-0">
                <img
                  src={selectedArticle.cover_image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-[#070A0F]/80 text-[#F5F7FA] hover:text-[#B8FF3D]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
              <span className="px-2.5 py-1 rounded bg-[#B8FF3D]/20 text-[#B8FF3D] font-mono text-xs uppercase font-bold">
                {selectedArticle.category}
              </span>

              <h3 className="text-2xl sm:text-3xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight">
                {selectedArticle.title}
              </h3>

              <div className="flex items-center gap-3 text-xs font-mono text-[#8B95A7] pb-4 border-b border-[#1E293B]">
                <span>Reported by {selectedArticle.author_name}</span>
                <span>•</span>
                <span>{new Date(selectedArticle.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="text-sm text-[#F5F7FA] space-y-4 leading-relaxed font-body">
                <p className="font-semibold text-base text-[#B8FF3D]">
                  {selectedArticle.summary}
                </p>
                <p className="text-[#8B95A7] whitespace-pre-line">
                  {selectedArticle.content}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#070A0F] border-t border-[#1E293B] text-right flex-shrink-0">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-lg bg-[#121824] hover:bg-[#1E293B] text-xs font-mono text-[#F5F7FA]"
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
