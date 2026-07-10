/**
 * EstateOS Database Schema and Type Definitions
 * Relational model representation for: Users, Organizations, Properties, Documents, Reports, Agent Executions, Content Assets, Settings.
 */

export type UserRole = 'Admin' | 'Marketing' | 'Sales' | 'Executive' | 'Viewer';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  domain?: string;
  createdAt: string;
}

export type PropertyStatus = 'Active' | 'Pending' | 'Archived';

export interface NearbyLandmark {
  name: string;
  distance: string;
  type: string; // e.g. "Airport", "School", "Beach"
}

export interface InfrastructureItem {
  name: string;
  status: 'Available' | 'Under Construction' | 'Planned';
}

export interface Property {
  id: string;
  name: string;
  location: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  description: string;
  category: string; // e.g. "Residential Estate", "Commercial", "Industrial", "Land"
  price: string;    // e.g. "₦18M - ₦45M"
  status: PropertyStatus;
  images: string[]; // URLs
  videos: string[]; // URLs
  documents: string[]; // associated document IDs
  nearbyLandmarks: NearbyLandmark[];
  infrastructure: InfrastructureItem[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // Specific reference metrics
  landTitle?: string; // e.g. "Governor's Consent"
  totalSize?: string; // e.g. "8.5 Hectares"
  approvalStatus?: string; // e.g. "Approved"

  // Prompt 3 additional properties (normalized or embedded)
  internalReferenceId?: string;
  googleMapsLink?: string;
  availableUnits?: number;
  currency?: string;
  paymentPlans?: string;
  allocationStatus?: string;
}

export interface PropertyMedia {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  type: 'Image' | 'Video' | 'Drone' | 'Site Visit' | 'Master Plan' | 'Layout Drawing';
  url: string;
  tags: string[];
  uploadDate: string;
}

export interface PropertyRelationship {
  id: string;
  propertyId: string;
  relatedId: string;
  relatedType: 'Property' | 'Neighbourhood' | 'Development' | 'Project' | 'Company' | 'Investment';
  relatedName: string;
  description: string;
  createdAt: string;
}

export interface PropertyTimelineEvent {
  id: string;
  propertyId: string;
  title: string;
  type: 'Property Created' | 'Document Linked' | 'Document Unlinked' | 'Media Uploaded' | 'Media Deleted' | 'Report Generated' | 'AI Analysis' | 'Settings Changed' | 'Other';
  description: string;
  author: string;
  createdAt: string;
}

export interface PropertyStatistics {
  propertyId: string;
  expectedAppreciation: string; // e.g. "12% - 15%"
  investmentScore: number;       // e.g. 85
  riskScore: number;             // e.g. 25
  roiEstimate: string;           // e.g. "18.4% Net Yield"
  rentalPotential: string;       // e.g. "₦5.0M/yr"
  demandLevel: string;           // e.g. "High"
  marketTrend: string;           // e.g. "Bullish"
  confidenceScore: number;       // e.g. 92
}

export interface NearbyInfrastructureItem {
  id: string;
  propertyId: string;
  name: string;
  type: 'Roads' | 'Hospitals' | 'Schools' | 'Markets' | 'Shopping Centres' | 'Airport' | 'Police' | 'Electricity' | 'Water' | 'Internet';
  status: 'Available' | 'Under Construction' | 'Planned';
  distance: string; // e.g. "5 mins", "12 mins"
}

export interface PropertySettings {
  propertyId: string;
  visibility: 'Public' | 'Internal' | 'Confidential';
  isArchived: boolean;
  isDeleted: boolean;
  permissions: string[]; // e.g. ["Admin", "Sales"]
}

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'img';

export interface DocumentVersion {
  id: string;
  version: string;
  name: string;
  size: number;
  sizeFormatted: string;
  uploadedAt: string;
  uploadedByName: string;
}

export interface Document {
  id: string;
  name: string;
  type: string; // Supported: 'FAQ', 'Property Brochure', 'Survey Plan', 'Payment Plan', 'Allocation Process', 'Price List', 'Legal Document', 'Government Approval', 'Internal SOP', 'Research Report', 'Market Analysis', 'Sales Script', 'Marketing Copy', 'Customer Questions', 'Images', 'Videos', 'Other'
  fileFormat: string; // 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'img' etc
  size: number; // bytes
  sizeFormatted: string;
  url?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  category: 'Property' | 'Legal' | 'Financial' | 'Marketing' | 'General'; // backwards compatibility
  propertyId?: string; // first or main related property
  propertyIds: string[]; // support multi-property linking
  department: string;
  state: string;
  city: string;
  tags: string[];
  effectiveDate?: string;
  confidentiality: string; // 'Public' | 'Internal' | 'Confidential' | 'Highly Confidential'
  version: string;
  notes?: string;
  
  // AI Preparation Layer
  processingStatus: 'Uploaded' | 'Waiting for Processing' | 'Processing' | 'Indexed' | 'Failed';
  textExtraction?: string;
  embedding?: string; // Placeholder or stringified representation

  // History / Lifecycle
  versions: DocumentVersion[];
  isArchived?: boolean;
}

export type ReportStatus = 'Draft' | 'Generating' | 'Completed' | 'Failed';

export interface Report {
  id: string;
  title: string;
  propertyId: string;
  propertyName: string;
  createdBy: string;
  createdByName: string;
  status: ReportStatus;
  createdAt: string;
  type: 'Full Investment' | 'Market Analysis' | 'Competitor Intelligence' | 'Custom';
  format: 'PDF' | 'DOCX';
}

export interface Agent {
  id: string;
  index: number;
  name: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Waiting' | 'Ready';
  category: 'Intelligence' | 'Analysis' | 'Content' | 'Sales';
  systemInstruction?: string;
  modelOverride?: string;
  capabilities?: string[];
  inputSchema?: any;
  outputSchema?: any;
}

export type AgentExecutionStatus = 'Queued' | 'Planning' | 'Running' | 'Validating' | 'Completed' | 'Failed';

export interface AgentExecution {
  id: string;
  agentId: string;
  agentName: string;
  propertyId?: string;
  propertyName?: string;
  status: AgentExecutionStatus;
  startedAt: string;
  completedAt?: string;
  triggeredBy: string;
  triggeredByName: string;
  error?: string;
  result?: any; // JSON representation of the final agent result
}

export interface AgentExecutionStep {
  id: string;
  executionId: string;
  name: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface AgentExecutionLog {
  id: string;
  executionId: string;
  stepId?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
}

export interface PromptTemplate {
  id: string;
  agentId: string;
  name: string;
  template: string;
  variables: string[];
  version: string;
}

export interface ContextSnapshot {
  id: string;
  executionId: string;
  data: any; // structured JSON snapshot
  createdAt: string;
}

export interface AINotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  createdAt: string;
  executionId?: string;
}

export interface AIConfig {
  primaryModel: string; // e.g. 'gemini-3.5-flash'
  complexReasoningModel: string; // e.g. 'gemini-3.1-pro-preview'
  temperature: number;
  systemInstructionOverride?: string;
}

export type ContentPlatform = 'LinkedIn' | 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'Email' | 'Blog' | 'WhatsApp';
export type ContentStatus = 'Draft' | 'Scheduled' | 'Published';

export interface ContentAsset {
  id: string;
  title: string;
  platform: ContentPlatform;
  body: string;
  status: ContentStatus;
  propertyId: string;
  propertyName: string;
  createdBy: string;
  createdAt: string;
  format: string; // e.g., "DOCX", "PDF", "Text"
}

export interface WorkspaceSettings {
  companyName: string;
  website: string;
  address: string;
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  defaultCurrency: string;
  timezone: string;
  apiKeys: {
    id: string;
    name: string;
    key: string;
    createdAt: string;
  }[];
  // Dynamic categories and settings configured in Prompt 2
  documentCategories?: string[];
  departments?: string[];
  tagCollections?: string[];
  confidentialityLevels?: string[];
  uploadLimitMb?: number;
}

export interface ConfidenceRating {
  score: number;
  reason: string;
  evidenceLevel: 'High' | 'Medium' | 'Low';
}

export interface PropertyIntelligenceReport {
  id: string;
  executionId: string;
  propertyId: string;
  propertyName: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  version: string;
  summary: string;
  structuredJson: {
    propertyKnowledge: {
      landTitle: string;
      totalSize: string;
      approvalStatus: string;
      verifiedBeacons: string[];
      legalNotes: string;
      confidence: ConfidenceRating;
    };
    localIntelligence: {
      landmarks: { name: string; distance: string; type: string }[];
      infrastructure: { name: string; status: 'Available' | 'Under Construction' | 'Planned' }[];
      growthVector: string;
      confidence: ConfidenceRating;
    };
    factVerification: {
      claimsAudited: { claim: string; source: string; status: 'Verified' | 'Unverified' | 'Conflicting'; notes: string }[];
      overallRating: string;
      confidence: ConfidenceRating;
    };
    executiveReport: {
      reportTitle: string;
      segmentsCompiled: string[];
      executiveSummary: string;
      confidence: ConfidenceRating;
    };
    overallConfidence: ConfidenceRating;
    sources: {
      internal: string[];
      public: string[];
      unknown: string[];
    };
  };
  confidence: {
    score: number;
    reason: string;
    evidenceLevel: 'High' | 'Medium' | 'Low';
  };
  sourceList: {
    internalSources: string[];
    publicSources: string[];
    unknownSources: string[];
  };
  status: 'Draft' | 'Generating' | 'Completed' | 'Failed';
}

export interface MarketAnalysis {
  id: string;
  propertyId: string;
  analysisVersionId: string;
  growthProjectionYearly: string;
  marketDemand: 'High' | 'Medium' | 'Low';
  demandDrivers: string[];
  competingDevelopments: { name: string; priceRange: string; distance: string }[];
  marketRisks: string[];
  averagePricePerSqm: string;
  absorptionRate: string;
  confidence: ConfidenceRating;
  createdAt: string;
}

export interface InvestmentAnalysis {
  id: string;
  propertyId: string;
  analysisVersionId: string;
  investmentScore: number;
  roiEstimate: string;
  irrEstimate: string;
  npvEstimate: string;
  appreciationForecast5Yr: { year: number; projectedValue: string; percentageIncrease: number }[];
  optimalPaymentPlan: string;
  allocationMilestones: { step: string; timeframe: string; description: string }[];
  riskRating: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  confidence: ConfidenceRating;
  createdAt: string;
}

export interface BuyerPersona {
  id: string;
  propertyId: string;
  analysisVersionId: string;
  name: string;
  segment: string;
  painPoints: string[];
  buyingTriggers: string[];
  keySellingPoints: string[];
  fitScore: number;
  whatsappPitch: string;
  linkedinPitch: string;
  salesScript: string;
}

export interface MarketSignal {
  id: string;
  propertyId: string;
  analysisVersionId: string;
  title: string;
  description: string;
  impact: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
  source: string;
  createdAt: string;
}

export interface AnalysisVersion {
  id: string;
  propertyId: string;
  version: string;
  status: 'Completed' | 'Failed' | 'In Progress';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  overallConfidence: ConfidenceRating;
  assumptions: string[];
  sources: string[];
}

export interface MarketInvestmentReport {
  id: string;
  propertyId: string;
  propertyName: string;
  version: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  status: 'Completed' | 'Failed' | 'In Progress';
  marketAnalysis: MarketAnalysis;
  investmentAnalysis: InvestmentAnalysis;
  buyerPersonas: BuyerPersona[];
  marketSignals: MarketSignal[];
  confidence: ConfidenceRating;
  assumptions: string[];
  sources: string[];
}

