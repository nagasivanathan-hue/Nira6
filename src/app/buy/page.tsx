'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, SlidersHorizontal, Grid, List as ListIcon, X, Sparkles, Filter, Check, ArrowRight, History, Tag, Award, Package } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProducts } from '@/store/productSlice';
import { setSearchQuery } from '@/store/uiSlice';
import { mockProducts } from '@/lib/mockData';

const CATEGORIES = ['All', 'Cameras', 'Lenses', 'Drones', 'Gimbals', 'Audio', 'Lighting', 'Accessories'];
const GRADES = ['All', 'Like New', 'Excellent', 'Good', 'Fair'];
const BRANDS = ['All', 'Sony', 'Canon', 'Nikon', 'DJI', 'Fujifilm', 'Blackmagic', 'Digitek', 'ULANZI', 'Neewer', 'Hiffin'];

// Lightweight text highlighting component
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-nira-yellow/30 text-nira-dark font-extrabold rounded-xs px-0.5">{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

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
  
  // Search Experience States & Effects
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        dispatch(setSearchQuery(localSearch));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch, searchQuery]);

  useEffect(() => {
    const saved = localStorage.getItem('nira_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore malformed localStorage data
      }
    }
  }, []);

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('nira_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      saveSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (activeGrade !== 'All') params.grade = activeGrade;
    if (activeBrand !== 'All') params.brand = activeBrand;
    if (searchQuery) params.keyword = searchQuery;
    params.sort = sortBy;
    
    dispatch(fetchProducts(params));
  }, [dispatch, activeCategory, activeGrade, activeBrand, sortBy, searchQuery]);

  const popularTags = ['Sony FX3', 'Mavic 3', 'Rode Mic', 'Sigma Art', 'Canon R5', 'Lenses'];

  // Dynamic search suggestions engine based on loaded products list
  const getDynamicSuggestions = () => {
    if (!localSearch.trim()) return [];
    const term = localSearch.toLowerCase().trim();
    const suggestionsSet = new Set<string>();
    const results: { text: string; category: string; type: 'brand' | 'category' | 'product' }[] = [];

    // 1. Matches for Brands
    BRANDS.forEach(brand => {
      if (brand !== 'All' && brand.toLowerCase().includes(term) && !suggestionsSet.has(brand.toLowerCase())) {
        suggestionsSet.add(brand.toLowerCase());
        results.push({ text: brand, category: 'Brand', type: 'brand' });
      }
    });

    // 2. Matches for Categories
    CATEGORIES.forEach(cat => {
      if (cat !== 'All' && cat.toLowerCase().includes(term) && !suggestionsSet.has(cat.toLowerCase())) {
        suggestionsSet.add(cat.toLowerCase());
        results.push({ text: cat, category: 'Category', type: 'category' });
      }
    });

    // 3. Matches for Products
    const matchedProducts = mockProducts.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.brand.toLowerCase().includes(term)
    );

    matchedProducts.forEach(p => {
      const lowerName = p.name.toLowerCase();
      if (!suggestionsSet.has(lowerName) && results.length < 8) {
        suggestionsSet.add(lowerName);
        results.push({ 
          text: p.name, 
          category: p.category.charAt(0).toUpperCase() + p.category.slice(1), 
          type: 'product' 
        });
      }
    });

    return results.slice(0, 6);
  };

  const dynamicSuggestions = getDynamicSuggestions();

  const matchingProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(localSearch.toLowerCase())
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
    if (type === 'search') {
      setLocalSearch('');
      dispatch(setSearchQuery(''));
    }
  };

  const clearAllFilters = () => {
    setActiveCategory('All');
    setActiveBrand('All');
    setActiveGrade('All');
    setLocalSearch('');
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
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-10 py-3 bg-nira-gray rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow transition-all"
              />
              {localSearch && (
                <button 
                  onClick={() => {
                    setLocalSearch('');
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
                    {localSearch.trim() === '' ? (
                      <div className="p-5">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div className="mb-5">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-extrabold uppercase tracking-wider text-nira-text-secondary flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-nira-text-secondary animate-pulse" />
                                Recent Searches
                              </h4>
                              <button 
                                onClick={() => {
                                  setRecentSearches([]);
                                  localStorage.removeItem('nira_recent_searches');
                                }}
                                className="text-[10px] text-nira-text-secondary hover:text-nira-error font-extrabold transition-colors cursor-pointer uppercase"
                              >
                                Clear All
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {recentSearches.map(term => (
                                <div key={term} className="flex items-center gap-1.5 bg-nira-gray hover:bg-nira-yellow/10 rounded-xl transition-all pl-3.5 pr-2 py-1.5 group">
                                  <button
                                    onClick={() => {
                                      setLocalSearch(term);
                                      dispatch(setSearchQuery(term));
                                      setShowSuggestions(false);
                                    }}
                                    className="text-nira-text-secondary group-hover:text-nira-dark text-xs cursor-pointer font-bold transition-colors"
                                  >
                                    {term}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRecentSearches(prev => {
                                        const updated = prev.filter(t => t !== term);
                                        localStorage.setItem('nira_recent_searches', JSON.stringify(updated));
                                        return updated;
                                      });
                                    }}
                                    className="text-nira-text-secondary hover:text-nira-error hover:bg-nira-gray-dark p-0.5 rounded-full transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-nira-text-secondary mb-3 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow animate-bounce" />
                            Popular Searches
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {popularTags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => {
                                  setLocalSearch(tag);
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
                              <Package className="w-3.5 h-3.5 text-nira-text-secondary" />
                              Store Matches
                            </h4>
                            <div className="space-y-2">
                              {matchingProducts.map(p => (
                                <a
                                  key={p.id}
                                  href={`/buy/${p.id}`}
                                  className="flex items-center gap-3 p-2 hover:bg-nira-gray rounded-xl transition-colors"
                                >
                                  <Image 
                                    src={p.image} 
                                    alt={p.name} 
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-cover rounded-lg bg-nira-gray"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-nira-dark truncate">
                                      <HighlightText text={p.name} highlight={localSearch} />
                                    </p>
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
                          {dynamicSuggestions.length === 0 && matchingProducts.length === 0 && (
                            <div className="p-4 text-center text-xs text-nira-text-secondary">
                              No quick suggestions for &ldquo;{localSearch}&rdquo;
                            </div>
                          )}
                          {dynamicSuggestions.map(item => (
                            <button
                              key={item.text + '-' + item.type}
                              onClick={() => {
                                setLocalSearch(item.text);
                                dispatch(setSearchQuery(item.text));
                                setShowSuggestions(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-nira-gray rounded-xl text-left text-xs text-nira-dark transition-colors cursor-pointer group"
                            >
                              {item.type === 'category' ? (
                                <Tag className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                              ) : item.type === 'brand' ? (
                                <Award className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                              ) : (
                                <Search className="w-3.5 h-3.5 text-nira-text-secondary group-hover:scale-110 transition-transform" />
                              )}
                              <span className="flex-1 truncate">
                                <HighlightText text={item.text} highlight={localSearch} />
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                                item.type === 'category' ? 'bg-purple-100 text-purple-700' :
                                item.type === 'brand' ? 'bg-blue-100 text-blue-700' :
                                'bg-nira-gray text-nira-text-secondary'
                              }`}>
                                {item.category}
                              </span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="bg-white p-12 rounded-2xl text-center border border-nira-gray-dark max-w-2xl mx-auto my-8 shadow-sm">
                <Search className="w-16 h-16 text-nira-yellow/60 mx-auto mb-4 animate-bounce" />
                <h3 className="font-heading font-extrabold text-xl text-nira-dark">No gear matches found</h3>
                <p className="text-nira-text-secondary text-sm mt-2 max-w-md mx-auto">We couldn&apos;t find any items matching your active filters or search term: &ldquo;{searchQuery}&rdquo;</p>
                
                <div className="mt-8 pt-6 border-t border-nira-gray-dark">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-nira-text-secondary mb-3">Try Popular Keywords instead</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setLocalSearch(tag);
                          dispatch(setSearchQuery(tag));
                        }}
                        className="px-4 py-2 bg-nira-gray hover:bg-nira-yellow/10 hover:text-nira-dark text-nira-text-secondary text-xs rounded-xl font-bold transition-all cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-8">
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setLocalSearch('');
                        dispatch(setSearchQuery(''));
                      }}
                      className="px-5 py-2.5 bg-nira-gray text-nira-dark text-xs font-bold rounded-xl transition-all hover:bg-nira-gray-dark cursor-pointer"
                    >
                      Clear Search Keyword
                    </button>
                  )}
                  {hasActiveFilters && (
                    <button 
                      onClick={clearAllFilters}
                      className="px-5 py-2.5 bg-nira-yellow text-nira-dark text-xs font-bold rounded-xl shadow-sm hover:scale-102 transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
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
