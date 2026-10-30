import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  UserCog,
  Boxes,
  Cpu,
  GitFork,
  Box,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Stethoscope,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  Command,
  Home,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

interface DashboardShellProps {
  children?: React.ReactNode;
  criticalAlertCount?: number;
  onOpenShortcuts: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  criticalAlertCount = 0,
  onOpenShortcuts,
}) => {
  const { user, role, switchRole, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar persistence in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('aegis_sidebar_collapsed') === 'true';
  });

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toggle and persist
  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('aegis_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Derive breadcrumb from current route
  const pathMap: Record<string, string> = {
    '/dashboard': 'Clinical Dashboard',
    '/patients': 'Patient Intake & Triage',
    '/staff': 'Medical Staff Roster',
    '/resources': 'Resources & Predictive Shortages',
    '/triage': 'AI Decision Engine & CF Calculus',
    '/search': 'Decision Graph Search (A*)',
    '/digital-twin': '3D Campus Digital Twin',
    '/sdg': 'SDG 3 & Academic Impact',
    '/settings': 'Notification & System Settings',
  };

  const currentTitle = pathMap[location.pathname] || 'Workspace';

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard Home',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      badge: null,
    },
    {
      to: '/patients',
      label: 'Patient Management',
      icon: <Users className="w-4 h-4 shrink-0" />,
      badge: null,
    },
    {
      to: '/staff',
      label: 'Staff Management',
      icon: <UserCog className="w-4 h-4 shrink-0" />,
      badge: null,
    },
    {
      to: '/resources',
      label: 'Resource Management',
      icon: <Boxes className="w-4 h-4 shrink-0" />,
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} Alerts` : null,
      badgeAlert: true,
    },
    {
      to: '/triage',
      label: 'AI Decision Engine',
      icon: <Cpu className="w-4 h-4 shrink-0" />,
      badge: 'CF + Fuzzy',
    },
    {
      to: '/search',
      label: 'Graph Search (BFS/A*)',
      icon: <GitFork className="w-4 h-4 shrink-0" />,
      badge: '4 Algos',
    },
    {
      to: '/digital-twin',
      label: '3D Campus Twin',
      icon: <Box className="w-4 h-4 shrink-0" />,
      badge: 'R3F',
    },
    {
      to: '/sdg',
      label: 'SDG 3 & NIET Course',
      icon: <Globe2 className="w-4 h-4 shrink-0" />,
      badge: 'Impact',
    },
    {
      to: '/settings',
      label: 'Settings & Alerts',
      icon: <Settings className="w-4 h-4 shrink-0" />,
      badge: null,
    },
  ];

  const roles: Array<{ key: UserRole; label: string }> = [
    { key: 'doctor', label: 'Doctor' },
    { key: 'staff', label: 'Staff' },
    { key: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-500/30 dark:selection:text-teal-200">
      {/* DESKTOP COLLAPSIBLE SIDEBAR WITH SPRING PHYSICS */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="hidden md:flex flex-col bg-white border-r border-gray-200 dark:bg-gray-950 dark:border-teal-900/60 sticky top-0 h-screen z-30 select-none overflow-hidden"
      >
        {/* Sidebar Header Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-teal-900/60 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 overflow-hidden focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none rounded-xl"
            title="AegisHealth AI Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shadow-glow-teal shrink-0">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight block">
                  AegisHealth AI
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block">
                  NIET Greater Noida
                </span>
              </motion.div>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-500 hover:text-gray-900 hover:border-teal-500 dark:bg-slate-900 dark:border-slate-700/60 dark:text-slate-400 dark:hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1.5 scrollbar-none">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none ${
                  isActive
                    ? 'text-teal-800 dark:text-teal-300 font-bold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-teal-50 border border-teal-200 dark:bg-teal-500/20 dark:border-teal-500/40 rounded-xl shadow-2xs"
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <div className={`relative z-10 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 group-hover:text-gray-900 dark:text-slate-400 dark:group-hover:text-white'}`}>
                  {link.icon}
                </div>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-between truncate relative z-10"
                  >
                    <span className="truncate">{link.label}</span>
                    {link.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          link.badgeAlert && criticalAlertCount > 0
                            ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 animate-pulse'
                            : 'bg-white text-teal-700 border border-teal-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </motion.div>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Mini Profile / Logout in Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-teal-900/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-coral-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[130px]">
                    {user?.full_name}
                  </p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono capitalize">
                    {role} • {user?.department || 'Medicine'}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* MOBILE DRAWER WITH BACKDROP (Supports 320px wide) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/30 dark:bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white border-r border-gray-200 dark:bg-gray-950 dark:border-teal-800 z-50 flex flex-col p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-teal-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span className="font-black text-sm text-gray-900 dark:text-white">AegisHealth AI</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      location.pathname === link.to
                        ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-teal-900/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.full_name}</p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 capitalize">{role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:text-red-500 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50 dark:bg-transparent">
        {/* TOP BAR WITH BREADCRUMB & LOGGED-IN ROLE */}
        <header className="h-16 border-b border-gray-200 bg-white/95 dark:border-teal-900/60 dark:bg-gray-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-2 shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 dark:bg-slate-900 dark:border-teal-800/80 dark:text-slate-300 dark:hover:text-white"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-1.5 text-xs truncate">
              <Link
                to="/"
                className="text-gray-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-300 transition-colors flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-coral-400 rounded"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </Link>
              <span className="text-gray-300 dark:text-slate-600">/</span>
              <span className="text-gray-900 dark:text-white font-bold truncate">{currentTitle}</span>
            </nav>
          </div>

          {/* Right: Role Switcher & Keyboard Shortcut Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Role Switcher */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-900/90 p-1 rounded-xl border border-gray-200 dark:border-teal-800/60 shadow-sm">
              {roles.map((r) => {
                const isActive = role === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => switchRole(r.key)}
                    className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
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
              aria-label="Keyboard Shortcuts"
            >
              <Command className="w-4 h-4" />
            </button>

            {/* Global Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-teal-500 dark:bg-slate-900/80 dark:border-teal-800/60 dark:text-slate-300 dark:hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-coral-400 focus-visible:outline-none"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-teal-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-teal-900/80">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-coral-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.full_name?.charAt(0) || 'D'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[110px]">
                  {user?.full_name?.split(',')[0]}
                </p>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 capitalize font-medium">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Shell View Content with Framer Motion Page Transition */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

