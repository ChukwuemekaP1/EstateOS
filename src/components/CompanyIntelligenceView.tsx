import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  UploadCloud, 
  Search, 
  FileText, 
  Trash2, 
  Download, 
  Eye, 
  Filter, 
  Plus, 
  Tag, 
  Building2, 
  HelpCircle, 
  Layers, 
  History, 
  Cpu, 
  LayoutGrid, 
  List, 
  CheckCircle, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  Check, 
  Settings, 
  X, 
  Archive,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { Document, Property, WorkspaceSettings, DocumentVersion } from '../types';

interface CompanyIntelligenceViewProps {
  documents: Document[];
  properties: Property[];
  onUploadDocument: (document: Partial<Document>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  syncAllData?: () => Promise<void>; // optional callback to refresh state
}

export default function CompanyIntelligenceView({
  documents,
  properties,
  onUploadDocument,
  onDeleteDocument,
  syncAllData
}: CompanyIntelligenceViewProps) {
  // Navigation tabs inside Company Intelligence
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'settings'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Administrative Customization States (cloned from server on mount)
  const [customSettings, setCustomSettings] = useState<WorkspaceSettings>({
    companyName: 'EstateIntel AI',
    website: 'https://estateintel.ai',
    address: '12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    brandPrimaryColor: '#4f46e5',
    brandSecondaryColor: '#10b981',
    defaultCurrency: '₦',
    timezone: 'UTC+1',
    apiKeys: [],
    documentCategories: [
      'FAQ', 'Property Brochure', 'Survey Plan', 'Payment Plan', 'Allocation Process',
      'Price List', 'Legal Document', 'Government Approval', 'Internal SOP', 'Research Report',
      'Market Analysis', 'Sales Script', 'Marketing Copy', 'Customer Questions', 'Images', 'Videos', 'Other'
    ],
    departments: ['Sales', 'Marketing', 'Finance', 'Legal', 'Executive', 'Operations'],
    tagCollections: ['Premium', 'High Appreciation', 'Waterfront', 'New Launch', 'Verified Title', 'Blueprint'],
    confidentialityLevels: ['Public', 'Internal', 'Confidential', 'Highly Confidential'],
    uploadLimitMb: 25
  });

  // Load administrative workspace settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setCustomSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (err) {
      console.warn('Failed to load settings in Company Intelligence View:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // --- FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterConfidentiality, setFilterConfidentiality] = useState('All');
  const [filterState, setFilterState] = useState('All');
  const [filterTag, setFilterTag] = useState('All');

  // Clear all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterProperty('All');
    setFilterDepartment('All');
    setFilterCategory('All');
    setFilterConfidentiality('All');
    setFilterState('All');
    setFilterTag('All');
  };

  // --- UPLOAD FORM STATES ---
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState('FAQ');
  const [uploadFileFormat, setUploadFileFormat] = useState('pdf');
  const [uploadPropertyIds, setUploadPropertyIds] = useState<string[]>([]);
  const [uploadDepartment, setUploadDepartment] = useState('Operations');
  const [uploadState, setUploadState] = useState('Delta State');
  const [uploadCity, setUploadCity] = useState('Asaba');
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadConfidentiality, setUploadConfidentiality] = useState('Internal');
  const [uploadVersion, setUploadVersion] = useState('1.0');
  const [uploadNotes, setUploadNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- VERSION REPLACEMENT STATE ---
  const versionInputRef = useRef<HTMLInputElement>(null);

  // --- SETTINGS CONFIG FORM STATES ---
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newDeptInput, setNewDeptInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [newConfidentialityInput, setNewConfidentialityInput] = useState('');
  const [uploadLimitInput, setUploadLimitInput] = useState(25);

  // Drag and drop zone
  const [isDragging, setIsDragging] = useState(false);

  // Process filters dynamically
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (doc.textExtraction && doc.textExtraction.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProperty = filterProperty === 'All' || 
                             doc.propertyId === filterProperty || 
                             (doc.propertyIds && doc.propertyIds.includes(filterProperty));
    
    const matchesDept = filterDepartment === 'All' || doc.department === filterDepartment;
    const matchesCat = filterCategory === 'All' || doc.type === filterCategory;
    const matchesConf = filterConfidentiality === 'All' || doc.confidentiality === filterConfidentiality;
    const matchesState = filterState === 'All' || doc.state === filterState;
    const matchesTag = filterTag === 'All' || (doc.tags && doc.tags.includes(filterTag));

    return matchesSearch && matchesProperty && matchesDept && matchesCat && matchesConf && matchesState && matchesTag;
  });

  // Dynamic calculations for executive dashboard cards
  const totalDocs = documents.length;
  const totalProperties = properties.length;
  const totalFAQs = documents.filter(d => d.type === 'FAQ').length;
  
  const researchFiles = documents.filter(d => d.type === 'Research Report' || d.type === 'Market Analysis');
  const legalDocs = documents.filter(d => d.type === 'Legal Document' || d.type === 'Government Approval' || d.department === 'Legal');
  const salesDocs = documents.filter(d => d.type === 'Sales Script' || d.type === 'Price List' || d.type === 'Payment Plan');
  const marketingAssets = documents.filter(d => d.type === 'Property Brochure' || d.type === 'Marketing Copy');

  const recentUploads = [...documents].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 5);

  // --- ACTIONS HANDLERS ---
  
  // 1. Seed Demo Workspace Action
  const handleLoadDemoWorkspace = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/workspace/seed', { method: 'POST' });
      if (res.ok) {
        if (syncAllData) {
          await syncAllData();
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Failed to seed demo workspace:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // 2. Clear Workspace Action
  const handleClearWorkspace = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete all dynamic documents, properties, and reports? This action cannot be undone.')) return;
    setIsClearing(true);
    try {
      const res = await fetch('/api/workspace/clear', { method: 'POST' });
      if (res.ok) {
        setSelectedDoc(null);
        if (syncAllData) {
          await syncAllData();
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Failed to clear workspace:', err);
    } finally {
      setIsClearing(false);
    }
  };

  // 3. Document Registration (Upload)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName) return;

    const payload = {
      name: uploadName.endsWith('.' + uploadFileFormat) ? uploadName : `${uploadName}.${uploadFileFormat}`,
      type: uploadType,
      fileFormat: uploadFileFormat,
      propertyIds: uploadPropertyIds,
      department: uploadDepartment,
      state: uploadState,
      city: uploadCity,
      tags: uploadTags,
      effectiveDate: uploadEffectiveDate,
      confidentiality: uploadConfidentiality,
      version: uploadVersion,
      notes: uploadNotes
    };

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowUploadModal(false);
        // reset form
        setUploadName('');
        setUploadPropertyIds([]);
        setUploadTags([]);
        setUploadNotes('');
        
        if (syncAllData) {
          await syncAllData();
        }
      }
    } catch (err) {
      console.error('Failed to upload:', err);
    }
  };

  // 4. Archive Document
  const handleArchiveDocument = async (docId: string, archiveState: boolean) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: archiveState })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedDoc(updated);
        if (syncAllData) await syncAllData();
      }
    } catch (err) {
      console.error('Failed to archive document:', err);
    }
  };

  // 5. Version Replacement (Upload New Version)
  const handleReplaceVersion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDoc) return;

    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

    const payload = {
      isReplaceVersion: true,
      newFileName: file.name,
      newSize: file.size,
      newFileFormat: extension,
      notes: `Replaced with new file version: ${file.name}`
    };

    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedDoc(updated);
        if (syncAllData) await syncAllData();
      }
    } catch (err) {
      console.error('Failed to replace version:', err);
    }
  };

  // 6. Save Customized Settings
  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customSettings)
      });
      if (res.ok) {
        alert('Settings synced successfully with security logs.');
        fetchSettings();
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Helpers to add dynamic config metadata
  const handleAddCategory = () => {
    if (newCategoryInput && customSettings.documentCategories) {
      if (!customSettings.documentCategories.includes(newCategoryInput)) {
        setCustomSettings({
          ...customSettings,
          documentCategories: [...customSettings.documentCategories, newCategoryInput]
        });
      }
      setNewCategoryInput('');
    }
  };

  const handleAddDept = () => {
    if (newDeptInput && customSettings.departments) {
      if (!customSettings.departments.includes(newDeptInput)) {
        setCustomSettings({
          ...customSettings,
          departments: [...customSettings.departments, newDeptInput]
        });
      }
      setNewDeptInput('');
    }
  };

  const handleAddTag = () => {
    if (newTagInput && customSettings.tagCollections) {
      if (!customSettings.tagCollections.includes(newTagInput)) {
        setCustomSettings({
          ...customSettings,
          tagCollections: [...customSettings.tagCollections, newTagInput]
        });
      }
      setNewTagInput('');
    }
  };

  const handleAddConfidentiality = () => {
    if (newConfidentialityInput && customSettings.confidentialityLevels) {
      if (!customSettings.confidentialityLevels.includes(newConfidentialityInput)) {
        setCustomSettings({
          ...customSettings,
          confidentialityLevels: [...customSettings.confidentialityLevels, newConfidentialityInput]
        });
      }
      setNewConfidentialityInput('');
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const nameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
      
      setUploadName(nameWithoutExtension);
      setUploadFileFormat(extension);
      setShowUploadModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const nameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const extension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

      setUploadName(nameWithoutExtension);
      setUploadFileFormat(extension);
      setShowUploadModal(true);
    }
  };

  // Find related assets for active selected document
  const relatedAssets = selectedDoc 
    ? documents.filter(d => d.id !== selectedDoc.id && (d.type === selectedDoc.type || d.propertyId === selectedDoc.propertyId)).slice(0, 4)
    : [];

  return (
    <div className="space-y-6 text-slate-800 p-6 max-w-7xl mx-auto font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider">
              Company Intelligence Node
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mt-1">
            <Database className="h-6 w-6 text-indigo-600" />
            Company Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Intelligent Document Management with metadata extraction, multi-property linking, and automated AI vector index tracking.
          </p>
        </div>

        {/* Global Control Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleLoadDemoWorkspace}
            disabled={isSeeding}
            className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span>Load Demo Workspace</span>
          </button>

          <button
            onClick={handleClearWorkspace}
            disabled={isClearing}
            className="inline-flex items-center space-x-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
          >
            {isClearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span>Clear Workspace</span>
          </button>

          <button
            onClick={() => {
              setUploadName('');
              setUploadPropertyIds([]);
              setUploadNotes('');
              setShowUploadModal(true);
            }}
            className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview Dashboard
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Document Browser
          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
            {documents.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          Intelligence Settings
        </button>
      </div>

      {/* Render Main Selected Tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="min-h-[50vh]"
        >
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Documents */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Document Pool</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalDocs}</h3>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 border-t border-slate-100 pt-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Metadata indexed securely</span>
                  </div>
                </div>

                {/* Properties Registered */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Properties Mapped</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalProperties}</h3>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 border-t border-slate-100 pt-2 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Connected via cross-linking</span>
                  </div>
                </div>

                {/* FAQs Mapped */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Centralized FAQs</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalFAQs}</h3>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 border-t border-slate-100 pt-2 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Auto-objection scripts feeder</span>
                  </div>
                </div>

                {/* Intelligence Classifications */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Asset Categories</span>
                    <div className="grid grid-cols-2 gap-1.5 mt-2.5 text-[10px] font-mono text-slate-600">
                      <div>Legal: <b className="text-slate-900">{legalDocs.length}</b></div>
                      <div>Research: <b className="text-slate-900">{researchFiles.length}</b></div>
                      <div>Sales: <b className="text-slate-900">{salesDocs.length}</b></div>
                      <div>Marketing: <b className="text-slate-900">{marketingAssets.length}</b></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Section: Drag Zone + Recent Uploads */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Drag and Drop Zone Container */}
                <div className="lg:col-span-2 space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50/50' 
                        : 'border-slate-200 bg-white hover:border-slate-350 shadow-sm'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
                    />
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-indigo-600 mb-3">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900">Drag and drop documents here</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal max-w-xs mx-auto">
                      Supports PDF, DOCX, TXT, CSV, XLS, or imagery files. Files are automatically classified through metadata rules.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-[11px] text-slate-500 leading-normal space-y-2">
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider font-mono text-[9px]">
                      <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                      Dynamic Indexing Instruction
                    </div>
                    <p>
                      Files processed under Company Intelligence are automatically scanned. Title plans, survey beacons, and cashflows are prepared as structured facts for downstream marketing copy and financial analysis pipelines.
                    </p>
                  </div>
                </div>

                {/* Recently Uploaded Documents Table */}
                <div className="lg:col-span-3 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <History className="h-4 w-4 text-indigo-500" />
                      Recently Uploaded Ledger
                    </h3>
                    <button 
                      onClick={() => setActiveTab('documents')} 
                      className="text-[10px] text-indigo-600 hover:underline font-semibold"
                    >
                      Browse All
                    </button>
                  </div>

                  {recentUploads.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs italic">
                      No files uploaded yet. Click "Load Demo Workspace" to start.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentUploads.map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => {
                            setSelectedDoc(doc);
                            setActiveTab('documents');
                          }}
                          className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/50 transition cursor-pointer"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-indigo-600 shrink-0 font-mono text-xs font-bold">
                              {doc.fileFormat.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-slate-800 truncate max-w-xs md:max-w-md">{doc.name}</h4>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="font-mono">{doc.sizeFormatted}</span>
                                <span>•</span>
                                <span className="font-medium bg-slate-100 px-1.5 py-0.2 rounded text-[9px] uppercase font-mono tracking-tight text-indigo-700">
                                  {doc.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2.5 font-mono text-[10px] shrink-0">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              doc.processingStatus === 'Indexed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              doc.processingStatus === 'Processing' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {doc.processingStatus}
                            </span>
                            <ChevronRight className="h-4 w-4 text-slate-350" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENT BROWSER (FOLDER-FREE METADATA BROWSER) */}
          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Left Column: Multiselect Metadata Filter Panel */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Filter className="h-3.5 w-3.5 text-indigo-500" />
                    Metadata Filters
                  </span>
                  <button 
                    onClick={resetFilters}
                    className="text-[10px] text-slate-400 hover:text-rose-600 transition font-mono uppercase"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Filter by Property */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Related Property</label>
                    <select
                      value={filterProperty}
                      onChange={(e) => setFilterProperty(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Properties</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Category/Type */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Document Classification</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Classifications</option>
                      {customSettings.documentCategories?.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Department */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Corporate Department</label>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Departments</option>
                      {customSettings.departments?.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Confidentiality */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Confidentiality Level</label>
                    <select
                      value={filterConfidentiality}
                      onChange={(e) => setFilterConfidentiality(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Security Levels</option>
                      {customSettings.confidentialityLevels?.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by State */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">State / Region</label>
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Regions</option>
                      <option value="Delta State">Delta State</option>
                      <option value="Lagos State">Lagos State</option>
                      <option value="Other">Other Region</option>
                    </select>
                  </div>

                  {/* Filter by Tag */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Tag Collection</label>
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Tags</option>
                      {customSettings.tagCollections?.map(tag => (
                        <option key={tag} value={tag}>#{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-150 flex flex-col gap-1.5 font-mono text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>Pool:</span>
                    <span className="font-bold text-slate-900">{documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filtered:</span>
                    <span className="font-bold text-indigo-600">{filteredDocs.length}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Search bar, view mode selector, document listings */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* Search & Layout Control toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:max-w-md text-left">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search scanned text, beacon formulas, or metadata notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-700 transition shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl bg-white p-1 self-stretch sm:self-auto shrink-0 justify-center">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-800'}`}
                      title="Table Layout"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-800'}`}
                      title="Grid Layout"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Main Documents Listing */}
                {filteredDocs.length === 0 ? (
                  <div className="py-24 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <Database className="h-10 w-10 text-slate-350 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-800">No matching records mapped</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Try broadening your metadata search constraints or clear active folder filters.
                    </p>
                    <button 
                      onClick={resetFilters}
                      className="mt-4 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocs.map(doc => {
                      const linkedPropNames = properties
                        .filter(p => doc.propertyId === p.id || (doc.propertyIds && doc.propertyIds.includes(p.id)))
                        .map(p => p.name)
                        .join(', ');

                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          className={`p-4 bg-white border rounded-2xl text-left hover:border-slate-300 transition cursor-pointer flex flex-col justify-between shadow-sm relative overflow-hidden ${
                            selectedDoc?.id === doc.id ? 'border-indigo-600 ring-1 ring-indigo-500/25' : 'border-slate-200'
                          }`}
                        >
                          <div>
                            {/* Format badge & Security */}
                            <div className="flex items-center justify-between">
                              <span className="bg-slate-100 border border-slate-200 text-slate-700 font-bold font-mono text-[10px] uppercase px-2 py-0.5 rounded">
                                {doc.fileFormat.toUpperCase()}
                              </span>
                              <span className="flex items-center text-[10px] text-amber-600 font-mono gap-1 font-semibold">
                                <Shield className="h-3 w-3" />
                                {doc.confidentiality}
                              </span>
                            </div>

                            <div className="mt-3">
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight" title={doc.name}>
                                {doc.name}
                              </h4>
                              <p className="text-[10px] text-slate-450 font-mono mt-1">{doc.sizeFormatted} • Ver {doc.version}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500">
                            {linkedPropNames && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate font-semibold">{linkedPropNames}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span>{doc.uploadedByName}</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Table View mode */
                  <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-mono font-semibold uppercase tracking-wider">
                            <th className="p-4">Document Title</th>
                            <th className="p-4">Classification</th>
                            <th className="p-4">Dept</th>
                            <th className="p-4">Confidentiality</th>
                            <th className="p-4">Version</th>
                            <th className="p-4">Index Status</th>
                            <th className="p-4 text-right">Size</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDocs.map(doc => {
                            const isDocSelected = selectedDoc?.id === doc.id;
                            return (
                              <tr
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`border-b border-slate-100 hover:bg-slate-50/50 transition text-slate-600 cursor-pointer ${
                                  isDocSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : ''
                                }`}
                              >
                                <td className="p-4">
                                  <div className="flex items-center space-x-3 max-w-xs md:max-w-md">
                                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-indigo-600 shrink-0 font-mono text-[9px] font-bold uppercase">
                                      {doc.fileFormat}
                                    </div>
                                    <span className="font-semibold text-slate-800 truncate" title={doc.name}>
                                      {doc.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-slate-50 border border-slate-200 text-indigo-750">
                                    {doc.type}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-slate-700">{doc.department}</td>
                                <td className="p-4">
                                  <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-slate-600 font-mono">
                                    <Shield className="h-3 w-3 text-slate-400" />
                                    {doc.confidentiality}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-slate-500">{doc.version}</td>
                                <td className="p-4 font-mono text-[10px]">
                                  <span className={`px-2 py-0.5 rounded font-bold ${
                                    doc.processingStatus === 'Indexed' ? 'bg-emerald-50 text-emerald-700' :
                                    doc.processingStatus === 'Processing' ? 'bg-indigo-50 text-indigo-600 animate-pulse' :
                                    'bg-amber-50 text-amber-700'
                                  }`}>
                                    {doc.processingStatus}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-500">{doc.sizeFormatted}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN CUSTOM SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left items-start">
              
              {/* Settings Form Controls Column */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Administrative Settings</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Customize metadata values across folders, security classifications, and upload bounds.</p>
                </div>

                <div className="space-y-4">
                  {/* Category Management */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 font-mono uppercase">Add Document Classification (Category)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Tenancy Agreement"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={handleAddCategory}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition shrink-0"
                      >
                        Add Category
                      </button>
                    </div>
                    {/* Render current lists as mini chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5 max-h-24 overflow-y-auto">
                      {customSettings.documentCategories?.map(cat => (
                        <span key={cat} className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-750 font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Corporate Department Management */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 font-mono uppercase">Add Corporate Department</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Asset Management"
                        value={newDeptInput}
                        onChange={(e) => setNewDeptInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={handleAddDept}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition shrink-0"
                      >
                        Add Dept
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {customSettings.departments?.map(dept => (
                        <span key={dept} className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-750 font-medium font-mono">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tag collections */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 font-mono uppercase">Add Tag Collection</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. HighYield"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition shrink-0"
                      >
                        Add Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {customSettings.tagCollections?.map(tag => (
                        <span key={tag} className="text-[10px] bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded-lg text-indigo-700 font-bold font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Security Confidentiality level */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 font-mono uppercase">Add Confidentiality Level</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Board Only"
                        value={newConfidentialityInput}
                        onChange={(e) => setNewConfidentialityInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                      />
                      <button
                        onClick={handleAddConfidentiality}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition shrink-0"
                      >
                        Add Level
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {customSettings.confidentialityLevels?.map(lev => (
                        <span key={lev} className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-750 font-medium">
                          {lev}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Save Settings CTA */}
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={handleSaveSettings}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition"
                    >
                      Save Settings Configuration
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings Information Panel */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-4">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Dynamic Classification Policy</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The changes made on this administrative control dashboard are synced dynamically. Future document registrations will pull these categories, departments, tag structures, and confidentiality levels automatically to guarantee enterprise-level compliance across files.
                </p>

                <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2 text-xs">
                  <div className="font-bold text-slate-700 uppercase font-mono text-[9px] text-slate-400">Security Limit Metrics</div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Corporate Upload Bound:</span>
                    <span className="font-mono font-bold text-slate-800">{customSettings.uploadLimitMb || 25} MB per file</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Encryption Type:</span>
                    <span className="font-mono font-bold text-slate-800">AES-GCM 256-bit</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>AI Index Vector Coordinates:</span>
                    <span className="font-mono font-bold text-indigo-600">6 Dimensions</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* DETAILED DOCUMENT INSPECTION DRAWER / MODAL PANEL */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col text-left overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-150 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold font-mono text-xs shrink-0">
                    {selectedDoc.fileFormat.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs md:max-w-md">{selectedDoc.name}</h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">Uploaded by {selectedDoc.uploadedByName} • {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 space-y-6 flex-1 pb-16">
                
                {/* Visual File Preview Mockup */}
                <div className="p-12 bg-slate-900 text-slate-400 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border border-slate-800 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-2.5 left-2.5 bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                    Secure Sandbox View
                  </div>
                  <FileText className="h-10 w-10 text-indigo-500 animate-pulse" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-slate-200 font-semibold">{selectedDoc.name}</p>
                    <p className="text-[9px] font-mono text-slate-500 uppercase">{selectedDoc.sizeFormatted} • Ver {selectedDoc.version}</p>
                  </div>
                </div>

                {/* AI Preparation Layer panel */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-left text-xs font-mono space-y-3 shadow-sm relative text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="h-3.5 w-3.5 text-indigo-500" />
                      AI PREPARATION COGNITION
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      selectedDoc.processingStatus === 'Indexed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' :
                      selectedDoc.processingStatus === 'Processing' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50 animate-pulse' :
                      'bg-amber-950 text-amber-400 border border-amber-900/50'
                    }`}>
                      {selectedDoc.processingStatus}
                    </span>
                  </div>

                  <div className="space-y-2 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Extracted Vector Coordinate Coordinates:</span>
                      <span className="text-indigo-400 block break-all font-semibold mt-0.5">
                        {selectedDoc.embedding || 'Waiting for embedding pipeline...'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">AI Text Extraction Context:</span>
                      <p className="text-slate-400 bg-slate-900 border border-slate-850 p-2.5 rounded-lg mt-1 font-sans text-xs italic leading-normal">
                        {selectedDoc.textExtraction || 'Awaiting file scanning... (Processing status will update in seconds)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Metadata Lists */}
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1.5">
                    Metadata Properties
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Corporate Department</span>
                      <span className="text-slate-800 font-semibold mt-0.5 block">{selectedDoc.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Classification Type</span>
                      <span className="text-indigo-600 font-bold mt-0.5 block uppercase">{selectedDoc.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Confidentiality Level</span>
                      <span className="text-amber-700 font-semibold mt-0.5 block">{selectedDoc.confidentiality}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">Effective Date</span>
                      <span className="text-slate-800 font-mono mt-0.5 block">{selectedDoc.effectiveDate || 'Not Specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">State Division</span>
                      <span className="text-slate-800 font-semibold mt-0.5 block">{selectedDoc.state || 'Global'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono text-[9px] uppercase">City Location</span>
                      <span className="text-slate-800 font-semibold mt-0.5 block">{selectedDoc.city || 'Global'}</span>
                    </div>
                  </div>

                  {/* Linked Properties */}
                  <div className="pt-2">
                    <span className="text-slate-400 block font-mono text-[9px] uppercase mb-1">Associated Property Nodes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {properties
                        .filter(p => selectedDoc.propertyId === p.id || (selectedDoc.propertyIds && selectedDoc.propertyIds.includes(p.id)))
                        .map(p => (
                          <span key={p.id} className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-lg">
                            <Building2 className="h-3 w-3" />
                            {p.name}
                          </span>
                        ))}
                      {properties.filter(p => selectedDoc.propertyId === p.id || (selectedDoc.propertyIds && selectedDoc.propertyIds.includes(p.id))).length === 0 && (
                        <span className="text-xs text-slate-400 italic">No linked property associations.</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="pt-2">
                    <span className="text-slate-400 block font-mono text-[9px] uppercase mb-1">Tag Coordinates</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedDoc.tags?.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-lg">
                          #{t}
                        </span>
                      ))}
                      {(!selectedDoc.tags || selectedDoc.tags.length === 0) && (
                        <span className="text-xs text-slate-400 italic">No custom tags registered.</span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedDoc.notes && (
                    <div className="pt-2">
                      <span className="text-slate-400 block font-mono text-[9px] uppercase mb-1">Internal Notes</span>
                      <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-xl leading-normal italic">
                        "{selectedDoc.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Related Assets list */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Related Knowledge Assets
                  </div>
                  {relatedAssets.length === 0 ? (
                    <span className="text-xs text-slate-400 italic block">No related assets detected.</span>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {relatedAssets.map(rDoc => (
                        <div 
                          key={rDoc.id}
                          onClick={() => setSelectedDoc(rDoc)}
                          className="p-2.5 border border-slate-150 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer transition text-left"
                        >
                          <h4 className="text-xs font-semibold text-slate-800 truncate" title={rDoc.name}>{rDoc.name}</h4>
                          <span className="text-[9px] font-mono bg-slate-50 border border-slate-150 px-1.5 py-0.2 rounded text-slate-500 uppercase mt-1 inline-block">
                            {rDoc.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dynamic Version History Archive */}
                <div className="space-y-3 pt-4 border-t border-slate-100 text-left">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                      <History className="h-4 w-4" />
                      Version History Ledger
                    </div>
                    
                    {/* Trigger Hidden File Input */}
                    <button 
                      onClick={() => versionInputRef.current?.click()}
                      className="text-[10px] text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Replace Version File
                    </button>
                    <input 
                      type="file"
                      ref={versionInputRef}
                      onChange={handleReplaceVersion}
                      className="hidden"
                      accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
                    />
                  </div>

                  {(!selectedDoc.versions || selectedDoc.versions.length === 0) ? (
                    <div className="text-[11px] text-slate-400 italic bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      Current active state is version {selectedDoc.version}. No prior historical drafts recorded.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDoc.versions.map((ver, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 font-mono text-[10px]">v{ver.version}</span>
                              <span className="text-slate-600 truncate max-w-xs">{ver.name}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                              Uploaded by {ver.uploadedByName} on {new Date(ver.uploadedAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-450 shrink-0">{ver.sizeFormatted}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Do you want to toggle archive status for this document?')) {
                        handleArchiveDocument(selectedDoc.id, !selectedDoc.isArchived);
                      }
                    }}
                    className="inline-flex items-center justify-center space-x-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                  >
                    <Archive className="h-4 w-4 text-slate-450" />
                    <span>{selectedDoc.isArchived ? 'Activate File' : 'Archive File'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you absolutely certain you want to delete this document from the centralized corporate storage index?')) {
                        onDeleteDocument(selectedDoc.id);
                        setSelectedDoc(null);
                      }
                    }}
                    className="inline-flex items-center justify-center space-x-1.5 bg-rose-50 border border-rose-150 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Record</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD FORM MODAL CONTROLLER */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                Intelligent Knowledge Asset Intake
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-800 transition cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">Document File Name</label>
                  <input
                    type="text"
                    required
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                    placeholder="e.g. Bridgeview_Court_Survey_Draft"
                  />
                </div>

                {/* Classification Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">Classification Category</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  >
                    {customSettings.documentCategories?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* File Extension (Format) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">File Extension (Format)</label>
                  <select
                    value={uploadFileFormat}
                    onChange={(e) => setUploadFileFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Word Template (.docx)</option>
                    <option value="txt">Plain Scratchpad (.txt)</option>
                    <option value="csv">Data Spreadsheet (.csv)</option>
                    <option value="xlsx">Excel Workbook (.xlsx)</option>
                    <option value="png">Image Asset (.png)</option>
                    <option value="jpg">Photo Asset (.jpg)</option>
                  </select>
                </div>

                {/* Corporate Department */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">Corporate Department Owner</label>
                  <select
                    value={uploadDepartment}
                    onChange={(e) => setUploadDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  >
                    {customSettings.departments?.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">State Division Jurisdiction</label>
                  <input
                    type="text"
                    value={uploadState}
                    onChange={(e) => setUploadState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                    placeholder="e.g. Delta State"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">City Division Jurisdiction</label>
                  <input
                    type="text"
                    value={uploadCity}
                    onChange={(e) => setUploadCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                    placeholder="e.g. Asaba"
                  />
                </div>

                {/* Security level */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">Confidentiality level</label>
                  <select
                    value={uploadConfidentiality}
                    onChange={(e) => setUploadConfidentiality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  >
                    {customSettings.confidentialityLevels?.map(lev => (
                      <option key={lev} value={lev}>{lev}</option>
                    ))}
                  </select>
                </div>

                {/* Effective date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={uploadEffectiveDate}
                    onChange={(e) => setUploadEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
              </div>

              {/* Multi-Property Association Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1.5">Associate Property Portfolios (Cross-linking)</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {properties.map(p => {
                    const isSelected = uploadPropertyIds.includes(p.id);
                    return (
                      <label 
                        key={p.id}
                        className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition select-none ${
                          isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setUploadPropertyIds(uploadPropertyIds.filter(id => id !== p.id));
                            } else {
                              setUploadPropertyIds([...uploadPropertyIds, p.id]);
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-left">
                          <span className="font-semibold block text-[11px] leading-tight">{p.name}</span>
                          <span className="text-[9px] text-slate-450 block font-mono">{p.location}</span>
                        </div>
                      </label>
                    );
                  })}
                  {properties.length === 0 && (
                    <span className="text-xs text-slate-400 italic col-span-2">No active property ledger found. Register properties first.</span>
                  )}
                </div>
              </div>

              {/* Tags collections inputs */}
              <div>
                <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1.5">Select Tag Collections Coordinates</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {customSettings.tagCollections?.map(tag => {
                    const isSelected = uploadTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          if (isSelected) {
                            setUploadTags(uploadTags.filter(t => t !== tag));
                          } else {
                            setUploadTags([...uploadTags, tag]);
                          }
                        }}
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-550 font-mono uppercase mb-1">Internal Description & Notes</label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  placeholder="Summarize coordinates, allocation limits, beacon codes..."
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Confirm Intake Registration
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
