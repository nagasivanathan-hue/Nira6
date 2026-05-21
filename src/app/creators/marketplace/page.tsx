/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, MapPin, Shield, MessageSquare, TrendingDown, CheckCircle, Tag, Search } from 'lucide-react';
import { mockSecondHandListings } from '@/lib/creatorMockData';

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const listings = mockSecondHandListings.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="bg-gradient-to-br from-nira-dark to-[#1a1a2e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-nira-yellow/10 flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-nira-yellow" /></div><h1 className="font-heading font-black text-2xl text-white">Used Gear Market</h1></div>
          <p className="text-sm text-gray-400 max-w-lg">Buy & sell pre-owned camera equipment with AI-powered pricing, seller verification, and escrow payments.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search used equipment..." className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-xs border border-gray-200 focus:border-nira-yellow focus:outline-none" /></div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item, i) => {
            const savings = item.originalPrice - item.price;
            const savingsPct = Math.round((savings / item.originalPrice) * 100);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                  <div className="relative h-48 bg-nira-gray overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black backdrop-blur-md ${item.condition === 'Like New' ? 'bg-emerald-500/90 text-white' : item.condition === 'Excellent' ? 'bg-blue-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>{item.condition}</span>
                      <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[9px] font-bold text-nira-dark">Score: {item.conditionScore}/100</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 bg-red-500/90 backdrop-blur-md rounded-md text-[9px] font-black text-white flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />{savingsPct}% OFF</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-sm text-nira-dark mb-0.5">{item.name}</h3>
                    <p className="text-[11px] text-nira-text-secondary mb-2">{item.brand} • {item.category}</p>
                    {/* Price block */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-heading font-black text-xl text-nira-dark">₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-nira-text-secondary line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3 text-[10px]">
                      <Tag className="w-3 h-3 text-nira-yellow" />
                      <span className="text-nira-text-secondary">AI Market Value:</span>
                      <span className="font-bold text-nira-dark">₹{item.marketValue.toLocaleString('en-IN')}</span>
                      {item.price < item.marketValue && <span className="text-emerald-600 font-bold ml-1">Great Deal!</span>}
                    </div>
                    {/* Seller */}
                    <div className="flex items-center justify-between p-2.5 bg-nira-gray rounded-xl mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-nira-dark flex items-center justify-center text-[9px] font-bold text-white">{item.seller.name.slice(0, 2)}</div>
                        <div>
                          <div className="flex items-center gap-1"><p className="text-[10px] font-bold text-nira-dark">{item.seller.name}</p>{item.seller.verified && <CheckCircle className="w-3 h-3 text-emerald-500" />}</div>
                          <p className="text-[9px] text-nira-text-secondary"><Star className="w-3 h-3 fill-nira-yellow text-nira-yellow inline" /> {item.seller.rating} • {item.seller.totalSales} sales</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-nira-text-secondary flex items-center gap-0.5"><MapPin className="w-3 h-3" />{item.location}</span>
                    </div>
                    {/* Details */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.shutterCount && <span className="px-2 py-0.5 bg-nira-gray rounded text-[9px] font-semibold text-nira-text-secondary">🔢 {item.shutterCount.toLocaleString()} clicks</span>}
                      {item.negotiable && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">💬 Negotiable</span>}
                      {item.escrowSupported && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold flex items-center gap-0.5"><Shield className="w-3 h-3" />Escrow</span>}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2.5 bg-nira-yellow text-nira-dark font-bold text-xs rounded-xl hover:shadow-lg transition-all cursor-pointer">Buy Now</button>
                      <button className="px-3 py-2.5 bg-nira-dark text-white rounded-xl hover:bg-nira-dark/80 transition-all cursor-pointer"><MessageSquare className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
