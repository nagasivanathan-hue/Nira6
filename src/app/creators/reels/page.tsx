'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, ArrowLeft, Send, X, Loader2, 
  Volume2, VolumeX, Camera, Maximize2, Sliders, Laptop,
  Award, Compass, BarChart3, UploadCloud, Sparkles, AlertCircle
} from 'lucide-react';
import { useAppSelector } from '@/store';
import api from '@/services/api';
import type { User } from '@/types';

// Types Definitions
interface Comment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

interface Reel {
  _id: string;
  creatorId: {
    _id: string;
    name: string;
    avatar: string;
    verified?: boolean;
    verificationLevel?: string;
  };
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  likes: string[];
  comments: Comment[];
  views: number;
  shares: number;
  tags: string[];
}

// -------------------------------------------------------------
// Component: Realistic Aperture mechanical shutter intro loader
// -------------------------------------------------------------
function ApertureSplash({ onComplete }: { onComplete: () => void }) {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = '/assets/logo.png';
    img.onload = () => setLogoLoaded(true);

    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-neutral-950 select-none overflow-hidden">
      {/* Ambient soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Shutter Box */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        {/* Centered Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
          animate={logoLoaded ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute z-10 flex flex-col items-center justify-center text-center pointer-events-none"
        >
          <div className="relative w-12 h-12">
            <Image src="/assets/logo.png" alt="N6" fill className="object-contain" priority unoptimized />
          </div>
          <span className="mt-2 text-[9px] font-bold tracking-[0.4em] text-neutral-400 uppercase font-mono">
            NIRA6 CINEMA
          </span>
        </motion.div>

        {/* Shutter Blades SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 z-20 pointer-events-none">
          <defs>
            <linearGradient id="blade-grad-reels" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#25252b" />
              <stop offset="100%" stopColor="#0a0a0c" />
            </linearGradient>
            <filter id="blade-shadow-reels">
              <feDropShadow dx="-1" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>
          <circle cx="50" cy="50" r="48" fill="none" stroke="#222" strokeWidth="0.8" />
          
          {/* Blades */}
          {[0, 60, 120, 180, 240, 300].map((angle, index) => {
            const rad = ((angle + 30) * Math.PI) / 180;
            const dx = Math.cos(rad) * 35;
            const dy = Math.sin(rad) * 35;

            return (
              <motion.path
                key={index}
                d="M 50,50 L 89,27.5 A 45,45 0 0,1 89,72.5 Z"
                fill="url(#blade-grad-reels)"
                stroke="#1b1b1f"
                strokeWidth="0.4"
                filter="url(#blade-shadow-reels)"
                initial={{ rotate: angle, x: 0, y: 0 }}
                animate={logoLoaded ? { rotate: angle + 55, x: dx, y: dy, opacity: [1, 1, 0.8, 0] } : {}}
                transition={{ delay: 0.1, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: '50px 50px' }}
              />
            );
          })}
        </svg>
      </div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-[8px] font-mono tracking-[0.3em] text-neutral-400 flex items-center gap-1.5"
      >
        <span>APERTURE SHUTTER LENS OPENING</span>
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
      </motion.div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Professional Camera Overlay (Sony/Canon Viewfinder)
// -------------------------------------------------------------
interface CameraHUDProps {
  showGrid: boolean;
}
function CameraHUD({ showGrid }: CameraHUDProps) {
  const [timecode, setTimecode] = useState('00:00:00:00');

  useEffect(() => {
    let frame = 0;
    let sec = 0;
    let min = 0;
    let hour = 0;

    const interval = setInterval(() => {
      frame += 1;
      if (frame >= 30) {
        frame = 0;
        sec += 1;
        if (sec >= 60) {
          sec = 0;
          min += 1;
          if (min >= 60) {
            min = 0;
            hour += 1;
          }
        }
      }
      const pad = (n: number) => String(n).padStart(2, '0');
      setTimecode(`${pad(hour)}:${pad(min)}:${pad(sec)}:${pad(frame)}`);
    }, 33); // approx 30fps

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 flex flex-col justify-between p-4 text-[10px] font-mono text-neutral-300 select-none">
      {/* 3x3 Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25">
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-r border-b border-white/20" />
          <div className="border-b border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-r border-white/20" />
          <div className="border-transparent" />
        </div>
      )}

      {/* AF Tracking Bracket */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-16 h-16 border border-white/10 flex items-center justify-center">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-500/65" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-500/65" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-500/65" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-500/65" />
          <div className="w-1.5 h-1.5 bg-yellow-500/40 rounded-full animate-ping" />
        </div>
      </div>

      {/* Audio Decibel Bar Overlay (Left boundary) */}
      <div className="absolute left-3 top-1/4 bottom-1/4 w-3.5 flex flex-col justify-between items-center bg-black/35 backdrop-blur-md rounded-full py-2 border border-white/5 opacity-80">
        <span className="text-[7px] text-neutral-400">dB</span>
        <div className="flex-1 w-[4px] bg-neutral-900 rounded-full relative my-1.5 overflow-hidden flex flex-col justify-end">
          {/* Simulated decibel meter */}
          <motion.div 
            animate={{ height: ['40%', '85%', '50%', '95%', '65%', '35%', '75%'] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-full bg-gradient-to-t from-emerald-500 via-yellow-500 to-red-500 rounded-full"
          />
        </div>
        <span className="text-[7px] text-neutral-400">CH1</span>
      </div>

      {/* Top HUD Row */}
      <div className="flex justify-between items-start w-full bg-gradient-to-b from-black/55 to-transparent p-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse border border-white/20" />
          <span className="font-bold tracking-widest text-red-500 uppercase">REC 4K</span>
          <span className="text-neutral-400">60p</span>
        </div>
        <div className="text-center">
          <span className="text-xs tracking-wider font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10 text-yellow-500">
            TC {timecode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">STBY</span>
          <span className="bg-neutral-800/85 px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
            <span>89%</span>
            <span className="w-3.5 h-2 border border-white/60 rounded-sm relative p-[1px] flex">
              <span className="w-3/4 h-full bg-white block" />
              <span className="absolute -right-[3px] top-[1.5px] w-[2px] h-[3px] bg-white rounded-r-sm" />
            </span>
          </span>
        </div>
      </div>

      {/* Bottom HUD Row */}
      <div className="flex justify-between items-end w-full bg-gradient-to-t from-black/55 to-transparent p-2 rounded-b-lg">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="tracking-wide">F2.8</span>
          <span className="tracking-wide">1/250</span>
          <span className="tracking-wide bg-neutral-900/80 px-1.5 py-0.5 rounded text-yellow-500 border border-yellow-500/20">ISO 800</span>
        </div>
        <div className="text-right flex items-center gap-3">
          <span className="text-neutral-400">AWB</span>
          <span className="text-neutral-400">0.0eV</span>
          <span className="bg-neutral-900/60 px-1 py-0.5 rounded border border-white/10">MF ∞</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Apple-style Long-press Emoji Reaction Dock
// -------------------------------------------------------------
interface EmojiReactionDockProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}
function EmojiReactionDock({ onSelect, onClose }: EmojiReactionDockProps) {
  const emojis = ['🔥', '❤️', '👏', '🙌', '😮', '😂'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 15 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-neutral-950/80 border border-white/15 backdrop-blur-xl px-4 py-2.5 rounded-full flex gap-3.5 shadow-2xl z-40 select-none cursor-pointer"
    >
      {emojis.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.35 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="text-2xl transition-transform"
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
}

// -------------------------------------------------------------
// Component: Floating Emoji Particle Burst
// -------------------------------------------------------------
interface EmojiParticle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}
function EmojiBurst({ emoji }: { emoji: string; id: number }) {
  const [particles, setParticles] = useState<EmojiParticle[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 140, 
      y: -300 - Math.random() * 200,   
      scale: 0.6 + Math.random() * 0.8,
      rotation: (Math.random() - 0.5) * 60
    })));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-35 flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0.2, x: 0, y: 0, rotate: 0 }}
          animate={{ 
            opacity: 0, 
            scale: p.scale, 
            x: p.x, 
            y: p.y,
            rotate: p.rotation
          }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute text-3xl text-center select-none"
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// Component: Individual Reel Card Virtualized Component
// -------------------------------------------------------------
interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  shouldRender: boolean;
  muted: boolean;
  showHUD: boolean;
  showGrid: boolean;
  onToggleMute: () => void;
  onLike: () => void;
  onCommentClick: () => void;
  onShareClick: () => void;
  currentUser: User | null;
}

function ReelItem({ 
  reel, isActive, shouldRender, muted, showHUD, showGrid, 
  onToggleMute, onLike, onCommentClick, onShareClick, currentUser 
}: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  // Advanced video state
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isHoldPaused, setIsHoldPaused] = useState(false);
  const [showReactionDock, setShowReactionDock] = useState(false);
  const [burstEmoji, setBurstEmoji] = useState<{ emoji: string; id: number } | null>(null);

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preloading & Virtualization Hook
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldRender) return;

    if (isActive && !isHoldPaused) {
      video.currentTime = 0;
      video.playbackRate = playbackSpeed;
      playPromiseRef.current = video.play();
      playPromiseRef.current
        .catch(err => console.log('Autoplay prevented:', err));
    } else {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => video.pause())
          .catch(() => video.pause());
      } else {
        video.pause();
      }
    }
  }, [isActive, shouldRender, playbackSpeed, isHoldPaused]);

  // Speed adjust helper
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Mute Indicator
  useEffect(() => {
    if (showVolumeIndicator) {
      const timer = setTimeout(() => setShowVolumeIndicator(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showVolumeIndicator]);

  // Heart Indicator
  useEffect(() => {
    if (showHeartAnimation) {
      const timer = setTimeout(() => setShowHeartAnimation(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showHeartAnimation]);

  // Hold-to-pause event handlers
  const handleHoldStart = () => {
    holdTimeoutRef.current = setTimeout(() => {
      setIsHoldPaused(true);
      if (videoRef.current) videoRef.current.pause();
    }, 450); 
  };

  const handleHoldEnd = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (isHoldPaused) {
      setIsHoldPaused(false);
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.log(e));
      }
    }
  };

  // Double tap vs single tap
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double Tap: Like
      onLike();
      setShowHeartAnimation(true);
    } else {
      // Single Tap: Toggle Mute
      onToggleMute();
      setShowVolumeIndicator(true);
    }
    setLastTap(now);
  };

  // Scrubber seeking
  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const togglePiP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error:', err);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const triggerEmojiBurst = (emoji: string) => {
    setBurstEmoji({ emoji, id: Date.now() });
  };

  const currentUserId = currentUser ? (currentUser._id || currentUser.id) : '';
  const isLiked = currentUser && currentUserId && reel.likes.includes(currentUserId);

  if (!shouldRender) {
    return (
      <div className="w-full h-full snap-start snap-always shrink-0 relative bg-neutral-950 flex items-center justify-center">
        <Image src={reel.thumbnailUrl} alt={reel.caption} fill className="object-cover opacity-25" unoptimized />
        <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full snap-start snap-always shrink-0 relative flex items-center justify-center bg-neutral-950 overflow-hidden"
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowReactionDock(true);
      }}
    >
      {/* Video Canvas Container (Zooms 3% on hold-pause) */}
      <motion.div 
        animate={{ scale: isHoldPaused ? 1.03 : 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full relative"
      >
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl}
          preload="auto"
          loop
          muted={muted}
          playsInline
          className="w-full h-full object-cover cursor-pointer"
          onClick={handleTap}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
        />

        {/* Cinematic Vignette Shader Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] mix-blend-multiply" />
        
        {/* Soft Noise Texture Film Look */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZHRoPSI0IiBmaWxsPSIjMDAwIi8+Cjwvc3ZnPg==')]" />
      </motion.div>

      {/* Sony/Canon Grid & HUD Info Viewfinder */}
      {showHUD && <CameraHUD showGrid={showGrid} />}

      {/* Emoji Reaction Dock overlay */}
      <AnimatePresence>
        {showReactionDock && (
          <EmojiReactionDock 
            onSelect={triggerEmojiBurst}
            onClose={() => setShowReactionDock(false)}
          />
        )}
      </AnimatePresence>

      {/* Render emoji particle bursts */}
      {burstEmoji && <EmojiBurst key={burstEmoji.id} emoji={burstEmoji.emoji} id={burstEmoji.id} />}

      {/* Freeze-frame freeze HUD lock on Hold Pause */}
      <AnimatePresence>
        {isHoldPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none z-30"
          >
            <div className="bg-black/60 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 text-white">
              <span className="font-mono text-xs uppercase tracking-wider font-bold">VIEWFINDER LOCK / PAUSED</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive single-tap Volume HUD pop */}
      <AnimatePresence>
        {showVolumeIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-35"
          >
            <div className="p-4 bg-black/65 rounded-full text-white backdrop-blur-md border border-white/10">
              {muted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double tap glowing Heart pop-up */}
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1.25 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: 'spring', stiffness: 350, damping: 14 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-35"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/25 blur-3xl rounded-full scale-150 animate-pulse" />
              <Heart className="w-24 h-24 text-red-500 fill-red-500 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Speed selection bar overlay */}
      <AnimatePresence>
        {showSpeedMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 right-16 bg-neutral-950/90 border border-white/15 backdrop-blur-xl p-1.5 rounded-2xl flex flex-col gap-1 z-35 text-xs text-white"
          >
            {[0.5, 1, 1.5, 2].map((sp) => (
              <button
                key={sp}
                onClick={() => changeSpeed(sp)}
                className={`px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/10 text-left ${playbackSpeed === sp ? 'text-yellow-500 font-bold bg-white/5' : 'text-neutral-300'}`}
              >
                {sp}x Speed
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Text Details overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-32 flex flex-col justify-end text-left z-20">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/25 relative shadow-inner">
            <Image src={reel.creatorId.avatar} alt={reel.creatorId.name} fill className="object-cover" unoptimized />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-heading font-black text-xs uppercase tracking-wider text-white">
                {reel.creatorId.name}
              </h4>
              {reel.creatorId.verified && (
                <Award className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
              )}
            </div>
            <p className="text-[9px] text-yellow-500 font-bold uppercase tracking-[0.15em]">
              {reel.creatorId.verificationLevel || 'CREATOR PARTNER'}
            </p>
          </div>
        </div>
        <p className="text-xs text-neutral-200 leading-relaxed max-w-[85%] font-medium">
          {reel.caption}
        </p>

        {/* Custom Progress Scrubber Overlay */}
        <div className="mt-4 w-full flex items-center gap-2 text-[8px] font-mono text-neutral-400">
          <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleScrubChange}
            className="flex-1 accent-yellow-500 h-[2px] bg-neutral-800 rounded-full cursor-pointer hover:h-[4px] transition-all"
          />
          <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Right side floating Action Deck */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4.5 z-30">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onLike}
            className={`p-3 rounded-2xl backdrop-blur-lg border cursor-pointer transition-all duration-300 ${
              isLiked 
                ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-600/30' 
                : 'bg-black/55 text-neutral-300 border-white/10 hover:border-white/20'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
          </motion.button>
          <span className="text-[9px] font-mono font-bold mt-1 text-neutral-300">{reel.likes.length}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onCommentClick}
            className="p-3 bg-black/55 backdrop-blur-lg rounded-2xl border border-white/10 text-neutral-300 hover:border-white/20 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
          <span className="text-[9px] font-mono font-bold mt-1 text-neutral-300">{reel.comments.length}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onShareClick}
            className="p-3 bg-black/55 backdrop-blur-lg rounded-2xl border border-white/10 text-neutral-300 hover:border-white/20 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
          <span className="text-[9px] font-mono font-bold mt-1 text-neutral-300">Share</span>
        </div>

        {/* Speed Adjustment toggle */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
          className={`p-3 backdrop-blur-lg rounded-2xl border transition-all cursor-pointer ${showSpeedMenu ? 'bg-yellow-500 border-yellow-500 text-neutral-950' : 'bg-black/55 border-white/10 text-neutral-300 hover:border-white/20'}`}
        >
          <Sliders className="w-5 h-5" />
        </motion.button>

        {/* Picture in Picture */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={togglePiP}
          className="p-3 bg-black/55 backdrop-blur-lg rounded-2xl border border-white/10 text-neutral-300 hover:border-white/20 transition-all cursor-pointer hidden md:block"
        >
          <Laptop className="w-5 h-5" />
        </motion.button>

        {/* Fullscreen Expand */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleFullscreen}
          className="p-3 bg-black/55 backdrop-blur-lg rounded-2xl border border-white/10 text-neutral-300 hover:border-white/20 transition-all cursor-pointer"
        >
          <Maximize2 className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Creator Tools Dashboard overlay (Simulated Analytics/Uploader)
// -------------------------------------------------------------
interface CreatorDashboardProps {
  onClose: () => void;
  currentUser: User | null;
  onPostSuccess: (videoUrl: string, caption: string) => void;
}

function CreatorDashboard({ onClose, onPostSuccess }: CreatorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'upload'>('analytics');

  // Upload simulation states
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');

  const triggerUploadSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captionInput) return;

    setIsUploading(true);
    setUploadProgress(0);

    const steps = [
      { p: 10, text: 'Hashing media block...' },
      { p: 35, text: 'Uploading chunk 1 of 3 (3.4 MB/s)...' },
      { p: 65, text: 'Uploading chunk 2 of 3 (4.1 MB/s)...' },
      { p: 90, text: 'Uploading chunk 3 of 3 (3.8 MB/s)...' },
      { p: 98, text: 'Executing metadata safety moderation...' },
      { p: 100, text: 'Transcoding complete. Ready to publish.' }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setUploadProgress(steps[currentStepIdx].p);
        setUploadStep(steps[currentStepIdx].text);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          const finalUrl = videoUrlInput.trim() || 'https://assets.mixkit.co/videos/preview/mixkit-videographer-with-camera-recording-in-forest-41585-large.mp4';
          onPostSuccess(finalUrl, captionInput + (locationInput ? ` 📍 ${locationInput}` : ''));
          onClose();
        }, 800);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl text-white">
      <motion.div 
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]"
      >
        {/* Header bar */}
        <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/40">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-yellow-500" />
            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-white">
              Creator Studio Panel
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection links */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/20">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 text-xs uppercase font-black tracking-widest transition-all cursor-pointer border-b-2 ${activeTab === 'analytics' ? 'border-yellow-500 text-yellow-500 bg-white/5' : 'border-transparent text-neutral-400'}`}
          >
            Studio Analytics
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-xs uppercase font-black tracking-widest transition-all cursor-pointer border-b-2 ${activeTab === 'upload' ? 'border-yellow-500 text-yellow-500 bg-white/5' : 'border-transparent text-neutral-400'}`}
          >
            Upload Cinematic Reel
          </button>
        </div>

        {/* Tab Panel contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'analytics' ? (
            <div className="space-y-6">
              {/* Stat grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800/80">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Total Views</span>
                  <span className="text-xl font-mono font-black text-white">45.2K</span>
                  <span className="text-[9px] text-emerald-500 block mt-1 font-bold">+18.4% this week</span>
                </div>
                <div className="bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800/80">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Avg Watch Time</span>
                  <span className="text-xl font-mono font-black text-white">22.8s</span>
                  <span className="text-[9px] text-emerald-500 block mt-1 font-bold">+4.2s improvement</span>
                </div>
                <div className="bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800/80">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Completion Rate</span>
                  <span className="text-xl font-mono font-black text-white">64.2%</span>
                  <span className="text-[9px] text-neutral-500 block mt-1 font-semibold">Standard: 51%</span>
                </div>
                <div className="bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800/80">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">Shares & Saves</span>
                  <span className="text-xl font-mono font-black text-white">1.8K</span>
                  <span className="text-[9px] text-emerald-500 block mt-1 font-bold">+12% growth</span>
                </div>
              </div>

              {/* Graphic analytics chart */}
              <div className="bg-neutral-950/55 p-5 rounded-2xl border border-neutral-800/80 space-y-4 text-left">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-black flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-yellow-500" />
                    Audience Retention Curve (Avg. 45s clip)
                  </h4>
                  <p className="text-[9px] text-neutral-400 mt-0.5">
                    Watch pattern tracking from first frame exposure to video end.
                  </p>
                </div>

                {/* SVG graph */}
                <div className="relative w-full h-44 bg-neutral-900/60 rounded-xl p-3 border border-neutral-800">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#ffffff" strokeWidth="0.08" strokeDasharray="1" opacity="0.3" />
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#ffffff" strokeWidth="0.08" strokeDasharray="1" opacity="0.3" />
                    <line x1="0" y1="30" x2="100" y2="30" stroke="#ffffff" strokeWidth="0.08" strokeDasharray="1" opacity="0.3" />

                    <path
                      d="M 0,4 Q 10,12 25,18 T 50,12 T 75,25 T 100,32"
                      fill="url(#chart-fill)"
                    />
                    <path
                      d="M 0,4 Q 10,12 25,18 T 50,12 T 75,25 T 100,32"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="0.4"
                    />

                    <circle cx="50" cy="12" r="0.75" fill="#eab308" />
                  </svg>

                  <div className="absolute top-2 left-2 text-[8px] bg-black/60 px-1 py-0.5 rounded text-neutral-300 font-mono">100% Intro</div>
                  <div className="absolute top-10 left-[48%] text-[8px] bg-yellow-500/90 text-neutral-950 px-1 py-0.5 rounded font-bold">Cinematic Highlight (+Spike)</div>
                  <div className="absolute bottom-2 right-2 text-[8px] bg-black/60 px-1 py-0.5 rounded text-neutral-400 font-mono">End Card 34%</div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={triggerUploadSimulation} className="space-y-4 text-left">
              <div className="border-2 border-dashed border-neutral-800 rounded-2xl p-6 text-center bg-neutral-950/20 hover:bg-neutral-950/40 transition-all">
                <UploadCloud className="w-10 h-10 text-neutral-500 mx-auto mb-2.5" />
                <p className="text-xs font-semibold text-white">Drag & drop raw cinematic clip here</p>
                <p className="text-[9px] text-neutral-400 mt-1">Supports MP4, MOV. Max size 200MB.</p>
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 block">Video Source Link (Optional override)</label>
                <input
                  type="text"
                  placeholder="https://assets.mixkit.co/... .mp4"
                  value={videoUrlInput}
                  onChange={e => setVideoUrlInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-950 rounded-xl text-xs focus:outline-none border border-neutral-800 focus:border-yellow-500 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 block">Location Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Madurai, Tamil Nadu"
                    value={locationInput}
                    onChange={e => setLocationInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 rounded-xl text-xs focus:outline-none border border-neutral-800 focus:border-yellow-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 block">Schedule Upload Date</label>
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-950 rounded-xl text-xs focus:outline-none border border-neutral-800 focus:border-yellow-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 block">Caption & Hashtags</label>
                <textarea
                  placeholder="Describe your film setting, shot layout or camera settings #cine #sonyfx3"
                  value={captionInput}
                  onChange={e => setCaptionInput(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-neutral-950 rounded-xl text-xs focus:outline-none border border-neutral-800 focus:border-yellow-500 text-white resize-none"
                  required
                />
              </div>

              {isUploading && (
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                    <span className="font-bold text-white">{uploadStep}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  Schedule & Publish Reel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Slide-out Comments & Reactions Sheet (Nested Comments)
// -------------------------------------------------------------
interface CommentsSheetProps {
  isOpen: boolean;
  reel: Reel | null;
  commentInput: string;
  setCommentInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  currentUser: User | null;
}

function CommentsSheet({ 
  isOpen, reel, commentInput, setCommentInput, onSubmit, onClose, currentUser 
}: CommentsSheetProps) {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const [mockReplies, setMockReplies] = useState<{ [commentId: string]: Comment[] }>({
    'comm-default-1': [
      {
        _id: 'rep-1',
        userId: { _id: 'c4', name: 'Sneha Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
        text: 'Agreed! The color grading matches standard S-Log3 grading workflows perfectly.',
        createdAt: new Date().toISOString()
      }
    ]
  });

  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyInput.trim() || !currentUser) return;

    const newReplyId = 'rep-' + new Date().getTime();
    const newReply: Comment = {
      _id: newReplyId,
      userId: {
        _id: currentUser._id || currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      },
      text: replyInput.trim(),
      createdAt: new Date().toISOString()
    };

    setMockReplies(prev => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), newReply]
    }));
    setReplyInput('');
    setActiveReplyId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && reel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black z-[45]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-[65vh] bg-neutral-900 border-t border-neutral-800 text-white rounded-t-3xl z-50 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/40">
              <h3 className="font-heading font-black text-sm uppercase tracking-widest">
                Viewer Engagement ({reel.comments.length} Comments)
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 rounded-xl bg-neutral-850 hover:bg-neutral-800 transition-all cursor-pointer text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {reel.comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-bold">No comment feeds recorded</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Be the first to share your creative breakdown!</p>
                </div>
              ) : (
                reel.comments.map((comm) => (
                  <div key={comm._id} className="space-y-3.5 border-b border-neutral-800/40 pb-4">
                    <div className="flex gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-neutral-850 relative">
                        <Image src={comm.userId.avatar} alt={comm.userId.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-white">{comm.userId.name}</p>
                        <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{comm.text}</p>
                        <button 
                          onClick={() => {
                            setActiveReplyId(activeReplyId === comm._id ? null : comm._id);
                          }}
                          className="text-[9px] text-yellow-500 font-bold uppercase mt-1.5 block hover:underline cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    <div className="pl-11 space-y-3">
                      {(mockReplies[comm._id] || []).map((reply) => (
                        <div key={reply._id} className="flex gap-2.5 text-left bg-neutral-950/20 p-2 rounded-xl border border-neutral-800/20">
                          <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 relative border border-neutral-850">
                            <Image src={reply.userId.avatar} alt={reply.userId.name} fill className="object-cover" unoptimized />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[10px] text-white">{reply.userId.name}</p>
                            <p className="text-[11px] text-neutral-300 mt-0.5">{reply.text}</p>
                          </div>
                        </div>
                      ))}

                      {activeReplyId === comm._id && (
                        <form onSubmit={(e) => handleReplySubmit(e, comm._id)} className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add reply thread..."
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-yellow-500"
                          />
                          <button
                            type="submit"
                            disabled={!replyInput.trim()}
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-neutral-950 font-bold rounded-lg text-[10px] uppercase cursor-pointer"
                          >
                            Post
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {currentUser ? (
              <form onSubmit={onSubmit} className="p-4 border-t border-neutral-800 flex gap-2 items-center bg-neutral-950/30">
                <input
                  type="text"
                  placeholder="Share a thought or camera specs..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500 focus:bg-neutral-950 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="p-2.5 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 rounded-xl disabled:opacity-50 cursor-pointer shrink-0 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-neutral-800 text-center text-xs text-neutral-400 bg-neutral-950/20">
                Please log in to submit comments.
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// -------------------------------------------------------------
// Component: Immersive Share Sheet overlay (Copy Link / Socials)
// -------------------------------------------------------------
interface ShareSheetProps {
  isOpen: boolean;
  reel: Reel | null;
  onClose: () => void;
}
function ShareSheet({ isOpen, reel, onClose }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/creators/reels?id=${reel?._id || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    { name: 'WhatsApp', icon: '🟢', url: `https://api.whatsapp.com/send?text=Check out this cinematic reel on NIRA6: ${window.location.origin}/creators/reels?id=${reel?._id || ''}` },
    { name: 'X / Twitter', icon: '⚫', url: `https://twitter.com/intent/tweet?text=Cinematic video work by ${reel?.creatorId.name} on NIRA6:&url=${window.location.origin}/creators/reels?id=${reel?._id || ''}` },
    { name: 'Facebook', icon: '🔵', url: `https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/creators/reels?id=${reel?._id || ''}` }
  ];

  return (
    <AnimatePresence>
      {isOpen && reel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black z-[45]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 text-white rounded-t-3xl z-50 p-6 flex flex-col space-y-6 text-left"
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <h3 className="font-heading font-black text-xs uppercase tracking-widest text-neutral-300">
                Share Cinematic Portfolio
              </h3>
              <button onClick={onClose} className="p-1 rounded-xl bg-neutral-850 hover:bg-neutral-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {socials.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-4 bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700 rounded-2xl transition-all cursor-pointer text-center"
                >
                  <span className="text-2xl mb-1.5">{soc.icon}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-300">{soc.name}</span>
                </a>
              ))}
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/creators/reels?id=${reel._id}`}
                className="bg-transparent text-neutral-400 font-mono text-[10px] truncate flex-1 border-none outline-none"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// -------------------------------------------------------------
// Component: Primary Reels Main Page Module
// -------------------------------------------------------------
export default function ReelsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Reels feed variables
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // HUD & Layout states
  const [showHUD, setShowHUD] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [activeFeedFilter, setActiveFeedFilter] = useState<'personalized' | 'following' | 'trending'>('personalized');

  // Modals & overlay controls
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  
  // Forms Inputs
  const [commentInput, setCommentInput] = useState('');
  const [muted, setMuted] = useState(true);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Page query routing (Deep Linking)
  useEffect(() => {
    if (reels.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      const targetId = searchParams.get('id');
      if (targetId) {
        const targetIdx = reels.findIndex(r => r._id === targetId);
        if (targetIdx !== -1 && scrollContainerRef.current) {
          setActiveReelIndex(targetIdx);
          const containerHeight = scrollContainerRef.current.clientHeight;
          scrollContainerRef.current.scrollTo({
            top: targetIdx * containerHeight,
            behavior: 'instant' as ScrollBehavior
          });
        }
      }
    }
  }, [reels]);

  // Fetch list of reels
  const fetchReels = useCallback(async () => {
    try {
      const { data } = await api.get('/reels');
      
      if (data.length === 0) {
        const fallbackReels: Reel[] = [
          {
            _id: 'default-1',
            creatorId: {
              _id: 'c1',
              name: 'Arjun Mehta',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
              verified: true,
              verificationLevel: 'ELITE FILMMAKER'
            },
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-in-urban-setting-39824-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
            caption: 'Late night cyberpunk photoshoot in Mumbai. Shot on Sony FX3 at 12800 Dual Native ISO. #cyberpunk #cinematic #sonyfx3',
            likes: [],
            comments: [
              {
                _id: 'comm-default-1',
                userId: { _id: 'u-user', name: 'Deepa Raj', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
                text: 'Absolutely insane low-light performance! The noise level is nonexistent.',
                createdAt: new Date().toISOString()
              }
            ],
            views: 45220,
            shares: 104,
            tags: ['cyberpunk', 'cinematic', 'sonyfx3']
          },
          {
            _id: 'default-2',
            creatorId: {
              _id: 'c2',
              name: 'Priya Sharma',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              verified: true,
              verificationLevel: 'PRO DIRECTOR'
            },
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-camera-capturing-lens-flare-in-nature-41584-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400',
            caption: 'Catching anamorphic flares at sunrise. RED V-Raptor + Atlas Orion Anamorphic prime. #anamorphic #cinematography #red',
            likes: [],
            comments: [],
            views: 89400,
            shares: 232,
            tags: ['anamorphic', 'cinematography', 'red']
          }
        ];
        setReels(fallbackReels);
      } else {
        setReels(data);
      }
    } catch (err) {
      console.error('Failed to get reels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReels();
  }, [fetchReels]);

  // Feed categorization
  const sortedReels = useMemo(() => {
    const feedReels = [...reels];
    if (activeFeedFilter === 'trending') {
      return feedReels.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    if (activeFeedFilter === 'following') {
      return feedReels.sort((a, b) => (b.creatorId.verified ? 1 : 0) - (a.creatorId.verified ? 1 : 0));
    }
    return feedReels;
  }, [reels, activeFeedFilter]);

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const containerHeight = container.clientHeight;
    container.scrollTo({
      top: index * containerHeight,
      behavior: 'smooth'
    });
    setActiveReelIndex(index);
  };

  // Keyboard accessibility binds
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setMuted(m => !m);
      }
      if (e.code === 'KeyM') {
        setMuted(m => !m);
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = Math.min(sortedReels.length - 1, activeReelIndex + 1);
        scrollToIndex(nextIdx);
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = Math.max(0, activeReelIndex - 1);
        scrollToIndex(prevIdx);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [activeReelIndex, sortedReels]);

  // Scroll visibility index track
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    if (containerHeight === 0) return;
    const index = Math.round(scrollTop / containerHeight);
    if (index !== activeReelIndex && index >= 0 && index < sortedReels.length) {
      setActiveReelIndex(index);
    }
  }, [activeReelIndex, sortedReels.length]);

  // Handle Likes
  const handleLike = async (reelId: string) => {
    if (!currentUser) {
      alert('Please log in to register your like!');
      return;
    }

    try {
      const { data } = await api.post('/reels/interact', {
        reelId,
        action: 'like'
      });
      setReels(prev =>
        prev.map(r => r._id === reelId ? { ...r, likes: data.likes } : r)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Comments Submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;

    const currentReel = sortedReels[activeReelIndex];
    if (!currentReel) return;
    const text = commentInput;
    setCommentInput('');

    try {
      const { data } = await api.post('/reels/interact', {
        reelId: currentReel._id,
        action: 'comment',
        text
      });
      setReels(prev =>
        prev.map(r => r._id === currentReel._id ? { ...r, comments: data.comments } : r)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Upload callback from Creator tools
  const handleCreatorPostSuccess = async (videoUrl: string, caption: string) => {
    try {
      const { data } = await api.post('/reels', {
        videoUrl,
        caption,
        tags: caption.match(/#\w+/g)?.map(t => t.slice(1)) || []
      });
      if (data.success) {
        fetchReels();
        alert('Reel successfully published to NIRA6 Cinema Feed!');
      }
    } catch (err) {
      console.error('Upload fail:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  const currentReel = sortedReels[activeReelIndex] || null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between items-center relative overflow-hidden font-sans">
      
      {/* Intro shutter animation panel */}
      <AnimatePresence>
        {loaderVisible && (
          <ApertureSplash onComplete={() => setLoaderVisible(false)} />
        )}
      </AnimatePresence>

      {/* Floating Header UI */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
        <Link href="/creators" className="p-3 bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-black/60 transition-all flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Feed Filter Selection Tabs (Center top) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex bg-black/55 backdrop-blur-md border border-white/10 p-1 rounded-2xl text-[9px] font-black uppercase tracking-wider">
        {(['personalized', 'following', 'trending'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFeedFilter(filter);
              setActiveReelIndex(0);
              if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            }}
            className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${activeFeedFilter === filter ? 'bg-yellow-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Right Top HUD Toggles */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowHUD(!showHUD)}
          className={`p-3 backdrop-blur-md rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${showHUD ? 'bg-yellow-500 border-yellow-500 text-neutral-950' : 'bg-black/40 border-white/10 text-white hover:bg-black/60'}`}
          title="Toggle Camera Viewfinder HUD"
        >
          <Camera className="w-4 h-4" />
        </button>

        {showHUD && (
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-3 backdrop-blur-md rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${showGrid ? 'bg-neutral-800 border-neutral-700 text-yellow-500' : 'bg-black/40 border-white/10 text-white hover:bg-black/60'}`}
            title="Toggle Alignment Grid"
          >
            <Compass className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setMuted(!muted)}
          className="p-3 bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-black/60 transition-all cursor-pointer flex items-center justify-center"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {currentUser && (
          <button
            onClick={() => setDashboardOpen(true)}
            className="p-3 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center gap-1 hover:shadow-lg hover:shadow-yellow-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Studio
          </button>
        )}
      </div>

      {/* Main Reels snaps column (Netflix/Sony cinematic framing box) */}
      <div className="flex-1 w-full max-w-md h-[calc(100vh-60px)] relative bg-black shadow-2xl animate-fade-in">
        {sortedReels.length > 0 ? (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide touch-scroll"
          >
            {sortedReels.map((reel, idx) => {
              const isNear = Math.abs(idx - activeReelIndex) <= 1;
              const isPreload = idx === activeReelIndex + 2; 
              const shouldRender = isNear || isPreload;

              return (
                <ReelItem
                  key={reel._id}
                  reel={reel}
                  isActive={idx === activeReelIndex}
                  shouldRender={shouldRender}
                  muted={muted}
                  showHUD={showHUD}
                  showGrid={showGrid}
                  onToggleMute={() => setMuted(!muted)}
                  onLike={() => handleLike(reel._id)}
                  onCommentClick={() => setCommentsOpen(true)}
                  onShareClick={() => setShareOpen(true)}
                  currentUser={currentUser}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertCircle className="w-8 h-8 text-neutral-600 mb-2 animate-bounce" />
            <p className="text-sm text-neutral-400">No cinematic reels available</p>
          </div>
        )}
      </div>

      <CommentsSheet
        isOpen={commentsOpen}
        reel={currentReel}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        onSubmit={handleCommentSubmit}
        onClose={() => setCommentsOpen(false)}
        currentUser={currentUser}
      />

      <ShareSheet
        isOpen={shareOpen}
        reel={currentReel}
        onClose={() => setShareOpen(false)}
      />

      <AnimatePresence>
        {dashboardOpen && (
          <CreatorDashboard
            onClose={() => setDashboardOpen(false)}
            currentUser={currentUser}
            onPostSuccess={handleCreatorPostSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
