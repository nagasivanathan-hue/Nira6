'use client';
import { useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  height?: number;
  width?: number; // Kept for backwards compatibility but we layout responsively using flex
  theme?: 'dark' | 'light' | 'auto';
  iconOnly?: boolean;
}

export default function Logo({ className = '', height = 28, theme = 'auto', iconOnly = false }: LogoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Set colors based on the theme
  const textColorClass = 
    theme === 'dark' 
      ? 'text-white' 
      : theme === 'light' 
        ? 'text-nira-dark' 
        : 'text-current'; // 'auto' inherits text-color from parent container

  // Size of the logo icon is 1:1, derived from the height prop
  const iconSize = height;

  return (
    <div className={`flex items-center gap-2 select-none pointer-events-none ${className}`}>
      {/* Brand Icon (Square frame with logo image) */}
      <div 
        className="relative overflow-hidden rounded-lg bg-nira-yellow border border-nira-yellow/20 shadow-sm flex-shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/assets/logo.png"
          alt="N6"
          fill
          sizes={`${iconSize}px`}
          onLoad={() => setIsLoaded(true)}
          className={`object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority
        />
      </div>

      {/* Brand Text Name */}
      {!iconOnly && (
        <span 
          className={`font-heading font-black tracking-tight leading-none ${textColorClass}`}
          style={{ fontSize: `${Math.round(height * 0.85)}px` }}
        >
          NIRA6
        </span>
      )}
    </div>
  );
}
