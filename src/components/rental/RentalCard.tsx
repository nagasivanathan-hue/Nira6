'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, MapPin, Shield, Calendar, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RentalCardProps {
  item: any;
  index: number;
}

export default function RentalCard({ item, index }: RentalCardProps) {
  const score = item.conditionScore || 90;
  const scoreColor = score >= 90 ? 'text-nira-success' : score >= 70 ? 'text-nira-yellow' : 'text-nira-error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link href={`/rent/${item.id || item._id}`} className="block">
        <div className="card-dark rounded-2xl overflow-hidden group cursor-pointer">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-black/20 overflow-hidden">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Availability Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg backdrop-blur-md ${
                item.available ? 'bg-nira-success/20 text-nira-success border border-nira-success/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {item.available ? 'Available' : 'Rented Out'}
              </span>
            </div>
            {/* Brand Badge */}
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 text-[10px] font-bold bg-black/50 backdrop-blur-md text-white/80 rounded-lg border border-white/10">
                {item.brand}
              </span>
            </div>
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {!item.available && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10">Currently Rented</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Rating + Condition */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-nira-yellow fill-nira-yellow" />
                <span className="text-[11px] font-bold text-white/70">{item.rating}</span>
                <span className="text-[10px] text-white/30">({item.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className={`w-3 h-3 ${scoreColor}`} />
                <span className={`text-[10px] font-bold ${scoreColor}`}>{score}%</span>
              </div>
            </div>

            {/* Name */}
            <h3 className="font-heading font-bold text-sm text-white mb-2 line-clamp-1 group-hover:text-nira-yellow transition-colors">{item.name}</h3>

            {/* Best For Tags */}
            {item.bestFor && item.bestFor.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.bestFor.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 text-[9px] font-bold bg-white/5 text-white/40 rounded-md border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-center gap-3 mb-3">
              <div>
                <p className="text-[9px] text-white/30 uppercase font-bold">Per Day</p>
                <p className="font-heading font-black text-base text-nira-yellow">{formatPrice(item.dailyRate)}</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div>
                <p className="text-[9px] text-white/30 uppercase font-bold">Per Hour</p>
                <p className="font-heading font-bold text-sm text-white/60">{formatPrice(item.hourlyRate)}</p>
              </div>
            </div>

            {/* Location + Deposit */}
            <div className="flex items-center justify-between text-[10px] text-white/30 mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" />₹{(item.securityDeposit / 1000).toFixed(0)}K deposit</span>
            </div>

            {/* Condition Bar */}
            <div className="mb-4">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="condition-bar h-full rounded-full" style={{ width: `${score}%` }} />
              </div>
            </div>

            {/* CTA */}
            <button
              disabled={!item.available}
              className="w-full py-2.5 bg-white/5 hover:bg-nira-yellow hover:text-nira-dark text-white/60 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-nira-yellow disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-white/60 disabled:hover:border-white/5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" /> Book Now
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
