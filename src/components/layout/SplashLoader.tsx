'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Elegant luxury native app launch transition duration
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-nira-darker"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [0.98, 1, 0.98]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="flex flex-col items-center gap-4"
          >
            {/* Pulsing White Contrast logo for the dark launching screen */}
            <Logo theme="dark" height={36} width={144} />
            <div className="w-16 h-[2px] bg-nira-yellow/20 rounded-full overflow-hidden mt-2 relative">
              <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut'
                }}
                className="absolute top-0 bottom-0 w-8 bg-nira-yellow rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
