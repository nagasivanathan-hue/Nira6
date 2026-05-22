'use client';
import { motion } from 'framer-motion';
import { Search, Camera, Aperture, Plane, Lightbulb, Mic, Move3D } from 'lucide-react';

const QUICK_FILTERS = [
  { label: 'All Gear', value: '', icon: Camera },
  { label: 'Cameras', value: 'cameras', icon: Camera },
  { label: 'Lenses', value: 'lenses', icon: Aperture },
  { label: 'Drones', value: 'drones', icon: Plane },
  { label: 'Lighting', value: 'lighting', icon: Lightbulb },
  { label: 'Audio', value: 'microphones', icon: Mic },
  { label: 'Gimbals', value: 'gimbals', icon: Move3D },
];

interface RentHeroProps {
  searchQuery: string;
  onSearch: (q: string) => void;
  activeCategory: string;
  onCategory: (c: string) => void;
}

export default function RentHero({ searchQuery, onSearch, activeCategory, onCategory }: RentHeroProps) {
  return (
    <section className="rent-hero-gradient pt-28 pb-16 lg:pt-36 lg:pb-20 relative overflow-hidden">
      {/* Ambient glow particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-48 h-48 bg-nira-yellow/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[20%] w-64 h-64 bg-blue-500/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-nira-yellow/80 text-xs font-bold uppercase tracking-[0.2em] mb-3">Cinema-Grade Rentals</p>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-6xl text-white leading-[1.1] mb-4">
            Rent the Gear.<br />
            <span className="text-gradient-cinema">Create the Vision.</span>
          </h1>
          <p className="text-white/40 text-sm sm:text-base max-w-lg mx-auto">
            Access ₹50L+ worth of professional cameras, lenses, drones, and cinema equipment — starting from ₹500/day.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-nira-yellow transition-colors" />
            <input
              type="text"
              placeholder="Search Sony A7S III, DJI Mavic, Canon RF lens..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-12 pr-5 py-4 input-dark rounded-2xl text-sm font-medium"
            />
          </div>
        </motion.div>

        {/* Category Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        >
          {QUICK_FILTERS.map((f) => {
            const active = activeCategory === f.value;
            return (
              <button
                key={f.value}
                onClick={() => onCategory(f.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  active
                    ? 'bg-nira-yellow text-nira-dark shadow-lg shadow-nira-yellow/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 border border-white/5'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </motion.div>

        {/* Trust Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center justify-center gap-6 sm:gap-10 mt-10 text-center"
        >
          {[
            { val: '2,000+', label: 'Gear Items' },
            { val: '500+', label: 'Creators Trust Us' },
            { val: '50+', label: 'Indian Cities' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading font-black text-lg sm:text-xl text-white">{s.val}</p>
              <p className="text-[10px] sm:text-xs text-white/30 font-medium">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
