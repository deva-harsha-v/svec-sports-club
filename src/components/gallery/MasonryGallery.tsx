import React, { useState } from 'react';
import { useSportsClub } from '../../context/SportsClubContext';
import { GalleryItem } from '../../lib/types';
import { Image, X, Maximize2, Sparkles, Filter } from 'lucide-react';

export const MasonryGallery: React.FC = () => {
  const { gallery } = useSportsClub();
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('All');

  const sports = ['All', 'Football', 'Basketball', 'Badminton', 'Cricket', 'Track & Field', 'Volleyball'];

  const filteredItems = selectedSport === 'All'
    ? gallery
    : gallery.filter(g => g.sport_name === selectedSport);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E293B]">
        <div>
          <span className="text-xs font-mono uppercase text-[#B8FF3D] tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            VISUAL ARCHIVE
          </span>
          <h2 className="text-3xl sm:text-5xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-1">
            MOMENTS OF GLORY
          </h2>
          <p className="text-sm text-[#8B95A7] mt-1">
            High-octane photography and match moments captured across campus championship arenas.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {sports.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSport(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedSport === s
                  ? 'bg-[#B8FF3D] text-[#070A0F] font-bold shadow-md shadow-[#B8FF3D]/20'
                  : 'bg-[#0B0F17] text-[#8B95A7] border border-[#1E293B] hover:text-[#F5F7FA]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Column Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            data-media-card="true"
            onClick={() => setSelectedItem(item)}
            className="break-inside-avoid relative rounded-2xl overflow-hidden border border-[#1E293B] hover:border-[#B8FF3D]/60 transition-all duration-300 bg-[#0B0F17] cursor-pointer group shadow-xl"
          >
            <img
              src={item.media_url}
              alt={item.title}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Hover Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span className="px-2 py-0.5 rounded bg-[#B8FF3D] text-[#070A0F] text-[10px] font-mono font-bold uppercase">
                {item.sport_name || 'Athletics'}
              </span>
              <h4 className="font-heading font-black text-lg text-[#F5F7FA] uppercase tracking-tight mt-1.5">
                {item.title}
              </h4>
              {item.caption && (
                <p className="text-xs text-[#8B95A7] mt-1 line-clamp-2">
                  {item.caption}
                </p>
              )}
            </div>

            <div className="absolute top-3 right-3 p-1.5 rounded-full bg-[#070A0F]/80 text-[#F5F7FA] opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0F]/95 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#0B0F17] border border-[#1E293B] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] overflow-hidden flex items-center justify-center bg-black">
              <img
                src={selectedItem.media_url}
                alt={selectedItem.title}
                className="max-h-[75vh] w-auto object-contain"
              />

              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#070A0F]/80 text-[#F5F7FA] hover:text-[#B8FF3D] border border-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[#0B0F17] border-t border-[#1E293B] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-[#B8FF3D] font-bold">
                  {selectedItem.sport_name}
                </span>
                <h3 className="text-2xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-0.5">
                  {selectedItem.title}
                </h3>
                {selectedItem.caption && (
                  <p className="text-xs text-[#8B95A7] mt-1 font-mono">
                    {selectedItem.caption}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-[#121824] hover:bg-[#1E293B] text-xs font-mono text-[#F5F7FA]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
