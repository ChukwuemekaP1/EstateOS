import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  Moon, 
  Sun, 
  Sparkles,
  Building2,
  FileText,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { User, Property, Document, Report } from '../types';

interface TopNavProps {
  user: User;
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  properties: Property[];
  documents: Document[];
  reports: Report[];
  setActiveTab: (tab: string) => void;
  setSelectedPropertyId: (id: string) => void;
  setSearchOpen: (open: boolean) => void;
  searchOpen: boolean;
}

export default function TopNav({
  user,
  workspaceName,
  setWorkspaceName,
  properties,
  documents,
  reports,
  setActiveTab,
  setSelectedPropertyId,
  setSearchOpen,
  searchOpen
}: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/ai/notifications');
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {
      console.warn('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/ai/notifications/read-all', { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Hardcoded workspaces representing division nodes
  const workspaces = [
    'Delta State Expansion Node',
    'Lagos Prime Asset Port',
    'Abuja Executive Hub',
    'Global Holding Station'
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Perform dynamic filtering based on search query
  const searchResults = searchQuery ? {
    properties: properties.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase())),
    documents: documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())),
    reports: reports.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
  } : null;

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (tab: string, propId?: string) => {
    setActiveTab(tab);
    if (propId) {
      setSelectedPropertyId(propId);
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-40 select-none relative">
      
      {/* Left Area: Workspace Selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 hover:border-slate-300 transition cursor-pointer relative group">
          <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-semibold font-mono tracking-wide max-w-[180px] md:max-w-xs truncate">
            {workspaceName}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition shrink-0" />
          
          {/* Workspace dropdown menu */}
          <div className="absolute top-10 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-1 w-64 hidden group-hover:block z-50">
            <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Switch Division Node
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws}
                onClick={() => setWorkspaceName(ws)}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                  workspaceName === ws 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {ws}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Area: Global Search Station */}
      <div className="flex-1 max-w-lg mx-6 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties, documents, or reports... (⌘K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition text-slate-900"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {searchOpen && searchQuery && searchResults && (
          <div className="absolute top-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-[420px] overflow-y-auto">
            <div className="p-2 border-b border-slate-100 bg-slate-50 text-[10px] font-mono text-indigo-600 flex items-center justify-between">
              <span>ESTATEOS SYNAPSE FILTER</span>
              <span>ESC to dismiss</span>
            </div>

            {/* Properties Results */}
            <div className="p-2 border-b border-slate-100">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Properties ({searchResults.properties.length})
              </div>
              {searchResults.properties.length === 0 ? (
                <div className="px-2 py-1 text-xs text-slate-400 font-mono">No nodes match...</div>
              ) : (
                searchResults.properties.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleResultClick('properties', p.id)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                      <span className="text-[10px] text-slate-400 truncate">- {p.location}</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))
              )}
            </div>

            {/* Documents Results */}
            <div className="p-2 border-b border-slate-100">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Knowledge Base ({searchResults.documents.length})
              </div>
              {searchResults.documents.length === 0 ? (
                <div className="px-2 py-1 text-xs text-slate-400 font-mono">No documents match...</div>
              ) : (
                searchResults.documents.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleResultClick('knowledge-base')}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Database className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{d.name}</span>
                      <span className="text-[10px] text-indigo-600 font-mono uppercase bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">{d.type}</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))
              )}
            </div>

            {/* Reports Results */}
            <div className="p-2">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Reports History ({searchResults.reports.length})
              </div>
              {searchResults.reports.length === 0 ? (
                <div className="px-2 py-1 text-xs text-slate-400 font-mono">No reports match...</div>
              ) : (
                searchResults.reports.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleResultClick('reports')}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{r.title}</span>
                      <span className="text-[10px] text-emerald-600 font-mono uppercase bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">{r.status}</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Area: Controls & Profile */}
      <div className="flex items-center space-x-4">
        
        {/* Toggle Theme Mock */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
        </button>

        {/* Notifications Hub */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:border-slate-300 transition relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-600 text-white text-[9px] font-extrabold flex items-center justify-center rounded-full ring-2 ring-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {notificationsOpen && (
            <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl w-80 p-2.5 space-y-2 z-50">
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Orchestrator Alerts</span>
                {unreadCount > 0 && (
                  <button onClick={handleClearAll} className="text-[10px] text-indigo-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-2 rounded-lg text-left text-xs cursor-pointer hover:bg-slate-50 transition border ${
                        !n.read ? 'bg-indigo-50/40 border-l-2 border-indigo-500 border-indigo-100' : 'bg-slate-50/30 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${!n.read ? 'text-indigo-800' : 'text-slate-700'}`}>{n.title}</span>
                        <span className="text-[8px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">No active alerts recorded.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workspace Security Tier Level (Visual luxury) */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">
            SECURE STACK V1
          </span>
        </div>

        {/* User Small Info */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/10"
            referrerPolicy="no-referrer"
          />
          <div className="text-left hidden md:block">
            <span className="block text-xs font-semibold text-slate-700 leading-tight truncate max-w-[80px]">
              {user.name.split(' ')[0]}
            </span>
            <span className="block text-[9px] text-slate-400 uppercase tracking-wide font-mono leading-none">
              {user.role}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}
