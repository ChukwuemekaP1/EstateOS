import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Video, 
  Plus, 
  Trash2, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Mail, 
  BookOpen, 
  MessageSquare,
  Building2,
  FileText,
  Search,
  Sparkles,
  CheckCircle,
  Eye
} from 'lucide-react';
import { ContentAsset, ContentPlatform, Property } from '../types';

interface ContentStudioViewProps {
  contentAssets: ContentAsset[];
  properties: Property[];
  onCreateContent: (content: Partial<ContentAsset>) => Promise<void>;
  onDeleteContent?: (id: string) => Promise<void>;
}

export default function ContentStudioView({
  contentAssets,
  properties,
  onCreateContent,
  onDeleteContent
}: ContentStudioViewProps) {
  const [activePlatform, setActivePlatform] = useState<ContentPlatform | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<ContentPlatform>('LinkedIn');
  const [body, setBody] = useState('');
  const [propertyId, setPropertyId] = useState('');

  // Filter lists
  const filteredAssets = contentAssets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || asset.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = activePlatform === 'All' || asset.platform === activePlatform;
    return matchesSearch && matchesPlatform;
  });

  // Handle post composition
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body || !propertyId) return;

    await onCreateContent({
      title,
      platform,
      body,
      propertyId,
      format: 'DOCX'
    });

    setShowModal(false);
    setTitle('');
    setBody('');
    setPropertyId('');
  };

  // Helper to retrieve platform icon
  const getPlatformIcon = (plat: ContentPlatform) => {
    switch (plat) {
      case 'LinkedIn':
        return <Linkedin className="h-4 w-4" />;
      case 'Instagram':
        return <Instagram className="h-4 w-4" />;
      case 'Facebook':
        return <Facebook className="h-4 w-4" />;
      case 'YouTube':
        return <Youtube className="h-4 w-4" />;
      case 'Email':
        return <Mail className="h-4 w-4" />;
      case 'Blog':
        return <BookOpen className="h-4 w-4" />;
      case 'TikTok':
      case 'WhatsApp':
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const platformsList: Array<ContentPlatform | 'All'> = [
    'All', 'LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'YouTube', 'Email', 'Blog', 'WhatsApp'
  ];

  return (
    <div className="space-y-6 text-slate-800 p-6 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Video className="h-6 w-6 text-indigo-600" />
            Marketing Content Studio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compose and catalog platform marketing assets associated with target properties, prepared for future automated social scheduling campaigns.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setBody('');
            setPropertyId(properties[0]?.id || '');
            setShowModal(true);
          }}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-md shadow-indigo-600/10 cursor-pointer animate-fade-in"
        >
          <Plus className="h-4 w-4" />
          <span>Draft Content Post</span>
        </button>
      </div>

      {/* Platform channels filters bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        {platformsList.map(p => (
          <button
            key={p}
            onClick={() => setActivePlatform(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
              activePlatform === p 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {p !== 'All' && getPlatformIcon(p as ContentPlatform)}
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Empty State vs Draft list */}
      {filteredAssets.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl max-w-2xl mx-auto shadow-sm">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mx-auto mb-4">
            <Video className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No content assets in category</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Begin by drafting your first copy. This establishing outline files which targeting future AI social-pipeline orchestrators.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Compose Draft Copy</span>
          </button>
        </div>
      ) : (
        /* Channels Posts Board */
        <div className="space-y-4">
          {/* Quick search */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
              <input
                type="text"
                placeholder="Search copy text or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-700 transition shadow-sm"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map(asset => (
              <div 
                key={asset.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between h-[230px] text-left hover:border-slate-300 shadow-sm hover:shadow-md transition duration-300 relative"
              >
                <div>
                  {/* Channel tag */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Campaign Asset
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {getPlatformIcon(asset.platform)}
                      <span>{asset.platform}</span>
                    </span>
                  </div>

                  {/* Title and preview */}
                  <h3 className="text-sm font-bold text-slate-900 truncate">{asset.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-4 leading-relaxed font-sans">
                    {asset.body}
                  </p>
                </div>

                {/* Footer and link property */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-3">
                  <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                    <Building2 className="h-3 w-3 text-slate-450 shrink-0" />
                    <span className="truncate max-w-[120px]" title={asset.propertyName}>
                      {asset.propertyName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => alert(`Previewing platform layout post copy for ${asset.platform}`)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition cursor-pointer"
                      title="Preview layout"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => alert(`Exporting copy text template...`)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition cursor-pointer"
                      title="Copy text"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Composition Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600" />
                Draft platform copy
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800 transition cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Post Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm transition"
                  placeholder="e.g. Launching Bridgeview Court"
                />
              </div>

              {/* Grid: Channel and Property link */}
              <div className="grid grid-cols-2 gap-4">
                {/* Platform select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Target Channel</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm transition"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Email">Email News</option>
                    <option value="Blog">Blog post</option>
                    <option value="WhatsApp">WhatsApp Broadcast</option>
                  </select>
                </div>

                {/* Property select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Target Property</label>
                  <select
                    required
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm transition"
                  >
                    <option value="" disabled>-- Select property --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Post Body Copy */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 font-mono uppercase mb-1">Post Copy Body</label>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm transition font-sans"
                  placeholder="Enter compelling, professional copy narrative..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Register Draft
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
