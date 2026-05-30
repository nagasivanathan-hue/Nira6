'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, ShoppingCart, Bookmark, X, Send, Eye, CheckCircle2, Camera } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// --- MOCK DATA ---
// Supabase replacement instructions:
// const { data: reels } = await supabase
//   .from('gear_listings')
//   .select('id, title, category, price, video_url, thumbnail_url, seller:profiles(name, avatar_url), views, likes')
//   .eq('has_reel', true)
//   .order('created_at', { ascending: false });

const MOCK_REELS = [
  {
    id: 1,
    title: "Sony A7III — Barely Used, Full Kit",
    category: "Camera",
    price: "₹88,000",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/400/700?random=1",
    seller: { name: "Arjun K", avatar: "https://picsum.photos/100/100?random=1", verified: true },
    views: 9400,
    likes: 612,
    listingId: "listing-001",
    comments: [
      { id: 1, user: "Ravi M", avatar: "https://picsum.photos/100/100?random=10", text: "Is the battery grip included?", time: "1h ago" },
      { id: 2, user: "NSK", avatar: "https://picsum.photos/100/100?random=11", text: "Condition looks great 🔥", time: "3h ago" }
    ]
  },
  {
    id: 2,
    title: "Godox SL-60W LED — Studio Light",
    category: "Lighting",
    price: "₹12,500",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/400/700?random=2",
    seller: { name: "Deepa S", avatar: "https://picsum.photos/100/100?random=2", verified: false },
    views: 4200,
    likes: 289,
    listingId: "listing-002",
    comments: []
  },
  {
    id: 3,
    title: "DJI Mavic 3 Pro Cine Drone",
    category: "Drone",
    price: "₹2,45,000",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/400/700?random=3",
    seller: { name: "CineRider", avatar: "https://picsum.photos/100/100?random=3", verified: true },
    views: 12500,
    likes: 1205,
    listingId: "listing-003",
    comments: [
      { id: 1, user: "Karan", avatar: "https://picsum.photos/100/100?random=12", text: "Does it come with RC Pro?", time: "10m ago" }
    ]
  },
  {
    id: 4,
    title: "Sigma 24-70mm f/2.8 DG DN Art",
    category: "Lens",
    price: "₹82,000",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/400/700?random=4",
    seller: { name: "LensCraze", avatar: "https://picsum.photos/100/100?random=4", verified: true },
    views: 6300,
    likes: 412,
    listingId: "listing-004",
    comments: []
  },
  {
    id: 5,
    title: "Sennheiser MKE 600 Shotgun Mic",
    category: "Audio",
    price: "₹21,000",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/400/700?random=5",
    seller: { name: "AudioPro India", avatar: "https://picsum.photos/100/100?random=5", verified: false },
    views: 3100,
    likes: 154,
    listingId: "listing-005",
    comments: []
  },
  {
    id: 6,
    title: "Ronin RS3 Pro Stabilizer",
    category: "Accessories",
    price: "₹65,000",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/400/700?random=6",
    seller: { name: "Gimbal Guy", avatar: "https://picsum.photos/100/100?random=6", verified: true },
    views: 8900,
    likes: 721,
    listingId: "listing-006",
    comments: []
  }
];

const CATEGORIES = ["All", "Camera", "Lens", "Lighting", "Audio", "Drone", "Accessories"];

// --- REEL CARD COMPONENT ---
const ReelCard = ({ 
  reel, 
  isActive, 
  isGlobalMuted, 
  toggleMute, 
  onOpenComments 
}: { 
  reel: typeof MOCK_REELS[0], 
  isActive: boolean, 
  isGlobalMuted: boolean, 
  toggleMute: () => void,
  onOpenComments: (reel: typeof MOCK_REELS[0]) => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // To remove thumbnail on first play
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Autoplay logic driven by Intersection Observer state passed from parent via `isActive`
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      // Small timeout to prevent rapid play/pause errors when scrolling quickly
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        }).catch(err => console.log('Autoplay blocked:', err));
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setHasInteracted(true);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    // Only trigger if not clicking buttons
    if ((e.target as HTMLElement).closest("button")) return;
    if (!isLiked) handleLike();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: `Check out this gear on NIRA6: ${reel.title}`,
          url: `${window.location.origin}/buy/${reel.listingId}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/buy/${reel.listingId}`);
      alert('Link copied to clipboard!');
    }
  };

  // Randomized tilt for antigravity effect
  const randomTilt = useRef((Math.random() * 10 - 5).toFixed(2));
  const delay = useRef((Math.random() * 2).toFixed(2));

  return (
    <div 
      className={`reel-card-wrapper w-full max-w-[380px] mx-auto h-[100dvh] flex items-center justify-center snap-center relative transition-all duration-500`}
    >
      <div 
        className={`reel-card group relative w-[92%] sm:w-full aspect-[9/16] bg-neutral-900 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${isActive ? 'active-reel' : 'inactive-reel'}`}
        style={{ 
          '--tilt': `${randomTilt.current}deg`, 
          '--delay': `${delay.current}s` 
        } as React.CSSProperties}
        onDoubleClick={handleDoubleTap}
        onClick={togglePlay}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          playsInline
          muted={isGlobalMuted}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Thumbnail Overlay */}
        <AnimatePresence>
          {!hasInteracted && (
            <motion.div 
              initial={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 z-10"
            >
              <Image src={reel.thumbnail} alt={reel.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#FFDA03]/90 flex items-center justify-center shadow-lg shadow-[#FFDA03]/40 backdrop-blur-sm">
                  <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause Center Indicator */}
        <AnimatePresence>
          {!isPlaying && hasInteracted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Double Tap Heart Burst */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1.5, y: -50 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-32 h-32 text-red-500" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price Pill Badge */}
        <div className="absolute top-4 right-4 z-40">
          <div className="bg-[#FFDA03] text-[#0A0A0A] font-heading font-black tracking-widest text-sm px-3 py-1.5 rounded-full shadow-lg shadow-black/50">
            {reel.price}
          </div>
        </div>

        {/* Sound Toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          className="absolute top-4 left-4 z-40 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
          aria-label={isGlobalMuted ? "Unmute video" : "Mute video"}
        >
          {isGlobalMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Bottom Overlay Gradient & Metadata */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none" />
        
        <div className="absolute bottom-6 left-4 right-16 z-30 flex flex-col gap-3 pointer-events-none">
          {/* Tag & Views */}
          <div className="flex items-center gap-2">
            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
              {reel.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/80 font-mono">
              <Eye className="w-3 h-3" /> {(reel.views / 1000).toFixed(1)}k
            </span>
          </div>

          {/* Title */}
          <h2 className="text-[#FFDA03] font-heading font-black text-2xl leading-tight line-clamp-2">
            {reel.title}
          </h2>

          {/* Seller Info */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 pointer-events-auto cursor-pointer">
              <Image src={reel.seller.avatar} alt={reel.seller.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm flex items-center gap-1 pointer-events-auto cursor-pointer hover:underline">
                {reel.seller.name}
                {reel.seller.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFDA03]" />}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="absolute bottom-6 right-2 z-40 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all text-white"
              aria-label="Like reel"
            >
              <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <span className="text-white text-xs font-bold font-mono">{reel.likes + (isLiked ? 1 : 0)}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onOpenComments(reel); }}
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all text-white"
              aria-label="View comments"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <span className="text-white text-xs font-bold font-mono">{reel.comments.length}</span>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all text-white"
            aria-label="Save reel"
          >
            <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'fill-[#FFDA03] text-[#FFDA03]' : ''}`} />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all text-white"
            aria-label="Share reel"
          >
            <Share2 className="w-6 h-6" />
          </button>

          <Link href={`/buy/${reel.listingId}`} onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-[#FFDA03] flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-[#FFDA03]/40 cursor-pointer text-[#0A0A0A]">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};


// --- MAIN TAB COMPONENT ---
export default function NIRA6ReelsTab() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [activeReelId, setActiveReelId] = useState<number>(MOCK_REELS[0].id);
  const [visibleReels, setVisibleReels] = useState(MOCK_REELS.slice(0, 4)); // Load 4 initially
  const [selectedReelForComments, setSelectedReelForComments] = useState<typeof MOCK_REELS[0] | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter logic
  const filteredReels = activeCategory === "All" 
    ? MOCK_REELS 
    : MOCK_REELS.filter(r => r.category === activeCategory);

  useEffect(() => {
    setVisibleReels(filteredReels.slice(0, 4));
    // Reset active reel to the first one of the new filter
    if (filteredReels.length > 0) {
      setActiveReelId(filteredReels[0].id);
      // Scroll to top of container smoothly if ref exists
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeCategory]);

  // Intersection Observer to detect which card is playing
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute('data-reel-id'));
            if (id) setActiveReelId(id);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.7, // 70% visible triggers play
      }
    );

    const cards = document.querySelectorAll('.reel-card-wrapper');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
      observer.disconnect();
    };
  }, [visibleReels]);

  const handleLoadMore = () => {
    const currentLength = visibleReels.length;
    const nextReels = filteredReels.slice(0, currentLength + 4);
    setVisibleReels(nextReels);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] font-sans text-white overflow-hidden flex flex-col">
      {/* Embedded CSS for Antigravity & Starfield */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --c-yellow: #FFDA03;
          --c-black: #0A0A0A;
        }
        
        @keyframes float {
          0%   { transform: translateY(0px) rotate(var(--tilt)); }
          50%  { transform: translateY(-12px) rotate(var(--tilt)); }
          100% { transform: translateY(0px) rotate(var(--tilt)); }
        }

        .reel-card {
          animation: float 4s ease-in-out infinite;
          animation-delay: var(--delay);
          box-shadow: 0 0 20px rgba(255, 218, 3, 0.15);
          will-change: transform;
        }

        /* Hover effect stops floating, snaps forward, glows brighter */
        .reel-card:hover {
          animation-play-state: paused;
          transform: scale(1.04) rotate(0deg) !important;
          box-shadow: 0 0 50px rgba(255, 218, 3, 0.4), 0 0 80px rgba(255, 218, 3, 0.1);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 50;
        }

        .active-reel {
          box-shadow: 0 0 30px rgba(255, 218, 3, 0.25);
        }

        /* CSS-Only Starfield Setup */
        .starfield {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          background: #0A0A0A;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite alternate;
          animation-delay: var(--delay);
          opacity: 0.1;
        }

        @keyframes twinkle {
          0% { opacity: 0.1; transform: scale(0.8); }
          100% { opacity: 0.8; transform: scale(1.2); box-shadow: 0 0 4px white; }
        }

        /* Generate 50 stars using nth-child pseudo-randomness in CSS */
        ${Array.from({length: 50}).map((_, i) => `
          .star:nth-child(${i + 1}) {
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${Math.random() * 2 + 1}px;
            height: ${Math.random() * 2 + 1}px;
            --duration: ${Math.random() * 3 + 2}s;
            --delay: ${Math.random() * 5}s;
            background: ${Math.random() > 0.8 ? '#FFDA03' : 'white'};
          }
        `).join('\n')}

        /* Custom Scrollbar for Container */
        .snap-container::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}} />

      {/* Starfield Background Layer */}
      <div className="starfield">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="star"></div>
        ))}
        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0A0A0A]/80 to-[#0A0A0A]" />
      </div>

      {/* Header & Categories (Sticky Top) */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0A0A0A] to-transparent pt-6 pb-12 px-4 pointer-events-none">
        <div className="max-w-xl mx-auto flex flex-col gap-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-black text-2xl tracking-widest text-[#FFDA03] uppercase drop-shadow-md">NIRA6 Reels</h1>
            <Link href="/" className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
              <X className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mask-linear-fade">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeCategory === cat 
                    ? 'bg-[#FFDA03] text-[#0A0A0A] border-[#FFDA03] shadow-lg shadow-[#FFDA03]/20' 
                    : 'bg-black/50 text-white/70 border-white/10 hover:border-white/30 backdrop-blur-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Snap Scroll Container */}
      <div 
        ref={containerRef}
        className="snap-container relative z-10 w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <div className="pt-24 pb-24">
          <AnimatePresence mode="popLayout">
            {visibleReels.map((reel, idx) => (
              <motion.div
                key={reel.id}
                data-reel-id={reel.id}
                className="reel-card-wrapper w-full max-w-[420px] mx-auto h-[100dvh] flex items-center justify-center snap-center px-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              >
                <ReelCard 
                  reel={reel} 
                  isActive={activeReelId === reel.id}
                  isGlobalMuted={isGlobalMuted}
                  toggleMute={() => setIsGlobalMuted(!isGlobalMuted)}
                  onOpenComments={(r) => setSelectedReelForComments(r)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More Trigger Area */}
          {visibleReels.length < filteredReels.length && (
            <div className="w-full h-[30vh] flex items-center justify-center snap-center">
              <button 
                onClick={handleLoadMore}
                className="px-6 py-3 border border-[#FFDA03]/30 text-[#FFDA03] font-bold text-sm uppercase tracking-wider rounded-full hover:bg-[#FFDA03]/10 transition-colors backdrop-blur-md"
              >
                Load More Reels
              </button>
            </div>
          )}
          
          {filteredReels.length === 0 && (
            <div className="w-full h-[50vh] flex flex-col items-center justify-center text-center opacity-50">
              <Camera className="w-12 h-12 mb-4 text-[#FFDA03]" />
              <h3 className="font-heading font-black text-xl mb-1">No Reels Found</h3>
              <p className="text-sm">We couldn't find any reels in the {activeCategory} category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Drawer / Bottom Sheet */}
      <AnimatePresence>
        {selectedReelForComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedReelForComments(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-[70] bg-neutral-900 rounded-t-3xl h-[70vh] flex flex-col border-t border-neutral-800"
            >
              {/* Drawer Handle */}
              <div className="w-full flex justify-center py-3 cursor-grab" onClick={() => setSelectedReelForComments(null)}>
                <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
              </div>
              
              <div className="px-6 pb-3 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="font-heading font-black text-lg">Comments ({selectedReelForComments.comments.length})</h3>
                <button onClick={() => setSelectedReelForComments(null)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {selectedReelForComments.comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                    <MessageCircle className="w-8 h-8 opacity-50" />
                    <p className="text-sm">No comments yet. Be the first!</p>
                  </div>
                ) : (
                  selectedReelForComments.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Image src={comment.avatar} alt={comment.user} width={36} height={36} className="rounded-full object-cover shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-200">{comment.user}</span>
                          <span className="text-[10px] text-neutral-500">{comment.time}</span>
                        </div>
                        <p className="text-sm text-neutral-300 mt-0.5">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur pb-8 sm:pb-4">
                <div className="flex items-center gap-3 bg-neutral-800 rounded-full px-4 py-2 border border-neutral-700 focus-within:border-[#FFDA03] transition-colors">
                  <Image src="https://picsum.photos/100/100?random=99" alt="You" width={28} height={28} className="rounded-full object-cover" />
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-neutral-500"
                  />
                  <button className="text-[#FFDA03] p-1 disabled:opacity-50" aria-label="Send comment">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
