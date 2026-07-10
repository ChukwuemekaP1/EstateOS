import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Image, 
  Activity, 
  Link2, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  X,
  Plus,
  Trash2,
  FileText,
  Search,
  PlusCircle
} from 'lucide-react';
import { Property, Document, NearbyLandmark, InfrastructureItem } from '../types';

interface CreatePropertyWizardProps {
  onClose: () => void;
  onSubmit: (payload: Partial<Property>) => Promise<void>;
  documents: Document[];
  initialProperty?: Property; // if editing
}

export default function CreatePropertyWizard({
  onClose,
  onSubmit,
  documents = [],
  initialProperty
}: CreatePropertyWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // --- WIZARD FORM STATES ---
  // Step 1: Basic Info
  const [name, setName] = useState(initialProperty?.name || '');
  const [category, setCategory] = useState(initialProperty?.category || 'Residential Estate');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Archived'>(initialProperty?.status || 'Active');
  const [internalRef, setInternalRef] = useState(initialProperty?.internalReferenceId || `REF-${Math.floor(1000 + Math.random() * 9000)}`);
  const [description, setDescription] = useState(initialProperty?.description || '');
  const [tagsInput, setTagsInput] = useState(initialProperty?.tags.join(', ') || '');

  // Step 2: Location
  const [location, setLocation] = useState(initialProperty?.location || '');
  const [city, setCity] = useState(initialProperty?.location.split(',')[0] || '');
  const [state, setState] = useState(initialProperty?.state || 'Delta State');
  const [country, setCountry] = useState(initialProperty?.country || 'Nigeria');
  const [lat, setLat] = useState(initialProperty?.coordinates?.lat || 6.4549);
  const [lng, setLng] = useState(initialProperty?.coordinates?.lng || 3.4246);
  const [googleMapsLink, setGoogleMapsLink] = useState(initialProperty?.googleMapsLink || '');

  // Step 3: Investment Info
  const [price, setPrice] = useState(initialProperty?.price || '₦35,000,000');
  const [currency, setCurrency] = useState(initialProperty?.currency || '₦');
  const [totalSize, setTotalSize] = useState(initialProperty?.totalSize || '5.5 Hectares');
  const [landTitle, setLandTitle] = useState(initialProperty?.landTitle || "Governor's Consent");
  const [approvalStatus, setApprovalStatus] = useState(initialProperty?.approvalStatus || 'Approved');
  const [availableUnits, setAvailableUnits] = useState(initialProperty?.availableUnits || 45);
  const [paymentPlans, setPaymentPlans] = useState(initialProperty?.paymentPlans || '3 Months, 6 Months, 12 Months');
  const [allocationStatus, setAllocationStatus] = useState(initialProperty?.allocationStatus || 'Instant Allocation');

  // Step 4: Media
  const [mediaList, setMediaList] = useState<string[]>(initialProperty?.images || [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80'
  ]);
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // Step 5: Infrastructure & Landmarks
  const [landmarks, setLandmarks] = useState<NearbyLandmark[]>(initialProperty?.nearbyLandmarks || [
    { name: 'Asaba Airport Access Road', type: 'Airport', distance: '10 mins' },
    { name: 'Shoprite Delta Mall', type: 'Mall', distance: '12 mins' }
  ]);
  const [landmarkName, setLandmarkName] = useState('');
  const [landmarkDistance, setLandmarkDistance] = useState('');
  const [landmarkType, setLandmarkType] = useState('Mall');

  const [infrastructure, setInfrastructure] = useState<InfrastructureItem[]>(initialProperty?.infrastructure || [
    { name: 'Paved Asphalt Roads', status: 'Under Construction' },
    { name: 'Centralized Water Supply', status: 'Available' },
    { name: 'Electricity Distribution Grid', status: 'Planned' }
  ]);
  const [infraName, setInfraName] = useState('');
  const [infraStatus, setInfraStatus] = useState<'Available' | 'Under Construction' | 'Planned'>('Available');

  // Step 6: Knowledge Connections (Linking existing documents)
  const [linkedDocIds, setLinkedDocIds] = useState<string[]>(initialProperty?.documents || []);
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // --- HELPERS ---
  const handleAddMedia = () => {
    if (newMediaUrl && newMediaUrl.startsWith('http')) {
      setMediaList([...mediaList, newMediaUrl]);
      setNewMediaUrl('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList(mediaList.filter((_, idx) => idx !== index));
  };

  const handleAddLandmark = () => {
    if (landmarkName && landmarkDistance) {
      setLandmarks([...landmarks, { name: landmarkName, distance: landmarkDistance, type: landmarkType }]);
      setLandmarkName('');
      setLandmarkDistance('');
    }
  };

  const handleRemoveLandmark = (index: number) => {
    setLandmarks(landmarks.filter((_, idx) => idx !== index));
  };

  const handleAddInfra = () => {
    if (infraName) {
      setInfrastructure([...infrastructure, { name: infraName, status: infraStatus }]);
      setInfraName('');
    }
  };

  const handleRemoveInfra = (index: number) => {
    setInfrastructure(infrastructure.filter((_, idx) => idx !== index));
  };

  const toggleDocumentLink = (id: string) => {
    if (linkedDocIds.includes(id)) {
      setLinkedDocIds(linkedDocIds.filter(docId => docId !== id));
    } else {
      setLinkedDocIds([...linkedDocIds, id]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleWizardSubmit = async () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload: Partial<Property> = {
      name,
      category,
      status,
      internalReferenceId: internalRef,
      description,
      tags,
      location,
      state,
      country,
      coordinates: { lat, lng },
      googleMapsLink,
      price,
      currency,
      totalSize,
      landTitle,
      approvalStatus,
      availableUnits,
      paymentPlans,
      allocationStatus,
      images: mediaList,
      nearbyLandmarks: landmarks,
      infrastructure,
      documents: linkedDocIds
    };

    await onSubmit(payload);
    onClose();
  };

  // Filter documents based on search
  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(docSearchQuery.toLowerCase()) || 
    doc.type.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl flex flex-col h-[90vh] shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-slate-50/50 rounded-t-2xl">
          <div>
            <span className="text-[9px] font-bold font-mono tracking-widest text-slate-400 uppercase">
              Step {step} of {totalSteps} — {initialProperty ? 'Editing Node' : 'Onboarding Portfolio Asset'}
            </span>
            <h2 className="text-md font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-600" />
              {step === 1 && 'Basic Asset Metadata'}
              {step === 2 && 'Geospatial Location Anchoring'}
              {step === 3 && 'Investment & Reference Metrics'}
              {step === 4 && 'Digital Media Assets Portfolio'}
              {step === 5 && 'Infrastructure & landmarks Profiles'}
              {step === 6 && 'Centralized Document Connections'}
              {step === 7 && 'Pre-Ledger Verification Review'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Progress bar */}
        <div className="w-full bg-slate-100 h-1 shrink-0 relative">
          <div 
            className="bg-indigo-600 h-1 absolute transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Form Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          
          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Property Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Oakwood Park & Gardens"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Internal Ref ID</label>
                  <input 
                    type="text" 
                    required 
                    value={internalRef}
                    onChange={(e) => setInternalRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  >
                    <option value="Residential Estate">Residential Estate</option>
                    <option value="Commercial">Commercial Mall / Office</option>
                    <option value="Industrial">Industrial Warehouse</option>
                    <option value="Land">Vacant Land Tract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Ledger Onboarding Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  >
                    <option value="Active">Active / Trading</option>
                    <option value="Pending">Pending Validation Audit</option>
                    <option value="Archived">Archived Node</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Detailed Prospectus Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide detailed spatial commentary, targeting customer demographics and strategic positioning of the property."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Workspace Search tags (Comma Separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Luxury, High Yield, Coastal Area, Perimeter Fencing"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                />
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Physical Office Location / Address</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. KM 48 Lekki-Epe Expressway, Ibeju-Lekki"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">City / District</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">State / Region</label>
                  <input 
                    type="text" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Country</label>
                  <input 
                    type="text" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">GIS Latitude Coordinate</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">GIS Longitude Coordinate</label>
                  <input 
                    type="number" 
                    step="0.000001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Google Maps Share Link / URL</label>
                <input 
                  type="url" 
                  placeholder="https://maps.google.com/..."
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 3: INVESTMENT INFO */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Unit Cost / Price Level</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. ₦35,000,000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Trading Currency</label>
                  <input 
                    type="text" 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Total Size (Hectares/Sqm)</label>
                  <input 
                    type="text" 
                    value={totalSize}
                    onChange={(e) => setTotalSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Land Title Document</label>
                  <input 
                    type="text" 
                    value={landTitle}
                    onChange={(e) => setLandTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Govt. Approval Status</label>
                  <input 
                    type="text" 
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Available Stock Units</label>
                  <input 
                    type="number" 
                    value={availableUnits}
                    onChange={(e) => setAvailableUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Instalment Payment Plans</label>
                  <input 
                    type="text" 
                    placeholder="3 Months, 6 Months..."
                    value={paymentPlans}
                    onChange={(e) => setPaymentPlans(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Physical Allocation Status</label>
                  <input 
                    type="text" 
                    value={allocationStatus}
                    onChange={(e) => setAllocationStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MEDIA */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="Paste asset illustration image URL..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs transition"
                />
                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add URL</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {mediaList.map((url, idx) => (
                  <div key={idx} className="relative border border-slate-200 rounded-xl overflow-hidden group bg-slate-50 h-32 flex items-center justify-center">
                    <img 
                      src={url} 
                      alt="Property Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/80 p-1.5 rounded-lg text-rose-400 hover:text-rose-500 cursor-pointer transition opacity-0 group-hover:opacity-100" onClick={() => handleRemoveMedia(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </div>
                    <span className="absolute bottom-2 left-2 bg-slate-900/85 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                      IMAGE #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: INFRASTRUCTURE & LANDMARKS */}
          {step === 5 && (
            <div className="space-y-5">
              
              {/* Landmark Addition Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono">Register Map Proximity Landmarks</div>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="text" 
                    placeholder="Landmark name (e.g. Shoprite)"
                    value={landmarkName}
                    onChange={(e) => setLandmarkName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Distance (e.g. 5 mins drive)"
                    value={landmarkDistance}
                    onChange={(e) => setLandmarkDistance(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <select 
                    value={landmarkType}
                    onChange={(e) => setLandmarkType(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Airport">Airport</option>
                    <option value="Expressway">Expressway</option>
                    <option value="School">School / College</option>
                    <option value="Mall">Mall / Shopping</option>
                    <option value="Hospital">Hospital / Clinic</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddLandmark}
                  className="inline-flex items-center space-x-1 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add Landmark Proximity Vector</span>
                </button>

                {landmarks.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {landmarks.map((l, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 font-semibold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        {l.name} ({l.type}) • {l.distance}
                        <X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-500 cursor-pointer shrink-0" onClick={() => handleRemoveLandmark(idx)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Infrastructure Addition Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest font-mono">Register On-site Infrastructure Elements</div>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Infrastructure Item (e.g. Transformer, Drainage)"
                    value={infraName}
                    onChange={(e) => setInfraName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <select 
                    value={infraStatus}
                    onChange={(e) => setInfraStatus(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Available">Available / Completed</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Planned">Planned / Future Provision</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddInfra}
                  className="inline-flex items-center space-x-1 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add Infrastructure Item</span>
                </button>

                {infrastructure.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {infrastructure.map((inf, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 font-semibold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        {inf.name} ({inf.status})
                        <X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-500 cursor-pointer shrink-0" onClick={() => handleRemoveInfra(idx)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 6: KNOWLEDGE CONNECTIONS */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search centralized company knowledge documents..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-450" />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                {filteredDocs.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    No knowledge documents found matching query...
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredDocs.map(doc => {
                      const isLinked = linkedDocIds.includes(doc.id);
                      return (
                        <div 
                          key={doc.id}
                          onClick={() => toggleDocumentLink(doc.id)}
                          className={`p-3 text-xs flex items-center justify-between cursor-pointer transition ${
                            isLinked ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 text-left">
                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{doc.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">{doc.type} • {doc.confidentiality}</p>
                            </div>
                          </div>
                          
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center border transition ${
                            isLinked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                            {isLinked && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 italic">
                Linking documents injects structured context into future AI-agent pipelines orchestrating studies or campaign copies for this property.
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs">
                
                {/* Section header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[9px] font-bold font-mono text-indigo-700 uppercase tracking-widest block">PROPERTY SPECIFICATIONS SHEET</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{name || 'Unnamed Property Node'}</h4>
                  </div>
                  <span className="font-mono text-indigo-600 font-bold bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-xs">
                    {internalRef}
                  </span>
                </div>

                {/* 2x2 grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Address Location</span>
                    <span className="text-slate-700 font-semibold mt-0.5 block">{location || 'Not Specified'}, {state}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Investment Cost</span>
                    <span className="text-slate-800 font-extrabold mt-0.5 block text-xs">{price}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Size / Land Title</span>
                    <span className="text-slate-700 font-semibold mt-0.5 block">{totalSize} • {landTitle}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Category / Available Units</span>
                    <span className="text-slate-700 font-semibold mt-0.5 block">{category} ({availableUnits} Units)</span>
                  </div>
                </div>

                {/* Vector metrics count row */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 text-center">
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="font-mono font-bold text-indigo-600 text-xs block">{mediaList.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">MEDIA ASSETS</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="font-mono font-bold text-indigo-600 text-xs block">{landmarks.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">MAP LANDMARKS</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl">
                    <span className="font-mono font-bold text-indigo-600 text-xs block">{linkedDocIds.length}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">LINKED DOCUMENTS</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">Spatial Commentary Preview</span>
                  <p className="text-slate-600 leading-relaxed italic bg-white p-3 border border-slate-150 rounded-xl">
                    "{description || 'No prospectus description provided. Ready for post-ledger onboarding edits.'}"
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 shrink-0 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Cancel Onboarding
          </button>

          <div className="flex items-center space-x-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleWizardSubmit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Onboard Ledger Node</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
