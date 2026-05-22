'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

const BRANDS = ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'DJI', 'RED', 'Blackmagic', 'ARRI', 'Sennheiser', 'Aputure', 'Godox'];
const LENS_MOUNTS = ['E-mount', 'RF', 'Z', 'X', 'MFT', 'EF', 'PL', 'L-mount'];
const SENSOR_TYPES = ['Full Frame', 'APS-C', 'Super 35', 'Micro 4/3', '1-inch', 'Medium Format'];
const VIDEO_SPECS = ['8K', '6K', '5.2K', '4K', '1080p'];
const BEST_FOR = ['YouTube', 'Weddings', 'Wildlife', 'Travel', 'Filmmaking', 'Commercial'];
const LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];

interface Filters {
  brand: string[];
  lensMount: string;
  sensorType: string;
  videoSpecs: string;
  bestFor: string[];
  location: string;
  available: boolean;
  minPrice: string;
  maxPrice: string;
}

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-3">{title}</p>
    {children}
  </div>
);

const ChipSelect = ({ items, selected, onToggle, multi = false }: { items: string[]; selected: string | string[]; onToggle: (v: string) => void; multi?: boolean }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(item => {
      const isActive = multi ? (selected as string[]).includes(item) : selected === item;
      return (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            isActive
              ? 'bg-nira-yellow text-nira-dark'
              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-white/5'
          }`}
        >
          {item}
        </button>
      );
    })}
  </div>
);

interface RentFiltersProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}

export default function RentFilters({ filters, onChange, onReset, open, onClose }: RentFiltersProps) {
  const toggleBrand = (b: string) => {
    const brands = filters.brand.includes(b) ? filters.brand.filter(x => x !== b) : [...filters.brand, b];
    onChange({ ...filters, brand: brands });
  };
  const toggleBestFor = (t: string) => {
    const tags = filters.bestFor.includes(t) ? filters.bestFor.filter(x => x !== t) : [...filters.bestFor, t];
    onChange({ ...filters, bestFor: tags });
  };

  const activeCount = [
    filters.brand.length > 0,
    filters.lensMount,
    filters.sensorType,
    filters.videoSpecs,
    filters.bestFor.length > 0,
    filters.location,
    filters.available,
    filters.minPrice || filters.maxPrice,
  ].filter(Boolean).length;

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-nira-yellow" />
          <span className="text-sm font-bold text-white">Smart Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-nira-yellow text-nira-dark text-[10px] font-black rounded-full">{activeCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onReset} className="text-[10px] font-bold text-white/30 hover:text-nira-yellow transition-colors flex items-center gap-1 cursor-pointer">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-0">
        <FilterSection title="Brand">
          <ChipSelect items={BRANDS} selected={filters.brand} onToggle={toggleBrand} multi />
        </FilterSection>

        <FilterSection title="Lens Mount">
          <ChipSelect items={LENS_MOUNTS} selected={filters.lensMount} onToggle={(v) => onChange({ ...filters, lensMount: filters.lensMount === v ? '' : v })} />
        </FilterSection>

        <FilterSection title="Sensor Type">
          <ChipSelect items={SENSOR_TYPES} selected={filters.sensorType} onToggle={(v) => onChange({ ...filters, sensorType: filters.sensorType === v ? '' : v })} />
        </FilterSection>

        <FilterSection title="Video Resolution">
          <ChipSelect items={VIDEO_SPECS} selected={filters.videoSpecs} onToggle={(v) => onChange({ ...filters, videoSpecs: filters.videoSpecs === v ? '' : v })} />
        </FilterSection>

        <FilterSection title="Best For">
          <ChipSelect items={BEST_FOR} selected={filters.bestFor} onToggle={toggleBestFor} multi />
        </FilterSection>

        <FilterSection title="Location">
          <ChipSelect items={LOCATIONS} selected={filters.location} onToggle={(v) => onChange({ ...filters, location: filters.location === v ? '' : v })} />
        </FilterSection>

        <FilterSection title="Price Range (₹/day)">
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => onChange({ ...filters, minPrice: e.target.value })} className="flex-1 input-dark rounded-lg px-3 py-2 text-xs" />
            <span className="text-white/20 text-xs">—</span>
            <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })} className="flex-1 input-dark rounded-lg px-3 py-2 text-xs" />
          </div>
        </FilterSection>

        <FilterSection title="Availability">
          <button
            onClick={() => onChange({ ...filters, available: !filters.available })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filters.available ? 'bg-nira-success/20 text-nira-success border border-nira-success/30' : 'bg-white/5 text-white/40 border border-white/5'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filters.available ? 'bg-nira-success' : 'bg-white/20'}`} />
            Available Only
          </button>
        </FilterSection>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden max-h-[calc(100vh-8rem)]">
          {content}
        </div>
      </div>

      {/* Mobile: Full-screen drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-80 bg-[#0c0c10] z-50 lg:hidden"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
