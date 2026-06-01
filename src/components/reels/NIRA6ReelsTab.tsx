'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2,
  Bookmark, X, Send, Eye, CheckCircle2, MapPin, Tag, Plus, PlusCircle,
  AlertTriangle, Home, Film, ShoppingBag, Briefcase, Key, Compass, User,
  ChevronRight, Calendar, ArrowRight, MessageSquare, ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- MOCK DATABASE OF MARKETPLACE LISTINGS ---
const MOCK_LISTINGS = {
  products: [
    { id: "p1", name: "Sony A7 IV Camera Body", price: "₹1,85,000", rating: 4.9, image: "https://picsum.photos/120/120?random=101" },
    { id: "p2", name: "Sigma 24-70mm f/2.8 Art", price: "₹82,000", rating: 4.8, image: "https://picsum.photos/120/120?random=102" },
    { id: "p3", name: "DJI Mic 2 (2 TX + 1 RX)", price: "₹28,500", rating: 4.7, image: "https://picsum.photos/120/120?random=103" }
  ],
  services: [
    { id: "s1", name: "Cinematic Reel Editing", price: "₹3,500/Reel", rating: 5.0, image: "https://picsum.photos/120/120?random=201" },
    { id: "s2", name: "Wedding Photography Shoot", price: "₹45,000/Day", rating: 4.9, image: "https://picsum.photos/120/120?random=202" },
    { id: "s3", name: "Product Shoot Styling", price: "₹12,000/Session", rating: 4.6, image: "https://picsum.photos/120/120?random=203" }
  ],
  rentals: [
    { id: "r1", name: "Red Raptor 8K Cinema Rig", price: "₹15,000/Day", rating: 5.0, image: "https://picsum.photos/120/120?random=301" },
    { id: "r2", name: "DJI Inspire 3 Drone Kit", price: "₹18,000/Day", rating: 4.9, image: "https://picsum.photos/120/120?random=302" },
    { id: "r3", name: "Aputure 600d Pro Light", price: "₹3,200/Day", rating: 4.8, image: "https://picsum.photos/120/120?random=303" }
  ]
};

// --- INITIAL REELS DATA ---
const INITIAL_REELS = [
  {
    id: 1,
    title: "Cinematic Grade Red Raptor Rig Walkthrough",
    description: "Testing out the custom RED Raptor 8K setup in heavy low light. Available for immediate rental on NIRA6 with full cage accessories and V-mount batteries. Check it out!",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/450/800?random=11",
    category: "Rentals",
    location: "Mumbai, MH",
    distanceKM: 4.2,
    isTrending: true,
    user: {
      name: "CineRentals_India",
      avatar: "https://picsum.photos/100/100?random=1",
      verified: true,
      userType: "Rental Provider"
    },
    views: 12400,
    likes: 854,
    shares: 240,
    commentsCount: 34,
    taggedListing: {
      type: "rental",
      id: "r1",
      name: "Red Raptor 8K Cinema Rig",
      price: "₹15,000/Day",
      image: "https://picsum.photos/120/120?random=301"
    },
    comments: [
      { id: 1, user: "lens_guy", avatar: "https://picsum.photos/100/100?random=40", text: "Are PL lenses included in this daily kit?", time: "2h ago" },
      { id: 2, user: "arjun_travels", avatar: "https://picsum.photos/100/100?random=41", text: "Incredible price for Raptor!", time: "5h ago" }
    ]
  },
  {
    id: 2,
    title: "Studio Lighting Tutorial: Aputure 600d Pro",
    description: "Creating moody portrait setups using the Aputure 600d Pro and a light dome. Highly recommended for studio and indoor commercial shoots. Book my services now!",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/450/800?random=12",
    category: "Services",
    location: "Bangalore, KA",
    distanceKM: 12.5,
    isTrending: false,
    user: {
      name: "Nikhil_Studios",
      avatar: "https://picsum.photos/100/100?random=2",
      verified: true,
      userType: "Service Provider"
    },
    views: 8900,
    likes: 622,
    shares: 110,
    commentsCount: 14,
    taggedListing: {
      type: "service",
      id: "s1",
      name: "Cinematic Reel Editing",
      price: "₹3,500/Reel",
      image: "https://picsum.photos/120/120?random=201"
    },
    comments: [
      { id: 1, user: "creative_nisha", avatar: "https://picsum.photos/100/100?random=42", text: "Love the lighting angle here!", time: "1d ago" }
    ]
  },
  {
    id: 3,
    title: "Sigma 24-70mm f/2.8 Art Lens Unboxing",
    description: "Selling my barely used Sigma 24-70mm lens for Sony E-mount. Mint condition, clean glass, includes original box and hood. DM or purchase directly from the tag below!",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/450/800?random=13",
    category: "Products",
    location: "Chennai, TN",
    distanceKM: 1.8,
    isTrending: true,
    user: {
      name: "Sanjay_GearSeller",
      avatar: "https://picsum.photos/100/100?random=3",
      verified: false,
      userType: "Seller"
    },
    views: 4500,
    likes: 312,
    shares: 45,
    commentsCount: 9,
    taggedListing: {
      type: "product",
      id: "p2",
      name: "Sigma 24-70mm f/2.8 Art",
      price: "₹82,000",
      image: "https://picsum.photos/120/120?random=102"
    },
    comments: []
  },
  {
    id: 4,
    title: "Commercial Modeling Portfolio Showcase",
    description: "Portfolio reel for commercial fashion and lifestyle shoots. Based in Mumbai, available for assignments pan-India. Hire me for your next brand shoot through NIRA6!",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/450/800?random=14",
    category: "Models",
    location: "Mumbai, MH",
    distanceKM: 3.5,
    isTrending: false,
    user: {
      name: "Anjali_Mehta",
      avatar: "https://picsum.photos/100/100?random=4",
      verified: true,
      userType: "Model"
    },
    views: 15400,
    likes: 1205,
    shares: 512,
    commentsCount: 56,
    taggedListing: null,
    comments: [
      { id: 1, user: "pr_agency", avatar: "https://picsum.photos/100/100?random=45", text: "DMing you details for a lifestyle campaign!", time: "4h ago" }
    ]
  },
  {
    id: 5,
    title: "DJI Mavic 3 Cine Low-Altitude Dynamic Flying",
    description: "Capturing fast-tracking vehicle shots using the DJI Mavic 3 Pro Cine. Full DJI package available for rent. High speed, dual remote setup with pilot included.",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail: "https://picsum.photos/450/800?random=15",
    category: "Rentals",
    location: "Delhi, NCR",
    distanceKM: 25.0,
    isTrending: true,
    user: {
      name: "SkyHigh_Cine",
      avatar: "https://picsum.photos/100/100?random=5",
      verified: true,
      userType: "Rental Provider"
    },
    views: 22000,
    likes: 1845,
    shares: 610,
    commentsCount: 92,
    taggedListing: {
      type: "rental",
      id: "r2",
      name: "DJI Inspire 3 Drone Kit",
      price: "₹18,000/Day",
      image: "https://picsum.photos/120/120?random=302"
    },
    comments: []
  }
];

const FILTER_TABS = [
  "For You",
  "Nearby",
  "Products",
  "Services",
  "Rentals",
  "Creators",
  "Models",
  "Trending",
  "Following"
];

// --- RECOMMENDATION SYSTEM SCORER ---
const scoreVideoForUser = (video: typeof INITIAL_REELS[0], prefs: {
  interests: string[];
  likedIds: number[];
  savedIds: number[];
  followedCreators: string[];
}) => {
  let score = 0;

  // Prioritize categories/interests matched with user preferences
  if (prefs.interests.includes(video.category)) {
    score += 50;
  }

  // Prioritize followed accounts
  if (prefs.followedCreators.includes(video.user.name)) {
    score += 80;
  }

  // Boost trending content
  if (video.isTrending) {
    score += 30;
  }

  // Proximity boost (closer location has higher priority)
  if (video.distanceKM && video.distanceKM <= 5.0) {
    score += 40;
  } else if (video.distanceKM && video.distanceKM <= 15.0) {
    score += 20;
  }

  // Engagement index boost
  score += (video.likes / video.views) * 100;

  return score;
};

// --- DYNAMIC TYPE BADGE COLOR CONFIG ---
const USER_TYPE_BADGES: Record<string, string> = {
  "Buyer": "bg-emerald-500/25 border-emerald-400 text-emerald-300",
  "Seller": "bg-amber-500/25 border-amber-400 text-amber-300",
  "Service Provider": "bg-sky-500/25 border-sky-400 text-sky-300",
  "Rental Provider": "bg-indigo-500/25 border-indigo-400 text-indigo-300",
  "Creator": "bg-purple-500/25 border-purple-400 text-purple-300",
  "Model": "bg-pink-500/25 border-pink-400 text-pink-300",
  "Freelancer": "bg-rose-500/25 border-rose-400 text-rose-300",
  "Business": "bg-cyan-500/25 border-cyan-400 text-cyan-300"
};

export default function NIRA6ReelsTab() {
  const router = useRouter();

  // Reels feed & user state
  const [reels, setReels] = useState(INITIAL_REELS);
  const [activeTab, setActiveTab] = useState("For You");
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);

  // User preference parameters (real-time recommendation feedback)
  const [userPrefs, setUserPrefs] = useState({
    interests: ["Rentals", "Products"],
    likedIds: [] as number[],
    savedIds: [] as number[],
    followedCreators: ["CineRentals_India"]
  });

  // Modal / Drawer visibility states
  const [commentsReel, setCommentsReel] = useState<typeof INITIAL_REELS[0] | null>(null);
  const [activeListingTag, setActiveListingTag] = useState<typeof INITIAL_REELS[0]["taggedListing"] | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Products',
    location: '',
    userType: 'Creator',
    taggedType: 'none',
    taggedId: '',
    hashtags: '',
    videoFile: null as File | null,
    videoPreview: ''
  });

  // DOM Refs
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({});

  // Trigger feedback messages
  const triggerSuccessMsg = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 3000);
  };

  // --- RECOMMENDATION RE-SCORING LOGIC ---
  const getSortedReels = useCallback(() => {
    const cloned = [...reels];

    if (activeTab === "For You") {
      return cloned.sort((a, b) => scoreVideoForUser(b, userPrefs) - scoreVideoForUser(a, userPrefs));
    } else if (activeTab === "Nearby") {
      // Sort by proximity (closest first)
      return cloned.sort((a, b) => (a.distanceKM || 999) - (b.distanceKM || 999));
    } else if (activeTab === "Trending") {
      // Sort by views
      return cloned.sort((a, b) => b.views - a.views);
    } else if (activeTab === "Following") {
      // Only followed accounts
      return cloned.filter(v => userPrefs.followedCreators.includes(v.user.name));
    } else if (activeTab === "Products") {
      return cloned.filter(v => v.user.userType === "Seller" || v.user.userType === "Business");
    } else if (activeTab === "Services") {
      return cloned.filter(v => v.user.userType === "Service Provider" || v.user.userType === "Freelancer");
    } else if (activeTab === "Rentals") {
      return cloned.filter(v => v.user.userType === "Rental Provider");
    } else if (activeTab === "Models") {
      return cloned.filter(v => v.user.userType === "Model");
    } else if (activeTab === "Creators") {
      return cloned.filter(v => v.user.userType === "Creator");
    }
    return cloned;
  }, [reels, activeTab, userPrefs]);

  const activeFeed = getSortedReels();

  // --- PLAY/PAUSE INTERSECTION OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const indexAttr = entry.target.getAttribute('data-index');
          if (!indexAttr) return;
          const idx = parseInt(indexAttr, 10);
          const videoElement = videoRefs.current[idx];
          
          if (!videoElement) return;

          if (entry.isIntersecting) {
            setActiveReelIndex(idx);
            videoElement.play().catch((err) => {
              console.log("Autoplay blocked:", err);
            });
          } else {
            videoElement.pause();
            videoElement.currentTime = 0;
          }
        });
      },
      {
        root: feedContainerRef.current,
        threshold: 0.6, // Plays when 60% of the video is visible
      }
    );

    const cards = document.querySelectorAll('.reel-video-card');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
      observer.disconnect();
    };
  }, [activeFeed]);

  // --- LIKE HANDLER ---
  const handleLike = (reelId: number) => {
    const alreadyLiked = userPrefs.likedIds.includes(reelId);
    let newLikes = [...userPrefs.likedIds];
    
    if (alreadyLiked) {
      newLikes = newLikes.filter(id => id !== reelId);
    } else {
      newLikes.push(reelId);
      // Give feedback to recommendation interests
      const likedVideo = reels.find(r => r.id === reelId);
      if (likedVideo && !userPrefs.interests.includes(likedVideo.category)) {
        setUserPrefs(prev => ({
          ...prev,
          interests: [...prev.interests, likedVideo.category]
        }));
      }
    }

    setUserPrefs(prev => ({ ...prev, likedIds: newLikes }));
    triggerSuccessMsg(alreadyLiked ? "Removed Like" : "Reel Liked! Recommendation system updated.");
  };

  // --- SAVE HANDLER ---
  const handleSave = (reelId: number) => {
    const alreadySaved = userPrefs.savedIds.includes(reelId);
    let newSaves = [...userPrefs.savedIds];

    if (alreadySaved) {
      newSaves = newSaves.filter(id => id !== reelId);
    } else {
      newSaves.push(reelId);
      const savedVideo = reels.find(r => r.id === reelId);
      if (savedVideo && !userPrefs.interests.includes(savedVideo.category)) {
        setUserPrefs(prev => ({
          ...prev,
          interests: [...prev.interests, savedVideo.category]
        }));
      }
    }

    setUserPrefs(prev => ({ ...prev, savedIds: newSaves }));
    triggerSuccessMsg(alreadySaved ? "Removed from Saves" : "Reel Saved! Recommendation system updated.");
  };

  // --- FOLLOW HANDLER ---
  const handleFollow = (creatorName: string) => {
    const alreadyFollowing = userPrefs.followedCreators.includes(creatorName);
    let newFollows = [...userPrefs.followedCreators];

    if (alreadyFollowing) {
      newFollows = newFollows.filter(name => name !== creatorName);
    } else {
      newFollows.push(creatorName);
    }

    setUserPrefs(prev => ({ ...prev, followedCreators: newFollows }));
    triggerSuccessMsg(alreadyFollowing ? `Unfollowed @${creatorName}` : `Following @${creatorName}! Content prioritized.`);
  };

  // --- UPLOAD HANDLER ---
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        videoFile: file,
        videoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.description) {
      alert("Please fill in the title and description");
      return;
    }

    // Resolve tagged listing
    let taggedListing = null;
    if (uploadForm.taggedType !== 'none' && uploadForm.taggedId) {
      const list = MOCK_LISTINGS[uploadForm.taggedType as keyof typeof MOCK_LISTINGS];
      const match = list.find(l => l.id === uploadForm.taggedId);
      if (match) {
        taggedListing = {
          type: uploadForm.taggedType,
          id: match.id,
          name: match.name,
          price: match.price,
          image: match.image
        };
      }
    }

    // Create new Reel Item
    const newReel = {
      id: Date.now(),
      title: uploadForm.title,
      description: uploadForm.description + " " + uploadForm.hashtags,
      videoUrl: uploadForm.videoPreview || "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail: "https://picsum.photos/450/800?random=" + Math.floor(Math.random() * 100),
      category: uploadForm.category,
      location: uploadForm.location || "Online",
      distanceKM: 1.0,
      isTrending: false,
      user: {
        name: "Creator_You",
        avatar: "https://picsum.photos/100/100?random=99",
        verified: true,
        userType: uploadForm.userType
      },
      views: 0,
      likes: 0,
      shares: 0,
      commentsCount: 0,
      taggedListing,
      comments: []
    };

    setReels(prev => [newReel, ...prev]);
    setIsUploadOpen(false);
    triggerSuccessMsg("Video uploaded successfully! Playing now.");

    // Reset upload form
    setUploadForm({
      title: '',
      description: '',
      category: 'Products',
      location: '',
      userType: 'Creator',
      taggedType: 'none',
      taggedId: '',
      hashtags: '',
      videoFile: null,
      videoPreview: ''
    });

    // Scroll to top of snap feed
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070708] flex items-center justify-center font-sans overflow-hidden">
      
      {/* Desktop Sugggestion / Detail Sidebar */}
      <div className="hidden lg:flex flex-col w-[320px] h-full bg-[#0A0A0C] border-r border-[#1D1D24] p-6 z-20 text-white select-none shrink-0 gap-6">
        <div>
          <h1 className="font-heading font-black text-2xl tracking-widest text-[#FFDA03]">NIRA6 SHORTS</h1>
          <p className="text-xs text-neutral-400 mt-1">Premium Creator Social Recommerce</p>
        </div>

        {/* Dynamic score summary */}
        <div className="bg-[#121218] border border-[#1E1E28] rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-wider text-[#FFDA03] font-bold">Smart Recommendation</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Prioritizing content dynamically based on your interactions. Likes & saves boost content relevance in real-time.
          </p>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Liked Topics:</span>
              <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">
                {userPrefs.interests.length > 0 ? userPrefs.interests.join(', ') : 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">Following Creators:</span>
              <span className="text-[#FFDA03] font-mono text-[10px] bg-[#FFDA03]/10 px-2 py-0.5 rounded">
                {userPrefs.followedCreators.length} accounts
              </span>
            </div>
          </div>
        </div>

        {/* Quick Guidelines */}
        <div className="flex-1 flex flex-col justify-end text-xs text-neutral-500 gap-2">
          <div className="flex items-center gap-2 text-[#FFDA03]">
            <CheckCircle2 size={14} />
            <span>Verified Creator Network</span>
          </div>
          <p className="leading-normal">
            Browse creative gear, book skilled photo editors, rent high-end cine systems, or hire models directly from their vertical video clips.
          </p>
        </div>
      </div>

      {/* Main Snap Feed Frame (Glassmorphic Mock Phone Container on Desktop, Fullscreen on Mobile) */}
      <div className="relative w-full max-w-[450px] h-full sm:h-[94vh] sm:rounded-[40px] sm:border-[8px] sm:border-[#1E1E26] bg-black overflow-hidden flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        
        {/* Top Header Controls (Tabs) */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/30 to-transparent pt-4 pb-12 px-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto mb-3">
            <Link href="/" className="text-white hover:text-[#FFDA03] transition-colors p-2 bg-black/40 backdrop-blur-md rounded-full">
              <X size={18} />
            </Link>
            
            {/* Live Status indicator */}
            <div className="bg-[#FFDA03] text-black font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full animate-pulse">
              Live Feed
            </div>

            {/* Create / Upload button */}
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="text-[#FFDA03] hover:scale-105 transition-transform flex items-center gap-1.5 bg-[#FFDA03]/10 border border-[#FFDA03]/30 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Create</span>
            </button>
          </div>

          {/* Filtering Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 pointer-events-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (feedContainerRef.current) {
                    feedContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                  activeTab === tab 
                    ? 'bg-[#FFDA03] text-black border-[#FFDA03] shadow-md' 
                    : 'bg-black/50 text-white/60 border-white/10 hover:border-white/30 backdrop-blur-md'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Global Mute Floating Button */}
        <button 
          onClick={() => setIsGlobalMuted(!isGlobalMuted)}
          className="absolute top-28 left-4 z-30 p-2.5 rounded-full bg-black/40 border border-white/10 text-white hover:text-[#FFDA03] backdrop-blur-md transition-all cursor-pointer shadow-lg"
          aria-label={isGlobalMuted ? "Unmute feed" : "Mute feed"}
        >
          {isGlobalMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Main Snap Vertical Scroll container */}
        <div 
          ref={feedContainerRef}
          className="flex-1 w-full overflow-y-auto snap-y snap-mandatory scrollbar-none"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {activeFeed.map((reel, index) => {
            const isLiked = userPrefs.likedIds.includes(reel.id);
            const isSaved = userPrefs.savedIds.includes(reel.id);
            const isFollowing = userPrefs.followedCreators.includes(reel.user.name);

            return (
              <div
                key={reel.id}
                data-index={index}
                className="reel-video-card relative w-full h-full snap-start snap-always overflow-hidden flex flex-col justify-end"
                style={{ height: '100%' }}
              >
                {/* Background Video element */}
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el;
                  }}
                  src={reel.videoUrl}
                  loop
                  playsInline
                  muted={isGlobalMuted}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Dark Overlay vignette at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 z-10 pointer-events-none" />

                {/* Right Action Menu panel */}
                <div className="absolute bottom-24 right-3 z-20 flex flex-col items-center gap-4.5 select-none">
                  
                  {/* Creator Follow/Avatar bubble */}
                  <div className="flex flex-col items-center mb-1">
                    <div className="relative w-12 h-12 rounded-full border-2 border-[#FFDA03] overflow-hidden bg-neutral-900 shadow-md">
                      <Image src={reel.user.avatar} alt={reel.user.name} fill className="object-cover" />
                    </div>
                    <button
                      onClick={() => handleFollow(reel.user.name)}
                      className={`-mt-3 w-5 h-5 rounded-full flex items-center justify-center transition-colors border shadow cursor-pointer ${
                        isFollowing 
                          ? 'bg-neutral-800 border-neutral-700 text-neutral-400' 
                          : 'bg-[#FFDA03] border-[#FFDA03] text-black hover:scale-105'
                      }`}
                    >
                      {isFollowing ? <CheckCircle2 size={10} /> : <Plus size={10} strokeWidth={3} />}
                    </button>
                  </div>

                  {/* Like Button */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <button
                      onClick={() => handleLike(reel.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border hover:scale-105 transition-all cursor-pointer ${
                        isLiked 
                          ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                          : 'bg-black/40 border-white/10 text-white'
                      }`}
                      aria-label="Like Video"
                    >
                      <Heart className={`w-5.5 h-5.5 ${isLiked ? 'fill-red-500' : ''}`} />
                    </button>
                    <span className="text-[10px] text-white/90 font-bold font-mono">{reel.likes + (isLiked ? 1 : 0)}</span>
                  </div>

                  {/* Comment Button */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <button
                      onClick={() => setCommentsReel(reel)}
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-white hover:scale-105 transition-all cursor-pointer"
                      aria-label="Open Comments"
                    >
                      <MessageCircle className="w-5.5 h-5.5" />
                    </button>
                    <span className="text-[10px] text-white/90 font-bold font-mono">{reel.comments.length}</span>
                  </div>

                  {/* Save Button */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <button
                      onClick={() => handleSave(reel.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border hover:scale-105 transition-all cursor-pointer ${
                        isSaved 
                          ? 'bg-[#FFDA03]/20 border-[#FFDA03] text-[#FFDA03] shadow-[0_0_15px_rgba(255,218,3,0.4)]' 
                          : 'bg-black/40 border-white/10 text-white'
                      }`}
                      aria-label="Save Video"
                    >
                      <Bookmark className={`w-5.5 h-5.5 ${isSaved ? 'fill-[#FFDA03]' : ''}`} />
                    </button>
                    <span className="text-[10px] text-white/90 font-bold font-mono">{isSaved ? 'Saved' : 'Save'}</span>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/creators/reels?id=${reel.id}`);
                      triggerSuccessMsg("Reel link copied to clipboard!");
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-white hover:scale-105 transition-all cursor-pointer"
                    aria-label="Share Video"
                  >
                    <Share2 className="w-5.5 h-5.5" />
                  </button>

                  {/* Report Button */}
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-white/60 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                    aria-label="Report Video"
                  >
                    <ShieldAlert className="w-5.5 h-5.5" />
                  </button>
                </div>

                {/* Left Metadata & Video description panel */}
                <div className="absolute bottom-22 left-4 right-18 z-20 flex flex-col gap-3 pointer-events-none text-white select-none">
                  
                  {/* Creator Profile block */}
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <span className="font-bold text-sm tracking-wide">@{reel.user.name}</span>
                    {reel.user.verified && <CheckCircle2 size={13} className="text-[#FFDA03]" />}
                    
                    {/* User Type Badge */}
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${USER_TYPE_BADGES[reel.user.userType] || 'border-neutral-500 bg-neutral-800'}`}>
                      {reel.user.userType}
                    </span>
                  </div>

                  {/* Title & Description with Read More */}
                  <div className="flex flex-col gap-1.5 pointer-events-auto">
                    <h2 className="text-[#FFDA03] font-bold text-sm leading-snug line-clamp-1">{reel.title}</h2>
                    <DescriptionBox text={reel.description} />
                  </div>

                  {/* Location & Tags */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-neutral-400">
                    <div className="flex items-center gap-1 font-medium">
                      <MapPin size={11} className="text-red-400" />
                      <span>{reel.location}</span>
                    </div>
                    <div className="bg-white/10 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider text-neutral-300">
                      {reel.category}
                    </div>
                  </div>

                  {/* Tagged Listing Card / Connected Marketplace Tag */}
                  {reel.taggedListing && (
                    <div 
                      onClick={() => setActiveListingTag(reel.taggedListing)}
                      className="mt-1 bg-black/60 border border-white/15 rounded-xl p-2 flex items-center gap-2.5 backdrop-blur-md pointer-events-auto cursor-pointer hover:border-[#FFDA03] transition-colors w-fit max-w-full"
                    >
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <Image src={reel.taggedListing.image} alt={reel.taggedListing.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col shrink min-w-0 pr-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Tag size={9} className="text-[#FFDA03]" />
                          {reel.taggedListing.type}
                        </span>
                        <h4 className="text-white text-xs font-bold leading-none line-clamp-1 mt-0.5">{reel.taggedListing.name}</h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[#FFDA03] text-xs font-black font-mono">{reel.taggedListing.price}</span>
                      </div>
                    </div>
                  )}

                  {/* Dynamic CTA Button (Role-based actions) */}
                  <div className="pointer-events-auto mt-1 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (reel.taggedListing) {
                          setActiveListingTag(reel.taggedListing);
                        } else {
                          triggerSuccessMsg(`Navigating to @${reel.user.name}'s profile...`);
                        }
                      }}
                      className="flex items-center justify-between w-full bg-[#FFDA03] hover:bg-[#ffe136] text-black font-black text-xs uppercase tracking-widest py-3 px-4.5 rounded-xl shadow-lg transition-colors cursor-pointer"
                    >
                      <span>
                        {reel.user.userType === "Seller" && "View Product"}
                        {reel.user.userType === "Service Provider" && "Book Service"}
                        {reel.user.userType === "Rental Provider" && "Rent Now"}
                        {reel.user.userType === "Model" && "Hire Model"}
                        {reel.user.userType === "Business" && "Contact Business"}
                        {reel.user.userType === "Creator" && "View Profile"}
                        {reel.user.userType === "Freelancer" && "Hire Freelancer"}
                        {reel.user.userType === "Buyer" && "Send Message"}
                      </span>
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}

          {activeFeed.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-[#0C0C0E] text-neutral-400">
              <Compass className="w-12 h-12 text-[#FFDA03] mb-3 animate-spin" style={{ animationDuration: '4s' }} />
              <h3 className="font-heading font-black text-lg text-white">No Videos Available</h3>
              <p className="text-xs mt-1 max-w-xs leading-normal">
                There are no vertical video clips matching the active filter "{activeTab}". Select another tab to discover amazing creators.
              </p>
            </div>
          )}
        </div>

        {/* Action feedback banner notification */}
        <AnimatePresence>
          {actionSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-26 left-4 right-4 z-40 bg-[#121218] border border-emerald-500/30 text-emerald-400 rounded-xl p-3 flex items-center gap-2.5 shadow-2xl backdrop-blur-md"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span className="text-xs font-medium leading-none">{actionSuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation Bar */}
        <div className="bg-[#09090B]/95 border-t border-white/10 py-3.5 px-4 z-35 flex items-center justify-around select-none">
          <Link href="/" className="flex flex-col items-center text-neutral-500 hover:text-white transition-colors gap-1">
            <Home size={18} />
            <span className="text-[8px] uppercase tracking-wider font-bold">Home</span>
          </Link>
          <Link href="/creators/reels" className="flex flex-col items-center text-[#FFDA03] transition-colors gap-1">
            <Film size={18} />
            <span className="text-[8px] uppercase tracking-wider font-bold">Shorts</span>
          </Link>
          <Link href="/buy" className="flex flex-col items-center text-neutral-500 hover:text-white transition-colors gap-1">
            <ShoppingBag size={18} />
            <span className="text-[8px] uppercase tracking-wider font-bold">Market</span>
          </Link>
          <Link href="/services" className="flex flex-col items-center text-neutral-500 hover:text-white transition-colors gap-1">
            <Briefcase size={18} />
            <span className="text-[8px] uppercase tracking-wider font-bold">Services</span>
          </Link>
          <Link href="/rent" className="flex flex-col items-center text-neutral-500 hover:text-white transition-colors gap-1">
            <Key size={18} />
            <span className="text-[8px] uppercase tracking-wider font-bold">Rentals</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center text-neutral-500 hover:text-white transition-colors gap-1">
            <User size={18} />
            <span className="text-[8px] uppercase tracking-wider font-bold">Profile</span>
          </Link>
        </div>

      </div>

      {/* --- COMMENTS BOTTOM SHEET DRAWER --- */}
      <AnimatePresence>
        {commentsReel && (
          <>
            {/* Backdrop cover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentsReel(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sheet wrapper */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-[450px] bg-[#0E0E12] border-t border-[#1E1E26] rounded-t-3xl h-[65vh] flex flex-col z-50 text-white"
            >
              {/* Drag Handle */}
              <div 
                className="w-full flex justify-center py-3.5 cursor-pointer"
                onClick={() => setCommentsReel(null)}
              >
                <div className="w-12 h-1.5 bg-neutral-700 rounded-full hover:bg-neutral-500 transition-colors" />
              </div>

              {/* Title Header */}
              <div className="px-6 pb-3 border-b border-[#1E1E26] flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#FFDA03]">Comments ({commentsReel.comments.length})</h3>
                <button 
                  onClick={() => setCommentsReel(null)}
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Comments Scroll area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {commentsReel.comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                    <MessageCircle size={32} className="opacity-30" />
                    <p className="text-xs">No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  commentsReel.comments.map((cmt) => (
                    <div key={cmt.id} className="flex gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <Image src={cmt.avatar} alt={cmt.user} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">@{cmt.user}</span>
                          <span className="text-[9px] text-neutral-500">{cmt.time}</span>
                        </div>
                        <p className="text-xs text-neutral-300 mt-1 leading-normal">{cmt.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment write-input block */}
              <CommentInput reelId={commentsReel.id} onCommentAdded={(newCmt) => {
                const updated = reels.map(r => {
                  if (r.id === commentsReel.id) {
                    return { ...r, comments: [...r.comments, newCmt] };
                  }
                  return r;
                });
                setReels(updated);
                // Update currently open comment reel state to match
                setCommentsReel(prev => prev ? { ...prev, comments: [...prev.comments, newCmt] } : null);
              }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MARKETPLACE INTERACTION DRAWER --- */}
      <AnimatePresence>
        {activeListingTag && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveListingTag(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:w-[450px] bg-[#0E0E12] border-t border-[#1E1E26] rounded-t-3xl p-6 flex flex-col gap-5 z-50 text-white"
            >
              <div className="flex items-center justify-between border-b border-[#1E1E26] pb-3">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-[#FFDA03]" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Marketplace Item</h3>
                </div>
                <button 
                  onClick={() => setActiveListingTag(null)}
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-neutral-900">
                  <Image src={activeListingTag.image} alt={activeListingTag.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center gap-1 flex-1">
                  <span className="text-[9px] font-black uppercase bg-[#FFDA03]/10 text-[#FFDA03] border border-[#FFDA03]/30 px-2 py-0.5 rounded-full w-fit">
                    {activeListingTag.type}
                  </span>
                  <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{activeListingTag.name}</h4>
                  <span className="text-[#FFDA03] font-black text-sm font-mono mt-0.5">{activeListingTag.price}</span>
                </div>
              </div>

              {/* Action buttons inside listing overlay */}
              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  onClick={() => {
                    setActiveListingTag(null);
                    triggerSuccessMsg(`Transaction completed successfully! Order placed for: ${activeListingTag.name}`);
                  }}
                  className="w-full bg-[#FFDA03] hover:bg-[#ffe136] text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  {activeListingTag.type === 'product' && "Buy Now"}
                  {activeListingTag.type === 'rental' && "Rent Now"}
                  {activeListingTag.type === 'service' && "Book Service"}
                </button>
                <button
                  onClick={() => {
                    setActiveListingTag(null);
                    triggerSuccessMsg(`Message sent to seller about: ${activeListingTag.name}`);
                  }}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl border border-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} />
                  <span>Contact Owner</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- REPORT DIALOG OVERLAY --- */}
      <AnimatePresence>
        {isReportOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute w-[90%] max-w-[360px] bg-[#121218] border border-[#262633] rounded-2xl p-5 flex flex-col gap-4.5 z-50 text-white"
            >
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle size={18} />
                <h3 className="font-heading font-black text-sm uppercase tracking-wider">Report Video</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-normal">
                If you believe this video violates NIRA6 community guidelines, copyright terms, or contains spam, flag it below.
              </p>
              
              <div className="flex flex-col gap-1.5 mt-1">
                {["Inappropriate Content", "Spam or Scams", "Intellectual Property Violation", "Harassment / Abuse"].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setIsReportOpen(false);
                      triggerSuccessMsg(`Report submitted. Thank you for making NIRA6 safe!`);
                    }}
                    className="w-full text-left bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-2.5 rounded-lg text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-1">
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="px-4 py-2 border border-neutral-700 text-neutral-400 text-xs font-bold uppercase rounded-lg hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- VIDEO UPLOADING MODAL OVERLAY --- */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[420px] max-h-[85vh] bg-[#0E0E12] border border-[#1E1E26] rounded-3xl p-6 flex flex-col z-50 text-white overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#1E1E26] pb-3 mb-4">
                <div className="flex items-center gap-2 text-[#FFDA03]">
                  <PlusCircle size={18} />
                  <h3 className="text-sm font-black uppercase tracking-widest">Upload Short Video</h3>
                </div>
                <button 
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                {/* Custom Video input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Select Video (Max 60s)</label>
                  <div className="border border-dashed border-[#1E1E26] bg-[#0A0A0C] hover:border-[#FFDA03]/40 rounded-xl p-4 text-center cursor-pointer relative flex flex-col items-center justify-center min-h-[90px] transition-colors">
                    <input 
                      type="file" 
                      accept="video/mp4,video/x-m4v,video/*"
                      onChange={handleVideoSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    {uploadForm.videoFile ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                        <span className="text-xs font-bold text-neutral-200 line-clamp-1">{uploadForm.videoFile.name}</span>
                        <span className="text-[10px] text-neutral-500">{(uploadForm.videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-neutral-500">
                        <Film size={22} />
                        <span className="text-xs mt-1 font-bold text-neutral-300">Click to upload .mp4 video</span>
                        <span className="text-[9px]">Vertical 9:16 layout suggested</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form fields */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Video Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony A7IV Cinematic Test"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-[#FFDA03] outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    placeholder="e.g. Demonstrating low-light capability. Follow for more gear unboxings!"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-[#FFDA03] outline-none transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFDA03] outline-none"
                    >
                      <option value="Products">Products</option>
                      <option value="Services">Services</option>
                      <option value="Rentals">Rentals</option>
                      <option value="Creators">Creators</option>
                      <option value="Models">Models</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">User Type Role</label>
                    <select
                      value={uploadForm.userType}
                      onChange={(e) => setUploadForm(p => ({ ...p, userType: e.target.value }))}
                      className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFDA03] outline-none"
                    >
                      <option value="Creator">Creator</option>
                      <option value="Seller">Seller</option>
                      <option value="Service Provider">Service Provider</option>
                      <option value="Rental Provider">Rental Provider</option>
                      <option value="Model">Model</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, MH"
                      value={uploadForm.location}
                      onChange={(e) => setUploadForm(p => ({ ...p, location: e.target.value }))}
                      className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-[#FFDA03] outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Hashtags</label>
                    <input
                      type="text"
                      placeholder="e.g. #sony #gear"
                      value={uploadForm.hashtags}
                      onChange={(e) => setUploadForm(p => ({ ...p, hashtags: e.target.value }))}
                      className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-[#FFDA03] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Tagged Listing selectors */}
                <div className="border-t border-[#1E1E26] pt-3 flex flex-col gap-3">
                  <span className="text-[10px] text-[#FFDA03] font-bold uppercase tracking-wider">Connect Marketplace Listing (Optional)</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Listing Type</label>
                      <select
                        value={uploadForm.taggedType}
                        onChange={(e) => setUploadForm(p => ({ ...p, taggedType: e.target.value, taggedId: '' }))}
                        className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFDA03] outline-none"
                      >
                        <option value="none">None</option>
                        <option value="products">Products (Buy)</option>
                        <option value="services">Services (Book)</option>
                        <option value="rentals">Rentals (Rent)</option>
                      </select>
                    </div>

                    {uploadForm.taggedType !== 'none' && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Select Item</label>
                        <select
                          value={uploadForm.taggedId}
                          onChange={(e) => setUploadForm(p => ({ ...p, taggedId: e.target.value }))}
                          className="w-full bg-[#0A0A0C] border border-[#1E1E26] rounded-xl px-3 py-2 text-xs text-white focus:border-[#FFDA03] outline-none"
                          required
                        >
                          <option value="">-- Choose --</option>
                          {MOCK_LISTINGS[uploadForm.taggedType as keyof typeof MOCK_LISTINGS].map((item) => (
                            <option key={item.id} value={item.id}>{item.name} ({item.price})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-[#1E1E26] pt-3.5 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 border border-neutral-800 text-neutral-400 text-xs font-bold uppercase rounded-xl hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#FFDA03] hover:bg-[#ffe136] text-black font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
                  >
                    Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUBCOMPONENT: COLLAPSIBLE DESCRIPTION ---
function DescriptionBox({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const words = text.split(" ");
  const needsCollapse = words.length > 10;
  
  const displaySnippet = needsCollapse && !isExpanded 
    ? words.slice(0, 10).join(" ") + "..." 
    : text;

  return (
    <p className="text-xs text-neutral-300 leading-relaxed max-w-[90%]">
      {displaySnippet}
      {needsCollapse && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#FFDA03] font-bold ml-1.5 hover:underline cursor-pointer select-none"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </p>
  );
}

// --- SUBCOMPONENT: COMMENT DRAWER INPUT BLOCK ---
function CommentInput({ 
  reelId, 
  onCommentAdded 
}: { 
  reelId: number, 
  onCommentAdded: (cmt: { id: number, user: string, avatar: string, text: string, time: string }) => void 
}) {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onCommentAdded({
      id: Date.now(),
      user: "You",
      avatar: "https://picsum.photos/100/100?random=99",
      text: commentText,
      time: "Just now"
    });
    setCommentText("");
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 border-t border-[#1E1E26] bg-[#0A0A0C]/90 backdrop-blur pb-6"
    >
      <div className="flex items-center gap-3 bg-neutral-900 rounded-xl px-4 py-2.5 border border-[#1E1E26] focus-within:border-[#FFDA03] transition-colors">
        <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
          <Image src="https://picsum.photos/100/100?random=99" alt="You" fill className="object-cover" />
        </div>
        <input 
          type="text" 
          placeholder="Add a comment..." 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-neutral-600"
        />
        <button 
          type="submit" 
          disabled={!commentText.trim()}
          className="text-[#FFDA03] p-1 disabled:opacity-30 disabled:hover:scale-100 hover:scale-110 transition-transform cursor-pointer"
          aria-label="Submit comment"
        >
          <Send size={14} />
        </button>
      </div>
    </form>
  );
}
