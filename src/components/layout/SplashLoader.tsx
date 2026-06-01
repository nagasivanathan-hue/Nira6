'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AUTO_SKIP_MS = 11000; // 11-second safety fallback

export default function SplashLoader() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSkip = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 600); // Allow time for CSS fade-out animation
  }, []);

  // Sync mute state of the video element with the soundEnabled state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled]);

  // Safety net auto-skip timer
  useEffect(() => {
    const autoSkipTimer = setTimeout(() => {
      handleSkip();
    }, AUTO_SKIP_MS);

    return () => clearTimeout(autoSkipTimer);
  }, [handleSkip]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

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
          background-color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .splash-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
        }
        
        .video-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0A0A0A;
          overflow: hidden;
        }

        .loader-svg {
          width: 100%;
          height: 100%;
        }

        /* Skip Button & Sound Toggle */
        .splash-controls {
          position: absolute;
          top: 24px;
          right: 24px;
          left: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
        }
        .skip-btn {
          color: #888;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          background: rgba(10, 10, 10, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .skip-btn:hover {
          color: #FFDA03;
          border-color: #FFDA03;
          background: rgba(10, 10, 10, 0.7);
        }
        .skip-btn:focus {
          outline: none;
        }
        .skip-btn:focus-visible {
          outline: 2px solid #FFDA03;
          outline-offset: 4px;
        }
        
        .sound-toggle {
          color: #888;
          cursor: pointer;
          background: rgba(10, 10, 10, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
          border-radius: 50%;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sound-toggle:hover {
          color: #FFDA03;
          border-color: #FFDA03;
          background: rgba(10, 10, 10, 0.7);
        }
        .sound-toggle:focus {
          outline: none;
        }
        .sound-toggle:focus-visible {
          outline: 2px solid #FFDA03;
          outline-offset: 4px;
        }

        /* Auto-skip progress bar at the very bottom */
        .auto-skip-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(255, 218, 3, 0.08);
          overflow: hidden;
          z-index: 100;
        }
        .auto-skip-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, transparent, rgba(255, 218, 3, 0.6));
          animation: auto-skip-fill ${AUTO_SKIP_MS}ms linear forwards;
        }
        @keyframes auto-skip-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `
      }} />

      {/* Top Controls */}
      <div className="splash-controls">
        <button
          onClick={toggleSound}
          className="sound-toggle"
          aria-label={soundEnabled ? "Mute intro sound" : "Enable intro sound"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button
          onClick={handleSkip}
          className="skip-btn"
          aria-label="Skip intro and enter site"
          tabIndex={0}
        >
          Skip
        </button>
      </div>

      {/* Video Content wrapper */}
      <div className="video-container">
        <svg
          viewBox="0 0 1280 720"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          className="loader-svg"
          aria-hidden="true"
        >
          <foreignObject x="0" y="0" width="1280" height="720">
            <video
              ref={videoRef}
              src="/assets/I_the_video_can_u_stick_with_t.mp4"
              autoPlay
              playsInline
              muted={!soundEnabled}
              onEnded={handleSkip}
              className="w-full h-full object-cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </foreignObject>
          {/* Cover Rect to hide the Gemini spark logo in the bottom-right corner */}
          <rect
            x="1150"
            y="545"
            width="130"
            height="175"
            fill="#EDC108"
            stroke="none"
          />
        </svg>
      </div>

      {/* Safety Progress Indicator */}
      <div className="auto-skip-progress">
        <div className="auto-skip-bar" />
      </div>
    </div>
  );
}
