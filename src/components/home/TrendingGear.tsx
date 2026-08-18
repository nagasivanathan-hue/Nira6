'use client';
import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTrendingProducts } from '@/store/productSlice';

export default function TrendingGear() {
  const dispatch = useAppDispatch();
  const { trendingProducts, loading } = useAppSelector((state) => state.products);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = dir === 'left' ? -clientWidth / 1.2 : clientWidth / 1.2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    dispatch(fetchTrendingProducts());
  }, [dispatch]);

  if (loading && trendingProducts.length === 0) return null;

  return (
    <div className="mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 group relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 block mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> TRENDING NOW
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
            Best Selling Creator Tools
          </h2>
        </div>
        <Link href="/buy?sort=popular" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-emerald-400 transition-colors group">
          Explore Trending <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-4 sm:left-6 lg:left-8 top-[60%] -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-nira-gray flex items-center justify-center text-nira-dark hover:text-nira-yellow hover:scale-110 opacity-0 group-hover:opacity-100 transition-all focus:outline-none hidden md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-4 sm:right-6 lg:right-8 top-[60%] -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-nira-gray flex items-center justify-center text-nira-dark hover:text-nira-yellow hover:scale-110 opacity-0 group-hover:opacity-100 transition-all focus:outline-none hidden md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div 
        ref={scrollRef} 
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar snap-x snap-mandatory"
      >
          {trendingProducts.map((product) => (
            <div key={product.id} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] flex-shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
    </div>
  );
}

