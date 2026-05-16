'use client';
import { useRef, useEffect } from 'react';

import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchFeaturedProducts } from '@/store/productSlice';

export default function FeaturedDeals() {
  const dispatch = useAppDispatch();
  const { featuredProducts, loading } = useAppSelector((state) => state.products);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  if (loading && featuredProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-nira-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-nira-yellow fill-nira-yellow" />
              <span className="text-sm font-semibold text-nira-yellow uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="font-heading font-bold text-2xl lg:text-3xl">Top Deals for Creators</h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scroll('left')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow" aria-label="Scroll left">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow" aria-label="Scroll right">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="min-w-[260px] max-w-[260px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
