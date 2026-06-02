'use client';

import { useState, useEffect, useCallback } from 'react';

const AUTO_SKIP_MS = 3000; // 3-second display duration for loading page

export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleSkip = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 600); // Allow time for CSS fade-out animation
  }, []);

  // Auto-skip timer to transition out of the loading screen
  useEffect(() => {
    const autoSkipTimer = setTimeout(() => {
      handleSkip();
    }, AUTO_SKIP_MS);

    return () => clearTimeout(autoSkipTimer);
  }, [handleSkip]);

  if (!visible) return null;

  return (
    <div
      className={`splash-overlay ${isFadingOut ? 'fade-out' : ''}`}
      role="dialog"
      aria-label="NIRA6 loading screen"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        .splash-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .splash-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
        }
        
        .image-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ffffff;
          overflow: hidden;
        }

        .loader-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `
      }} />

      {/* Image Content wrapper */}
      <div className="image-container">
        <img
          src="/assets/desktop loading page.svg"
          alt="NIRA6 Loading"
          className="loader-img"
        />
      </div>
    </div>
  );
}

