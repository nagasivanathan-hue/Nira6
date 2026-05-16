'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
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
  const gradeInfo = CONDITION_GRADES[product.grade];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-nira-gray-dark hover:border-nira-yellow/50 hover:shadow-xl hover:shadow-nira-yellow/5 transition-all overflow-hidden"
    >
      {/* Image */}
      <Link href={`/buy/${product.id}`} className="relative block aspect-square bg-nira-gray overflow-hidden">
        <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-white" style={{ backgroundColor: gradeInfo.color }}>
            Grade {product.grade}
          </span>
          {product.discount > 20 && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-nira-error text-white">
              {product.discount}% OFF
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button 
          onClick={(e) => { e.preventDefault(); dispatch(toggleWishlist(product.id)); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isInWishlist ? 'bg-nira-yellow text-nira-dark opacity-100' : 'bg-white/90 text-nira-text-secondary opacity-0 group-hover:opacity-100 hover:bg-nira-yellow hover:text-nira-dark'}`} 
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-nira-dark' : ''}`} />
        </button>
        {/* Quick Add */}
        <button
          onClick={(e) => { e.preventDefault(); dispatch(addToCart(product)); }}
          className="absolute bottom-3 right-3 w-9 h-9 bg-nira-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-nira-yellow hover:text-nira-dark"
          aria-label="Add to cart"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-nira-text-secondary font-medium uppercase tracking-wide mb-1">{product.brand}</p>
        <Link href={`/buy/${product.id}`}>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-nira-yellow-dark transition-colors">{product.name}</h3>
        </Link>
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow" />
            <span className="text-xs font-semibold">{product.rating}</span>
          </div>
          <span className="text-[11px] text-nira-text-secondary">({product.reviewCount})</span>
          {product.warranty && <span className="ml-auto text-[10px] px-2 py-0.5 bg-nira-success/10 text-nira-success rounded-full font-medium">{product.warranty}</span>}
        </div>
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-heading font-bold text-lg">{formatPrice(product.price)}</span>
          <span className="text-sm text-nira-text-secondary line-through">{formatPrice(product.originalPrice)}</span>
        </div>
        {product.emiAvailable && <p className="text-[11px] text-nira-info mt-1">EMI from {formatPrice(Math.round(product.price / 12))}/mo</p>}
      </div>
    </motion.div>
  );
}
