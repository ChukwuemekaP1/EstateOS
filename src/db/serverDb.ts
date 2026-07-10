import { 
  User, 
  Organization, 
  Property, 
  Document, 
  Report, 
  Agent, 
  ContentAsset, 
  WorkspaceSettings,
  DocumentVersion,
  PropertyMedia,
  PropertyRelationship,
  PropertyTimelineEvent,
  PropertyStatistics,
  NearbyInfrastructureItem,
  PropertySettings,
  AgentExecution,
  AgentExecutionStep,
  AgentExecutionLog,
  PromptTemplate,
  ContextSnapshot,
  AINotification,
  AIConfig,
  PropertyIntelligenceReport,
  MarketAnalysis,
  InvestmentAnalysis,
  BuyerPersona,
  MarketSignal,
  AnalysisVersion,
  MarketInvestmentReport
} from '../types';

export class ServerDatabase {
  users: User[] = [];
  organizations: Organization[] = [];
  properties: Property[] = [];
  documents: Document[] = [];
  reports: Report[] = [];
  agents: Agent[] = [];
  contentAssets: ContentAsset[] = [];
  propertyIntelligenceReports: PropertyIntelligenceReport[] = [];
  
  marketAnalyses: MarketAnalysis[] = [];
  investmentAnalyses: InvestmentAnalysis[] = [];
  buyerPersonas: BuyerPersona[] = [];
  marketSignals: MarketSignal[] = [];
  analysisVersions: AnalysisVersion[] = [];
  marketInvestmentReports: MarketInvestmentReport[] = [];
  
  propertyMedia: PropertyMedia[] = [];
  propertyRelationships: PropertyRelationship[] = [];
  propertyTimeline: PropertyTimelineEvent[] = [];
  propertyStatistics: PropertyStatistics[] = [];
  nearbyInfrastructure: NearbyInfrastructureItem[] = [];
  propertySettingsList: PropertySettings[] = [];

  // New AI Orchestration Datastores
  executions: AgentExecution[] = [];
  executionSteps: AgentExecutionStep[] = [];
  executionLogs: AgentExecutionLog[] = [];
  promptTemplates: PromptTemplate[] = [];
  contextSnapshots: ContextSnapshot[] = [];
  aiNotifications: AINotification[] = [];
  aiConfig: AIConfig = {
    primaryModel: 'gemini-3.5-flash',
    complexReasoningModel: 'gemini-3.1-pro-preview',
    temperature: 0.2
  };

  settings: WorkspaceSettings = {
    companyName: 'EstateIntel AI',
    website: 'https://estateintel.ai',
    address: '12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    brandPrimaryColor: '#4f46e5', // indigo-600
    brandSecondaryColor: '#10b981', // emerald-500
    defaultCurrency: '₦',
    timezone: 'UTC+1',
    apiKeys: [
      { id: '1', name: 'Gemini Primary Key', key: 'AIzaSyD...xxxx', createdAt: '2026-05-10T10:00:00Z' }
    ],
    documentCategories: [
      'FAQ', 'Property Brochure', 'Survey Plan', 'Payment Plan', 'Allocation Process',
      'Price List', 'Legal Document', 'Government Approval', 'Internal SOP', 'Research Report',
      'Market Analysis', 'Sales Script', 'Marketing Copy', 'Customer Questions', 'Images', 'Videos', 'Other'
    ],
    departments: ['Sales', 'Marketing', 'Finance', 'Legal', 'Executive', 'Operations'],
    tagCollections: ['Premium', 'High Appreciation', 'Waterfront', 'New Launch', 'Verified Title', 'Blueprint'],
    confidentialityLevels: ['Public', 'Internal', 'Confidential', 'Highly Confidential'],
    uploadLimitMb: 25
  };

  constructor() {
    this.seedBase();
  }

  seedBase() {
    // Clear everything
    this.users = [];
    this.organizations = [];
    this.properties = [];
    this.documents = [];
    this.reports = [];
    this.contentAssets = [];
    this.propertyIntelligenceReports = [];
    this.marketAnalyses = [];
    this.investmentAnalyses = [];
    this.buyerPersonas = [];
    this.marketSignals = [];
    this.analysisVersions = [];
    this.marketInvestmentReports = [];
    this.propertyMedia = [];
    this.propertyRelationships = [];
    this.propertyTimeline = [];
    this.propertyStatistics = [];
    this.nearbyInfrastructure = [];
    this.propertySettingsList = [];

    // Clear new AI Orchestration datasets
    this.executions = [];
    this.executionSteps = [];
    this.executionLogs = [];
    this.promptTemplates = [];
    this.contextSnapshots = [];
    this.aiNotifications = [];

    // 1. Seed Organization
    const orgId = 'org-1';
    this.organizations.push({
      id: orgId,
      name: 'EstateIntel AI',
      domain: 'estateintel.ai',
      createdAt: new Date().toISOString()
    });

    // 2. Seed Users
    this.users.push({
      id: 'user-1',
      email: 'nwokolopaul979@gmail.com',
      password: 'password123',
      name: 'Chidi U.',
      role: 'Admin',
      organizationId: orgId,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-01-10T08:00:00Z'
    });

    this.users.push({
      id: 'user-2',
      email: 'marketing@estateintel.ai',
      password: 'password123',
      name: 'Sarah Connor',
      role: 'Marketing',
      organizationId: orgId,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: '2025-02-15T09:30:00Z'
    });

    // 3. Seed 12 AI Agent team pipelines with rich orchestration descriptors
    this.agents = [
      { 
        id: '1', 
        index: 1, 
        name: 'Property Knowledge Agent', 
        description: 'Centralizes and synthesizes uploaded document assets, blueprints, and deeds.', 
        status: 'Completed', 
        category: 'Intelligence',
        modelOverride: 'gemini-3.1-pro-preview',
        systemInstruction: 'You are the Property Knowledge Agent. You synthesize information from land registries, surveys, deeds, and floor plans. Your main objective is to establish an indexable, structured metadata blueprint of the property.',
        capabilities: ['Document Indexing', 'Metadata Extraction', 'Legal Validation', 'Coordinate Mapping']
      },
      { 
        id: '2', 
        index: 2, 
        name: 'Local Intelligence Agent', 
        description: 'Gathers satellite infrastructure, nearby landmarks, and city growth vectors.', 
        status: 'Completed', 
        category: 'Intelligence',
        modelOverride: 'gemini-3.5-flash',
        systemInstruction: 'You are the Local Intelligence Agent. You analyze satellite imagery, Google Maps, and public datasets to map roads, grid power, schools, transit systems, and calculate city development vectors.',
        capabilities: ['Infrastructure Mapping', 'Landmark Distances', 'Growth Factor Analysis', 'Socioeconomic Profiling']
      },
      { 
        id: '3', 
        index: 3, 
        name: 'Investment Analyst', 
        description: 'Calculates cash-on-cash yield, internal rate of return, and capital gains.', 
        status: 'Completed', 
        category: 'Analysis',
        modelOverride: 'gemini-3.1-pro-preview',
        systemInstruction: 'You are the Investment Analyst Agent. You handle complex financial modelling. You calculate NPV, IRR, Cap Rates, Yield, cash-on-cash returns, and outline 5-year capital appreciation projection scenarios.',
        capabilities: ['Financial Modelling', 'Yield Projections', 'IRR Calculations', 'Scenario Sensitivity Analysis']
      },
      { 
        id: '4', 
        index: 4, 
        name: 'Buyer Psychology', 
        description: 'Profiles target demographics, objections, and core emotional buying hooks.', 
        status: 'Completed', 
        category: 'Analysis',
        modelOverride: 'gemini-3.5-flash',
        systemInstruction: 'You are the Buyer Psychology Agent. You profile target demographics, pinpoint high-net-worth individual drivers, analyze local community preferences, and identify typical sales friction points.',
        capabilities: ['Demographic Profiling', 'Objection Isolation', 'Buying Hook Discovery', 'Friction Point Auditing']
      },
      { 
        id: '5', 
        index: 5, 
        name: 'Content Strategist', 
        description: 'Drafts integrated launch calendars, channel mix plans, and audience angles.', 
        status: 'Ready', 
        category: 'Content',
        modelOverride: 'gemini-3.5-flash',
        systemInstruction: 'You are the Content Strategist Agent. You construct integrated multi-channel marketing campaigns, suggest ideal channel mixes, and design content angles targeting specific buyer personas.',
        capabilities: ['Campaign Architecture', 'Content Scheduling', 'Channel Alignment', 'Persona Copy Targeting']
      },
      { 
        id: '6', 
        index: 6, 
        name: 'Fact Verification', 
        description: 'Audits copy draft statements against validated title docs and survey logs.', 
        status: 'Waiting', 
        category: 'Intelligence',
        modelOverride: 'gemini-3.1-pro-preview',
        systemInstruction: 'You are the Fact Verification Agent. You act as an auditor. You compare marketing pitches and copy drafts against official title deeds, survey plans, and technical documents to prevent false representations.',
        capabilities: ['Claim Auditing', 'Regulatory Compliance', 'Document Verification', 'Risk Mitigation Logs']
      },
      { 
        id: '7', 
        index: 7, 
        name: 'Storytelling', 
        description: 'Crafts rich narrative sales-pitches for premium presentation decks.', 
        status: 'Waiting', 
        category: 'Content',
        modelOverride: 'gemini-3.5-flash',
        systemInstruction: 'You are the Storytelling Agent. You transform dry property details into majestic, compelling human narratives that capture the romance of estate living and high status.',
        capabilities: ['Narrative Copywriting', 'Brochure Text Assembly', 'Video Pitch Outlining', 'Aesthetic Positioning']
      },
      { 
        id: '8', 
        index: 8, 
        name: 'Objection Handling', 
        description: 'Prepares comprehensive FAQ scripts resolving pricing and title questions.', 
        status: 'Waiting', 
        category: 'Sales',
        modelOverride: 'gemini-3.5-flash',
        systemInstruction: 'You are the Objection Handling Agent. You compile robust Q&A guides. You formulate strategic responses to queries about land titles, flooding risks, installment structures, and infrastructure delays.',
        capabilities: ['FAQ Construction', 'Sales Objection Scripts', 'Risk Reassurance Guides', 'Negotiation Playbooks']
      },
      { 
        id: '9', 
        index: 9, 
        name: 'Competitor Intelligence', 
        description: 'Benchmarks regional estates on pricing, title status, and amenities.', 
        status: 'Waiting', 
        category: 'Analysis',
        modelOverride: 'gemini-3.1-pro-preview',
        systemInstruction: 'You are the Competitor Intelligence Agent. You compile competitive landscape matrices, benchmarking price per square meter, amenity availability, and land title premium.',
        capabilities: ['Landscape Matrix Assembly', 'Amenity Comparison', 'Price Benchmarking', 'Market Defendability Scoring']
      },
      { 
        id: '10', 
        index: 10, 
        name: 'Video Planning', 
        description: 'Generates detailed high-conversion video shot lists and camera scripts.', 
        status: 'Waiting', 
        category: 'Content',
        modelOverride: 'gemini-3.5-flash',
        systemInstruction: 'You are the Video Planning Agent. You design YouTube flyovers, virtual tour prompts, TikTok reels scripts, drone shot directives, and presenter-guided video storyboards.',
        capabilities: ['Drone Shot Directives', 'Reels Hook Design', 'Storyboarding', 'Presenter Prompters']
      },
      { 
        id: '11', 
        index: 11, 
        name: 'Sales Coach', 
        description: 'Simulates buyer mock negotiations with role-playing sales feedback.', 
        status: 'Waiting', 
        category: 'Sales',
        modelOverride: 'gemini-3.5-flash',
        systemInstruction: 'You are the Sales Coach Agent. You simulate realistic buyer negotiations and provide detailed, actionable coaching feedback on agent speaking notes and client communications.',
        capabilities: ['Negotiation Simulation', 'Friction Drills', 'Pitch Critiques', 'Closer Coaching Feedback']
      },
      { 
        id: '12', 
        index: 12, 
        name: 'Report Generator', 
        description: 'Assembles full PDF executive summaries ready for client sharing.', 
        status: 'Waiting', 
        category: 'Analysis',
        modelOverride: 'gemini-3.1-pro-preview',
        systemInstruction: 'You are the Report Generator Agent. You compile data, statistics, analysis sheets, and storytelling briefs into a single beautifully consolidated structure fit for executive presentation.',
        capabilities: ['Executive Synthesis', 'Data Consolidation', 'Style Harmonization', 'Section Formatting']
      }
    ];

    // Seed Prompt Templates
    this.promptTemplates = [
      {
        id: 'pt-1',
        agentId: '1',
        name: 'Standard Document Synthesis',
        template: 'Extract legal parcel details, coordinate lists, and title encumbrances from the following text:\n\n{text_extraction}\n\nReturn a clean JSON mapping with keys: titleNumber, beacons, sizeHectares, isVerified, legalNotes.',
        variables: ['text_extraction'],
        version: '1.0'
      },
      {
        id: 'pt-2',
        agentId: '3',
        name: 'Standard Financial Projection',
        template: 'Create a financial yield analysis using the base statistics and nearby details of property:\n\nName: {propertyName}\nPrice: {price}\nLocation: {location}\nInfrastructure: {infrastructure}\n\nCalculate expected annual cash-on-cash yield, internal rate of return (IRR) over 5 years, and recommend monthly payment structures.',
        variables: ['propertyName', 'price', 'location', 'infrastructure'],
        version: '1.1'
      },
      {
        id: 'pt-3',
        agentId: '4',
        name: 'Demographic Hook Formulation',
        template: 'Build a psychological buyer profile based on property category "{category}" in "{location}". Address these typical regional client doubts: {objections}.',
        variables: ['category', 'location', 'objections'],
        version: '1.0'
      }
    ];

    // Seed historical completed executions
    const execId1 = 'exec-1';
    const execId2 = 'exec-2';

    this.executions.push({
      id: execId1,
      agentId: '1',
      agentName: 'Property Knowledge Agent',
      propertyId: 'prop-bridgeview',
      propertyName: 'Bridgeview Court',
      status: 'Completed',
      startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 4200).toISOString(),
      triggeredBy: 'user-1',
      triggeredByName: 'Chidi U.',
      result: {
        titleNumber: 'REG-ASABA-4552A',
        isVerified: true,
        sizeHectares: 8.5,
        beacons: ['Beacon 102', 'Beacon 103'],
        legalNotes: 'Governor Consent is fully registered and unencumbered. Land is zoned for residential developments.'
      }
    });

    this.executions.push({
      id: execId2,
      agentId: '3',
      agentName: 'Investment Analyst',
      propertyId: 'prop-bridgeview',
      propertyName: 'Bridgeview Court',
      status: 'Completed',
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 6800).toISOString(),
      triggeredBy: 'user-1',
      triggeredByName: 'Chidi U.',
      result: {
        annualYield: '14.5%',
        projectedIrr: '22.5%',
        investmentScore: 88,
        riskScore: 15,
        recommendation: 'Recommend acquiring plots immediately due to asymmetric appreciation from Niger bridge highway growth corridors.'
      }
    });

    // Seed execution steps for completed executions
    this.executionSteps.push(
      { id: 'step-1', executionId: execId1, name: 'Supervisor Orchestration', status: 'Completed', startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 500).toISOString(), durationMs: 500 },
      { id: 'step-2', executionId: execId1, name: 'Planning & Agent Selection', status: 'Completed', startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 500).toISOString(), completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1000).toISOString(), durationMs: 500 },
      { id: 'step-3', executionId: execId1, name: 'Context Gathering', status: 'Completed', startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1000).toISOString(), completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1500).toISOString(), durationMs: 500 },
      { id: 'step-4', executionId: execId1, name: 'Gemini Generation', status: 'Completed', startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1500).toISOString(), completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 3700).toISOString(), durationMs: 2200 },
      { id: 'step-5', executionId: execId1, name: 'Validation & Storage', status: 'Completed', startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 3700).toISOString(), completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 4200).toISOString(), durationMs: 500 }
    );

    this.executionSteps.push(
      { id: 'step-6', executionId: execId2, name: 'Supervisor Orchestration', status: 'Completed', startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 500).toISOString(), durationMs: 500 },
      { id: 'step-7', executionId: execId2, name: 'Planning & Agent Selection', status: 'Completed', startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 500).toISOString(), completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1100).toISOString(), durationMs: 600 },
      { id: 'step-8', executionId: execId2, name: 'Context Gathering', status: 'Completed', startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1100).toISOString(), completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1800).toISOString(), durationMs: 700 },
      { id: 'step-9', executionId: execId2, name: 'Gemini Generation', status: 'Completed', startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1800).toISOString(), completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 6200).toISOString(), durationMs: 4400 },
      { id: 'step-10', executionId: execId2, name: 'Validation & Storage', status: 'Completed', startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 6200).toISOString(), completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 6800).toISOString(), durationMs: 600 }
    );

    // Seed step execution logs
    this.executionLogs.push(
      { id: 'l-1', executionId: execId1, level: 'info', message: 'Supervisor Agent active. Objective received: Extract land title and beacon bounds for Bridgeview Court.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 100).toISOString() },
      { id: 'l-2', executionId: execId1, level: 'info', message: 'Supervisor Planning: Identifying active documents for prop-bridgeview. Zoned document count is 4.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 600).toISOString() },
      { id: 'l-3', executionId: execId1, level: 'info', message: 'Supervisor Selected Agent: "Property Knowledge Agent" (Index 01). Zoned Model: gemini-3.1-pro-preview.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 900).toISOString() },
      { id: 'l-4', executionId: execId1, level: 'info', message: 'Context synthesis: Compiling text extractions from survey plan and deeds of assignment.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1200).toISOString() },
      { id: 'l-5', executionId: execId1, level: 'info', message: 'Prompt synthesized. Sending structured payload (3,522 tokens) to Google GenAI server.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1600).toISOString() },
      { id: 'l-6', executionId: execId1, level: 'info', message: 'Response received from gemini-3.1-pro-preview. Extracted JSON payload.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 3600).toISOString() },
      { id: 'l-7', executionId: execId1, level: 'info', message: 'Supervisor Validating output: Schema conformity checking passed. Verifying titleNumber registration syntax... valid.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 3900).toISOString() },
      { id: 'l-8', executionId: execId1, level: 'info', message: 'Execution complete. Writing outputs to memory node and firing user alert notification.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 4100).toISOString() }
    );

    this.executionLogs.push(
      { id: 'l-9', executionId: execId2, level: 'info', message: 'Supervisor Agent active. Objective received: Run investment calculations and yields mapping.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 100).toISOString() },
      { id: 'l-10', executionId: execId2, level: 'info', message: 'Supervisor Selected Agent: "Investment Analyst" (Index 03). Zoned Model: gemini-3.1-pro-preview.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 800).toISOString() },
      { id: 'l-11', executionId: execId2, level: 'info', message: 'Context synthesis: Gathering property core pricing metrics and neighboring infrastructure ratings.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1300).toISOString() },
      { id: 'l-12', executionId: execId2, level: 'info', message: 'Prompt compiled. Querying Gemini to execute high-fidelity yield algorithms.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 2000).toISOString() },
      { id: 'l-13', executionId: execId2, level: 'info', message: 'Structured data received. Yield calculations output: IRR 22.5%, Yield 14.5%. Updating stats matrix.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 6100).toISOString() },
      { id: 'l-14', executionId: execId2, level: 'info', message: 'Validation complete. Firing task finish triggers.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 6700).toISOString() }
    );

    // Seed unread notifications
    this.aiNotifications.push({
      id: 'notif-1',
      title: 'Investment Analysis Complete',
      message: 'Investment Analyst has calculated yields for Bridgeview Court. Capital gains expected: 15% - 18% Annually.',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      executionId: execId2
    });

    this.aiNotifications.push({
      id: 'notif-2',
      title: 'Property Documents Synced',
      message: 'Property Knowledge Agent successfully finished legal auditing of Bridgeview Court survey certificates.',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      executionId: execId1
    });
  }

  seedDemoWorkspace() {
    this.clearWorkspace();

    const bridgeviewId = 'prop-bridgeview';
    const vercelId = 'prop-vercel';
    const lagosId = 'prop-lagos';

    // 1. Seed Three Properties
    this.properties.push({
      id: bridgeviewId,
      name: 'Bridgeview Court',
      location: 'Asaba, Delta State',
      state: 'Delta State',
      country: 'Nigeria',
      coordinates: { lat: 6.2059, lng: 6.6953 },
      description: 'Bridgeview Court is an ultra-modern luxury residential estate overlooking the scenic views of the Niger River bridge in Asaba. Designed for discerning homeowners who value security, pristine architecture, and high capital appreciation.',
      category: 'Residential Estate',
      price: '₦18M - ₦45M',
      status: 'Active',
      images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80'
      ],
      videos: [],
      documents: ['doc-survey', 'doc-deed', 'doc-faq-bv', 'doc-brochure-bv'],
      nearbyLandmarks: [
        { name: 'Asaba International Airport', distance: '12 mins', type: 'Airport' },
        { name: 'Shoprite Mall Asaba', distance: '8 mins', type: 'Mall' },
        { name: 'Dennis Osadebay University', distance: '15 mins', type: 'School' }
      ],
      infrastructure: [
        { name: '24/7 Smart Security & Access Control', status: 'Available' },
        { name: 'Paved Roads & Drainage Network', status: 'Available' },
        { name: 'Underground Electrification', status: 'Under Construction' },
        { name: 'Centralized Sewage Treatment Plant', status: 'Planned' }
      ],
      tags: ['Premium', 'Waterfront', 'High Appreciation'],
      landTitle: "Governor's Consent",
      totalSize: '8.5 Hectares',
      approvalStatus: 'Approved',
      createdAt: '2025-05-10T12:00:00Z',
      updatedAt: '2025-05-20T14:30:00Z',
      internalReferenceId: 'REF-BV-001',
      googleMapsLink: 'https://maps.google.com/?q=Asaba+Delta+State',
      availableUnits: 45,
      currency: '₦',
      paymentPlans: '12 Months installment / 30% initial deposit',
      allocationStatus: 'Instant Physical Allocation'
    });

    this.properties.push({
      id: vercelId,
      name: 'Vercel Heights',
      location: 'Ikoyi, Lagos State',
      state: 'Lagos State',
      country: 'Nigeria',
      coordinates: { lat: 6.4549, lng: 3.4246 },
      description: 'An architectural masterpiece of 35-storey luxury apartments in the heart of Ikoyi, boasting automated smart systems, dynamic workspace integration, and 360 views of the Atlantic Ocean.',
      category: 'Commercial',
      price: '₦250M - ₦600M',
      status: 'Active',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80'
      ],
      videos: [],
      documents: ['doc-brochure-vh', 'doc-research-ikoyi'],
      nearbyLandmarks: [
        { name: 'Ikoyi Club 1938', distance: '5 mins', type: 'Golf Club' },
        { name: 'The Lekki-Ikoyi Link Bridge', distance: '3 mins', type: 'Bridge' }
      ],
      infrastructure: [
        { name: 'High-speed Elevators', status: 'Available' },
        { name: 'Infinity Pool', status: 'Under Construction' }
      ],
      tags: ['Premium', 'New Launch', 'Waterfront'],
      landTitle: 'Certificate of Occupancy',
      totalSize: '1.2 Hectares',
      approvalStatus: 'Approved',
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-15T16:00:00Z',
      internalReferenceId: 'REF-VH-002',
      googleMapsLink: 'https://maps.google.com/?q=Ikoyi+Lagos+State',
      availableUnits: 15,
      currency: '₦',
      paymentPlans: 'Outright or 6 Months with 50% deposit',
      allocationStatus: 'Upon Completion'
    });

    this.properties.push({
      id: lagosId,
      name: 'Eko Atlantic Villa',
      location: 'Eko Atlantic City, Lagos State',
      state: 'Lagos State',
      country: 'Nigeria',
      coordinates: { lat: 6.4255, lng: 3.4092 },
      description: 'Exclusive state-of-the-art waterfront residential villas located inside the high-security marina district of Eko Atlantic City. Unrivaled luxury with stable green power grids and clean water.',
      category: 'Residential Estate',
      price: '₦450M - ₦900M',
      status: 'Pending',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80'
      ],
      videos: [],
      documents: ['doc-allocation-eko'],
      nearbyLandmarks: [
        { name: 'Eko Atlantic Marina', distance: '2 mins', type: 'Marina' },
        { name: 'Victoria Island Central Business District', distance: '5 mins', type: 'CBD' }
      ],
      infrastructure: [
        { name: 'Independent IPP Power Grid', status: 'Available' },
        { name: 'Fiber Optic Broadband', status: 'Available' }
      ],
      tags: ['Premium', 'Waterfront', 'New Launch'],
      landTitle: 'C of O (Eko Atlantic Deed)',
      totalSize: '0.8 Hectares',
      approvalStatus: 'Approved',
      createdAt: '2025-06-10T09:00:00Z',
      updatedAt: '2025-06-12T11:00:00Z',
      internalReferenceId: 'REF-EV-003',
      googleMapsLink: 'https://maps.google.com/?q=Eko+Atlantic+City',
      availableUnits: 5,
      currency: '₦',
      paymentPlans: 'Structured Payments up to 24 Months',
      allocationStatus: 'Allocated'
    });

    // 2. Seed Dynamic Documents with Complete Metadata & AI Preparation architecture
    this.documents.push({
      id: 'doc-survey',
      name: 'Bridgeview_Court_Registered_Survey_Plan.pdf',
      type: 'Survey Plan',
      fileFormat: 'pdf',
      size: 4200000,
      sizeFormatted: '4.0 MB',
      url: '#',
      uploadedBy: 'user-1',
      uploadedByName: 'Chidi U.',
      uploadedAt: '2025-05-11T10:00:00Z',
      category: 'Legal',
      propertyId: bridgeviewId,
      propertyIds: [bridgeviewId],
      department: 'Legal',
      state: 'Delta State',
      city: 'Asaba',
      tags: ['Verified Title', 'Blueprint'],
      effectiveDate: '2025-01-15',
      confidentiality: 'Confidential',
      version: '1.2',
      notes: 'Contains the official government beacon numbers and coordinates validated by Delta State surveyor general office.',
      processingStatus: 'Indexed',
      textExtraction: 'Bridgeview Court Land Parcel 102 beacon coordinates: Lat 6.2059 N, Lng 6.6953 E. Official allocation area is 8.5 Hectares under Governor Consent No 4552A-2024.',
      embedding: '[0.12, -0.45, 0.78, 0.02, 0.91, -0.23]',
      versions: [
        { id: 'v1', version: '1.0', name: 'Survey_Plan_Draft.pdf', size: 4100000, sizeFormatted: '3.9 MB', uploadedAt: '2025-05-10T10:00:00Z', uploadedByName: 'Chidi U.' },
        { id: 'v2', version: '1.2', name: 'Bridgeview_Court_Registered_Survey_Plan.pdf', size: 4200000, sizeFormatted: '4.0 MB', uploadedAt: '2025-05-11T10:00:00Z', uploadedByName: 'Chidi U.' }
      ]
    });

    this.documents.push({
      id: 'doc-deed',
      name: 'Deed_of_Assignment_Bridgeview_Asaba.pdf',
      type: 'Legal Document',
      fileFormat: 'pdf',
      size: 2100000,
      sizeFormatted: '2.0 MB',
      url: '#',
      uploadedBy: 'user-1',
      uploadedByName: 'Chidi U.',
      uploadedAt: '2025-05-12T11:30:00Z',
      category: 'Legal',
      propertyId: bridgeviewId,
      propertyIds: [bridgeviewId],
      department: 'Legal',
      state: 'Delta State',
      city: 'Asaba',
      tags: ['Verified Title'],
      effectiveDate: '2025-02-20',
      confidentiality: 'Highly Confidential',
      version: '1.0',
      notes: 'Signed Deed of Assignment transferring land holding rights to the development trust.',
      processingStatus: 'Indexed',
      textExtraction: 'This Deed of Assignment made this 20th day of February 2025 between the original Landowner Representatives and EstateIntel Development Partners.',
      embedding: '[0.05, -0.12, 0.34, 0.81, 0.09, -0.15]',
      versions: []
    });

    this.documents.push({
      id: 'doc-faq-bv',
      name: 'Bridgeview_Court_Objections_FAQ.docx',
      type: 'FAQ',
      fileFormat: 'docx',
      size: 320000,
      sizeFormatted: '312 KB',
      url: '#',
      uploadedBy: 'user-2',
      uploadedByName: 'Sarah Connor',
      uploadedAt: '2025-05-14T09:45:00Z',
      category: 'General',
      propertyId: bridgeviewId,
      propertyIds: [bridgeviewId],
      department: 'Sales',
      state: 'Delta State',
      city: 'Asaba',
      tags: ['Premium', 'Verified Title'],
      effectiveDate: '2025-05-01',
      confidentiality: 'Internal',
      version: '2.1',
      notes: 'Frequently Asked Questions targeting buyer concerns regarding landmarks, flooding, and installments.',
      processingStatus: 'Indexed',
      textExtraction: 'Q: Is Bridgeview Court affected by Niger River flooding? A: No, the estate is located on high-elevation topography overlooking the river with custom engineered drainage.',
      embedding: '[-0.02, 0.45, -0.61, 0.23, 0.88, 0.12]',
      versions: [
        { id: 'v1', version: '2.0', name: 'Bridgeview_FAQ_v1.docx', size: 310000, sizeFormatted: '302 KB', uploadedAt: '2025-05-12T08:00:00Z', uploadedByName: 'Sarah Connor' }
      ]
    });

    this.documents.push({
      id: 'doc-brochure-bv',
      name: 'Bridgeview_Interactive_Brochure.pdf',
      type: 'Property Brochure',
      fileFormat: 'pdf',
      size: 15400000,
      sizeFormatted: '14.7 MB',
      url: '#',
      uploadedBy: 'user-2',
      uploadedByName: 'Sarah Connor',
      uploadedAt: '2025-05-15T14:10:00Z',
      category: 'Marketing',
      propertyId: bridgeviewId,
      propertyIds: [bridgeviewId],
      department: 'Marketing',
      state: 'Delta State',
      city: 'Asaba',
      tags: ['Premium'],
      effectiveDate: '2025-05-10',
      confidentiality: 'Public',
      version: '1.0',
      notes: 'High-resolution presentation booklet featuring layout sketches, landmarks, and prices.',
      processingStatus: 'Indexed',
      textExtraction: 'Bridgeview Court Asaba Brochure. Starting at N18M for plots. Features include smart gatehouses, green parks, and 24/7 security patrol.',
      embedding: '[0.55, 0.02, -0.09, -0.44, 0.31, 0.52]',
      versions: []
    });

    this.documents.push({
      id: 'doc-brochure-vh',
      name: 'Vercel_Heights_Commercial_Portfolio.pdf',
      type: 'Property Brochure',
      fileFormat: 'pdf',
      size: 9800000,
      sizeFormatted: '9.3 MB',
      url: '#',
      uploadedBy: 'user-2',
      uploadedByName: 'Sarah Connor',
      uploadedAt: '2025-06-02T16:00:00Z',
      category: 'Marketing',
      propertyId: vercelId,
      propertyIds: [vercelId],
      department: 'Sales',
      state: 'Lagos State',
      city: 'Ikoyi',
      tags: ['Premium', 'New Launch'],
      effectiveDate: '2025-06-01',
      confidentiality: 'Public',
      version: '1.0',
      notes: 'Sales deck detailing corporate rental yields and office allocations.',
      processingStatus: 'Indexed',
      textExtraction: 'Vercel Heights Ikoyi features ultra-modern grade-A executive workspaces with intelligent energy grids.',
      embedding: '[-0.22, 0.15, 0.65, -0.87, 0.12, 0.44]',
      versions: []
    });

    this.documents.push({
      id: 'doc-research-ikoyi',
      name: 'Ikoyi_High_Net_Worth_Yields_Study.pdf',
      type: 'Research Report',
      fileFormat: 'pdf',
      size: 1800000,
      sizeFormatted: '1.7 MB',
      url: '#',
      uploadedBy: 'user-1',
      uploadedByName: 'Chidi U.',
      uploadedAt: '2025-06-05T08:30:00Z',
      category: 'Financial',
      propertyId: vercelId,
      propertyIds: [vercelId],
      department: 'Executive',
      state: 'Lagos State',
      city: 'Ikoyi',
      tags: ['Premium'],
      effectiveDate: '2025-05-18',
      confidentiality: 'Confidential',
      version: '1.0',
      notes: 'Independent study of corporate rental appreciation in Ikoyi, tracking a 14.5% year-on-year increase.',
      processingStatus: 'Indexed',
      textExtraction: 'Ikoyi Residential and Commercial Yield Study. Year-over-year rental returns in Kingsway Road and Waterfront sectors averaged 12-15% net yield.',
      embedding: '[0.35, -0.22, 0.11, 0.99, -0.55, -0.10]',
      versions: []
    });

    this.documents.push({
      id: 'doc-allocation-eko',
      name: 'Eko_Atlantic_Marina_Allocation_SOP.docx',
      type: 'Allocation Process',
      fileFormat: 'docx',
      size: 780000,
      sizeFormatted: '761 KB',
      url: '#',
      uploadedBy: 'user-1',
      uploadedByName: 'Chidi U.',
      uploadedAt: '2025-06-11T13:15:00Z',
      category: 'Legal',
      propertyId: lagosId,
      propertyIds: [lagosId],
      department: 'Operations',
      state: 'Lagos State',
      city: 'Victoria Island',
      tags: ['Verified Title'],
      effectiveDate: '2025-06-10',
      confidentiality: 'Internal',
      version: '1.1',
      notes: 'Standard Operating Procedures outlining allotment letters, initial deposits, and physical handover protocols.',
      processingStatus: 'Indexed',
      textExtraction: 'Standard physical allocation checklist for marina residential parcels inside Eko Atlantic district requires 100% payment and surveyor deed signoff.',
      embedding: '[-0.10, 0.88, 0.43, 0.12, -0.92, 0.05]',
      versions: []
    });

    // 3. Seed Reports (dynamic reference summary)
    this.reports.push({
      id: 'rep-1',
      title: 'Bridgeview Court - Full Investment Report',
      propertyId: bridgeviewId,
      propertyName: 'Bridgeview Court',
      createdBy: 'user-1',
      createdByName: 'Chidi U.',
      status: 'Completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'Full Investment',
      format: 'PDF'
    });

    this.reports.push({
      id: 'rep-2',
      title: 'Market Analysis - Asaba Overview',
      propertyId: bridgeviewId,
      propertyName: 'Bridgeview Court',
      createdBy: 'user-2',
      createdByName: 'Sarah Connor',
      status: 'Completed',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      type: 'Market Analysis',
      format: 'PDF'
    });

    // 4. Seed Content Assets
    this.contentAssets.push({
      id: 'con-1',
      title: 'YouTube Script - Bridgeview Court',
      platform: 'YouTube',
      body: `[INTRO]\nWelcome back to our channel! Today we are visiting the spectacular Bridgeview Court in Asaba, Delta State...\n\n[BODY]\nWe cover the pricing structure (starting at ₦18M) and the incredible view over the Niger River bridge...\n\n[OUTRO]\nSubscribe for more property insights!`,
      status: 'Published',
      propertyId: bridgeviewId,
      propertyName: 'Bridgeview Court',
      createdBy: 'Chidi U.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      format: 'DOCX'
    });

    this.contentAssets.push({
      id: 'con-2',
      title: 'Social Media Content Strategy',
      platform: 'LinkedIn',
      body: `Exciting announcement! We are launching Bridgeview Court in Asaba. Designed with a perfect blend of high capital appreciation and dynamic river-side living.\n\nPrice starting at ₦18M. Contact our sales office today!`,
      status: 'Published',
      propertyId: bridgeviewId,
      propertyName: 'Bridgeview Court',
      createdBy: 'Sarah Connor',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      format: 'DOCX'
    });

    // 5. Seed Property Media
    this.propertyMedia.push({
      id: 'media-bv-1',
      propertyId: bridgeviewId,
      title: 'Main Gatehouse Entrance',
      description: 'High resolution digital rendering of the primary secure gatehouse, automated access control barriers, and landscaping.',
      type: 'Image',
      url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80',
      tags: ['Exterior', 'Security', 'Gatehouse'],
      uploadDate: '2025-05-14T09:45:00Z'
    });

    this.propertyMedia.push({
      id: 'media-bv-2',
      propertyId: bridgeviewId,
      title: 'Luxury Villa Prototype Layout',
      description: 'Architectural schematic rendering of the 4-Bedroom fully detached waterfront duplex layout.',
      type: 'Layout Drawing',
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      tags: ['Interior', 'Layout', 'Waterfront'],
      uploadDate: '2025-05-15T10:00:00Z'
    });

    this.propertyMedia.push({
      id: 'media-bv-3',
      propertyId: bridgeviewId,
      title: 'Approved Master Plan Drawing',
      description: 'Delta State Ministry of Lands approved subdivision blueprint showing site roads, parks, and utility pathways.',
      type: 'Master Plan',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      tags: ['Blueprint', 'Master Plan', 'Legal'],
      uploadDate: '2025-05-16T11:00:00Z'
    });

    this.propertyMedia.push({
      id: 'media-vh-1',
      propertyId: vercelId,
      title: 'Structural Model 3D Rendering',
      description: 'Futuristic architectural model depicting Vercel Heights glass facade, sky lounge, and oceanfront podium.',
      type: 'Image',
      url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
      tags: ['Facade', 'Modern', '3D'],
      uploadDate: '2025-06-02T16:00:00Z'
    });

    // 6. Seed Property Relationships
    this.propertyRelationships.push({
      id: 'rel-bv-1',
      propertyId: bridgeviewId,
      relatedId: vercelId,
      relatedType: 'Property',
      relatedName: 'Vercel Heights',
      description: 'Part of the premium portfolio of luxury residential and commercial investments managed under the organization.',
      createdAt: '2025-06-01T10:00:00Z'
    });

    this.propertyRelationships.push({
      id: 'rel-bv-2',
      propertyId: bridgeviewId,
      relatedId: 'dev-waterfront',
      relatedType: 'Development',
      relatedName: 'Asaba Waterfront Development Project',
      description: 'Strategic neighborhood expansion directly aligned with the Delta State delta development corridor.',
      createdAt: '2025-05-12T12:00:00Z'
    });

    this.propertyRelationships.push({
      id: 'rel-vh-1',
      propertyId: vercelId,
      relatedId: lagosId,
      relatedType: 'Property',
      relatedName: 'Eko Atlantic Villa',
      description: 'Cross-market waterfront sister luxury development in Lagos State.',
      createdAt: '2025-06-11T09:00:00Z'
    });

    // 7. Seed Property Timeline Events
    this.propertyTimeline.push({
      id: 'time-bv-1',
      propertyId: bridgeviewId,
      title: 'Property Created',
      type: 'Property Created',
      description: 'Bridgeview Court has been added to EstateOS. Portfolio metadata initialized.',
      author: 'Chidi U.',
      createdAt: '2025-05-10T12:00:00Z'
    });

    this.propertyTimeline.push({
      id: 'time-bv-2',
      propertyId: bridgeviewId,
      title: 'Document Linked',
      type: 'Document Linked',
      description: 'Linked Registered Survey Plan.pdf and Deed of Assignment.pdf to Bridgeview Court.',
      author: 'Chidi U.',
      createdAt: '2025-05-12T11:30:00Z'
    });

    this.propertyTimeline.push({
      id: 'time-bv-3',
      propertyId: bridgeviewId,
      title: 'Media Assets Uploaded',
      type: 'Media Uploaded',
      description: 'Uploaded high-res gatehouse rendering and duplex layout blueprints.',
      author: 'Sarah Connor',
      createdAt: '2025-05-14T09:45:00Z'
    });

    this.propertyTimeline.push({
      id: 'time-bv-4',
      propertyId: bridgeviewId,
      title: 'Investment Report Generated',
      type: 'Report Generated',
      description: 'Generated Bridgeview Court - Full Investment Report using portfolio templates.',
      author: 'Chidi U.',
      createdAt: '2025-05-15T14:10:00Z'
    });

    this.propertyTimeline.push({
      id: 'time-vh-1',
      propertyId: vercelId,
      title: 'Property Created',
      type: 'Property Created',
      description: 'Vercel Heights created and portfolio initialized for Ikoyi high-yield studies.',
      author: 'Sarah Connor',
      createdAt: '2025-06-01T10:00:00Z'
    });

    // 8. Seed Property Statistics
    this.propertyStatistics.push({
      propertyId: bridgeviewId,
      expectedAppreciation: '15% - 18% Annually',
      investmentScore: 88,
      riskScore: 15,
      roiEstimate: '22.5% Cap Rate',
      rentalPotential: '₦4.5M/yr',
      demandLevel: 'High',
      marketTrend: 'Bullish',
      confidenceScore: 92
    });

    this.propertyStatistics.push({
      propertyId: vercelId,
      expectedAppreciation: '12% - 14% Annually',
      investmentScore: 94,
      riskScore: 20,
      roiEstimate: '18.1% Yield',
      rentalPotential: '₦25M/yr',
      demandLevel: 'Very High',
      marketTrend: 'Stable-High',
      confidenceScore: 95
    });

    this.propertyStatistics.push({
      propertyId: lagosId,
      expectedAppreciation: '18% - 22% Annually',
      investmentScore: 91,
      riskScore: 25,
      roiEstimate: '24.6% Cap Rate',
      rentalPotential: '₦40M/yr',
      demandLevel: 'Extreme',
      marketTrend: 'Rapid Appreciation',
      confidenceScore: 89
    });

    // 9. Seed Nearby Infrastructure
    this.nearbyInfrastructure.push({
      id: 'inf-bv-1',
      propertyId: bridgeviewId,
      name: 'Paved Dual Carriageway',
      type: 'Roads',
      status: 'Available',
      distance: '2 mins'
    });
    this.nearbyInfrastructure.push({
      id: 'inf-bv-2',
      propertyId: bridgeviewId,
      name: 'Asaba International Airport',
      type: 'Airport',
      status: 'Available',
      distance: '12 mins'
    });
    this.nearbyInfrastructure.push({
      id: 'inf-bv-3',
      propertyId: bridgeviewId,
      name: 'Dennis Osadebay University',
      type: 'Schools',
      status: 'Available',
      distance: '15 mins'
    });
    this.nearbyInfrastructure.push({
      id: 'inf-bv-4',
      propertyId: bridgeviewId,
      name: 'Shoprite Mall Asaba',
      type: 'Shopping Centres',
      status: 'Available',
      distance: '8 mins'
    });
    this.nearbyInfrastructure.push({
      id: 'inf-bv-5',
      propertyId: bridgeviewId,
      name: 'Delta State Police Command',
      type: 'Police',
      status: 'Available',
      distance: '10 mins'
    });
    this.nearbyInfrastructure.push({
      id: 'inf-bv-6',
      propertyId: bridgeviewId,
      name: 'Underground Power Grid Connection',
      type: 'Electricity',
      status: 'Under Construction',
      distance: '0 mins'
    });

    this.nearbyInfrastructure.push({
      id: 'inf-vh-1',
      propertyId: vercelId,
      name: 'Kingsway Road Expressway',
      type: 'Roads',
      status: 'Available',
      distance: '1 mins'
    });
    this.nearbyInfrastructure.push({
      id: 'inf-vh-2',
      propertyId: vercelId,
      name: 'Corona Primary School Ikoyi',
      type: 'Schools',
      status: 'Available',
      distance: '5 mins'
    });
    this.nearbyInfrastructure.push({
      id: 'inf-vh-3',
      propertyId: vercelId,
      name: 'Dual Power Feed System',
      type: 'Electricity',
      status: 'Available',
      distance: '0 mins'
    });

    // 10. Seed Property Settings
    this.propertySettingsList.push({
      propertyId: bridgeviewId,
      visibility: 'Public',
      isArchived: false,
      isDeleted: false,
      permissions: ['Admin', 'Marketing', 'Sales', 'Executive', 'Viewer']
    });

    this.propertySettingsList.push({
      propertyId: vercelId,
      visibility: 'Public',
      isArchived: false,
      isDeleted: false,
      permissions: ['Admin', 'Sales', 'Executive']
    });

    this.propertySettingsList.push({
      propertyId: lagosId,
      visibility: 'Internal',
      isArchived: false,
      isDeleted: false,
      permissions: ['Admin', 'Executive']
    });
  }

  clearWorkspace() {
    this.properties = [];
    this.documents = [];
    this.reports = [];
    this.contentAssets = [];
    this.propertyIntelligenceReports = [];
    this.marketAnalyses = [];
    this.investmentAnalyses = [];
    this.buyerPersonas = [];
    this.marketSignals = [];
    this.analysisVersions = [];
    this.marketInvestmentReports = [];
    this.propertyMedia = [];
    this.propertyRelationships = [];
    this.propertyTimeline = [];
    this.propertyStatistics = [];
    this.nearbyInfrastructure = [];
    this.propertySettingsList = [];
  }
}

export const dbInstance = new ServerDatabase();
