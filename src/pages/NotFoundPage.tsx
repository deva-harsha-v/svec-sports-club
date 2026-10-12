import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Trophy, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-[#0B0F17] border border-[#1E293B] p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-[#FF3B30]/20 border border-[#FF3B30]/40 text-[#FF3B30] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-[#121824] text-[#FF3B30] font-mono font-bold text-xs uppercase tracking-wider">
            ERROR 404 // OUT OF BOUNDS
          </span>
          <h1 className="text-4xl font-heading font-black text-[#F5F7FA] uppercase tracking-tight mt-3">
            PLAY WHISTLED DEAD
          </h1>
          <p className="text-xs font-mono text-[#8B95A7] mt-2 leading-relaxed">
            The page, bracket, or sports route you are looking for does not exist or has been relocated by tournament officials.
          </p>
        </div>

        <div className="pt-4 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8FF3D] hover:bg-[#a6ed28] text-[#070A0F] font-heading font-black text-xs uppercase tracking-wider lime-glow transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/tournaments"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#121824] hover:bg-[#1E293B] border border-[#1E293B] text-[#F5F7FA] font-heading font-bold text-xs uppercase tracking-wider transition-all"
          >
            <Trophy className="w-4 h-4 text-[#B8FF3D]" />
            Tournaments
          </Link>
        </div>

      </div>
    </div>
  );
};
