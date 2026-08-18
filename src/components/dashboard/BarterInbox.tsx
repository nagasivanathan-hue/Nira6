'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  RefreshCw, MessageSquare, Check, X, Send, 
  ArrowRightLeft, Clock, Star, ChevronDown, ChevronUp
} from 'lucide-react';

interface BarterRequest {
  id: string;
  _id?: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRating: number;
  offeredService: string;
  requestedGear: string;
  duration: string;
  status: 'active' | 'accepted' | 'countered' | 'expired';
  counterProposal?: string;
}

export default function BarterInbox() {
  const [listings, setListings] = useState<BarterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [counteringId, setCounteringId] = useState<string | null>(null);
  const [counterInput, setCounterInput] = useState('');
  const [chatOpenId, setChatOpenId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, string[]>>({});
  const [chatInput, setChatInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loadBarter = async () => {
      try {
        const res = await fetch('/api/studio/barter');
        if (res.ok) {
          const data = await res.json();
          setListings(
            data.map((b: { id?: string, _id?: string, [key: string]: unknown }) => ({
              ...b,
              id: b.id || b._id || '',
            }))
          );
        }
      } catch (err) {
        console.warn('[BarterInbox] API unavailable:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBarter();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await fetch('/api/studio/barter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'accepted' }),
      });
    } catch {
      // Optimistic — update locally even if API fails
    }
    setListings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'accepted' } : b))
    );
    window.dispatchEvent(
      new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🤝 Barter Trade Accepted!',
          content: `You've accepted the barter request. Coordinate delivery timelines.`,
        },
      })
    );
  };

  const handleCounter = async (id: string) => {
    if (!counterInput.trim()) return;
    try {
      await fetch('/api/studio/barter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'countered',
          counterProposal: counterInput,
        }),
      });
    } catch {
      // Optimistic
    }
    setListings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, status: 'countered', counterProposal: counterInput }
          : b
      )
    );
    setCounteringId(null);
    setCounterInput('');
    window.dispatchEvent(
      new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '⚡ Counter Proposal Sent!',
          content: 'Creator has been notified of your counter-proposal.',
        },
      })
    );
  };

  const handleDecline = (id: string) => {
    setListings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'expired' } : b))
    );
    window.dispatchEvent(
      new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '❌ Barter Declined',
          content: 'The trade request has been declined.',
        },
      })
    );
  };

  const handleSendChat = (listingId: string) => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => ({
      ...prev,
      [listingId]: [...(prev[listingId] || []), chatInput.trim()],
    }));
    setChatInput('');
  };

  const activeListings = listings.filter(l => l.status === 'active');
  const counteredListings = listings.filter(l => l.status === 'countered');
  const acceptedListings = listings.filter(l => l.status === 'accepted');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark p-8 text-center">
        <RefreshCw className="w-6 h-6 text-nira-text-secondary mx-auto animate-spin mb-2" />
        <p className="text-xs text-nira-text-secondary">Loading barter requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-500" /> Barter Trade Inbox
          </h2>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            {activeListings.length} Pending
          </span>
        </div>

        <div className="p-5">
          {activeListings.length === 0 && counteredListings.length === 0 ? (
            <div className="text-center py-10">
              <ArrowRightLeft className="w-8 h-8 text-nira-text-secondary/30 mx-auto mb-3" />
              <p className="text-xs text-nira-text-secondary font-bold">No active barter requests</p>
              <p className="text-[10px] text-nira-text-secondary mt-1">
                When other creators propose a service-for-gear trade, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {[...activeListings, ...counteredListings].map(listing => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-xl border overflow-hidden transition-all ${
                      listing.status === 'countered'
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-nira-gray-dark bg-nira-gray'
                    }`}
                  >
                    {/* Card Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === listing.id ? null : listing.id)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-nira-gray-dark shrink-0">
                          <Image
                            src={listing.creatorAvatar}
                            alt={listing.creatorName}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-nira-dark flex items-center gap-1.5">
                            {listing.creatorName}
                            <span className="flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-black">
                              <Star className="w-2.5 h-2.5" /> {listing.creatorRating}
                            </span>
                          </h3>
                          <p className="text-[10px] font-bold text-nira-text-secondary mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {listing.duration}
                            {listing.status === 'countered' && (
                              <span className="ml-1 text-amber-600 font-black uppercase text-[8px] tracking-wider">
                                • Counter Offered
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-nira-text-secondary">
                        {expandedId === listing.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {expandedId === listing.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* Trade Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-3 bg-white rounded-lg border border-nira-gray-dark">
                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider block mb-1">
                                  They Offer
                                </span>
                                <p className="text-xs font-bold text-nira-dark leading-relaxed">
                                  {listing.offeredService}
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg border border-nira-gray-dark">
                                <span className="text-[8px] font-black text-nira-text-secondary uppercase tracking-wider block mb-1">
                                  They Request
                                </span>
                                <p className="text-xs font-bold text-nira-dark leading-relaxed">
                                  {listing.requestedGear}
                                </p>
                              </div>
                            </div>

                            {/* Counter proposal display */}
                            {listing.counterProposal && (
                              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider block mb-1">
                                  Your Counter Proposal
                                </span>
                                <p className="text-xs text-nira-dark italic leading-relaxed">
                                  &ldquo;{listing.counterProposal}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Counter Offer Input */}
                            <AnimatePresence>
                              {counteringId === listing.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="p-3 bg-white border border-amber-200 rounded-lg space-y-2"
                                >
                                  <label className="text-[9px] font-black text-nira-dark uppercase tracking-wider">
                                    Your Counter Proposal
                                  </label>
                                  <textarea
                                    value={counterInput}
                                    onChange={e => setCounterInput(e.target.value)}
                                    placeholder="e.g. 'I can offer 12 hours of color grading but need the camera for 4 days instead of 3...'"
                                    rows={3}
                                    className="w-full bg-nira-gray border border-nira-gray-dark rounded-lg p-3 text-xs text-nira-dark focus:outline-none focus:border-nira-yellow transition-all resize-none"
                                    aria-label="Counter proposal text"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleCounter(listing.id)}
                                      className="flex-1 py-2 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                    >
                                      Send Counter
                                    </button>
                                    <button
                                      onClick={() => setCounteringId(null)}
                                      className="px-4 py-2 bg-nira-gray text-nira-text-secondary font-bold text-[10px] uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Chat Panel */}
                            <AnimatePresence>
                              {chatOpenId === listing.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  className="p-3 bg-white border border-nira-gray-dark rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-nira-gray-dark">
                                    <span className="text-[9px] font-black text-nira-dark uppercase tracking-wider">
                                      Barter Chat — {listing.creatorName}
                                    </span>
                                    <button
                                      onClick={() => setChatOpenId(null)}
                                      className="text-nira-text-secondary hover:text-nira-dark"
                                      aria-label="Close chat"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="max-h-40 overflow-y-auto space-y-2 mb-3 text-xs">
                                    <div className="bg-nira-gray p-2 rounded-lg text-nira-text-secondary max-w-[85%]">
                                      Hi! Let me know if you have questions about my portfolio or turnaround time.
                                    </div>
                                    {(chatMessages[listing.id] || []).map((msg, i) => (
                                      <div
                                        key={i}
                                        className="bg-nira-yellow/20 p-2 rounded-lg text-nira-dark max-w-[85%] ml-auto text-right font-medium"
                                      >
                                        {msg}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={chatInput}
                                      onChange={e => setChatInput(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') handleSendChat(listing.id);
                                      }}
                                      placeholder="Type message..."
                                      className="flex-1 bg-nira-gray border border-nira-gray-dark rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-nira-yellow text-nira-dark"
                                      aria-label="Chat message input"
                                    />
                                    <button
                                      onClick={() => handleSendChat(listing.id)}
                                      className="px-3 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                      aria-label="Send message"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            {listing.status === 'active' && (
                              <div className="flex gap-2 pt-2 border-t border-nira-gray-dark">
                                <button
                                  onClick={() => handleAccept(listing.id)}
                                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" /> Accept Trade
                                </button>
                                <button
                                  onClick={() => {
                                    setCounteringId(listing.id);
                                    setCounterInput('');
                                  }}
                                  className="flex-1 py-2.5 bg-nira-gray text-nira-dark font-bold text-xs uppercase tracking-wider rounded-lg border border-nira-gray-dark hover:border-nira-yellow transition-colors cursor-pointer"
                                >
                                  Counter
                                </button>
                                <button
                                  onClick={() => handleDecline(listing.id)}
                                  className="px-3 py-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
                                  aria-label="Decline barter request"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setChatOpenId(
                                      chatOpenId === listing.id ? null : listing.id
                                    )
                                  }
                                  className="px-3 py-2.5 bg-nira-gray text-nira-dark border border-nira-gray-dark hover:border-nira-yellow rounded-lg transition-colors cursor-pointer"
                                  aria-label="Open barter chat"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {listing.status === 'countered' && (
                              <div className="flex gap-2 pt-2 border-t border-amber-200">
                                <button
                                  onClick={() => handleAccept(listing.id)}
                                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" /> Accept (Final)
                                </button>
                                <button
                                  onClick={() =>
                                    setChatOpenId(
                                      chatOpenId === listing.id ? null : listing.id
                                    )
                                  }
                                  className="px-4 py-2.5 bg-amber-100 text-amber-700 font-bold text-xs uppercase tracking-wider rounded-lg border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-4 h-4" /> Chat
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Accepted / Completed Trades */}
      {acceptedListings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-sm font-black text-nira-dark uppercase tracking-wide flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Sealed Trades
            </h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {acceptedListings.length} Complete
            </span>
          </div>
          <div className="p-5 space-y-3">
            {acceptedListings.map(listing => (
              <div
                key={listing.id}
                className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-emerald-200 shrink-0">
                    <Image
                      src={listing.creatorAvatar}
                      alt={listing.creatorName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-nira-dark">
                      {listing.creatorName}
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                      {listing.offeredService.slice(0, 50)}...
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-200 text-emerald-800 text-[9px] font-black uppercase tracking-wider rounded-lg">
                  ✓ Sealed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
