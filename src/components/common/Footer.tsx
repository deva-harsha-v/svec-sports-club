import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Shield, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070B] border-t border-[#1E293B] text-[#8B95A7] text-xs font-mono py-14 px-4 sm:px-6 lg:px-8 mt-auto pb-24 md:pb-14">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/svec-logo.png"
              alt="Sri Vasavi Sports Club Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-heading font-black text-lg text-[#F5F7FA] tracking-tight">
              SRI VASAVI <span className="text-[#B8FF3D]">SPORTS CLUB</span>
            </span>
          </Link>
          <p className="text-xs text-[#8B95A7] leading-relaxed">
            Sri Vasavi Engineering College Sports Club & Athletics Hub. Fostering varsity champions, competitive sportsmanship, and physical wellness.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <div className="text-xs font-heading font-bold uppercase text-[#F5F7FA] tracking-wider mb-2">
            Championships
          </div>
          <ul className="space-y-1.5">
            <li>
              <Link to="/tournaments" className="hover:text-[#B8FF3D] transition-colors">
                Active Tournaments & Brackets
              </Link>
            </li>
            <li>
              <Link to="/trials" className="hover:text-[#B8FF3D] transition-colors">
                Selection Trials & Circulars
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className="hover:text-[#B8FF3D] transition-colors">
                Campus Sports Cup Standings
              </Link>
            </li>
            <li>
              <Link to="/sports" className="hover:text-[#B8FF3D] transition-colors">
                Sports Directory & Facilities
              </Link>
            </li>
          </ul>
        </div>

        {/* Facilities */}
        <div className="space-y-2">
          <div className="text-xs font-heading font-bold uppercase text-[#F5F7FA] tracking-wider mb-2">
            Venues & Facilities
          </div>
          <ul className="space-y-1.5 text-xs">
            <li>College Cricket Ground</li>
            <li>Volleyball Court Complex</li>
            <li>Indoor Table Tennis Hall</li>
            <li>Badminton Complex</li>
          </ul>
        </div>

        {/* Athletic Desk Contact */}
        <div className="space-y-2">
          <div className="text-xs font-heading font-bold uppercase text-[#F5F7FA] tracking-wider mb-2">
            Physical Education
          </div>
          <p className="text-xs text-[#8B95A7] leading-relaxed">
            Department of Physical Education<br />
            Sri Vasavi Engineering College<br />
            Pedatadepalli, Tadepalligudem - 534101<br />
            svec.sports@srivasaviengg.ac.in
          </p>
          <div className="pt-2">
            <span className="inline-block px-2 py-0.5 rounded bg-[#121824] border border-[#1E293B] text-[10px] text-[#B8FF3D]">
              AFFILIATED TO JNTUK KAKINADA
            </span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
        <span>© {new Date().getFullYear()} SRI VASAVI SPORTS CLUB // SRI VASAVI ENGINEERING COLLEGE. ALL RIGHTS RESERVED.</span>
        <span className="text-[#8B95A7]">PEDATADEPALLI, TADEPALLIGUDEM</span>
      </div>
    </footer>
  );
};
