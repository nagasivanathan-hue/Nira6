/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star, CheckCircle, Calendar, MessageSquare, Share2, Heart,
  Clock, Briefcase, Camera, Shield, Globe, ArrowLeft, Zap, Award
} from 'lucide-react';
import { mockCreators, mockBookingPackages, mockCreatorReviews } from '@/lib/creatorMockData';
import { CREATOR_CATEGORIES } from '@/lib/constants';

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const creator = mockCreators.find(c => c.id === id) || mockCreators[0];
  const catColor = CREATOR_CATEGORIES.find(c => c.id === creator.category)?.color || '#FFDA03';
  const packages = mockBookingPackages.slice(0, 3);
  const reviews = mockCreatorReviews;
  const [activeTab, setActiveTab] = useState<'portfolio' | 'packages' | 'reviews' | 'about'>('portfolio');
  const [liked, setLiked] = useState(false);

  const verBadge = creator.verificationLevel === 'elite' ? { label: 'Elite Verified', color: 'from-amber-400 to-orange-500', icon: Award }
    : creator.verificationLevel === 'pro' ? { label: 'Pro Verified', color: 'from-blue-400 to-indigo-500', icon: Shield }
    : creator.verificationLevel === 'id_verified' ? { label: 'ID Verified', color: 'from-emerald-400 to-green-500', icon: CheckCircle }
    : null;

  return (
    <div className="min-h-screen bg-nira-gray">
      {/* Cover */}
      <div className="relative h-48 sm:h-64 overflow-hidden" style={{ background: `linear-gradient(135deg, ${catColor}30, ${catColor}60, #0A0A0A)` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3), transparent 50%)' }} />
        <div className="absolute top-4 left-4 z-10">
          <Link href="/creators/discover" className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md text-white text-xs font-bold rounded-lg hover:bg-black/50 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button onClick={() => setLiked(!liked)} className={`p-2 rounded-lg backdrop-blur-md transition-all cursor-pointer ${liked ? 'bg-red-500/80 text-white' : 'bg-black/30 text-white hover:bg-black/50'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
          </button>
          <button className="p-2 bg-black/30 backdrop-blur-md text-white rounded-lg hover:bg-black/50 transition-all cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-12">
        {/* Profile header */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg shrink-0 -mt-12 sm:-mt-16">
              <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-heading font-black text-xl sm:text-2xl text-nira-dark">{creator.name}</h1>
                {creator.verified && <CheckCircle className="w-5 h-5 text-nira-yellow" />}
                {verBadge && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black text-white bg-gradient-to-r ${verBadge.color}`}>
                    <verBadge.icon className="w-3 h-3" /> {verBadge.label}
                  </span>
                )}
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${creator.availability === 'available' ? 'bg-emerald-100 text-emerald-700' : creator.availability === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${creator.availability === 'available' ? 'bg-emerald-500 animate-pulse' : creator.availability === 'busy' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  {creator.availability}
                </span>
              </div>
              <p className="text-sm text-nira-text-secondary mb-3">{creator.title} • {creator.location}</p>
              <p className="text-xs text-nira-text-secondary leading-relaxed mb-4 max-w-2xl">{creator.bio}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {[
                  { icon: Star, label: 'Rating', value: `${creator.rating} (${creator.reviewCount})`, color: '#FFDA03' },
                  { icon: Briefcase, label: 'Jobs Done', value: creator.completedJobs.toString(), color: '#3B82F6' },
                  { icon: Clock, label: 'Experience', value: `${creator.experience} yrs`, color: '#10B981' },
                  { icon: Zap, label: 'Response', value: creator.responseTime, color: '#A855F7' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-nira-dark">{s.value}</p>
                      <p className="text-[9px] text-nira-text-secondary font-bold uppercase">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right CTA */}
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              <div className="text-center sm:text-right mb-2">
                <p className="text-[10px] text-nira-text-secondary font-bold uppercase">Starting from</p>
                <p className="font-heading font-black text-2xl text-nira-dark">₹{creator.startingPrice.toLocaleString('en-IN')}</p>
              </div>
              <Link href={`/creators/book?creator=${creator.id}`} className="flex items-center justify-center gap-2 px-5 py-3 bg-nira-yellow text-nira-dark font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-nira-yellow/25 transition-all">
                <Calendar className="w-4 h-4" /> Book Now
              </Link>
              <Link href={`/creators/chat?contact=${creator.userId || creator.id}`} className="flex items-center justify-center gap-2 px-5 py-3 bg-nira-dark text-white font-bold text-sm rounded-xl hover:bg-nira-dark/90 transition-all text-center">
                <MessageSquare className="w-4 h-4" /> Message
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 border border-gray-100 overflow-x-auto scrollbar-hide">
          {(['portfolio', 'packages', 'reviews', 'about'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${activeTab === tab ? 'bg-nira-dark text-white' : 'text-nira-text-secondary hover:text-nira-dark'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {creator.portfolio.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="aspect-square rounded-xl overflow-hidden bg-nira-gray group cursor-pointer">
                <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="grid sm:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <div key={pkg.id} className={`bg-white rounded-2xl p-5 border ${pkg.popular ? 'border-nira-yellow shadow-lg shadow-nira-yellow/10 relative' : 'border-gray-100'}`}>
                {pkg.popular && <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-nira-yellow text-nira-dark text-[9px] font-black rounded-full uppercase">Most Popular</span>}
                <h3 className="font-heading font-bold text-sm text-nira-dark mb-1">{pkg.name}</h3>
                <p className="text-[11px] text-nira-text-secondary mb-3 leading-relaxed">{pkg.description}</p>
                <p className="font-heading font-black text-2xl text-nira-dark mb-1">₹{pkg.price.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-nira-text-secondary mb-4">{pkg.duration}</p>
                <ul className="space-y-1.5 mb-4">
                  {pkg.deliverables.map(d => <li key={d} className="flex items-start gap-1.5 text-[11px] text-nira-text-secondary"><CheckCircle className="w-3 h-3 text-nira-yellow shrink-0 mt-0.5" />{d}</li>)}
                </ul>
                <Link href={`/creators/book?creator=${creator.id}&package=${pkg.id}`} className="block text-center px-4 py-2.5 bg-nira-dark text-white font-bold text-xs rounded-xl hover:bg-nira-yellow hover:text-nira-dark transition-all">
                  Select Package
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-nira-gray flex items-center justify-center text-[10px] font-bold text-nira-dark">{r.reviewerName.slice(0, 2)}</div>
                    <div>
                      <p className="font-bold text-xs text-nira-dark">{r.reviewerName}</p>
                      <p className="text-[10px] text-nira-text-secondary">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-nira-yellow text-nira-yellow' : 'text-gray-200'}`} />)}</div>
                </div>
                <p className="text-xs text-nira-text-secondary leading-relaxed">{r.comment}</p>
                {r.verified && <span className="inline-flex items-center gap-0.5 mt-2 text-[9px] font-bold text-emerald-600"><CheckCircle className="w-3 h-3" />Verified Booking</span>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-heading font-bold text-sm text-nira-dark mb-3">Skills</h3>
              <div className="flex flex-wrap gap-1.5">{creator.skills.map(s => <span key={s} className="px-2.5 py-1 bg-nira-gray rounded-lg text-[11px] font-semibold text-nira-dark">{s}</span>)}</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-heading font-bold text-sm text-nira-dark mb-3">Gear</h3>
              <div className="flex flex-wrap gap-1.5">{creator.gear.map(g => <span key={g} className="px-2.5 py-1 bg-nira-gray rounded-lg text-[11px] font-semibold text-nira-dark flex items-center gap-1"><Camera className="w-3 h-3 text-nira-yellow" />{g}</span>)}</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-heading font-bold text-sm text-nira-dark mb-3">Languages</h3>
              <div className="flex flex-wrap gap-1.5">{creator.languages.map(l => <span key={l} className="px-2.5 py-1 bg-nira-gray rounded-lg text-[11px] font-semibold text-nira-dark flex items-center gap-1"><Globe className="w-3 h-3" />{l}</span>)}</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-heading font-bold text-sm text-nira-dark mb-3">Trust Score</h3>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-4 border-nira-yellow flex items-center justify-center"><span className="font-heading font-black text-xl text-nira-dark">{creator.trustScore}</span></div>
                <div><p className="text-xs font-bold text-nira-dark">Excellent</p><p className="text-[10px] text-nira-text-secondary">Based on verification, reviews & history</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
