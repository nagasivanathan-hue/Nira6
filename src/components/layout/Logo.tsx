'use client';
import { useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  height?: number;
  width?: number;
  theme?: 'dark' | 'light' | 'auto';
}

export default function Logo({ className = '', height = 28, width = 112, theme = 'auto' }: LogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  /* 
   * The logo.png is a 1:1 square with a large yellow background and heavy padding.
   * We aggressively scale + clip to show only the NIRA6 wordmark.
   * overflow-hidden on the wrapper ensures no yellow bleeds out.
   */
  return (
    <div 
      className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{ height, width }}
    >
      {/* Camera Aperture Shutter Loader — shown until image is decoded */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <svg 
            viewBox="0 0 100 100" 
            className="animate-spin-slow" 
            style={{ width: Math.min(height * 0.6, 20), height: Math.min(height * 0.6, 20) }}
          >
            <circle cx="50" cy="50" r="45" fill="none" stroke={theme === 'dark' || theme === 'auto' ? '#FFDA03' : '#111'} strokeWidth="4" />
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <path 
                key={i}
                d={`M50,5 L89,27.5 L73.5,60 Z`} 
                fill={theme === 'dark' || theme === 'auto' ? '#FFDA03' : '#111'}
                opacity="0.85"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Logo Image — scaled 1.55x to crop the yellow padding off */}
      <Image
        src="/assets/logo.png"
        alt="NIRA6 Logo"
        width={Math.round(width * 1.6)}
        height={Math.round(height * 1.6)}
        onLoad={() => setIsLoaded(true)}
        className={`object-contain transition-all duration-500 scale-[1.55] ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${
          theme === 'dark' 
            ? 'brightness-0 invert' 
            : theme === 'light' 
              ? 'brightness-0' 
              : ''
        }`}
        style={{ maxWidth: 'none' }}
        priority
      />
    </div>
  );
}
