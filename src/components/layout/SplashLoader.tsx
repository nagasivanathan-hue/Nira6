'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    // Preload the logo image so the splash shows it immediately
    const img = new window.Image();
    img.src = '/assets/logo.png';
    img.onload = () => setLogoLoaded(true);

    // Fade out the splash loader after the aperture finishes opening
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neutral-950 select-none overflow-hidden"
        >
          {/* Ambient Radial Backdrop Lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nira-yellow/5 rounded-full blur-[160px]" />
          </div>

          {/* Aperture Shutter & Logo Container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* 1. Centered Brand Logo (revealed behind opening aperture) */}
            <motion.div
              initial={{ 
                opacity: 0, 
                scale: 0.8,
                filter: 'blur(16px)'
              }}
              animate={logoLoaded ? { 
                opacity: 1, 
                scale: 1,
                filter: 'blur(0px)'
              } : {}}
              transition={{ 
                delay: 0.6, 
                duration: 1.2, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="absolute z-10 flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-lg shadow-3xl"
            >
              <Logo height={32} theme="dark" />
              <span className="mt-2 text-[8px] font-semibold tracking-[0.3em] text-neutral-400 uppercase">
                CREATOR PLATFORM
              </span>
            </motion.div>

            {/* 2. Golden caught-focus lens flare (glow effect behind shutter) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={logoLoaded ? { 
                opacity: [0, 0.85, 0], 
                scale: [0.8, 1.35, 1.7] 
              } : {}}
              transition={{ 
                delay: 0.4, 
                duration: 1.1, 
                ease: 'easeOut' 
              }}
              className="absolute w-52 h-52 rounded-full pointer-events-none z-15"
              style={{
                background: 'radial-gradient(circle, rgba(255,218,3,0.25) 0%, rgba(255,218,3,0.04) 50%, transparent 70%)',
                filter: 'blur(20px)'
              }}
            />

            {/* 3. Realistic Mechanical Shutter SVG */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full absolute inset-0 z-20 pointer-events-none"
            >
              <defs>
                {/* 3D Brushed Metal Blade Shading */}
                <linearGradient id="blade-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2c2c32" />
                  <stop offset="35%" stopColor="#1e1e22" />
                  <stop offset="70%" stopColor="#141417" />
                  <stop offset="100%" stopColor="#0b0b0d" />
                </linearGradient>

                {/* Micro shadow between overlapping blades */}
                <filter id="blade-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="-1.2" dy="1.8" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.85" />
                </filter>

                {/* Violet-blue glass flare reflections */}
                <radialGradient id="lens-reflection" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
                  <stop offset="25%" stopColor="rgba(0, 180, 255, 0.06)" />
                  <stop offset="60%" stopColor="rgba(148, 0, 211, 0.03)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
              </defs>

              {/* Concentric glass elements & f-stop markings */}
              <circle cx="50" cy="50" r="47.5" fill="none" stroke="#222" strokeWidth="0.8" />
              <circle cx="50" cy="50" r="46.5" fill="none" stroke="#333" strokeWidth="0.3" opacity="0.6" />
              <circle cx="50" cy="50" r="44.5" fill="none" stroke="#ffffff" strokeWidth="0.1" opacity="0.08" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#ffffff" strokeWidth="0.1" opacity="0.03" />

              {/* 6 Overlapping Shutter Blades */}
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const angle = index * 60;
                // Outward sliding vector
                const moveAngle = angle + 30;
                const rad = (moveAngle * Math.PI) / 180;
                const slideDist = 34;
                const dx = Math.cos(rad) * slideDist;
                const dy = Math.sin(rad) * slideDist;

                return (
                  <motion.path
                    key={index}
                    d="M 50,50 L 89,27.5 A 45,45 0 0,1 89,72.5 Z"
                    fill="url(#blade-grad)"
                    stroke="#2a2a30"
                    strokeWidth="0.4"
                    filter="url(#blade-shadow)"
                    initial={{ 
                      rotate: angle, 
                      x: 0, 
                      y: 0,
                      opacity: 1
                    }}
                    animate={logoLoaded ? { 
                      rotate: angle + 48,
                      x: dx,
                      y: dy,
                      opacity: [1, 1, 0.9, 0] // Keep blades opaque during movement, fade out at edge
                    } : {}}
                    transition={{ 
                      delay: 0.3,
                      duration: 1.5, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    style={{ transformOrigin: '50px 50px' }}
                  />
                );
              })}

              {/* Glass Lens Reflection Overlay */}
              <circle 
                cx="50" 
                cy="50" 
                r="45.5" 
                fill="url(#lens-reflection)" 
                opacity="0.85" 
              />
            </svg>
          </div>

          {/* Glowing Status Loader bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={logoLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="mt-8 w-28 h-[3px] bg-neutral-900 rounded-full overflow-hidden relative"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeInOut'
              }}
              className="absolute top-0 bottom-0 w-12 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #FFDA03, transparent)' }}
            />
          </motion.div>

          {/* Photography/Cinematic styled Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={logoLoaded ? { opacity: 0.4, y: 0 } : {}}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mt-4 flex items-center gap-2 text-[9px] font-medium tracking-[0.4em] uppercase text-neutral-400 font-mono"
          >
            <span>FOCUSING LENS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-nira-yellow animate-ping" />
            <span>F/1.8 SEC</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
