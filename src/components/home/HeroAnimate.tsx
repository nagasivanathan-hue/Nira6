'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function FadeInUp({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '',
  y = 20
}: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number; 
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '' 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollDownIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
    >
      <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Scroll Down</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-5 h-5 text-nira-yellow/70" />
      </motion.div>
    </motion.div>
  );
}
