'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  theme?: 'dark' | 'light';
}

export default function ProductCarousel({ title, subtitle, products, theme = 'dark' }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 1.2 : clientWidth / 1.2;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group">
      <div className="flex flex-col mb-6">
        <h2 className={`font-heading font-black text-2xl sm:text-3xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-nira-dark'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-nira-text-secondary'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-[55%] -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-nira-gray flex items-center justify-center text-nira-dark hover:text-nira-yellow hover:scale-110 opacity-0 group-hover:opacity-100 transition-all focus:outline-none hidden md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-[55%] -translate-y-1/2 translate-x-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-nira-gray flex items-center justify-center text-nira-dark hover:text-nira-yellow hover:scale-110 opacity-0 group-hover:opacity-100 transition-all focus:outline-none hidden md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Scrolling Container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
