/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Grid3X3, List, Search, SlidersHorizontal, Star, CheckCircle, Loader2
} from 'lucide-react';
import { CREATOR_CATEGORIES } from '@/lib/constants';
import CreatorCard from '@/components/creators/CreatorCard';
import api from '@/services/api';
import type { Creator, CreatorCategory, AvailabilityStatus } from '@/types/creator';

const CreatorMap = dynamic<{ creators: Creator[] }>(() => import('../../../components/creators/CreatorMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-nira-gray animate-pulse rounded-2xl flex items-center justify-center text-nira-text-secondary text-sm">Loading map...</div>
});

export default function DiscoverPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CreatorCategory | 'all'>('all');
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState<AvailabilityStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price_low' | 'price_high' | 'jobs'>('rating');
  const [maxBudget, setMaxBudget] = useState(500000);

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/creators', {
          params: {
            category: category !== 'all' ? category : undefined,
            minRating: minRating > 0 ? minRating : undefined,
            maxBudget: maxBudget < 500000 ? maxBudget : undefined,
            search: searchQuery || undefined
          }
        });
        setCreators(data);
      } catch (err) {
        console.error('Error fetching creators:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCreators();
    }, searchQuery ? 400 : 0);

    return () => clearTimeout(delayDebounce);
  }, [category, minRating, maxBudget, searchQuery]);

  const sortedCreators = useMemo(() => {
    const items = [...creators];
    if (sortBy === 'rating') {
      return items.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === 'price_low') {
      return items.sort((a, b) => a.startingPrice - b.startingPrice);
    }
    if (sortBy === 'price_high') {
      return items.sort((a, b) => b.startingPrice - a.startingPrice);
    }
    if (sortBy === 'jobs') {
      return items.sort((a, b) => b.completedJobs - a.completedJobs);
    }
    return items;
  }, [creators, sortBy]);

  const filtered = useMemo(() => {
    let items = sortedCreators;
    if (availability !== 'all') {
      items = items.filter(c => c.availability === availability);
    }
    return items;
  }, [sortedCreators, availability]);

  return (
    <div className="min-h-screen bg-nira-gray">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-black text-xl text-nira-dark flex items-center gap-2">
                <MapPin className="w-5 h-5 text-nira-yellow" /> Discover Creators
              </h1>
              <p className="text-xs text-nira-text-secondary mt-0.5">{filtered.length} creators found</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary" />
                <input
                  type="text" placeholder="Search creators, skills, locations..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-nira-gray rounded-xl text-xs border border-transparent focus:border-nira-yellow focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <button aria-label="Button" title="Button" onClick={() => setFiltersOpen(!filtersOpen)} className={`p-2.5 rounded-xl border transition-all cursor-pointer ${filtersOpen ? 'bg-nira-yellow text-nira-dark border-nira-yellow' : 'bg-white text-nira-text-secondary border-gray-200 hover:border-nira-yellow'}`}>
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <div className="flex bg-white rounded-xl border border-gray-200 p-0.5">
                {[
                  { mode: 'grid' as const, icon: Grid3X3 },
                  { mode: 'map' as const, icon: MapPin },
                  { mode: 'list' as const, icon: List },
                ].map(v => (
                  <button aria-label="Button" title="Button" key={v.mode} onClick={() => setViewMode(v.mode)} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === v.mode ? 'bg-nira-dark text-white' : 'text-nira-text-secondary hover:text-nira-dark'}`}>
                    <v.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-4 pb-1">
            <button onClick={() => setCategory('all')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${category === 'all' ? 'bg-nira-dark text-white' : 'bg-nira-gray text-nira-text-secondary hover:bg-nira-dark/5'}`}>All</button>
            {CREATOR_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id as CreatorCategory)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${category === cat.id ? 'text-white' : 'bg-nira-gray text-nira-text-secondary hover:bg-nira-dark/5'}`} style={category === cat.id ? { backgroundColor: cat.color } : {}}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border-b border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-1.5 block">Min Rating</label>
                  <select aria-label="Select option" title="Select option" value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="w-full px-3 py-2 bg-nira-gray rounded-lg text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow">
                    <option value={0}>Any</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-1.5 block">Availability</label>
                  <select aria-label="Select option" title="Select option" value={availability} onChange={e => setAvailability(e.target.value as AvailabilityStatus | 'all')} className="w-full px-3 py-2 bg-nira-gray rounded-lg text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow">
                    <option value="all">Any</option>
                    <option value="available">Available Now</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-1.5 block">Max Budget (₹)</label>
                  <input aria-label="Input" title="Input" placeholder="Input" type="number" value={maxBudget} onChange={e => setMaxBudget(Number(e.target.value))} className="w-full px-3 py-2 bg-nira-gray rounded-lg text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-1.5 block">Sort By</label>
                  <select aria-label="Select option" title="Select option" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="w-full px-3 py-2 bg-nira-gray rounded-lg text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow">
                    <option value="rating">Top Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="jobs">Most Experienced</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-nira-yellow mb-2" />
            <p className="text-sm font-semibold text-nira-text-secondary">Loading creators database...</p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="flex gap-5 h-[calc(100vh-220px)]">
            <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <CreatorMap creators={filtered} />
            </div>
            <div className="w-80 hidden lg:block overflow-y-auto space-y-3 pr-1">
              <p className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-2">{filtered.length} results</p>
              {filtered.map(c => <CreatorCard key={c.id} creator={c} compact />)}
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filtered.map(c => (
              <Link key={c.id} href={`/creators/${c.id}`} className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-nira-yellow/20 transition-all">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"><img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5"><h3 className="font-bold text-sm text-nira-dark">{c.name}</h3>{c.verified && <CheckCircle className="w-3.5 h-3.5 text-nira-yellow" />}</div>
                  <p className="text-[11px] text-nira-text-secondary">{c.title} • {c.location}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-0.5 text-[11px] font-bold"><Star className="w-3 h-3 fill-nira-yellow text-nira-yellow" />{c.rating}</span>
                    <span className="text-[10px] text-nira-text-secondary">{c.completedJobs} jobs</span>
                    <span className={`flex items-center gap-1 text-[9px] font-bold uppercase ${c.availability === 'available' ? 'text-emerald-600' : c.availability === 'busy' ? 'text-amber-600' : 'text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.availability === 'available' ? 'bg-emerald-500' : c.availability === 'busy' ? 'bg-amber-500' : 'bg-gray-400'}`} />{c.availability}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-sm text-nira-dark">₹{c.startingPrice.toLocaleString('en-IN')}+</p>
                  <span className="text-[10px] text-nira-yellow font-bold">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(c => <CreatorCard key={c.id} creator={c} />)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-nira-text-secondary mx-auto mb-4 opacity-30" />
            <p className="font-heading font-bold text-lg text-nira-dark">No creators found</p>
            <p className="text-sm text-nira-text-secondary mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
