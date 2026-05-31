'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Camera, Plus, Send, 
  RefreshCw, Upload, Sliders, X, 
  MessageSquare, Clock
} from 'lucide-react';

const formatPrice = (p: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(p);
};

// -------------------------------------------------------------
// MOCK DATA STRUCTURES
// -------------------------------------------------------------

interface GearItem {
  id: string;
  _id?: string;
  name: string;
  category: 'camera' | 'lens' | 'lighting' | 'audio';
  image: string;
  buyPrice: number;
  rentRate: number; // per day
}

// Static fallback used only if API fails before first render
const FALLBACK_INVENTORY: GearItem[] = [
  { id: 'cam-fx3', name: 'Sony FX3 Cinema Camera', category: 'camera', image: '/assets/product-camera.png', buyPrice: 295000, rentRate: 2500 },
  { id: 'cam-a7iv', name: 'Sony Alpha 7 IV Mirrorless', category: 'camera', image: '/assets/product-camera.png', buyPrice: 198000, rentRate: 1600 },
  { id: 'lens-85gm', name: 'Sony FE 85mm f/1.4 GM', category: 'lens', image: '/assets/product-lens.png', buyPrice: 145000, rentRate: 1100 },
  { id: 'lens-2470gm', name: 'Sony FE 24-70mm f/2.8 GM II', category: 'lens', image: '/assets/product-lens.png', buyPrice: 199000, rentRate: 1400 },
  { id: 'light-godox', name: 'Godox SZ150R Zoom RGB LED', category: 'lighting', image: '/assets/product-drone.png', buyPrice: 48000, rentRate: 500 },
  { id: 'light-aputure', name: 'Aputure LS 600d Pro Light', category: 'lighting', image: '/assets/product-drone.png', buyPrice: 185000, rentRate: 1800 },
  { id: 'audio-rodewp', name: 'Rode Wireless PRO Mic System', category: 'audio', image: '/assets/product-camera.png', buyPrice: 38000, rentRate: 400 },
  { id: 'audio-ntg5', name: 'Rode NTG5 Shotgun Mic Kit', category: 'audio', image: '/assets/product-camera.png', buyPrice: 42000, rentRate: 450 },
];

interface BarterListing {
  id: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRating: number;
  offeredService: string;
  requestedGear: string;
  duration: string;
  status: 'active' | 'accepted' | 'countered';
  counterProposal?: string;
}

const INITIAL_BARTER_LISTINGS: BarterListing[] = [];

// -------------------------------------------------------------
// CORE PAGE COMPONENT
// -------------------------------------------------------------

export default function CreatorStudioPage() {
  const [activeTab, setActiveTab] = useState<'concierge' | 'barter' | 'garage'>('concierge');
  
  // States for Feature 1: RV Bot (Manual Settings Guide)
  const [rvPrompt, setRvPrompt] = useState('');
  const [rvLoading, setRvLoading] = useState(false);
  const [rvLogs, setRvLogs] = useState<string[]>([]);
  const [rvResult, setRvResult] = useState<{
    name: string;
    description: string;
    settings: {
      iso: string;
      shutter: string;
      aperture: string;
      whiteBalance: string;
      focus: string;
    };
    steps?: string[];
    tips?: string[];
  } | null>(null);

  // Inventory loaded from API
  const [INVENTORY, setInventory] = useState<GearItem[]>(FALLBACK_INVENTORY);

  // States for Feature 2: Barter Board
  const [barterListings, setBarterListings] = useState<BarterListing[]>(INITIAL_BARTER_LISTINGS);
  const [counterInput, setCounterInput] = useState('');
  const [activeCounterId, setActiveCounterId] = useState<string | null>(null);
  const [chattingListingId, setChattingListingId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<Record<string, string[]>>({});

  // States for Feature 3: Creator's Garage
  const [garageItems, setGarageItems] = useState<GearItem[]>([]);
  const [rentToggle, setRentToggle] = useState(true); // true = Rent for 1 Week, false = Buy Outright

  // ── Fetch gear inventory and barter listings from API ──
  useEffect(() => {
    const loadGear = async () => {
      try {
        const res = await fetch('/api/studio/gear');
        if (res.ok) {
          const data: GearItem[] = await res.json();
          if (data.length > 0) {
            // Normalize _id to id for compatibility
            const normalized = data.map(g => ({ ...g, id: g.id || g._id || '' }));
            setInventory(normalized);
            setGarageItems([normalized[0], normalized[2]].filter(Boolean));
          }
        }
      } catch (err) {
        console.warn('[Studio] Gear API unavailable, using fallback:', err);
        setGarageItems([FALLBACK_INVENTORY[0], FALLBACK_INVENTORY[2]]);
      }
    };

    const loadBarter = async () => {
      try {
        const res = await fetch('/api/studio/barter');
        if (res.ok) {
          const data: BarterListing[] = await res.json();
          if (data.length > 0) {
            setBarterListings(data.map(b => ({ ...b, id: b.id || (b as { _id?: string })._id || '' })));
          }
        }
      } catch (err) {
        console.warn('[Studio] Barter API unavailable:', err);
      }
    };

    loadGear();
    loadBarter();
  }, []);

  // Action to send DP Concierge items into the Garage setup builder
  const handleSendToGarage = (items: GearItem[]) => {
    setGarageItems(items);
    setActiveTab('garage');
    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: { 
        type: 'push', 
        title: '🛠️ Garage Loaded!', 
        content: `DP Concierge bundle has been loaded onto your Garage canvas.` 
      }
    }));
  };

  // -------------------------------------------------------------
  // LOGIC & TIMERS SIMULATION
  // -------------------------------------------------------------

  // Run RV Bot via backend API
  const handleRvBot = async () => {
    if (!rvPrompt.trim()) return;
    setRvLoading(true);
    setRvResult(null);
    setRvLogs([]);

    const logSequence = [
      'Tokenizing photography type description...',
      'Calculating required shutter and aperture rules...',
      'Optimizing ISO and white balance recommendations...',
      'Finalizing manual camera settings...'
    ];

    logSequence.forEach((log, index) => {
      setTimeout(() => {
        setRvLogs(prev => [...prev, `[RV Bot]: ${log}`]);
      }, (index + 1) * 400);
    });

    try {
      const res = await fetch('/api/studio/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: rvPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setRvResult(data);
          setRvLoading(false);
        }, logSequence.length * 400 + 500);
      } else {
        setRvLogs(prev => [...prev, '[error]: RV Bot API returned an error.']);
        setRvLoading(false);
      }
    } catch (err) {
      console.warn('[Studio] RV Bot API failed:', err);
      setRvLoading(false);
    }
  };

  // Toggle garage items
  const toggleGarageItem = (item: GearItem) => {
    setGarageItems(prev =>
      prev.some(x => x.id === item.id) ? prev.filter(x => x.id !== item.id) : [...prev, item]
    );
  };

  // Calculate Garage Totals
  const garageBuyTotal = garageItems.reduce((sum, item) => sum + item.buyPrice, 0);
  const garageRentTotal = garageItems.reduce((sum, item) => sum + item.rentRate, 0) * 7; // 1 week

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Hub Header */}
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-[#FFDA03]/10 text-[#FFDA03] text-xs font-bold uppercase tracking-widest rounded-full border border-[#FFDA03]/20">
            Nira Creator Sandbox
          </span>
          <h1 className="font-heading font-black text-4xl lg:text-5xl mt-3 text-white">
            CREATOR <span className="text-[#FFDA03]">STUDIO</span>
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mt-2">
            Accelerate your productions with natural language AI concierges, visual grading engines, bartering marketplaces, and visual setups.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 border-b border-neutral-900 pb-6">
          {(
            [
              { id: 'concierge', label: 'RV Bot', icon: Sparkles },
              { id: 'barter', label: 'Barter Board', icon: RefreshCw },
              { id: 'garage', label: 'Creators Garage', icon: Camera },
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-[#FFDA03] text-neutral-950 border-[#FFDA03] shadow-lg shadow-[#FFDA03]/10' 
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tabs Content Wrapper */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* TAB 1: RV BOT */}
          {activeTab === 'concierge' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-neutral-900/50 border border-neutral-900 p-6 md:p-8 rounded-3xl backdrop-blur-md">
                  <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-[#FFDA03]" /> RV - Your Photography Assistant
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                    Tell RV what kind of photography you are shooting, and get precise manual camera settings instantly.
                  </p>

                  {/* Suggestion Prompts */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {[
                      'Star trails and astrophotography',
                      'Slow shutter waterfall',
                      'High-speed sports photography',
                      'Macro close up photography'
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setRvPrompt(p)}
                        className="text-[10px] text-left px-3 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:text-white text-neutral-400 rounded-lg transition-colors cursor-pointer"
                      >
                        &ldquo;{p}&rdquo;
                      </button>
                    ))}
                  </div>



                  <div className="relative mb-5">
                    <textarea
                      value={rvPrompt}
                      onChange={(e) => setRvPrompt(e.target.value)}
                      placeholder='e.g., "Shooting a slow shutter waterfall..."'
                      rows={4}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm text-neutral-200 focus:outline-none focus:border-[#FFDA03] transition-all resize-none font-sans"
                    />
                  </div>

                  <button
                    disabled={rvLoading || !rvPrompt.trim()}
                    onClick={handleRvBot}
                    className="w-full py-4 bg-[#FFDA03] hover:bg-[#FFDA03]/90 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {rvLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Settings...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Get Camera Settings
                      </>
                    )}
                  </button>
                </div>

                {/* Console Logs Output */}
                {(rvLoading || rvLogs.length > 0) && (
                  <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-neutral-500 h-44 overflow-y-auto">
                    <div className="text-neutral-400 border-b border-neutral-900 pb-2 mb-2 flex justify-between items-center">
                      <span>RV Bot Logs</span>
                      {rvLoading && <span className="w-1.5 h-1.5 bg-[#FFDA03] rounded-full animate-ping" />}
                    </div>
                    {rvLogs.map((log, i) => (
                      <div key={i} className="mb-1">
                        <span className="text-[#FFDA03]/60 mr-2">{'>'}</span>{log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Settings Result Section */}
              <div className="lg:col-span-5">
                <AnimatePresence mode="wait">
                  {rvResult ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-neutral-900/50 border border-neutral-900 p-6 rounded-3xl backdrop-blur-md h-full flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-4">
                          <div>
                            <span className="text-[9px] font-black uppercase text-[#FFDA03] bg-[#FFDA03]/10 px-2 py-0.5 rounded border border-[#FFDA03]/25">
                              Recommended Settings
                            </span>
                            <h4 className="font-heading font-black text-lg text-white mt-1">
                              {rvResult.name}
                            </h4>
                            <p className="text-xs text-neutral-400 mt-2">{rvResult.description}</p>
                          </div>
                          <Camera className="w-5 h-5 text-neutral-500" />
                        </div>

                        {/* Camera Settings Details */}
                        <div className="space-y-3.5 mb-6">
                          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Shutter Speed</span>
                              <span className="font-black text-[#FFDA03] text-sm">{rvResult.settings.shutter}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">Aperture</span>
                              <span className="font-black text-white text-sm">{rvResult.settings.aperture}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-neutral-400 font-bold uppercase tracking-widest text-[10px]">ISO</span>
                              <span className="font-black text-white text-sm">{rvResult.settings.iso}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-neutral-800 pt-3">
                              <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">White Balance</span>
                              <span className="font-bold text-neutral-300 text-xs">{rvResult.settings.whiteBalance}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Focus Mode</span>
                              <span className="font-bold text-neutral-300 text-xs">{rvResult.settings.focus}</span>
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Procedure */}
                        {rvResult.steps && rvResult.steps.length > 0 && (
                          <div className="mt-2 border-t border-neutral-800 pt-4">
                            <span className="text-[10px] font-black uppercase text-neutral-400 block mb-3 tracking-widest">
                              Shooting Procedure
                            </span>
                            <div className="space-y-2.5">
                              {rvResult.steps.map((step, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.15 + 0.3 }}
                                  className="flex items-start gap-3 bg-neutral-950/80 p-3 rounded-lg border border-neutral-900"
                                >
                                  <div className="bg-[#FFDA03]/10 text-[#FFDA03] text-[9px] font-black w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full mt-0.5 border border-[#FFDA03]/20">
                                    {idx + 1}
                                  </div>
                                  <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                                    {step}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pro Tips */}
                        {rvResult.tips && rvResult.tips.length > 0 && (
                          <div className="mt-4 border-t border-neutral-800 pt-4">
                            <span className="text-[10px] font-black uppercase text-[#FFDA03] block mb-3 tracking-widest flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> Pro Tips
                            </span>
                            <div className="space-y-2.5">
                              {rvResult.tips.map((tip, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.15 + 0.5 }}
                                  className="flex items-start gap-2 text-xs text-neutral-400 leading-relaxed bg-neutral-900/40 p-2.5 rounded border border-neutral-800/50"
                                >
                                  <span className="text-[#FFDA03] mt-0.5">•</span>
                                  {tip}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-neutral-900/10 border border-dashed border-neutral-800 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center text-neutral-500 min-h-[300px]">
                      <Sparkles className="w-10 h-10 text-neutral-700 mb-3 animate-pulse" />
                      <p className="text-xs font-bold text-neutral-400">Waiting for Input</p>
                      <p className="text-[10px] text-neutral-500 max-w-xs mt-1">
                        Select a prompt or describe your shot to get manual settings from RV.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BARTER BOARD */}
          {activeTab === 'barter' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Barter Listings Matrix */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[#FFDA03]" /> Creative Barter Board
                  </h3>
                  <span className="text-[10px] text-neutral-500 font-bold bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                    Peer-to-Peer Trades
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {barterListings.map(listing => (
                    <div 
                      key={listing.id}
                      className="bg-neutral-900/50 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between hover:border-neutral-800 transition-all backdrop-blur-sm relative"
                    >
                      {listing.status === 'accepted' && (
                        <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          ✓ Trade Sealed
                        </div>
                      )}
                      {listing.status === 'countered' && (
                        <div className="absolute top-3 right-3 bg-[#FFDA03]/10 text-[#FFDA03] border border-[#FFDA03]/25 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          ⚠ Counter Offered
                        </div>
                      )}

                      <div>
                        {/* Profile Header */}
                        <div className="flex items-center gap-2.5 mb-4">
                          <Image src={listing.creatorAvatar} alt={listing.creatorName} width={32} height={32} unoptimized className="w-8 h-8 rounded-full border border-neutral-800 object-cover" />
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{listing.creatorName}</p>
                            <p className="text-[9px] text-neutral-400">Rating: {listing.creatorRating} ★</p>
                          </div>
                        </div>

                        {/* Trade Specifications */}
                        <div className="space-y-3 mb-5">
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-900">
                            <span className="text-[8px] font-black text-[#FFDA03] uppercase tracking-wider block mb-0.5">Offered Service</span>
                            <p className="text-xs text-neutral-200 font-medium leading-relaxed">{listing.offeredService}</p>
                          </div>
                          
                          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-900">
                            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-wider block mb-0.5">Requested Gear</span>
                            <p className="text-xs text-neutral-200 font-medium leading-relaxed">{listing.requestedGear}</p>
                            <span className="text-[8px] font-bold text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                              Duration: {listing.duration}
                            </span>
                          </div>

                          {listing.counterProposal && (
                            <div className="bg-[#FFDA03]/5 p-2.5 rounded-xl border border-[#FFDA03]/15">
                              <span className="text-[8px] font-black text-[#FFDA03] uppercase tracking-wider block mb-0.5">Counter Proposal</span>
                              <p className="text-xs text-neutral-300 font-medium leading-relaxed italic">&ldquo;{listing.counterProposal}&rdquo;</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 border-t border-neutral-800/60 pt-3">
                        {listing.status === 'active' ? (
                          <>
                            <button
                              onClick={() => {
                                setBarterListings(prev => prev.map(b => b.id === listing.id ? { ...b, status: 'accepted' } : b));
                                window.dispatchEvent(new CustomEvent('nira_notification', {
                                  detail: { type: 'push', title: '🤝 Trade Accepted!', content: `You accepted ${listing.creatorName}'s barter request.` }
                                }));
                              }}
                              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                setActiveCounterId(listing.id);
                                setCounterInput('');
                              }}
                              className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[10px] rounded-lg transition-colors cursor-pointer border border-neutral-700 text-center"
                            >
                              Counter
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 text-center py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-bold text-neutral-500">
                            Listing Locked
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setChattingListingId(listing.id);
                          }}
                          className="px-2.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-[#FFDA03] font-bold text-[10px] rounded-lg transition-colors border border-neutral-800 flex items-center justify-center cursor-pointer"
                          aria-label="Message creator"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Interaction Modals / Chat Console overlay */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Counter Offer Box */}
                <AnimatePresence>
                  {activeCounterId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bg-neutral-900/50 border border-[#FFDA03]/30 p-6 rounded-2xl backdrop-blur-md relative"
                    >
                      <button aria-label="Button" title="Button" 
                        onClick={() => setActiveCounterId(null)}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider mb-2">
                        Submit Counter Proposal
                      </h4>
                      <p className="text-[10px] text-neutral-400 mb-4">
                        Suggest changes in service duration, task counts, or additional edits to match values.
                      </p>

                      <textarea
                        value={counterInput}
                        onChange={(e) => setCounterInput(e.target.value)}
                        placeholder="e.g. 'I can offer 12 hours of color grading but need the camera for 4 days instead of 3 days...'"
                        rows={3}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-[#FFDA03] transition-all resize-none font-sans mb-4"
                      />

                      <button
                        onClick={() => {
                          if (!counterInput.trim()) return;
                          setBarterListings(prev => prev.map(b => b.id === activeCounterId ? { ...b, status: 'countered', counterProposal: counterInput } : b));
                          setActiveCounterId(null);
                          window.dispatchEvent(new CustomEvent('nira_notification', {
                            detail: { type: 'push', title: '⚡ Counter Submitted!', content: 'Creator has been notified of your counter-proposal.' }
                          }));
                        }}
                        className="w-full py-2.5 bg-[#FFDA03] hover:bg-[#FFDA03]/90 text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                      >
                        Send Counter Proposal
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chat Panel console */}
                <AnimatePresence>
                  {chattingListingId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bg-neutral-900/50 border border-neutral-900 p-6 rounded-2xl backdrop-blur-md relative h-96 flex flex-col justify-between"
                    >
                      <button aria-label="Button" title="Button" 
                        onClick={() => setChattingListingId(null)}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* Chat Header */}
                      <div className="border-b border-neutral-800 pb-3">
                        <h4 className="font-heading font-black text-xs text-white uppercase tracking-wider">
                          Creator Chatroom
                        </h4>
                        <p className="text-[9px] text-neutral-400 mt-0.5">
                          Discussing barter proposal #{chattingListingId}
                        </p>
                      </div>

                      {/* Chat Messages Logs */}
                      <div className="flex-1 overflow-y-auto py-4 space-y-3 font-sans text-xs">
                        <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-900 text-neutral-400 max-w-[85%] self-start">
                          Hi there! Let me know if you have any questions about my portfolio or standard grading turnaround.
                        </div>
                        
                        {(chatLogs[chattingListingId] || []).map((msg, i) => (
                          <div key={i} className="bg-[#FFDA03]/10 p-2.5 rounded-xl border border-[#FFDA03]/15 text-neutral-200 max-w-[85%] ml-auto text-right">
                            {msg}
                          </div>
                        ))}
                      </div>

                      {/* Input controls */}
                      <div className="flex gap-2 border-t border-neutral-800 pt-3">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && chatMessage.trim()) {
                              const listId = chattingListingId;
                              setChatLogs(prev => ({
                                ...prev,
                                [listId]: [...(prev[listId] || []), chatMessage.trim()]
                              }));
                              setChatMessage('');
                            }
                          }}
                          placeholder="Type response message..."
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#FFDA03] text-neutral-200"
                        />
                        <button aria-label="Button" title="Button"
                          onClick={() => {
                            if (!chatMessage.trim()) return;
                            const listId = chattingListingId;
                            setChatLogs(prev => ({
                              ...prev,
                              [listId]: [...(prev[listId] || []), chatMessage.trim()]
                            }));
                            setChatMessage('');
                          }}
                          className="px-3 bg-[#FFDA03] hover:bg-[#FFDA03]/90 text-neutral-950 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty State Instructions */}
                {!activeCounterId && !chattingListingId && (
                  <div className="bg-neutral-900/10 border border-dashed border-neutral-800 rounded-2xl p-6 text-center text-neutral-500">
                    <MessageSquare className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-neutral-400">Interaction Terminal</p>
                    <p className="text-[9px] text-neutral-500 max-w-[200px] mx-auto mt-0.5">
                      Accept, counter, or message listings to initiate discussions.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}



          {/* TAB 4: CREATOR'S GARAGE CANVAS */}
          {activeTab === 'garage' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Gear Selection Dock */}
              <div className="lg:col-span-5 bg-neutral-900/50 border border-neutral-900 p-6 rounded-3xl backdrop-blur-md">
                <div className="mb-6">
                  <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#FFDA03]" /> Equipment Dock
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Select the equipment models to place inside your visual canvas slot grid.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {INVENTORY.map(item => {
                    const isAdded = garageItems.some(x => x.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleGarageItem(item)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-neutral-950 border-[#FFDA03] text-white shadow-sm shadow-[#FFDA03]/5'
                            : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="w-10 h-10 relative bg-neutral-900 rounded-lg p-1.5 flex items-center justify-center">
                          <Image src={item.image} alt={item.name} width={40} height={40} unoptimized className="object-contain max-h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[10px] font-bold truncate leading-snug">{item.name.replace('Sony ', '')}</h5>
                          <span className="text-[8px] font-bold text-neutral-500 uppercase">{item.category}</span>
                          <p className="text-[9px] text-[#FFDA03] font-bold mt-0.5">{formatPrice(item.rentRate)}/d</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Visual Setup Builder Canvas */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-neutral-900/50 border border-neutral-900 p-6 md:p-8 rounded-3xl backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                    <div>
                      <h4 className="font-heading font-black text-base text-white uppercase tracking-wider flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#FFDA03]" /> Creator&apos;s Garage Setup Canvas
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Build your custom workspace. Pricing updates instantly below.
                      </p>
                    </div>
                    <span className="text-[10px] bg-neutral-950 text-[#FFDA03] border border-neutral-800 px-3 py-1 rounded-full font-bold">
                      {garageItems.length} active slots
                    </span>
                  </div>

                  {/* Virtual Grid Canvas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-950/80 p-5 rounded-2xl border border-neutral-900 min-h-[160px] items-center justify-center">
                    {garageItems.length > 0 ? (
                      garageItems.map(item => (
                        <div 
                          key={item.id}
                          className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex flex-col items-center justify-between text-center relative group"
                        >
                          <button
                            onClick={() => toggleGarageItem(item)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                          <div className="w-14 h-14 relative bg-neutral-950 rounded-lg p-2 mb-2 flex items-center justify-center">
                            <Image src={item.image} alt={item.name} width={56} height={56} unoptimized className="object-contain max-h-full" />
                          </div>
                          <p className="text-[9px] font-bold text-white truncate w-full">{item.name.replace('Sony ', '')}</p>
                          <span className="text-[8px] text-neutral-500 capitalize">{item.category}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-4 text-center py-8 text-neutral-500">
                        <Camera className="w-8 h-8 text-neutral-700 mx-auto mb-2 animate-pulse" />
                        <p className="text-[10px] font-bold text-neutral-400">Canvas Slots Empty</p>
                        <p className="text-[8px] text-neutral-500 mt-0.5">Select equipment from the dock to deploy them on canvas.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Checkout Section */}
                <div className="mt-8 border-t border-neutral-800 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Dual Pricing Toggle Slider */}
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold transition-all ${!rentToggle ? 'text-white' : 'text-neutral-500'}`}>Buy Outright</span>
                      <button
                        onClick={() => setRentToggle(!rentToggle)}
                        className="w-12 h-6 bg-neutral-800 rounded-full p-1 transition-all relative flex items-center border border-neutral-700 cursor-pointer"
                        aria-label="Toggle buy or rent pricing"
                      >
                        <motion.div
                          layout
                          className="w-4 h-4 bg-[#FFDA03] rounded-full shadow-sm"
                          animate={{ x: rentToggle ? 22 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                      <span className={`text-[10px] font-bold transition-all ${rentToggle ? 'text-white' : 'text-neutral-500'}`}>Rent (1 Week)</span>
                    </div>

                    {/* Total Value */}
                    <div className="text-center sm:text-right">
                      <p className="text-[9px] text-neutral-500 uppercase font-black tracking-wider">Calculated Total</p>
                      <h4 className="font-heading font-black text-2xl text-[#FFDA03] mt-0.5">
                        {rentToggle ? formatPrice(garageRentTotal) : formatPrice(garageBuyTotal)}
                      </h4>
                      <p className="text-[8px] text-neutral-400">
                        {rentToggle ? 'For 7 days rental plan' : 'Including standard warranty'}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={garageItems.length === 0}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('nira_notification', {
                        detail: { 
                          type: 'push', 
                          title: '🛒 Setup Ordered!', 
                          content: `Your Creator setup package totaling ${rentToggle ? formatPrice(garageRentTotal) : formatPrice(garageBuyTotal)} has been compiled.` 
                        }
                      }));
                    }}
                    className="w-full mt-6 py-4 bg-[#FFDA03] hover:bg-[#FFDA03]/90 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Deploy Workspace & Checkout Setup
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
