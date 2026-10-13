import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UserCheck, Trophy, TrendingUp, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { role } = useAuth();

  const isStaff = role === 'admin' || role === 'coach';
  const isStudent = role === 'member';

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/trials', label: 'Trials', icon: UserCheck },
    { to: '/tournaments', label: 'Tournaments', icon: Trophy },
    { to: '/leaderboard', label: 'Rankings', icon: TrendingUp },
    { 
      to: isStaff ? '/admin' : isStudent ? '/profile' : '/login', 
      label: isStaff ? 'Admin' : 'Profile', 
      icon: isStaff ? ShieldCheck : User 
    },
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 md:hidden flex justify-center pointer-events-none px-3 pb-[env(safe-area-inset-bottom)]">
      <nav className="pointer-events-auto max-w-sm w-full bg-[#070A0F]/90 backdrop-blur-xl border border-[#1E293B] rounded-2xl shadow-2xl shadow-black/40 px-2 py-1.5 transition-all">
        <div className="grid grid-cols-5 items-center justify-around gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive ? 'text-[#B8FF3D]' : 'text-[#8B95A7] hover:text-[#F5F7FA]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-[#B8FF3D] text-[#070A0F] shadow-md shadow-[#B8FF3D]/20'
                          : 'text-[#8B95A7]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[9px] font-mono tracking-wider mt-0.5 truncate transition-colors ${
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
      </nav>
    </div>
  );
};
