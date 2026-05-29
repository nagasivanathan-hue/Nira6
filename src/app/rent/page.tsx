'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import RentHero from '@/components/rental/RentHero';
import RentFilters from '@/components/rental/RentFilters';
import RentalCard from '@/components/rental/RentalCard';
import StickyRentBar from '@/components/rental/StickyRentBar';
import { RentalItem } from '@/types';

const EMPTY_FILTERS = {
  brand: [] as string[],
  lensMount: '',
  sensorType: '',
  videoSpecs: '',
  bestFor: [] as string[],
  location: '',
  available: false,
  minPrice: '',
  maxPrice: '',
};

export default function RentPage() {
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sort, setSort] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (filters.brand.length) params.set('brand', filters.brand.join(','));
    if (filters.lensMount) params.set('lensMount', filters.lensMount);
    if (filters.sensorType) params.set('sensorType', filters.sensorType);
    if (filters.videoSpecs) params.set('videoSpecs', filters.videoSpecs);
    if (filters.bestFor.length) params.set('bestFor', filters.bestFor.join(','));
    if (filters.location) params.set('location', filters.location);
    if (filters.available) params.set('available', 'true');
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (searchQuery) params.set('keyword', searchQuery);
    if (sort) params.set('sort', sort);

    try {
      const res = await fetch(`/api/rentals?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setRentals(data);
    } catch (err) {
      console.error('Error fetching rentals:', err);
    }
    setLoading(false);
  }, [filters, activeCategory, searchQuery, sort]);

  useEffect(() => {
    const debounce = setTimeout(fetchRentals, 300);
    return () => clearTimeout(debounce);
  }, [fetchRentals]);

  return (
    <div className="rent-dark min-h-screen">
      {/* Hero Section */}
      <RentHero
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
      />

      {/* Mobile Sticky Bar */}
      <StickyRentBar
        onFilterToggle={() => setFiltersOpen(true)}
        sort={sort}
        onSort={setSort}
        resultCount={rentals.length}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Desktop Sort Bar */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <p className="text-sm text-white/30 font-medium">
            <span className="text-white font-bold">{rentals.length}</span> items found
          </p>
          <select aria-label="Select option" title="Select option"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-dark rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer"
          >
            <option value="">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <RentFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_FILTERS)}
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Results Grid */}
          <div className="flex-1">
             {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 animate-fade-in">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white/5 rounded-3xl aspect-[4/5] animate-pulse border border-white/5" />
                ))}
              </div>
            ) : rentals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <p className="text-lg font-heading font-bold text-white/40">No gear matches your filters</p>
                <p className="text-xs text-white/20">Try adjusting your search or removing some filters</p>
                <button
                  onClick={() => { setFilters(EMPTY_FILTERS); setSearchQuery(''); setActiveCategory(''); }}
                  className="mt-3 px-5 py-2 text-xs font-bold bg-nira-yellow text-nira-dark rounded-xl cursor-pointer hover:bg-nira-yellow-dark transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {rentals.map((item, i) => (
                  <RentalCard key={item.id || item._id} item={item} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
