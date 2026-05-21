'use client';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  height?: number;
  width?: number;
  theme?: 'dark' | 'light' | 'auto';
}

export default function Logo({ className = '', height = 28, width = 112, theme = 'auto' }: LogoProps) {
  // A premium luxury-level logo wrapper. 
  // It applies clean transitions, crisp image rendering, and adjusts contrast.
  return (
    <div className={`relative flex items-center justify-center select-none transition-all duration-300 hover:opacity-90 ${className}`}>
      <Image
        src="/assets/logo.png"
        alt="NIRA6 Logo"
        width={width}
        height={height}
        className={`object-contain transition-all duration-300 ${
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
