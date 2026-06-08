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

  // Pre-compiled Tailwind classes for height & font-size mapping to avoid inline styles
  const logoSizeClasses: Record<number, { container: string; text: string }> = {
    20: { container: 'w-[20px] h-[20px]', text: 'text-[17px]' },
    26: { container: 'w-[26px] h-[26px]', text: 'text-[22px]' },
    28: { container: 'w-[28px] h-[28px]', text: 'text-[24px]' },
    32: { container: 'w-[32px] h-[32px]', text: 'text-[27.2px]' },
  };

  const sizeClass = logoSizeClasses[height] || { container: 'w-[28px] h-[28px]', text: 'text-[24px]' };

  return (
    <div className={`flex items-center gap-2 select-none pointer-events-none whitespace-nowrap flex-shrink-0 ${className}`}>
      {/* Brand Icon (Square frame with logo image) */}
      <div className={`relative flex-shrink-0 overflow-hidden ${sizeClass.container}`}>
        <Image
          src="/assets/logo.png"
          alt="N6"
          fill
          sizes={`${iconSize}px`}
          onLoad={() => setIsLoaded(true)}
          className={`object-contain transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority
        />
      </div>

      {/* Brand Text Name */}
      {!iconOnly && (
        <span className={`font-heading font-black tracking-tight leading-none ${textColorClass} ${sizeClass.text}`}>
          NIRA6
        </span>
      )}
    </div>
  );
}
