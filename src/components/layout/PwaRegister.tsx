'use client';
import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('NIRA6 PWA SW registered:', reg.scope))
        .catch((err) => console.error('NIRA6 PWA SW registration failed:', err));
    }
  }, []);

  return null;
}
