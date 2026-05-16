'use client';
import { use, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Shield, Truck, RotateCcw, ChevronRight, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { CONDITION_GRADES } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { fetchProductById, clearCurrentProduct } from '@/store/productSlice';
import { toggleWishlist } from '@/store/wishlistSlice';
import ProductCard from '@/components/products/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const { currentProduct: product, loading, error, products } = useAppSelector((state) => state.products);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-nira-yellow" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link href="/buy" className="px-6 py-3 bg-nira-yellow text-nira-dark font-bold rounded-xl">Back to Shop</Link>
      </div>
    );
  }

  const similar = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const gradeInfo = CONDITION_GRADES[product.grade as keyof typeof CONDITION_GRADES] || CONDITION_GRADES['A'];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-nira-text-secondary">
          <Link href="/" className="hover:text-nira-dark">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/buy" className="hover:text-nira-dark">Buy</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-nira-dark">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-nira-gray rounded-2xl overflow-hidden mb-4 shadow-sm border border-nira-gray-dark">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
              <span className="absolute top-4 left-4 px-3 py-1.5 text-sm font-bold rounded-lg text-white shadow-lg" style={{ backgroundColor: gradeInfo.color }}>
                Grade {product.grade} — {gradeInfo.label}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm font-medium text-nira-text-secondary uppercase tracking-wider mb-1">{product.brand}</p>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-nira-yellow fill-nira-yellow' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="font-semibold text-sm">{product.rating}</span>
              <span className="text-sm text-nira-text-secondary">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-heading font-black text-3xl">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-nira-text-secondary line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="px-2.5 py-1 bg-nira-error/10 text-nira-error text-sm font-bold rounded-lg">{product.discount}% OFF</span>
                </>
              )}
            </div>
            {product.emiAvailable && <p className="text-sm text-nira-info mb-6 font-medium">EMI available from {formatPrice(Math.round(product.price / 12))}/month</p>}

            {/* Description */}
            <p className="text-nira-text-secondary leading-relaxed mb-6">{product.description}</p>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="bg-nira-gray rounded-2xl p-5 mb-6 border border-nira-gray-dark">
                <h3 className="font-bold text-sm mb-3 uppercase tracking-wide">Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm py-1 border-b border-nira-gray-dark last:border-0">
                      <span className="text-nira-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold text-nira-dark">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button 
                onClick={() => dispatch(addToCart(product))} 
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-nira-yellow text-nira-dark font-bold rounded-xl hover:bg-nira-yellow-dark transition-all transform hover:scale-[1.02] active:scale-95 shadow-md"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <Link 
                href="/checkout"
                onClick={() => dispatch(addToCart(product))}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-nira-dark text-white font-bold rounded-xl hover:bg-nira-dark/90 transition-all transform hover:scale-[1.02] active:scale-95 shadow-md"
              >
                Buy Now
              </Link>
              <button 
                onClick={() => product && dispatch(toggleWishlist(product.id))}
                className={`w-14 h-14 flex items-center justify-center border-2 rounded-xl transition-all group ${isInWishlist ? 'bg-nira-yellow border-nira-yellow text-nira-dark shadow-lg shadow-nira-yellow/20' : 'border-nira-gray-dark hover:bg-nira-gray text-nira-text-secondary hover:text-nira-error hover:border-nira-error/30'}`} 
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-6 h-6 transition-colors ${isInWishlist ? 'fill-nira-dark' : 'group-hover:fill-nira-error'}`} />
              </button>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: product.warranty + ' Warranty' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: RotateCcw, label: '7-Day Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-4 bg-nira-gray rounded-2xl text-center border border-nira-gray-dark">
                  <Icon className="w-6 h-6 text-nira-success" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading font-bold text-2xl">Similar Products</h2>
              <Link href="/buy" className="text-nira-yellow font-bold hover:underline flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

