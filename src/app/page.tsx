'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, Shield, TrendingUp, 
  Cpu, Layers, Star, 
  Compass, DollarSign, Activity, Eye, Heart, Share2, Clapperboard,
  Briefcase, RefreshCw, Sliders, Camera, Package, Zap
} from 'lucide-react';
import ProductCarousel from '@/components/products/ProductCarousel';
import { mockProducts } from '@/lib/mockData';

const formatPrice = (p: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(p);
};

interface CapabilityFeature {
  title: string;
  desc: string;
  iconName: string;
  glow: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clapperboard,
  Compass,
  DollarSign,
  Cpu,
  Activity,
  Layers
};

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [demoOpen, setDemoOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Mouse move listener for cinematic parallax radial gradient glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [features, setFeatures] = useState<CapabilityFeature[]>([
    {
      title: "Vertical Reels Ecosystem",
      desc: "Full-screen edge-to-edge cinematic short-form media hub customized for visual storytellers and filmmakers.",
      iconName: "Clapperboard",
      glow: "from-purple-500/20 to-indigo-500/20"
    },
    {
      title: "Smart Camera Rentals",
      desc: "Instantly reserve cinema rigs, prime glass, or heavy-lift drones near you with real-time slot checking.",
      iconName: "Compass",
      glow: "from-amber-500/20 to-orange-500/20"
    },
    {
      title: "Refurbished Gear Recommerce",
      desc: "P2P verified marketplace for buying and selling gear with 50+ points inspection certificates.",
      iconName: "DollarSign",
      glow: "from-emerald-500/20 to-teal-500/20"
    },
    {
      title: "Creator AI Matchmaker",
      desc: "Programmatic algorithmic pairing matching brands with top photographers, models, and directors.",
      iconName: "Cpu",
      glow: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Creator Studio Analytics",
      desc: "Real-time viewer retention analytics, completion metrics, and earnings telemetry log dashboard.",
      iconName: "Activity",
      glow: "from-red-500/20 to-pink-500/20"
    },
    {
      title: "Modular Cloud Portfolios",
      desc: "Host high-bitrate showreels, EXIF data archives, and customized interactive digital portfolios.",
      iconName: "Layers",
      glow: "from-violet-500/20 to-fuchsia-500/20"
    }
  ]);

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const res = await fetch('/api/capabilities');
        if (res.ok) {
          const data = await res.json();
          setFeatures(data);
        }
      } catch (err) {
        console.error('Failed to fetch capabilities:', err);
      }
    };
    fetchCapabilities();
  }, []);

  const reels = [
    {
      id: "r1",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
      creator: "Arjun Sen",
      title: "Shadows of Madurai",
      likes: "4.8K",
      views: "24K"
    },
    {
      id: "r2",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80",
      creator: "Kira Sharma",
      title: "Neon Monsoon Rhapsody",
      likes: "9.2K",
      views: "48K"
    },
    {
      id: "r3",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      creator: "Rohan Das",
      title: "RED V-Raptor Cinematic Shakedown",
      likes: "12K",
      views: "110K"
    }
  ];

  const products = [
    {
      name: "Sony FX3 Cinema Line",
      category: "Cinema Camera",
      price: "₹3,42,000",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80",
      tags: ["Full-Frame", "120 FPS", "Dual Base ISO"]
    },
    {
      name: "RED Komodo 6K Rigs",
      category: "Refurbished Production Kit",
      price: "₹5,10,000",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80",
      tags: ["Global Shutter", "6K RAW", "RF Mount"]
    },
    {
      name: "DJI Inspire 3 Drone",
      category: "Heavy Lift Rental",
      price: "₹18,500/day",
      image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300&q=80",
      tags: ["8K ProRes", "Dual RTK GPS", "Full-Frame Gimbal"]
    }
  ];

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
          className="absolute w-[600px] h-[600px] bg-nira-yellow/5 rounded-full blur-[160px] pointer-events-none transition-transform duration-100 ease-out z-10 hidden md:block"
          style={{
            left: `${mousePosition.x - 300}px`,
            top: `${mousePosition.y - 300}px`,
          }}
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

      {/* 1.5. E-COMMERCE DISCOVERY SECTION (AMAZON-UX) */}
      <section className="relative py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFDA03]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> TODAY'S LIGHTNING DEALS
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                Up to 40% Off Premium Gear
              </h2>
            </div>
            <Link href="/buy?sort=discount" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-nira-yellow transition-colors group">
              View All Deals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ProductCarousel 
            title=""
            products={mockProducts.filter(p => p.discount > 20).slice(0, 8)} 
            theme="dark"
          />
        </div>

        <div className="mb-20">
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
          <ProductCarousel 
            title=""
            products={mockProducts.filter(p => p.brand === 'Sony' || p.brand === 'DJI').slice(0, 8)} 
            theme="dark"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-widest text-purple-400 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI CURATED
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
                Recommended For You
              </h2>
            </div>
            <Link href="/buy" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-purple-400 transition-colors group">
              Update Preferences <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ProductCarousel 
            title=""
            products={mockProducts.slice(4, 12)} 
            theme="dark"
          />
        </div>
      </section>

      {/* 2. ABOUT THE PLATFORM SECTION */}
      <section className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute top-1/3 left-[-10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Sticky Left Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
              [ 01 / THE MISSION ]
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-8">
              A Platform Engineered For Photographers & Filmmakers.
            </h2>
            <p className="text-neutral-400 font-light text-base leading-relaxed mb-6">
              NIRA6 represents the convergence of high-performance gear acquisition, content production, and AI-enabled talent discovery.
            </p>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              We eliminate the friction of renting camera gears, verify P2P second-hand items with strict certifications, and hook you up directly with top-paying productions.
            </p>
            <Link 
              href="/about" 
              className="inline-flex items-center gap-2 text-xs font-mono text-white hover:text-nira-yellow transition-colors group"
            >
              READ ROADMAP VISION
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Cards Right Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card-dark rounded-2xl p-8 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-xl bg-nira-yellow/10 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-nira-yellow" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dual Quality Inspections</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Every camera body, cine lens, or gimbal is tested by certified specialists. Checks cover sensor dead-pixels, stabilization drift, and mount wear.
              </p>
            </div>

            <div className="card-dark rounded-2xl p-8 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Creator Indexing</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Skip manual filtering. Our AI models index crew portfolios, geographic availability, and device ownership to deliver the perfect team matching.
              </p>
            </div>

            <div className="card-dark rounded-2xl p-8 bg-white/[0.01]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Monetization Engine</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Rent out your idle kits safely with comprehensive equipment damage protection and automated digital security checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE SHOWCASE */}
      <section id="features" className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
            [ 02 / CAPABILITIES ]
          </span>
          <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Comprehensive Platform Matrix
          </h2>
          <p className="text-neutral-400 mt-4 text-sm sm:text-base font-light">
            Engineered with modern APIs and UI grids optimized for extreme speed and precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature: CapabilityFeature, idx) => {
            const Icon = ICON_MAP[feature.iconName] || Compass;
            return (
              <motion.div 
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="card-dark rounded-2xl p-8 bg-white/[0.01] flex flex-col justify-between relative overflow-hidden group cursor-pointer"
              >
                {/* Accent Hover Glow Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:border-nira-yellow/30 group-hover:bg-white/10 transition-colors">
                    <Icon className="w-5 h-5 text-white group-hover:text-nira-yellow transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight group-hover:text-nira-yellow transition-colors">{feature.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed font-light mb-8">{feature.desc}</p>
                </div>

                <div className="relative z-10 flex items-center gap-1.5 text-xs font-mono text-neutral-500 group-hover:text-white transition-colors">
                  <span>LAUNCH MODULE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3.5. CREATOR STUDIO SHOWCASE */}
      <section className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-[#FFDA03]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
              [ 03 / CREATOR STUDIO ]
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
              The AI-Powered Creator Sandbox
            </h2>
            <p className="text-neutral-400 mt-4 text-sm sm:text-base font-light leading-relaxed">
              Design productions faster, swap professional editing for cinema gear rentals, and get instant machine-vision diagnostic quotes for your equipment.
            </p>
          </div>
          <Link 
            href="/studio" 
            className="px-8 py-4 bg-nira-yellow text-nira-dark font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center gap-2 group whitespace-nowrap shadow-[0_4px_25px_rgba(255,218,3,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-nira-dark" />
            Launch Creator Studio
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Studio Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Sparkles,
              title: "AI DP Concierge",
              badge: "Natural Language",
              desc: "Describe your scene vision or composition settings in plain English. The AI analyzes requirements to curate the exact matching camera bodies, lenses, and lighting packages.",
              color: "text-[#FFDA03]"
            },
            {
              icon: Sliders,
              title: "Wear & Tear Grader",
              badge: "Machine Vision",
              desc: "Upload photos of your camera body or lenses. Our neural network detects cosmetic abrasions, counts sensor pixel errors, and provides instant cash buyout rates.",
              color: "text-indigo-400"
            },
            {
              icon: RefreshCw,
              title: "Barter Marketplace",
              badge: "Peer-to-Peer Trades",
              desc: "Don't spend cash on rentals. Post editing, coloring, or sound design services on the board to trade directly with other creators in exchange for active gear reservations.",
              color: "text-emerald-400"
            },
            {
              icon: Camera,
              title: "Creators Garage",
              badge: "Workspace Editor",
              desc: "A modular, interactive workspace simulator canvas. Drag and drop high-end gear blocks into your slots to visually design, customize, and checkout production packages.",
              color: "text-blue-400"
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-nira-yellow/20 transition-all group hover:bg-white/[0.02]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase font-black bg-white/5 px-2.5 py-1 rounded-md">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2.5 group-hover:text-nira-yellow transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 text-xs leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center justify-between text-[10px] font-mono text-neutral-500 group-hover:text-white transition-colors">
                  <span>SANDBOX PREVIEW</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3.6. CREATOR SERVICES SHOWCASE */}
      <section className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-[#09090c]/50">
        <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
              [ 04 / CREATOR SERVICES ]
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
              Hire Top Creative Specialists
            </h2>
            <p className="text-neutral-400 mt-4 text-sm sm:text-base font-light leading-relaxed">
              Skip traditional hiring. Directly engage certified photographers, high-end editors, color grading experts, and drone operators with verified portfolios.
            </p>
          </div>
          <Link 
            href="/services" 
            className="px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group whitespace-nowrap"
          >
            <Briefcase className="w-4 h-4 text-nira-yellow" />
            Explore Services Marketplace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Services Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Cinematic YouTube Video Editing & DaVinci Storytelling",
              category: "Video Editing",
              price: 4500,
              delivery: 3,
              rating: "4.9",
              reviews: "124",
              freelancer: "Arun Kumar",
              verified: true,
              level: "Pro",
              levelColor: "#3B82F6",
              tags: ["YouTube", "DaVinci Resolve", "Flow Cut"],
              image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80"
            },
            {
              title: "Premium Commercial Color Grading for Ads & Music Videos",
              category: "Color Grading",
              price: 8000,
              delivery: 2,
              rating: "5.0",
              reviews: "82",
              freelancer: "Riya Sen",
              verified: true,
              level: "Elite",
              levelColor: "#FFDA03",
              tags: ["DaVinci Resolve Studio", "HDR 4K", "LUTs Design"],
              image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80"
            },
            {
              title: "8K Cinematic Drone Videography & Real Estate Aerial Shoots",
              category: "Drone Piloting",
              price: 12000,
              delivery: 4,
              rating: "4.8",
              reviews: "64",
              freelancer: "Vikram Singh",
              verified: true,
              level: "Top Rated",
              levelColor: "#A855F7",
              tags: ["DJI Inspire 3", "DGCA Licensed", "8K ProRes"],
              image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80"
            }
          ].map((service, index) => (
            <div 
              key={index}
              className="bg-white/[0.01] rounded-2xl overflow-hidden border border-white/5 hover:border-nira-yellow/20 hover:bg-white/[0.02] flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                  <Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg backdrop-blur">
                    {service.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold text-sm leading-snug mb-4 line-clamp-2 hover:text-[#FFDA03] transition-colors">
                    {service.title}
                  </h3>

                  {/* Freelancer details */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-950/60 rounded-xl border border-white/[0.02]">
                    <div className="w-8 h-8 bg-nira-yellow text-nira-dark rounded-full flex items-center justify-center font-black text-xs">
                      {service.freelancer.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-white truncate">{service.freelancer}</p>
                        {service.verified && <span className="w-1.5 h-1.5 bg-nira-yellow rounded-full animate-pulse" />}
                      </div>
                      <p style={{ color: service.levelColor }} className="text-[9px] font-mono uppercase tracking-wider font-bold">
                        {service.level} Freelancer
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {service.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] font-mono text-neutral-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 mt-4 border-t border-white/[0.03] pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow" />{service.rating}</span>
                  <span>•</span>
                  <span>{service.delivery}d</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-neutral-500 block uppercase font-mono leading-none">Starting at</span>
                  <span className="text-white font-black text-sm">{formatPrice(service.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4.5. NARRATIVE PORTFOLIO SHOWCASE */}
      <section 
        onContextMenu={(e) => e.preventDefault()}
        className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-cinema-bg"
      >
        <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[30%] right-[-10%] w-[350px] h-[350px] bg-nira-yellow/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
              [ 04.5 / CREATOR PORTFOLIOS ]
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
              Cinematic Showcase
            </h2>
            <p className="text-neutral-400 mt-4 text-sm sm:text-base font-light leading-relaxed">
              Explore high-bitrate narrative reels and visual experiments framing striking contrast between hyper-realistic settings and next-gen rendering tools.
            </p>
          </div>
          <Link 
            href="/creators" 
            className="px-8 py-4 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 group whitespace-nowrap"
          >
            Explore All Portfolios
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid with protected visual assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              id: "c1",
              title: "Grounded Narrative: Hyper-realistic lighting scan inside a suburban home.",
              creator: "Maya Ray",
              category: "Director of Photography",
              rating: "5.0",
              price: "₹15,000/day",
              image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"
            },
            {
              id: "c2",
              title: "Digital Synthesis: Procedural neon landscape styling using HDR render grids.",
              creator: "Alex Kim",
              category: "VFX Artist",
              rating: "4.9",
              price: "₹12,000/scene",
              image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800"
            },
            {
              id: "c3",
              title: "Chiaroscuro Studies: Narrative low-light photography under dynamic gels.",
              creator: "Sara Sen",
              category: "Colorist",
              rating: "4.8",
              price: "₹8,500/day",
              image: "https://images.unsplash.com/photo-1542204172-e7052809a86e?q=80&w=800"
            }
          ].map((project) => (
            <div 
              key={project.id}
              className="bg-white/[0.01] border border-white/5 hover:border-nira-yellow/20 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group select-none relative"
            >
              <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden">
                {/* Secure Watermark Overlay */}
                <div className="absolute inset-0 bg-transparent z-25 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="px-3 py-1 bg-black/80 text-white/50 text-[9px] font-mono rounded border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-nira-yellow" />
                    nira6 protected
                  </span>
                </div>

                {/* Lazy loaded visual assets */}
                <Image 
                  src={project.image} 
                  alt={project.title} 
                  fill 
                  sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500 select-none pointer-events-none"
                  loading="lazy"
                />

                {/* Cover blocking click-drags */}
                <div className="absolute inset-0 bg-transparent z-20 select-none pointer-events-none" />

                <span className="absolute top-4 left-4 z-20 px-2.5 py-1 bg-black/60 border border-white/10 text-white text-[8px] font-bold uppercase tracking-wider rounded backdrop-blur">
                  {project.category}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-white font-bold text-sm leading-snug mb-4 line-clamp-2 group-hover:text-nira-yellow transition-colors duration-200">
                  {project.title}
                </h3>

                <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-900/40 rounded-xl border border-white/[0.02]">
                  <div className="w-7 h-7 bg-nira-yellow text-cinema-bg rounded-full flex items-center justify-center font-black text-xs text-nira-dark">
                    {project.creator.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-white truncate">{project.creator}</p>
                    <span className="text-[9px] text-nira-yellow font-mono flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> Verified Collective
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.03] pt-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                    <Star className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow" />
                    <span className="text-white font-bold">{project.rating}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-neutral-500 block uppercase font-mono leading-none">Rate</span>
                    <span className="text-white font-black text-xs">{project.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CINEMATIC REELS PREVIEW */}
      <section className="relative py-28 overflow-hidden border-b border-white/5 bg-[#07070a]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
                [ 05 / LENS ]
              </span>
              <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
                Immersive Reels Stream
              </h2>
              <p className="text-neutral-400 mt-4 text-sm sm:text-base font-light">
                Discover local director concepts, drone pilots, and equipment test videos under our vertical reels dashboard.
              </p>
            </div>
            <Link 
              href="/creators/reels" 
              className="px-6 py-3.5 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group whitespace-nowrap"
            >
              Enter Full Reels
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Reels Flex Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reels.map((reel) => (
              <div 
                key={reel.id}
                className="group relative rounded-2xl overflow-hidden border border-white/5 bg-neutral-900 aspect-[9/16] max-w-sm mx-auto w-full flex flex-col justify-end p-6 cursor-pointer hover:border-nira-yellow/20 transition-colors duration-300"
              >
                {/* Mock Video Poster Image */}
                <Image 
                  src={reel.image} 
                  alt={reel.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Viewfinder lines inside video frame */}
                <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl" />

                {/* Top Telemetry */}
                <div className="absolute top-8 left-8 flex items-center gap-2 text-[9px] font-mono text-white/50 bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span>REC</span>
                </div>
                
                {/* Stats overlays */}
                <div className="absolute top-8 right-8 flex flex-col gap-2">
                  <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded backdrop-blur text-[10px] text-white">
                    <Eye className="w-3 h-3 text-neutral-400" />
                    <span>{reel.views}</span>
                  </div>
                </div>

                {/* Reel Info */}
                <div className="relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-nira-yellow mb-2 block">
                    @{reel.creator}
                  </span>
                  <h3 className="text-white font-bold text-lg leading-snug mb-4 group-hover:text-nira-yellow transition-colors">
                    {reel.title}
                  </h3>
                  
                  {/* Floating Action Buttons mock */}
                  <div className="flex items-center gap-4 text-white/60 text-xs">
                    <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>{reel.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto">
                      <Share2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GEAR MARKETPLACE & RENTAL SHOWCASE */}
      <section className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
              [ 06 / STORE ]
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
              Flagship Gear Marketplace
            </h2>
            <p className="text-neutral-400 mt-4 text-sm sm:text-base font-light">
              Refurbished equipment buy/sell with certified 6-month warranties and instant rental bookings.
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/rent" 
              className="px-5 py-3 bg-white/5 text-white font-bold text-xs uppercase tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              Rent Equipment
            </Link>
            <Link 
              href="/buy" 
              className="px-5 py-3 bg-nira-yellow text-nira-dark font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-nira-yellow-dark transition-all"
            >
              Buy Gear
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p, idx) => (
            <div 
              key={idx}
              className="card-dark rounded-2xl overflow-hidden bg-white/[0.01] flex flex-col h-full border border-white/5 hover:border-nira-yellow/20"
            >
              {/* Product Image Frame */}
              <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden group/img">
                <Image 
                  src={p.image} 
                  alt={p.name} 
                  fill 
                  className="object-cover group-hover/img:scale-105 transition-transform duration-500" 
                />
                
                {/* Category tag */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[9px] uppercase font-mono text-white tracking-wider border border-white/10">
                  {p.category}
                </div>
              </div>

              {/* Product details */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-white font-bold text-lg mb-2 truncate hover:text-nira-yellow transition-colors">
                    {p.name}
                  </h3>
                  
                  {/* Spec tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {p.tags.map((t, i) => (
                      <span key={i} className="text-[9px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 block uppercase">Price/Rate</span>
                    <span className="text-white font-black text-base">{p.price}</span>
                  </div>
                  <Link
                    href="/buy"
                    className="p-3 bg-white/5 text-white hover:bg-nira-yellow hover:text-nira-dark rounded-xl transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CREATOR ECOSYSTEM & TESTIMONIALS */}
      <section className="relative py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute top-[-5%] left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[11px] uppercase font-mono tracking-widest text-nira-yellow block mb-4">
            [ 07 / CIRCLE ]
          </span>
          <h2 className="font-heading font-black text-4xl sm:text-5xl text-white tracking-tight leading-tight">
            Fueled By A Pro Community
          </h2>
          <p className="text-neutral-400 mt-4 text-sm sm:text-base font-light">
            Read success stories from verified directors, drone pilots, and editors using NIRA6 to power their studios.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-dark rounded-2xl p-8 bg-white/[0.01] flex flex-col justify-between h-full border border-white/5">
            <div>
              <div className="flex items-center gap-1 text-nira-yellow mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed font-light mb-8">
                &ldquo;NIRA6 has changed how I scale my commercial shoots. I was able to rent an Arri Alexa Mini LF package in Madurai within 2 hours, fully prepped and certified by their tech guys.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative">
                <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="Siddharth Rao" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold font-heading">Siddharth Rao</h4>
                <p className="text-[9px] font-mono text-neutral-500 uppercase">Commercial Director</p>
              </div>
            </div>
          </div>

          <div className="card-dark rounded-2xl p-8 bg-white/[0.01] flex flex-col justify-between h-full border border-white/5">
            <div>
              <div className="flex items-center gap-1 text-nira-yellow mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed font-light mb-8">
                &ldquo;Selling my old Sony A7IV and upgrading to the FX3 on NIRA6 was incredibly smooth. Their inspection report gave my buyer complete trust, and the funds hit my wallet instantly.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative">
                <Image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Priya Mehta" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold font-heading">Priya Mehta</h4>
                <p className="text-[9px] font-mono text-neutral-500 uppercase">Wedding Photographer</p>
              </div>
            </div>
          </div>

          <div className="card-dark rounded-2xl p-8 bg-white/[0.01] flex flex-col justify-between h-full border border-white/5">
            <div>
              <div className="flex items-center gap-1 text-nira-yellow mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed font-light mb-8">
                &ldquo;Matching with local clients using the AI engine is a cheat code. My profile matched automatically with three commercial shoots this month based on my RED rig setup.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative">
                <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" alt="Anil Varma" fill className="object-cover" />
              </div>
              <div>
                <h4 className="text-white text-xs font-bold font-heading">Anil Varma</h4>
                <p className="text-[9px] font-mono text-neutral-500 uppercase">Cine Drone Pilot</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CINEMATIC DEMO VIDEO MODAL DIALOG */}
      <AnimatePresence>
        {demoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setDemoOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden aspect-video shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Camera viewframe border inside modal */}
              <div className="absolute inset-6 border border-white/5 pointer-events-none rounded-2xl z-20">
                <div className="absolute top-4 left-6 flex items-center gap-2 text-[9px] font-mono text-neutral-500">
                  <span>REC DEMO 1080p</span>
                </div>
                <div className="absolute bottom-4 right-6 flex items-center gap-4 text-[9px] font-mono text-neutral-500">
                  <span>AUDIO CH1 [IIIIIIII-----]</span>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setDemoOpen(false)}
                className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] uppercase font-mono tracking-widest text-white transition-all"
              >
                Close Viewfinder [X]
              </button>

              {/* Simulated Cinematic Video Feed */}
              <div className="absolute inset-0 bg-[#07070a] flex items-center justify-center">
                {/* Dynamic animated visual representation */}
                <div className="text-center p-8 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-nira-yellow/10 border border-nira-yellow/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Play className="w-6 h-6 text-nira-yellow fill-current" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-1">NIRA6 Cinematic Ecosystem Walkthrough</h3>
                  <p className="text-neutral-500 text-xs font-mono">Telemetry link established: 30fps stream active</p>
                </div>

                {/* Animated light rays backing */}
                <div className="absolute w-[50%] h-[50%] bg-nira-yellow/10 rounded-full blur-[100px] animate-pulse-glow" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
