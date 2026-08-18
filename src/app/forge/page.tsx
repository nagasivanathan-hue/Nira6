'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Wand2,
  ShoppingBag,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_FORGE_PRODUCTS } from '@/lib/services/forgeService';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch } from '@/store';
import { addToCart } from '@/store/cartSlice';

export default function ForgeHomePage() {
  const dispatch = useAppDispatch();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleQuickAdd = (p: typeof SAMPLE_FORGE_PRODUCTS[0]) => {
    // Adapt ForgeProduct to NIRA6 Product interface for Cart compatibility
    const adaptedProduct = {
      id: p.id,
      name: p.name,
      brand: 'Forge Your Ideas',
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
      image: p.images[0],
      images: p.images,
      condition: 'Like New' as const,
      grade: 'A+' as const,
      warranty: 'NIRA6 Quality Guarantee',
      rating: p.rating,
      reviewCount: p.reviewCount,
      sellerName: 'FYI Production Lab',
      sellerRating: 4.9,
      specs: {
        Material: p.defaultMaterial,
        Dimensions: p.dimensions,
        Weight: `${p.weightGrams}g`,
      },
      description: p.description,
      emiAvailable: false,
      inStock: p.inStock,
      featured: p.featured,
      trending: true,
      createdAt: p.createdAt || new Date().toISOString(),
    };

    dispatch(addToCart(adaptedProduct));
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 px-4 border-b border-zinc-900 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold tracking-wide uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" /> High-Precision 3D Printing & Rapid Prototyping
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-extrabold text-4xl sm:text-6xl md:text-7xl text-zinc-100 tracking-tight leading-none uppercase font-mono"
          >
            TURN YOUR IDEAS INTO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">REALITY.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto text-zinc-400 text-base sm:text-lg md:text-xl font-normal leading-relaxed"
          >
            Upload your 3D models or choose from our curated collection of functional parts, desk accessories, and custom prototypes. Instant slicing, real-time quotes, and high-precision production.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/forge/custom"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-sm tracking-wide rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <UploadCloud className="w-5 h-5" /> START A CUSTOM PRINT
            </Link>

            <Link
              href="#marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-sm rounded-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" /> BROWSE MARKETPLACE
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-2"
          >
            <Link
              href="/forge/design"
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-amber-400 transition-colors uppercase tracking-wider group"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" /> Don&apos;t have a 3D model? <span className="underline group-hover:no-underline font-bold text-amber-400">Request Custom Design Work</span> <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. FOUR SERVICE CARDS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 space-y-2">
          <span className="font-mono text-xs font-semibold text-amber-500 uppercase tracking-widest">Capacities & Vertical Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-100 uppercase">OUR 3D PRINTING SERVICES</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-mono text-zinc-100 uppercase">Custom 3D Printing</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Upload your STL, 3MF, or OBJ files for real-time slicing analysis, layer height tweaking, material selection, and instant price quotes.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/forge/custom" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300">
                Configure Print <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-mono text-zinc-100 uppercase">CAD Design Request</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                No 3D file? Submit sketches, photos, or broken part measurements. Our CAD engineers create custom 3D models tailored to your specs.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/forge/design" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300">
                Submit Request <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-mono text-zinc-100 uppercase">Ready-Made Shop</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Explore pre-tested functional desk accessories, camera accessories, cable organizers, and art pieces ready for instant purchase.
              </p>
            </div>
            <div className="pt-6">
              <Link href="#marketplace" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300">
                Shop Marketplace <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-mono text-zinc-100 uppercase">Bulk Production</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Need 50+ units for product runs, events, or merchandise? Enjoy volume discounts, dedicated print farm scheduling, and custom branding.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/forge/custom?bulk=true" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300">
                Get Bulk Quote <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. READY-MADE PRODUCTS MARKETPLACE GRID (Phase 1 Preview) */}
      <section id="marketplace" className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 pb-4 border-b border-zinc-800 gap-4">
          <div>
            <span className="font-mono text-xs font-semibold text-amber-500 uppercase tracking-widest">Curated Collection</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100 uppercase">FEATURED 3D PRINTED PRODUCTS</h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All items in stock & printed to order
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_FORGE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 px-2.5 py-1 rounded text-[10px] font-mono text-amber-400 uppercase">
                    {product.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-sm text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Mat: <strong className="text-zinc-200">{product.defaultMaterial}</strong></span>
                    <span>Dim: <strong className="text-zinc-200">{product.dimensions}</strong></span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-800/80 mt-2">
                <div>
                  <span className="text-xs text-zinc-500 block font-mono">Price</span>
                  <span className="font-mono font-bold text-base text-zinc-100">{formatPrice(product.price)}</span>
                </div>

                <button
                  onClick={() => handleQuickAdd(product)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    addedId === product.id
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-zinc-800 hover:bg-amber-500 text-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  {addedId === product.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. "HOW IT WORKS" 5-STEP PROCESS SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-12">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 sm:p-12 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="font-mono text-xs font-semibold text-amber-500 uppercase tracking-widest">Streamlined Production Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-100 uppercase">HOW FORGE WORKS IN 5 STEPS</h2>
            <p className="text-zinc-400 text-sm">From digital design file to high-precision physical print delivered to your door.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Step 1 */}
            <div className="space-y-4 text-center md:text-left bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="font-mono font-bold text-sm text-zinc-100 uppercase">Upload or Select</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Drag & drop your STL/3MF/OBJ file or pick a pre-tested part from our catalog.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-center md:text-left bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="font-mono font-bold text-sm text-zinc-100 uppercase">Configure Options</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Choose material (PLA, PETG, ABS, TPU), color, infill density, and surface finishing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-center md:text-left bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="font-mono font-bold text-sm text-zinc-100 uppercase">Instant Slicing</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Our engine verifies volume, checks build-plate fit, and calculates itemized pricing in real time.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 text-center md:text-left bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                04
              </div>
              <h3 className="font-mono font-bold text-sm text-zinc-100 uppercase">High-Speed Print</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Automated assignment to our Bambu Lab & Prusa fleet with real-time status tracking.
              </p>
            </div>

            {/* Step 5 */}
            <div className="space-y-4 text-center md:text-left bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                05
              </div>
              <h3 className="font-mono font-bold text-sm text-zinc-100 uppercase">QC & Dispatch</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Multi-point quality inspection, post-processing cleaning, and fast express shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TECH SPECS & TRUST BANNER */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">0.08mm</span>
            <p className="text-zinc-400 text-xs">Min Layer Precision</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">256³mm</span>
            <p className="text-zinc-400 text-xs">Single-Piece Build Volume</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">24-48h</span>
            <p className="text-zinc-400 text-xs">Avg Production Dispatch</p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">100%</span>
            <p className="text-zinc-400 text-xs">Reprint Quality Guarantee</p>
          </div>
        </div>
      </section>
    </div>
  );
}
