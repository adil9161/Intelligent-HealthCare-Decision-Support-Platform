import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  HeartPulse,
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Sparkles,
  Command,
  Home,
} from 'lucide-react';

interface NavbarProps {
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenShortcuts }) => {
  const { user, role, switchRole, isLoading } = useAuth();
  const location = useLocation();

  const roles: Array<{ key: UserRole; label: string; icon: React.ReactNode }> = [
    { key: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { key: 'staff', label: 'Staff', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { key: 'admin', label: 'Admin', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/95 border-b border-gray-200 dark:bg-midnight-950/80 dark:border-teal-900/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Academic Meta */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded-xl"
            title="Return to Landing Page Overview"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-glow-teal shadow-sm group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-coral-500 rounded-full border-2 border-white dark:border-midnight-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                  AegisHealth AI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-md bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30">
                  SDG 3
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate hidden md:block">
                NIET Greater Noida • Dr. Mohd. Nazim • B.Tech CSE AI
              </p>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-600 dark:bg-slate-900/60 dark:border-teal-800/60 dark:text-slate-300">
          <Link
            to="/"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors ${
              location.pathname === '/' ? 'text-coral-600 font-bold bg-coral-50 dark:text-coral-400 dark:bg-coral-500/10' : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
          <span className="text-gray-300 dark:text-slate-600">•</span>
          <Link
            to="/patients"
            className={`px-2.5 py-1 rounded-full transition-colors ${
              location.pathname !== '/' ? 'text-teal-700 font-bold bg-teal-50 dark:text-teal-300 dark:bg-teal-500/10' : 'text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <span>Clinical Workspace</span>
          </Link>
        </div>

        {/* Right Actions: Role Switcher & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-900/90 p-1 rounded-xl border border-gray-200 dark:border-teal-800/60 shadow-sm">
            {roles.map(r => {
              const isActive = role === r.key;
              return (
                <button
                  key={r.key}
                  disabled={isLoading}
                  onClick={() => switchRole(r.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`}
                  title={`Switch to ${r.label} view`}
                >
                  {r.icon}
                  <span className="capitalize">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={onOpenShortcuts}
            className="hidden sm:flex items-center justify-center p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-teal-500 dark:bg-slate-900/80 dark:border-teal-800/60 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none"
            title="Keyboard Shortcuts (Ctrl+K)"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Current Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-teal-900/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-coral-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">
                {user?.full_name?.split(',')[0]}
              </p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 capitalize font-medium">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
