'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (glowRef.current) {
      glowRef.current.style.left = '-999px';
      glowRef.current.style.top = '-999px';
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && glowRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        glowRef.current.style.left = `${e.clientX - rect.left - 300}px`;
        glowRef.current.style.top = `${e.clientY - rect.top - 300}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
      {/* Dynamic Glow Spotlight following mouse */}
      <div 
        ref={glowRef}
        className="absolute w-[600px] h-[600px] bg-nira-yellow/5 rounded-full blur-[160px] pointer-events-none transition-transform duration-100 ease-out z-10 hidden md:block"
      />

      {/* 85mm f/1.4 Sim: Shallow Depth of Field Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[450px] h-[450px] bg-nira-yellow/5 rounded-full blur-[160px] pointer-events-none" />
        
        <Image
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1920"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25 filter blur-[12px] scale-105 select-none pointer-events-none"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(7,7,10,0.5)_50%,#07070a_90%)]" />
      </div>

      {/* Film Grain Texture Overlay */}
      <div className="absolute inset-0 z-[5] pointer-events-none opacity-[0.045] film-grain-overlay" />

      {/* Camera HUD Viewfinder Corners */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-x-6 sm:inset-x-8 inset-y-12 sm:inset-y-16 pointer-events-none z-10"
      >
        {/* Top-Left Corner */}
        <div className="absolute top-0 left-0">
          <div className="w-5 h-[2px] bg-white/30" />
          <div className="w-[2px] h-5 bg-white/30" />
        </div>
        {/* Top-Right Corner */}
        <div className="absolute top-0 right-0">
          <div className="w-5 h-[2px] bg-white/30 ml-auto" />
          <div className="w-[2px] h-5 bg-white/30 ml-auto" />
        </div>
        {/* Bottom-Left Corner */}
        <div className="absolute bottom-0 left-0">
          <div className="w-[2px] h-5 bg-white/30" />
          <div className="w-5 h-[2px] bg-white/30" />
        </div>
        {/* Bottom-Right Corner */}
        <div className="absolute bottom-0 right-0">
          <div className="w-[2px] h-5 bg-white/30 ml-auto" />
          <div className="w-5 h-[2px] bg-white/30 ml-auto" />
        </div>
        
        {/* Telemetry Monospace Overlay */}
        <div className="absolute top-4 left-6 hidden md:flex items-center gap-4 text-[9px] font-mono text-neutral-500">
          <span>STBY</span>
          <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full" />
          <span>RAW 12bit</span>
        </div>
        <div className="absolute top-4 right-6 hidden md:flex items-center gap-4 text-[9px] font-mono text-neutral-500">
          <span>F2.8</span>
          <span>1/250s</span>
          <span>ISO 800</span>
        </div>
      </motion.div>
    </div>
  );
}
