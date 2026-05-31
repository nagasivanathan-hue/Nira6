 
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Camera, ShoppingBag, Play, Users, PartyPopper,
  Plane, Wand2, Calculator, Sparkles, Star, ArrowRight, TrendingUp,
  CheckCircle, Zap, ChevronRight
} from 'lucide-react';
import { CREATOR_HUB_SECTIONS, CREATOR_CATEGORIES } from '@/lib/constants';
import { mockCreators, mockReels } from '@/lib/creatorMockData';

const iconMap: Record<string, React.ElementType> = {
  MapPin, Calendar, Camera, ShoppingBag, Play, Users, PartyPopper,
  Plane, Wand2, Calculator, Sparkles,
};

const catIconMap: Record<string, React.ElementType> = {
  Camera, Film: Play, Wand2, Plane, User: Users, Building2: ShoppingBag,
  Sparkles, Mic: Play, Palette: Wand2,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: 'easeOut' as const } }),
};

export default function CreatorHubPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const featuredCreators = mockCreators.filter(c => c.featured);
  const trendingReels = mockReels.filter(r => r.trending).slice(0, 4);
  const filteredCreators = activeCategory === 'all'
    ? featuredCreators
    : featuredCreators.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-nira-dark min-h-[520px] flex items-center">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"  />
          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full opacity-10"  />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"  />
          {/* Floating grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"  />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-nira-yellow/10 border border-nira-yellow/20 rounded-full mb-6">
                <Zap className="w-3.5 h-3.5 text-nira-yellow" />
                <span className="text-[11px] font-black text-nira-yellow uppercase tracking-widest">Creator Ecosystem</span>
              </div>
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-5">
                Connect with <br />
                <span className="gradient-text">India&apos;s Best</span><br />
                Creative Talent
              </h1>
              <p className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed mb-8">
                Discover photographers, filmmakers, editors, drone pilots & more. Book shoots, rent gear, collaborate on projects — all in one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/creators/discover" className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-nira-yellow text-nira-dark font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-nira-yellow/25 transition-all">
                  <MapPin className="w-4 h-4" /> Discover Nearby
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/creators/book" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white font-bold text-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                  <Calendar className="w-4 h-4" /> Book a Shoot
                </Link>
              </div>
              {/* Trust stats */}
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                {[
                  { label: 'Active Creators', value: '2,500+' },
                  { label: 'Bookings Done', value: '18K+' },
                  { label: 'Gear Listed', value: '5,000+' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="font-heading font-black text-xl text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Featured creator cards stack */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 max-w-md w-full hidden lg:block"
            >
              <div className="relative">
                {featuredCreators.slice(0, 3).map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20, rotate: i === 0 ? -3 : i === 2 ? 3 : 0 }}
                    animate={{ opacity: 1, y: 0, rotate: i === 0 ? -3 : i === 2 ? 3 : 0 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 mb-3"
                    style={{ transform: `rotate(${i === 0 ? -2 : i === 2 ? 2 : 0}deg)` }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-nira-yellow/30 to-purple-500/30 flex items-center justify-center text-white font-heading font-black text-lg shrink-0">
                      {c.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-white truncate">{c.name}</p>
                        {c.verified && <CheckCircle className="w-3.5 h-3.5 text-nira-yellow shrink-0" />}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-[10px] text-nira-yellow font-bold">
                          <Star className="w-3 h-3 fill-nira-yellow" /> {c.rating}
                        </span>
                        <span className="text-[10px] text-gray-500">{c.completedJobs} jobs</span>
                        <span className={`w-2 h-2 rounded-full ${c.availability === 'available' ? 'bg-emerald-400' : c.availability === 'busy' ? 'bg-amber-400' : 'bg-gray-500'}`} />
                      </div>
                    </div>
                    <p className="text-xs font-black text-nira-yellow shrink-0">₹{(c.startingPrice / 1000).toFixed(0)}K+</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-nira-dark">Everything You Need</h2>
          <p className="text-sm text-nira-text-secondary mt-2">Your complete creative ecosystem in one place</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CREATOR_HUB_SECTIONS.map((section, i) => {
            const Icon = iconMap[section.icon] || Sparkles;
            return (
              <motion.div key={section.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link
                  href={section.href}
                  className="group block p-5 bg-white border border-gray-100 rounded-2xl hover:border-nira-yellow/40 hover:shadow-xl hover:shadow-nira-yellow/5 transition-all duration-300 h-full"
                >
                  <div className="w-11 h-11 rounded-xl bg-nira-dark/5 group-hover:bg-nira-yellow/10 flex items-center justify-center mb-3 transition-colors">
                    <Icon className="w-5 h-5 text-nira-dark group-hover:text-nira-yellow transition-colors" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-nira-dark mb-1">{section.name}</h3>
                  <p className="text-[11px] text-nira-text-secondary leading-relaxed">{section.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-nira-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CATEGORY FILTER + FEATURED CREATORS ── */}
      <section className="bg-nira-gray py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-heading font-black text-2xl text-nira-dark">Featured Creators</h2>
              <p className="text-sm text-nira-text-secondary mt-1">Top-rated professionals ready to work</p>
            </div>
            <Link href="/creators/discover" className="text-xs font-bold text-nira-yellow flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeCategory === 'all' ? 'bg-nira-dark text-white' : 'bg-white text-nira-text-secondary hover:bg-nira-dark/5'}`}
            >
              All Creators
            </button>
            {CREATOR_CATEGORIES.map(cat => {
              const CatIcon = catIconMap[cat.icon] || Sparkles;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat.id ? 'text-white' : 'bg-white text-nira-text-secondary hover:bg-nira-dark/5'}`}
                  style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  <CatIcon className="w-3.5 h-3.5" /> {cat.name}
                </button>
              );
            })}
          </div>

          {/* Creator cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(filteredCreators.length > 0 ? filteredCreators : featuredCreators).slice(0, 8).map((creator, i) => (
              <motion.div key={creator.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link href={`/creators/${creator.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                  {/* Cover gradient */}
                  <div className="h-24 relative overflow-hidden" >
                    <div className="absolute inset-0 opacity-30"  />
                    {/* Availability badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase backdrop-blur-md ${
                        creator.availability === 'available' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
                        : creator.availability === 'busy' ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                        : 'bg-gray-500/20 text-gray-600 border border-gray-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${creator.availability === 'available' ? 'bg-emerald-500' : creator.availability === 'busy' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                        {creator.availability}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 -mt-8 relative">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-xl bg-white border-2 border-white shadow-lg flex items-center justify-center text-nira-dark font-heading font-black text-lg mb-3 overflow-hidden">
                      {creator.avatar ? (
                        <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                      ) : creator.name.slice(0, 2)}
                    </div>

                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-heading font-bold text-sm text-nira-dark truncate">{creator.name}</h3>
                      {creator.verified && <CheckCircle className="w-3.5 h-3.5 text-nira-yellow shrink-0" />}
                    </div>
                    <p className="text-[11px] text-nira-text-secondary truncate mb-2">{creator.title}</p>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-nira-dark">
                        <Star className="w-3 h-3 fill-nira-yellow text-nira-yellow" /> {creator.rating}
                      </span>
                      <span className="text-[10px] text-nira-text-secondary">{creator.completedJobs} jobs</span>
                      <span className="text-[10px] text-nira-text-secondary flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {creator.location.split(',')[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-black text-nira-dark">₹{creator.startingPrice.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-nira-text-secondary">+</span></span>
                      <span className="text-[10px] font-bold text-nira-yellow group-hover:underline flex items-center gap-0.5">
                        View Profile <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING REELS PREVIEW ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-black text-2xl text-nira-dark flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-nira-yellow" /> Trending Reels
            </h2>
            <p className="text-sm text-nira-text-secondary mt-1">See what creators are making right now</p>
          </div>
          <Link href="/creators/reels" className="text-xs font-bold text-nira-yellow flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trendingReels.map((reel, i) => (
            <motion.div key={reel.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Link href="/creators/reels" className="group block relative aspect-[9/16] rounded-2xl overflow-hidden bg-nira-dark">
                <img src={reel.thumbnail} alt={reel.caption} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30">
                      <img src={reel.creator.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate">{reel.creator.name}</span>
                  </div>
                  <p className="text-[10px] text-white/80 line-clamp-2 leading-relaxed">{reel.caption}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] text-white/60 font-semibold">
                    <span>❤️ {(reel.likes / 1000).toFixed(1)}K</span>
                    <span>▶️ {(reel.views / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-nira-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-nira-yellow/10 via-purple-500/10 to-blue-500/10 border border-white/5 p-8 sm:p-12 text-center">
            <div className="absolute inset-0 opacity-5"  />
            <div className="relative z-10">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mb-3">Are You a Creator?</h2>
              <p className="text-sm text-gray-400 max-w-lg mx-auto mb-6">Join NIRA6&apos;s creator ecosystem. Get discovered, receive bookings, rent your gear, and grow your creative business.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/creators/ai-match" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-nira-yellow text-nira-dark font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-nira-yellow/25 transition-all">
                  <Sparkles className="w-4 h-4" /> Get AI-Matched
                </Link>
                <Link href="/creators/quote" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-bold text-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                  <Calculator className="w-4 h-4" /> Get Instant Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
