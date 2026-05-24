'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Plus, ArrowLeft, Send, X, Loader2, Volume2, VolumeX } from 'lucide-react';
import { useAppSelector } from '@/store';
import api from '@/services/api';
import type { User } from '@/types';

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

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onLike: () => void;
  onCommentClick: () => void;
  currentUser: User | null;
}

function ReelItem({ reel, isActive, muted, onToggleMute, onLike, onCommentClick, currentUser }: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  // Auto play/pause when in/out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      playPromiseRef.current = video.play();
      playPromiseRef.current.catch(err => {
        console.log("Autoplay interrupted or prevented:", err);
      });
    } else {
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => {
          video.pause();
        }).catch(() => {
          video.pause();
        });
      } else {
        video.pause();
      }
    }
  }, [isActive]);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      // Double tap detected: Like
      onLike();
      setShowHeartAnimation(true);
    } else {
      // Single tap detected: Mute toggle
      onToggleMute();
      setShowVolumeIndicator(true);
    }
    setLastTap(now);
  };

  useEffect(() => {
    if (showVolumeIndicator) {
      const timer = setTimeout(() => setShowVolumeIndicator(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showVolumeIndicator]);

  useEffect(() => {
    if (showHeartAnimation) {
      const timer = setTimeout(() => setShowHeartAnimation(false), 800);
      return () => clearTimeout(timer);
    }
  }, [showHeartAnimation]);

  return (
    <div className="w-full h-full snap-start snap-always shrink-0 relative flex items-center justify-center bg-neutral-950">
      {/* Video Element */}
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
      />

      {/* Mute/Unmute indicator overlay */}
      <AnimatePresence>
        {showVolumeIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="p-4 bg-black/60 rounded-full text-white backdrop-blur-sm">
              {muted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heart pop-up animation for double tap */}
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full scale-150" />
              <Heart className="w-20 h-20 text-red-500 fill-red-500 relative z-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Details Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-24 flex flex-col justify-end text-left z-20">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 relative">
            <Image src={reel.creatorId.avatar} alt={reel.creatorId.name} fill className="object-cover" unoptimized />
          </div>
          <div>
            <h4 className="font-bold text-xs">{reel.creatorId.name}</h4>
            <p className="text-[9px] text-nira-yellow font-bold uppercase tracking-wider">Creator Partner</p>
          </div>
        </div>
        <p className="text-xs text-white/90 leading-relaxed max-w-[85%]">{reel.caption}</p>
      </div>

      {/* Right Action Panel */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4 z-30">
        {/* Like */}
        <button
          onClick={onLike}
          className={`p-3 rounded-full backdrop-blur-md border cursor-pointer transition-all ${
            currentUser && reel.likes.includes(currentUser.id) 
              ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' 
              : 'bg-black/40 text-white border-white/10 hover:bg-black/60'
          }`}
        >
          <Heart className="w-5 h-5" />
        </button>
        <span className="text-[10px] font-bold -mt-3">{reel.likes.length}</span>

        {/* Comment */}
        <button
          onClick={onCommentClick}
          className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        <span className="text-[10px] font-bold -mt-3">{reel.comments.length}</span>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Reel link copied to clipboard!');
          }}
          className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-all cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <span className="text-[10px] font-bold -mt-3">Share</span>
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Modals & sheets
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  
  // Comment Form
  const [commentInput, setCommentInput] = useState('');
  
  // Post Form
  const [postCaption, setPostCaption] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [posting, setPosting] = useState(false);

  // Mute state
  const [muted, setMuted] = useState(true);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch feed reels
  const fetchReels = useCallback(async () => {
    try {
      const { data } = await api.get('/reels');
      // If db is empty, set some beautiful stock placeholders
      if (data.length === 0) {
        const fallbackReels: Reel[] = [
          {
            _id: 'default-1',
            creatorId: {
              _id: 'c1',
              name: 'Arun Kumar',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
            },
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-in-urban-setting-39824-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
            caption: 'Late night cyberpunk cinematic photoshoot. Editing workflow in Lightroom. #cyberpunk #cinematic #neon',
            likes: [],
            comments: [],
            views: 1204,
            shares: 45,
            tags: ['cyberpunk', 'cinematic', 'neon']
          },
          {
            _id: 'default-2',
            creatorId: {
              _id: 'c2',
              name: 'Deepa Raj',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
            },
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-camera-capturing-lens-flare-in-nature-41584-large.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400',
            caption: 'Catching golden hour flares in Madurai. Shot on RED V-Raptor. #goldenhour #cinematography #redcamera',
            likes: [],
            comments: [],
            views: 894,
            shares: 22,
            tags: ['goldenhour', 'cinematography', 'redcamera']
          }
        ];
        setReels(fallbackReels);
      } else {
        setReels(data);
      }
    } catch (err) {
      console.error('Error fetching reels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchReels();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchReels]);

  // Handle Like
  const handleLike = async (reelId: string) => {
    if (!currentUser) {
      alert('Please login to like reels!');
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

  // Handle Comment Submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentUser) return;

    const currentReel = reels[activeReelIndex];
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

  // Handle Post Reel Submit
  const handlePostReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postVideoUrl.trim() || !postCaption.trim() || !currentUser) return;

    setPosting(true);
    try {
      const { data } = await api.post('/reels', {
        videoUrl: postVideoUrl,
        caption: postCaption,
        tags: postCaption.match(/#\w+/g)?.map(t => t.slice(1)) || []
      });

      if (data.success) {
        setPostModalOpen(false);
        setPostCaption('');
        setPostVideoUrl('');
        fetchReels(); // reload feed
        alert('Reel posted successfully!');
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to post reel');
    } finally {
      setPosting(false);
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const index = Math.round(scrollTop / containerHeight);
    if (index !== activeReelIndex && index >= 0 && index < reels.length) {
      setActiveReelIndex(index);
    }
  }, [activeReelIndex, reels.length]);


  if (loading) {
    return (
      <div className="min-h-screen bg-nira-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-nira-yellow" />
      </div>
    );
  }

  const currentReel = reels[activeReelIndex] || null;

  return (
    <div className="min-h-screen bg-nira-dark text-white flex flex-col justify-between items-center relative overflow-hidden">
      {/* Top Header */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
        <Link href="/creators" className="p-2.5 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-black/60 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setMuted(!muted)}
          className="p-2.5 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-black/60 transition-all cursor-pointer"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        {currentUser && (
          <button
            onClick={() => setPostModalOpen(true)}
            className="p-2.5 bg-nira-yellow text-nira-dark rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:shadow-lg hover:shadow-nira-yellow/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Share Reel
          </button>
        )}
      </div>

      {/* Main Reel Viewport */}
      <div className="flex-1 w-full max-w-md h-[calc(100vh-60px)] relative bg-black">
        {reels.length > 0 ? (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide touch-scroll"
          >
            {reels.map((reel, idx) => (
              <ReelItem
                key={reel._id}
                reel={reel}
                isActive={idx === activeReelIndex}
                muted={muted}
                onToggleMute={() => setMuted(!muted)}
                onLike={() => handleLike(reel._id)}
                onCommentClick={() => setCommentsOpen(true)}
                currentUser={currentUser}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-5">
            <p className="text-sm text-neutral-400">No reels found</p>
          </div>
        )}
      </div>


      {/* Slide-out Comments Sheet */}
      <AnimatePresence>
        {commentsOpen && currentReel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentsOpen(false)}
              className="absolute inset-0 bg-black z-45"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 h-[60vh] bg-white text-nira-dark rounded-t-3xl border-t border-gray-150 z-50 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider">Comments ({currentReel.comments.length})</h3>
                <button onClick={() => setCommentsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentReel.comments.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageCircle className="w-8 h-8 text-nira-text-secondary opacity-30 mx-auto mb-2" />
                    <p className="text-xs text-nira-text-secondary font-bold">No comments yet</p>
                    <p className="text-[10px] text-nira-text-secondary">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  currentReel.comments.map((comm) => (
                    <div key={comm._id} className="flex gap-3 text-left">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative">
                        <Image src={comm.userId.avatar} alt={comm.userId.name} fill className="object-cover" unoptimized />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-nira-dark">{comm.userId.name}</p>
                        <p className="text-xs text-nira-text-secondary mt-0.5 leading-relaxed">{comm.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentUser ? (
                <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-100 flex gap-2 items-center bg-white">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="p-2.5 bg-nira-yellow text-nira-dark rounded-xl disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-100 text-center text-xs text-nira-text-secondary bg-gray-50">
                  Please log in to leave a comment.
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Reel Modal */}
      <AnimatePresence>
        {postModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setPostModalOpen(false)} className="absolute inset-0 bg-black" />
            <motion.form
              onSubmit={handlePostReel}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-nira-dark rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl relative z-10 space-y-4 text-left"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider">Share Portfolio Reel</h3>
                <button type="button" onClick={() => setPostModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div>
                <label className="text-[9px] font-bold text-nira-text-secondary uppercase tracking-wider mb-1.5 block">Video URL (mp4 format)</label>
                <input
                  type="text"
                  placeholder="https://assets.mixkit.co/... .mp4"
                  value={postVideoUrl}
                  onChange={e => setPostVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-nira-gray rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-nira-text-secondary uppercase tracking-wider mb-1.5 block">Caption</label>
                <textarea
                  placeholder="Share details of your shoot or project #cinematic #goldenhour"
                  value={postCaption}
                  onChange={e => setPostCaption(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-nira-gray rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow resize-none"
                  required
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={posting}
                  className="px-5 py-2.5 bg-nira-yellow text-nira-dark font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {posting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Post Reel
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
