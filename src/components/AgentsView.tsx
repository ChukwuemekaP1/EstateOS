import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Play, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  Sliders, 
  ListOrdered, 
  Check, 
  X, 
  Save, 
  Terminal, 
  AlertCircle, 
  AlertTriangle, 
  Search, 
  Building2, 
  FileText,
  Settings,
  Bell,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code
} from 'lucide-react';
import { Agent, AgentExecution, AgentExecutionStep, AgentExecutionLog, PromptTemplate, AIConfig, Property } from '../types';

interface AgentsViewProps {
  agents: Agent[];
  properties?: Property[];
}

type TabType = 'pipelines' | 'history' | 'config' | 'templates';

export default function AgentsView({ agents: initialAgents, properties = [] }: AgentsViewProps) {
  // Tabs & Views
  const [activeTab, setActiveTab] = useState<TabType>('pipelines');
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // Property context selection for running an agent
  const [targetPropertyId, setTargetPropertyId] = useState<string>(properties[0]?.id || 'prop-bridgeview');

  // AI Orchestration States
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [selectedExecId, setSelectedExecId] = useState<string | null>(null);
  const [selectedExecDetail, setSelectedExecDetail] = useState<(AgentExecution & { steps: AgentExecutionStep[], logs: AgentExecutionLog[] }) | null>(null);
  
  // Settings & Templates
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    primaryModel: 'gemini-3.5-flash',
    complexReasoningModel: 'gemini-3.1-pro-preview',
    temperature: 0.2
  });
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

  // Editing Agent Specification state
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [runLoading, setRunLoading] = useState<string | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Filter & Search states
  const [agentSearch, setAgentSearch] = useState('');
  const [agentCategory, setAgentCategory] = useState<string>('All');
  const [historySearch, setHistorySearch] = useState('');

  // Terminal scroll anchor
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Poll intervals
  const [pollingActive, setPollingActive] = useState(false);

  // Fetch initial collections
  useEffect(() => {
    fetchAgents();
    fetchExecutions();
    fetchConfig();
    fetchTemplates();
  }, []);

  // Poll executions if any is running/queued
  useEffect(() => {
    const hasRunning = executions.some(e => 
      e.status === 'Queued' || e.status === 'Planning' || e.status === 'Running' || e.status === 'Validating'
    );
    setPollingActive(hasRunning);

    if (hasRunning) {
      const interval = setInterval(() => {
        fetchExecutions(false); // background fetch
        if (selectedExecId) {
          fetchExecutionDetail(selectedExecId, false);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [executions, selectedExecId]);

  // Handle auto-scroll inside the dark terminal whenever detail logs update
  useEffect(() => {
    if (selectedExecDetail?.logs) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedExecDetail?.logs]);

  // Fetch functions
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/ai/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      console.error('Error fetching agents:', e);
    }
  };

  const fetchExecutions = async (withLoading = true) => {
    try {
      const res = await fetch('/api/ai/executions');
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
        // Default select first execution if none selected
        if (data.length > 0 && !selectedExecId && withLoading) {
          setSelectedExecId(data[0].id);
          fetchExecutionDetail(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching executions:', e);
    }
  };

  const fetchExecutionDetail = async (id: string, withLoading = true) => {
    try {
      const res = await fetch(`/api/ai/executions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedExecDetail(data);
      }
    } catch (e) {
      console.error('Error fetching execution detail:', e);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/ai/config');
      if (res.ok) {
        const data = await res.json();
        setAiConfig(data);
      }
    } catch (e) {
      console.error('Error fetching AI configuration:', e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/ai/templates');
      if (res.ok) {
        const data = await res.json();
        setPromptTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching templates:', e);
    }
  };

  // Trigger executing an agent
  const handleRunAgent = async (agentId: string) => {
    setRunLoading(agentId);
    try {
      const res = await fetch('/api/ai/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          propertyId: targetPropertyId
        })
      });

      if (res.ok) {
        const newExec = await res.json();
        // pre-add the execution
        setExecutions(prev => [newExec, ...prev]);
        setSelectedExecId(newExec.id);
        fetchExecutionDetail(newExec.id);
        // Jump to history tab to show progress live
        setActiveTab('history');
      } else {
        alert('Failed to trigger supervisor agent.');
      }
    } catch (err) {
      console.error('Failed running agent:', err);
    } finally {
      setRunLoading(null);
    }
  };

  // Update specific agent parameters
  const handleSaveAgentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setSaveLoading(true);

    try {
      const res = await fetch(`/api/ai/agents/${editingAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: editingAgent.systemInstruction,
          modelOverride: editingAgent.modelOverride,
          capabilities: editingAgent.capabilities
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setAgents(agents.map(a => a.id === updated.id ? updated : a));
        setEditingAgent(null);
        setSelectedAgentId(null);
      } else {
        alert('Failed to update agent specifications.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Save global model settings
  const handleSaveGlobalConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigLoading(true);
    try {
      const res = await fetch('/api/ai/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig)
      });
      if (res.ok) {
        const updated = await res.json();
        setAiConfig(updated);
        alert('Global AI Config synced with Cloud container!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfigLoading(false);
    }
  };

  // Save prompt template changes
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setTemplateLoading(true);
    try {
      const res = await fetch('/api/ai/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate)
      });
      if (res.ok) {
        const updated = await res.json();
        setPromptTemplates(promptTemplates.map(t => t.id === updated.id ? updated : t));
        setSelectedTemplate(updated);
        alert('Prompt Template updated to next revision block.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTemplateLoading(false);
    }
  };

  // Styling based on execution status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'Failed':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'Running':
        return 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse';
      case 'Planning':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'Validating':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Queued':
      default:
        return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'Failed':
        return <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />;
      case 'Running':
        return <Activity className="h-4 w-4 text-indigo-500 animate-spin shrink-0" />;
      case 'Pending':
      default:
        return <Clock className="h-4 w-4 text-slate-300 shrink-0" />;
    }
  };

  // Filter Agents List
  const filteredAgents = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(agentSearch.toLowerCase()) || 
                          a.description.toLowerCase().includes(agentSearch.toLowerCase());
    const matchesCategory = agentCategory === 'All' || a.category === agentCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter Executions List
  const filteredExecutions = executions.filter(e => {
    return e.agentName.toLowerCase().includes(historySearch.toLowerCase()) || 
           (e.propertyName && e.propertyName.toLowerCase().includes(historySearch.toLowerCase())) || 
           e.status.toLowerCase().includes(historySearch.toLowerCase());
  });

  return (
    <div className="space-y-6 text-slate-800 p-6 max-w-7xl mx-auto font-sans text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-600" />
            Specialized AI Agent Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure system prompts, monitor active execution pipelines, and review supervisor planning trees.
          </p>
        </div>

        {/* Global Context Selector for active execution */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
          <Building2 className="h-4 w-4 text-slate-400 ml-2" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Target Workspace Context</span>
            <select 
              value={targetPropertyId}
              onChange={(e) => setTargetPropertyId(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none focus:ring-0 pr-6 py-0 cursor-pointer"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none pb-px">
        <button
          onClick={() => { setActiveTab('pipelines'); setSelectedAgentId(null); setEditingAgent(null); }}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition shrink-0 ${
            activeTab === 'pipelines' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Agent Pipelines ({agents.length})
        </button>
        <button
          onClick={() => { setActiveTab('history'); fetchExecutions(); }}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition relative shrink-0 ${
            activeTab === 'history' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          AI Task History ({executions.length})
          {pollingActive && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('templates'); fetchTemplates(); }}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition shrink-0 ${
            activeTab === 'templates' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Prompt Templates ({promptTemplates.length})
        </button>
        <button
          onClick={() => { setActiveTab('config'); fetchConfig(); }}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition shrink-0 ${
            activeTab === 'config' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Global Configuration
        </button>
      </div>

      {/* TAB CONTENT OUTLET */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: AGENT PIPELINES */}
        {activeTab === 'pipelines' && (
          <motion.div
            key="tab-pipelines"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filter and search bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search specialized agents, features, or system scopes..."
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Intelligence', 'Analysis', 'Content', 'Sales'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAgentCategory(cat)}
                    className={`px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition shrink-0 ${
                      agentCategory === cat 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Grid / Config split screen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column: Grid list */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAgents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  return (
                    <div
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgentId(agent.id);
                        setEditingAgent({ ...agent });
                      }}
                      className={`p-5 border bg-white rounded-2xl flex flex-col justify-between h-[230px] group transition duration-300 cursor-pointer relative ${
                        isSelected 
                          ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {/* Top indicator bar */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
                          AGENT 0{agent.index}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                            {agent.modelOverride || 'gemini-3.5-flash'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono border ${
                            agent.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            agent.status === 'In Progress' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                      </div>

                      {/* Title / Info */}
                      <div className="mt-2 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                          {agent.name}
                          {agent.status === 'Completed' && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                          {agent.description}
                        </p>
                        
                        {/* Capabilities overview */}
                        {agent.capabilities && agent.capabilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {agent.capabilities.slice(0, 2).map((cap, i) => (
                              <span key={i} className="text-[8px] font-bold font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                {cap}
                              </span>
                            ))}
                            {agent.capabilities.length > 2 && (
                              <span className="text-[8px] font-bold font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                                +{agent.capabilities.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                        <span className="text-[9px] font-mono font-extrabold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-indigo-600 uppercase tracking-wider">
                          {agent.category}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunAgent(agent.id);
                          }}
                          disabled={runLoading !== null}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition disabled:opacity-50"
                        >
                          {runLoading === agent.id ? (
                            <Activity className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          <span>Run Agent</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Configuration & Prompting Console */}
              <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                {editingAgent ? (
                  <form onSubmit={handleSaveAgentConfig} className="space-y-4 text-left">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="text-[9px] font-bold text-indigo-600 font-mono uppercase tracking-wider">Configure Node</div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{editingAgent.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {editingAgent.id} &bull; {editingAgent.category}</p>
                    </div>

                    {/* Model Override selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Model Preference</label>
                      <select
                        value={editingAgent.modelOverride || 'gemini-3.5-flash'}
                        onChange={(e) => setEditingAgent({ ...editingAgent, modelOverride: e.target.value })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="gemini-3.5-flash">gemini-3.5-flash (Standard Speed)</option>
                        <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Reasoning)</option>
                      </select>
                    </div>

                    {/* System Instructions Prompt */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Instructions</label>
                        <span className="text-[8px] font-mono text-slate-400">Read & Write</span>
                      </div>
                      <textarea
                        rows={6}
                        value={editingAgent.systemInstruction || ''}
                        onChange={(e) => setEditingAgent({ ...editingAgent, systemInstruction: e.target.value })}
                        placeholder="Define instructions directing this agent's logic, formatting guidelines, and behavior constraint indices..."
                        className="w-full text-xs p-3 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed text-slate-700"
                      />
                    </div>

                    {/* Capabilities list */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agent Capabilities</label>
                      <input
                        type="text"
                        value={editingAgent.capabilities?.join(', ') || ''}
                        onChange={(e) => setEditingAgent({ ...editingAgent, capabilities: e.target.value.split(',').map(s => s.trim()) })}
                        placeholder="Indexing, Legal Audits, Calculation"
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-[8px] text-slate-400 block mt-0.5">Separate with commas to index specific visual chips.</span>
                    </div>

                    {/* Trigger actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => { setSelectedAgentId(null); setEditingAgent(null); }}
                        className="flex-1 py-2 text-center text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow flex justify-center items-center gap-1.5 transition disabled:opacity-50"
                      >
                        {saveLoading ? (
                          <Activity className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                        <span>Save Specs</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-12 px-6 text-center text-slate-400 space-y-3">
                    <Sliders className="h-10 w-10 text-slate-300 mx-auto stroke-[1.5]" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-600">Dynamic Agent Console</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Select any pipeline agent block in the grid to configure custom system prompt parameters, model specifications, and capability chips.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: TASK EXECUTION HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="tab-history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left side: Executions History log (col-span-4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
              
              {/* Scan search panel */}
              <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-600 font-mono uppercase tracking-widest">Orchestrator Logs</span>
                  {pollingActive && (
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-widest text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full animate-pulse">
                      <Activity className="h-2 w-2 animate-spin" /> Polling Live
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search executions, properties, statuses..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Logs loop */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredExecutions.length > 0 ? (
                  filteredExecutions.map((exec) => {
                    const isSelected = selectedExecId === exec.id;
                    return (
                      <div
                        key={exec.id}
                        onClick={() => {
                          setSelectedExecId(exec.id);
                          fetchExecutionDetail(exec.id);
                        }}
                        className={`p-3.5 text-left cursor-pointer transition flex justify-between gap-2 ${
                          isSelected ? 'bg-slate-50 border-r-2 border-indigo-500' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-bold text-slate-800 truncate">{exec.agentName}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border tracking-wider font-mono ${getStatusColor(exec.status)}`}>
                              {exec.status}
                            </span>
                          </div>
                          
                          {/* Property Context tag */}
                          {exec.propertyName && (
                            <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-400" /> {exec.propertyName}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1">
                            <span>{new Date(exec.startedAt).toLocaleTimeString()} &bull; {exec.triggeredByName.split(' ')[0]}</span>
                            <span>{exec.completedAt ? 'Finished' : 'Running...'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">No execution pipelines found.</div>
                )}
              </div>
            </div>

            {/* Right side: Pipeline Monitor Screen (col-span-8) */}
            <div className="lg:col-span-8 space-y-6 h-[650px] overflow-y-auto pr-1">
              {selectedExecDetail ? (
                <div className="space-y-6">
                  
                  {/* Execution detail main metadata */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">RUN LOG ID: {selectedExecDetail.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border tracking-widest font-mono ${getStatusColor(selectedExecDetail.status)}`}>
                            {selectedExecDetail.status}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-slate-900 mt-1">{selectedExecDetail.agentName} Run Context</h2>
                        {selectedExecDetail.propertyName && (
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Target Property: <strong>{selectedExecDetail.propertyName}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[10px] font-mono text-slate-400 space-y-0.5 shrink-0">
                        <div>Triggered By: <strong className="text-slate-600">{selectedExecDetail.triggeredByName}</strong></div>
                        <div>Started: <strong className="text-slate-600">{new Date(selectedExecDetail.startedAt).toLocaleString()}</strong></div>
                        {selectedExecDetail.completedAt && (
                          <div>Finished: <strong className="text-emerald-600">{new Date(selectedExecDetail.completedAt).toLocaleTimeString()}</strong></div>
                        )}
                      </div>
                    </div>

                    {/* SUPERVISOR RUN STEPS (Progress stepper timeline) */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Supervisor Plan Stepper</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        {selectedExecDetail.steps && selectedExecDetail.steps.map((step) => (
                          <div key={step.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl space-y-1.5 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-start">
                            <div className="flex items-center gap-1.5">
                              {getStepIcon(step.status)}
                              <span className="text-[10px] font-extrabold text-slate-700 truncate max-w-[130px]">{step.name}</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : step.status === 'Running' ? 'Calculating...' : 'Pending'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SUPERVISOR LOG STREAM (The Terminal logs) */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[280px]">
                    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex justify-between items-center shrink-0">
                      <div className="flex items-center space-x-2">
                        <Terminal className="h-4 w-4 text-slate-400" />
                        <span className="text-[10px] font-bold font-mono text-slate-300 uppercase tracking-widest">Supervisor Thought Stream (Fine-grained Logs)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    </div>

                    {/* Dark terminal feed logs */}
                    <div className="flex-1 p-4 font-mono text-xs text-left overflow-y-auto space-y-2 select-text selection:bg-indigo-500 selection:text-white">
                      {selectedExecDetail.logs && selectedExecDetail.logs.length > 0 ? (
                        selectedExecDetail.logs.map((log) => {
                          const levelColor = 
                            log.level === 'warn' ? 'text-amber-400' :
                            log.level === 'error' ? 'text-rose-400' :
                            log.level === 'debug' ? 'text-slate-500' : 'text-indigo-400';
                          return (
                            <div key={log.id} className="leading-relaxed hover:bg-slate-900/40 px-1 py-0.5 rounded transition">
                              <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                              <span className={`font-bold ${levelColor}`}>[{log.level.toUpperCase()}]</span>{' '}
                              <span className="text-slate-100">{log.message}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-slate-500 text-center py-10 italic">Initializing execution stream logger node...</div>
                      )}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>

                  {/* STRUCTURED JSON OUTCOMES VIEWER */}
                  {selectedExecDetail.status === 'Completed' && selectedExecDetail.result && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-indigo-500" />
                          Validated Structured Payload Outcome
                        </h4>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                          Validated JSON Schema
                        </span>
                      </div>

                      {/* Display results as clean, beautiful tabular cards rather than raw JSON block */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedExecDetail.result).map(([key, val]) => {
                          // Format camelCase key into spaced sentence case
                          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          
                          if (Array.isArray(val)) {
                            return (
                              <div key={key} className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 md:col-span-2">
                                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">{label}</span>
                                <ul className="mt-1.5 space-y-1">
                                  {val.map((item: any, i: number) => (
                                    <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                                      <span className="text-indigo-500 font-bold shrink-0">&bull;</span>
                                      {typeof item === 'object' ? (
                                        <span className="font-mono bg-slate-100 p-1 rounded block w-full">{JSON.stringify(item)}</span>
                                      ) : (
                                        <span>{item}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }

                          if (typeof val === 'object' && val !== null) {
                            return (
                              <div key={key} className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 md:col-span-2">
                                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">{label}</span>
                                <div className="mt-2 space-y-2">
                                  {Object.entries(val).map(([nestedKey, nestedVal]: [string, any]) => {
                                    const nestedLabel = nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (
                                      <div key={nestedKey} className="text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                        <span className="font-mono text-slate-400 font-bold text-[9px] mr-2">{nestedLabel}:</span>
                                        <span className="text-slate-700 font-medium">{String(nestedVal)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={key} className="p-3 border border-slate-100 rounded-xl bg-slate-50/30">
                              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">{label}</span>
                              <p className="text-xs text-slate-800 font-semibold mt-1 leading-relaxed">
                                {typeof val === 'boolean' ? (val ? 'Yes / Verified' : 'No') : String(val)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Expandable Raw JSON */}
                      <details className="mt-4 border border-slate-100 rounded-xl overflow-hidden group">
                        <summary className="bg-slate-50 px-3 py-2 text-[10px] font-mono text-slate-500 font-bold uppercase cursor-pointer flex justify-between items-center hover:bg-slate-100">
                          <span>Raw JSON representation</span>
                          <ChevronRight className="h-3 w-3 text-slate-400 transform group-open:rotate-90 transition" />
                        </summary>
                        <pre className="p-3 bg-slate-950 text-emerald-400 text-[10px] font-mono rounded-b-xl overflow-x-auto text-left leading-relaxed">
                          {JSON.stringify(selectedExecDetail.result, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}

                  {/* FAILED STATE CARD INFO */}
                  {selectedExecDetail.status === 'Failed' && (
                    <div className="p-4 border border-rose-200 bg-rose-50 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-rose-900">Pipeline Execution Interrupted</h4>
                        <p className="text-xs text-rose-700 leading-relaxed">
                          Supervisor reported failure during live validation check: <code className="bg-rose-100 px-1 py-0.5 rounded font-mono text-[10px] text-rose-800 font-bold">{selectedExecDetail.error || 'Unknown syntax check disruption.'}</code>. Local parameters re-synchronized.
                        </p>
                      </div>
                    </div>
                  )}
                  
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl py-24 px-12 text-center text-slate-400 space-y-3 shadow-sm h-[650px] flex flex-col justify-center items-center">
                  <Terminal className="h-12 w-12 text-slate-300 stroke-[1.2]" />
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-sm font-bold text-slate-700">Select Pipeline Execution</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Select an active run from the side panel logs to open real-time supervisor thought logs, pipeline duration timelines, and verified JSON deliverables.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: PROMPT TEMPLATES MANAGER */}
        {activeTab === 'templates' && (
          <motion.div
            key="tab-templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left"
          >
            {/* Left selector panel: templates list (col-span-4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Template Index</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Choose prompt template node to revision.</p>
              </div>

              <div className="space-y-2">
                {promptTemplates.map((tmpl) => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  const agent = agents.find(a => a.id === tmpl.agentId);
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3 border rounded-xl cursor-pointer transition text-left space-y-1 ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/10' 
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{tmpl.name}</h4>
                        <span className="text-[8px] font-mono bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded font-bold uppercase">v{tmpl.version}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate font-mono">Agent: {agent?.name || `ID ${tmpl.agentId}`}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right template editor panel (col-span-8) */}
            <div className="lg:col-span-8">
              {selectedTemplate ? (
                <form onSubmit={handleSaveTemplate} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <div className="text-[9px] font-bold text-indigo-600 font-mono uppercase tracking-widest">Template Revision Console</div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedTemplate.name}</h3>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Version Tag: {selectedTemplate.version}</span>
                  </div>

                  {/* Template text area */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prompt Template Text</label>
                    <textarea
                      rows={10}
                      value={selectedTemplate.template}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, template: e.target.value })}
                      className="w-full text-xs font-mono p-4 bg-slate-950 text-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
                    />
                    <span className="text-[8px] text-slate-400 block mt-0.5 leading-relaxed">
                      Placeholders enclosed in curly braces (e.g., <code className="bg-slate-100 px-1 rounded font-mono text-[9px]">{'{propertyName}'}</code> or <code className="bg-slate-100 px-1 rounded font-mono text-[9px]">{'{price}'}</code>) are dynamically substituted by the supervisor context manager.
                    </span>
                  </div>

                  {/* Dynamic Variables tags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Identified Substitution Keys</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTemplate.variables.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-50 border border-slate-200 text-indigo-600 font-bold uppercase">
                          {'{'}{v}{'}'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Save */}
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={templateLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition disabled:opacity-50"
                    >
                      {templateLoading ? (
                        <Activity className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      <span>Publish Template Revision</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl py-24 px-12 text-center text-slate-400 space-y-3 shadow-sm h-[400px] flex flex-col justify-center items-center">
                  <Code className="h-10 w-10 text-slate-300 stroke-[1.2]" />
                  <h3 className="text-sm font-bold text-slate-700">Select Template Node</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                    Select a prompt template from the side index log to edit template statements and review identified placeholders.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: GLOBAL AI CONFIGURATION */}
        {activeTab === 'config' && (
          <motion.div
            key="tab-config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSaveGlobalConfig} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-left">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Global Orchestrator Configurations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control pipeline model targets and temperature settings.</p>
                </div>
                <Settings className="h-5 w-5 text-indigo-500" />
              </div>

              {/* Standard Model dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Primary Default Model</label>
                <select
                  value={aiConfig.primaryModel}
                  onChange={(e) => setAiConfig({ ...aiConfig, primaryModel: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Standard speed & high intelligence)</option>
                  <option value="gemini-3.5-flash-8b">gemini-3.5-flash-8b (High speed lightweight model)</option>
                </select>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-relaxed">
                  Used for basic data synthesis, content creation, and standard objection handling runs.
                </span>
              </div>

              {/* Complex Reasoning model dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Complex Reasoning Model</label>
                <select
                  value={aiConfig.complexReasoningModel}
                  onChange={(e) => setAiConfig({ ...aiConfig, complexReasoningModel: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Highly Advanced Reasoning)</option>
                  <option value="gemini-3.0-pro-preview">gemini-3.0-pro-preview (Legacy Pro Reasoning)</option>
                </select>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-relaxed">
                  Used for multi-document comparisons, financial modeling (IRR calculations), and legal audits.
                </span>
              </div>

              {/* Temperature setting */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Generation Temperature</span>
                  <span className="font-mono text-indigo-600 font-extrabold">{aiConfig.temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={aiConfig.temperature}
                  onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                  <span>0.0 (Strict / Precision)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Highly Creative)</span>
                </div>
              </div>

              {/* Global system instructions overrides */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Global System Directive Override</label>
                <textarea
                  rows={4}
                  value={aiConfig.systemInstructionOverride || ''}
                  onChange={(e) => setAiConfig({ ...aiConfig, systemInstructionOverride: e.target.value })}
                  placeholder="Define global directives applied to every supervisor run... e.g., 'Always use Nigerian Naira (₦) for currency format.'"
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Action triggers */}
              <div className="flex justify-end pt-3 border-t border-slate-150">
                <button
                  type="submit"
                  disabled={configLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition disabled:opacity-50"
                >
                  {configLoading ? (
                    <Activity className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
