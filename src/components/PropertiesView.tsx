import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Tag, 
  Building2, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  Map, 
  HelpCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  Copy,
  Check,
  Users,
  MessageSquare,
  Share2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Grid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Archive,
  Layers,
  DollarSign,
  Compass,
  FileSpreadsheet,
  Link,
  Unlink,
  Image as ImageIcon,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  ChevronRight,
  User,
  Info,
  SlidersHorizontal,
  ChevronDown,
  RefreshCw,
  PlusCircle,
  X,
  PlayCircle
} from 'lucide-react';
import { Property, PropertyStatus, NearbyLandmark, InfrastructureItem, Document, Report, ContentAsset } from '../types';
import PropertyMockMap from './PropertyMockMap';
import CreatePropertyWizard from './CreatePropertyWizard';

interface PropertiesViewProps {
  properties: Property[];
  documents: Document[];
  onAddProperty: (property: Partial<Property>) => Promise<void>;
  onUpdateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  onDeleteProperty: (id: string) => Promise<void>;
  setSelectedPropertyId: (id: string) => void;
  selectedPropertyId: string;
}

export default function PropertiesView({
  properties,
  documents = [],
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  setSelectedPropertyId,
  selectedPropertyId
}: PropertiesViewProps) {
  // Navigation & View Toggles
  const [layoutMode, setLayoutMode] = useState<'grid' | 'table'>('grid');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    'overview' | 'knowledge' | 'media' | 'market' | 'investment' | 'content' | 'reports' | 'activity' | 'settings'
  >('overview');

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterState, setFilterState] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Operations
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  // Modals & Overlay triggers
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [showQuickActionModal, setShowQuickActionModal] = useState<string | null>(null);
  const [showLinkDocModal, setShowLinkDocModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Property Intelligence Reports & Execution Status
  const [intelligenceReports, setIntelligenceReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [enablePublicResearch, setEnablePublicResearch] = useState(false);
  const [compareReportId, setCompareReportId] = useState<string | null>(null);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [executionDetails, setExecutionDetails] = useState<any>(null);

  // Market & Investment Intelligence Reports & Execution Status
  const [marketInvestmentReports, setMarketInvestmentReports] = useState<any[]>([]);
  const [loadingMarketReports, setLoadingMarketReports] = useState(false);
  const [selectedMarketReportId, setSelectedMarketReportId] = useState<string | null>(null);
  const [runningMarketAnalysis, setRunningMarketAnalysis] = useState(false);
  const [activeMarketExecutionId, setActiveMarketExecutionId] = useState<string | null>(null);
  const [marketExecutionDetails, setMarketExecutionDetails] = useState<any>(null);
  const [activePersonaIdx, setActivePersonaIdx] = useState(0);
  const [copiedPitchKey, setCopiedPitchKey] = useState<string | null>(null);

  const fetchReports = (propertyId: string) => {
    setLoadingReports(true);
    fetch(`/api/properties/${propertyId}/intelligence-reports`)
      .then(res => res.json())
      .then(data => {
        setIntelligenceReports(data);
        if (data.length > 0) {
          setSelectedReportId(data[0].id);
        } else {
          setSelectedReportId(null);
        }
        setLoadingReports(false);
      })
      .catch(err => {
        console.error('Failed to fetch intelligence reports:', err);
        setLoadingReports(false);
      });
  };

  const fetchMarketReports = (propertyId: string) => {
    setLoadingMarketReports(true);
    fetch(`/api/properties/${propertyId}/market-investment-reports`)
      .then(res => res.json())
      .then(data => {
        setMarketInvestmentReports(data);
        if (data.length > 0) {
          setSelectedMarketReportId(data[0].id);
        } else {
          setSelectedMarketReportId(null);
        }
        setLoadingMarketReports(false);
      })
      .catch(err => {
        console.error('Failed to fetch market/investment reports:', err);
        setLoadingMarketReports(false);
      });
  };

  useEffect(() => {
    if (selectedPropertyId) {
      fetchReports(selectedPropertyId);
      fetchMarketReports(selectedPropertyId);
    } else {
      setIntelligenceReports([]);
      setSelectedReportId(null);
      setMarketInvestmentReports([]);
      setSelectedMarketReportId(null);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    let interval: any;
    if (runningAnalysis && activeExecutionId) {
      interval = setInterval(() => {
        fetch(`/api/ai/executions/${activeExecutionId}`)
          .then(res => res.json())
          .then(data => {
            setExecutionDetails(data);
            if (data.status === 'Completed') {
              setRunningAnalysis(false);
              setActiveExecutionId(null);
              setExecutionDetails(null);
              if (selectedPropertyId) {
                fetchReports(selectedPropertyId);
              }
            } else if (data.status === 'Failed') {
              setRunningAnalysis(false);
              setActiveExecutionId(null);
              alert(`Analysis failed: ${data.error || 'Unknown error'}`);
            }
          })
          .catch(err => {
            console.error('Error polling execution:', err);
          });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [runningAnalysis, activeExecutionId, selectedPropertyId]);

  useEffect(() => {
    let interval: any;
    if (runningMarketAnalysis && activeMarketExecutionId) {
      interval = setInterval(() => {
        fetch(`/api/ai/executions/${activeMarketExecutionId}`)
          .then(res => res.json())
          .then(data => {
            setMarketExecutionDetails(data);
            if (data.status === 'Completed') {
              setRunningMarketAnalysis(false);
              setActiveMarketExecutionId(null);
              setMarketExecutionDetails(null);
              if (selectedPropertyId) {
                fetchMarketReports(selectedPropertyId);
                // Refresh property details
                fetch(`/api/properties/${selectedPropertyId}`)
                  .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('API Error');
                  })
                  .then(pData => setDetails(pData))
                  .catch(e => console.error(e));
              }
            } else if (data.status === 'Failed') {
              setRunningMarketAnalysis(false);
              setActiveMarketExecutionId(null);
              alert(`Market analysis failed: ${data.error || 'Unknown error'}`);
            }
          })
          .catch(err => {
            console.error('Error polling market execution:', err);
          });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [runningMarketAnalysis, activeMarketExecutionId, selectedPropertyId]);

  const handleRunPropertyIntelligence = async () => {
    if (!selectedPropertyId) return;
    setRunningAnalysis(true);
    setExecutionDetails({
      status: 'Queued',
      steps: [
        { name: 'Supervisor Orchestration', status: 'Running' },
        { name: 'Planning & Agent Selection', status: 'Queued' },
        { name: 'Context Gathering', status: 'Queued' },
        { name: 'Gemini Generation', status: 'Queued' },
        { name: 'Validation & Storage', status: 'Queued' }
      ],
      logs: [{ message: 'Initializing Multi-Agent Intelligence pipeline...', timestamp: new Date().toISOString() }]
    });

    try {
      const res = await fetch('/api/ai/property-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          enablePublicResearch
        })
      });
      if (!res.ok) throw new Error('Failed to trigger analysis');
      const data = await res.json();
      setActiveExecutionId(data.id);
    } catch (err: any) {
      console.error(err);
      setRunningAnalysis(false);
      alert(`Failed to start analysis: ${err.message}`);
    }
  };

  const handleRunMarketInvestment = async () => {
    if (!selectedPropertyId) return;
    setRunningMarketAnalysis(true);
    setMarketExecutionDetails({
      status: 'Queued',
      steps: [
        { name: 'Supervisor Orchestration', status: 'Running' },
        { name: 'Planning & Agent Selection', status: 'Queued' },
        { name: 'Context & Intelligence Gathering', status: 'Queued' },
        { name: 'Gemini Generation', status: 'Queued' },
        { name: 'Validation & Storage', status: 'Queued' }
      ],
      logs: [{ message: 'Initializing Multi-Agent Market & Investment pipeline...', timestamp: new Date().toISOString() }]
    });

    try {
      const res = await fetch('/api/ai/market-investment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedPropertyId
        })
      });
      if (!res.ok) throw new Error('Failed to trigger market analysis');
      const data = await res.json();
      setActiveMarketExecutionId(data.id);
    } catch (err: any) {
      console.error(err);
      setRunningMarketAnalysis(false);
      alert(`Failed to start market analysis: ${err.message}`);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this property intelligence report?')) return;
    try {
      const res = await fetch(`/api/intelligence-reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedPropertyId) fetchReports(selectedPropertyId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMarketReport = async (reportId: string) => {
    if (!window.confirm('Are you sure you want to delete this Market & Investment Intelligence report?')) return;
    try {
      const res = await fetch(`/api/market-investment-reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedPropertyId) fetchMarketReports(selectedPropertyId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPitch = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitchKey(key);
    setTimeout(() => setCopiedPitchKey(null), 2000);
  };

  // Property Unified Details (Fetched from server with local standby fallback)
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Inline inputs state inside detail tabs
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'Image' | 'Video' | 'Drone' | 'Site Visit' | 'Master Plan' | 'Layout Drawing'>('Image');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newRelPropertyId, setNewRelPropertyId] = useState('');
  const [newRelDescription, setNewRelDescription] = useState('');

  // Fetch detailed unified sub-resources for selected property
  useEffect(() => {
    if (selectedPropertyId) {
      setLoadingDetails(true);
      fetch(`/api/properties/${selectedPropertyId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('API Offline');
        })
        .then(data => {
          setDetails(data);
          setLoadingDetails(false);
        })
        .catch(err => {
          // Robust client standby fallback
          const prop = properties.find(p => p.id === selectedPropertyId) || properties[0];
          if (prop) {
            setDetails({
              ...prop,
              statistics: {
                propertyId: prop.id,
                expectedAppreciation: '14% - 18% p.a.',
                investmentScore: 88,
                riskScore: 24,
                roiEstimate: '19.2% Net Yield',
                rentalPotential: '₦4.5M - ₦6.0M/yr',
                demandLevel: 'High',
                marketTrend: 'Bullish',
                confidenceScore: 92
              },
              media: [
                { id: 'm1', propertyId: prop.id, title: 'Drone Survey View', description: 'Topological outline drawing', type: 'Drone', url: prop.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80', tags: ['Survey', 'Drone'], uploadDate: prop.createdAt },
                { id: 'm2', propertyId: prop.id, title: 'Structural Master Plan', description: 'Estate drawing layout', type: 'Master Plan', url: prop.images[1] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80', tags: ['Master Plan'], uploadDate: prop.createdAt }
              ],
              relationships: [
                { id: 'r1', propertyId: prop.id, relatedId: 'neigh-1', relatedType: 'Neighbourhood', relatedName: 'Lekki Phase 1 Node', description: 'Transit and drainage infrastructure compatibility link', createdAt: prop.createdAt }
              ],
              timeline: [
                { id: 't1', propertyId: prop.id, title: 'Property Onboarded', type: 'Property Created', description: `Registered property "${prop.name}" under reference ${prop.internalReferenceId || prop.id} in EstateOS.`, author: 'Chidi U.', createdAt: prop.createdAt }
              ],
              settings: {
                propertyId: prop.id,
                visibility: 'Public',
                isArchived: prop.status === 'Archived',
                isDeleted: false,
                permissions: ['Admin', 'Sales', 'Marketing', 'Executive', 'Viewer']
              }
            });
          }
          setLoadingDetails(false);
        });
    }
  }, [selectedPropertyId, properties]);

  // Clean form variables
  const handleOpenCreate = () => {
    setEditingProperty(undefined);
    setShowCreateWizard(true);
  };

  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setShowCreateWizard(true);
  };

  // Checkbox bulk triggers
  const handleToggleSelectProperty = (id: string) => {
    if (selectedPropertyIds.includes(id)) {
      setSelectedPropertyIds(selectedPropertyIds.filter(item => item !== id));
    } else {
      setSelectedPropertyIds([...selectedPropertyIds, id]);
    }
  };

  const handleSelectAllProperties = () => {
    if (selectedPropertyIds.length === filteredProperties.length) {
      setSelectedPropertyIds([]);
    } else {
      setSelectedPropertyIds(filteredProperties.map(p => p.id));
    }
  };

  // Bulk Operations
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedPropertyIds.length} properties?`)) return;
    for (const id of selectedPropertyIds) {
      await onDeleteProperty(id);
    }
    setSelectedPropertyIds([]);
  };

  const handleBulkArchive = async () => {
    for (const id of selectedPropertyIds) {
      await fetch(`/api/properties/${id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true })
      });
    }
    setSelectedPropertyIds([]);
    // Reload state
    window.location.reload();
  };

  // Link / unlink documents
  const handleLinkDocument = async (docId: string) => {
    if (!selectedPropertyId) return;
    try {
      const res = await fetch(`/api/properties/${selectedPropertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: [...(details?.documents || []), docId]
        })
      });
      if (res.ok) {
        // update timeline & trigger detail refresh
        await fetch(`/api/properties/${selectedPropertyId}/relationships`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relatedId: docId,
            relatedType: 'Investment',
            relatedName: documents.find(d => d.id === docId)?.name || 'Linked Document',
            description: 'Linked specialized brochure'
          })
        });
        setSelectedPropertyId(selectedPropertyId); // refresh details hook
        setShowLinkDocModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlinkDocument = async (docId: string) => {
    if (!selectedPropertyId) return;
    try {
      const res = await fetch(`/api/properties/${selectedPropertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: (details?.documents || []).filter((id: string) => id !== docId)
        })
      });
      if (res.ok) {
        setSelectedPropertyId(selectedPropertyId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inline media add
  const handleInlineAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl) return;
    try {
      const res = await fetch(`/api/properties/${selectedPropertyId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMediaTitle || 'Inline Asset',
          url: newMediaUrl,
          type: newMediaType,
          tags: ['Inline', newMediaType]
        })
      });
      if (res.ok) {
        setNewMediaUrl('');
        setNewMediaTitle('');
        // trigger reload details
        setSelectedPropertyId(selectedPropertyId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inline slider controls
  const handleUpdateStockUnits = async (val: number) => {
    if (!selectedPropertyId) return;
    try {
      await onUpdateProperty(selectedPropertyId, {
        availableUnits: val
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Filter properties based on controls
  const filteredProperties = properties
    .filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.internalReferenceId?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      const matchesState = filterState === 'All' || p.state === filterState;

      return matchesSearch && matchesCategory && matchesStatus && matchesState;
    })
    .sort((a, b) => {
      const orderMultiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * orderMultiplier;
      }
      if (sortBy === 'price') {
        // basic numeric strip
        const numA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
        return (numA - numB) * orderMultiplier;
      }
      // default: date
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * orderMultiplier;
    });

  // Extract unique states for filters
  const uniqueStates = Array.from(new Set(properties.map(p => p.state))).filter(Boolean);

  // Active Selected Property for workspace view
  const currentProperty = properties.find(p => p.id === selectedPropertyId) || properties[0] || filteredProperties[0];

  return (
    <div className="space-y-6 text-slate-800 p-6 max-w-7xl mx-auto font-sans">
      
      {/* 1. Portfolio Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            Asset Portfolios Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage property nodes, link structural knowledge profiles, and organize digital intelligence catalogs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-indigo-600/10 cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Launch Property Wizard</span>
        </button>
      </div>

      {/* 2. Portfolio Search & Filtering Rail */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search properties by name, reference ID, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Category Select */}
            <div className="flex items-center space-x-1 border border-slate-200 bg-slate-50 rounded-xl px-2.5 py-1">
              <span className="text-slate-400 font-mono text-[9px] uppercase">Cat:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 p-0 text-xs text-slate-700 font-bold focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Residential Estate">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Land">Land</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center space-x-1 border border-slate-200 bg-slate-50 rounded-xl px-2.5 py-1">
              <span className="text-slate-400 font-mono text-[9px] uppercase">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 p-0 text-xs text-slate-700 font-bold focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending Audit</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* State Select */}
            <div className="flex items-center space-x-1 border border-slate-200 bg-slate-50 rounded-xl px-2.5 py-1">
              <span className="text-slate-400 font-mono text-[9px] uppercase">State:</span>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 p-0 text-xs text-slate-700 font-bold focus:outline-none max-w-[100px]"
              >
                <option value="All">All States</option>
                {uniqueStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center space-x-1 border border-slate-200 bg-slate-50 rounded-xl px-2.5 py-1">
              <span className="text-slate-400 font-mono text-[9px] uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 focus:ring-0 p-0 text-xs text-slate-700 font-bold focus:outline-none"
              >
                <option value="date">Date Registered</option>
                <option value="name">Name</option>
                <option value="price">Price Cost</option>
              </select>
            </div>
          </div>

          {/* Toggle Layout */}
          <div className="flex border border-slate-200 rounded-xl p-0.5 bg-slate-50 self-end md:self-auto">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg transition ${layoutMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400'}`}
              title="Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('table')}
              className={`p-1.5 rounded-lg transition ${layoutMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400'}`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Counter & Bulk Actions toolbar */}
        {selectedPropertyIds.length > 0 && (
          <div className="flex items-center justify-between bg-slate-900 text-white p-2.5 rounded-xl text-xs font-mono tracking-wider animate-fade-in shadow-lg">
            <div className="flex items-center space-x-2 pl-2">
              <span className="bg-indigo-600 h-2 w-2 rounded-full animate-pulse" />
              <span>{selectedPropertyIds.length} properties selected in catalog ledger</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleBulkArchive}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5 text-indigo-400" />
                <span>Archive Selected</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-950 text-rose-300 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedPropertyIds([])}
                className="p-1.5 hover:text-white text-slate-400"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Outer Catalog Layout Grid */}
      {properties.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl max-w-2xl mx-auto shadow-sm">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mx-auto mb-4">
            <Building2 className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Portfolio Ledger Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Begin by launching the multi-step Onboarding Wizard to record your first real estate property node.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Launch Wizard Onboarding</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Catalog Left Selection Column */}
          <div className="lg:col-span-4 space-y-4 max-h-[85vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">
              <span>LEDGER ENTRIES ({filteredProperties.length})</span>
              <button 
                onClick={handleSelectAllProperties} 
                className="hover:text-indigo-600"
              >
                {selectedPropertyIds.length === filteredProperties.length ? 'DESELECT ALL' : 'SELECT ALL'}
              </button>
            </div>

            {layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredProperties.map(property => {
                  const isSelected = property.id === selectedPropertyId;
                  const isChecked = selectedPropertyIds.includes(property.id);
                  return (
                    <div
                      key={property.id}
                      onClick={() => {
                        setSelectedPropertyId(property.id);
                        setActiveWorkspaceTab('overview');
                      }}
                      className={`group p-3 border rounded-xl bg-white cursor-pointer transition flex gap-3 hover:border-slate-300 shadow-xs relative ${
                        isSelected ? 'border-indigo-600 ring-1 ring-indigo-500/20 shadow-md' : 'border-slate-200'
                      }`}
                    >
                      {/* Checkbox selector */}
                      <div 
                        onClick={(e) => { e.stopPropagation(); handleToggleSelectProperty(property.id); }}
                        className="absolute top-2 left-2 z-10 h-4 w-4 rounded bg-slate-900/60 flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition"
                      >
                        {isChecked && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                      </div>

                      {/* Image Preview */}
                      <div className="h-20 w-24 bg-slate-100 rounded-lg overflow-hidden relative shrink-0">
                        <img
                          src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'}
                          alt={property.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[8px] font-mono font-bold text-white px-1.5 rounded uppercase">
                          {property.category.split(' ')[0]}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-slate-400 font-mono font-bold uppercase">
                              {property.internalReferenceId || 'REF-ID'}
                            </span>
                            <span className={`text-[8px] font-mono font-black uppercase px-1.5 rounded ${
                              property.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {property.status}
                            </span>
                          </div>
                          <h3 className="text-xs font-black text-slate-900 mt-0.5 truncate">{property.name}</h3>
                          <div className="flex items-center space-x-1 text-[10px] text-slate-450 mt-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{property.location.split(',').slice(0, 2).join(',')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-indigo-600 font-mono">{property.price}</span>
                          <div className="flex items-center space-x-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenEdit(property); }}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded"
                              title="Edit specifications"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteProperty(property.id); }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Revoke asset node"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table Layout mode for High Density portfolio management */
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3">Reference / Name</th>
                      <th className="p-3">Cost Value</th>
                      <th className="p-3">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProperties.map(property => {
                      const isSelected = property.id === selectedPropertyId;
                      return (
                        <tr
                          key={property.id}
                          onClick={() => setSelectedPropertyId(property.id)}
                          className={`cursor-pointer hover:bg-slate-50 transition ${isSelected ? 'bg-indigo-50/20 text-indigo-700' : ''}`}
                        >
                          <td className="p-3">
                            <p className="font-mono text-[9px] text-slate-400 uppercase">{property.internalReferenceId || 'REF'}</p>
                            <p className="font-bold text-slate-800 truncate max-w-[120px]">{property.name}</p>
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-600">{property.price}</td>
                          <td className="p-3 font-mono text-slate-500">{property.availableUnits ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Workspace Right Unified Tab Panel */}
          <div className="lg:col-span-8 space-y-4">
            {currentProperty ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-sm space-y-4">
                
                {/* Workspace Header Panel */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-100 pb-4 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        {currentProperty.internalReferenceId || 'LEDGER NODE'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400 font-mono">{currentProperty.category}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-snug">{currentProperty.name}</h2>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{currentProperty.location}</span>
                    </div>
                  </div>

                  {/* Active Actions dropdown simulation */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setShowQuickActionModal('brief')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Generate Brief</span>
                    </button>
                    <button
                      onClick={() => setShowQuickActionModal('feasibility')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition cursor-pointer"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Run Feasibility</span>
                    </button>
                  </div>
                </div>

                {/* WORKSPACE NAVIGATION TABS */}
                <div className="flex border-b border-slate-100 gap-1 overflow-x-auto text-xs font-semibold select-none pb-0.5 no-scrollbar scroll-smooth">
                  {[
                    { id: 'overview', label: 'Overview', icon: Map },
                    { id: 'knowledge', label: 'Linked Knowledge', icon: FileText, count: details?.documents?.length },
                    { id: 'intelligence', label: 'Property Intelligence', icon: Sparkles, count: intelligenceReports?.length },
                    { id: 'media', label: 'Media Portfolio', icon: ImageIcon },
                    { id: 'market', label: 'Market Intelligence', icon: TrendingUp, count: marketInvestmentReports?.length },
                    { id: 'investment', label: 'Investment & Allocation', icon: DollarSign },
                    { id: 'content', label: 'Marketing Copy', icon: Sparkles },
                    { id: 'reports', label: 'Valuation & Studies', icon: FileSpreadsheet },
                    { id: 'activity', label: 'Audit Trail', icon: ActivityIcon },
                    { id: 'settings', label: 'Node Settings', icon: SettingsIcon }
                  ].map(tb => {
                    const isTabActive = activeWorkspaceTab === tb.id;
                    const Icon = tb.icon;
                    return (
                      <button
                        key={tb.id}
                        onClick={() => setActiveWorkspaceTab(tb.id as any)}
                        className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 transition shrink-0 cursor-pointer ${
                          isTabActive 
                            ? 'border-indigo-600 text-indigo-600 font-bold' 
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tb.label}</span>
                        {tb.count !== undefined && tb.count > 0 && (
                          <span className="bg-slate-100 text-slate-600 text-[8px] font-mono px-1.5 py-0.2 rounded-full">
                            {tb.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT OUTCOMES */}
                <div className="pt-2">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeWorkspaceTab === 'overview' && (
                    <div className="space-y-4">
                      {/* GIS Mapping Frame */}
                      <PropertyMockMap 
                        propertyName={currentProperty.name}
                        propertyLocation={currentProperty.location}
                        coordinates={currentProperty.coordinates}
                        onCoordinatePick={async (lat, lng) => {
                          await onUpdateProperty(currentProperty.id, {
                            coordinates: { lat, lng }
                          });
                        }}
                        landmarksList={currentProperty.nearbyLandmarks}
                        onAddLandmark={async (name, distance, type) => {
                          await onUpdateProperty(currentProperty.id, {
                            nearbyLandmarks: [...(currentProperty.nearbyLandmarks || []), { name, distance, type }]
                          });
                        }}
                      />

                      {/* Nearby landmarks & Infrastructure columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Infrastructures */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center justify-between">
                            <span>Infrastructure Assessment</span>
                            <span className="text-[10px] text-slate-400">({currentProperty.infrastructure?.length || 0} mapped)</span>
                          </h4>
                          {currentProperty.infrastructure?.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No infrastructural markers recorded...</p>
                          ) : (
                            <div className="space-y-2">
                              {currentProperty.infrastructure?.map((infra, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-150 shadow-xs">
                                  <span className="font-semibold text-slate-700">{infra.name}</span>
                                  <span className={`text-[9px] font-mono font-bold px-1.5 rounded uppercase ${
                                    infra.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    infra.status === 'Under Construction' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {infra.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Landmarks */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center justify-between">
                            <span>Map Landmarks Proximity</span>
                            <span className="text-[10px] text-slate-400">({currentProperty.nearbyLandmarks?.length || 0} mapped)</span>
                          </h4>
                          {currentProperty.nearbyLandmarks?.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No proximity landmarks recorded...</p>
                          ) : (
                            <div className="space-y-2">
                              {currentProperty.nearbyLandmarks?.map((landmark, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-150 shadow-xs">
                                  <div>
                                    <span className="font-bold text-slate-700 block">{landmark.name}</span>
                                    <span className="text-[9px] text-slate-450 uppercase font-mono">{landmark.type}</span>
                                  </div>
                                  <span className="font-mono text-indigo-600 font-bold shrink-0">{landmark.distance}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LINKED KNOWLEDGE */}
                  {activeWorkspaceTab === 'knowledge' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Centralized Knowledge Connections</h3>
                          <p className="text-[11px] text-slate-450">These catalog resources bind structured operational data to future pipeline indexing.</p>
                        </div>
                        <button
                          onClick={() => setShowLinkDocModal(true)}
                          className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          <Link className="h-3.5 w-3.5" />
                          <span>Link Existing Doc</span>
                        </button>
                      </div>

                      {(!details?.documents || details.documents.length === 0) ? (
                        <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 max-w-md mx-auto">
                          <FileText className="h-8 w-8 text-slate-400 mx-auto" />
                          <h4 className="text-xs font-bold text-slate-800">No linked prospectus profiles</h4>
                          <p className="text-[11px] text-slate-450 px-6 leading-relaxed">
                            Connect payment schemes, legal authorizations, or allocation SOPs to build localized RAG context profiles.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {documents
                            .filter(d => details.documents.includes(d.id))
                            .map(doc => (
                              <div key={doc.id} className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-left min-w-0">
                                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-black text-slate-800 truncate">{doc.name}</h4>
                                    <p className="text-[9px] text-slate-450 font-mono uppercase mt-0.5">{doc.type} • {doc.confidentiality}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleUnlinkDocument(doc.id)}
                                  className="p-1.5 text-slate-450 hover:text-rose-600 rounded hover:bg-rose-50 transition shrink-0"
                                  title="Unlink document"
                                >
                                  <Unlink className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: PROPERTY INTELLIGENCE WORKSPACE */}
                  {activeWorkspaceTab === 'intelligence' && (
                    <div className="space-y-6 text-left">
                      {/* Top Action Panel & Run trigger */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Control Box & Report Version History */}
                        <div className="lg:col-span-4 space-y-4">
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Orchestrate Analysis</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Launches a coordinated Supervisor Agent pipeline across four specialized nodes to evaluate document corpus assets, landmarks, and infrastructure matrices.
                            </p>

                            {/* Public Research Options */}
                            <div className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-150">
                              <input
                                id="publicResearchToggle"
                                type="checkbox"
                                checked={enablePublicResearch}
                                onChange={(e) => setEnablePublicResearch(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor="publicResearchToggle" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                                Enable Public GIS Research
                              </label>
                            </div>

                            {/* Trigger Button */}
                            <button
                              type="button"
                              disabled={runningAnalysis}
                              onClick={handleRunPropertyIntelligence}
                              className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition cursor-pointer ${
                                runningAnalysis
                                  ? 'bg-slate-100 text-slate-400 border-slate-200'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700 shadow-sm'
                              }`}
                            >
                              <Sparkles className={`h-4 w-4 ${runningAnalysis ? 'animate-spin' : ''}`} />
                              <span>{runningAnalysis ? 'Orchestrator Executing...' : 'Run Property Intelligence'}</span>
                            </button>
                          </div>

                          {/* Live Execution Steps Tracking (Supervisor & specialized nodes) */}
                          {runningAnalysis && executionDetails && (
                            <div className="p-4 bg-slate-900 border border-slate-950 rounded-2xl space-y-3.5 shadow-xl text-white font-mono text-[11px]">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="text-indigo-400 font-bold">● ACTIVE ORCHESTRATOR</span>
                                <span className="animate-pulse px-1.5 py-0.2 text-[8px] uppercase bg-indigo-500 rounded text-white font-sans font-bold">PIPELINE RUNNING</span>
                              </div>
                              
                              {/* Steps stack */}
                              <div className="space-y-2">
                                {(executionDetails.steps || []).map((st: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between text-[10px]">
                                    <span className={st.status === 'Completed' ? 'text-emerald-400' : st.status === 'Running' ? 'text-indigo-300' : 'text-slate-500'}>
                                      {idx + 1}. {st.name}
                                    </span>
                                    <span className={`text-[8px] font-sans font-bold uppercase px-1.5 rounded ${
                                      st.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' :
                                      st.status === 'Running' ? 'bg-indigo-950 text-indigo-400 animate-pulse' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                      {st.status}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Terminal Logs block */}
                              <div className="border-t border-white/10 pt-2.5 mt-2 space-y-1 max-h-[110px] overflow-y-auto text-[9px] text-slate-400 font-mono no-scrollbar leading-normal">
                                {(executionDetails.logs || []).slice(-4).map((lg: any, idx: number) => (
                                  <div key={idx} className="flex items-start space-x-1">
                                    <span className="text-slate-500 shrink-0">&gt;</span>
                                    <span className="break-all">{lg.message}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Saved Intelligence Reports (Version Selector) */}
                          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Briefing Version History</h3>
                            {loadingReports ? (
                              <p className="text-xs text-slate-400 italic">Querying reports index...</p>
                            ) : intelligenceReports.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No reports generated for this property yet.</p>
                            ) : (
                              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {intelligenceReports.map(rep => {
                                  const isSelected = selectedReportId === rep.id;
                                  return (
                                    <div
                                      key={rep.id}
                                      onClick={() => setSelectedReportId(rep.id)}
                                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                                        isSelected
                                          ? 'bg-indigo-50/40 border-indigo-200 text-indigo-950'
                                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <div>
                                        <p className="text-xs font-bold flex items-center gap-1">
                                          <span>Report v{rep.version}</span>
                                          {rep.confidence && (
                                            <span className={`text-[8px] px-1 rounded font-mono font-bold ${
                                              rep.confidence.score >= 90 ? 'bg-emerald-100 text-emerald-800' :
                                              rep.confidence.score >= 80 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                                            }`}>{rep.confidence.score}%</span>
                                          )}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">
                                          {new Date(rep.createdAt).toLocaleDateString()} • {rep.createdByName}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteReport(rep.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                          title="Delete briefing"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Version Comparison Selector */}
                            {intelligenceReports.length >= 2 && (
                              <div className="border-t border-slate-100 pt-3 space-y-2">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Compare with Version</label>
                                <select
                                  value={compareReportId || ''}
                                  onChange={(e) => setCompareReportId(e.target.value || null)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                                >
                                  <option value="">-- Select Report for Comparison --</option>
                                  {intelligenceReports
                                    .filter(r => r.id !== selectedReportId)
                                    .map(r => (
                                      <option key={r.id} value={r.id}>
                                        Report v{r.version} ({new Date(r.createdAt).toLocaleDateString()})
                                      </option>
                                    ))}
                                </select>
                                {compareReportId && (
                                  <button
                                    onClick={() => setCompareReportId(null)}
                                    className="text-[9px] font-mono text-rose-500 hover:underline block text-right w-full font-bold uppercase"
                                  >
                                    Clear Comparison
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Report Output Viewer Column */}
                        <div className="lg:col-span-8">
                          {selectedReportId ? (() => {
                            const mainReport = intelligenceReports.find(r => r.id === selectedReportId);
                            const compareReport = compareReportId ? intelligenceReports.find(r => r.id === compareReportId) : null;
                            
                            if (!mainReport) return null;

                            return (
                              <div className="space-y-6">
                                
                                {/* Comparison Mode View */}
                                {compareReport ? (
                                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                        <ArrowUpDown className="h-4 w-4 text-indigo-600" />
                                        Version Comparison Matrix: v{mainReport.version} vs v{compareReport.version}
                                      </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-xs divide-x divide-slate-100">
                                      {/* Main selected report col */}
                                      <div className="space-y-4 pr-2">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-800 text-sm">Report v{mainReport.version}</span>
                                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold text-[9px]">SELECTED</span>
                                        </div>

                                        <div className="space-y-2.5">
                                          <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Overall Confidence</p>
                                            <p className="font-bold text-slate-700 text-sm mt-0.5">{mainReport.structuredJson?.overallConfidence?.score || mainReport.confidence?.score}%</p>
                                            <p className="text-[10px] text-slate-500 leading-normal italic">"{mainReport.structuredJson?.overallConfidence?.reason || mainReport.confidence?.reason}"</p>
                                          </div>
                                          
                                          <div className="border-t border-slate-100 pt-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Land Title Registration</p>
                                            <p className="font-semibold text-slate-700 mt-0.5">{mainReport.structuredJson?.propertyKnowledge?.landTitle || 'Not audited'}</p>
                                          </div>

                                          <div className="border-t border-slate-100 pt-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Audited Size</p>
                                            <p className="font-semibold text-slate-700 mt-0.5">{mainReport.structuredJson?.propertyKnowledge?.totalSize || 'Not audited'}</p>
                                          </div>

                                          <div className="border-t border-slate-100 pt-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Region Growth Vector</p>
                                            <p className="text-slate-600 leading-relaxed mt-0.5 text-[11px]">{mainReport.structuredJson?.localIntelligence?.growthVector || 'No vector generated'}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Compare report col */}
                                      <div className="space-y-4 pl-4">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-slate-800 text-sm">Report v{compareReport.version}</span>
                                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold text-[9px]">COMPARATOR</span>
                                        </div>

                                        <div className="space-y-2.5">
                                          <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Overall Confidence</p>
                                            <p className="font-bold text-slate-700 text-sm mt-0.5">{compareReport.structuredJson?.overallConfidence?.score || compareReport.confidence?.score}%</p>
                                            <p className="text-[10px] text-slate-500 leading-normal italic">"{compareReport.structuredJson?.overallConfidence?.reason || compareReport.confidence?.reason}"</p>
                                          </div>

                                          <div className="border-t border-slate-100 pt-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Land Title Registration</p>
                                            <p className="font-semibold text-slate-700 mt-0.5">{compareReport.structuredJson?.propertyKnowledge?.landTitle || 'Not audited'}</p>
                                          </div>

                                          <div className="border-t border-slate-100 pt-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Audited Size</p>
                                            <p className="font-semibold text-slate-700 mt-0.5">{compareReport.structuredJson?.propertyKnowledge?.totalSize || 'Not audited'}</p>
                                          </div>

                                          <div className="border-t border-slate-100 pt-2">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Region Growth Vector</p>
                                            <p className="text-slate-600 leading-relaxed mt-0.5 text-[11px]">{compareReport.structuredJson?.localIntelligence?.growthVector || 'No vector generated'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  /* Standard Briefing Report Viewer */
                                  <div className="space-y-6">
                                    
                                    {/* Confidence Gauge Block */}
                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center gap-5">
                                      <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                                        {/* Simple circular metric outline using SVG */}
                                        <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                          <path
                                            className="text-slate-100"
                                            strokeWidth="3"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                          />
                                          <path
                                            className="text-indigo-600"
                                            strokeDasharray={`${mainReport.confidence?.score || 90}, 100`}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                          />
                                        </svg>
                                        <span className="font-mono text-base font-black text-slate-800">{mainReport.confidence?.score || 90}%</span>
                                      </div>

                                      <div className="text-center md:text-left space-y-1">
                                        <div className="flex items-center justify-center md:justify-start gap-2">
                                          <h4 className="text-sm font-black text-slate-950">Property Intelligence Briefing v{mainReport.version}</h4>
                                          <span className={`text-[8px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-full ${
                                            mainReport.confidence?.evidenceLevel === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            mainReport.confidence?.evidenceLevel === 'Medium' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600'
                                          }`}>
                                            {mainReport.confidence?.evidenceLevel || 'High'} Evidence
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                                          "{mainReport.confidence?.reason || 'Verified registry listings combined with regional developmental audits.'}"
                                        </p>
                                      </div>
                                    </div>

                                    {/* Coordinated Agents Bento Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      
                                      {/* Panel 1: Property Knowledge Node */}
                                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                            <span className="text-[10px] font-black text-slate-900 uppercase font-mono tracking-wider">Property Knowledge Node</span>
                                            <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase">v1.1 verified</span>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">Land Title</p>
                                              <p className="font-semibold text-slate-800 truncate mt-0.5">{mainReport.structuredJson?.propertyKnowledge?.landTitle || 'Governor\'s Consent'}</p>
                                            </div>
                                            <div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">Total Size</p>
                                              <p className="font-semibold text-slate-800 mt-0.5">{mainReport.structuredJson?.propertyKnowledge?.totalSize || '8.5 Hectares'}</p>
                                            </div>
                                            <div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">Approval Status</p>
                                              <p className="font-semibold text-indigo-600 uppercase mt-0.5">{mainReport.structuredJson?.propertyKnowledge?.approvalStatus || 'Approved'}</p>
                                            </div>
                                          </div>

                                          {mainReport.structuredJson?.propertyKnowledge?.verifiedBeacons && mainReport.structuredJson.propertyKnowledge.verifiedBeacons.length > 0 && (
                                            <div className="space-y-1 pt-1">
                                              <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">Verified Beacons</p>
                                              <div className="flex flex-wrap gap-1">
                                                {mainReport.structuredJson.propertyKnowledge.verifiedBeacons.map((b: string, i: number) => (
                                                  <span key={i} className="bg-slate-100 text-slate-600 font-mono text-[8px] px-1.5 py-0.2 rounded border border-slate-200">{b}</span>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <p className="text-[11px] text-slate-600 leading-normal italic mt-2 pt-1 border-t border-slate-100/50">
                                            "{mainReport.structuredJson?.propertyKnowledge?.legalNotes || 'All deeds cleared and registered at State capital registry, free of claim.'}"
                                          </p>
                                        </div>

                                        <div className="text-[8px] font-mono text-slate-400 bg-slate-50 p-1.5 rounded flex items-center justify-between">
                                          <span>Confidence Rating:</span>
                                          <span className="font-bold text-slate-700">{mainReport.structuredJson?.propertyKnowledge?.confidence?.score || 95}%</span>
                                        </div>
                                      </div>

                                      {/* Panel 2: Local Intelligence Node */}
                                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                            <span className="text-[10px] font-black text-slate-900 uppercase font-mono tracking-wider">Local Intelligence Node</span>
                                            <span className="text-[9px] font-mono text-emerald-600 font-bold uppercase">GIS Proximity map</span>
                                          </div>

                                          <div className="space-y-1 text-xs">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">Core Infrastructure markers</p>
                                            <div className="space-y-1">
                                              {(mainReport.structuredJson?.localIntelligence?.infrastructure || [
                                                { name: 'Dual Access Roads', status: 'Available' },
                                                { name: 'Grid Power Station', status: 'Under Construction' }
                                              ]).slice(0, 2).map((inf: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-100">
                                                  <span className="font-semibold text-slate-700 text-[10px]">{inf.name}</span>
                                                  <span className={`text-[7px] font-mono font-bold uppercase px-1 rounded ${
                                                    inf.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                                                  }`}>{inf.status}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>

                                          <div className="space-y-1">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">Growth Vector Narrative</p>
                                            <p className="text-[11px] text-slate-600 leading-normal">
                                              {mainReport.structuredJson?.localIntelligence?.growthVector || 'Positioned on the primary state commercial gateway, securing high annual demand appreciation.'}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="text-[8px] font-mono text-slate-400 bg-slate-50 p-1.5 rounded flex items-center justify-between">
                                          <span>Confidence Rating:</span>
                                          <span className="font-bold text-slate-700">{mainReport.structuredJson?.localIntelligence?.confidence?.score || 88}%</span>
                                        </div>
                                      </div>

                                      {/* Panel 3: Fact Verification Node */}
                                      <div className="md:col-span-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                          <span className="text-[10px] font-black text-slate-900 uppercase font-mono tracking-wider">Fact Verification Audit</span>
                                          <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase">Marketing claim auditing</span>
                                        </div>

                                        <div className="overflow-x-auto">
                                          <table className="w-full text-left text-[10px]">
                                            <thead>
                                              <tr className="text-slate-450 uppercase font-mono font-bold border-b border-slate-100">
                                                <th className="pb-1.5 font-bold">Marketing Claim Statement</th>
                                                <th className="pb-1.5 font-bold">Document Source</th>
                                                <th className="pb-1.5 font-bold text-center">Audit Status</th>
                                                <th className="pb-1.5 font-bold pl-2">Notes</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                              {(mainReport.structuredJson?.factVerification?.claimsAudited || [
                                                { claim: "100% dry high ground", source: "Survey Plan Contour Sheet", status: "Verified", notes: "Lies 18m above water levels" },
                                                { claim: "Direct title access", source: "Deed of Assignment", status: "Verified", notes: "Filing confirms correct land registry index" }
                                              ]).map((cl: any, i: number) => (
                                                <tr key={i}>
                                                  <td className="py-2 pr-2 font-semibold text-slate-800">{cl.claim}</td>
                                                  <td className="py-2 pr-2 font-mono text-[9px]">{cl.source}</td>
                                                  <td className="py-2 text-center">
                                                    <span className={`px-1.5 py-0.2 rounded font-sans font-bold text-[8px] uppercase ${
                                                      cl.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' :
                                                      cl.status === 'Unverified' ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-rose-50 text-rose-700'
                                                    }`}>{cl.status}</span>
                                                  </td>
                                                  <td className="py-2 text-slate-500 pl-2 leading-relaxed">{cl.notes}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>

                                        <div className="bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/50 text-xs text-slate-800 flex items-center justify-between">
                                          <span className="font-semibold">{mainReport.structuredJson?.factVerification?.overallRating || 'All statements verified against database blueprints.'}</span>
                                          <span className="font-mono text-[8px] text-slate-400">Node Confidence: {mainReport.structuredJson?.factVerification?.confidence?.score || 95}%</span>
                                        </div>
                                      </div>

                                      {/* Panel 4: Report Generator (Executive Synthesis Summary) */}
                                      <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-3xl shadow-inner space-y-3 text-left">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                          <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                                            <FileText className="h-4 w-4 text-indigo-600" />
                                            {mainReport.structuredJson?.executiveReport?.reportTitle || 'Official Property Briefing Summary'}
                                          </h3>
                                          <span className="font-mono text-[8px] text-slate-400">Node Confidence: {mainReport.structuredJson?.executiveReport?.confidence?.score || 94}%</span>
                                        </div>

                                        {mainReport.structuredJson?.executiveReport?.segmentsCompiled && mainReport.structuredJson.executiveReport.segmentsCompiled.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5">
                                            {mainReport.structuredJson.executiveReport.segmentsCompiled.map((seg: string, idx: number) => (
                                              <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{seg}</span>
                                            ))}
                                          </div>
                                        )}

                                        <p className="text-xs text-slate-700 leading-relaxed font-sans pt-1 whitespace-pre-line">
                                          {mainReport.structuredJson?.executiveReport?.executiveSummary || mainReport.summary}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Source Attribution Panel */}
                                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Knowledge Attribution Index</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                        
                                        {/* Internal Sources */}
                                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                                          <span className="text-[8px] font-bold text-indigo-600 uppercase font-mono tracking-widest block">Internal Documents</span>
                                          <div className="space-y-1">
                                            {(mainReport.sourceList?.internalSources || []).map((src: string, i: number) => (
                                              <p key={i} className="text-[10px] font-semibold text-slate-700 truncate">• {src}</p>
                                            ))}
                                            {(mainReport.sourceList?.internalSources || []).length === 0 && (
                                              <p className="text-[10px] text-slate-400 italic">No internal docs listed.</p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Public Sources */}
                                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                                          <span className="text-[8px] font-bold text-emerald-600 uppercase font-mono tracking-widest block">Public Research</span>
                                          <div className="space-y-1">
                                            {(mainReport.sourceList?.publicSources || []).map((src: string, i: number) => (
                                              <p key={i} className="text-[10px] font-semibold text-slate-700 truncate">• {src}</p>
                                            ))}
                                            {(mainReport.sourceList?.publicSources || []).length === 0 && (
                                              <p className="text-[10px] text-slate-400 italic">No public research enabled.</p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Unknown/Unverified Sources */}
                                        <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                                          <span className="text-[8px] font-bold text-amber-600 uppercase font-mono tracking-widest block">Unknown Elements</span>
                                          <div className="space-y-1">
                                            {(mainReport.sourceList?.unknownSources || []).map((src: string, i: number) => (
                                              <p key={i} className="text-[10px] font-semibold text-slate-700 truncate">• {src}</p>
                                            ))}
                                            {(mainReport.sourceList?.unknownSources || []).length === 0 && (
                                              <p className="text-[10px] text-slate-400 italic">0 unknown items</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                )}
                              </div>
                            );
                          })() : (
                            <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
                              <Sparkles className="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">No analysis report selected</h4>
                              <p className="text-[10px] text-slate-400">Click "Run Property Intelligence" on the left panel to execute your first briefing report v1.0!</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* TAB 3: MEDIA PORTFOLIO */}
                  {activeWorkspaceTab === 'media' && (
                    <div className="space-y-4">
                      {/* Upload Media Inline Form */}
                      <form onSubmit={handleInlineAddMedia} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Add URL Resource Link</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            required
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Resource Category</label>
                          <select
                            value={newMediaType}
                            onChange={(e) => setNewMediaType(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Image">Standard Image</option>
                            <option value="Video">Marketing Video</option>
                            <option value="Drone">Drone Footage</option>
                            <option value="Master Plan">Master Blueprint</option>
                            <option value="Layout Drawing">Layout Outline</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          Upload Asset
                        </button>
                      </form>

                      {/* Display Portfolio Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {details?.media?.map((med: any) => (
                          <div 
                            key={med.id}
                            className="border border-slate-200 rounded-xl overflow-hidden group bg-slate-100 relative h-36 flex items-center justify-center cursor-pointer shadow-xs"
                            onClick={() => setLightboxImage(med.url)}
                          >
                            <img
                              src={med.url}
                              alt={med.title}
                              className="w-full h-full object-cover transition transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {/* Overlay category tag */}
                            <span className="absolute bottom-2 left-2 bg-slate-950/85 text-white font-mono text-[8px] uppercase px-1.5 py-0.5 rounded tracking-wide">
                              {med.type}
                            </span>
                            
                            {/* Hover info panel */}
                            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-2 text-left opacity-0 group-hover:opacity-100 transition flex flex-col justify-end h-2/3 pointer-events-none">
                              <h5 className="text-[10px] font-black text-white truncate">{med.title}</h5>
                              <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wide mt-0.5">Upload: {new Date(med.uploadDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: MARKET INTELLIGENCE */}
                  {activeWorkspaceTab === 'market' && (
                    <div className="space-y-6 text-left">
                      {/* Active Terminal Log shown when running */}
                      {runningMarketAnalysis && marketExecutionDetails && (
                        <div className="p-4 bg-slate-900 border border-slate-950 rounded-2xl space-y-3.5 shadow-xl text-white font-mono text-[11px]">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-indigo-400 font-bold">● ACTIVE INVESTMENT PLANNER ORCHESTRATOR</span>
                            <span className="animate-pulse px-1.5 py-0.2 text-[8px] uppercase bg-indigo-500 rounded text-white font-sans font-bold">PIPELINE RUNNING</span>
                          </div>
                          <div className="space-y-2">
                            {(marketExecutionDetails.steps || []).map((st: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-[10px]">
                                <span className={st.status === 'Completed' ? 'text-emerald-400' : st.status === 'Running' ? 'text-indigo-300' : 'text-slate-500'}>
                                  {idx + 1}. {st.name}
                                </span>
                                <span className={`text-[8px] font-sans font-bold uppercase px-1.5 rounded ${
                                  st.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' :
                                  st.status === 'Running' ? 'bg-indigo-950 text-indigo-400 animate-pulse' : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {st.status}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-white/10 pt-2.5 mt-2 space-y-1 max-h-[110px] overflow-y-auto text-[9px] text-slate-400 font-mono no-scrollbar leading-normal">
                            {(marketExecutionDetails.logs || []).slice(-4).map((lg: any, idx: number) => (
                              <div key={idx} className="flex items-start space-x-1">
                                <span className="text-slate-550 shrink-0">&gt;</span>
                                <span className="break-all">{lg.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Case 1: No Reports and not running */}
                      {!runningMarketAnalysis && marketInvestmentReports.length === 0 && (
                        <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <TrendingUp className="h-8 w-8" />
                          </div>
                          <div className="space-y-1 max-w-md mx-auto">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">Market & Investment Intelligence Report Pending</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Run the unified Multi-Agent Market & Investment workflow to synthesize linked documents, local geographic landmarks, and external GIS data. This creates buyer personas, ROI estimations, and copywriter scripts.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRunMarketInvestment}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center space-x-1.5 mx-auto"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Run Market & Investment Analysis</span>
                          </button>
                        </div>
                      )}

                      {/* Case 2: Reports exist */}
                      {marketInvestmentReports.length > 0 && (() => {
                        const activeReport = marketInvestmentReports.find(r => r.id === selectedMarketReportId) || marketInvestmentReports[0];
                        if (!activeReport) return null;

                        return (
                          <div className="space-y-6">
                            {/* Version Selector Header */}
                            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Report Version:</span>
                                <select
                                  value={activeReport.id}
                                  onChange={(e) => setSelectedMarketReportId(e.target.value)}
                                  className="px-2.5 py-1 bg-slate-50 border border-slate-250 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                                >
                                  {marketInvestmentReports.map(rep => (
                                    <option key={rep.id} value={rep.id}>
                                      Version {rep.version} ({new Date(rep.createdAt).toLocaleDateString()})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMarketReport(activeReport.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition"
                                  title="Delete this report version"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                type="button"
                                disabled={runningMarketAnalysis}
                                onClick={handleRunMarketInvestment}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-150 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs transition cursor-pointer flex items-center space-x-1"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Re-Run Market Orchestrator</span>
                              </button>
                            </div>

                            {/* Core Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono block">Annual Appreciation</span>
                                <p className="text-sm font-extrabold text-indigo-700 mt-1">{activeReport.marketAnalysis.growthProjectionYearly}</p>
                              </div>
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono block">Overall Market Demand</span>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-black uppercase font-mono rounded ${
                                  activeReport.marketAnalysis.marketDemand === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                  activeReport.marketAnalysis.marketDemand === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                  'bg-slate-50 text-slate-600 border border-slate-200'
                                }`}>
                                  {activeReport.marketAnalysis.marketDemand} Demand
                                </span>
                              </div>
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono block">Average Sqm Value</span>
                                <p className="text-sm font-extrabold text-slate-800 mt-1">{activeReport.marketAnalysis.averagePricePerSqm}</p>
                              </div>
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono block">Absorption Rate</span>
                                <p className="text-sm font-extrabold text-indigo-600 mt-1">{activeReport.marketAnalysis.absorptionRate}</p>
                              </div>
                            </div>

                            {/* Market Drivers & Risks bento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                  <span>Demand Appreciation Drivers</span>
                                </h4>
                                <div className="space-y-2 text-xs text-slate-700">
                                  {activeReport.marketAnalysis.demandDrivers.map((driver, idx) => (
                                    <div key={idx} className="flex items-start space-x-2">
                                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                                      <span>{driver}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1">
                                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                                  <span>Market Threat & Risk Matrix</span>
                                </h4>
                                <div className="space-y-2 text-xs text-slate-700">
                                  {activeReport.marketAnalysis.marketRisks.map((risk, idx) => (
                                    <div key={idx} className="flex items-start space-x-2 bg-white/65 p-2 rounded-lg border border-slate-100">
                                      <span className="text-rose-500 font-bold shrink-0">!</span>
                                      <span>{risk}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Competing Developments Table */}
                            <div className="p-4 bg-white border border-slate-250 rounded-2xl space-y-3">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Competing Adjacency Nodes Map</h4>
                              <div className="overflow-x-auto text-xs">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="text-slate-450 border-b border-slate-100 uppercase font-mono font-bold text-[9px] pb-1.5">
                                      <th className="pb-2 font-bold">Adjacent Development</th>
                                      <th className="pb-2 font-bold">Estimated Cost Scale</th>
                                      <th className="pb-2 font-bold text-right">Distance Radius</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {activeReport.marketAnalysis.competingDevelopments.map((dev, idx) => (
                                      <tr key={idx}>
                                        <td className="py-2.5 font-bold text-slate-800">{dev.name}</td>
                                        <td className="py-2.5 font-mono text-indigo-600">{dev.priceRange}</td>
                                        <td className="py-2.5 font-mono text-right text-slate-500">{dev.distance}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Public Market Signals */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Auditable Public Market Signals</h4>
                              <div className="space-y-2.5">
                                {activeReport.marketSignals.map((sig, idx) => (
                                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-150 flex flex-col md:flex-row md:items-start justify-between gap-2">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <span className={`text-[8px] font-bold uppercase px-1.5 rounded font-mono ${
                                          sig.impact === 'Positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                          sig.impact === 'Negative' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                          'bg-slate-50 text-slate-600 border border-slate-150'
                                        }`}>
                                          {sig.impact} Impact
                                        </span>
                                        <span className="text-[10px] font-black text-slate-800">{sig.title}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-600 leading-normal">{sig.description}</p>
                                      <p className="text-[9px] text-slate-400 font-mono">Source: {sig.source}</p>
                                    </div>
                                    <div className="text-[8px] font-mono font-bold bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-slate-500 shrink-0 self-start">
                                      Confidence: {sig.confidence}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Coordinated Buyer Personas Pitch Copywriting Studio */}
                            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">Buyer Persona Copywriting Studio</h4>
                                  <p className="text-[10px] text-slate-400">Target market demographic profiles generated from property records and regional micro-trends.</p>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 text-xs shrink-0 font-bold">
                                  {activeReport.buyerPersonas.map((bp, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setActivePersonaIdx(i)}
                                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                        activePersonaIdx === i ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                                      }`}
                                    >
                                      {bp.name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {(() => {
                                const bp = activeReport.buyerPersonas[activePersonaIdx] || activeReport.buyerPersonas[0];
                                if (!bp) return <p className="text-xs text-slate-400 italic">No personas recorded.</p>;

                                return (
                                  <div className="space-y-4 text-xs">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                      {/* Left side details */}
                                      <div className="md:col-span-4 p-3 bg-slate-50 rounded-xl space-y-2.5 border border-slate-150">
                                        <div>
                                          <span className="text-[8px] font-mono text-slate-400 uppercase font-bold block">Segment</span>
                                          <span className="font-extrabold text-slate-800 text-[11px]">{bp.segment}</span>
                                        </div>
                                        <div>
                                          <span className="text-[8px] font-mono text-slate-400 uppercase font-bold block">Target Persona Fit Match</span>
                                          <div className="flex items-center space-x-1.5 mt-0.5">
                                            <div className="w-2/3 bg-slate-200 h-1 rounded-full overflow-hidden">
                                              <div className="bg-indigo-600 h-1" style={{ width: `${bp.fitScore || 90}%` }} />
                                            </div>
                                            <span className="font-mono text-[9px] font-black text-indigo-700">{bp.fitScore || 90}% Fit</span>
                                          </div>
                                        </div>

                                        <div className="border-t border-slate-150 pt-2 space-y-1.5">
                                          <span className="text-[8px] font-mono text-slate-400 uppercase font-bold block">Core Pain Points Addressed</span>
                                          <ul className="space-y-1 text-[10px] text-slate-650">
                                            {bp.painPoints.map((pt, idx) => (
                                              <li key={idx}>• {pt}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>

                                      {/* Right side selling points and actions */}
                                      <div className="md:col-span-8 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1.5">
                                            <span className="text-[8px] font-mono text-emerald-700 font-extrabold uppercase block">Buying Triggers</span>
                                            <ul className="space-y-1 text-[10px] text-slate-700">
                                              {bp.buyingTriggers.map((tr, idx) => (
                                                <li key={idx}>✔ {tr}</li>
                                              ))}
                                            </ul>
                                          </div>
                                          <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-1.5">
                                            <span className="text-[8px] font-mono text-indigo-700 font-extrabold uppercase block">Unique KSPs For Demographic</span>
                                            <ul className="space-y-1 text-[10px] text-slate-750">
                                              {bp.keySellingPoints.map((ksp, idx) => (
                                                <li key={idx}>✔ {ksp}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Copwriter Text Blocks */}
                                    <div className="space-y-3 border-t border-slate-100 pt-3.5">
                                      <h5 className="text-[10px] font-black text-slate-900 uppercase font-mono tracking-wide">Copywriter Pitch Generator Outputs</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* WhatsApp Pitch */}
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                                          <div className="space-y-1.5">
                                            <span className="text-[8px] font-mono text-emerald-700 font-extrabold uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                                              <span>WhatsApp Conversational Intro</span>
                                              <span className="text-[7px] text-slate-400">DEMO VERIFIED</span>
                                            </span>
                                            <p className="text-[10px] text-slate-600 leading-normal italic line-clamp-6 bg-white p-2 rounded border border-slate-100 whitespace-pre-line select-all">
                                              {bp.whatsappPitch}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleCopyPitch(bp.whatsappPitch, `wa-${bp.id}`)}
                                            className="w-full mt-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-1 rounded text-[10px] font-bold transition flex items-center justify-center space-x-1"
                                          >
                                            {copiedPitchKey === `wa-${bp.id}` ? (
                                              <>
                                                <Check className="h-3 w-3 text-emerald-600" />
                                                <span className="text-emerald-700 font-extrabold">Pitch Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="h-3 w-3" />
                                                <span>Copy WhatsApp Pitch</span>
                                              </>
                                            )}
                                          </button>
                                        </div>

                                        {/* LinkedIn Professional Post */}
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                                          <div className="space-y-1.5">
                                            <span className="text-[8px] font-mono text-indigo-700 font-extrabold uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                                              <span>LinkedIn Narrative Briefing</span>
                                              <span className="text-[7px] text-slate-400">DEMO VERIFIED</span>
                                            </span>
                                            <p className="text-[10px] text-slate-600 leading-normal italic line-clamp-6 bg-white p-2 rounded border border-slate-100 whitespace-pre-line select-all">
                                              {bp.linkedinPitch}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleCopyPitch(bp.linkedinPitch, `li-${bp.id}`)}
                                            className="w-full mt-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-1 rounded text-[10px] font-bold transition flex items-center justify-center space-x-1"
                                          >
                                            {copiedPitchKey === `li-${bp.id}` ? (
                                              <>
                                                <Check className="h-3 w-3 text-emerald-600" />
                                                <span className="text-emerald-700 font-extrabold">Post Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="h-3 w-3" />
                                                <span>Copy LinkedIn Post</span>
                                              </>
                                            )}
                                          </button>
                                        </div>

                                        {/* Direct Sales script */}
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
                                          <div className="space-y-1.5">
                                            <span className="text-[8px] font-mono text-indigo-700 font-extrabold uppercase flex items-center justify-between border-b border-slate-200 pb-1">
                                              <span>Cold calling Sales Script</span>
                                              <span className="text-[7px] text-slate-400">DEMO VERIFIED</span>
                                            </span>
                                            <p className="text-[10px] text-slate-600 leading-normal italic line-clamp-6 bg-white p-2 rounded border border-slate-100 whitespace-pre-line select-all">
                                              {bp.salesScript}
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleCopyPitch(bp.salesScript, `sc-${bp.id}`)}
                                            className="w-full mt-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-1 rounded text-[10px] font-bold transition flex items-center justify-center space-x-1"
                                          >
                                            {copiedPitchKey === `sc-${bp.id}` ? (
                                              <>
                                                <Check className="h-3 w-3 text-emerald-600" />
                                                <span className="text-emerald-700 font-extrabold">Script Copied!</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="h-3 w-3" />
                                                <span>Copy Calling Script</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                );
                              })()}
                            </div>

                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 5: INVESTMENT & ALLOCATION */}
                  {activeWorkspaceTab === 'investment' && (
                    <div className="space-y-6 text-left">
                      {/* Active Terminal Log shown when running */}
                      {runningMarketAnalysis && marketExecutionDetails && (
                        <div className="p-4 bg-slate-900 border border-slate-950 rounded-2xl space-y-3.5 shadow-xl text-white font-mono text-[11px]">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-indigo-400 font-bold">● ACTIVE INVESTMENT PLANNER ORCHESTRATOR</span>
                            <span className="animate-pulse px-1.5 py-0.2 text-[8px] uppercase bg-indigo-500 rounded text-white font-sans font-bold">PIPELINE RUNNING</span>
                          </div>
                          <div className="space-y-2">
                            {(marketExecutionDetails.steps || []).map((st: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-[10px]">
                                <span className={st.status === 'Completed' ? 'text-emerald-400' : st.status === 'Running' ? 'text-indigo-300' : 'text-slate-500'}>
                                  {idx + 1}. {st.name}
                                </span>
                                <span className={`text-[8px] font-sans font-bold uppercase px-1.5 rounded ${
                                  st.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' :
                                  st.status === 'Running' ? 'bg-indigo-950 text-indigo-400 animate-pulse' : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {st.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Case 1: No Reports and not running */}
                      {!runningMarketAnalysis && marketInvestmentReports.length === 0 && (
                        <div className="py-16 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                          <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <DollarSign className="h-8 w-8" />
                          </div>
                          <div className="space-y-1 max-w-md mx-auto">
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono">Investment Performance Index Pending</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              Run the unified Multi-Agent Market & Investment workflow to calculate complex investment scores, ROI metrics, 5-year growth maps, and payment strategies.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleRunMarketInvestment}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer shadow-sm flex items-center space-x-1.5 mx-auto"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Run Market & Investment Analysis</span>
                          </button>
                        </div>
                      )}

                      {/* Case 2: Reports exist */}
                      {marketInvestmentReports.length > 0 && (() => {
                        const activeReport = marketInvestmentReports.find(r => r.id === selectedMarketReportId) || marketInvestmentReports[0];
                        if (!activeReport) return null;

                        return (
                          <div className="space-y-6">
                            {/* Version Selector Header */}
                            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Report Version:</span>
                                <select
                                  value={activeReport.id}
                                  onChange={(e) => setSelectedMarketReportId(e.target.value)}
                                  className="px-2.5 py-1 bg-slate-50 border border-slate-250 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                                >
                                  {marketInvestmentReports.map(rep => (
                                    <option key={rep.id} value={rep.id}>
                                      Version {rep.version} ({new Date(rep.createdAt).toLocaleDateString()})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMarketReport(activeReport.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition"
                                  title="Delete this report version"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                type="button"
                                disabled={runningMarketAnalysis}
                                onClick={handleRunMarketInvestment}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-150 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs transition cursor-pointer flex items-center space-x-1"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Re-Run Market Orchestrator</span>
                              </button>
                            </div>

                            {/* Financial Dashboard Bento Column */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              {/* Left Dial & Performance Metrics */}
                              <div className="md:col-span-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                                <span className="text-[9px] font-bold text-slate-450 uppercase font-mono tracking-widest block">Investment Viability Score</span>
                                <div className="relative h-28 w-28 flex items-center justify-center">
                                  {/* Viability circular SVG progress bar */}
                                  <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                      className="text-slate-100"
                                      strokeWidth="3.2"
                                      stroke="currentColor"
                                      fill="none"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                      className="text-emerald-500"
                                      strokeDasharray={`${activeReport.investmentAnalysis.investmentScore || 80}, 100`}
                                      strokeWidth="3.2"
                                      strokeLinecap="round"
                                      stroke="currentColor"
                                      fill="none"
                                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                  </svg>
                                  <span className="font-mono text-xl font-black text-slate-800">{activeReport.investmentAnalysis.investmentScore || 80}/100</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">Assessed Risk Factor:</span>
                                  <div className="flex justify-center">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase font-mono rounded-md ${
                                      activeReport.investmentAnalysis.riskRating === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                      activeReport.investmentAnalysis.riskRating === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                      'bg-rose-50 text-rose-700 border border-rose-150 animate-pulse'
                                    }`}>
                                      {activeReport.investmentAnalysis.riskRating} Risk Scale
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Financial indicators list */}
                              <div className="md:col-span-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Estimated Yield Indices</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                  <div className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block">Estimated ROI (ROI)</span>
                                    <p className="text-sm font-black text-emerald-600 font-mono">{activeReport.investmentAnalysis.roiEstimate}</p>
                                  </div>
                                  <div className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block">Internal Rate Return (IRR)</span>
                                    <p className="text-sm font-black text-indigo-600 font-mono">{activeReport.investmentAnalysis.irrEstimate}</p>
                                  </div>
                                  <div className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase font-mono block">Net Present Value (NPV)</span>
                                    <p className="text-sm font-black text-slate-800 font-mono">{activeReport.investmentAnalysis.npvEstimate}</p>
                                  </div>
                                </div>

                                <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-1.5 text-xs">
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Optimal Capital Accumulation Plan</span>
                                  <p className="font-semibold text-slate-700 leading-normal">{activeReport.investmentAnalysis.optimalPaymentPlan}</p>
                                </div>
                              </div>
                            </div>

                            {/* 5-Year Capital Appreciation Projections Chart */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                                  <span>5-Year Capital Appreciation Appreciation curve</span>
                                </h4>
                                <span className="text-[8px] font-mono text-slate-400">PROJECTED ACCUMULATION SCALE</span>
                              </div>

                              {/* Custom responsive high-fidelity CSS/SVG Bar Chart */}
                              <div className="h-44 flex items-end gap-3 pt-6 pb-2 px-6 relative">
                                {/* Left value axis */}
                                <div className="absolute left-0 inset-y-0 flex flex-col justify-between font-mono text-[8px] text-slate-400 pointer-events-none py-2">
                                  <span>MAX POTENTIAL</span>
                                  <span>MID POINT</span>
                                  <span>BASE VALUE</span>
                                </div>

                                {activeReport.investmentAnalysis.appreciationForecast5Yr.map((fc, idx) => {
                                  // Scale height relative to index (e.g. 50% to 100%)
                                  const barPercent = 40 + (idx * 15);
                                  return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                      {/* Bar with beautiful custom gradient */}
                                      <div 
                                        className="w-full bg-gradient-to-t from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300 border-t border-x border-indigo-200 rounded-t-lg transition-all relative" 
                                        style={{ height: `${barPercent}%` }}
                                      >
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white font-mono text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition z-10 whitespace-nowrap shadow-md">
                                          {fc.projectedValue}
                                        </div>
                                      </div>
                                      <div className="text-center font-mono text-[9px]">
                                        <p className="text-slate-400 uppercase font-bold">Year {fc.year}</p>
                                        <p className="text-emerald-600 font-extrabold font-mono text-[8px]">+{fc.percentageIncrease}%</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Allocation Milestones Timeline */}
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3.5">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Physical Allocation & Escrow Milestone Phases</h4>
                              <div className="space-y-3">
                                {activeReport.investmentAnalysis.allocationMilestones.map((ms, idx) => (
                                  <div key={idx} className="flex space-x-3 text-xs">
                                    <div className="flex flex-col items-center">
                                      <span className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-mono font-black text-indigo-700 text-[9px]">
                                        {idx + 1}
                                      </span>
                                      {idx < activeReport.investmentAnalysis.allocationMilestones.length - 1 && (
                                        <span className="w-0.5 bg-slate-100 flex-1 my-1" />
                                      )}
                                    </div>
                                    <div className="flex-1 space-y-0.5 pb-2 border-b border-slate-100">
                                      <div className="flex justify-between items-center">
                                        <span className="font-extrabold text-slate-800">{ms.step}</span>
                                        <span className="font-mono text-[9px] font-black uppercase text-indigo-600 bg-indigo-50/50 px-1.5 py-0.2 rounded">
                                          {ms.timeframe}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-normal">{ms.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Actionable Recommendations */}
                            <div className="p-4 bg-indigo-50/20 border border-indigo-150 rounded-2xl space-y-3">
                              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                                <Sparkles className="h-4 w-4 text-indigo-600" />
                                <span>Expert Investment Actions</span>
                              </h4>
                              <div className="space-y-2 text-xs text-slate-800">
                                {activeReport.investmentAnalysis.recommendations.map((rec, idx) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <span className="text-indigo-500 font-bold shrink-0">•</span>
                                    <span>{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Verification Footnote */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 font-bold uppercase pb-1.5 border-b border-slate-150">
                                <span>Audit Validation Sources & Core Assumptions</span>
                                <span>Node Confidence Index: {activeReport.confidence?.score || 90}%</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="space-y-1">
                                  <span className="text-[8px] font-mono text-slate-400 uppercase font-bold block">Appraisal Assumptions Made</span>
                                  <ul className="space-y-0.5 text-[10px] text-slate-600">
                                    {activeReport.assumptions.map((asm, i) => (
                                      <li key={i}>• {asm}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[8px] font-mono text-slate-400 uppercase font-bold block">Information Base Sources Mapped</span>
                                  <ul className="space-y-0.5 text-[10px] text-slate-600">
                                    {activeReport.sources.map((src, i) => (
                                      <li key={i}>• {src}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB 6: CONTENT STUDIO */}
                  {activeWorkspaceTab === 'content' && (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Workspace Generated Marketing Copies</h3>
                          <p className="text-[11px] text-slate-400">Sales flyers, WhatsApp pitches, and social ads targeting this property node.</p>
                        </div>
                      </div>

                      {/* Filter workspace assets */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                            <span>WHATSAPP INTRO PITCH</span>
                            <span className="text-indigo-600">READY</span>
                          </div>
                          <p className="text-xs font-black text-slate-800">Bridgeview Court High Yield Prospectus</p>
                          <p className="text-xs text-slate-550 leading-relaxed italic">
                            "🏡 NEW LAUNCH IN ASABA: Bridgeview Court! Located just 3 mins from the Admiralty Expressway Tollgate, this master-planned residential estate offers instant allocation, C of O, and up to 18% annual capital appreciation..."
                          </p>
                        </div>

                        <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
                            <span>LINKEDIN PROFESSIONAL BRIEF</span>
                            <span className="text-indigo-600">DRAFT</span>
                          </div>
                          <p className="text-xs font-black text-slate-800">Strategic Land Banking: The Asaba Corridors</p>
                          <p className="text-xs text-slate-550 leading-relaxed italic">
                            "As regional logistics and infrastructure expand across Delta State, astute real estate organizations are focusing on localized landbanking nodes. Introducing Bridgeview Court..."
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: VALUATION & REPORTS */}
                  {activeWorkspaceTab === 'reports' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Valuation Ledger & Feasibility Briefs</h3>
                          <p className="text-[11px] text-slate-450">Download structured legal appraisals and engineering feasibility assessments.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-left">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                              <FileSpreadsheet className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">Feasibility Study Brief</h4>
                              <p className="text-[9px] text-slate-400 font-mono uppercase">2.4 MB • PDF • APPROVED</p>
                            </div>
                          </div>
                          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 font-mono">DOWNLOAD</button>
                        </div>

                        <div className="p-3 border border-slate-200 bg-slate-50/50 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-left">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                              <FileSpreadsheet className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">Legal Survey Appraisal Sheet</h4>
                              <p className="text-[9px] text-slate-400 font-mono uppercase">1.8 MB • DOCX • SIGNED</p>
                            </div>
                          </div>
                          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 font-mono">DOWNLOAD</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 8: AUDIT TRAIL TIMELINE */}
                  {activeWorkspaceTab === 'activity' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900">Property Audit Log Timeline</h3>
                      
                      <div className="relative pl-5 border-l-2 border-indigo-100 space-y-4 text-xs">
                        {details?.timeline?.map((ev: any) => (
                          <div key={ev.id} className="relative text-left">
                            {/* Dot */}
                            <div className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600" />
                            
                            <div>
                              <span className="text-[9px] text-slate-400 font-mono block">
                                {new Date(ev.createdAt).toLocaleDateString()} • {new Date(ev.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 mt-0.5">{ev.title}</h4>
                              <span className="text-[8px] font-mono font-bold uppercase bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded mt-1 inline-block">
                                {ev.type}
                              </span>
                              <p className="text-[11px] text-slate-550 leading-relaxed mt-1 italic">
                                "{ev.description}"
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-400">
                                <span>Author Profile:</span>
                                <span className="font-bold text-slate-600">{ev.author}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 9: NODE SETTINGS */}
                  {activeWorkspaceTab === 'settings' && (
                    <div className="space-y-4 text-left">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Access Security & Safety</h4>
                        
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center justify-between py-2 border-b border-slate-150">
                            <div>
                              <p className="font-bold text-slate-800">Security Visibility</p>
                              <p className="text-[10px] text-slate-400">Controls indexing level across external AI networks.</p>
                            </div>
                            <select className="bg-white border border-slate-200 rounded-xl p-1 text-xs">
                              <option value="Public">Public Ledger</option>
                              <option value="Internal">Internal Org Only</option>
                              <option value="Confidential">Confidential / Audited</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-bold text-slate-800">Archive Property Node</p>
                              <p className="text-[10px] text-slate-400">Removes this node temporarily from trading lists.</p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                const isArchivedNow = currentProperty.status === 'Archived';
                                await fetch(`/api/properties/${currentProperty.id}/archive`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ isArchived: !isArchivedNow })
                                });
                                window.location.reload();
                              }}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold"
                            >
                              {currentProperty.status === 'Archived' ? 'Unarchive Node' : 'Archive Node'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Destructive zone */}
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-rose-800 uppercase font-mono tracking-wider">Danger Zone</h4>
                        <p className="text-[11px] text-rose-700">Irreversibly revokes this property registration from EstateOS company ledger.</p>
                        <button
                          type="button"
                          onClick={() => onDeleteProperty(currentProperty.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          Revoke Ledger Node Permanent
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                <Compass className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Select Property Entry</h4>
                <p className="text-[10px] text-slate-400 mt-1">Pick a property card on the left to start exploring intelligence indicators.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. Multi-step Onboarding Wizard Modal */}
      {showCreateWizard && (
        <CreatePropertyWizard
          onClose={() => {
            setShowCreateWizard(false);
            setEditingProperty(undefined);
          }}
          onSubmit={async (payload) => {
            if (editingProperty) {
              await onUpdateProperty(editingProperty.id, payload);
            } else {
              await onAddProperty(payload);
            }
            setShowCreateWizard(false);
            setEditingProperty(undefined);
          }}
          documents={documents}
          initialProperty={editingProperty}
        />
      )}

      {/* 5. Link existing Document Modal overlay */}
      {showLinkDocModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Link className="h-4 w-4 text-indigo-600" />
                Connect Workspace Document
              </h3>
              <button onClick={() => setShowLinkDocModal(false)} className="text-slate-400 hover:text-slate-800">✕</button>
            </div>

            <div className="border border-slate-200 rounded-xl max-h-[220px] overflow-y-auto divide-y divide-slate-100">
              {documents
                .filter(d => !details?.documents?.includes(d.id))
                .map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => handleLinkDocument(doc.id)}
                    className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{doc.name}</p>
                      <p className="text-[9px] text-slate-450 uppercase font-mono mt-0.5">{doc.type} • {doc.confidentiality}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 font-mono hover:underline">LINK</span>
                  </div>
                ))}
              {documents.filter(d => !details?.documents?.includes(d.id)).length === 0 && (
                <p className="p-4 text-center text-slate-400 text-xs italic">All workspace documents already connected!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Quick AI-Agents Action Simulator Modal */}
      {showQuickActionModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                {showQuickActionModal === 'brief' ? 'AI Agent Orchestrator: Property Brief' : 'AI Agent Orchestrator: Feasibility Analysis'}
              </h3>
              <button onClick={() => setShowQuickActionModal(null)} className="text-slate-400 hover:text-slate-800">✕</button>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-slate-600">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2.5">
                <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-850">
                  This simulates how EstateOS's specialized AI agents will parse your connected documents (brochures, legal authorizations) to construct a production-ready deliverable.
                </p>
              </div>

              {showQuickActionModal === 'brief' ? (
                <div className="space-y-3.5">
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">PRE-COMPILED STRATEGIC BRIEF</span>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-[10px] text-slate-700 space-y-2 max-h-[200px] overflow-y-auto">
                    <p className="font-bold text-indigo-700">🎯 ASSET BRIEFING SCHEMA: {currentProperty.name}</p>
                    <p>• Internal Reference: {currentProperty.internalReferenceId}</p>
                    <p>• Total Landmass: {currentProperty.totalSize || '8.5 Hectares'}</p>
                    <p>• Primary Document Indexing: SUCCESS ({details?.documents?.length || 0} files connected)</p>
                    <p>• Proximity Transport Hubs: {currentProperty.nearbyLandmarks?.[0]?.name || 'N/A'} ({currentProperty.nearbyLandmarks?.[0]?.distance || 'N/A'})</p>
                    <p>• Target Audience: High Networth Landbankers & Estate Developers</p>
                    <p className="italic text-slate-500 pt-2 border-t border-slate-200">
                      AI Note: Knowledge corpus successfully prepared for future model generation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">PRE-COMPILED FEASIBILITY METRICS</span>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-[10px] text-slate-700 space-y-2">
                    <p className="font-bold text-emerald-600">📊 FEASIBILITY ASSESSMENT: {currentProperty.name}</p>
                    <p>• Projected Annual Appreciation: {details?.statistics?.expectedAppreciation || '14% - 18%'}</p>
                    <p>• Capital Investment ROI Estimate: {details?.statistics?.roiEstimate || '19.2% Net Yield'}</p>
                    <p>• Market Demand Level Indicator: {details?.statistics?.demandLevel || 'High'} ({details?.statistics?.marketTrend || 'Bullish'} trend)</p>
                    <p>• Confidence index: {details?.statistics?.confidenceScore || 90}% Accuracy Margin</p>
                    <p className="italic text-slate-500 pt-2 border-t border-slate-200">
                      AI Note: Structural metrics calibrated. Relational database elements linked.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setShowQuickActionModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Image Lightbox View Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[60] cursor-zoom-out animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="max-w-3xl max-h-[85vh] relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={lightboxImage} 
              alt="Lightbox Preview" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <button 
              className="absolute top-4 right-4 bg-slate-950/70 p-2 text-white hover:text-slate-200 rounded-full cursor-pointer"
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
