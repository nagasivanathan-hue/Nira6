'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, Shield } from 'lucide-react';
import { mockRentals } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

export default function RentPage() {
  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl lg:text-4xl mb-2">Rent Creator Equipment</h1>
          <p className="text-nira-text-secondary">Access premium gear without the hefty price tag</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockRentals.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden border border-nira-gray-dark hover:shadow-lg transition-all group"
            >
              <div className="relative aspect-[4/3] bg-nira-gray overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/90 text-nira-dark font-semibold rounded-lg text-sm">Currently Rented</span>
                  </div>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-lg ${item.available ? 'bg-nira-success text-white' : 'bg-nira-error text-white'}`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-nira-text-secondary uppercase">{item.brand}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow" />
                    <span className="text-xs font-semibold">{item.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-3">{item.name}</h3>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <p className="text-xs text-nira-text-secondary">Per Day</p>
                    <p className="font-heading font-bold text-lg">{formatPrice(item.dailyRate)}</p>
                  </div>
                  <div className="w-px h-8 bg-nira-gray-dark" />
                  <div>
                    <p className="text-xs text-nira-text-secondary">Per Hour</p>
                    <p className="font-heading font-bold text-lg">{formatPrice(item.hourlyRate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-nira-text-secondary mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Deposit: {formatPrice(item.securityDeposit)}</span>
                </div>
                <button
                  disabled={!item.available}
                  className="w-full py-2.5 bg-nira-dark text-white font-medium rounded-xl hover:bg-nira-dark/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
