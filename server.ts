import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbInstance } from './src/db/serverDb';
import { 
  PropertyService, 
  MediaService, 
  RelationshipService, 
  TimelineService, 
  StatisticsService, 
  DashboardService,
  AgentRegistryService,
  AgentExecutionService,
  PromptTemplateService,
  AINotificationService,
  AIConfigService,
  PropertyIntelligenceService,
  MarketIntelligenceService,
  InvestmentAnalysisService,
  BuyerPersonaService,
  MarketSignalService,
  AnalysisVersionService,
  MarketInvestmentReportService
} from './src/db/services';
import { Property, Document, Report, ContentAsset, User } from './src/types';
import { AIOrchestrator } from './src/services/aiOrchestrator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '50mb' }));

  // Helper to extract authorization header / simulate simple session
  const getCurrentUser = (req: Request): User | null => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const email = authHeader.split(' ')[1];
      const user = dbInstance.users.find(u => u.email === email);
      return user || dbInstance.users[0]; // fallback to first user for easy sandbox testing
    }
    return dbInstance.users[0]; // default user (Chidi U.)
  };

  // --- REST API ENDPOINTS ---

  // Auth Endpoints
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = dbInstance.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Return user info and simulated bearer token
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token: `Bearer ${user.email}` });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    const existing = dbInstance.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      password,
      name,
      role: role || 'Viewer',
      organizationId: 'org-1',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };
    dbInstance.users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token: `Bearer ${newUser.email}` });
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = dbInstance.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }
    res.json({ message: 'Password reset link sent to email' });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // --- PROPERTIES API ENDPOINTS ---
  app.get('/api/properties', (req: Request, res: Response) => {
    let list = PropertyService.getAll();
    const { query, state, city, status, category, tags, sortBy, sortOrder } = req.query;

    if (query) {
      const q = (query as string).toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.location.toLowerCase().includes(q) ||
        p.internalReferenceId?.toLowerCase().includes(q)
      );
    }
    if (state) {
      list = list.filter(p => p.state.toLowerCase() === (state as string).toLowerCase());
    }
    if (city) {
      list = list.filter(p => 
        (p as any).city?.toLowerCase() === (city as string).toLowerCase() || 
        p.location.toLowerCase().includes((city as string).toLowerCase())
      );
    }
    if (status) {
      list = list.filter(p => p.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
    }
    if (tags) {
      const tagList = (tags as string).split(',');
      list = list.filter(p => tagList.every(t => p.tags.includes(t)));
    }

    // Sorting
    if (sortBy) {
      const field = sortBy as keyof Property;
      const order = sortOrder === 'desc' ? -1 : 1;
      list.sort((a, b) => {
        const valA = a[field] || '';
        const valB = b[field] || '';
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    } else {
      // Default sort by newest created
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(list);
  });

  app.get('/api/properties/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const property = PropertyService.getById(id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    const statistics = StatisticsService.getForProperty(id);
    const media = MediaService.getForProperty(id);
    const relationships = RelationshipService.getForProperty(id);
    const timeline = TimelineService.getForProperty(id);
    const settings = dbInstance.propertySettingsList.find(s => s.propertyId === id);

    res.json({
      ...property,
      statistics,
      media,
      relationships,
      timeline,
      settings
    });
  });

  app.post('/api/properties', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const newProperty = PropertyService.create(req.body, currentUser?.name || 'System');
    res.status(201).json(newProperty);
  });

  app.put('/api/properties/:id', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const updated = PropertyService.update(req.params.id, req.body, currentUser?.name || 'System');
    if (!updated) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(updated);
  });

  app.delete('/api/properties/:id', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const success = PropertyService.delete(req.params.id, currentUser?.name || 'System');
    if (!success) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  });

  app.post('/api/properties/:id/archive', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const { isArchived } = req.body;
    const success = PropertyService.archive(req.params.id, isArchived !== false, currentUser?.name || 'System');
    if (!success) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: isArchived !== false ? 'Property archived successfully' : 'Property restored successfully' });
  });

  // --- PROPERTY MEDIA ENDPOINTS ---
  app.get('/api/properties/:id/media', (req: Request, res: Response) => {
    res.json(MediaService.getForProperty(req.params.id));
  });

  app.post('/api/properties/:id/media', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const media = MediaService.upload(req.params.id, req.body, currentUser?.name || 'System');
    res.status(201).json(media);
  });

  app.delete('/api/properties/media/:mediaId', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const success = MediaService.delete(req.params.mediaId, currentUser?.name || 'System');
    if (!success) {
      return res.status(404).json({ error: 'Media asset not found' });
    }
    res.json({ message: 'Media asset deleted successfully' });
  });

  app.put('/api/properties/media/:mediaId', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const updated = MediaService.replace(req.params.mediaId, req.body, currentUser?.name || 'System');
    if (!updated) {
      return res.status(404).json({ error: 'Media asset not found' });
    }
    res.json(updated);
  });

  // --- PROPERTY TIMELINE ENDPOINTS ---
  app.get('/api/properties/:id/timeline', (req: Request, res: Response) => {
    res.json(TimelineService.getForProperty(req.params.id));
  });

  // --- PROPERTY RELATIONSHIPS ENDPOINTS ---
  app.get('/api/properties/:id/relationships', (req: Request, res: Response) => {
    res.json(RelationshipService.getForProperty(req.params.id));
  });

  app.post('/api/properties/:id/relationships', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const rel = RelationshipService.add(req.params.id, req.body, currentUser?.name || 'System');
    res.status(201).json(rel);
  });

  app.delete('/api/properties/relationships/:relId', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const success = RelationshipService.remove(req.params.relId, currentUser?.name || 'System');
    if (!success) {
      return res.status(404).json({ error: 'Relationship not found' });
    }
    res.json({ message: 'Relationship removed successfully' });
  });

  // --- RELATED DOCUMENTS ENDPOINT ---
  app.get('/api/properties/:id/documents', (req: Request, res: Response) => {
    const { id } = req.params;
    const docs = dbInstance.documents.filter(d => d.propertyId === id || (d.propertyIds && d.propertyIds.includes(id)));
    res.json(docs);
  });

  // --- DASHBOARD STATISTICS ENDPOINT ---
  app.get('/api/dashboard/statistics', (req: Request, res: Response) => {
    res.json(DashboardService.getGlobalStats());
  });

  // --- PROPERTY STATISTICS ENDPOINTS ---
  app.get('/api/properties/:id/statistics', (req: Request, res: Response) => {
    res.json(StatisticsService.getForProperty(req.params.id));
  });

  app.put('/api/properties/:id/statistics', (req: Request, res: Response) => {
    const stats = StatisticsService.updateForProperty(req.params.id, req.body);
    res.json(stats);
  });

  // Documents Endpoints (Knowledge Intelligence Engine)
  app.get('/api/documents', (req: Request, res: Response) => {
    // Return all non-archived documents first
    res.json(dbInstance.documents.filter(d => !d.isArchived));
  });

  app.get('/api/documents/all', (req: Request, res: Response) => {
    // Return ALL documents (including archived)
    res.json(dbInstance.documents);
  });

  app.post('/api/documents', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const { 
      name, type, fileFormat, size, propertyIds, department, 
      state, city, tags, effectiveDate, confidentiality, version, notes 
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and Type are required' });
    }

    const sizeInBytes = size || Math.floor(Math.random() * 5 * 1024 * 1024) + 100 * 1024; // randomized demo size
    let formattedSize = (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (sizeInBytes < 1024 * 1024) {
      formattedSize = Math.round(sizeInBytes / 1024) + ' KB';
    }

    const firstPropId = propertyIds && propertyIds.length > 0 ? propertyIds[0] : undefined;

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name,
      type: type || 'Other',
      fileFormat: fileFormat || name.split('.').pop() || 'pdf',
      size: sizeInBytes,
      sizeFormatted: formattedSize,
      url: '#',
      uploadedBy: currentUser?.id || 'user-1',
      uploadedByName: currentUser?.name || 'Chidi U.',
      uploadedAt: new Date().toISOString(),
      category: 'General', // fallback compatibility
      propertyId: firstPropId,
      propertyIds: propertyIds || [],
      department: department || 'Operations',
      state: state || '',
      city: city || '',
      tags: tags || [],
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      confidentiality: confidentiality || 'Internal',
      version: version || '1.0',
      notes: notes || '',
      processingStatus: 'Uploaded',
      versions: []
    };

    dbInstance.documents.unshift(newDoc); // prepend to see it first

    // Trigger asynchronous simulated AI indexing pipeline (Processing Queue)
    setTimeout(() => {
      const doc = dbInstance.documents.find(d => d.id === newDoc.id);
      if (doc) {
        doc.processingStatus = 'Waiting for Processing';
        setTimeout(() => {
          doc.processingStatus = 'Processing';
          setTimeout(() => {
            doc.processingStatus = 'Indexed';
            doc.textExtraction = `[Simulated AI Text Extraction] Successfully completed indexing for ${doc.name}. Automated tag classification verified context matches sector ${doc.type}.`;
            doc.embedding = `[${Array.from({ length: 6 }, () => (Math.random() * 2 - 1).toFixed(3)).join(', ')}]`;
          }, 3000);
        }, 2000);
      }
    }, 1500);

    res.status(201).json(newDoc);
  });

  app.put('/api/documents/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const docIdx = dbInstance.documents.findIndex(d => d.id === id);
    if (docIdx === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const existing = dbInstance.documents[docIdx];
    
    // Check if we are replacing the version (i.e., uploading a new file version)
    const { isReplaceVersion, newFileName, newSize, newFileFormat, ...payload } = req.body;

    if (isReplaceVersion) {
      // Create version archive node of the current active document state
      const archivedVer: any = {
        id: `ver-${Date.now()}`,
        version: existing.version,
        name: existing.name,
        size: existing.size,
        sizeFormatted: existing.sizeFormatted,
        uploadedAt: existing.uploadedAt,
        uploadedByName: existing.uploadedByName
      };

      const updatedSize = newSize || existing.size;
      let formattedSize = (updatedSize / (1024 * 1024)).toFixed(1) + ' MB';
      if (updatedSize < 1024 * 1024) {
        formattedSize = Math.round(updatedSize / 1024) + ' KB';
      }

      // Increment version string
      const currentVerNum = parseFloat(existing.version) || 1.0;
      const nextVerStr = (currentVerNum + 0.1).toFixed(1);

      const updatedDoc: Document = {
        ...existing,
        ...payload,
        name: newFileName || existing.name,
        fileFormat: newFileFormat || existing.fileFormat,
        size: updatedSize,
        sizeFormatted: formattedSize,
        version: nextVerStr,
        uploadedAt: new Date().toISOString(),
        versions: [...(existing.versions || []), archivedVer],
        processingStatus: 'Uploaded' // re-trigger index pipeline
      };

      // Re-trigger async pipeline
      setTimeout(() => {
        const doc = dbInstance.documents.find(d => d.id === updatedDoc.id);
        if (doc) {
          doc.processingStatus = 'Indexed';
          doc.textExtraction = `[Simulated AI Text Extraction] Extracted and re-indexed updated version ${doc.version}.`;
          doc.embedding = `[${Array.from({ length: 6 }, () => (Math.random() * 2 - 1).toFixed(3)).join(', ')}]`;
        }
      }, 3000);

      dbInstance.documents[docIdx] = updatedDoc;
      return res.json(updatedDoc);
    }

    // Normal metadata update
    const updatedDoc: Document = {
      ...existing,
      ...payload,
      id: existing.id, // preserve id
      propertyId: payload.propertyIds && payload.propertyIds.length > 0 ? payload.propertyIds[0] : existing.propertyId
    };

    dbInstance.documents[docIdx] = updatedDoc;
    res.json(updatedDoc);
  });

  app.delete('/api/documents/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const docIdx = dbInstance.documents.findIndex(d => d.id === id);
    if (docIdx === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const deleted = dbInstance.documents.splice(docIdx, 1);
    res.json({ message: 'Document deleted successfully', document: deleted[0] });
  });

  // Reports Endpoints
  app.get('/api/reports', (req: Request, res: Response) => {
    res.json(dbInstance.reports);
  });

  app.post('/api/reports', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const { title, propertyId, type, format } = req.body;

    if (!title || !propertyId) {
      return res.status(400).json({ error: 'Title and Property ID are required' });
    }

    const property = dbInstance.properties.find(p => p.id === propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Selected property does not exist' });
    }

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      title,
      propertyId,
      propertyName: property.name,
      createdBy: currentUser?.id || 'user-1',
      createdByName: currentUser?.name || 'Chidi U.',
      status: 'Completed', // foundation generated instantly
      createdAt: new Date().toISOString(),
      type: type || 'Full Investment',
      format: format || 'PDF'
    };

    dbInstance.reports.unshift(newReport); // prepend
    res.status(201).json(newReport);
  });

  // Agents Endpoints (Read-only for foundation)
  app.get('/api/agents', (req: Request, res: Response) => {
    res.json(dbInstance.agents);
  });

  // Content Studio Endpoints
  app.get('/api/content', (req: Request, res: Response) => {
    res.json(dbInstance.contentAssets);
  });

  app.post('/api/content', (req: Request, res: Response) => {
    const currentUser = getCurrentUser(req);
    const { title, platform, body, propertyId, format } = req.body;

    if (!title || !platform || !body || !propertyId) {
      return res.status(400).json({ error: 'Title, Platform, Body, and Property ID are required' });
    }

    const property = dbInstance.properties.find(p => p.id === propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Selected property does not exist' });
    }

    const newAsset: ContentAsset = {
      id: `con-${Date.now()}`,
      title,
      platform,
      body,
      status: 'Draft',
      propertyId,
      propertyName: property.name,
      createdBy: currentUser?.name || 'Chidi U.',
      createdAt: new Date().toISOString(),
      format: format || 'DOCX'
    };

    dbInstance.contentAssets.unshift(newAsset);
    res.status(201).json(newAsset);
  });

  // Workspace Settings Endpoints
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(dbInstance.settings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    const updated = req.body;
    dbInstance.settings = {
      ...dbInstance.settings,
      ...updated
    };
    res.json(dbInstance.settings);
  });

  // Seed/Clear Workspace Endpoints
  app.post('/api/workspace/seed', (req: Request, res: Response) => {
    dbInstance.seedDemoWorkspace();
    res.json({
      message: 'Demo workspace loaded successfully',
      properties: dbInstance.properties,
      documents: dbInstance.documents,
      reports: dbInstance.reports,
      contentAssets: dbInstance.contentAssets
    });
  });

  app.post('/api/workspace/clear', (req: Request, res: Response) => {
    dbInstance.clearWorkspace();
    res.json({
      message: 'Workspace cleared successfully',
      properties: [],
      documents: [],
      reports: [],
      contentAssets: []
    });
  });

  // --- AI ORCHESTRATION ENGINE REST API ENDPOINTS ---

  // Get AI Config
  app.get('/api/ai/config', (req: Request, res: Response) => {
    res.json(AIConfigService.get());
  });

  // Update AI Config
  app.put('/api/ai/config', (req: Request, res: Response) => {
    const updated = AIConfigService.update(req.body);
    res.json(updated);
  });

  // Get Agent Registry List
  app.get('/api/ai/agents', (req: Request, res: Response) => {
    res.json(AgentRegistryService.getAll());
  });

  // Update Agent Settings (systemInstruction, modelOverride, capabilities)
  app.put('/api/ai/agents/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updated = AgentRegistryService.updateAgent(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(updated);
  });

  // Get All Executions (with filters)
  app.get('/api/ai/executions', (req: Request, res: Response) => {
    const { propertyId, agentId } = req.query;
    let list = AgentExecutionService.getAll();
    if (propertyId) {
      list = list.filter(e => e.propertyId === String(propertyId));
    }
    if (agentId) {
      list = list.filter(e => e.agentId === String(agentId));
    }
    res.json(list);
  });

  // Get Single Execution Details (including steps and logs)
  app.get('/api/ai/executions/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const execution = AgentExecutionService.getById(id);
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    const steps = AgentExecutionService.getSteps(id);
    const logs = AgentExecutionService.getLogs(id);
    res.json({
      ...execution,
      steps,
      logs
    });
  });

  // Trigger Execution Run (Orchestration Pipeline entry point)
  app.post('/api/ai/executions', async (req: Request, res: Response) => {
    const { agentId, propertyId } = req.body;
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    try {
      const execution = await AIOrchestrator.runAgent(agentId, propertyId, user);
      res.status(201).json(execution);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Trigger Property Intelligence Analysis Workflow
  app.post('/api/ai/property-intelligence', async (req: Request, res: Response) => {
    const { propertyId, enablePublicResearch } = req.body;
    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    try {
      const execution = await AIOrchestrator.runPropertyIntelligence(propertyId, !!enablePublicResearch, user);
      res.status(201).json(execution);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Property Intelligence Reports for a Property
  app.get('/api/properties/:id/intelligence-reports', (req: Request, res: Response) => {
    const reports = PropertyIntelligenceService.getForProperty(req.params.id);
    res.json(reports);
  });

  // Get a specific Property Intelligence Report
  app.get('/api/intelligence-reports/:id', (req: Request, res: Response) => {
    const report = PropertyIntelligenceService.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Property Intelligence Report not found' });
    }
    res.json(report);
  });

  // Delete a specific Property Intelligence Report
  app.delete('/api/intelligence-reports/:id', (req: Request, res: Response) => {
    const success = PropertyIntelligenceService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Property Intelligence Report not found' });
    }
    res.json({ success: true });
  });

  // Trigger Market & Investment Analysis Workflow
  app.post('/api/ai/market-investment', async (req: Request, res: Response) => {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }
    const user = getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    try {
      const execution = await AIOrchestrator.runMarketAndInvestment(propertyId, user);
      res.status(201).json(execution);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Market & Investment Reports for a Property
  app.get('/api/properties/:id/market-investment-reports', (req: Request, res: Response) => {
    const reports = MarketInvestmentReportService.getForProperty(req.params.id);
    res.json(reports);
  });

  // Get a specific Market & Investment Report
  app.get('/api/market-investment-reports/:id', (req: Request, res: Response) => {
    const report = MarketInvestmentReportService.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Market & Investment Report not found' });
    }
    res.json(report);
  });

  // Delete a specific Market & Investment Report
  app.delete('/api/market-investment-reports/:id', (req: Request, res: Response) => {
    const success = MarketInvestmentReportService.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Market & Investment Report not found' });
    }
    res.json({ success: true });
  });

  // Get Prompt Templates
  app.get('/api/ai/templates', (req: Request, res: Response) => {
    const { agentId } = req.query;
    let list = PromptTemplateService.getAll();
    if (agentId) {
      list = list.filter(t => t.agentId === String(agentId));
    }
    res.json(list);
  });

  // Create or Update Prompt Template
  app.post('/api/ai/templates', (req: Request, res: Response) => {
    const template = PromptTemplateService.createOrUpdate(req.body);
    res.status(201).json(template);
  });

  // Get AI Notifications (unread/all)
  app.get('/api/ai/notifications', (req: Request, res: Response) => {
    const { unreadOnly } = req.query;
    if (unreadOnly === 'true') {
      res.json(AINotificationService.getUnread());
    } else {
      res.json(AINotificationService.getAll());
    }
  });

  // Mark AINotification as Read
  app.put('/api/ai/notifications/:id/read', (req: Request, res: Response) => {
    const { id } = req.params;
    const success = AINotificationService.markAsRead(id);
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  });

  // Mark all AINotifications as Read
  app.post('/api/ai/notifications/read-all', (req: Request, res: Response) => {
    AINotificationService.markAllAsRead();
    res.json({ success: true });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
