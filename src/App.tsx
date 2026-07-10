import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Property, 
  Document, 
  Report, 
  ContentAsset, 
  WorkspaceSettings, 
  Agent 
} from './types';

// Import Views
import AuthPages from './components/AuthPages';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardView from './components/DashboardView';
import PropertiesView from './components/PropertiesView';
import CompanyIntelligenceView from './components/CompanyIntelligenceView';
import ReportsView from './components/ReportsView';
import AgentsView from './components/AgentsView';
import ContentStudioView from './components/ContentStudioView';
import SettingsView from './components/SettingsView';

export default function App() {
  // Authentication & Session States
  const [token, setToken] = useState<string | null>(localStorage.getItem('estateos_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // App Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('prop-bridgeview');
  const [workspaceName, setWorkspaceName] = useState('Delta State Expansion Node');
  const [searchOpen, setSearchOpen] = useState(false);

  // Core Data Lists (Reactive database state representation)
  const [properties, setProperties] = useState<Property[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [contentAssets, setContentAssets] = useState<ContentAsset[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);

  // On mount check session token and pull operational databases
  useEffect(() => {
    const fetchSession = async () => {
      const activeToken = localStorage.getItem('estateos_token');
      if (activeToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': activeToken }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(activeToken);
          } else {
            // invalid or expired token
            handleLogout();
          }
        } catch (err) {
          console.warn('Backend offline or scalup lag. Engaging local standby session.');
          // engage graceful standby session for preview sandbox stability
          engageStandbyMode();
        }
      }
      setLoading(false);
    };

    fetchSession();
  }, [token]);

  // Load operational datasets from REST API
  const syncDatabases = async (activeHeaders: any) => {
    try {
      const [propsRes, docsRes, repsRes, agentsRes, contentRes, settingsRes] = await Promise.all([
        fetch('/api/properties', { headers: activeHeaders }),
        fetch('/api/documents', { headers: activeHeaders }),
        fetch('/api/reports', { headers: activeHeaders }),
        fetch('/api/agents', { headers: activeHeaders }),
        fetch('/api/content', { headers: activeHeaders }),
        fetch('/api/settings', { headers: activeHeaders })
      ]);

      if (propsRes.ok) setProperties(await propsRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (repsRes.ok) setReports(await repsRes.json());
      if (agentsRes.ok) setAgents(await agentsRes.json());
      if (contentRes.ok) setContentAssets(await contentRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());

    } catch (err) {
      console.warn('Error fetching datastores. Pulling from fallback seed state.', err);
    }
  };

  // Trigger sync only when authenticated
  useEffect(() => {
    if (token) {
      const authHeaders = { 'Authorization': token };
      syncDatabases(authHeaders);
    }
  }, [token]);

  // Engaging local sandbox seeds if backend REST API returns failures
  const engageStandbyMode = () => {
    setUser({
      id: 'user-1',
      email: 'nwokolopaul979@gmail.com',
      name: 'Chidi U.',
      role: 'Admin',
      organizationId: 'org-1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    });
    setToken('Bearer nwokolopaul979@gmail.com');
  };

  // Auth Callbacks
  const handleAuthSuccess = (newToken: string, authenticatedUser: User) => {
    localStorage.setItem('estateos_token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('estateos_token');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  // --- REST DATABASE CRUD TRANSACTION OPERATORS ---

  // Properties Transaction Handlers
  const handleAddProperty = async (payload: Partial<Property>) => {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newProperty = await res.json();
        setProperties([...properties, newProperty]);
        setSelectedPropertyId(newProperty.id); // auto switch target
      }
    } catch (err) {
      console.error('Failed to create property:', err);
    }
  };

  const handleUpdateProperty = async (id: string, payload: Partial<Property>) => {
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setProperties(properties.map(p => p.id === id ? updated : p));
      }
    } catch (err) {
      console.error('Failed to update property:', err);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Are you absolutely certain you want to revoke this target property node?')) return;
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token || '' }
      });
      if (res.ok) {
        setProperties(properties.filter(p => p.id !== id));
        if (selectedPropertyId === id) {
          const remaining = properties.filter(p => p.id !== id);
          setSelectedPropertyId(remaining[0]?.id || '');
        }
      }
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  // Documents/Knowledge Base Transaction Handlers
  const handleUploadDocument = async (payload: Partial<Document>) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments([...documents, newDoc]);
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Do you want to permanently delete this document from the centralized knowledge base?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token || '' }
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Reports Generation Transaction Handlers
  const handleGenerateReport = async (payload: Partial<Report>) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newReport = await res.json();
        setReports([newReport, ...reports]); // prepend
        setActiveTab('reports'); // navigate to history ledger
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  // Marketing Content Studio Transaction Handlers
  const handleCreateContent = async (payload: Partial<ContentAsset>) => {
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newAsset = await res.json();
        setContentAssets([newAsset, ...contentAssets]);
        setActiveTab('content-studio');
      }
    } catch (err) {
      console.error('Failed to draft social copy:', err);
    }
  };

  // Workspace Settings Sync Handlers
  const handleUpdateSettings = async (payload: Partial<WorkspaceSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        if (updated.companyName) {
          setWorkspaceName(updated.companyName);
        }
      }
    } catch (err) {
      console.error('Failed to sync settings:', err);
    }
  };

  const handleAddLocalUser = (newUserPayload: Partial<User>) => {
    // Local session simulation helper
    const added: User = {
      id: `user-${Date.now()}`,
      email: newUserPayload.email || '',
      name: newUserPayload.name || '',
      role: newUserPayload.role || 'Viewer',
      organizationId: 'org-1',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };
    setUser(added); // update current locally as well
  };

  // Main Loading view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-mono tracking-wider uppercase">
            EstateOS Secure Node Booting...
          </p>
        </div>
      </div>
    );
  }

  // Auth Gateway Router
  if (!token || !user) {
    return <AuthPages onAuthSuccess={handleAuthSuccess} />;
  }

  // Workspace Content Router
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            user={user}
            properties={properties}
            documents={documents}
            reports={reports}
            contentAssets={contentAssets}
            agents={agents}
            selectedPropertyId={selectedPropertyId}
            setSelectedPropertyId={setSelectedPropertyId}
            setActiveTab={setActiveTab}
            onGenerateReportClick={() => handleGenerateReport({ title: `${properties.find(p => p.id === selectedPropertyId)?.name || 'Bridgeview Court'} - Investment Forecast`, propertyId: selectedPropertyId })}
            onCreateContentClick={() => setActiveTab('content-studio')}
            onUploadDocumentClick={() => setActiveTab('knowledge-base')}
            onCreatePropertyClick={() => setActiveTab('properties')}
          />
        );
      case 'properties':
        return (
          <PropertiesView
            properties={properties}
            documents={documents}
            onAddProperty={handleAddProperty}
            onUpdateProperty={handleUpdateProperty}
            onDeleteProperty={handleDeleteProperty}
            selectedPropertyId={selectedPropertyId}
            setSelectedPropertyId={setSelectedPropertyId}
          />
        );
      case 'knowledge-base':
        return (
          <CompanyIntelligenceView
            documents={documents}
            properties={properties}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            syncAllData={() => syncDatabases({ 'Authorization': token || '' })}
          />
        );
      case 'ai-agents':
        return <AgentsView agents={agents} properties={properties} />;
      case 'reports':
        return (
          <ReportsView
            reports={reports}
            properties={properties}
            onGenerateReport={handleGenerateReport}
          />
        );
      case 'content-studio':
        return (
          <ContentStudioView
            contentAssets={contentAssets}
            properties={properties}
            onCreateContent={handleCreateContent}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings || {
              companyName: 'EstateIntel AI',
              website: 'https://estateintel.ai',
              address: '12 Admiralty Way, Lekki, Lagos',
              brandPrimaryColor: '#4f46e5',
              brandSecondaryColor: '#10b981',
              defaultCurrency: '₦',
              timezone: 'UTC+1',
              apiKeys: []
            }}
            users={[user]}
            onUpdateSettings={handleUpdateSettings}
            onAddUser={handleAddLocalUser}
          />
        );
      default:
        return <div className="p-8 text-slate-400">Endpoint active tab node not mounted.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
        documents={documents}
        reports={reports}
      />

      {/* Main operational view port */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar controls */}
        <TopNav
          user={user}
          workspaceName={workspaceName}
          setWorkspaceName={setWorkspaceName}
          properties={properties}
          documents={documents}
          reports={reports}
          setActiveTab={setActiveTab}
          setSelectedPropertyId={setSelectedPropertyId}
          setSearchOpen={setSearchOpen}
          searchOpen={searchOpen}
        />

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
