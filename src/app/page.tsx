import Link from 'next/link';
import { 
  ArrowRight, Shield, Truck, Award, Camera
} from 'lucide-react';
import TrendingGear from '@/components/home/TrendingGear';
import FeaturedDeals from '@/components/home/FeaturedDeals';
import StatCounter from '@/components/home/StatCounter';
import WordReveal from '@/components/home/WordReveal';
import GearShowcaseCard from '@/components/home/GearShowcaseCard';
import HeroBackground from '@/components/home/HeroBackground';
import { FadeIn, FadeInUp, ScrollDownIndicator } from '@/components/home/HeroAnimate';

export default function HomePage() {
  return (
    <main role="main" aria-label="NIRA6 Homepage" id="main-content" className="rent-dark min-h-screen font-body selection:bg-nira-yellow selection:text-nira-dark relative">
      
      {/* Background Subtle Viewfinder Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {/* 1. HERO SECTION */}
      <section 
        className="relative min-h-screen flex items-center overflow-hidden py-32 border-b border-white/5"
      >
        <HeroBackground />

        {/* Hero Content — Two Column Layout */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-20">

            {/* LEFT COLUMN — Headline + CTAs */}
            <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none">
              
              {/* Tagline Badge — enlarged with yellow dot pulse */}
              <FadeInUp delay={0.2} y={-15} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md max-w-full">
                <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nira-yellow/60" />
                  <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-nira-yellow" />
                </span>
                <span className="text-[9px] sm:text-xs uppercase font-mono tracking-[0.1em] sm:tracking-[0.15em] text-neutral-300 font-medium truncate">
                  The Flagship Recommerce & Creator Ecosystem
                </span>
              </FadeInUp>

              {/* Headline — word-by-word reveal */}
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl tracking-[0.02em] text-white leading-[1.05] mb-6">
                <WordReveal text="EVERYTHING FOR A" delay={0.4} />
                <br />
                <FadeInUp delay={0.55} y={20} className="inline-block mr-[0.3em] text-nira-yellow drop-shadow-[0_0_30px_rgba(255,218,3,0.2)]">
                  CREATOR
                </FadeInUp>
                <WordReveal text="IN ONE PLACE" delay={0.6} />
              </h1>

              {/* Subtitle — larger, fades up */}
              <FadeInUp delay={0.8} className="text-neutral-400 text-base sm:text-lg md:text-xl font-light mb-10 max-w-xl mx-auto lg:mx-0 leading-[1.65]">
                Buy, sell, rent, and repair cinematography gear. Engage with top creators and launch your studio.
              </FadeInUp>

              {/* CTA Buttons — slide up */}
              <FadeInUp delay={1.0} className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-12 w-full">
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
              </FadeInUp>

              {/* Trust Badges */}
              <FadeIn delay={1.3} className="flex flex-wrap justify-center lg:justify-start gap-5 text-neutral-500 text-xs">
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
              </FadeIn>
            </div>

            {/* RIGHT COLUMN — Gear Showcase Card (hidden on mobile) */}
            <div className="hidden md:flex flex-shrink-0 justify-center lg:justify-end">
              <GearShowcaseCard />
            </div>
          </div>

          {/* Stats Row — below the two columns */}
          <FadeInUp delay={1.4} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-white/5 pt-12 mt-16 w-full max-w-5xl mx-auto lg:mx-0 text-left">
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
          </FadeInUp>
        </div>

        {/* Scroll-Down Indicator — bounce animation */}
        <ScrollDownIndicator />
      </section>

      {/* 1.5. NATIVE E-COMMERCE DISCOVERY SECTION */}
      <section className="relative w-full border-b border-white/5 pb-20">
        <FeaturedDeals />
        <TrendingGear />
      </section>

    </main>
  );
}
