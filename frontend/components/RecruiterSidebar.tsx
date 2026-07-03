import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RecruiterSidebar: React.FC = () => {
  const location = useLocation();
  const { jobs, applications } = useApp();

  const menuItems = [
    {
      name: 'Overview',
      path: '/recruiter-dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Post a Job',
      path: '/post-job',
      icon: PlusCircle,
      badge: null
    },
    {
      name: 'Manage Jobs',
      path: '/manage-jobs',
      icon: Settings,
      badge: jobs.length > 0 ? jobs.length.toString() : null
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs shrink-0 self-start">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Recruiter Menu</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-blue-500 text-white' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
