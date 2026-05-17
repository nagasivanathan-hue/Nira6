'use client';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid, List as ListIcon, X, Sparkles, Filter, Check, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProducts } from '@/store/productSlice';
import { setSearchQuery } from '@/store/uiSlice';

const CATEGORIES = ['All', 'Cameras', 'Lenses', 'Drones', 'Gimbals', 'Audio', 'Lighting'];
const GRADES = ['All', 'Like New', 'Excellent', 'Good', 'Fair'];
const BRANDS = ['All', 'Sony', 'Canon', 'Nikon', 'DJI', 'Fujifilm', 'Blackmagic'];

export default function BuyPage() {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);
  const { searchQuery } = useAppSelector((state) => state.ui);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeGrade, setActiveGrade] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  
  // UX Optimizations
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (activeGrade !== 'All') params.grade = activeGrade;
    if (activeBrand !== 'All') params.brand = activeBrand;
    if (searchQuery) params.keyword = searchQuery;
    params.sort = sortBy;
    
    dispatch(fetchProducts(params));
  }, [dispatch, activeCategory, activeGrade, activeBrand, sortBy, searchQuery]);

  // Smart suggestions mock dataset
  const commonSuggestions = [
    { text: 'Sony FX3 Cinema Camera', category: 'Cameras' },
    { text: 'Canon EOS R5 Mirrorless', category: 'Cameras' },
    { text: 'DJI Mavic 3 Pro Drone', category: 'Drones' },
    { text: 'Sony FE 24-70mm f/2.8 GM II', category: 'Lenses' },
    { text: 'Rode Wireless PRO Microphone', category: 'Audio' },
    { text: 'Aputure Amaran 200d LED Light', category: 'Lighting' },
    { text: 'DJI RS 4 Pro Gimbal', category: 'Gimbals' },
    { text: 'Nikon Z8 Mirrorless Camera', category: 'Cameras' },
    { text: 'Sigma 24-70mm f/2.8 DG DN Art', category: 'Lenses' }
  ];

  const popularTags = ['Sony FX3', 'Mavic 3', 'Rode Mic', 'Sigma Art', 'Canon R5', 'Lenses'];

  const matchingProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4);

  const filteredCommonSuggestions = commonSuggestions.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4);

  const hasActiveFilters = activeCategory !== 'All' || activeGrade !== 'All' || activeBrand !== 'All' || searchQuery !== '';
  
  let activeFilterCount = 0;
  if (activeCategory !== 'All') activeFilterCount++;
  if (activeBrand !== 'All') activeFilterCount++;
  if (activeGrade !== 'All') activeFilterCount++;
  if (searchQuery !== '') activeFilterCount++;

  const clearFilter = (type: 'category' | 'brand' | 'grade' | 'search') => {
    if (type === 'category') setActiveCategory('All');
    if (type === 'brand') setActiveBrand('All');
    if (type === 'grade') setActiveGrade('All');
    if (type === 'search') dispatch(setSearchQuery(''));
  };

  const clearAllFilters = () => {
    setActiveCategory('All');
    setActiveBrand('All');
    setActiveGrade('All');
    dispatch(setSearchQuery(''));
  };

  return (
    <div className="min-h-screen bg-nira-gray pb-20">
      {/* Header & Search */}
      <div className="bg-white border-b border-nira-gray-dark sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="font-heading font-bold text-2xl">Buy Creator Gear</h1>
            
            {/* Dynamic Search Bar Container */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
              <input 
                type="text" 
                placeholder="Search cameras, lenses, drones..." 
                value={searchQuery}
                onChange={(e) => {
                  dispatch(setSearchQuery(e.target.value));
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-10 py-3 bg-nira-gray rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    dispatch(setSearchQuery(''));
                    setShowSuggestions(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-nira-gray-dark rounded-full text-nira-text-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Suggestions Dropdown Overlay */}
              {showSuggestions && (
                <>
                  {/* Backdrop overlay to catch outside click */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setShowSuggestions(false)} 
                  />
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-nira-gray-dark z-50 overflow-hidden animate-fade-in max-h-[420px] overflow-y-auto">
                    {searchQuery.trim() === '' ? (
                      <div className="p-5">
                        <div className="mb-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-nira-text-secondary mb-3 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow" />
                            Popular Searches
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {popularTags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => {
                                  dispatch(setSearchQuery(tag));
                                  setShowSuggestions(false);
                                }}
                                className="px-3.5 py-1.5 bg-nira-gray hover:bg-nira-yellow/10 hover:text-nira-dark text-nira-text-secondary text-xs rounded-xl transition-all cursor-pointer font-medium"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-nira-text-secondary mb-3">
                            Browse Quick Categories
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.filter(c => c !== 'All').map(cat => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setActiveCategory(cat);
                                  setShowSuggestions(false);
                                }}
                                className="flex items-center justify-between px-3 py-2 border border-nira-gray hover:border-nira-yellow rounded-xl text-left text-xs font-medium text-nira-dark hover:bg-nira-gray/30 transition-all cursor-pointer"
                              >
                                <span>{cat}</span>
                                <ArrowRight className="w-3 h-3 text-nira-text-secondary" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Matching Products */}
                        {matchingProducts.length > 0 && (
                          <div className="p-4 border-b border-nira-gray">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-nira-text-secondary mb-3 flex items-center gap-1.5">
                              Store Matches
                            </h4>
                            <div className="space-y-2">
                              {matchingProducts.map(p => (
                                <a
                                  key={p.id}
                                  href={`/buy/${p.id}`}
                                  className="flex items-center gap-3 p-2 hover:bg-nira-gray rounded-xl transition-colors"
                                >
                                  <img 
                                    src={p.image} 
                                    alt={p.name} 
                                    className="w-10 h-10 object-cover rounded-lg bg-nira-gray"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-nira-dark truncate">{p.name}</p>
                                    <p className="text-[10px] text-nira-text-secondary font-medium">Grade: {p.grade} • {p.brand}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-nira-dark">₹{p.price.toLocaleString('en-IN')}</p>
                                    <span className="text-[9px] text-nira-success font-extrabold uppercase bg-nira-success/10 px-1.5 py-0.5 rounded">In Stock</span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Search Autocomplete Suggestions */}
                        <div className="p-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-nira-text-secondary px-2 mb-2">
                            Search Suggestions
                          </h4>
                          {filteredCommonSuggestions.length === 0 && matchingProducts.length === 0 && (
                            <div className="p-4 text-center text-xs text-nira-text-secondary">
                              No quick suggestions for &ldquo;{searchQuery}&rdquo;
                            </div>
                          )}
                          {filteredCommonSuggestions.map(item => (
                            <button
                              key={item.text}
                              onClick={() => {
                                dispatch(setSearchQuery(item.text));
                                setShowSuggestions(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-nira-gray rounded-xl text-left text-xs text-nira-dark transition-colors cursor-pointer"
                            >
                              <Search className="w-3.5 h-3.5 text-nira-text-secondary" />
                              <span className="flex-1 truncate">{item.text}</span>
                              <span className="text-[10px] bg-nira-gray px-2 py-0.5 rounded-md text-nira-text-secondary font-medium">{item.category}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-nira-gray rounded-xl text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="latest">Sort: Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <div className="h-10 w-px bg-nira-gray-dark mx-1 hidden md:block" />
              <div className="flex bg-nira-gray p-1 rounded-xl">
                <button className="p-2 bg-white shadow-sm rounded-lg text-nira-dark"><Grid className="w-4 h-4" /></button>
                <button className="p-2 text-nira-text-secondary"><ListIcon className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters - Desktop only */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-nira-dark" /> Filters
                </h3>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-nira-text-secondary hover:text-nira-error underline font-bold"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-xs font-extrabold mb-3 uppercase tracking-wider text-nira-text-secondary">Category</h4>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      className={`block w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${activeCategory === cat ? 'bg-nira-yellow/10 text-nira-dark font-bold' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <h4 className="text-xs font-extrabold mb-3 uppercase tracking-wider text-nira-text-secondary">Brand</h4>
                <div className="grid grid-cols-2 gap-2">
                  {BRANDS.map(brand => (
                    <button 
                      key={brand}
                      onClick={() => setActiveBrand(brand)}
                      className={`px-3 py-2 rounded-xl text-xs text-center border transition-all cursor-pointer ${activeBrand === brand ? 'bg-nira-dark text-white border-nira-dark font-semibold' : 'border-nira-gray-dark text-nira-text-secondary hover:border-nira-yellow hover:bg-nira-gray/20'}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade */}
              <div>
                <h4 className="text-xs font-extrabold mb-3 uppercase tracking-wider text-nira-text-secondary">Equipment Grade</h4>
                <div className="space-y-2">
                  {GRADES.map(grade => (
                    <label key={grade} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="grade" 
                        checked={activeGrade === grade} 
                        onChange={() => setActiveGrade(grade)}
                        className="w-4 h-4 accent-nira-yellow" 
                      />
                      <span className={`text-sm ${activeGrade === grade ? 'text-nira-dark font-bold' : 'text-nira-text-secondary group-hover:text-nira-dark'}`}>{grade}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid & Active Chips */}
          <main className="col-span-4 lg:col-span-3">
            
            {/* Active Filters Chips Component */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-4 rounded-2xl border border-nira-gray-dark">
                <span className="text-xs font-bold text-nira-text-secondary uppercase tracking-wider mr-2">Active Filters:</span>
                
                {activeCategory !== 'All' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-nira-yellow/10 border border-nira-yellow/30 text-nira-dark rounded-full text-xs font-bold">
                    <span>Category: {activeCategory}</span>
                    <button onClick={() => clearFilter('category')} className="hover:bg-nira-yellow/20 p-0.5 rounded-full transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {activeBrand !== 'All' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-nira-dark/5 border border-nira-dark/10 text-nira-dark rounded-full text-xs font-bold">
                    <span>Brand: {activeBrand}</span>
                    <button onClick={() => clearFilter('brand')} className="hover:bg-nira-dark/10 p-0.5 rounded-full transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {activeGrade !== 'All' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-nira-dark/5 border border-nira-dark/10 text-nira-dark rounded-full text-xs font-bold">
                    <span>Grade: {activeGrade}</span>
                    <button onClick={() => clearFilter('grade')} className="hover:bg-nira-dark/10 p-0.5 rounded-full transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {searchQuery !== '' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-nira-yellow text-nira-dark rounded-full text-xs font-bold shadow-sm">
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <button onClick={() => clearFilter('search')} className="hover:bg-nira-dark/10 p-0.5 rounded-full transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <button 
                  onClick={clearAllFilters}
                  className="text-xs font-extrabold text-nira-error hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl aspect-[4/5] animate-pulse border border-nira-gray-dark" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-nira-error/5 text-nira-error p-8 rounded-2xl text-center border border-nira-error/20">
                <p className="font-bold">Error loading products</p>
                <p className="text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-nira-error text-white rounded-xl text-sm font-bold shadow-sm">Retry</button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center border border-nira-gray-dark">
                <Search className="w-12 h-12 text-nira-text-secondary/40 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-lg text-nira-dark">No products found</h3>
                <p className="text-nira-text-secondary text-sm mt-1">Try adjusting your filters or search terms</p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className="mt-4 px-5 py-2 bg-nira-yellow text-nira-dark font-bold text-sm rounded-xl shadow-sm hover:scale-102 active:scale-98 transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Sticky Filter Trigger Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3 bg-nira-dark text-white rounded-full font-bold shadow-2xl border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-nira-yellow" />
          <span className="text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-nira-yellow text-nira-dark text-xs rounded-full font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileFilterOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}

      {/* Mobile Bottom Filter Drawer Sheet */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.2rem] z-50 p-6 shadow-2xl transition-transform duration-300 transform max-h-[85vh] overflow-y-auto ${isMobileFilterOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-12 h-1 bg-nira-gray-dark rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-6 border-b border-nira-gray-dark pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-nira-dark" />
            <h3 className="font-heading font-extrabold text-lg text-nira-dark">Filters</h3>
          </div>
          <button 
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-1.5 bg-nira-gray hover:bg-nira-gray-dark rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-nira-dark" />
          </button>
        </div>

        {/* Mobile Filter Category Section */}
        <div className="mb-6">
          <h4 className="text-xs font-black mb-3 uppercase tracking-wider text-nira-text-secondary">Category</h4>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm transition-all cursor-pointer ${activeCategory === cat ? 'bg-nira-yellow text-nira-dark font-bold shadow-sm' : 'bg-nira-gray text-nira-text-secondary hover:bg-nira-gray-dark'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter Brand Section */}
        <div className="mb-6">
          <h4 className="text-xs font-black mb-3 uppercase tracking-wider text-nira-text-secondary">Brand</h4>
          <div className="flex flex-wrap gap-2">
            {BRANDS.map(brand => (
              <button 
                key={brand}
                onClick={() => setActiveBrand(brand)}
                className={`px-4 py-2 rounded-xl text-sm transition-all cursor-pointer ${activeBrand === brand ? 'bg-nira-dark text-white font-semibold shadow-sm' : 'border border-nira-gray-dark text-nira-text-secondary hover:border-nira-yellow'}`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter Grade Section */}
        <div className="mb-8">
          <h4 className="text-xs font-black mb-3 uppercase tracking-wider text-nira-text-secondary">Equipment Grade</h4>
          <div className="grid grid-cols-2 gap-3">
            {GRADES.map(grade => (
              <button 
                key={grade}
                onClick={() => setActiveGrade(grade)}
                className={`px-4 py-3 rounded-xl text-sm text-left transition-all border flex items-center justify-between cursor-pointer ${activeGrade === grade ? 'bg-nira-yellow/10 border-nira-yellow text-nira-dark font-bold' : 'border-nira-gray-dark text-nira-text-secondary'}`}
              >
                <span>{grade}</span>
                {activeGrade === grade && <Check className="w-4 h-4 text-nira-yellow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter Sticky Bottom Button Actions */}
        <div className="flex gap-4 mt-6 pt-4 border-t border-nira-gray-dark sticky bottom-0 bg-white">
          <button 
            onClick={() => { clearAllFilters(); setIsMobileFilterOpen(false); }}
            className="flex-1 py-3 bg-nira-gray rounded-xl text-sm font-bold text-nira-text-secondary hover:bg-nira-gray-dark transition-colors cursor-pointer"
          >
            Reset All
          </button>
          <button 
            onClick={() => setIsMobileFilterOpen(false)}
            className="flex-1 py-3 bg-nira-yellow text-nira-dark rounded-xl text-sm font-bold shadow-md hover:bg-nira-yellow-dark transition-colors cursor-pointer text-center"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
