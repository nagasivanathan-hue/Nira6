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

  return (
    <div 
      className={`relative flex items-center justify-center select-none transition-all duration-300 hover:opacity-95 ${className}`}
      style={{ height, width }}
    >
      {/* 6-Blade Camera Aperture Shutter Loader */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-transparent">
          <svg 
            viewBox="0 0 100 100" 
            className="animate-spin-slow w-5 h-5 text-nira-yellow" 
            fill="currentColor"
          >
            {/* Outer Rim */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
            {/* Overlapping aperture blades */}
            <path d="M50,5 L89,27.5 L73.5,60 Z" opacity="0.9" />
            <path d="M89,27.5 L89,72.5 L58,72.5 Z" opacity="0.9" />
            <path d="M89,72.5 L50,95 L34.5,62.5 Z" opacity="0.9" />
            <path d="M50,95 L11,72.5 L26.5,40 Z" opacity="0.9" />
            <path d="M11,72.5 L11,27.5 L42,27.5 Z" opacity="0.9" />
            <path d="M11,27.5 L50,5 L65.5,37.5 Z" opacity="0.9" />
          </svg>
        </div>
      )}

      {/* Advanced Snug-Fitting Crop using slight scaling to clip visual margins */}
      <Image
        src="/assets/logo.png"
        alt="NIRA6 Logo"
        width={width}
        height={height}
        onLoad={() => setIsLoaded(true)}
        className={`object-contain transition-all duration-500 scale-[1.12] ${
          isLoaded ? 'opacity-100' : 'opacity-0 scale-[0.98]'
        } ${
          theme === 'dark' 
            ? 'brightness-0 invert' 
            : theme === 'light' 
              ? 'brightness-0' 
              : ''
        }`}
        priority
      />
    </div>
  );
}
