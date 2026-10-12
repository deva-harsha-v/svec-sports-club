import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Trophy, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { role } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/leaderboard', label: 'Rankings', icon: Trophy },
    { 
      to: (role === 'admin' || role === 'coach') ? '/admin' : role === 'member' ? '/profile' : '/login', 
      label: (role === 'admin' || role === 'coach') ? 'Coach & Admin' : role === 'member' ? 'Profile' : 'Sign In', 
      icon: (role === 'admin' || role === 'coach') ? ShieldCheck : User 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#070A0F]/95 backdrop-blur-xl border-t border-[#1E293B] px-3 py-2 pb-safe">
      <div className="grid grid-cols-4 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer group ${
                  isActive ? 'text-[#B8FF3D]' : 'text-[#8B95A7]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#B8FF3D] text-[#070A0F] shadow-lg shadow-[#B8FF3D]/20 scale-105'
                        : 'text-[#8B95A7] group-hover:text-[#F5F7FA]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-mono tracking-wider mt-1 transition-colors ${
                      isActive ? 'text-[#B8FF3D] font-bold' : 'text-[#8B95A7]'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
