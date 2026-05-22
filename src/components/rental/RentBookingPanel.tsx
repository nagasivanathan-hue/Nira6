'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Shield, MapPin, ChevronDown, Sparkles, IndianRupee } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { RentalItem } from '@/types';

export default function RentBookingPanel({ item }: { item: RentalItem }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [insurance, setInsurance] = useState(false);
  const [pickupIdx, setPickupIdx] = useState(0);

  // Calculate days
  let days = 0;
  if (startDate && endDate) {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const rentalCost = days * item.dailyRate;
  const insuranceCost = insurance && item.insuranceAvailable ? days * (item.insuranceRate || 200) : 0;
  const totalCost = rentalCost + insuranceCost;
  const pickupLocations = item.pickupLocations || [item.location];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="card-dark rounded-2xl p-6 sticky top-24"
    >
      {/* Title + Rating */}
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-nira-yellow mb-1">{item.brand}</p>
        <h1 className="font-heading font-black text-xl text-white mb-2">{item.name}</h1>
        <p className="text-xs text-white/30 leading-relaxed line-clamp-3">{item.description}</p>
      </div>

      {/* Pricing */}
      <div className="flex items-end gap-4 mb-6 pb-6 border-b border-white/5">
        <div>
          <p className="text-[9px] text-white/25 font-bold uppercase">Per Day</p>
          <p className="font-heading font-black text-2xl text-nira-yellow">{formatPrice(item.dailyRate)}</p>
        </div>
        {item.weeklyRate && (
          <>
            <div className="w-px h-8 bg-white/5" />
            <div>
              <p className="text-[9px] text-white/25 font-bold uppercase">Per Week</p>
              <p className="font-heading font-bold text-sm text-white/50">{formatPrice(item.weeklyRate)}</p>
            </div>
          </>
        )}
        {item.monthlyRate && (
          <>
            <div className="w-px h-8 bg-white/5" />
            <div>
              <p className="text-[9px] text-white/25 font-bold uppercase">Per Month</p>
              <p className="font-heading font-bold text-sm text-white/50">{formatPrice(item.monthlyRate)}</p>
            </div>
          </>
        )}
      </div>

      {/* Date Picker */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[9px] font-bold uppercase text-white/25 mb-1.5 block">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full input-dark rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold"
            />
          </div>
        </div>
        <div>
          <label className="text-[9px] font-bold uppercase text-white/25 mb-1.5 block">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full input-dark rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* Pickup Location */}
      <div className="mb-4">
        <label className="text-[9px] font-bold uppercase text-white/25 mb-1.5 block">Pickup Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <select
            value={pickupIdx}
            onChange={(e) => setPickupIdx(Number(e.target.value))}
            className="w-full input-dark rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold appearance-none cursor-pointer"
          >
            {pickupLocations.map((loc: string, i: number) => (
              <option key={i} value={i}>{loc}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
        </div>
      </div>

      {/* Insurance Toggle */}
      {item.insuranceAvailable && (
        <button
          onClick={() => setInsurance(!insurance)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold mb-5 transition-all cursor-pointer ${
            insurance
              ? 'bg-nira-success/10 text-nira-success border border-nira-success/20'
              : 'bg-white/3 text-white/40 border border-white/5 hover:border-white/10'
          }`}
        >
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Damage Insurance
          </span>
          <span>+₹{item.insuranceRate}/day</span>
        </button>
      )}

      {/* Cost Breakdown */}
      {days > 0 && (
        <div className="bg-white/[0.02] rounded-xl p-4 mb-5 border border-white/5 space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>{formatPrice(item.dailyRate)} × {days} days</span>
            <span>{formatPrice(rentalCost)}</span>
          </div>
          {insuranceCost > 0 && (
            <div className="flex justify-between text-xs text-white/40">
              <span>Insurance × {days} days</span>
              <span>{formatPrice(insuranceCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-white/25 pt-1 border-t border-white/5">
            <span>Security Deposit (refundable)</span>
            <span>{formatPrice(item.securityDeposit)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
            <span>Total Rental</span>
            <span className="text-nira-yellow">{formatPrice(totalCost)}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!item.available || days === 0}
        className="w-full py-4 bg-nira-yellow text-nira-dark font-black text-sm rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-nira-yellow/10 hover:shadow-nira-yellow/20 cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        {days > 0 ? `Confirm Booking — ${formatPrice(totalCost)}` : 'Select Dates to Book'}
      </button>

      {/* Deposit Note */}
      <p className="text-center text-[9px] text-white/15 mt-3 flex items-center justify-center gap-1">
        <IndianRupee className="w-2.5 h-2.5" /> Security deposit of {formatPrice(item.securityDeposit)} fully refundable
      </p>
    </motion.div>
  );
}
