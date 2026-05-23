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
    }, 2200);
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
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nira-yellow/5 rounded-full blur-[140px]" />
          </div>

          {/* Aperture Shutter & Logo Container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* 1. Centered Logo (revealed as aperture opens) */}
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
                delay: 0.5, 
                duration: 1.2, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="absolute z-10 flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md shadow-2xl"
            >
              <Logo height={32} theme="dark" />
              <span className="mt-2 text-[8px] font-semibold tracking-[0.3em] text-neutral-400 uppercase">
                CREATOR PLATFORM
              </span>
            </motion.div>

            {/* 2. Realistic Camera Shutter Aperture (blades layer) */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full absolute inset-0 z-20 pointer-events-none"
            >
              {/* Outer metal lens rim */}
              <circle 
                cx="50" 
                cy="50" 
                r="46" 
                fill="none" 
                stroke="#1c1c1e" 
                strokeWidth="1.5" 
                opacity="0.8" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="47.5" 
                fill="none" 
                stroke="#2c2c2e" 
                strokeWidth="0.5" 
                opacity="0.5" 
              />

              {/* 6 Camera Aperture Blades */}
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const angle = index * 60;
                // Direction vector for sliding outward (bisector of the 60-degree sector)
                const moveAngle = angle + 30;
                const rad = (moveAngle * Math.PI) / 180;
                
                // Slide distance
                const slideDist = 32;
                const dx = Math.cos(rad) * slideDist;
                const dy = Math.sin(rad) * slideDist;

                return (
                  <motion.path
                    key={index}
                    d="M 50,50 L 89,27.5 A 45,45 0 0,1 89,72.5 Z"
                    fill="#151518"
                    stroke="#222226"
                    strokeWidth="0.5"
                    initial={{ 
                      rotate: angle, 
                      x: 0, 
                      y: 0,
                      opacity: 1
                    }}
                    animate={logoLoaded ? { 
                      rotate: angle + 40,
                      x: dx,
                      y: dy,
                      opacity: 0
                    } : {}}
                    transition={{ 
                      delay: 0.3,
                      duration: 1.4, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    style={{ transformOrigin: '50px 50px' }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Glowing Status Loader bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={logoLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.4 }}
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
            transition={{ delay: 1.0, duration: 0.8 }}
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
