'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Exif Data
const exifSpecs = ['f/1.8', '1/500s', 'ISO 400', 'NIRA6 OS v1.0'];

// Auto-skip timeout (7 seconds) — ensures users on slow 3G are never stuck
const AUTO_SKIP_MS = 7000;

export default function SplashLoader() {
  const [phase, setPhase] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [exifIndex, setExifIndex] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  function playWhirr() {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(40, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }

  function playClick() {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // BUG-003: Extracted skip logic into a stable callback so both button and timeout use the same function
  const handleSkip = useCallback(() => {
    setPhase((currentPhase) => {
      if (currentPhase < 6) {
        setTimeout(() => setVisible(false), 500);
        return 6;
      }
      return currentPhase;
    });
  }, []);

  useEffect(() => {
    // TIMING SEQUENCER
    const timeouts: NodeJS.Timeout[] = [];
    
    // Phase 1: Boot (0s)
    timeouts.push(setTimeout(() => setPhase(1), 0));
    
    // Phase 2: Form (0.5s)
    timeouts.push(setTimeout(() => setPhase(2), 500));
    
    // Phase 3: Hunt (1.5s)
    timeouts.push(setTimeout(() => {
      setPhase(3);
      if (soundEnabled) playWhirr();
    }, 1500));
    
    // Phase 4: Lock (3.0s)
    timeouts.push(setTimeout(() => {
      setPhase(4);
      if (soundEnabled) playClick();
    }, 3000));
    
    // Phase 5: Hold (3.8s)
    timeouts.push(setTimeout(() => setPhase(5), 3800));
    
    // Phase 6: Exit (4.5s)
    timeouts.push(setTimeout(() => setPhase(6), 4500));
    
    // Unmount (5.0s)
    timeouts.push(setTimeout(() => setVisible(false), 5000));
    
    return () => timeouts.forEach(clearTimeout);
  }, [soundEnabled]);

  // BUG-004: Auto-skip fallback after 7 seconds — safety net for slow connections
  useEffect(() => {
    const autoSkipTimer = setTimeout(() => {
      handleSkip();
    }, AUTO_SKIP_MS);

    return () => clearTimeout(autoSkipTimer);
  }, [handleSkip]);

  useEffect(() => {
    if (phase >= 3) {
      const interval = setInterval(() => {
        setExifIndex(i => Math.min(i + 1, exifSpecs.length));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const toggleSound = () => {
    initAudio();
    setSoundEnabled(!soundEnabled);
  };

  if (!visible) return null;

  // Render 60 tiny stars for background
  const stars = Array.from({ length: 60 }).map((_, i) => (
    <div key={i} className="splash-star" style={{
      left: `${((i * 17) % 100)}%`,
      top: `${((i * 23) % 100)}%`,
      animationDelay: `${((i * 3) % 5)}s`,
      opacity: ((i * 7) % 5) * 0.1 + 0.1
    }} />
  ));

  return (
    <div className={`splash-overlay ${phase === 6 ? 'fade-out' : ''}`} role="dialog" aria-label="NIRA6 loading screen">
      <style dangerouslySetInnerHTML={{__html: `
        .splash-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background-color: #0A0A0A;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.5s ease-in-out;
        }
        .splash-overlay.fade-out { opacity: 0; pointer-events: none; }
        
        .splash-star {
          position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%;
          animation: twinkle 3s infinite ease-in-out alternate;
        }
        @keyframes twinkle { 0% { opacity: 0.1; } 100% { opacity: 0.6; } }

        /* Skip Button & Sound Toggle */
        .splash-controls {
          position: absolute; top: 24px; right: 24px; left: 24px;
          display: flex; justify-content: space-between; align-items: center;
          opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        .splash-controls.show { opacity: 1; pointer-events: auto; }
        .skip-btn {
          color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;
          background: none; border: none; cursor: pointer; transition: color 0.2s, box-shadow 0.2s;
        }
        .skip-btn:hover { color: #FFDA03; }
        .skip-btn:focus { outline: none; }
        .skip-btn:focus-visible {
          outline: 2px solid #FFDA03;
          outline-offset: 4px;
          color: #FFDA03;
          border-radius: 4px;
        }
        .sound-toggle {
          color: #888; cursor: pointer; transition: color 0.2s, box-shadow 0.2s; background: none; border: none;
        }
        .sound-toggle:hover { color: #FFDA03; }
        .sound-toggle:focus { outline: none; }
        .sound-toggle:focus-visible {
          outline: 2px solid #FFDA03;
          outline-offset: 4px;
          color: #FFDA03;
          border-radius: 4px;
        }

        /* Main Shake Container */
        .shake-container {
          position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .shake-container.shaking {
          animation: shake 60ms cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          0% { transform: translate(2px, 2px) }
          25% { transform: translate(-2px, -2px) }
          50% { transform: translate(2px, -2px) }
          75% { transform: translate(-2px, 2px) }
          100% { transform: translate(0, 0) }
        }

        /* Aperture Setup */
        .aperture-wrapper {
          position: relative; width: 260px; height: 260px;
          display: flex; align-items: center; justify-content: center;
        }
        @media (max-width: 480px) {
          .aperture-wrapper { width: 200px; height: 200px; }
        }

        /* Background Glow */
        .aperture-glow {
          position: absolute; width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, #FFDA03 0%, transparent 70%);
          opacity: 0; filter: blur(30px); transition: opacity 0.3s;
        }
        .aperture-glow.pulse-glow { opacity: 0.03; }
        .aperture-glow.lock-glow { animation: flash-glow 0.8s ease-out forwards; }
        @keyframes flash-glow { 0% { opacity: 0.08; transform: scale(1.1); } 100% { opacity: 0.05; transform: scale(1); } }

        /* Initial Dot / Ring */
        .boot-ring {
          position: absolute; width: 1px; height: 1px; background: #FFDA03; border-radius: 50%;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); opacity: 0;
        }
        .boot-ring.p1 { opacity: 1; transform: scale(1); }
        .boot-ring.p2 { 
          opacity: 1; width: 260px; height: 260px; background: transparent; 
          border: 1px solid rgba(255, 218, 3, 0.3); 
        }
        @media (max-width: 480px) {
          .boot-ring.p2 { width: 200px; height: 200px; }
        }

        /* SVG Aperture Rings */
        .aperture-svg {
          position: absolute; width: 100%; height: 100%; z-index: 10;
          opacity: 0; transition: opacity 0.3s;
        }
        .aperture-svg.show { opacity: 1; }
        
        .blade {
          fill: #1A1A1A; stroke: rgba(255, 218, 3, 0.4); stroke-width: 0.5px;
          transform-origin: 50px 50px;
          transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* Blade States */
        /* Phase 2: Open */
        .blades-open .blade { transform: rotate(0deg); }
        /* Phase 3: Hunt */
        .blades-hunt .blade { animation: blade-hunt 1.5s infinite ease-in-out alternate; }
        @keyframes blade-hunt { 0% { transform: rotate(15deg); } 100% { transform: rotate(5deg); } }
        /* Phase 4-5: Lock */
        .blades-lock .blade { transform: rotate(20deg); animation: none; transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1); }
        /* Phase 6: Close */
        .blades-close .blade { transform: rotate(55deg); transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

        /* Logo Area clipped by center circle */
        .logo-clip {
          position: absolute; inset: 0; z-index: 5;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          /* Clip to center circle, which we animate via mask */
          mask-image: radial-gradient(circle, black 35%, transparent 36%);
          -webkit-mask-image: radial-gradient(circle, black 35%, transparent 36%);
          transition: all 1s;
        }
        .blades-open ~ .logo-clip { -webkit-mask-image: radial-gradient(circle, black 45%, transparent 46%); }
        .blades-hunt ~ .logo-clip { animation: mask-hunt 1.5s infinite ease-in-out alternate; }
        @keyframes mask-hunt { 0% { -webkit-mask-image: radial-gradient(circle, black 32%, transparent 33%); } 100% { -webkit-mask-image: radial-gradient(circle, black 38%, transparent 39%); } }
        .blades-lock ~ .logo-clip { -webkit-mask-image: radial-gradient(circle, black 28%, transparent 29%); transition: all 0.1s; }
        .blades-close ~ .logo-clip { -webkit-mask-image: radial-gradient(circle, black 0%, transparent 0%); transition: all 0.4s; }

        /* The actual logo content */
        .nira-logo {
          font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #FFDA03; line-height: 1;
          display: flex; flex-direction: column; align-items: center;
          opacity: 0; transition: opacity 0.3s;
        }
        .nira-logo.show { opacity: 1; }
        .nira-logo.hunting {
          transform: scale(1.15); filter: blur(12px);
          animation: logo-hunt 1.5s infinite alternate ease-in-out;
        }
        @keyframes logo-hunt {
          0% { filter: blur(12px); }
          25% { filter: blur(4px); }
          50% { filter: blur(8px); }
          75% { filter: blur(2px); }
          100% { filter: blur(6px); }
        }
        .nira-logo.locked {
          transform: scale(1); filter: blur(0px);
          transition: transform 0.1s, filter 0.1s;
        }
        .nira-logo.hold {
          transform: scale(1); filter: blur(0px);
          text-shadow: 0 0 20px rgba(255, 218, 3, 0.4);
          transition: text-shadow 0.5s;
        }
        .nira-line { width: 100%; height: 2px; background: #FFDA03; margin-top: 2px; }
        .tagline {
          font-size: 9px; letter-spacing: 3px; color: #555; margin-top: 6px;
          opacity: 0; transition: opacity 0.5s;
        }
        .tagline.show { opacity: 1; color: #FFDA03; }

        /* AF Brackets */
        .af-bracket {
          position: absolute; width: 16px; height: 16px;
          border: 2px solid #FFDA03; opacity: 0;
          transition: all 0.1s; z-index: 8;
        }
        .af-tl { top: 25%; left: 25%; border-right: none; border-bottom: none; }
        .af-tr { top: 25%; right: 25%; border-left: none; border-bottom: none; }
        .af-bl { bottom: 25%; left: 25%; border-right: none; border-top: none; }
        .af-br { bottom: 25%; right: 25%; border-left: none; border-top: none; }

        .brackets-wrapper.hunting .af-bracket {
          opacity: 0.6;
          animation: af-flicker 0.4s infinite alternate;
        }
        .brackets-wrapper.hunting .af-tl { animation-delay: 0.1s; transform: translate(-2px, -2px) scale(1.05); }
        .brackets-wrapper.hunting .af-tr { animation-delay: 0.2s; transform: translate(2px, -2px) scale(1.08); }
        .brackets-wrapper.hunting .af-bl { animation-delay: 0.3s; transform: translate(-2px, 2px) scale(1.02); }
        .brackets-wrapper.hunting .af-br { animation-delay: 0.4s; transform: translate(2px, 2px) scale(1.05); }

        @keyframes af-flicker { 0% { opacity: 0.4; } 100% { opacity: 1; } }

        .brackets-wrapper.locked .af-bracket {
          opacity: 1; transform: translate(0, 0) scale(1);
          border-color: #FFDA03; box-shadow: 0 0 5px rgba(255,218,3,0.5);
        }
        .brackets-wrapper.hidden .af-bracket { opacity: 0; }

        /* White Flash */
        .white-flash {
          position: fixed; inset: 0; background: white; z-index: 999999;
          opacity: 0; pointer-events: none;
        }
        .white-flash.flash { animation: flash-anim 120ms ease-out forwards; }
        @keyframes flash-anim { 0% { opacity: 0; } 50% { opacity: 0.4; } 100% { opacity: 0; } }

        /* Bottom HUD */
        .hud-wrapper {
          position: absolute; bottom: 15%; display: flex; flex-direction: column; align-items: center; gap: 12px;
          opacity: 0; transition: opacity 0.3s; z-index: 50;
        }
        .hud-wrapper.show { opacity: 1; }
        
        .progress-container {
          width: 200px; height: 1px; background: #1E1E1E; position: relative; overflow: visible;
        }
        .progress-fill {
          position: absolute; top: -0.5px; left: 0; height: 2px; background: #FFDA03;
          box-shadow: 2px 0 8px #FFDA03; transition: width 1.5s linear;
          width: 0%;
        }
        .progress-fill.p3 { width: 85%; }
        .progress-fill.p4 { width: 100%; transition: width 0.1s ease-out; }
        .progress-fill.p5 { opacity: 0; transition: opacity 0.3s; }

        /* BUG-004: Auto-skip safety progress bar (7s duration) */
        .auto-skip-progress {
          position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
          background: rgba(255, 218, 3, 0.08);
          overflow: hidden;
        }
        .auto-skip-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, transparent, rgba(255, 218, 3, 0.25));
          animation: auto-skip-fill ${AUTO_SKIP_MS}ms linear forwards;
        }
        @keyframes auto-skip-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .status-text {
          font-size: 10px; letter-spacing: 4px; color: #555; text-transform: uppercase;
          transition: color 0.2s, opacity 0.2s;
        }
        .status-text.pulse { animation: status-pulse 1s infinite alternate; }
        @keyframes status-pulse { 0% { opacity: 0.4; } 100% { opacity: 1; } }
        .status-text.locked { color: #FFDA03; animation: none; text-shadow: 0 0 10px rgba(255,218,3,0.3); }

        .exif-readout {
          font-size: 9px; letter-spacing: 2px; color: #333; display: flex; gap: 8px;
        }
        .exif-item { opacity: 0; animation: type-in 0.1s forwards; }
        @keyframes type-in { to { opacity: 1; } }
      `}} />

      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {stars}
      </div>

      {/* White Flash on Lock */}
      <div className={`white-flash ${phase === 4 ? 'flash' : ''}`} />

      {/* Top Controls */}
      <div className={`splash-controls ${phase >= 2 && phase < 6 ? 'show' : ''} z-50`}>
        <button
          onClick={toggleSound}
          className="sound-toggle flex items-center justify-center p-2"
          aria-label={soundEnabled ? "Mute intro sound" : "Enable intro sound"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button
          onClick={handleSkip}
          className="skip-btn px-4 py-2 hover:bg-[#1E1E1E] rounded-md transition-colors"
          aria-label="Skip intro and enter site"
          tabIndex={0}
        >
          Skip
        </button>
      </div>

      <div className={`shake-container ${phase === 4 ? 'shaking' : ''}`}>
        
        {/* Glow */}
        <div className={`aperture-glow ${phase >= 3 ? 'pulse-glow' : ''} ${phase >= 4 ? 'lock-glow' : ''}`} />

        {/* Outer Ripple / Ring */}
        <div className={`boot-ring ${phase === 1 ? 'p1' : phase >= 2 ? 'p2' : ''}`} />

        <div className="aperture-wrapper">
          {/* SVG Blades */}
          <svg viewBox="0 0 100 100" className={`aperture-svg ${phase >= 2 ? 'show' : ''}`} aria-hidden="true">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#FFDA03" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#FFDA03" strokeWidth="0.5" strokeOpacity="0.6" />
            
            <g className={`
              ${phase === 2 ? 'blades-open' : ''} 
              ${phase === 3 ? 'blades-hunt' : ''} 
              ${phase === 4 || phase === 5 ? 'blades-lock' : ''} 
              ${phase === 6 ? 'blades-close' : ''}
            `}>
              {/* 8 Curved Blades */}
              {[...Array(8)].map((_, i) => {
                const angle = i * 45;
                return (
                  <path
                    key={i}
                    d="M50,50 L85,42 Q75,70 50,85 Z"
                    className="blade"
                    style={{
                      transformOrigin: '50px 50px',
                      // Initial rotation offsets per blade so they form an iris
                      transform: phase === 2 ? `rotate(${angle}deg)` : 
                                 phase === 3 ? `rotate(${angle + 10}deg)` : 
                                 phase === 4 || phase === 5 ? `rotate(${angle + 18}deg)` : 
                                 phase === 6 ? `rotate(${angle + 55}deg)` : `rotate(${angle}deg)`
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Logo Center */}
          <div className="logo-clip">
            <div className={`
              nira-logo 
              ${phase >= 3 ? 'show' : ''} 
              ${phase === 3 ? 'hunting' : ''} 
              ${phase === 4 ? 'locked' : ''} 
              ${phase >= 5 ? 'hold' : ''}
            `}>
              NIRA6
              <div className="nira-line" />
              <div className={`tagline ${phase >= 5 ? 'show' : ''}`}>nira6.in</div>
            </div>
          </div>

          {/* AF Brackets */}
          <div className={`brackets-wrapper absolute inset-0 
            ${phase === 3 ? 'hunting' : ''} 
            ${phase >= 4 && phase < 6 ? 'locked' : ''} 
            ${phase < 3 || phase === 6 ? 'hidden' : ''}
          `}>
            <div className="af-bracket af-tl" />
            <div className="af-bracket af-tr" />
            <div className="af-bracket af-bl" />
            <div className="af-bracket af-br" />
          </div>

        </div>
      </div>

      {/* Bottom HUD */}
      <div className={`hud-wrapper ${phase >= 3 && phase < 6 ? 'show' : ''}`}>
        <div className="progress-container">
          <div className={`progress-fill ${phase === 3 ? 'p3' : phase === 4 ? 'p4' : phase === 5 ? 'p5' : ''}`} />
        </div>
        
        <div className={`status-text ${phase === 3 ? 'pulse' : phase >= 4 ? 'locked' : ''}`}>
          {phase < 4 ? 'CALIBRATING...' : 'FOCUS LOCKED'}
        </div>

        <div className="exif-readout">
          {exifSpecs.slice(0, exifIndex).map((spec, i) => (
            <span key={i} className="exif-item flex items-center gap-2">
              {spec}
              {i < Math.min(exifIndex, exifSpecs.length) - 1 && <span className="text-[#222]">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* BUG-004: Subtle auto-skip progress bar at bottom of screen */}
      <div className="auto-skip-progress">
        <div className="auto-skip-bar" />
      </div>

    </div>
  );
}
