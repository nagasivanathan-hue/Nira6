'use client';
import { use, useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, ShoppingCart, Heart, Shield, Truck, RotateCcw, ChevronRight, 
  Loader2, Sparkles, CheckCircle2, ArrowRight, Search, Eye, Users, Flame, Check, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { CONDITION_GRADES } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/cartSlice';
import { openCartDrawer } from '@/store/uiSlice';
import { fetchProductById, clearCurrentProduct } from '@/store/productSlice';
import { toggleWishlist } from '@/store/wishlistSlice';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import api from '@/services/api';

// Review structure matching backend API
interface DBReview {
  userName: string;
  avatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Amazon-style dynamic bundle recommendation helper
const getBundleAccessories = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('camera')) {
    return [
      { id: 'acc-sd', name: 'SanDisk Extreme Pro 128GB SDXC Card', price: 2499, image: 'https://images.unsplash.com/photo-1590244921250-d7f589b3c43f?w=150&q=80' },
      { id: 'acc-bat', name: 'Nira Dual Channel Battery Charger + NP-FZ100 Pack', price: 3899, image: 'https://images.unsplash.com/photo-1624456770275-c54d3cd251df?w=150&q=80' }
    ];
  } else if (cat.includes('lens')) {
    return [
      { id: 'acc-flt', name: 'K&F Concept 77mm Variable ND Filter ND2-ND400', price: 4200, image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27835?w=150&q=80' },
      { id: 'acc-kit', name: 'Professional Lens Cleaning Pen & Blower Kit', price: 899, image: 'https://images.unsplash.com/photo-1616423643764-7e57db37dc7b?w=150&q=80' }
    ];
  } else {
    return [
      { id: 'acc-tri', name: 'Nira Carbon Fiber Lightweight 62" Tripod Monopod', price: 5499, image: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?w=150&q=80' },
      { id: 'acc-light', name: 'Portable Mini Bi-Color LED Pocket Video Light', price: 1899, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80' }
    ];
  }
};

// Amazon-style custom Q&As helper
const getPreFilledQA = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('camera')) {
    return [
      { q: "Is the battery charger included in this package?", a: "Yes, all Nira certified cameras include an original or certified OEM battery charger, plus a power cord." },
      { q: "How many shutter counts does this specific unit have?", a: "Typically, cameras listed as 'Like New' have a shutter count below 8,000, while 'Excellent' is usually under 25,000." },
      { q: "Does it come in the original factory box?", a: "Original packaging is included if specified by the seller. However, if not available, Nira ships it in our custom eco-friendly protective packaging." }
    ];
  } else if (cat.includes('lens')) {
    return [
      { q: "Are there any scratches or dust particles inside the elements?", a: "No, all lenses undergo clean-room dust extraction and front/rear element checks. Any micro-imperfections are detailed in the grade diagnostics." },
      { q: "Is the original lens hood included?", a: "Yes, a protective hood and front/rear lens caps are included with every lens shipment." },
      { q: "Does the autofocus system work with newer mirrorless adapters?", a: "Yes, we verify firmware compatibility with official adapter mounts (e.g. Sony LA-EA5, Canon EF-EOS R)." }
    ];
  } else {
    return [
      { q: "Is this item covered under the 6-month warranty?", a: "Yes, all items sold on Nira marketplace are backed by our 6-Month Nira Shield warranty covering hardware defects." },
      { q: "Is this unit fully compatible with modern smartphones?", a: "Yes, devices that support wireless sync are tested with the latest iOS and Android app releases." }
    ];
  }
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const { currentProduct, loading: productsLoading, error, products } = useAppSelector((state) => state.products);
  const product = currentProduct || products.find(p => p.id === id);
  const loading = productsLoading && !product;
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const isInWishlist = product ? wishlistItems.some(item => item.id === product.id) : false;

  // New review/ratings state
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [localRating, setLocalRating] = useState<number | null>(null);
  const [localReviewCount, setLocalReviewCount] = useState<number | null>(null);
  const avgRatingState = localRating !== null ? localRating : (product?.rating || 4.5);
  const reviewCountState = localReviewCount !== null ? localReviewCount : (product?.reviewCount || 0);

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const list = localStorage.getItem('nira_recently_viewed');
      if (list) {
        try {
          return JSON.parse(list);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Amazon-style Bundle and Q&A state hooks
  const [selectedBundleItems, setSelectedBundleItems] = useState<string[]>([]);
  const [qaList, setQaList] = useState<{ q: string; a: string }[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [searchQuestionQuery, setSearchQuestionQuery] = useState('');

  // Image Magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [activeImage, setActiveImage] = useState<string>('');
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // Color swatch selection
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [notifyColor, setNotifyColor] = useState<string | null>(null);

  // Add to Cart animation state
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Social proof urgency
  const [viewerCount] = useState(() => Math.floor(Math.random() * 18) + 5);
  const [stockCount] = useState(() => Math.floor(Math.random() * 6) + 2);

  // Sticky buy bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  // Load product data
  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  // Load reviews, update LocalStorage trackers, and initialize Q&A / Bundles
  useEffect(() => {
    if (product) {
      Promise.resolve().then(() => setActiveImage(product.image));
      // 1. Fetch backend reviews
      Promise.resolve().then(() => setReviewsLoading(true));
      api.get(`/products/${product.id}/reviews`)
        .then((res) => {
          setReviews(res.data || []);
        })
        .catch(() => {})
        .finally(() => setReviewsLoading(false));

      // 2. LocalStorage Recently Viewed Gear Tracker
      const currentList = localStorage.getItem('nira_recently_viewed');
      let parsedList: Product[] = [];
      try {
        parsedList = currentList ? JSON.parse(currentList) : [];
      } catch {
        parsedList = [];
      }

      // Avoid duplicates of the current item, keep maximum of 4 items
      const filteredList = parsedList.filter((p: Product) => p.id !== product.id);
      const updatedList = [product, ...filteredList].slice(0, 4);
      localStorage.setItem('nira_recently_viewed', JSON.stringify(updatedList));
      const accessories = getBundleAccessories(product.category);
      Promise.resolve().then(() => {
        setRecentlyViewed(updatedList);
        setSelectedBundleItems([product.id, ...accessories.map(a => a.id)]);
        setQaList(getPreFilledQA(product.category));
        // Auto-select first in-stock color
        if (product.colors && product.colors.length > 0) {
          const firstInStock = product.colors.find(c => c.inStock);
          if (firstInStock) setSelectedColor(firstInStock.name);
        }
      });
    }
  }, [product]);

  // Sticky buy bar scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    const el = buyBoxRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [product]);

  // Image magnifier handler
  const handleMagnifierMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = imgContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMagnifierPos({ x, y });
  }, []);

  // Add to cart with animation feedback
  const handleAddToCartAnimated = useCallback(() => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    setTimeout(() => {
      dispatch(addToCart(product));
      dispatch(openCartDrawer());
      setAddingToCart(false);
      setAddedToCart(true);
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: { type: 'push', title: '🛒 Item Added to Cart!', content: `${product.name} was successfully loaded into shopping cart.` }
      }));
      setTimeout(() => setAddedToCart(false), 2500);
    }, 600);
  }, [product, addingToCart, dispatch]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userComment.trim()) {
      alert('Please write a brief comment detail for your diagnostics review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating: userRating,
        comment: userComment
      });

      // Update local states immediately
      setReviews([data.review, ...reviews]);
      setLocalRating(data.rating);
      setLocalReviewCount(data.reviewCount);
      setUserComment('');

      // Dispatch simulated notify event in bell drawer
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '⭐ Verified Review Added!',
          content: `You rated "${product?.name}" with ${userRating} Stars. Average recalculated: ${data.rating} ★`
        }
      }));

      alert('Thank you! Your diagnostics creator review has been verified & published.');
    } catch {
      alert('Failed to log review. You might need to login first.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-nira-yellow mx-auto mb-3" />
          <p className="text-nira-text-secondary text-sm font-semibold">Running 30-point diagnostics check...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <h2 className="text-2xl font-bold mb-4 font-heading">Product details not found</h2>
        <Link href="/buy" className="px-6 py-3 bg-nira-yellow text-nira-dark font-bold rounded-xl cursor-pointer">Back to Catalogues</Link>
      </div>
    );
  }

  // Similar items and grades definitions
  const similar = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const gradeKeyMap: Record<string, keyof typeof CONDITION_GRADES> = {
    'Like New': 'A+',
    'Excellent': 'A',
    'Good': 'B',
    'Fair': 'C'
  };
  const mappedGrade = gradeKeyMap[product.grade] || 'A';
  const gradeInfo = CONDITION_GRADES[mappedGrade];

  // Dynamic bundle calculations
  const bundleAccessories = getBundleAccessories(product.category);
  
  const toggleBundleItem = (itemId: string) => {
    if (itemId === product.id) return;
    setSelectedBundleItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const bundleTotal = product.price + bundleAccessories
    .filter(a => selectedBundleItems.includes(a.id))
    .reduce((sum, item) => sum + item.price, 0);

  const handleAddBundleToCart = () => {
    // Add main product
    dispatch(addToCart(product));
    
    // Add selected accessories
    bundleAccessories
      .filter(acc => selectedBundleItems.includes(acc.id))
      .forEach(acc => {
        dispatch(addToCart({
          id: acc.id,
          name: acc.name,
          brand: 'Nira Essentials',
          category: 'Accessories',
          price: acc.price,
          originalPrice: acc.price,
          discount: 0,
          image: acc.image,
          images: [acc.image],
          condition: 'Like New',
          grade: 'A+',
          warranty: '1 Year',
          rating: 5,
          reviewCount: 1,
          sellerName: 'Nira Certified',
          sellerRating: 5,
          specs: {},
          description: 'Essential accessory bundled with your gear.',
          emiAvailable: false,
          inStock: true,
          featured: false,
          trending: false,
          createdAt: new Date().toISOString()
        } as Product));
      });

    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: { 
        type: 'push', 
        title: '🛒 Bundle Added!', 
        content: `Main item and ${selectedBundleItems.filter(id => id !== product.id).length} accessories added to your shopping cart.` 
      }
    }));
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQaList(prev => [
      { q: newQuestion.trim(), a: "Hi! Thanks for asking. Our technical team is reviewing this query and will publish a certified response within 2 hours." },
      ...prev
    ]);
    setNewQuestion('');
  };


  // Stars progress logic computations
  const totalStarsCount = reviews.length || 1;
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: Math.round((reviews.filter(r => r.rating === stars).length / totalStarsCount) * 100)
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb breadcrumb links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-nira-text-secondary">
          <Link href="/" className="hover:text-nira-dark">Home</Link>
          <ChevronRight className="w-3 h-3 text-nira-text-secondary" />
          <Link href="/buy" className="hover:text-nira-dark">Marketplace</Link>
          <ChevronRight className="w-3 h-3 text-nira-text-secondary" />
          <span className="text-nira-dark font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Block: Image Showcase with Magnifier */}
          <div>
            <div 
              ref={imgContainerRef}
              className="relative aspect-square bg-gradient-to-br from-[#FAFCFF] via-[#F4F6FB] to-[#EBEDF2] rounded-3xl overflow-hidden mb-4 shadow-md border border-nira-gray-dark flex items-center justify-center cursor-crosshair group"
              onMouseEnter={() => setShowMagnifier(true)}
              onMouseLeave={() => setShowMagnifier(false)}
              onMouseMove={handleMagnifierMove}
            >
              <div className="absolute inset-0 p-8 flex items-center justify-center">
                <Image 
                  src={activeImage || product.image} 
                  alt={product.name} 
                  fill 
                  className="object-contain p-6 drop-shadow-2xl hover:scale-[1.03] transition-transform duration-500 ease-out" 
                  priority
                />
              </div>
              <span className={`absolute top-5 left-5 px-3 py-1.5 text-xs font-bold rounded-xl text-white shadow-lg backdrop-blur-sm border border-white/10 ${gradeInfo.colorClass}`}>
                Grade {product.grade} — {gradeInfo.label}
              </span>

              {/* Magnifier Lens */}
              {showMagnifier && (
                <div
                  className="absolute w-40 h-40 border-2 border-nira-yellow/60 rounded-full pointer-events-none z-10 shadow-2xl"
                  ref={(el) => {
                    if (el) {
                      el.style.left = `${magnifierPos.x}%`;
                      el.style.top = `${magnifierPos.y}%`;
                      el.style.transform = 'translate(-50%, -50%)';
                      el.style.backgroundImage = `url(${activeImage || product.image})`;
                      el.style.backgroundSize = '400%';
                      el.style.backgroundPosition = `${magnifierPos.x}% ${magnifierPos.y}%`;
                      el.style.backgroundRepeat = 'no-repeat';
                    }
                  }}
                />
              )}

              {/* Hover hint */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-3 h-3" /> Hover to zoom
              </div>
            </div>

            {/* Image Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    title={`View gallery image ${idx + 1}`}
                    aria-label={`View gallery image ${idx + 1}`}
                    className={`relative w-20 h-20 bg-gradient-to-br from-[#FAFCFF] via-[#F4F6FB] to-[#EBEDF2] rounded-xl overflow-hidden shadow-sm border transition-all cursor-pointer p-1 flex items-center justify-center ${
                      (activeImage || product.image) === img 
                        ? 'border-nira-yellow ring-2 ring-nira-yellow/30' 
                        : 'border-nira-gray-dark hover:border-nira-yellow/50'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image 
                        src={img} 
                        alt={`${product.name} Gallery ${idx + 1}`} 
                        fill 
                        className="object-contain"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Urgency Triggers */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5" />
                <span>{viewerCount} people viewing this right now</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <Flame className="w-3.5 h-3.5" />
                <span>Only {stockCount} left in stock!</span>
              </div>
            </div>
          </div>

          {/* Right Block: Product Variables */}
          <div>
            <p className="text-xs font-bold text-nira-yellow uppercase tracking-widest mb-1">{product.brand}</p>
            <h1 className="font-heading font-black text-2xl lg:text-3xl mb-3 text-nira-dark leading-tight">{product.name}</h1>

            {/* Stars rating stats metrics */}
            <div className="flex items-center gap-3 mb-4 border-b border-nira-gray-dark pb-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRatingState) ? 'text-nira-yellow fill-nira-yellow' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="font-bold text-xs text-nira-dark">{avgRatingState.toFixed(1)} ★</span>
              <span className="text-xs text-nira-text-secondary">({reviewCountState} verified creator reviews)</span>
            </div>

            {/* Price list breaks */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-heading font-black text-3xl text-nira-dark">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-nira-text-secondary line-through font-medium">{formatPrice(product.originalPrice)}</span>
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-wide">{product.discount}% OFF</span>
                </>
              )}
            </div>
            {product.emiAvailable && <p className="text-xs text-teal-700 mb-4 font-bold flex items-center gap-1">✨ Low-Cost EMI available starting from {formatPrice(Math.round(product.price / 12))}/month</p>}

            {/* Diagnostics guarantees banner lists - MOVED UP */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Shield, label: product.warranty || '6 Months Warranty' },
                { icon: Truck, label: 'Free Delivery' },
                { icon: RotateCcw, label: '7-Day Return Policy' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-neutral-50/80 rounded-xl text-center border border-neutral-100">
                  <Icon className="w-5 h-5 text-nira-yellow-dark" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-700 leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Description details */}
            <p className="text-neutral-600 text-xs leading-relaxed mb-6 bg-neutral-50 p-4 rounded-xl border border-neutral-100">{product.description}</p>


            {/* Color Variant Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2.5">Color Variant</h3>
                <div className="flex items-center gap-2.5">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => {
                        if (color.inStock) {
                          setSelectedColor(color.name);
                          setNotifyColor(null);
                        } else {
                          setNotifyColor(color.name);
                          setSelectedColor(null);
                        }
                      }}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        selectedColor === color.name ? 'border-nira-yellow scale-110 ring-2 ring-nira-yellow/30' :
                        notifyColor === color.name ? 'border-red-400 ring-2 ring-red-200' :
                        'border-neutral-200 hover:border-neutral-400'
                      } ${!color.inStock ? 'opacity-50' : ''}`}
                      ref={(el) => { if (el) el.style.backgroundColor = color.hex; }}
                      title={`${color.name}${!color.inStock ? ' (Out of Stock)' : ''}`}
                    >
                      {!color.inStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                        </div>
                      )}
                      {selectedColor === color.name && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-[10px] mt-1.5 text-neutral-500 font-semibold">Selected: {selectedColor}</p>
                )}
                {notifyColor && (
                  <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-700">{notifyColor} is out of stock.</span>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons triggers */}
            <div ref={buyBoxRef} className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleAddToCartAnimated}
                disabled={addingToCart || !!notifyColor}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-black tracking-wider uppercase text-xs rounded-xl shadow-md cursor-pointer transition-all ${
                  addedToCart
                    ? 'bg-emerald-500 text-white'
                    : notifyColor
                    ? 'bg-amber-400 text-amber-900 hover:bg-amber-500'
                    : 'bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark hover:scale-[1.02]'
                } disabled:opacity-60 disabled:hover:scale-100`}
              >
                {addingToCart ? (
                  <span className="w-5 h-5 border-2 border-nira-dark/30 border-t-nira-dark rounded-full animate-spin" />
                ) : addedToCart ? (
                  <><Check className="w-4 h-4" /> Added!</>
                ) : notifyColor ? (
                  <><Bell className="w-4 h-4" /> Notify Me</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                )}
              </button>
              <Link 
                href="/checkout"
                onClick={() => dispatch(addToCart(product))}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-nira-dark text-white font-black tracking-wider uppercase text-xs rounded-xl hover:bg-neutral-800 shadow-md hover:scale-[1.02] cursor-pointer transition-all"
              >
                Buy Now <ArrowRight className="w-4 h-4" />
              </Link>
              <button 
                onClick={() => product && dispatch(toggleWishlist(product.id))}
                className={`w-14 h-14 flex items-center justify-center border-2 rounded-xl transition-all group cursor-pointer ${isInWishlist ? 'bg-nira-yellow border-nira-yellow text-nira-dark' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-500 hover:text-red-500 hover:border-red-200'}`} 
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 transition-colors ${isInWishlist ? 'fill-nira-dark text-nira-dark' : 'group-hover:fill-red-500'}`} />
              </button>
            </div>
          </div>
        </div>

      {/* Amazon-Style Frequently Bought Together */}
      {bundleAccessories.length > 0 && (
        <div className="mt-16 pt-12 border-t border-neutral-200">
            <h2 className="font-heading font-black text-xl text-neutral-900 mb-6 flex items-center gap-2">
              Frequently Bought Together
            </h2>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Side: Images Flow */}
              <div className="flex-1 flex flex-wrap items-center gap-4">
                {/* Main Product */}
                <div className="relative w-28 h-28 bg-white border border-neutral-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                  <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
                </div>
                {bundleAccessories.map((acc) => (
                  <div key={acc.id} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-neutral-300">+</span>
                    <div className="relative w-28 h-28 bg-white border border-neutral-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => toggleBundleItem(acc.id)}>
                      <Image src={acc.image} alt={acc.name} fill className="object-contain p-2" />
                      {!selectedBundleItems.includes(acc.id) && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-xl transition-all" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side: Checklist and Action */}
              <div className="w-full lg:w-[380px] bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                <div className="space-y-3 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" checked readOnly className="mt-1 rounded text-nira-yellow focus:ring-nira-yellow border-neutral-300 w-4 h-4" />
                    <div className="text-sm">
                      <span className="font-bold text-neutral-800">This item:</span>{' '}
                      <span className="text-neutral-600 line-clamp-2 leading-snug">{product.name}</span>
                      <span className="font-black text-neutral-900 mt-1 block">{formatPrice(product.price)}</span>
                    </div>
                  </label>
                  
                  {bundleAccessories.map(acc => (
                    <label key={acc.id} className="flex items-start gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedBundleItems.includes(acc.id)}
                        onChange={() => toggleBundleItem(acc.id)}
                        className="mt-1 rounded text-nira-yellow focus:ring-nira-yellow border-neutral-300 w-4 h-4 cursor-pointer" 
                      />
                      <div className={`text-sm transition-opacity ${selectedBundleItems.includes(acc.id) ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                        <span className="text-neutral-700 line-clamp-2 leading-snug">{acc.name}</span>
                        <span className="font-black text-neutral-900 mt-1 block">{formatPrice(acc.price)}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="pt-5 border-t border-neutral-200">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-sm font-bold text-neutral-600">Total Price:</span>
                    <span className="text-2xl font-black text-neutral-900">{formatPrice(bundleTotal)}</span>
                  </div>
                  <button
                    onClick={handleAddBundleToCart}
                    className="w-full py-3.5 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark font-black tracking-wider uppercase text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    Add selected to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Reviews and Rating Center Panel */}
        <div className="mt-20 border-t border-nira-gray-dark pt-12">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Column 1: Rating breakdown percentage bars */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-heading font-bold text-lg text-nira-dark uppercase tracking-wider">Product diagnostics score</h3>
              <div className="flex items-center gap-4 bg-nira-gray/20 border border-nira-gray-dark p-5 rounded-2xl">
                <div className="text-center">
                  <p className="font-heading font-black text-4xl text-nira-dark">{avgRatingState.toFixed(1)}</p>
                  <p className="text-[9px] text-nira-text-secondary font-bold uppercase mt-1">Out of 5 Stars</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingCounts.map(({ stars, percentage }) => (
                    <div key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-right font-semibold">{stars}</span>
                      <div className="flex-1 h-2 bg-nira-gray rounded-full overflow-hidden">
                        <div className="h-full bg-nira-yellow rounded-full" ref={(el) => { if (el) el.style.width = `${percentage}%`; }} />
                      </div>
                      <span className="w-7 text-right text-[10px] text-nira-text-secondary font-bold">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit a verified comment reviews form */}
              <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl p-5 border border-nira-gray-dark shadow-sm space-y-3">
                <h4 className="font-heading font-bold text-xs text-nira-dark uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-nira-yellow" /> Log diagnostics review
                </h4>
                
                {/* Interactive Clickable Star ratings selections */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-0.5 text-gray-300 hover:scale-110 transition-transform cursor-pointer"
                      title={`Rate ${star} stars`}
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= (hoverRating ?? userRating) 
                            ? 'text-nira-yellow fill-nira-yellow' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-[10px] font-black uppercase text-nira-text-secondary ml-1">{userRating} Stars</span>
                </div>

                <div className="flex flex-col gap-1">
                  <textarea
                    placeholder="Provide diagnostic condition insights, lens clarity report, or button responsiveness details..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="px-3.5 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow w-full"
                    rows={3}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark font-black tracking-wider uppercase text-[10px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish verified review'}
                </button>
              </form>
            </div>

            {/* Column 2 & 3: Reviews list scrolls */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-heading font-bold text-lg text-nira-dark uppercase tracking-wider">Creator Reviews ({reviews.length})</h3>
              
              {reviewsLoading ? (
                <div className="py-10 text-center text-xs text-nira-text-secondary font-semibold">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-nira-yellow" /> Loading comments thread...
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 border border-dashed border-nira-gray-dark rounded-3xl text-center text-xs text-nira-text-secondary font-semibold bg-nira-gray/5">
                  No verified diagnostics comments exist for this device. Log the first one above!
                </div>
              ) : (
                <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                  {reviews.map((rev, idx) => (
                    <div key={idx} className="p-4 border border-nira-gray-dark rounded-2xl hover:bg-nira-gray/10 transition-all bg-white">
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-nira-dark text-nira-yellow font-black rounded-lg flex items-center justify-center text-xs uppercase">
                            {rev.userName?.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-nira-dark flex items-center gap-1">
                              {rev.userName} <span title="Verified buyer"><CheckCircle2 className="w-3.5 h-3.5 text-nira-success inline" /></span>
                            </p>
                            <p className="text-[8px] text-nira-text-secondary">{new Date(rev.createdAt || '2026-05-17T00:00:00.000Z').toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-nira-yellow fill-nira-yellow' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-nira-text-secondary leading-relaxed bg-nira-gray/20 p-2.5 rounded-xl">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Amazon-Style Customer Questions & Answers */}
        <div className="mt-20 border-t border-nira-gray-dark pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider flex items-center gap-1.5">
                💬 Customer Questions & Answers
              </h2>
              <p className="text-xs text-nira-text-secondary mt-1">Have a question about this gear? Ask verified sellers and the community.</p>
            </div>
            {/* Search Q&A Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuestionQuery}
                onChange={(e) => setSearchQuestionQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-nira-gray-dark rounded-xl text-xs focus:outline-none focus:border-nira-yellow bg-nira-gray/20"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left form to ask a question */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-5 border border-nira-gray-dark shadow-sm">
                <h4 className="font-heading font-bold text-xs text-nira-dark uppercase tracking-widest mb-3">
                  Ask the Community
                </h4>
                <form onSubmit={handleAskQuestion} className="space-y-3">
                  <textarea
                    placeholder="e.g. Does it work with third-party battery grips?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full p-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow text-neutral-800"
                    rows={3}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark font-black tracking-wider uppercase text-[10px] rounded-xl cursor-pointer transition-colors"
                  >
                    Submit Question
                  </button>
                </form>
              </div>
            </div>

            {/* Q&A List */}
            <div className="lg:col-span-2 space-y-4">
              {qaList.filter(item => 
                item.q.toLowerCase().includes(searchQuestionQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuestionQuery.toLowerCase())
              ).length === 0 ? (
                <div className="p-8 border border-dashed border-nira-gray-dark rounded-2xl text-center text-xs text-nira-text-secondary font-semibold bg-neutral-50/50">
                  No matching questions found. Be the first to ask!
                </div>
              ) : (
                qaList.filter(item => 
                  item.q.toLowerCase().includes(searchQuestionQuery.toLowerCase()) ||
                  item.a.toLowerCase().includes(searchQuestionQuery.toLowerCase())
                ).map((qa, index) => (
                  <div key={index} className="p-5 border border-nira-gray-dark bg-white rounded-2xl hover:bg-neutral-50 transition-all shadow-sm">
                    <div className="flex gap-2">
                      <span className="text-xs font-black text-nira-yellow bg-nira-dark px-1.5 py-0.5 rounded h-fit">Q</span>
                      <p className="text-xs font-bold text-nira-dark leading-snug">{qa.q}</p>
                    </div>
                    <div className="flex gap-2 mt-3.5 pl-2 border-l-2 border-nira-yellow">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded h-fit">A</span>
                      <p className="text-xs text-neutral-600 leading-relaxed">{qa.a}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recently Viewed horizontal grid */}
        {recentlyViewed.length > 1 && (
          <div className="mt-20 border-t border-nira-gray-dark pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">Recently Viewed Gear</h2>
              <span className="text-[10px] bg-nira-gray px-2 py-0.5 rounded-full font-bold text-nira-text-secondary">Tracking active</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.filter((item: Product) => item.id !== product.id).map((p: Product) => (
                <div key={p.id} className="group relative border border-nira-gray-dark bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
                  <div className="aspect-square relative bg-nira-gray/20 rounded-2xl overflow-hidden mb-3.5 flex items-center justify-center p-3">
                    <Image src={p.image} alt={p.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-nira-text-secondary uppercase">{p.brand}</p>
                    <Link href={`/buy/${p.id}`} className="font-bold text-xs text-nira-dark mt-1 hover:text-nira-yellow block truncate">{p.name}</Link>
                    <p className="font-black text-xs mt-2 text-nira-dark">{formatPrice(p.price)}</p>
                  </div>
                  <Link href={`/buy/${p.id}`} className="mt-3 py-2 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white rounded-xl text-[10px] font-black uppercase text-center block tracking-widest cursor-pointer transition-all">Inspect Gear</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar / Smart Recommended Products Carousel */}
        {similar.length > 0 && (
          <div className="mt-20 border-t border-nira-gray-dark pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-5 h-5 text-nira-yellow animate-spin" style={{ animationDuration: '8s' }} /> Recommended Creative Gear
              </h2>
              <Link href="/buy" className="text-xs text-nira-yellow font-black uppercase tracking-wider hover:underline flex items-center gap-0.5 cursor-pointer">Explore Catalog <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}

        {/* Desktop Sticky Buy Bar */}
        {showStickyBar && (
          <div className="fixed top-16 lg:top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-100 shadow-md hidden lg:block animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center p-1.5 flex-shrink-0">
                  <Image src={product.image} alt={product.name} width={36} height={36} className="object-contain" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-neutral-900 truncate max-w-[300px]">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(avgRatingState) ? 'text-nira-yellow fill-nira-yellow' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-500 font-semibold">{avgRatingState.toFixed(1)} ({reviewCountState})</span>
                    <span className="text-[9px] font-bold text-nira-success bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Grade {product.grade}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-heading font-black text-lg text-neutral-900">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-neutral-400 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <button
                  onClick={handleAddToCartAnimated}
                  disabled={addingToCart}
                  className="px-5 py-2.5 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark font-black uppercase text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-60"
                >
                  {addingToCart ? (
                    <span className="w-4 h-4 border-2 border-nira-dark/30 border-t-nira-dark rounded-full animate-spin" />
                  ) : addedToCart ? (
                    <><Check className="w-4 h-4" /> Added</>
                  ) : (
                    <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Mobile Buy Bar */}
        <AnimatePresence>
          {showStickyBar && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] lg:hidden flex gap-3"
            >
              <button 
                onClick={handleAddToCartAnimated}
                disabled={addingToCart || !!notifyColor}
                className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex justify-center items-center gap-2 ${
                  addedToCart ? 'bg-emerald-500 text-white' : notifyColor ? 'bg-amber-400 text-amber-900' : 'bg-nira-yellow text-nira-dark'
                }`}
              >
                {addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                {addedToCart ? 'Added' : notifyColor ? 'Notify' : 'Add to Cart'}
              </button>
              <Link 
                href="/checkout"
                onClick={() => dispatch(addToCart(product))}
                className="flex-1 py-3.5 bg-nira-dark text-white rounded-xl font-black text-xs uppercase tracking-wider flex justify-center items-center gap-1.5"
              >
                Buy Now <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
