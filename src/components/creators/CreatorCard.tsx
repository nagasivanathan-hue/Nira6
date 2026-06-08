 
'use client';
import Link from 'next/link';
import { Star, MapPin, CheckCircle, ChevronRight } from 'lucide-react';
import type { Creator } from '@/types/creator';
import { CREATOR_CATEGORIES } from '@/lib/constants';

export default function CreatorCard({ creator, compact = false }: { creator: Creator; compact?: boolean }) {


  if (compact) {
    return (
      <Link href={`/creators/${creator.id}`} className="group flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-nira-yellow/30 hover:shadow-md transition-all">
        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border-2" >
          <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-bold text-xs text-nira-dark truncate">{creator.name}</p>
            {creator.verified && <CheckCircle className="w-3 h-3 text-nira-yellow shrink-0" />}
          </div>
          <p className="text-[10px] text-nira-text-secondary truncate">{creator.title}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="flex items-center gap-0.5 text-[10px] font-bold"><Star className="w-3 h-3 fill-nira-yellow text-nira-yellow" />{creator.rating}</span>
          <span className={`w-2 h-2 rounded-full inline-block mt-1 ${creator.availability === 'available' ? 'bg-emerald-400' : creator.availability === 'busy' ? 'bg-amber-400' : 'bg-gray-400'}`} />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/creators/${creator.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
      <div className="h-28 relative overflow-hidden" >
        <div className="absolute inset-0 opacity-20"  />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase backdrop-blur-md text-white" >
            {CREATOR_CATEGORIES.find(c => c.id === creator.category)?.name}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase backdrop-blur-md ${
            creator.availability === 'available' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30'
            : creator.availability === 'busy' ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
            : 'bg-gray-500/20 text-gray-600 border border-gray-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${creator.availability === 'available' ? 'bg-emerald-500 animate-pulse' : creator.availability === 'busy' ? 'bg-amber-500' : 'bg-gray-400'}`} />
            {creator.availability}
          </span>
        </div>
        {creator.featured && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-nira-dark/80 text-nira-yellow backdrop-blur-md">⭐ Featured</span>
          </div>
        )}
      </div>

      <div className="p-4 -mt-7 relative">
        <div className="w-14 h-14 rounded-xl bg-white border-2 border-white shadow-lg overflow-hidden mb-3">
          <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex items-center gap-1.5 mb-0.5">
          <h3 className="font-heading font-bold text-sm text-nira-dark truncate">{creator.name}</h3>
          {creator.verified && <CheckCircle className="w-3.5 h-3.5 text-nira-yellow shrink-0" />}
          {creator.verificationLevel === 'elite' && <span className="text-[8px] font-black bg-gradient-to-r from-nira-yellow to-amber-500 text-nira-dark px-1.5 py-0.5 rounded uppercase">Elite</span>}
        </div>
        <p className="text-[11px] text-nira-text-secondary truncate mb-2.5">{creator.title}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-nira-dark">
            <Star className="w-3 h-3 fill-nira-yellow text-nira-yellow" /> {creator.rating}
            <span className="text-nira-text-secondary font-normal">({creator.reviewCount})</span>
          </span>
          <span className="text-[10px] text-nira-text-secondary font-medium">{creator.completedJobs} jobs</span>
          <span className="text-[10px] text-nira-text-secondary font-medium flex items-center gap-0.5">
            <MapPin className="w-3 h-3" /> {creator.location.split(',')[0]}
          </span>
        </div>

        {/* Skills tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {creator.skills.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 bg-nira-gray rounded-md text-[9px] font-semibold text-nira-text-secondary">{s}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-sm font-black text-nira-dark">₹{creator.startingPrice.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-nira-text-secondary"> onwards</span>
          </div>
          <span className="text-[10px] font-bold text-nira-yellow group-hover:underline flex items-center gap-0.5">
            View <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
