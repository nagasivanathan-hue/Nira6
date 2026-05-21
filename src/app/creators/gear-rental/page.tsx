/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Star, Shield, Search, Calendar, Truck, Package } from 'lucide-react';
import { mockGearListings } from '@/lib/creatorMockData';

const categories = ['All', 'Camera', 'Lens', 'Drone', 'Lighting', 'Gimbal', 'Microphone', 'Tripod'];

export default function GearRentalPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('price_low');
  const filtered = useMemo(() => {
    let r = [...mockGearListings];
    if (cat !== 'All') r = r.filter(g => g.category === cat);
    if (search) r = r.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.brand.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price_low') r.sort((a, b) => a.dailyRate - b.dailyRate);
    else if (sort === 'price_high') r.sort((a, b) => b.dailyRate - a.dailyRate);
    else r.sort((a, b) => b.rating - a.rating);
    return r;
  }, [search, cat, sort]);

  return (
    <div className="min-h-screen bg-nira-gray">
      {/* Hero */}
      <div className="bg-gradient-to-br from-nira-dark via-[#1a1a2e] to-[#16213e] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-nira-yellow/10 flex items-center justify-center"><Camera className="w-5 h-5 text-nira-yellow" /></div><h1 className="font-heading font-black text-2xl text-white">Gear Rental</h1></div>
          <p className="text-sm text-gray-400 max-w-lg">Rent cameras, lenses, drones, lighting & more from verified owners near you. Daily, hourly & weekly rates.</p>
          <div className="flex gap-6 mt-6">
            {[{ label: 'Listed Gear', value: '5,000+' }, { label: 'Cities', value: '50+' }, { label: 'Avg Rating', value: '4.8★' }].map(s => (
              <div key={s.label}><p className="font-heading font-black text-lg text-white">{s.value}</p><p className="text-[9px] text-gray-500 font-bold uppercase">{s.label}</p></div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gear..." className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-xs border border-gray-200 focus:border-nira-yellow focus:outline-none" /></div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto">
            {categories.map(c => <button key={c} onClick={() => setCat(c)} className={`px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${cat === c ? 'bg-nira-dark text-white' : 'bg-white text-nira-text-secondary hover:bg-nira-dark/5'}`}>{c}</button>)}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2.5 bg-white rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-nira-yellow">
            <option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option><option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((gear, i) => (
            <motion.div key={gear.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-black/5 transition-all">
                <div className="relative h-48 bg-nira-gray overflow-hidden">
                  <img src={gear.image} alt={gear.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {!gear.available && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">Currently Rented</span></div>}
                  <div className="absolute top-3 left-3"><span className="px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[9px] font-black text-nira-dark uppercase">{gear.category}</span></div>
                  {gear.damageProtection && <div className="absolute top-3 right-3"><span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md rounded-md text-[9px] font-bold text-white flex items-center gap-0.5"><Shield className="w-3 h-3" />Protected</span></div>}
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-bold text-sm text-nira-dark mb-0.5">{gear.name}</h3>
                  <p className="text-[11px] text-nira-text-secondary mb-3">{gear.brand} • {gear.condition}</p>
                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[{ label: 'Hourly', value: gear.hourlyRate }, { label: 'Daily', value: gear.dailyRate }, { label: 'Weekly', value: gear.weeklyRate }].map(p => (
                      <div key={p.label} className="bg-nira-gray rounded-lg p-2 text-center"><p className="font-black text-xs text-nira-dark">₹{p.value.toLocaleString('en-IN')}</p><p className="text-[8px] text-nira-text-secondary font-bold uppercase">{p.label}</p></div>
                    ))}
                  </div>
                  {/* Owner + Location */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden"><img src={gear.owner.avatar} alt="" className="w-full h-full object-cover" /></div>
                      <div><p className="text-[10px] font-bold text-nira-dark">{gear.owner.name}</p><span className="flex items-center gap-0.5 text-[9px] text-nira-text-secondary"><Star className="w-3 h-3 fill-nira-yellow text-nira-yellow" />{gear.owner.rating}</span></div>
                    </div>
                    <span className="flex items-center gap-0.5 text-[10px] text-nira-text-secondary"><MapPin className="w-3 h-3" />{gear.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {gear.deliveryAvailable && <span className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold"><Truck className="w-3 h-3" />Delivery</span>}
                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-nira-gray rounded text-[9px] font-bold text-nira-text-secondary"><Package className="w-3 h-3" />Deposit: ₹{gear.securityDeposit.toLocaleString('en-IN')}</span>
                  </div>
                  <button className="w-full mt-3 px-4 py-2.5 bg-nira-dark text-white font-bold text-xs rounded-xl hover:bg-nira-yellow hover:text-nira-dark transition-all cursor-pointer flex items-center justify-center gap-1.5" disabled={!gear.available}>
                    {gear.available ? <><Calendar className="w-3.5 h-3.5" />Rent Now</> : 'Unavailable'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
