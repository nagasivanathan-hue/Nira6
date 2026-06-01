'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { affiliateProducts } from '@/lib/amazonData';

// --- DATA STRUCTURES (MOCKED) ---

// 1. Used Listings (from NIRA6 / Supabase swap point)
/*
  Supabase swap:
  const { data: usedListings } = await supabase
    .from('gear_listings')
    .select('id, title, category, condition, price, thumbnail_url, seller:profiles(name, verified), views')
    .order('created_at', { ascending: false })
*/
const mockUsedListings = [
  {
    id: "listing-001",
    title: "Sony A7III Full Kit",
    category: "Camera",
    condition: "Mint",
    price: 88000,
    thumbnail: "https://picsum.photos/seed/sony/400/300",
    seller: { name: "Arjun K", verified: true },
    views: 9400
  },
  {
    id: "listing-002",
    title: "Sony FE 24-70mm f/2.8 GM",
    category: "Lens",
    condition: "Good",
    price: 110000,
    thumbnail: "https://picsum.photos/seed/lens/400/300",
    seller: { name: "Priya S", verified: true },
    views: 3200
  },
  {
    id: "listing-003",
    title: "DJI Mavic 3 Pro",
    category: "Drone",
    condition: "Mint",
    price: 175000,
    thumbnail: "https://picsum.photos/seed/drone/400/300",
    seller: { name: "Rohan D", verified: false },
    views: 12500
  },
  {
    id: "listing-004",
    title: "Rode Wireless GO II",
    category: "Audio",
    condition: "Fair",
    price: 15000,
    thumbnail: "https://picsum.photos/seed/rode/400/300",
    seller: { name: "Anita V", verified: true },
    views: 890
  },
  {
    id: "listing-005",
    title: "Aputure LS 300x",
    category: "Lighting",
    condition: "Good",
    price: 65000,
    thumbnail: "https://picsum.photos/seed/aputure/400/300",
    seller: { name: "Vikram S", verified: true },
    views: 4100
  },
  {
    id: "listing-006",
    title: "Canon EOS R5 Body",
    category: "Camera",
    condition: "Mint",
    price: 245000,
    thumbnail: "https://picsum.photos/seed/canon/400/300",
    seller: { name: "Neha M", verified: true },
    views: 11200
  }
];

// 2. Buy New (Amazon Affiliate)
// Affiliate products imported from amazonData.ts

const CATEGORIES = ['All', 'Camera', 'Lens', 'Lighting', 'Audio', 'Drone', 'Accessories'];
const SORTS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Viewed'];

// --- SUB-COMPONENTS ---

const STARFIELD_STARS = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  top: `${((i * 13) % 100)}%`,
  left: `${((i * 17) % 100)}%`,
  size: `${((i * 3) % 2) + 1}px`,
  delay: `${((i * 5) % 5)}s`,
  duration: `${((i * 7) % 3) + 2}s`,
}));

function Starfield() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0A0A]">
      {STARFIELD_STARS.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-0 animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}

const FloatCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="gear-card relative bg-[#111111] border border-[#1E1E1E] rounded-2xl overflow-hidden transition-all duration-300 ease-out flex flex-col group z-10">
      {children}
    </div>
  );
};

export default function BuyGearTab() {
  const [activeTab, setActiveTab] = useState<'used' | 'new'>('used');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Sort Logic
  const filteredUsed = mockUsedListings
    .filter(item => activeCategory === 'All' || item.category === activeCategory)
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.condition.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Most Viewed') return b.views - a.views;
      return 0; // Newest logic would go here
    });

  const filteredNew = affiliateProducts
    .filter(item => activeCategory === 'All' || item.category === activeCategory)
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Most Viewed') return b.reviews - a.reviews;
      return 0;
    });

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Mint': return 'bg-green-500 text-green-950';
      case 'Good': return 'bg-blue-500 text-blue-950';
      case 'Fair': return 'bg-amber-500 text-amber-950';
      default: return 'bg-neutral-500 text-neutral-900';
    }
  };

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(p);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans relative">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1); }
        }
        .animate-twinkle {
          animation: twinkle linear infinite;
        }
        .gear-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }
        .gear-card:hover {
          transform: scale(1.03) !important;
          border-color: #FFDA03 !important;
          box-shadow: 0 0 30px rgba(255, 218, 3, 0.15), 0 20px 50px rgba(0, 0, 0, 0.7) !important;
          z-index: 20;
        }
      `}</style>
      
      <Starfield />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading font-black text-5xl md:text-6xl tracking-wider text-white">
            GEAR <span className="text-[#FFDA03]">MARKETPLACE</span>
          </h1>
          <p className="text-[#555555] font-sans mt-4 max-w-2xl mx-auto text-sm md:text-base">
            Discover verified recommerce gear from creators across India, or buy brand new equipment directly via Amazon.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#111111] p-1.5 rounded-full border border-[#1E1E1E] flex items-center">
            <button
              onClick={() => setActiveTab('used')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${
                activeTab === 'used' 
                  ? 'bg-[#FFDA03] text-[#0A0A0A] shadow-[0_0_15px_rgba(255,218,3,0.3)]' 
                  : 'text-[#555555] hover:text-white'
              }`}
            >
              Used Gear ({mockUsedListings.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${
                activeTab === 'new' 
                  ? 'bg-[#FFDA03] text-[#0A0A0A] shadow-[0_0_15px_rgba(255,218,3,0.3)]' 
                  : 'text-[#555555] hover:text-white'
              }`}
            >
              Buy New on Amazon ({affiliateProducts.length})
            </button>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="sticky top-16 z-30 bg-[#0A0A0A]/80 backdrop-blur-xl border-y border-[#1E1E1E] py-4 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-2xl sm:border-x">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto px-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat
                      ? 'bg-[#FFDA03] text-[#0A0A0A]'
                      : 'bg-[#111111] text-[#555555] border border-[#1E1E1E] hover:border-[#FFDA03]/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs md:max-w-md w-full">
              <input
                type="text"
                placeholder="Search gear by name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#111111] border border-[#1E1E1E] rounded-full text-xs text-white focus:outline-none focus:border-[#FFDA03] placeholder-[#555555] transition-all"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#555555]" />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-[#555555]">Sort:</span>
              <select
                title="Sort By"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#111111] border border-[#1E1E1E] text-white text-xs font-bold px-3 py-2 rounded-lg focus:outline-none focus:border-[#FFDA03] cursor-pointer"
              >
                {SORTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'used' ? (
            <motion.div
              key="used"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredUsed.length > 0 ? (
                filteredUsed.map(item => (
                  <FloatCard key={item.id}>
                    <div className="relative aspect-video w-full bg-[#0A0A0A]">
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-[10px] text-[#555555] font-bold uppercase tracking-[2px] mb-2">{item.category}</div>
                      <h3 className="text-base font-bold text-white mb-4 line-clamp-2 leading-snug">{item.title}</h3>
                      
                      <div className="flex items-center gap-1.5 mb-4 mt-auto">
                        <div className="w-5 h-5 rounded-full bg-[#1E1E1E] flex items-center justify-center text-[10px] font-bold">
                          {item.seller.name.charAt(0)}
                        </div>
                        <span className="text-xs text-[#555555]">{item.seller.name}</span>
                        {item.seller.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>

                      <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#1E1E1E]">
                        <div>
                          <span className="text-[10px] text-[#555555] uppercase tracking-wider block mb-0.5">Price</span>
                          <span className="font-heading text-2xl text-[#FFDA03] tracking-wide">{formatPrice(item.price)}</span>
                        </div>
                        <Link href={`/buy/${item.id}`} className="px-4 py-2 bg-[#1E1E1E] hover:bg-white hover:text-black text-white text-xs font-bold rounded-lg transition-colors">
                          View Listing
                        </Link>
                      </div>
                    </div>
                  </FloatCard>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-[#555555]">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-bold uppercase tracking-widest">No used gear found for {activeCategory}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-xl font-heading tracking-widest text-[#FFDA03] uppercase">Can&apos;t find it used? Buy new on Amazon</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNew.length > 0 ? (
                  filteredNew.map(item => (
                    <FloatCard key={item.id}>
                      {/* Affiliate Badges */}
                      <div className="absolute top-3 left-3 z-10 flex gap-2">
                        <span className="bg-[#111111]/80 backdrop-blur border border-[#1E1E1E] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                          Affiliate
                        </span>
                        <span className="bg-[#FF9900] text-black px-2 py-0.5 rounded text-[10px] font-black lowercase flex items-center">
                          amazon
                        </span>
                      </div>

                      <div className="relative aspect-square w-full bg-white p-6">
                        <Image src={item.image} alt={item.title} fill className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="text-[10px] text-[#555555] font-bold uppercase tracking-[2px] mb-2">{item.category}</div>
                        <h3 className="text-base font-bold text-white mb-3 line-clamp-2 leading-snug">{item.title}</h3>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex text-[#FF9900] text-xs">
                            {'★'.repeat(Math.floor(item.rating))}
                            <span className="text-[#555555]">{'★'.repeat(5 - Math.floor(item.rating))}</span>
                          </div>
                          <span className="text-[10px] text-[#555555]">({item.reviews})</span>
                        </div>

                        <div className="flex flex-col mt-auto pt-4 border-t border-[#1E1E1E]">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-[10px] text-[#555555] line-through block">{formatPrice(item.original)}</span>
                              <span className="font-heading text-2xl text-[#FFDA03] tracking-wide">{formatPrice(item.price)}</span>
                            </div>
                            <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-1 rounded text-xs font-bold">
                              -{Math.round(((item.original - item.price) / item.original) * 100)}%
                            </div>
                          </div>
                          <a 
                            href={item.affiliate_url} 
                            target="_blank" 
                            rel="noopener noreferrer sponsored" 
                            className="w-full py-3 bg-[#FF9900] hover:bg-[#E48A00] text-black text-xs uppercase tracking-widest font-black rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            Buy on Amazon <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </FloatCard>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-[#555555]">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-bold uppercase tracking-widest">No affiliate gear found for {activeCategory}</p>
                  </div>
                )}
              </div>

              <div className="mt-12 text-center text-[10px] text-[#555555] max-w-2xl mx-auto border-t border-[#1E1E1E] pt-6 pb-20">
                NIRA6 participates in the Amazon Associates Programme. Purchases through these links earn us a small commission at no extra cost to you. This helps support the platform.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
