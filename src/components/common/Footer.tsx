import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070B] border-t border-[#1E293B] text-[#8B95A7] text-xs font-mono py-8 px-4 sm:px-6 lg:px-8 mt-auto pb-24 md:pb-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Brand Information */}
        <div className="space-y-1.5 max-w-md">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/svec-logo.png"
              alt="Sri Vasavi Sports Club Logo"
              className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-heading font-black text-sm text-[#F5F7FA] tracking-tight uppercase">
              SRI VASAVI <span className="text-[#B8FF3D]">SPORTS CLUB</span>
            </span>
          </Link>
          <p className="text-[11px] text-[#8B95A7] leading-relaxed">
            Sri Vasavi Engineering College Sports Club & Athletics Hub.
          </p>
        </div>

        {/* Minimal Creator Section */}
        <div className="text-[11px] leading-tight space-y-1 md:text-right">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
            Created by
          </div>
          <div className="text-xs font-heading font-bold text-[#F5F7FA]">
            Deva Harsha Veerla
          </div>
          <div className="text-[10px] text-[#8B95A7] font-mono">
            CSE · 2023–2027
          </div>
          <div className="pt-0.5">
            <a
              href="https://devaharshaveerla.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-[#B8FF3D] hover:underline font-medium transition-colors cursor-pointer"
            >
              <span>Portfolio</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

      </div>

      {/* Thin Divider & Compact Copyright Line */}
      <div className="max-w-7xl mx-auto pt-4 mt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#64748B] gap-2">
        <span>© {new Date().getFullYear()} Sri Vasavi Engineering College. All rights reserved.</span>
        <span>Pedatadepalli, Tadepalligudem · Autonomous</span>
      </div>
    </footer>
  );
};
