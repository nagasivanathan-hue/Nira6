'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, MessageSquare, ArrowRight, RefreshCw, Check, Plus } from 'lucide-react';
import api from '@/services/api';

const STYLE_OPTIONS = ['Cinematic', 'Vintage', 'Modern', 'Minimalist', 'Dramatic', 'Commercial', 'Fashion', 'Street', 'Documentary', 'Artistic'];
const SKILL_OPTIONS = ['Color Grading', 'Drone Piloting', 'Photoshop', 'Lightroom', 'Video Editing', 'Portrait Photography', 'Sound Design', 'Studio Lighting', 'Product Styling'];

interface RecommendationResult {
  creator: {
    id: string;
    userId: string;
    name: string;
    avatar: string;
    category: string;
    title: string;
    bio: string;
    location: string;
    rating: number;
    reviewCount: number;
    completedJobs: number;
    startingPrice: number;
    verified: boolean;
    skills: string[];
    styles: string[];
    gear: string[];
  };
  matchPercentage: number;
  scoreDetails: {
    categoryMatch: number;
    skillsOverlap: number;
    budgetScore: number;
    ratingScore: number;
    experienceScore: number;
    styleScore: number;
    trustBonus: number;
  };
}

export default function AiMatchPage() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [category, setCategory] = useState('photographer');
  const [maxBudget, setMaxBudget] = useState('15000');
  const [minExperience, setMinExperience] = useState('2');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loadingText, setLoadingText] = useState('Initializing recommendation engine...');

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const runScanningSimulation = async () => {
    setStep('loading');
    setLoadingText('Connecting to NIRA6 creator network...');
    await new Promise(r => setTimeout(r, 800));
    setLoadingText('Analyzing skill matches & equipment lists...');
    await new Promise(r => setTimeout(r, 800));
    setLoadingText('Executing vector compatibility scores...');
    await new Promise(r => setTimeout(r, 800));
    setLoadingText('Compiling final recommendations...');
    await new Promise(r => setTimeout(r, 600));
  };

  const handleFindMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Start animation
    const animPromise = runScanningSimulation();

    // Fetch API
    let apiResults: RecommendationResult[] = [];
    try {
      const { data } = await api.post('/ai/match', {
        category,
        maxBudget: Number(maxBudget),
        minExperience: Number(minExperience),
        styles: selectedStyles,
        skills: selectedSkills
      });
      apiResults = data;
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }

    await animPromise;
    setResults(apiResults);
    setStep('results');
  };

  return (
    <div className="min-h-screen bg-nira-gray text-nira-dark pb-20">
      {/* Header Banner */}
      <div className="bg-nira-dark text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,218,3,0.4), transparent 60%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nira-yellow/10 border border-nira-yellow/20 text-xs font-bold text-nira-yellow mb-4 uppercase tracking-widest">
            <Sparkles className="w-4.5 h-4.5" /> AI Matchmaking
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl">Find Your Perfect Creative Match</h1>
          <p className="text-xs text-white/70 max-w-lg mx-auto mt-2">
            Input your project specifications and let our recommendation engine scan compatibility metrics to connect you with top-tier talent.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <AnimatePresence mode="wait">
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <motion.form
              key="form"
              onSubmit={handleFindMatches}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-150 shadow-xl space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-2 block">Creative Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs font-bold border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow"
                  >
                    <option value="photographer">Photographer</option>
                    <option value="videographer">Videographer</option>
                    <option value="editor">Editor</option>
                    <option value="drone_operator">Drone Operator</option>
                    <option value="model">Model / Talent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-2 block">Maximum Budget (₹)</label>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={e => setMaxBudget(e.target.value)}
                    placeholder="Enter maximum budget"
                    className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs font-bold border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-2 block">Minimum Experience (Years)</label>
                  <input
                    type="number"
                    value={minExperience}
                    onChange={e => setMinExperience(e.target.value)}
                    placeholder="Minimum years"
                    className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs font-bold border-none focus:outline-none focus:ring-2 focus:ring-nira-yellow"
                  />
                </div>
              </div>

              {/* Styles */}
              <div>
                <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-2 block">Preferred Creative Styles</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map(style => {
                    const isSelected = selectedStyles.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                          isSelected ? 'bg-nira-dark text-white border-nira-dark' : 'bg-nira-gray text-nira-text-secondary border-transparent hover:border-gray-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider mb-2 block">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                          isSelected ? 'bg-nira-dark text-white border-nira-dark' : 'bg-nira-gray text-nira-text-secondary border-transparent hover:border-gray-300'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-nira-yellow text-nira-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-nira-yellow/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  Match Creative Partner <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2: SCANNING ANIMATION */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl p-16 border border-gray-150 shadow-xl flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-nira-yellow/20 border-t-nira-yellow animate-spin flex items-center justify-center" />
                <Sparkles className="w-8 h-8 text-nira-yellow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">AI Vector Matchmaker</h3>
                <p className="text-xs text-nira-text-secondary mt-1">{loadingText}</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-nira-text-secondary uppercase tracking-widest">{results.length} Recommendations Found</p>
                <button
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1 text-xs font-bold text-nira-dark hover:text-nira-yellow transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Adjust Criteria
                </button>
              </div>

              {results.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-150 shadow-md">
                  <Sparkles className="w-12 h-12 text-nira-text-secondary opacity-30 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-lg text-nira-dark">No suitable matches found</h3>
                  <p className="text-xs text-nira-text-secondary mt-1 max-w-sm mx-auto">
                    Try broadening your budget parameters or reducing requested skill tags.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((res, index) => (
                    <div
                      key={res.creator.id}
                      className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:shadow-lg transition-all"
                    >
                      {/* Rank ribbon */}
                      <div className="absolute top-0 right-0 px-4 py-1.5 bg-nira-dark text-white text-[9px] font-black uppercase rounded-bl-2xl">
                        Rank #{index + 1}
                      </div>

                      {/* Left: Avatar & Match % */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md mb-3 border border-gray-100 relative">
                          <Image src={res.creator.avatar} alt={res.creator.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-full font-black text-xs uppercase flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> {res.matchPercentage}% Match
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-black text-base text-nira-dark">{res.creator.name}</h3>
                          <span className="text-[9px] bg-nira-gray px-2 py-0.5 rounded font-bold text-nira-text-secondary uppercase">
                            {res.creator.category}
                          </span>
                        </div>
                        <p className="text-xs text-nira-text-secondary font-bold mb-2">{res.creator.title} • {res.creator.location}</p>
                        <p className="text-xs text-nira-text-secondary leading-relaxed mb-4">{res.creator.bio}</p>

                        {/* Match Details breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-nira-gray/30 p-3.5 rounded-2xl mb-4 text-[10px]">
                          <div>
                            <span className="text-nira-text-secondary block font-semibold uppercase">Pricing Match</span>
                            <span className="font-black text-nira-dark">{Math.round(res.scoreDetails.budgetScore * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-nira-text-secondary block font-semibold uppercase">Skills Overlap</span>
                            <span className="font-black text-nira-dark">{Math.round(res.scoreDetails.skillsOverlap * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-nira-text-secondary block font-semibold uppercase">Experience Match</span>
                            <span className="font-black text-nira-dark">{Math.round(res.scoreDetails.experienceScore * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-nira-text-secondary block font-semibold uppercase">Style Fit</span>
                            <span className="font-black text-nira-dark">{Math.round(res.scoreDetails.styleScore * 100)}%</span>
                          </div>
                        </div>

                        {/* Skills match highlights */}
                        <div className="flex flex-wrap gap-1">
                          {res.creator.skills.slice(0, 4).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-nira-gray border border-gray-200 rounded text-[9px] font-bold text-nira-text-secondary">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col justify-end gap-2 md:w-40 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                        <div className="mb-2 text-center md:text-right">
                          <span className="text-[9px] text-nira-text-secondary font-bold uppercase block">Starting rate</span>
                          <span className="font-heading font-black text-lg text-nira-dark">₹{res.creator.startingPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <Link
                          href={`/creators/book?creator=${res.creator.id}`}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-nira-yellow text-nira-dark font-bold text-[11px] rounded-xl hover:shadow-md transition-all text-center"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Book Partner
                        </Link>
                        <Link
                          href={`/creators/chat?contact=${res.creator.userId || res.creator.id}`}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-nira-dark text-white font-bold text-[11px] rounded-xl hover:bg-nira-dark/95 transition-all text-center"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
