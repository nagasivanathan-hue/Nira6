'use client';
import { SlidersHorizontal } from 'lucide-react';

interface StickyRentBarProps {
  onFilterToggle: () => void;
  sort: string;
  onSort: (s: string) => void;
  resultCount: number;
}

export default function StickyRentBar({ onFilterToggle, sort, onSort, resultCount }: StickyRentBarProps) {
  return (
    <div className="sticky top-16 z-30 lg:hidden bg-[#0c0c10]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white/30">{resultCount} items</span>
        <div className="flex items-center gap-2">
          <select aria-label="Select option" title="Select option"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="input-dark rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer appearance-none pr-7"
            style={{ backgroundImage: 'none' }}
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            onClick={onFilterToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg text-[11px] font-bold text-white/50 hover:text-nira-yellow transition-colors border border-white/5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>
    </div>
  );
}
