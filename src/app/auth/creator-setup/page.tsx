'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building, CheckCircle2, AlertCircle, Loader2, ArrowRight, 
  ShieldCheck, Shield, Sparkles, Award, Phone, MapPin, Wrench
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setAuth } from '@/store/authSlice';
import { useAppDispatch } from '@/store';

function CreatorSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams ? searchParams.get('next') : null;
  const supabase = createClient();
  const dispatch = useAppDispatch();

  // Role State
  const [userRole, setUserRole] = useState<string>('creator');

  // Form State
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('');
  const [followers, setFollowers] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gst, setGst] = useState('');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login');
        return;
      }
      
      const role = session.user.user_metadata?.role || 'creator';
      setUserRole(role);

      // Pre-fill existing metadata if available
      if (session.user.user_metadata) {
        const metadata = session.user.user_metadata;
        if (metadata.social_handle) setHandle(metadata.social_handle);
        if (metadata.social_platform) setPlatform(metadata.social_platform);
        if (metadata.followers) setFollowers(metadata.followers);
        if (metadata.phone) setPhone(metadata.phone);
        if (metadata.city) setCity(metadata.city);
        if (metadata.business_name) setBusinessName(metadata.business_name);
        if (metadata.gst_number) setGst(metadata.gst_number);
        if (metadata.service_types) setServiceTypes(metadata.service_types);
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleServiceToggle = (svc: string) => {
    setServiceTypes(prev => 
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation based on role
    if (userRole === 'creator') {
      if (!handle.trim()) return setError("Social handle is required.");
      if (!platform) return setError("Please select a primary platform.");
      if (!followers) return setError("Please select your followers range.");
    } else {
      // Common fields for non-creators
      if (!phone.trim()) return setError("Phone number is required.");
      if (!city) return setError("Please select your city.");

      if (userRole === 'rental' || userRole === 'service_pro') {
        if (!businessName.trim()) return setError("Business name is required.");
      }

      if (userRole === 'service_pro') {
        if (serviceTypes.length === 0) return setError("Please select at least one service offering.");
      }
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const updatePayload: Record<string, unknown> = {
        role: userRole
      };

      if (userRole === 'creator') {
        updatePayload.social_handle = handle.startsWith('@') ? handle : `@${handle}`;
        updatePayload.social_platform = platform;
        updatePayload.followers = followers;
      } else if (userRole === 'seller') {
        updatePayload.phone = phone;
        updatePayload.city = city;
      } else if (userRole === 'rental') {
        updatePayload.phone = phone;
        updatePayload.city = city;
        updatePayload.business_name = businessName;
        updatePayload.gst_number = gst || null;
      } else if (userRole === 'service_pro') {
        updatePayload.phone = phone;
        updatePayload.city = city;
        updatePayload.business_name = businessName;
        updatePayload.gst_number = gst || null;
        updatePayload.service_types = serviceTypes;
      }

      // Update Supabase Metadata
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({
        data: updatePayload
      });

      if (updateError) {
        throw updateError;
      }

      if (user && session) {
        // Note the email since they provided details manually
        if (user.email) {
          try {
            await fetch('/api/auth/note-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email })
            });
          } catch (err) {
            console.error("Failed to note email in creator setup:", err);
          }
        }

        // Sync with local Redux store
        dispatch(setAuth({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          phone: user.user_metadata?.phone || user.phone || '',
          avatar: user.user_metadata?.avatar_url || '',
          role: userRole,
          walletBalance: 0,
          verified: !!user.email_confirmed_at,
          token: session.access_token
        }));
      }

      setSuccess(true);
      setTimeout(() => {
        if (redirectUrl && redirectUrl.startsWith('/')) {
          router.push(redirectUrl);
        } else {
          // Dynamic redirect based on role
          if (userRole === 'creator') router.push('/dashboard/creator');
          else if (userRole === 'seller') router.push('/seller');
          else if (userRole === 'rental') router.push('/rent');
          else if (userRole === 'service_pro') router.push('/services');
          else router.push('/dashboard');
        }
      }, 1500);

    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    if (userRole === 'creator') return 'Creator';
    if (userRole === 'seller') return 'Seller';
    if (userRole === 'rental') return 'Rental House';
    if (userRole === 'service_pro') return 'Service Pro';
    return 'User';
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col lg:flex-row relative overflow-hidden text-white font-body selection:bg-[#FFD700] selection:text-black">
      {/* GLOBAL CSS */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.5; }
        }
        .scanline {
          position: absolute;
          top: 0; left: 0; right: 0; height: 8px;
          background: linear-gradient(to bottom, transparent, rgba(255, 215, 0, 0.05), transparent);
          animation: scanline 10s linear infinite;
          pointer-events: none;
          z-index: 50;
        }
        .radial-spotlight {
          position: absolute;
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.02) 0%, rgba(5, 5, 5, 0) 75%);
          top: -200px;
          left: -200px;
          animation: pulseGlow 12s ease-in-out infinite;
          pointer-events: none;
        }
        .radial-spotlight-right {
          position: absolute;
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.015) 0%, rgba(5, 5, 5, 0) 75%);
          bottom: -200px;
          right: -200px;
          animation: pulseGlow 15s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
        }
        .grid-bg {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
        }
        .glow-hover {
          box-shadow: 0 0 0 0px rgba(255, 215, 0, 0);
          transition: all 0.3s ease;
        }
        .glow-hover:hover {
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.1);
        }
      `}</style>

      {/* BACKGROUND GRAPHICS */}
      <div className="absolute inset-0 bg-noise z-0"></div>
      <div className="absolute inset-0 grid-bg z-0 opacity-80"></div>
      <div className="radial-spotlight z-0"></div>
      <div className="radial-spotlight-right z-0"></div>
      <div className="scanline z-50"></div>

      {/* LEFT PANEL - BRAND HERO EXPERIENCE */}
      <div className="w-full lg:w-[45%] xl:w-[40%] p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#050505]/45 backdrop-blur-md">
        
        {/* Top Branding Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-block outline-none focus-visible:ring-1 focus-visible:ring-[#FFD700] rounded-lg">
            <h1 className="font-heading text-4xl sm:text-5xl tracking-[0.18em] text-white font-black leading-none">
              NIRA<span className="text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.45)]">6</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-[#FFD700]/60"></span>
            <span className="text-[10px] text-gray-500 tracking-[0.3em] font-extrabold uppercase">VAULT OF THE CREATIVE CLASS</span>
          </div>
        </div>

        {/* Center Value Prop & Platform Stats */}
        <div className="my-10 lg:my-0 space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              Account Verification Portal
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white leading-[1.15] tracking-tight">
              One Step Away From the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FFD700]">{getRoleLabel()} Network</span>.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Complete your profile details to establish your credentials, coordinate campaign metrics, and unlock secure escrow-protected contracts.
            </p>
          </div>
        </div>

        {/* Bottom Security / Trust Signatures */}
        <div className="hidden sm:flex flex-row items-center gap-6 text-gray-500 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FFD700]" />
            <span>Escrow Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FFD700]" />
            <span>Certified Identity Validation</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-20 relative z-10 overflow-y-auto no-scrollbar min-h-screen">
        <div className="w-full max-w-xl bg-[#0d0d0d]/85 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative glow-hover">
          
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
                key="success"
              >
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">PROFILE ALIGNED</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Profile credentials successfully configured. Redirecting to your dashboard...
                </p>
                <div className="w-10 h-10 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin mx-auto mt-4" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 w-full"
                key="form"
              >
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#FFD700] font-bold">Profile Setup</span>
                  <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight mt-1">ALIGN YOUR PROFILE</h2>
                  <p className="text-gray-400 text-sm mt-1.5">Enter details to identify your {getRoleLabel()} profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* CREATOR FIELDS */}
                  {userRole === 'creator' && (
                    <>
                      <div className="relative group">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                        <input
                          type="text"
                          name="handle"
                          placeholder="Social Handle (@username)"
                          required
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select 
                          name="platform" 
                          required 
                          value={platform} 
                          onChange={(e) => setPlatform(e.target.value)} 
                          aria-label="Primary Platform" 
                          title="Primary Platform" 
                          className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 px-4 text-white text-sm outline-none appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select Primary Platform</option>
                          <option value="Instagram">Instagram</option>
                          <option value="YouTube">YouTube</option>
                          <option value="Both">Both (IG + YT)</option>
                          <option value="Other">Other</option>
                        </select>

                        <select 
                          name="followers" 
                          required 
                          value={followers} 
                          onChange={(e) => setFollowers(e.target.value)} 
                          aria-label="Followers" 
                          title="Followers" 
                          className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 px-4 text-white text-sm outline-none appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Followers Range</option>
                          <option value="0-10k">0 - 10k</option>
                          <option value="10k-50k">10k - 50k</option>
                          <option value="50k-100k">50k - 100k</option>
                          <option value="100k+">100k+</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* SELLER / RENTAL / SERVICE PRO COMMON FIELDS */}
                  {userRole !== 'creator' && (
                    <>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number (+91)"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
                        />
                      </div>

                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                        <select 
                          name="city" 
                          required 
                          value={city} 
                          onChange={(e) => setCity(e.target.value)} 
                          aria-label="Select City" 
                          title="Select City" 
                          className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select City</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Chennai">Chennai</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Pune">Pune</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* RENTAL / SERVICE PRO SPECIFIC FIELDS */}
                  {(userRole === 'rental' || userRole === 'service_pro') && (
                    <>
                      <div className="relative group">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                        <input
                          type="text"
                          name="businessName"
                          placeholder="Business Name"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
                        />
                      </div>

                      <div className="relative group">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                        <input
                          type="text"
                          name="gst"
                          placeholder="GST Number (Optional)"
                          value={gst}
                          onChange={(e) => setGst(e.target.value)}
                          className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
                        />
                      </div>
                    </>
                  )}

                  {/* SERVICE PRO SERVICE LISTS */}
                  {userRole === 'service_pro' && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-[#FFD700]" />
                        Service Offerings
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['Repair', 'Rental', 'Calibration', 'Cleaning'].map(svc => (
                          <button 
                            type="button" 
                            key={svc} 
                            onClick={() => handleServiceToggle(svc)} 
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                              serviceTypes.includes(svc) 
                                ? 'bg-[#FFD700] text-black border-[#FFD700]' 
                                : 'bg-[#111111]/80 text-gray-400 border-white/[0.08] hover:border-white/30'
                            }`}
                          >
                            {serviceTypes.includes(svc) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                            {svc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TERMS AGREEMENT */}
                  <label className="flex items-start gap-3 mt-4 cursor-pointer group select-none">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-white/[0.08] group-hover:border-[#FFD700] transition-colors">
                      <input 
                        type="checkbox" 
                        checked={agreeTerms} 
                        onChange={(e) => setAgreeTerms(e.target.checked)} 
                        className="opacity-0 absolute inset-0 cursor-pointer" 
                      />
                      {agreeTerms && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD700]" />}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      By setting up your account, you agree to NIRA6&apos;s <Link href="/terms" className="text-white hover:text-[#FFD700] underline font-medium">Terms of Service</Link>, <Link href="/privacy" className="text-white hover:text-[#FFD700] underline font-medium">Privacy Policy</Link>, and the {getRoleLabel()} Agreement.
                    </p>
                  </label>

                  {error && (
                    <div className="p-3 rounded-lg text-xs font-bold flex items-start gap-2 bg-red-500/10 text-red-500 border border-red-500/20">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FFD700] hover:bg-[#FFDA03] text-black py-4 rounded-xl font-bold tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-6 shadow-[0_0_25px_rgba(255,215,0,0.2)] hover:shadow-[0_0_35px_rgba(255,215,0,0.4)] cursor-pointer text-xs uppercase"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>COMPLETE SETUP</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-8 flex flex-col items-center gap-4 border-t border-white/[0.08]">
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    256-bit SSL Encrypted • Data never sold
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

export default function CreatorSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    }>
      <CreatorSetupContent />
    </Suspense>
  );
}
