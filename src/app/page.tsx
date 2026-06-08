'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Shield, Truck, Award, Star, ChevronDown, Camera, CheckCircle2
} from 'lucide-react';
import TrendingGear from '@/components/home/TrendingGear';
import FeaturedDeals from '@/components/home/FeaturedDeals';

// Counter component for animated statistics
function StatCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString('en-IN')}</span>;
}

// Word-by-word headline reveal
function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ 
            delay: delay + i * 0.08, 
            duration: 0.5, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

// Featured Gear Showcase Card for right column
function GearShowcaseCard() {
  const [activeGear, setActiveGear] = useState(0);
  const gearItems = [
    { 
      name: 'Sony FX6', 
      category: 'Cinema Camera', 
      price: '₹3,89,990',
      condition: 'Like New',
      rating: 4.9,
      image: '/assets/product-camera.png',
      specs: ['4K 120fps', 'S-Cinetone', 'Dual ISO']
    },
    { 
      name: 'DJI Inspire 3', 
      category: 'Professional Drone', 
      price: '₹6,49,000',
      condition: 'Certified',
      rating: 4.8,
      image: '/assets/product-drone.png',
      specs: ['8K RAW', 'Waypoint Pro', 'O3 Pro']
    },
    { 
      name: 'Sigma 35mm f/1.4', 
      category: 'Art Series Lens', 
      price: '₹62,490',
      condition: 'Excellent',
      rating: 4.9,
      image: '/assets/product-lens.png',
      specs: ['f/1.4 Art', 'HSM AF', 'Low Distortion']
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGear(prev => (prev + 1) % gearItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [gearItems.length]);

  const gear = gearItems[activeGear];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full max-w-[420px]"
    >
      {/* Card Container */}
      <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl overflow-hidden group hover:border-nira-yellow/20 transition-all duration-500">
        
        {/* Subtle glow behind the card */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-nira-yellow/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 px-3 py-1 bg-nira-yellow/10 border border-nira-yellow/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-nira-yellow rounded-full animate-pulse" />
            <span className="text-[10px] text-nira-yellow font-bold uppercase tracking-wider">Featured Listing</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-nira-yellow fill-nira-yellow" />
            <span className="text-xs text-white font-bold">{gear.rating}</span>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative w-full h-52 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl" />
          <motion.div
            key={activeGear}
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative w-40 h-40"
          >
            <Image 
              src={gear.image}
              alt={gear.name}
              fill
              sizes="160px"
              className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
            />
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{gear.category}</p>
            <h3 className="text-xl font-heading font-black text-white mt-0.5">{gear.name}</h3>
          </div>
          
          {/* Specs Tags */}
          <div className="flex flex-wrap gap-1.5">
            {gear.specs.map(spec => (
              <span key={spec} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                {spec}
              </span>
            ))}
          </div>

          {/* Price & Condition */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div>
              <p className="text-2xl font-heading font-black text-white">{gear.price}</p>
              <p className="text-[10px] text-neutral-500 font-medium">incl. of all taxes</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-bold">{gear.condition}</span>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {gearItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveGear(i)}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeGear ? 'w-6 bg-nira-yellow' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`View gear item ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating trust micro-badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-[#111]/90 border border-white/10 rounded-full backdrop-blur-md shadow-2xl"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] text-neutral-300 font-bold">NIRA6 Verified • Escrow Protected</span>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Mouse move listener for cinematic parallax radial gradient glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current && glowRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        glowRef.current.style.left = `${e.clientX - rect.left - 300}px`;
        glowRef.current.style.top = `${e.clientY - rect.top - 300}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="rent-dark min-h-screen font-body overflow-x-hidden selection:bg-nira-yellow selection:text-nira-dark relative">
      
      {/* Background Subtle Viewfinder Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* 1. HERO SECTION */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden py-32 border-b border-white/5"
      >
        {/* Dynamic Glow Spotlight following mouse */}
        <div 
          ref={glowRef}
          className="absolute w-[600px] h-[600px] bg-nira-yellow/5 rounded-full blur-[160px] pointer-events-none transition-transform duration-100 ease-out z-10 hidden md:block"
        />

        {/* 85mm f/1.4 Sim: Shallow Depth of Field Background Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] bg-nira-yellow/5 rounded-full blur-[160px] pointer-events-none" />
          
          <Image
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1920"
            alt="Cinematic Background Backdrop"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25 filter blur-[12px] scale-105 select-none pointer-events-none"
          />
          {/* Dark Vignette Overlay — enhanced radial for more depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(7,7,10,0.5)_50%,#07070a_90%)]" />
        </div>

        {/* Film Grain Texture Overlay */}
        <div className="absolute inset-0 z-[5] pointer-events-none opacity-[0.045] film-grain-overlay" />

        {/* Camera HUD Viewfinder Corners — more prominent, fade-in on load */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-x-6 sm:inset-x-8 inset-y-12 sm:inset-y-16 pointer-events-none z-10"
        >
          {/* Top-Left Corner */}
          <div className="absolute top-0 left-0">
            <div className="w-5 h-[2px] bg-white/30" />
            <div className="w-[2px] h-5 bg-white/30" />
          </div>
          {/* Top-Right Corner */}
          <div className="absolute top-0 right-0">
            <div className="w-5 h-[2px] bg-white/30 ml-auto" />
            <div className="w-[2px] h-5 bg-white/30 ml-auto" />
          </div>
          {/* Bottom-Left Corner */}
          <div className="absolute bottom-0 left-0">
            <div className="w-[2px] h-5 bg-white/30" />
            <div className="w-5 h-[2px] bg-white/30" />
          </div>
          {/* Bottom-Right Corner */}
          <div className="absolute bottom-0 right-0">
            <div className="w-[2px] h-5 bg-white/30 ml-auto" />
            <div className="w-5 h-[2px] bg-white/30 ml-auto" />
          </div>
          
          {/* Telemetry Monospace Overlay */}
          <div className="absolute top-4 left-6 hidden md:flex items-center gap-4 text-[9px] font-mono text-neutral-500">
            <span>STBY</span>
            <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full" />
            <span>RAW 12bit</span>
          </div>
          <div className="absolute top-4 right-6 hidden md:flex items-center gap-4 text-[9px] font-mono text-neutral-500">
            <span>F2.8</span>
            <span>1/250s</span>
            <span>ISO 800</span>
          </div>
        </motion.div>

        {/* Hero Content — Two Column Layout */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-20">

            {/* LEFT COLUMN — Headline + CTAs */}
            <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
              
              {/* Tagline Badge — enlarged with yellow dot pulse */}
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nira-yellow/60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-nira-yellow" />
                </span>
                <span className="text-[11px] sm:text-xs uppercase font-mono tracking-[0.15em] text-neutral-300 font-medium">
                  The Flagship Recommerce & Creator Ecosystem
                </span>
              </motion.div>

              {/* Headline — word-by-word reveal */}
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl tracking-[0.02em] text-white leading-[1.05] mb-6">
                <WordReveal text="EVERYTHING FOR A" delay={0.4} />
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.55, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="inline-block mr-[0.3em] text-nira-yellow drop-shadow-[0_0_30px_rgba(255,218,3,0.2)]"
                >
                  CREATOR
                </motion.span>
                <WordReveal text="IN ONE PLACE" delay={0.6} />
              </h1>

              {/* Subtitle — larger, fades up */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-neutral-400 text-base sm:text-lg md:text-xl font-light mb-10 max-w-xl mx-auto lg:mx-0 leading-[1.65]"
              >
                Buy, sell, rent, and repair cinematography gear. Engage with top creators and launch your studio.
              </motion.p>

              {/* CTA Buttons — slide up */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-12 w-full"
              >
                <Link 
                  href="/buy"
                  className="w-full sm:w-auto px-8 py-4 bg-nira-yellow text-nira-dark font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-nira-yellow-dark transition-all duration-300 flex items-center justify-center gap-2.5 group shadow-[0_4px_25px_rgba(255,218,3,0.2)] hover:shadow-[0_4px_35px_rgba(255,218,3,0.35)]"
                >
                  <Camera className="w-4 h-4" />
                  Explore Gear
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <Link 
                  href="/sell"
                  className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold text-xs uppercase tracking-widest rounded-xl border-2 border-white/25 hover:border-white/50 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2.5"
                >
                  List Your Gear
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-5 text-neutral-500 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Verified Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-nira-yellow" />
                  <span>6-Month Warranty</span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN — Gear Showcase Card (hidden on mobile) */}
            <div className="hidden md:flex flex-shrink-0 justify-center lg:justify-end">
              <GearShowcaseCard />
            </div>
          </div>

          {/* Stats Row — below the two columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/5 pt-12 mt-16 w-full max-w-5xl mx-auto lg:mx-0 text-left"
          >
            <div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-1 font-mono tracking-tight">
                <StatCounter value={50} />K+
              </h3>
              <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Verified Creators</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-1 font-mono tracking-tight">
                ₹<StatCounter value={75} />L+
              </h3>
              <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Transactions Completed</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-1 font-mono tracking-tight">
                <StatCounter value={400} />ms
              </h3>
              <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">AI Matching Speed</p>
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-1 font-mono tracking-tight">
                100%
              </h3>
              <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">Quality Inspection Guaranteed</p>
            </div>
          </motion.div>
        </div>

        {/* Scroll-Down Indicator — bounce animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
        >
          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-nira-yellow/70" />
          </motion.div>
        </motion.div>
      </section>

      {/* 1.5. NATIVE E-COMMERCE DISCOVERY SECTION */}
      <section className="relative w-full border-b border-white/5 pb-20">
        <FeaturedDeals />
        <TrendingGear />
      </section>

    </div>
  );
}
