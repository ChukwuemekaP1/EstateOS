import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  MapPin, 
  Search, 
  Plus, 
  Compass, 
  Navigation, 
  ShieldAlert, 
  School, 
  Car, 
  ShoppingBag, 
  Building,
  Maximize2,
  Minimize2,
  CheckCircle,
  X
} from 'lucide-react';

interface LandmarkOnMap {
  name: string;
  type: 'Transportation' | 'Education' | 'Commercial' | 'Healthcare' | 'Infrastructure';
  distance: string;
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
}

interface PropertyMockMapProps {
  propertyName: string;
  propertyLocation: string;
  coordinates?: { lat: number; lng: number };
  onCoordinatePick?: (lat: number, lng: number) => void;
  landmarksList?: { name: string; distance: string; type: string }[];
  onAddLandmark?: (name: string, distance: string, type: string) => void;
}

export default function PropertyMockMap({
  propertyName = 'Bridgeview Court',
  propertyLocation = 'Lekki Phase 1, Lagos',
  coordinates = { lat: 6.4549, lng: 3.4246 },
  onCoordinatePick,
  landmarksList = [],
  onAddLandmark
}: PropertyMockMapProps) {
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite' | 'hybrid' | 'traffic'>('satellite');
  const [activeLayers, setActiveLayers] = useState<string[]>(['transport', 'education', 'commercial', 'healthcare']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapPoint, setSelectedMapPoint] = useState<{ x: number; y: number } | null>({ x: 50, y: 50 });
  const [currentLat, setCurrentLat] = useState(coordinates.lat);
  const [currentLng, setCurrentLng] = useState(coordinates.lng);
  
  // Custom Landmark Tooltip
  const [hoveredLandmark, setHoveredLandmark] = useState<LandmarkOnMap | null>(null);
  const [showAddLandmark, setShowAddLandmark] = useState(false);
  
  // New Landmark Form State
  const [newLName, setNewLName] = useState('');
  const [newLType, setNewLType] = useState<'Transportation' | 'Education' | 'Commercial' | 'Healthcare' | 'Infrastructure'>('Commercial');
  const [newLDistance, setNewLDistance] = useState('5 mins');

  // Hardcoded default landmark layout nodes
  const [mapLandmarks, setMapLandmarks] = useState<LandmarkOnMap[]>([
    { name: 'Admiralty Expressway Tolgate', type: 'Transportation', distance: '3 mins', x: 28, y: 35 },
    { name: 'Lekki British International School', type: 'Education', distance: '8 mins', x: 72, y: 18 },
    { name: 'The Palms Shopping Mall', type: 'Commercial', distance: '12 mins', x: 80, y: 65 },
    { name: 'Reddington Lagoon Hospital', type: 'Healthcare', distance: '6 mins', x: 15, y: 78 },
    { name: 'Chevron Headquarters Hub', type: 'Infrastructure', distance: '15 mins', x: 62, y: 82 }
  ]);

  // Sync external landmarks prop
  useEffect(() => {
    if (landmarksList && landmarksList.length > 0) {
      const formatted = landmarksList.map((l, i) => {
        // distribute them randomly in grid coordinates around center
        const angle = (i * 2 * Math.PI) / (landmarksList.length || 1);
        const radius = 25 + Math.random() * 15; // percentage distance
        const x = Math.min(95, Math.max(5, 50 + radius * Math.cos(angle)));
        const y = Math.min(95, Math.max(5, 50 + radius * Math.sin(angle)));
        return {
          name: l.name,
          type: (l.type === 'Airport' || l.type === 'Expressway' ? 'Transportation' :
                 l.type === 'School' || l.type === 'University' ? 'Education' :
                 l.type === 'Mall' || l.type === 'Market' ? 'Commercial' :
                 l.type === 'Hospital' ? 'Healthcare' : 'Infrastructure') as any,
          distance: l.distance,
          x,
          y
        };
      });
      setMapLandmarks(prev => {
        // filter out duplicates to keep state clean
        const names = new Set(formatted.map(f => f.name));
        return [...formatted, ...prev.filter(p => !names.has(p.name))];
      });
    }
  }, [landmarksList]);

  // Handle map click for coordinate selection
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSelectedMapPoint({ x, y });

    // Derive realistic coordinates relative to Delta / Lagos coordinates
    // offset math
    const latOffset = (50 - y) * 0.00035;
    const lngOffset = (x - 50) * 0.00045;
    const pickedLat = Number((coordinates.lat + latOffset).toFixed(5));
    const pickedLng = Number((coordinates.lng + lngOffset).toFixed(5));

    setCurrentLat(pickedLat);
    setCurrentLng(pickedLng);

    if (onCoordinatePick) {
      onCoordinatePick(pickedLat, pickedLng);
    }
  };

  // Toggle active layers
  const toggleLayer = (layer: string) => {
    if (activeLayers.includes(layer)) {
      setActiveLayers(activeLayers.filter(l => l !== layer));
    } else {
      setActiveLayers([...activeLayers, layer]);
    }
  };

  // Handle search query
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Simulate centring on a searched location
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    setCurrentLat(Number((coordinates.lat + latOffset).toFixed(5)));
    setCurrentLng(Number((coordinates.lng + lngOffset).toFixed(5)));
    setSelectedMapPoint({ x: 45 + Math.random() * 10, y: 45 + Math.random() * 10 });
    setSearchQuery('');
  };

  const handleAddLandmarkFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLName) return;

    const newL: LandmarkOnMap = {
      name: newLName,
      type: newLType,
      distance: newLDistance,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60
    };

    setMapLandmarks([...mapLandmarks, newL]);

    if (onAddLandmark) {
      onAddLandmark(newLName, newLDistance, newLType);
    }

    setNewLName('');
    setShowAddLandmark(false);
  };

  const getLandmarkIcon = (type: string) => {
    switch (type) {
      case 'Transportation': return <Car className="h-3 w-3 text-sky-500" />;
      case 'Education': return <School className="h-3 w-3 text-emerald-500" />;
      case 'Commercial': return <ShoppingBag className="h-3 w-3 text-amber-500" />;
      case 'Healthcare': return <Building className="h-3 w-3 text-rose-500" />;
      default: return <Compass className="h-3 w-3 text-indigo-500" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[550px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-white font-sans relative">
      
      {/* Map Side control panel */}
      <div className="w-full lg:w-72 bg-slate-950 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="h-5 w-5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">GIS Intelligence Canvas</span>
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded animate-pulse">
              ● STANDBY
            </span>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search map coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          </form>

          {/* Layer Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Map Layers</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['standard', 'satellite', 'hybrid', 'traffic'] as const).map(layer => (
                <button
                  key={layer}
                  onClick={() => setMapLayer(layer)}
                  className={`py-1 px-2 text-[10px] font-mono font-bold border rounded-lg text-left uppercase tracking-wider transition ${
                    mapLayer === layer 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* Vector Filters */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Vector Landmarks Layers</span>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => toggleLayer('transport')}
                className="w-full flex items-center justify-between p-1.5 hover:bg-slate-900 rounded-lg text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-sky-400" />
                  <span className="text-slate-300">Transportation Transit</span>
                </div>
                <input type="checkbox" checked={activeLayers.includes('transport')} readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 h-3 w-3" />
              </button>
              <button
                onClick={() => toggleLayer('education')}
                className="w-full flex items-center justify-between p-1.5 hover:bg-slate-900 rounded-lg text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">Academic & Schools</span>
                </div>
                <input type="checkbox" checked={activeLayers.includes('education')} readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 h-3 w-3" />
              </button>
              <button
                onClick={() => toggleLayer('commercial')}
                className="w-full flex items-center justify-between p-1.5 hover:bg-slate-900 rounded-lg text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300">Malls & Commercial</span>
                </div>
                <input type="checkbox" checked={activeLayers.includes('commercial')} readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 h-3 w-3" />
              </button>
              <button
                onClick={() => toggleLayer('healthcare')}
                className="w-full flex items-center justify-between p-1.5 hover:bg-slate-900 rounded-lg text-left"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="text-slate-300">Healthcare Facilities</span>
                </div>
                <input type="checkbox" checked={activeLayers.includes('healthcare')} readOnly className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Coordinate Details */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1">
            <span className="text-slate-500 uppercase block font-bold">Active Inspection Core</span>
            <div className="flex justify-between">
              <span className="text-slate-400">LAT:</span>
              <span className="text-white font-bold">{currentLat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">LNG:</span>
              <span className="text-white font-bold">{currentLng}</span>
            </div>
            <div className="pt-1 text-[9px] text-slate-500 italic">
              Click anywhere on the map to re-anchor coordinate system.
            </div>
          </div>

          <button
            onClick={() => setShowAddLandmark(true)}
            className="w-full flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-1.5 rounded-xl transition cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Map New Landmark</span>
          </button>
        </div>
      </div>

      {/* Map Interactive Canvas */}
      <div 
        onClick={handleMapClick}
        className="flex-1 bg-slate-950 relative overflow-hidden select-none cursor-crosshair group"
      >
        {/* Layer Background Mockups */}
        {mapLayer === 'satellite' && (
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25">
            {/* Visual satellite mockup elements */}
            <div className="absolute top-10 left-16 w-32 h-24 bg-teal-900/25 blur-3xl rounded-full" />
            <div className="absolute bottom-20 right-32 w-48 h-32 bg-emerald-900/20 blur-3xl rounded-full" />
            <div className="absolute top-1/2 left-2/3 w-36 h-36 bg-blue-900/20 blur-2xl rounded-full" />
            {/* Mock coastline/river drawing */}
            <svg className="absolute inset-0 h-full w-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <path d="M -50 400 Q 150 350 450 420 T 950 380 L 950 600 L -50 600 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              <path d="M 0 100 Q 200 150 400 50 T 800 200" fill="none" stroke="#334155" strokeWidth="6" strokeDasharray="5,15" />
            </svg>
          </div>
        )}

        {mapLayer === 'standard' && (
          <div className="absolute inset-0 bg-slate-900">
            {/* Light roads lines */}
            <svg className="absolute inset-0 h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="200" x2="1000" y2="200" stroke="white" strokeWidth="4" />
              <line x1="150" y1="0" x2="150" y2="1000" stroke="white" strokeWidth="3" />
              <line x1="500" y1="0" x2="500" y2="1000" stroke="white" strokeWidth="6" />
              <line x1="0" y1="420" x2="1000" y2="420" stroke="white" strokeWidth="8" />
              <circle cx="500" cy="420" r="16" fill="none" stroke="white" strokeWidth="3" />
            </svg>
          </div>
        )}

        {mapLayer === 'hybrid' && (
          <div className="absolute inset-0 bg-[#020617] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40">
            <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 420 Q 250 300 500 420 T 1000 420" fill="none" stroke="#2563eb" strokeWidth="4" />
              <circle cx="500" cy="420" r="12" fill="#2563eb" fillOpacity="0.2" stroke="#60a5fa" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {mapLayer === 'traffic' && (
          <div className="absolute inset-0 bg-slate-950">
            {/* Green and red glowing routes */}
            <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="200" x2="1000" y2="200" stroke="#10b981" strokeWidth="4" />
              <line x1="150" y1="0" x2="150" y2="1000" stroke="#ef4444" strokeWidth="3" strokeDasharray="10,5" />
              <line x1="500" y1="0" x2="500" y2="1000" stroke="#10b981" strokeWidth="5" />
              <line x1="0" y1="420" x2="1000" y2="420" stroke="#f59e0b" strokeWidth="6" />
            </svg>
            {/* Radar scan lines */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(99,102,241,0.05)_50%)] bg-[size:100%_4px] pointer-events-none" />
          </div>
        )}

        {/* Radar concentric target circles around center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-48 w-48 rounded-full border border-indigo-500/10 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="h-96 w-96 rounded-full border border-indigo-500/5 absolute" />
          <div className="h-[500px] w-[500px] rounded-full border border-indigo-500/5 absolute" />
        </div>

        {/* GIS Compass Grid Lines overlay */}
        <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 font-mono text-[9px] text-slate-400 pointer-events-none">
          GIS MATRIX CORE • ZONE 31N
        </div>

        {/* MAP MARKERS */}
        
        {/* Landmarks Markers */}
        {mapLandmarks.map((lm, idx) => {
          // check if type filter is active
          const isFiltered = 
            (lm.type === 'Transportation' && activeLayers.includes('transport')) ||
            (lm.type === 'Education' && activeLayers.includes('education')) ||
            (lm.type === 'Commercial' && activeLayers.includes('commercial')) ||
            (lm.type === 'Healthcare' && activeLayers.includes('healthcare')) ||
            (lm.type === 'Infrastructure' && activeLayers.includes('healthcare') || lm.type === 'Infrastructure');

          if (!isFiltered) return null;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredLandmark(lm)}
              onMouseLeave={() => setHoveredLandmark(null)}
              onClick={(e) => e.stopPropagation()} // prevent centering
              style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 p-1.5 bg-slate-900 border border-slate-700 hover:border-white rounded-full shadow-lg transition transform hover:scale-125 cursor-pointer z-20"
            >
              {getLandmarkIcon(lm.type)}
            </div>
          );
        })}

        {/* Active Selected Anchor Marker */}
        {selectedMapPoint && (
          <div 
            style={{ left: `${selectedMapPoint.x}%`, top: `${selectedMapPoint.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30 transition-all duration-300"
          >
            {/* Glowing locator aura */}
            <div className="absolute h-10 w-10 bg-indigo-500/25 rounded-full animate-ping pointer-events-none" />
            <div className="p-2 bg-indigo-600 text-white rounded-full shadow-xl border-2 border-white transform scale-110">
              <MapPin className="h-4 w-4" />
            </div>
            
            {/* Custom Label Card */}
            <div className="mt-1 bg-slate-950/90 backdrop-blur-xs border border-slate-800 px-2 py-1 rounded shadow-lg text-center min-w-[120px]">
              <span className="text-[10px] font-bold block truncate max-w-[110px] text-indigo-400">{propertyName}</span>
              <span className="text-[8px] text-slate-400 block font-mono font-bold">GPS: {currentLat}, {currentLng}</span>
            </div>
          </div>
        )}

        {/* Floating Tooltip Hover */}
        {hoveredLandmark && (
          <div 
            style={{ left: `${hoveredLandmark.x}%`, top: `${hoveredLandmark.y - 8}%` }}
            className="absolute -translate-x-1/2 -translate-y-full bg-slate-950 border border-slate-800 p-2 rounded-xl shadow-2xl min-w-[160px] pointer-events-none z-40 animate-fade-in"
          >
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-bold text-slate-300 uppercase font-mono tracking-wider">{hoveredLandmark.type}</span>
            </div>
            <h5 className="text-xs font-bold text-white mt-0.5 leading-tight">{hoveredLandmark.name}</h5>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800 text-[10px] text-indigo-400 font-mono">
              <span>PROXIMITY:</span>
              <span className="font-bold">{hoveredLandmark.distance}</span>
            </div>
          </div>
        )}

        {/* Satellite Map coordinate grid overlay */}
        <div className="absolute bottom-3 right-3 text-right bg-slate-950/75 backdrop-blur-xs border border-slate-800 p-2 rounded-lg font-mono text-[9px] text-slate-400 pointer-events-none space-y-0.5">
          <div>LOC: {propertyLocation}</div>
          <div>BEARING: 184.2° SSE</div>
          <div>COORDS: {currentLat}° N, {currentLng}° E</div>
        </div>
      </div>

      {/* Add Landmark Modal */}
      {showAddLandmark && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Map New Landmark Node</h4>
              <button onClick={() => setShowAddLandmark(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddLandmarkFormSubmit} className="space-y-3 text-xs text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Landmark Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lekki International Airport"
                  value={newLName}
                  onChange={(e) => setNewLName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vector Category</label>
                  <select
                    value={newLType}
                    onChange={(e) => setNewLType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Education">Education</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Travel Distance</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 mins drive"
                    value={newLDistance}
                    onChange={(e) => setNewLDistance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl transition cursor-pointer text-center"
              >
                Register Vector Landmark
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
