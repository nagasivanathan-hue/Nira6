'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, Briefcase 
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
        className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 border-b border-white/5"
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
          {/* Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#07070a_95%)]" />
        </div>

        {/* Camera HUD Grid lines */}
        <div className="absolute inset-x-8 inset-y-16 border border-white/[0.03] pointer-events-none z-10 rounded-3xl">
          {/* HUD Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/10" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/10" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/10" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/10" />
          
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
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-nira-yellow animate-pulse" />
              <span className="text-[11px] uppercase font-mono tracking-widest text-neutral-300">
                The Flagship Recommerce & Creator Ecosystem
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-8xl tracking-tight text-white leading-none mb-8 max-w-5xl">
              EVERYTHING FOR A
              <br />
              <span className="text-gradient-cinema drop-shadow-[0_0_30px_rgba(255,218,3,0.15)]">CREATOR</span> IN ONE PLACE
            </h1>

            {/* Description */}
            <p className="text-neutral-400 text-lg sm:text-xl font-light mb-12 max-w-2xl leading-relaxed">
              Buy, sell, rent, and repair cinematography gear. Engage in vertical short-form reels, sync with top creators, and launch portfolio studios.
            </p>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full justify-center">
              <Link 
                href="/studio"
                className="w-full sm:w-auto px-8 py-4 bg-nira-yellow text-nira-dark font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-nira-yellow-dark transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_4px_20px_rgba(255,218,3,0.15)] hover:shadow-[0_4px_30px_rgba(255,218,3,0.3)]"
              >
                <Sparkles className="w-4 h-4 text-nira-dark" />
                Enter Creator Studio
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link 
                href="/services"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-[#FFDA03]" />
                Hire Creator Services
              </Link>
              <Link
                href="/creators/reels"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-neutral-400 font-bold text-xs uppercase tracking-widest rounded-xl border border-white/5 hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current text-white/50" />
                Watch Creator Reels
              </Link>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/5 pt-12 w-full max-w-4xl text-left">
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
            </div>

          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Scroll Down</span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1">
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1 h-1.5 bg-nira-yellow rounded-full" 
            />
          </div>
        </div>
      </section>

      {/* 1.5. NATIVE E-COMMERCE DISCOVERY SECTION */}
      <section className="relative w-full border-b border-white/5 pb-20">
        <FeaturedDeals />
        <TrendingGear />
      </section>

    </div>
  );
}
