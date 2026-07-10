import { dbInstance } from './serverDb';
import { 
  Property, 
  PropertyMedia, 
  PropertyRelationship, 
  PropertyTimelineEvent, 
  PropertyStatistics, 
  NearbyInfrastructureItem, 
  PropertySettings,
  Agent,
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

export class PropertyService {
  static getAll(): Property[] {
    // Get all properties that are not soft-deleted
    return dbInstance.properties.filter(p => {
      const settings = dbInstance.propertySettingsList.find(s => s.propertyId === p.id);
      return !settings || !settings.isDeleted;
    });
  }

  static getById(id: string): Property | undefined {
    return dbInstance.properties.find(p => p.id === id);
  }

  static create(payload: Partial<Property>, authorName: string = 'System'): Property {
    const id = `prop-${Date.now()}`;
    const newProperty: Property = {
      id,
      name: payload.name || 'Unnamed Property',
      location: payload.location || '',
      state: payload.state || '',
      country: payload.country || 'Nigeria',
      coordinates: payload.coordinates || { lat: 6.4549, lng: 3.4246 },
      description: payload.description || '',
      category: payload.category || 'Residential Estate',
      price: payload.price || 'Contact for Price',
      status: payload.status || 'Active',
      images: payload.images && payload.images.length > 0 ? payload.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'],
      videos: payload.videos || [],
      documents: payload.documents || [],
      nearbyLandmarks: payload.nearbyLandmarks || [],
      infrastructure: payload.infrastructure || [],
      tags: payload.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      landTitle: payload.landTitle || 'Under Review',
      totalSize: payload.totalSize || 'Not Specified',
      approvalStatus: payload.approvalStatus || 'Pending',
      internalReferenceId: payload.internalReferenceId || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      googleMapsLink: payload.googleMapsLink || '',
      availableUnits: payload.availableUnits || 0,
      currency: payload.currency || '₦',
      paymentPlans: payload.paymentPlans || '',
      allocationStatus: payload.allocationStatus || 'Pending'
    };

    // Save to memory
    dbInstance.properties.push(newProperty);

    // Initialize Default Settings
    const defaultSettings: PropertySettings = {
      propertyId: id,
      visibility: 'Public',
      isArchived: false,
      isDeleted: false,
      permissions: ['Admin', 'Marketing', 'Sales', 'Executive', 'Viewer']
    };
    dbInstance.propertySettingsList.push(defaultSettings);

    // Initialize Empty / Basic Statistics
    const defaultStats: PropertyStatistics = {
      propertyId: id,
      expectedAppreciation: 'Under Analysis',
      investmentScore: 0,
      riskScore: 0,
      roiEstimate: 'Under Analysis',
      rentalPotential: 'Under Analysis',
      demandLevel: 'Medium',
      marketTrend: 'Stable',
      confidenceScore: 0
    };
    dbInstance.propertyStatistics.push(defaultStats);

    // Add Timeline Event
    TimelineService.addEvent(id, {
      title: 'Property Registered',
      type: 'Property Created',
      description: `Property "${newProperty.name}" registered in EstateOS with reference ID ${newProperty.internalReferenceId}.`,
      author: authorName
    });

    return newProperty;
  }

  static update(id: string, payload: Partial<Property>, authorName: string = 'System'): Property | undefined {
    const propIdx = dbInstance.properties.findIndex(p => p.id === id);
    if (propIdx === -1) return undefined;

    const existing = dbInstance.properties[propIdx];
    const updated: Property = {
      ...existing,
      ...payload,
      id: existing.id, // preserve ID
      updatedAt: new Date().toISOString()
    };

    dbInstance.properties[propIdx] = updated;

    // Add Timeline Event
    TimelineService.addEvent(id, {
      title: 'Property Updated',
      type: 'Settings Changed',
      description: `Property parameters updated by ${authorName}.`,
      author: authorName
    });

    return updated;
  }

  static delete(id: string, authorName: string = 'System'): boolean {
    const settingsIdx = dbInstance.propertySettingsList.findIndex(s => s.propertyId === id);
    if (settingsIdx !== -1) {
      dbInstance.propertySettingsList[settingsIdx].isDeleted = true;
    } else {
      dbInstance.propertySettingsList.push({
        propertyId: id,
        visibility: 'Public',
        isArchived: false,
        isDeleted: true,
        permissions: []
      });
    }

    // Update status to archived or deleted
    const propIdx = dbInstance.properties.findIndex(p => p.id === id);
    if (propIdx !== -1) {
      dbInstance.properties[propIdx].status = 'Archived';
    }

    // Add Timeline Event
    TimelineService.addEvent(id, {
      title: 'Property Removed',
      type: 'Settings Changed',
      description: `Property moved to Recycle Bin / deleted.`,
      author: authorName
    });

    return true;
  }

  static archive(id: string, isArchived: boolean = true, authorName: string = 'System'): boolean {
    const settingsIdx = dbInstance.propertySettingsList.findIndex(s => s.propertyId === id);
    if (settingsIdx !== -1) {
      dbInstance.propertySettingsList[settingsIdx].isArchived = isArchived;
    } else {
      dbInstance.propertySettingsList.push({
        propertyId: id,
        visibility: 'Public',
        isArchived,
        isDeleted: false,
        permissions: []
      });
    }

    const propIdx = dbInstance.properties.findIndex(p => p.id === id);
    if (propIdx !== -1) {
      dbInstance.properties[propIdx].status = isArchived ? 'Archived' : 'Active';
    }

    // Add Timeline Event
    TimelineService.addEvent(id, {
      title: isArchived ? 'Property Archived' : 'Property Restored',
      type: 'Settings Changed',
      description: isArchived ? `Property moved to archives.` : `Property restored from archives to portfolio.`,
      author: authorName
    });

    return true;
  }
}

export class MediaService {
  static getForProperty(propertyId: string): PropertyMedia[] {
    return dbInstance.propertyMedia.filter(m => m.propertyId === propertyId);
  }

  static upload(propertyId: string, payload: Partial<PropertyMedia>, authorName: string = 'System'): PropertyMedia {
    const id = `media-${Date.now()}`;
    const newMedia: PropertyMedia = {
      id,
      propertyId,
      title: payload.title || 'Untitled Asset',
      description: payload.description || '',
      type: payload.type || 'Image',
      url: payload.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80',
      tags: payload.tags || [],
      uploadDate: new Date().toISOString()
    };

    dbInstance.propertyMedia.push(newMedia);

    // Also append to property.images or property.videos for backward compatibility
    const prop = dbInstance.properties.find(p => p.id === propertyId);
    if (prop) {
      if (newMedia.type === 'Image' || newMedia.type === 'Master Plan' || newMedia.type === 'Layout Drawing') {
        if (!prop.images.includes(newMedia.url)) {
          prop.images.push(newMedia.url);
        }
      } else if (newMedia.type === 'Video' || newMedia.type === 'Drone' || newMedia.type === 'Site Visit') {
        if (!prop.videos.includes(newMedia.url)) {
          prop.videos.push(newMedia.url);
        }
      }
    }

    // Add Timeline Event
    TimelineService.addEvent(propertyId, {
      title: 'Media Uploaded',
      type: 'Media Uploaded',
      description: `Uploaded media asset: "${newMedia.title}" (${newMedia.type}).`,
      author: authorName
    });

    return newMedia;
  }

  static delete(mediaId: string, authorName: string = 'System'): boolean {
    const mediaIdx = dbInstance.propertyMedia.findIndex(m => m.id === mediaId);
    if (mediaIdx === -1) return false;

    const media = dbInstance.propertyMedia[mediaIdx];
    dbInstance.propertyMedia.splice(mediaIdx, 1);

    // Add Timeline Event
    TimelineService.addEvent(media.propertyId, {
      title: 'Media Deleted',
      type: 'Media Deleted',
      description: `Deleted media asset: "${media.title}".`,
      author: authorName
    });

    return true;
  }

  static replace(mediaId: string, payload: Partial<PropertyMedia>, authorName: string = 'System'): PropertyMedia | undefined {
    const mediaIdx = dbInstance.propertyMedia.findIndex(m => m.id === mediaId);
    if (mediaIdx === -1) return undefined;

    const existing = dbInstance.propertyMedia[mediaIdx];
    const updated: PropertyMedia = {
      ...existing,
      ...payload,
      id: existing.id,
      propertyId: existing.propertyId,
      uploadDate: new Date().toISOString()
    };

    dbInstance.propertyMedia[mediaIdx] = updated;

    // Add Timeline Event
    TimelineService.addEvent(existing.propertyId, {
      title: 'Media Replaced',
      type: 'Media Uploaded',
      description: `Replaced media asset: "${updated.title}".`,
      author: authorName
    });

    return updated;
  }
}

export class RelationshipService {
  static getForProperty(propertyId: string): PropertyRelationship[] {
    return dbInstance.propertyRelationships.filter(r => r.propertyId === propertyId || r.relatedId === propertyId);
  }

  static add(propertyId: string, payload: Partial<PropertyRelationship>, authorName: string = 'System'): PropertyRelationship {
    const id = `rel-${Date.now()}`;
    const newRel: PropertyRelationship = {
      id,
      propertyId,
      relatedId: payload.relatedId || '',
      relatedType: payload.relatedType || 'Property',
      relatedName: payload.relatedName || 'Related Asset',
      description: payload.description || '',
      createdAt: new Date().toISOString()
    };

    dbInstance.propertyRelationships.push(newRel);

    // Add Timeline Event
    TimelineService.addEvent(propertyId, {
      title: 'Relationship Added',
      type: 'Other',
      description: `Linked property to ${newRel.relatedType}: "${newRel.relatedName}".`,
      author: authorName
    });

    return newRel;
  }

  static remove(relationshipId: string, authorName: string = 'System'): boolean {
    const relIdx = dbInstance.propertyRelationships.findIndex(r => r.id === relationshipId);
    if (relIdx === -1) return false;

    const rel = dbInstance.propertyRelationships[relIdx];
    dbInstance.propertyRelationships.splice(relIdx, 1);

    // Add Timeline Event
    TimelineService.addEvent(rel.propertyId, {
      title: 'Relationship Removed',
      type: 'Other',
      description: `Removed relationship with ${rel.relatedType}: "${rel.relatedName}".`,
      author: authorName
    });

    return true;
  }
}

export class TimelineService {
  static getForProperty(propertyId: string): PropertyTimelineEvent[] {
    return dbInstance.propertyTimeline
      .filter(t => t.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static addEvent(propertyId: string, payload: Partial<PropertyTimelineEvent>): PropertyTimelineEvent {
    const newEvent: PropertyTimelineEvent = {
      id: `time-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      propertyId,
      title: payload.title || 'System Action',
      type: payload.type || 'Other',
      description: payload.description || '',
      author: payload.author || 'System',
      createdAt: payload.createdAt || new Date().toISOString()
    };

    dbInstance.propertyTimeline.push(newEvent);
    return newEvent;
  }
}

export class StatisticsService {
  static getForProperty(propertyId: string): PropertyStatistics {
    const stats = dbInstance.propertyStatistics.find(s => s.propertyId === propertyId);
    if (stats) return stats;

    // return fallback empty state
    return {
      propertyId,
      expectedAppreciation: 'No analysis generated yet.',
      investmentScore: 0,
      riskScore: 0,
      roiEstimate: 'No analysis generated yet.',
      rentalPotential: 'No analysis generated yet.',
      demandLevel: 'N/A',
      marketTrend: 'N/A',
      confidenceScore: 0
    };
  }

  static updateForProperty(propertyId: string, payload: Partial<PropertyStatistics>): PropertyStatistics {
    const statsIdx = dbInstance.propertyStatistics.findIndex(s => s.propertyId === propertyId);
    if (statsIdx !== -1) {
      dbInstance.propertyStatistics[statsIdx] = {
        ...dbInstance.propertyStatistics[statsIdx],
        ...payload,
        propertyId
      };
      return dbInstance.propertyStatistics[statsIdx];
    }

    const newStats: PropertyStatistics = {
      propertyId,
      expectedAppreciation: payload.expectedAppreciation || 'No analysis generated yet.',
      investmentScore: payload.investmentScore || 0,
      riskScore: payload.riskScore || 0,
      roiEstimate: payload.roiEstimate || 'No analysis generated yet.',
      rentalPotential: payload.rentalPotential || 'No analysis generated yet.',
      demandLevel: payload.demandLevel || 'N/A',
      marketTrend: payload.marketTrend || 'N/A',
      confidenceScore: payload.confidenceScore || 0
    };
    dbInstance.propertyStatistics.push(newStats);
    return newStats;
  }
}

export class DashboardService {
  static getGlobalStats() {
    const properties = PropertyService.getAll();
    const documents = dbInstance.documents.filter(d => !d.isArchived);
    const media = dbInstance.propertyMedia;
    const reports = dbInstance.reports;
    const content = dbInstance.contentAssets;

    const totalPortfolioValue = properties.length * 15000000; // placeholder math
    
    return {
      totalProperties: properties.length,
      totalDocuments: documents.length,
      totalMedia: media.length,
      totalReports: reports.length,
      totalContentAssets: content.length,
      activeAITasks: dbInstance.documents.filter(d => d.processingStatus === 'Processing' || d.processingStatus === 'Waiting for Processing').length,
      portfolioValue: `₦${(totalPortfolioValue / 1000000).toFixed(0)}M+`
    };
  }
}

export class AgentRegistryService {
  static getAll(): Agent[] {
    return dbInstance.agents;
  }

  static getById(id: string): Agent | undefined {
    return dbInstance.agents.find(a => a.id === id);
  }

  static updateAgent(id: string, payload: Partial<Agent>): Agent | undefined {
    const idx = dbInstance.agents.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    dbInstance.agents[idx] = {
      ...dbInstance.agents[idx],
      ...payload
    };
    return dbInstance.agents[idx];
  }
}

export class AgentExecutionService {
  static getAll(): AgentExecution[] {
    return dbInstance.executions;
  }

  static getById(id: string): AgentExecution | undefined {
    return dbInstance.executions.find(e => e.id === id);
  }

  static createExecution(payload: Partial<AgentExecution>): AgentExecution {
    const id = `exec-${Date.now()}`;
    const agent = dbInstance.agents.find(a => a.id === payload.agentId);
    const property = dbInstance.properties.find(p => p.id === payload.propertyId);

    const newExec: AgentExecution = {
      id,
      agentId: payload.agentId || '1',
      agentName: agent ? agent.name : (payload.agentName || 'Unknown Agent'),
      propertyId: payload.propertyId,
      propertyName: property ? property.name : payload.propertyName,
      status: payload.status || 'Queued',
      startedAt: new Date().toISOString(),
      triggeredBy: payload.triggeredBy || 'user-1',
      triggeredByName: payload.triggeredByName || 'Chidi U.',
      result: payload.result,
      error: payload.error
    };

    dbInstance.executions.unshift(newExec);
    return newExec;
  }

  static updateExecution(id: string, payload: Partial<AgentExecution>): AgentExecution | undefined {
    const idx = dbInstance.executions.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    dbInstance.executions[idx] = {
      ...dbInstance.executions[idx],
      ...payload
    };
    return dbInstance.executions[idx];
  }

  static getSteps(executionId: string): AgentExecutionStep[] {
    return dbInstance.executionSteps.filter(s => s.executionId === executionId);
  }

  static createStep(executionId: string, name: string, status: 'Pending' | 'Running' | 'Completed' | 'Failed'): AgentExecutionStep {
    const newStep: AgentExecutionStep = {
      id: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      executionId,
      name,
      status,
      startedAt: new Date().toISOString()
    };
    dbInstance.executionSteps.push(newStep);
    return newStep;
  }

  static updateStep(stepId: string, status: 'Pending' | 'Running' | 'Completed' | 'Failed', error?: string): AgentExecutionStep | undefined {
    const idx = dbInstance.executionSteps.findIndex(s => s.id === stepId);
    if (idx === -1) return undefined;
    const step = dbInstance.executionSteps[idx];
    const completedAt = new Date().toISOString();
    const durationMs = new Date(completedAt).getTime() - new Date(step.startedAt).getTime();
    
    dbInstance.executionSteps[idx] = {
      ...step,
      status,
      completedAt,
      durationMs
    };
    return dbInstance.executionSteps[idx];
  }

  static getLogs(executionId: string): AgentExecutionLog[] {
    return dbInstance.executionLogs.filter(l => l.executionId === executionId);
  }

  static createLog(executionId: string, message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info', stepId?: string): AgentExecutionLog {
    const newLog: AgentExecutionLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      executionId,
      stepId,
      level,
      message,
      timestamp: new Date().toISOString()
    };
    dbInstance.executionLogs.push(newLog);
    return newLog;
  }
}

export class PromptTemplateService {
  static getAll(): PromptTemplate[] {
    return dbInstance.promptTemplates;
  }

  static getForAgent(agentId: string): PromptTemplate[] {
    return dbInstance.promptTemplates.filter(t => t.agentId === agentId);
  }

  static createOrUpdate(payload: Partial<PromptTemplate>): PromptTemplate {
    const existingIdx = dbInstance.promptTemplates.findIndex(t => t.agentId === payload.agentId && t.name === payload.name);
    if (existingIdx !== -1) {
      dbInstance.promptTemplates[existingIdx] = {
        ...dbInstance.promptTemplates[existingIdx],
        ...payload,
        version: (parseFloat(dbInstance.promptTemplates[existingIdx].version) + 0.1).toFixed(1)
      } as PromptTemplate;
      return dbInstance.promptTemplates[existingIdx];
    } else {
      const newTemplate: PromptTemplate = {
        id: `pt-${Date.now()}`,
        agentId: payload.agentId || '1',
        name: payload.name || 'Custom Prompt',
        template: payload.template || '',
        variables: payload.variables || [],
        version: '1.0'
      };
      dbInstance.promptTemplates.push(newTemplate);
      return newTemplate;
    }
  }
}

export class AINotificationService {
  static getAll(): AINotification[] {
    return dbInstance.aiNotifications;
  }

  static getUnread(): AINotification[] {
    return dbInstance.aiNotifications.filter(n => !n.read);
  }

  static createNotification(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', executionId?: string): AINotification {
    const newNotification: AINotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      executionId
    };
    dbInstance.aiNotifications.unshift(newNotification);
    return newNotification;
  }

  static markAsRead(id: string): boolean {
    const idx = dbInstance.aiNotifications.findIndex(n => n.id === id);
    if (idx === -1) return false;
    dbInstance.aiNotifications[idx].read = true;
    return true;
  }

  static markAllAsRead(): void {
    dbInstance.aiNotifications.forEach(n => n.read = true);
  }
}

export class AIConfigService {
  static get(): AIConfig {
    return dbInstance.aiConfig;
  }

  static update(payload: Partial<AIConfig>): AIConfig {
    dbInstance.aiConfig = {
      ...dbInstance.aiConfig,
      ...payload
    };
    return dbInstance.aiConfig;
  }
}

export class PropertyIntelligenceService {
  static getAll(): PropertyIntelligenceReport[] {
    return dbInstance.propertyIntelligenceReports;
  }

  static getForProperty(propertyId: string): PropertyIntelligenceReport[] {
    return dbInstance.propertyIntelligenceReports.filter(r => r.propertyId === propertyId);
  }

  static getById(id: string): PropertyIntelligenceReport | undefined {
    return dbInstance.propertyIntelligenceReports.find(r => r.id === id);
  }

  static create(payload: Partial<PropertyIntelligenceReport>): PropertyIntelligenceReport {
    const id = `ir-${Date.now()}`;
    const newReport: PropertyIntelligenceReport = {
      id,
      executionId: payload.executionId || '',
      propertyId: payload.propertyId || '',
      propertyName: payload.propertyName || '',
      createdBy: payload.createdBy || 'System',
      createdByName: payload.createdByName || 'System',
      createdAt: new Date().toISOString(),
      version: payload.version || '1.0',
      summary: payload.summary || '',
      structuredJson: payload.structuredJson || {
        propertyKnowledge: { landTitle: '', totalSize: '', approvalStatus: '', verifiedBeacons: [], legalNotes: '', confidence: { score: 0, reason: '', evidenceLevel: 'Low' } },
        localIntelligence: { landmarks: [], infrastructure: [], growthVector: '', confidence: { score: 0, reason: '', evidenceLevel: 'Low' } },
        factVerification: { claimsAudited: [], overallRating: '', confidence: { score: 0, reason: '', evidenceLevel: 'Low' } },
        executiveReport: { reportTitle: '', segmentsCompiled: [], executiveSummary: '', confidence: { score: 0, reason: '', evidenceLevel: 'Low' } },
        overallConfidence: { score: 0, reason: '', evidenceLevel: 'Low' },
        sources: { internal: [], public: [], unknown: [] }
      },
      confidence: payload.confidence || { score: 0, reason: '', evidenceLevel: 'Low' },
      sourceList: payload.sourceList || { internalSources: [], publicSources: [], unknownSources: [] },
      status: payload.status || 'Draft'
    };

    dbInstance.propertyIntelligenceReports.unshift(newReport);
    return newReport;
  }

  static delete(id: string): boolean {
    const idx = dbInstance.propertyIntelligenceReports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    dbInstance.propertyIntelligenceReports.splice(idx, 1);
    return true;
  }
}

export class MarketIntelligenceService {
  static getAll(): MarketAnalysis[] {
    return dbInstance.marketAnalyses;
  }
  static getForProperty(propertyId: string): MarketAnalysis[] {
    return dbInstance.marketAnalyses.filter(m => m.propertyId === propertyId);
  }
  static create(payload: Partial<MarketAnalysis>): MarketAnalysis {
    const id = `ma-${Date.now()}`;
    const newMA: MarketAnalysis = {
      id,
      propertyId: payload.propertyId || '',
      analysisVersionId: payload.analysisVersionId || '',
      growthProjectionYearly: payload.growthProjectionYearly || '12% - 15%',
      marketDemand: payload.marketDemand || 'Medium',
      demandDrivers: payload.demandDrivers || [],
      competingDevelopments: payload.competingDevelopments || [],
      marketRisks: payload.marketRisks || [],
      averagePricePerSqm: payload.averagePricePerSqm || '',
      absorptionRate: payload.absorptionRate || '',
      confidence: payload.confidence || { score: 0, reason: '', evidenceLevel: 'Low' },
      createdAt: new Date().toISOString()
    };
    dbInstance.marketAnalyses.push(newMA);
    return newMA;
  }
}

export class InvestmentAnalysisService {
  static getAll(): InvestmentAnalysis[] {
    return dbInstance.investmentAnalyses;
  }
  static getForProperty(propertyId: string): InvestmentAnalysis[] {
    return dbInstance.investmentAnalyses.filter(i => i.propertyId === propertyId);
  }
  static create(payload: Partial<InvestmentAnalysis>): InvestmentAnalysis {
    const id = `ia-${Date.now()}`;
    const newIA: InvestmentAnalysis = {
      id,
      propertyId: payload.propertyId || '',
      analysisVersionId: payload.analysisVersionId || '',
      investmentScore: payload.investmentScore || 70,
      roiEstimate: payload.roiEstimate || '0%',
      irrEstimate: payload.irrEstimate || '0%',
      npvEstimate: payload.npvEstimate || '0',
      appreciationForecast5Yr: payload.appreciationForecast5Yr || [],
      optimalPaymentPlan: payload.optimalPaymentPlan || '',
      allocationMilestones: payload.allocationMilestones || [],
      riskRating: payload.riskRating || 'Medium',
      recommendations: payload.recommendations || [],
      confidence: payload.confidence || { score: 0, reason: '', evidenceLevel: 'Low' },
      createdAt: new Date().toISOString()
    };
    dbInstance.investmentAnalyses.push(newIA);
    return newIA;
  }
}

export class BuyerPersonaService {
  static getAll(): BuyerPersona[] {
    return dbInstance.buyerPersonas;
  }
  static getForProperty(propertyId: string): BuyerPersona[] {
    return dbInstance.buyerPersonas.filter(b => b.propertyId === propertyId);
  }
  static create(payload: Partial<BuyerPersona>): BuyerPersona {
    const id = `bp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newBP: BuyerPersona = {
      id,
      propertyId: payload.propertyId || '',
      analysisVersionId: payload.analysisVersionId || '',
      name: payload.name || '',
      segment: payload.segment || '',
      painPoints: payload.painPoints || [],
      buyingTriggers: payload.buyingTriggers || [],
      keySellingPoints: payload.keySellingPoints || [],
      fitScore: payload.fitScore || 70,
      whatsappPitch: payload.whatsappPitch || '',
      linkedinPitch: payload.linkedinPitch || '',
      salesScript: payload.salesScript || ''
    };
    dbInstance.buyerPersonas.push(newBP);
    return newBP;
  }
}

export class MarketSignalService {
  static getAll(): MarketSignal[] {
    return dbInstance.marketSignals;
  }
  static getForProperty(propertyId: string): MarketSignal[] {
    return dbInstance.marketSignals.filter(s => s.propertyId === propertyId);
  }
  static create(payload: Partial<MarketSignal>): MarketSignal {
    const id = `ms-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newMS: MarketSignal = {
      id,
      propertyId: payload.propertyId || '',
      analysisVersionId: payload.analysisVersionId || '',
      title: payload.title || '',
      description: payload.description || '',
      impact: payload.impact || 'Neutral',
      confidence: payload.confidence || 70,
      source: payload.source || '',
      createdAt: new Date().toISOString()
    };
    dbInstance.marketSignals.push(newMS);
    return newMS;
  }
}

export class AnalysisVersionService {
  static getAll(): AnalysisVersion[] {
    return dbInstance.analysisVersions;
  }
  static getForProperty(propertyId: string): AnalysisVersion[] {
    return dbInstance.analysisVersions.filter(v => v.propertyId === propertyId);
  }
  static create(payload: Partial<AnalysisVersion>): AnalysisVersion {
    const id = `av-${Date.now()}`;
    const newAV: AnalysisVersion = {
      id,
      propertyId: payload.propertyId || '',
      version: payload.version || '1.0',
      status: payload.status || 'Completed',
      createdBy: payload.createdBy || '',
      createdByName: payload.createdByName || '',
      createdAt: new Date().toISOString(),
      overallConfidence: payload.overallConfidence || { score: 0, reason: '', evidenceLevel: 'Low' },
      assumptions: payload.assumptions || [],
      sources: payload.sources || []
    };
    dbInstance.analysisVersions.push(newAV);
    return newAV;
  }
}

export class MarketInvestmentReportService {
  static getAll(): MarketInvestmentReport[] {
    return dbInstance.marketInvestmentReports;
  }
  static getForProperty(propertyId: string): MarketInvestmentReport[] {
    return dbInstance.marketInvestmentReports.filter(r => r.propertyId === propertyId);
  }
  static getById(id: string): MarketInvestmentReport | undefined {
    return dbInstance.marketInvestmentReports.find(r => r.id === id);
  }
  static create(payload: Partial<MarketInvestmentReport>): MarketInvestmentReport {
    const id = `mir-${Date.now()}`;
    const newReport: MarketInvestmentReport = {
      id,
      propertyId: payload.propertyId || '',
      propertyName: payload.propertyName || '',
      version: payload.version || '1.0',
      createdBy: payload.createdBy || 'System',
      createdByName: payload.createdByName || 'System',
      createdAt: new Date().toISOString(),
      status: payload.status || 'Completed',
      marketAnalysis: payload.marketAnalysis || { id: '', propertyId: '', analysisVersionId: '', growthProjectionYearly: '', marketDemand: 'Medium', demandDrivers: [], competingDevelopments: [], marketRisks: [], averagePricePerSqm: '', absorptionRate: '', confidence: { score: 0, reason: '', evidenceLevel: 'Low' }, createdAt: '' },
      investmentAnalysis: payload.investmentAnalysis || { id: '', propertyId: '', analysisVersionId: '', investmentScore: 0, roiEstimate: '', irrEstimate: '', npvEstimate: '', appreciationForecast5Yr: [], optimalPaymentPlan: '', allocationMilestones: [], riskRating: 'Medium', recommendations: [], confidence: { score: 0, reason: '', evidenceLevel: 'Low' }, createdAt: '' },
      buyerPersonas: payload.buyerPersonas || [],
      marketSignals: payload.marketSignals || [],
      confidence: payload.confidence || { score: 0, reason: '', evidenceLevel: 'Low' },
      assumptions: payload.assumptions || [],
      sources: payload.sources || []
    };
    dbInstance.marketInvestmentReports.unshift(newReport);
    return newReport;
  }
  static delete(id: string): boolean {
    const idx = dbInstance.marketInvestmentReports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    dbInstance.marketInvestmentReports.splice(idx, 1);
    return true;
  }
}

