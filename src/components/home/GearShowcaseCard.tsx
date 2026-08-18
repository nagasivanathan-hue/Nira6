'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Shield, CheckCircle2 } from 'lucide-react';

export default function GearShowcaseCard() {
  const [activeGear, setActiveGear] = useState(0);
  const gearItems = [
    { 
      name: 'Sony FX6', 
      category: 'Cinema Camera', 
      price: '₹3,89,990',
      condition: 'Like New',
      rating: 4.9,
      image: '/assets/product-camera.png',
      specs: ['4K 120fps', 'S-Cinetone', 'Dual ISO']
    },
    { 
      name: 'DJI Inspire 3', 
      category: 'Professional Drone', 
      price: '₹6,49,000',
      condition: 'Certified',
      rating: 4.8,
      image: '/assets/product-drone.png',
      specs: ['8K RAW', 'Waypoint Pro', 'O3 Pro']
    },
    { 
      name: 'Sigma 35mm f/1.4', 
      category: 'Art Series Lens', 
      price: '₹62,490',
      condition: 'Excellent',
      rating: 4.9,
      image: '/assets/product-lens.png',
      specs: ['f/1.4 Art', 'HSM AF', 'Low Distortion']
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGear(prev => (prev + 1) % gearItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [gearItems.length]);

  const gear = gearItems[activeGear];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full max-w-[420px]"
    >
      {/* Card Container */}
      <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl overflow-hidden group hover:border-nira-yellow/20 transition-all duration-500">
        
        {/* Subtle glow behind the card */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-nira-yellow/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 px-3 py-1 bg-nira-yellow/10 border border-nira-yellow/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-nira-yellow rounded-full animate-pulse" />
            <span className="text-[10px] text-nira-yellow font-bold uppercase tracking-wider">Featured Listing</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-nira-yellow fill-nira-yellow" />
            <span className="text-xs text-white font-bold">{gear.rating}</span>
          </div>
        </div>

        {/* Product Image */}
        <div className="relative w-full h-52 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl" />
          <motion.div
            key={activeGear}
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative w-40 h-40"
          >
            <Image 
              src={gear.image}
              alt={gear.name}
              fill
              sizes="160px"
              className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" 
            />
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{gear.category}</p>
            <h3 className="text-xl font-heading font-black text-white mt-0.5">{gear.name}</h3>
          </div>
          
          {/* Specs Tags */}
          <div className="flex flex-wrap gap-1.5">
            {gear.specs.map(spec => (
              <span key={spec} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded-md text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                {spec}
              </span>
            ))}
          </div>

          {/* Price & Condition */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div>
              <p className="text-2xl font-heading font-black text-white">{gear.price}</p>
              <p className="text-[10px] text-neutral-500 font-medium">incl. of all taxes</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-bold">{gear.condition}</span>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {gearItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveGear(i)}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === activeGear ? 'w-6 bg-nira-yellow' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`View gear item ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating trust micro-badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-[#111]/90 border border-white/10 rounded-full backdrop-blur-md shadow-2xl"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] text-neutral-300 font-bold">NIRA6 Verified • Escrow Protected</span>
      </motion.div>
    </motion.div>
  );
}
