'use client';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Tag, Eye } from 'lucide-react';
import { RentalItem } from '@/types';

export default function RentSpecs({ item }: { item: RentalItem }) {
  const score = item.conditionScore || 90;
  const scoreColor = score >= 90 ? 'text-nira-success' : score >= 70 ? 'text-nira-yellow' : 'text-nira-error';
  const scoreLabel = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair';
  const specs = item.specs || {};

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
      <h2 className="font-heading font-bold text-lg text-white mb-6">Technical Specifications</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="card-dark rounded-xl p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 mb-1">{key}</p>
            <p className="text-sm font-bold text-white/80">{value as string}</p>
          </div>
        ))}
      </div>

      {/* Condition + Trust Badges */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Condition Score */}
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className={`w-4 h-4 ${scoreColor}`} />
            <p className="text-xs font-bold text-white/50">Condition Score</p>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-2xl font-heading font-black ${scoreColor}`}>{score}%</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              score >= 90 ? 'bg-nira-success/10 text-nira-success' : score >= 70 ? 'bg-nira-yellow/10 text-nira-yellow' : 'bg-nira-error/10 text-nira-error'
            }`}>{scoreLabel}</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="condition-bar h-full rounded-full"  />
          </div>
        </div>

        {/* Shutter Count */}
        {item.shutterCount && (
          <div className="card-dark rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-nira-info" />
              <p className="text-xs font-bold text-white/50">Shutter Count</p>
            </div>
            <p className="text-2xl font-heading font-black text-white">{item.shutterCount.toLocaleString()}</p>
            <p className="text-[10px] text-white/25 mt-1">Verified actuations</p>
          </div>
        )}

        {/* Insurance */}
        <div className="card-dark rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-nira-success" />
            <p className="text-xs font-bold text-white/50">Insurance</p>
          </div>
          <p className="text-sm font-bold text-white/80">{item.insuranceAvailable ? `₹${item.insuranceRate}/day` : 'Not Available'}</p>
          <p className="text-[10px] text-white/25 mt-1">{item.insuranceAvailable ? 'Full damage coverage' : ''}</p>
        </div>

        {/* Best For */}
        {item.bestFor && item.bestFor.length > 0 && (
          <div className="card-dark rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-nira-yellow" />
              <p className="text-xs font-bold text-white/50">Best For</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.bestFor.map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 text-[10px] font-bold bg-nira-yellow/10 text-nira-yellow rounded-lg border border-nira-yellow/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
