'use client';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid, List as ListIcon } from 'lucide-react';
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

  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (activeGrade !== 'All') params.grade = activeGrade;
    if (activeBrand !== 'All') params.brand = activeBrand;
    if (searchQuery) params.keyword = searchQuery;
    params.sort = sortBy;
    
    dispatch(fetchProducts(params));
  }, [dispatch, activeCategory, activeGrade, activeBrand, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-nira-gray pb-20">
      {/* Header */}
      <div className="bg-white border-b border-nira-gray-dark sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="font-heading font-bold text-2xl">Buy Creator Gear</h1>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
              <input 
                type="text" 
                placeholder="Search cameras, lenses, drones..." 
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full pl-12 pr-4 py-3 bg-nira-gray rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow transition-all"
              />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-bold flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </h3>
                <button 
                  onClick={() => { setActiveCategory('All'); setActiveGrade('All'); setActiveBrand('All'); }}
                  className="text-xs text-nira-text-secondary hover:text-nira-error underline"
                >
                  Reset
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-nira-text-secondary">Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? 'bg-nira-yellow/10 text-nira-dark font-bold' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-nira-text-secondary">Brand</h4>
                <div className="grid grid-cols-2 gap-2">
                  {BRANDS.map(brand => (
                    <button 
                      key={brand}
                      onClick={() => setActiveBrand(brand)}
                      className={`px-3 py-2 rounded-lg text-xs text-center border transition-all ${activeBrand === brand ? 'bg-nira-dark text-white border-nira-dark' : 'border-nira-gray-dark text-nira-text-secondary hover:border-nira-yellow'}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade */}
              <div>
                <h4 className="text-sm font-bold mb-3 uppercase tracking-wider text-nira-text-secondary">Equipment Grade</h4>
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
                      <span className={`text-sm ${activeGrade === grade ? 'text-nira-dark font-medium' : 'text-nira-text-secondary group-hover:text-nira-dark'}`}>{grade}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl aspect-[4/5] animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-nira-error/5 text-nira-error p-8 rounded-2xl text-center">
                <p className="font-bold">Error loading products</p>
                <p className="text-sm">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-nira-error text-white rounded-xl text-sm">Retry</button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center">
                <Search className="w-12 h-12 text-nira-gray-dark mx-auto mb-4" />
                <h3 className="font-heading font-bold text-lg">No products found</h3>
                <p className="text-nira-text-secondary text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
