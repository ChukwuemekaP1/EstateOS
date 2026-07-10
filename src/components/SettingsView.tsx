import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Building, 
  Palette, 
  FolderGit, 
  Users, 
  Key, 
  Sliders, 
  Plus, 
  CheckCircle,
  Lock,
  Globe,
  Trash2
} from 'lucide-react';
import { WorkspaceSettings, User, UserRole } from '../types';

interface SettingsViewProps {
  settings: WorkspaceSettings;
  users: User[];
  onUpdateSettings: (settings: Partial<WorkspaceSettings>) => Promise<void>;
  onAddUser?: (user: Partial<User>) => void; // local helper
}

export default function SettingsView({
  settings,
  users,
  onUpdateSettings,
  onAddUser
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'api' | 'preferences'>('profile');
  const [savedMessage, setSavedMessage] = useState('');

  // Local Form states (Profile)
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [website, setWebsite] = useState(settings.website);
  const [address, setAddress] = useState(settings.address);
  const [primaryColor, setPrimaryColor] = useState(settings.brandPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.brandSecondaryColor);

  // Prefs Form States
  const [currency, setCurrency] = useState(settings.defaultCurrency);
  const [timezone, setTimezone] = useState(settings.timezone);

  // Team Invite Form States
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Viewer');

  // API Key creation
  const [apiKeyName, setApiKeyName] = useState('');

  const triggerSaveNotify = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      companyName,
      website,
      address,
      brandPrimaryColor: primaryColor,
      brandSecondaryColor: secondaryColor
    });
    triggerSaveNotify('Profile settings successfully persisted.');
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      defaultCurrency: currency,
      timezone
    });
    triggerSaveNotify('Localization preferences persisted.');
  };

  const handleAddKey = async () => {
    if (!apiKeyName) return;
    const newKey = {
      id: `key-${Date.now()}`,
      name: apiKeyName,
      key: `AIzaSy${Math.random().toString(36).substring(2, 10).toUpperCase()}...xxxx`,
      createdAt: new Date().toISOString()
    };
    const updatedKeys = [...(settings.apiKeys || []), newKey];
    await onUpdateSettings({ apiKeys: updatedKeys });
    setApiKeyName('');
    triggerSaveNotify('Secure API endpoint successfully registered.');
  };

  const handleRemoveKey = async (id: string) => {
    const updatedKeys = (settings.apiKeys || []).filter(k => k.id !== id);
    await onUpdateSettings({ apiKeys: updatedKeys });
    triggerSaveNotify('API endpoint key revoked.');
  };

  return (
    <div className="space-y-6 text-slate-800 p-6 max-w-7xl mx-auto font-sans text-left">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" />
          Settings Console
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure operational settings, workspace divisions, API secrets, and team members.
        </p>
      </div>

      {/* Main Settings Navigation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Navigation Panel */}
        <div className="space-y-2 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            <span>Company & Brand Colors</span>
          </button>
          
          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'team' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Team & Station Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'api' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Key className="h-4.5 w-4.5" />
            <span>API Keys & Security</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'preferences' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Sliders className="h-4.5 w-4.5" />
            <span>Regional Preferences</span>
          </button>
        </div>

        {/* Dynamic Workspace forms */}
        <div className="lg:col-span-3">
          
          {savedMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl text-xs mb-4 flex items-center space-x-2 animate-fade-in shadow-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>{savedMessage}</span>
            </div>
          )}

          {/* TAB 1: Company Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block pb-1 border-b border-slate-100">
                Company Profile & Assets
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Corporate Website</label>
                  <input
                    type="text"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Headquarters Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Brand Colors Grid */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-2.5">
                  Corporate Brand Colors Customization
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Primary Accents Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-8 w-12 bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Secondary Highlights Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-8 w-12 bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Save Profile Configuration
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Users and Team */}
          {activeTab === 'team' && (
            <div className="space-y-4 animate-fade-in">
              {/* Invite Station Form */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block pb-1 border-b border-slate-100">
                  Onboard Team Station Node
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                  <input
                    type="email"
                    placeholder="Work email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                  <div className="flex gap-2">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as UserRole)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Executive">Executive</option>
                      <option value="Sales">Sales</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (inviteName && inviteEmail && onAddUser) {
                          onAddUser({ name: inviteName, email: inviteEmail, role: inviteRole });
                          setInviteName('');
                          setInviteEmail('');
                          triggerSaveNotify('Invitation registered.');
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 rounded-xl transition cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>

              {/* Stations List */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-mono font-semibold uppercase tracking-wider">
                      <th className="p-4">Operational Station Name</th>
                      <th className="p-4">Work Email</th>
                      <th className="p-4">Designated Role Node</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition text-slate-600">
                        <td className="p-4 font-semibold text-slate-800">{u.name}</td>
                        <td className="p-4 text-slate-500 font-mono">{u.email}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-50 border border-slate-200 text-indigo-750">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            AUTHENTICATED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: API keys */}
          {activeTab === 'api' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block pb-1 border-b border-slate-100">
                  Register Secure API Secret Endpoint
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Endpoint Provider Name (e.g. Gemini Developer API)"
                    value={apiKeyName}
                    onChange={(e) => setApiKeyName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddKey}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 rounded-xl transition shrink-0 cursor-pointer"
                  >
                    Generate API Endpoint key
                  </button>
                </div>
              </div>

              {/* Endpoint Table list */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-mono font-semibold uppercase tracking-wider">
                      <th className="p-4">API Endpoint Provider</th>
                      <th className="p-4">Secure Key String</th>
                      <th className="p-4">Date Registered</th>
                      <th className="p-4 text-right">Revocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(settings.apiKeys || []).map(k => (
                      <tr key={k.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition text-slate-600">
                        <td className="p-4 font-semibold text-slate-800">{k.name}</td>
                        <td className="p-4 text-slate-500 font-mono tracking-wider">{k.key}</td>
                        <td className="p-4 text-slate-500 font-mono">{new Date(k.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleRemoveKey(k.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Revoke key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Regional Preferences */}
          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSubmit} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm animate-fade-in">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block pb-1 border-b border-slate-100">
                Regional Preferences Localization
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Regional Currency Sign</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  >
                    <option value="₦">Naira (₦)</option>
                    <option value="$">US Dollar ($)</option>
                    <option value="£">British Pound (£)</option>
                    <option value="€">Euro (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Division Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  >
                    <option value="UTC+1">West African Time (UTC+1)</option>
                    <option value="UTC+0">GMT (UTC+0)</option>
                    <option value="EST">Eastern Standard Time (UTC-5)</option>
                    <option value="PST">Pacific Standard Time (UTC-8)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Persist Regional Preferences
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
