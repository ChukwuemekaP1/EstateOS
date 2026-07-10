import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Cpu, 
  FileText, 
  Video, 
  TrendingUp, 
  Compass, 
  CheckCircle2, 
  Clock, 
  Play, 
  AlertCircle,
  Sparkles,
  ChevronDown,
  Plus,
  Share2,
  Trash2,
  Eye,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import { User, Property, Document, Report, ContentAsset, Agent } from '../types';

interface DashboardViewProps {
  user: User;
  properties: Property[];
  documents: Document[];
  reports: Report[];
  contentAssets: ContentAsset[];
  agents: Agent[];
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  onGenerateReportClick: () => void;
  onCreateContentClick: () => void;
  onUploadDocumentClick: () => void;
  onCreatePropertyClick: () => void;
}

export default function DashboardView({
  user,
  properties,
  documents,
  reports,
  contentAssets,
  agents,
  selectedPropertyId,
  setSelectedPropertyId,
  setActiveTab,
  onGenerateReportClick,
  onCreateContentClick,
  onUploadDocumentClick,
  onCreatePropertyClick
}: DashboardViewProps) {
  const [outputTab, setOutputTab] = useState<'All' | 'Reports' | 'Content' | 'Insights' | 'Analysis'>('All');
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [period, setPeriod] = useState('Last 7 days');

  // Find active property
  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  // Dynamic calculations based on active property and global state
  const totalPropertiesCount = properties.length;
  const activePropertyReports = reports.filter(r => r.propertyId === selectedPropertyId);
  const activePropertyContent = contentAssets.filter(c => c.propertyId === selectedPropertyId);
  const activePropertyDocuments = documents.filter(d => d.propertyId === selectedPropertyId);

  // Widget metrics
  const activeAgentsCount = agents.filter(a => a.status === 'Completed' || a.status === 'In Progress').length;
  const reportsCount = reports.length;
  const contentCount = contentAssets.length;
  const insightsCount = 5; // Simulating new insights
  const confidenceScore = 92; // Average confidence score

  // Output cards filtering
  const filteredOutputs = () => {
    // Merge Reports and Content Assets to represent the latest deliverables
    const outputs: Array<{
      id: string;
      title: string;
      type: 'report' | 'content';
      category: string;
      createdAt: string;
      createdBy: string;
      format: string;
    }> = [
      ...reports.map(r => ({
        id: r.id,
        title: r.title,
        type: 'report' as const,
        category: r.type,
        createdAt: r.createdAt,
        createdBy: r.createdByName,
        format: r.format
      })),
      ...contentAssets.map(c => ({
        id: c.id,
        title: c.title,
        type: 'content' as const,
        category: c.platform,
        createdAt: c.createdAt,
        createdBy: c.createdBy,
        format: c.format
      }))
    ];

    // Sort by latest created
    const sorted = outputs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (outputTab === 'All') return sorted;
    if (outputTab === 'Reports') return sorted.filter(o => o.type === 'report');
    if (outputTab === 'Content') return sorted.filter(o => o.type === 'content');
    if (outputTab === 'Insights') return sorted.filter(o => o.category.toLowerCase().includes('insight') || o.category === 'Market Analysis');
    if (outputTab === 'Analysis') return sorted.filter(o => o.category === 'Full Investment' || o.category === 'Competitor Intelligence');
    return sorted;
  };

  const outputsList = filteredOutputs();

  // Handle property switching
  const handlePropertySelect = (id: string) => {
    setSelectedPropertyId(id);
    setShowPropertySelector(false);
  };

  // Helper for agent status visual styling
  const getAgentStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          dot: 'bg-emerald-500',
          label: 'Completed'
        };
      case 'In Progress':
        return {
          bg: 'bg-indigo-50 border-indigo-100 text-indigo-700 animate-pulse',
          dot: 'bg-indigo-500',
          label: 'In Progress'
        };
      case 'Waiting':
      default:
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-400',
          dot: 'bg-slate-400',
          label: 'Waiting'
        };
    }
  };

  // Quick action panel definitions (as seen in screenshot right rail)
  const quickActions = [
    { label: 'Generate New Report', action: onGenerateReportClick, icon: FileText },
    { label: 'Create Content Pack', action: onCreateContentClick, icon: Video },
    { label: 'Upload Documents', action: onUploadDocumentClick, icon: Plus },
    { label: 'Market Research', action: () => alert('Market Analysis module synchronized and ready.'), icon: Compass },
    { label: 'Competitor Analysis', action: () => alert('Competitor Intelligence module synchronized and ready.'), icon: TrendingUp },
    { label: 'Sales Coaching Session', action: () => alert('Sales Coaching module synchronized and ready.'), icon: Cpu },
  ];

  return (
    <div className="space-y-6 text-slate-800 select-none font-sans overflow-x-hidden p-6 max-w-7xl mx-auto">
      
      {/* 1. Welcoming Header Row with Dropdown selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Good morning, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeProperty 
              ? `Here's what's happening with ${activeProperty.name}, ${activeProperty.location} today.`
              : 'Add properties to unlock full AI team workspace.'}
          </p>
        </div>

        {/* Time period filter dropdown */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button 
              onClick={() => {}} 
              className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition"
            >
              <span>{period}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top level dynamic metrics panels */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: AI Agents */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{activeAgentsCount}</div>
            <div className="text-xs text-slate-400 font-medium">AI Agents Active</div>
          </div>
        </div>

        {/* Metric 2: Reports */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{reportsCount}</div>
            <div className="text-xs text-slate-400 font-medium">Reports Generated</div>
          </div>
        </div>

        {/* Metric 3: Content Pieces */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{contentCount}</div>
            <div className="text-xs text-slate-400 font-medium">Content Pieces</div>
          </div>
        </div>

        {/* Metric 4: Insights */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{insightsCount}</div>
            <div className="text-xs text-slate-400 font-medium">Market Insights</div>
          </div>
        </div>

        {/* Metric 5: Average Confidence */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center space-x-4 col-span-2 lg:col-span-1 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{confidenceScore}%</div>
            <div className="text-xs text-slate-400 font-medium">Confidence Score</div>
          </div>
        </div>
      </div>

      {/* 3. Main layout split: AI Agent Team (Left) & Active Property Details / Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (Span 2): AI Agent Pipeline Pipeline Flow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-indigo-500" />
                <h2 className="text-md font-bold text-slate-800 uppercase tracking-wider font-mono">
                  AI Agent Team Flow
                </h2>
              </div>
              <button 
                onClick={() => setActiveTab('ai-agents')}
                className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold"
              >
                View Agent Activity
              </button>
            </div>

            {/* Custom Pipeline Visualization */}
            <div className="relative p-2 space-y-6">
              {/* Pipeline Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative z-10">
                {agents.map((agent, idx) => {
                  const s = getAgentStatusStyles(agent.status);
                  return (
                    <div 
                      key={agent.id}
                      className={`p-3 border rounded-xl flex flex-col justify-between h-[96px] backdrop-blur-md relative overflow-hidden transition-all duration-300 group ${
                        agent.status === 'Completed' ? 'bg-emerald-50/10 border-emerald-200 hover:border-emerald-300' :
                        agent.status === 'In Progress' ? 'bg-indigo-50/20 border-indigo-200 hover:ring-1 hover:ring-indigo-500/20' :
                        'bg-slate-50/40 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Node Index Indicator */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {agent.index}.
                        </span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono border ${s.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot} mr-1 shrink-0`} />
                          {s.label}
                        </span>
                      </div>

                      {/* Agent Name */}
                      <div className="mt-2 text-[11px] font-semibold text-slate-700 line-clamp-2 leading-tight">
                        {agent.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Seamless connectors background styling (SVG paths or subtle cues) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 48 L 700 48 M 700 48 C 720 48, 720 120, 700 120 L 50 120 C 30 120, 30 190, 50 190 L 700 190" fill="none" stroke="currentColor" className="text-slate-300" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center space-x-2 text-slate-500">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span>Synchronized with primary title deeds and structural folders.</span>
              </div>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All Engines Ready
              </span>
            </div>
          </div>

          {/* 4. Bottom Middle Area: Output Deliverables List */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                Latest Deliverables
              </h3>
              
              {/* Deliverables Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                {(['All', 'Reports', 'Content', 'Insights', 'Analysis'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setOutputTab(tab)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      outputTab === tab 
                        ? 'bg-white text-indigo-600 border border-slate-200 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Deliverables State */}
            {outputsList.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-600">No generated deliverables yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Run reports, draft content or launch analyses to populate your deliverables ledger.
                </p>
                <button
                  onClick={onGenerateReportClick}
                  className="mt-4 inline-flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Generate Report</span>
                </button>
              </div>
            ) : (
              /* Deliverables Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outputsList.slice(0, 4).map(output => (
                  <div 
                    key={output.id}
                    className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl flex items-start justify-between group hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <div className={`p-2.5 rounded-lg shrink-0 ${
                        output.type === 'report' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate text-left">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                          {output.type === 'report' ? 'Report' : 'Content Asset'}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 truncate mt-0.5" title={output.title}>
                          {output.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-500">
                          <span>By {output.createdBy}</span>
                          <span>•</span>
                          <span>{new Date(output.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
                        {output.format}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Property & Quick Actions Rails */}
        <div className="space-y-6">
          
          {/* Active Property Card (As seen on Right Rail) */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Active Station Target
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowPropertySelector(!showPropertySelector)}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold flex items-center space-x-1"
                >
                  <span>Change Target</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {/* Property quick switcher dropdown */}
                {showPropertySelector && (
                  <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 w-60 z-50">
                    <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Target Properties
                    </div>
                    {properties.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePropertySelect(p.id)}
                        className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition ${
                          selectedPropertyId === p.id 
                            ? 'bg-indigo-50 text-indigo-700 font-bold' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => { setShowPropertySelector(false); onCreatePropertyClick(); }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-500 flex items-center space-x-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add New Property</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Property Display Panel */}
            {activeProperty ? (
              <div className="space-y-4">
                <div className="relative h-44 w-full bg-slate-100 rounded-xl overflow-hidden group">
                  <img
                    src={activeProperty.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'}
                    alt={activeProperty.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
                    {activeProperty.status}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-900">{activeProperty.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{activeProperty.location}</p>
                </div>

                {/* Meta details list */}
                <div className="space-y-2.5 pt-2 text-xs border-t border-slate-100 text-left font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Property Type</span>
                    <span className="text-slate-800 font-semibold">{activeProperty.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price Range</span>
                    <span className="text-slate-800 font-mono font-semibold">{activeProperty.price}</span>
                  </div>
                  {activeProperty.landTitle && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Land Title</span>
                      <span className="text-slate-800 font-semibold">{activeProperty.landTitle}</span>
                    </div>
                  )}
                  {activeProperty.totalSize && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Land Size</span>
                      <span className="text-slate-800 font-semibold">{activeProperty.totalSize}</span>
                    </div>
                  )}
                  {activeProperty.approvalStatus && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Approval Status</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {activeProperty.approvalStatus}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Updated</span>
                    <span className="text-slate-500">
                      {new Date(activeProperty.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Building2 className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-500">No properties targeting</h4>
                <button
                  onClick={onCreatePropertyClick}
                  className="mt-3 text-xs bg-indigo-600 px-3 py-1.5 rounded-lg text-white hover:bg-indigo-500 cursor-pointer"
                >
                  Create Property
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Panel (Right Rail) */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3.5 shadow-sm">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono pb-1.5 border-b border-slate-100">
              Station Quick Actions
            </span>
            <div className="space-y-2 text-left">
              {quickActions.map((qa, index) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={index}
                    onClick={qa.action}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition group cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition" />
                    <span>{qa.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Advisor Panel (Right Rail Footer) */}
          <div className="p-5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/10 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-indigo-100">
                AI Recommendation Advisor
              </span>
              <Sparkles className="h-4 w-4 text-indigo-100 animate-pulse" />
            </div>
            <p className="text-xs text-indigo-50 leading-relaxed text-left">
              Based on current market trends, now is a strong time to promote <strong className="font-semibold text-white">Bridgeview Court's</strong> proximity to the proposed Asaba Airport expansion project.
            </p>
            <button
              onClick={() => alert('Foundation Insight: Deeper details are synced in Knowledge Base.')}
              className="w-full mt-2 py-2 bg-white text-indigo-600 font-semibold text-xs rounded-xl hover:bg-indigo-50 transition cursor-pointer"
            >
              View Full Insight
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
