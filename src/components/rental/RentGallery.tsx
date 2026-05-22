'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RentalItem } from '@/types';

export default function RentGallery({ item }: { item: RentalItem }) {
  const images = item.images?.length > 0 ? item.images : [item.image];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Main Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/20 border border-white/5 mb-3 group">
        <Image
          src={images[activeIdx]}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Image count badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-md text-white/70 text-[10px] font-bold rounded-lg border border-white/10">
          {activeIdx + 1} / {images.length}
        </div>
        {/* Brand watermark */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md text-white/60 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg border border-white/5">
          {item.brand}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((img: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeIdx === idx ? 'border-nira-yellow' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
