'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Shield } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { toggleWishlist } from '@/store/wishlistSlice';
import { CONDITION_GRADES } from '@/lib/constants';

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const gradeKeyMap: Record<string, keyof typeof CONDITION_GRADES> = {
    'Like New': 'A+',
    'Excellent': 'A',
    'Good': 'B',
    'Fair': 'C'
  };
  const mappedGrade = gradeKeyMap[product.grade] || 'A';
  const gradeInfo = CONDITION_GRADES[mappedGrade];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white rounded-3xl border border-gray-100 hover:border-nira-yellow/60 hover:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Product Image and Actions Box */}
      <Link 
        href={`/buy/${product.id}`} 
        className="relative block aspect-square bg-gradient-to-b from-neutral-50/50 to-neutral-100/30 border-b border-gray-100 overflow-hidden"
      >
        <div className="absolute inset-0 p-5 flex items-center justify-center">
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out" 
            priority={false}
          />
        </div>

        {/* Quality Grade Pill Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <span 
            className="px-3 py-1 text-[10px] font-extrabold rounded-full text-white shadow-sm flex items-center gap-1" 
            style={{ backgroundColor: gradeInfo.color }}
          >
            <Shield className="w-3 h-3" />
            Grade {product.grade}
          </span>
          {product.discount > 20 && (
            <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-red-500 text-white shadow-sm">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Quick Save to Wishlist */}
        <button 
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            dispatch(toggleWishlist(product.id)); 
          }}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
            isInWishlist 
              ? 'bg-nira-yellow text-nira-dark opacity-100 scale-100' 
              : 'bg-white/80 backdrop-blur-md text-neutral-600 opacity-0 group-hover:opacity-100 hover:bg-nira-yellow hover:text-nira-dark shadow-md'
          }`} 
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-nira-dark' : ''}`} />
        </button>

        {/* Quick Add To Cart Button */}
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            dispatch(addToCart(product)); 
          }}
          className="absolute bottom-4 right-4 w-10 h-10 bg-nira-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-nira-yellow hover:text-nira-dark transition-all duration-350 shadow-lg transform translate-y-2 group-hover:translate-y-0 z-10"
          aria-label="Add to cart"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </Link>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand and Warranty */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            {product.brand}
          </p>
          {product.warranty && (
            <span className="text-[9px] px-2 py-0.5 bg-green-50/80 text-green-700 rounded-md font-bold border border-green-100/50">
              {product.warranty} Warranty
            </span>
          )}
        </div>
        
        {/* Title */}
        <Link href={`/buy/${product.id}`} className="block flex-grow mb-2.5">
          <h3 className="font-heading font-bold text-sm text-neutral-800 line-clamp-2 leading-snug group-hover:text-nira-yellow-dark transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <div className="flex items-center gap-0.5 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-neutral-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-black text-neutral-800">{product.rating.toFixed(1)}</span>
          <span className="text-[10px] text-neutral-400 font-medium">({product.reviewCount} reviews)</span>
        </div>

        {/* Nira Certified Trust Badge */}
        <div className="flex items-center gap-1.5 text-[9px] font-black tracking-wide text-emerald-700 mb-3.5 bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-100/80 w-fit">
          <Shield className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" />
          <span>NIRA CERTIFIED • 30-POINT DIAGNOSED</span>
        </div>

        {/* Pricing Segment */}
        <div className="border-t border-neutral-100 pt-3.5 flex flex-col gap-1.5 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-xl text-neutral-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-[10px] font-bold text-nira-success">
              ({product.discount}% OFF)
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {product.emiAvailable && (
              <p className="text-[10px] text-blue-600 font-semibold">
                EMI available from {formatPrice(Math.round(product.price / 12))}/mo
              </p>
            )}
            <p className="text-[10px] text-neutral-500 flex items-center gap-1 font-semibold">
              <span className="text-emerald-600">⚡ Free Delivery</span>
              <span>• tomorrow</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
