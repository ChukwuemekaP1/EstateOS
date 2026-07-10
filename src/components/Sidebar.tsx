import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  LayoutDashboard, 
  Home, 
  Database, 
  Cpu, 
  FileText, 
  Video, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { User, Document, Report } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  documents: Document[];
  reports: Report[];
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  onLogout,
  documents,
  reports
}: SidebarProps) {
  // Navigation configurations
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'knowledge-base', label: 'Company Intelligence', icon: Database },
    { id: 'ai-agents', label: 'AI Operations', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'content-studio', label: 'Content Studio', icon: Video },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Dynamic Statistics Calculations for the USAGE OVERVIEW (as seen in screenshot bottom-left)
  const aiCreditsPercent = 78; // constant or reactive
  const storageUsedBytes = documents.reduce((sum, doc) => sum + doc.size, 0);
  const totalStorageCapacityBytes = 100 * 1024 * 1024; // 100MB capacity for sandbox
  const storagePercent = Math.min(Math.round((storageUsedBytes / totalStorageCapacityBytes) * 100), 100) || 12; // fallback to 12% if 0
  const reportsCountPercent = Math.min(Math.round((reports.length / 20) * 100), 100) || 45; // limit 20 reports max, fallback to 45% if 0

  return (
    <motion.div
      animate={{ width: collapsed ? '80px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-white text-slate-800 border-r border-slate-200 flex flex-col justify-between shrink-0 relative select-none font-sans"
    >
      {/* Top Brand Logo */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-600/10 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  EstateOS
                </span>
                <span className="text-[10px] text-slate-400 font-medium font-mono leading-none mt-0.5 uppercase tracking-wider">
                  Real Estate Intelligence OS
                </span>
              </motion.div>
            )}
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition hidden md:block"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                }`} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
                
                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-16 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Usage Overview & User Profile at bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
        {/* Usage Overview (Only shown if NOT collapsed) */}
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-white border border-slate-200 rounded-xl space-y-3"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Usage Overview
            </div>
            
            {/* AI Credits */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">AI Credits</span>
                <span className="text-slate-700 font-mono">{aiCreditsPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                  style={{ width: `${aiCreditsPercent}%` }} 
                />
              </div>
            </div>

            {/* Storage */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Storage</span>
                <span className="text-slate-700 font-mono">{storagePercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: `${storagePercent}%` }} 
                />
              </div>
            </div>

            {/* Reports */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Reports Limit</span>
                <span className="text-slate-700 font-mono">{reportsCountPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${reportsCountPercent}%` }} 
                />
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* User Profile Info Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/10 shrink-0"
              referrerPolicy="no-referrer"
            />
            {!collapsed && (
              <div className="truncate text-left">
                <div className="text-sm font-semibold text-slate-900 leading-tight truncate">
                  {user.name}
                </div>
                <div className="text-xs text-slate-400 font-mono leading-none mt-0.5">
                  {user.role}
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Logout"
              aria-label="Logout button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
