'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Preload the logo image so the splash shows it immediately
    const img = new window.Image();
    img.src = '/assets/logo.png';
    img.onload = () => setLogoLoaded(true);

    // Elegant luxury native app launch transition
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.08,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)' }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-nira-yellow/5 rounded-full blur-[120px]" />
          </div>

          {/* Aperture spinner — always visible until logo loads */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={logoLoaded ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute"
          >
            <svg viewBox="0 0 100 100" className="w-12 h-12 animate-spin-slow">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#FFDA03" strokeWidth="3" opacity="0.3" />
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <path 
                  key={i}
                  d="M50,5 L89,27.5 L73.5,60 Z" 
                  fill="#FFDA03"
                  opacity="0.7"
                  transform={`rotate(${angle} 50 50)`}
                />
              ))}
            </svg>
          </motion.div>

          {/* Logo — fades in once the image is decoded */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={logoLoaded ? { 
              opacity: [0, 1, 0.7, 1],
              scale: [0.9, 1.02, 1]
            } : {}}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative overflow-hidden"
            style={{ width: 200, height: 50 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo.png"
              alt="NIRA6"
              onLoad={() => setLogoLoaded(true)}
              className="w-full h-full object-contain scale-[1.55] brightness-0 invert"
              style={{ maxWidth: 'none' }}
            />
          </motion.div>

          {/* Glowing loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={logoLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-6 w-20 h-[2px] bg-white/5 rounded-full overflow-hidden relative"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: 'easeInOut'
              }}
              className="absolute top-0 bottom-0 w-10 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #FFDA03, transparent)' }}
            />
          </motion.div>

          {/* Subtle tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={logoLoaded ? { opacity: 0.15 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-4 text-[9px] font-bold tracking-[0.25em] uppercase text-white"
          >
            Creator Ecosystem
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
