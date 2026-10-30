import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCog,
  Boxes,
  Cpu,
  GitFork,
  Globe2,
  Box,
} from 'lucide-react';

interface SidebarProps {
  criticalAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  criticalAlertCount = 0,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.replace('/', '') || 'patients';

  const tabs = [
    {
      path: '/patients',
      id: 'patients',
      label: 'Patient Management',
      icon: <Users className="w-4 h-4" />,
      badge: null,
    },
    {
      path: '/staff',
      id: 'staff',
      label: 'Staff Management',
      icon: <UserCog className="w-4 h-4" />,
      badge: null,
    },
    {
      path: '/resources',
      id: 'resources',
      label: 'Resource Management',
      icon: <Boxes className="w-4 h-4" />,
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} Alerts` : null,
      badgeAlert: true,
    },
    {
      path: '/triage',
      id: 'triage',
      label: 'AI Decision Engine',
      icon: <Cpu className="w-4 h-4" />,
      badge: 'CF + Fuzzy',
    },
    {
      path: '/search',
      id: 'search',
      label: 'Graph Search (BFS/DFS/A*)',
      icon: <GitFork className="w-4 h-4" />,
      badge: '4 Algos',
    },
    {
      path: '/digital-twin',
      id: 'digital-twin',
      label: '3D Campus Twin',
      icon: <Box className="w-4 h-4" />,
      badge: 'R3F',
    },
    {
      path: '/sdg',
      id: 'sdg',
      label: 'SDG 3 & NIET Course',
      icon: <Globe2 className="w-4 h-4" />,
      badge: 'Impact',
    },
  ];

  return (
    <nav className="w-full bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 sticky top-16 z-30 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-start gap-1 overflow-x-auto py-2.5 scrollbar-none">
        {tabs.map(tab => {
          const isActive = currentPath === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-clinical-500/20 text-clinical-300 border border-clinical-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-clinical-400' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tab.badgeAlert && criticalAlertCount > 0
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
