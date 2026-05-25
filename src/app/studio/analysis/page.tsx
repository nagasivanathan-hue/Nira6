'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Sliders, Eye, Share2, ArrowLeft, Lightbulb, 
  Palette, Compass, ShieldAlert, Sparkles, Check,
  Maximize2, Flame, Layers, Info, X
} from 'lucide-react';

interface EstimatedValue {
  value: string;
  confidence: string;
}

interface AnalysisResult {
  aperture: EstimatedValue;
  iso: EstimatedValue;
  shutter_speed: EstimatedValue;
  focal_length: EstimatedValue;
  lens_type: EstimatedValue;
  lighting_setup: EstimatedValue;
  time_of_day: EstimatedValue;
  editing_style: EstimatedValue;
  photography_category: EstimatedValue;
  difficulty_to_recreate: EstimatedValue;
  explanations: {
    why_settings_used: string;
    how_to_recreate: string;
    beginner_friendly_tips: string;
  };
}

export default function AnalysisResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const imageUrl = searchParams.get('url');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // Loading logs simulation
  const [loadingLog, setLoadingLog] = useState('Initializing lens calibration...');
  
  useEffect(() => {
    if (!imageUrl) {
      setError('No storyboard image URL provided. Return to the studio and upload a reference image first.');
      setLoading(false);
      return;
    }

    const logMessages = [
      'Initializing lens calibration...',
      'Opening aperture blades (f/1.8)...',
      'Scanning high-frequency texture fields...',
      'Mapping shadow-to-highlight ratios...',
      'Analyzing color temperature fields...',
      'Predicting depth of field settings...',
      'Finalizing neural network compilation...'
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logMessages.length - 1) {
        logIndex++;
        setLoadingLog(logMessages[logIndex]);
      }
    }, 900);

    const fetchAnalysis = async () => {
      try {
        const res = await fetch('/api/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to analyze the photo.');
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during image evaluation.');
      } finally {
        clearInterval(logInterval);
        // Add a slight delay to let the user see the gorgeous aperture animation finish
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    fetchAnalysis();

    return () => clearInterval(logInterval);
  }, [imageUrl]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-[#FFDA03]/30 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Background ambient lighting effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] bg-[#FFDA03]/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[60%] bg-purple-500/5 rounded-full blur-[160px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* 1. APERTURE LOADING SCREEN */}
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950"
          >
            <div className="relative flex flex-col items-center gap-6 p-6">
              {/* Rotating SVG Aperture Blades */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                  viewBox="0 0 100 100"
                  className="w-24 h-24 text-[#FFDA03]"
                >
                  {/* Outer Lens Ring */}
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                  
                  {/* Aperture blades */}
                  <g className="fill-neutral-950 stroke-[#FFDA03] stroke-width-[1.5]">
                    {/* Blade 1 */}
                    <path d="M 50,10 L 80,40 L 70,60 L 50,10 Z" />
                    {/* Blade 2 */}
                    <path d="M 80,40 L 90,70 L 60,80 L 80,40 Z" />
                    {/* Blade 3 */}
                    <path d="M 90,70 L 60,90 L 40,70 L 90,70 Z" />
                    {/* Blade 4 */}
                    <path d="M 60,90 L 20,80 L 30,50 L 60,90 Z" />
                    {/* Blade 5 */}
                    <path d="M 20,80 L 10,50 L 40,30 L 20,80 Z" />
                    {/* Blade 6 */}
                    <path d="M 10,50 L 40,10 L 60,30 L 10,50 Z" />
                  </g>
                </motion.svg>

                {/* Blinking aperture center sensor */}
                <span className="absolute w-2 h-2 rounded-full bg-[#FFDA03] animate-ping" />
              </div>

              <div className="text-center font-mono">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FFDA03]">
                  Analyzing reference image
                </h3>
                <p className="text-[10px] text-neutral-400 mt-2 h-4 animate-pulse uppercase tracking-wider">
                  {loadingLog}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-900/40 flex items-center justify-center text-red-400 mb-5">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-white mb-2">
              Analysis Failed
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push('/studio')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase font-mono tracking-widest text-[#FFDA03] hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Studio
            </button>
          </motion.div>
        )}

        {/* 3. PREMIUM CONTENT LAYOUT */}
        {!loading && !error && data && (
          <motion.main
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto px-4 py-8 md:py-12"
          >
            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/studio')}
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#FFDA03] uppercase">AI DP Concierge</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white mt-0.5">
                    Image Composition Report
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFDA03] text-black font-semibold rounded-xl text-xs uppercase font-mono tracking-widest hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied Link
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" /> Share Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Image Preview + Primary Camera Parameters */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Uploaded Image Preview */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/40 group shadow-2xl">
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt="Uploaded reference analysis"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  
                  {/* Subtle hover overlay to view full */}
                  <div 
                    onClick={() => setShowFullImage(true)}
                    className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-zoom-in"
                  >
                    <div className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Absolute Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-neutral-800 text-[9px] uppercase font-mono tracking-wider">
                    Reference Source
                  </div>
                </div>

                {/* 2. Confidence Meters */}
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur-xl">
                  <h3 className="text-xs uppercase font-mono font-semibold tracking-widest text-[#FFDA03] mb-4 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" /> AI Confidence Telemetry
                  </h3>
                  
                  <div className="space-y-3.5">
                    {[
                      { label: 'Exposure & Lighting', score: data.lighting_setup.confidence },
                      { label: 'Optical Configuration', score: data.lens_type.confidence },
                      { label: 'Post-Process Emulation', score: data.editing_style.confidence },
                      { label: 'Recreation Feasibility', score: data.difficulty_to_recreate.confidence }
                    ].map((meter, index) => {
                      const percentage = parseInt(meter.score) || 85;
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-[10px] font-mono mb-1.5">
                            <span className="text-neutral-400">{meter.label}</span>
                            <span className="text-white font-bold">{meter.score}</span>
                          </div>
                          <div className="w-full bg-neutral-950 border border-neutral-850 h-2 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.1 * index }}
                              className="bg-gradient-to-r from-purple-500 to-[#FFDA03] h-full rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Camera Settings HUD & Descriptions */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 3. Camera Settings Cards */}
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur-xl">
                  <h3 className="text-xs uppercase font-mono font-semibold tracking-widest text-[#FFDA03] mb-4 flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Camera Settings Matrix
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    
                    {/* Aperture (Gold Highlighted) */}
                    <div className="bg-neutral-950/80 border border-[#FFDA03]/30 rounded-xl p-3 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-[#FFDA03]/5 rounded-full blur-md pointer-events-none" />
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block">Aperture</span>
                      <span className="text-2xl font-bold font-mono text-[#FFDA03] block mt-1 tracking-tight">
                        {data.aperture.value}
                      </span>
                      <span className="text-[8px] font-mono text-[#FFDA03]/80 block mt-0.5">
                        {data.aperture.confidence} Confidence
                      </span>
                    </div>

                    {/* ISO */}
                    <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-3">
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block">ISO Speed</span>
                      <span className="text-2xl font-bold font-mono text-white block mt-1 tracking-tight">
                        {data.iso.value}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-500 block mt-0.5">
                        {data.iso.confidence} Confidence
                      </span>
                    </div>

                    {/* Shutter */}
                    <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-3">
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block">Shutter Speed</span>
                      <span className="text-2xl font-bold font-mono text-white block mt-1 tracking-tight">
                        {data.shutter_speed.value}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-500 block mt-0.5">
                        {data.shutter_speed.confidence} Confidence
                      </span>
                    </div>

                    {/* Focal Length */}
                    <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-3">
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block">Focal Length</span>
                      <span className="text-xl font-bold font-mono text-white block mt-1.5 truncate">
                        {data.focal_length.value}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-500 block mt-0.5">
                        {data.focal_length.confidence} Confidence
                      </span>
                    </div>

                    {/* Lens Type */}
                    <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-3">
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block">Lens Configuration</span>
                      <span className="text-xl font-bold font-mono text-white block mt-1.5 truncate">
                        {data.lens_type.value}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-500 block mt-0.5">
                        {data.lens_type.confidence} Confidence
                      </span>
                    </div>

                    {/* Difficulty */}
                    <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-3">
                      <span className="text-[9px] uppercase font-mono text-neutral-400 block">Recreation Diff.</span>
                      <span className="text-xl font-bold font-mono text-purple-400 block mt-1.5 truncate">
                        {data.difficulty_to_recreate.value}
                      </span>
                      <span className="text-[8px] font-mono text-purple-500/80 block mt-0.5">
                        {data.difficulty_to_recreate.confidence} Confidence
                      </span>
                    </div>

                  </div>
                </div>

                {/* 4. Lighting & Time of Day */}
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs uppercase font-mono font-semibold tracking-widest text-[#FFDA03] flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-400 animate-pulse" /> Lighting Analysis & Environment
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-950/70 border border-neutral-900 rounded-xl p-3.5">
                      <span className="text-[8px] font-mono text-purple-400 block uppercase tracking-widest">Setup Configuration</span>
                      <p className="text-xs text-white font-semibold mt-1 font-mono">{data.lighting_setup.value}</p>
                      <span className="text-[8px] font-mono text-neutral-500 mt-1 block">{data.lighting_setup.confidence} confidence rating</span>
                    </div>

                    <div className="bg-neutral-950/70 border border-neutral-900 rounded-xl p-3.5">
                      <span className="text-[8px] font-mono text-purple-400 block uppercase tracking-widest">Atmosphere / Time</span>
                      <p className="text-xs text-white font-semibold mt-1 font-mono">{data.time_of_day.value}</p>
                      <span className="text-[8px] font-mono text-neutral-500 mt-1 block">{data.time_of_day.confidence} confidence rating</span>
                    </div>
                  </div>
                </div>

                {/* 5. Editing Style & Photography Category */}
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur-xl space-y-4">
                  <h3 className="text-xs uppercase font-mono font-semibold tracking-widest text-[#FFDA03] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-400" /> Color Correction & Post-Process
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-950/70 border border-neutral-900 rounded-xl p-3.5">
                      <span className="text-[8px] font-mono text-purple-400 block uppercase tracking-widest">Styling / Grade</span>
                      <p className="text-xs text-white font-semibold mt-1 font-mono">{data.editing_style.value}</p>
                      <span className="text-[8px] font-mono text-neutral-500 mt-1 block">{data.editing_style.confidence} confidence rating</span>
                    </div>

                    <div className="bg-neutral-950/70 border border-neutral-900 rounded-xl p-3.5">
                      <span className="text-[8px] font-mono text-purple-400 block uppercase tracking-widest">Composition Genre</span>
                      <p className="text-xs text-white font-semibold mt-1 font-mono">{data.photography_category.value}</p>
                      <span className="text-[8px] font-mono text-neutral-500 mt-1 block">{data.photography_category.confidence} confidence rating</span>
                    </div>
                  </div>
                </div>

                {/* 6. Why Settings Were Used */}
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur-xl">
                  <h3 className="text-xs uppercase font-mono font-semibold tracking-widest text-[#FFDA03] mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-400" /> Technical Rationale
                  </h3>
                  <div className="bg-neutral-950/60 border border-neutral-900 rounded-xl p-4 font-mono">
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {data.explanations.why_settings_used}
                    </p>
                  </div>
                </div>

                {/* 7. How to Recreate This Shot */}
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur-xl">
                  <h3 className="text-xs uppercase font-mono font-semibold tracking-widest text-[#FFDA03] mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-purple-400" /> Actionable recreation playbook
                  </h3>
                  <div className="bg-neutral-950/60 border border-neutral-900 rounded-xl p-4 font-mono">
                    <p className="text-[11px] text-neutral-300 leading-relaxed whitespace-pre-line">
                      {data.explanations.how_to_recreate}
                    </p>
                  </div>
                </div>

                {/* 8. Recommended Beginner Settings */}
                <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 backdrop-blur-xl">
                  <h3 className="text-xs uppercase font-mono font-semibold tracking-widest text-[#FFDA03] mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" /> Recommended Starter Parameters
                  </h3>
                  <div className="bg-neutral-950/60 border border-neutral-900 rounded-xl p-4 font-mono">
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {data.explanations.beginner_friendly_tips}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* FULLSCREEN IMAGE MODAL OVERLAY */}
      <AnimatePresence>
        {showFullImage && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 cursor-zoom-out"
            onClick={() => setShowFullImage(false)}
          >
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
              <Image
                src={imageUrl}
                alt="Fullscreen reference composition"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 p-2.5 bg-neutral-900 border border-neutral-800 rounded-full text-white cursor-pointer hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
