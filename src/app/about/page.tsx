'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Compass, Sparkles, Building, Loader2 } from 'lucide-react';

interface Founder {
  name: string;
  role: string;
  bio: string;
}

interface CompanyInfo {
  companyName: string;
  tagline: string;
  founders: Founder[];
  headquarters: string;
  foundedYear: number;
}

export default function AboutPage() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch('/api/about');
        if (res.ok) {
          const data = await res.json();
          setInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch founder info:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-nira-yellow animate-spin" />
      </div>
    );
  }

  const founders = info?.founders || [
    {
      name: 'N.SATHESHKUMAR',
      role: 'Co-Founder & COO',
      bio: 'Spearheading product development and operations for NIRA6, shaping the future of creator recommerce.'
    },
    {
      name: 'NAGASIVANATHAN.S.N',
      role: 'Co-Founder & Lead Architect',
      bio: 'Engineering high-performance software systems and AI matchmaker algorithms for the visual ecosystem.'
    }
  ];

  return (
    <div className="rent-dark min-h-screen overflow-hidden selection:bg-nira-yellow selection:text-nira-dark relative py-20">
      {/* Background Subtle Viewfinder Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-nira-yellow/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-lens-focus">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <Users className="w-3.5 h-3.5 text-nira-yellow" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-300">
              The Creators Behind NIRA6
            </span>
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight leading-none mb-6">
            MEET OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-nira-yellow to-white">FOUNDERS</span>
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg font-light leading-relaxed">
            Everything for a creator in one place. Engineered to streamline camera recommerce, rentals, and portfolio discovery across India.
          </p>
        </div>

        {/* Founders Profiles Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card-dark rounded-3xl p-8 bg-white/[0.01] border border-white/5 relative overflow-hidden group hover:border-nira-yellow/20"
            >
              {/* Highlight gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-nira-yellow/5 rounded-full blur-[40px] group-hover:bg-nira-yellow/10 transition-colors" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                {/* Initials Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nira-yellow to-amber-500 text-cinema-bg flex items-center justify-center font-heading font-black text-2xl shadow-lg shrink-0">
                  {founder.name.split('.').filter(Boolean)[0]?.[0] || 'N'}
                  {founder.name.split('.').filter(Boolean)[1]?.[0] || 'S'}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-heading font-black text-2xl text-white mb-1 tracking-tight group-hover:text-nira-yellow transition-colors">
                    {founder.name}
                  </h3>
                  <p className="text-nira-yellow text-xs uppercase font-mono tracking-widest mb-4">
                    {founder.role}
                  </p>
                  <p className="text-neutral-400 text-sm leading-relaxed font-light">
                    {founder.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Corporate stats / Headquarters card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Building className="w-5 h-5 text-nira-yellow" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Headquarters</span>
                <span className="text-white font-bold text-sm">{info?.headquarters || 'Madurai, India'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Compass className="w-5 h-5 text-nira-yellow" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Founded Year</span>
                <span className="text-white font-bold text-sm">{info?.foundedYear || 2026}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-nira-yellow" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Mission Statement</span>
                <span className="text-white font-bold text-sm">Everything for a Creator</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
