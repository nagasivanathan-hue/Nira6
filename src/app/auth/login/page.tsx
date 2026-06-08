'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, Package, Wrench, Video, ArrowRight, ArrowLeft, 
  Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  ShieldCheck, ShieldAlert, Loader2, KeyRound, User, Phone, MapPin, Building, Star, Sparkles, Shield, Camera, Award
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setKeepLoggedIn } from '@/store/authSlice';

type Role = 'buyer' | 'seller' | 'service_pro' | 'creator' | 'rental';
type Step = 'role' | 'method' | 'form' | '2fa' | 'success';

const ROLES = [
  { 
    id: 'buyer', 
    label: 'Buyer', 
    desc: 'Acquire verified high-end filmmaker & photography equipment.', 
    detailed: 'Access elite, certified cameras & lenses with build validation and secure escrow protection.',
    icon: ShoppingCart 
  },
  { 
    id: 'seller', 
    label: 'Seller', 
    desc: 'Offload your professional equipment securely to our verified base.', 
    detailed: 'Get immediate luxury valuations and access to thousands of ready creative studios.',
    icon: Package 
  },
  { 
    id: 'service_pro', 
    label: 'Service Pro', 
    desc: 'Offer premium camera repair, tuning, and calibration services.', 
    detailed: 'Monetize your technical camera expertise under the official NIRA6 verification badge.',
    icon: Wrench 
  },
  { 
    id: 'creator', 
    label: 'Creator', 
    desc: 'Join the premier brand-matching & product review alliance.', 
    detailed: 'Get sponsored campaigns, free high-end gear testing, and professional agency networking.',
    icon: Video 
  },
  { 
    id: 'rental', 
    label: 'Rental House', 
    desc: 'List assets for secure premium rental with built-in coverage.', 
    detailed: 'Optimize fleet utilization with automated logistics, escrow, and trackable handovers.',
    icon: Camera 
  },
] as const;

const STEPS_LIST = [
  { id: 'role', num: '01', label: 'Path' },
  { id: 'method', num: '02', label: 'Access' },
  { id: 'form', num: '03', label: 'Details' },
  { id: '2fa', num: '04', label: 'Vault' }
];

export default function NIRA6AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  // Navigation State
  const [step, setStep] = useState<Step>('role');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    city: '',
    businessName: '',
    serviceTypes: [] as string[],
    gst: '',
    platform: '',
    followers: '',
    handle: '',
    agreeTerms: false
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const [otpLogin, setOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [keepLoggedIn, setKeepLoggedInState] = useState(true);

  // Password Strength
  const pwdScore = React.useMemo(() => {
    let score = 0;
    const p = formData.password;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }, [formData.password]);

  const getPwdStrength = () => {
    if (formData.password.length === 0) return { label: '', color: 'bg-[#1E1E1E]' };
    if (pwdScore <= 1) return { label: 'Weak', color: 'bg-red-500 text-red-500' };
    if (pwdScore === 2) return { label: 'Fair', color: 'bg-orange-500 text-orange-500' };
    if (pwdScore === 3) return { label: 'Strong', color: 'bg-blue-500 text-blue-500' };
    return { label: 'Fortress', color: 'bg-[#FFD700] text-[#FFD700]' };
  };

  // Lockout Timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const t = setTimeout(() => setLockoutTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [lockoutTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    if (!selectedRole) {
      setError("Please select a role path first.");
      return;
    }
    
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!formData.agreeTerms) {
        setError("You must agree to the Terms of Service.");
        setLoading(false);
        return;
      }

      // Supabase Email Signup
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: selectedRole,
            phone: formData.phone || null,
            city: formData.city || null,
            business_name: formData.businessName || null,
            service_types: formData.serviceTypes || null,
            gst_number: formData.gst || null,
            social_platform: formData.platform || null,
            followers: formData.followers || null,
            social_handle: formData.handle || null,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        if (signUpError.message.includes("already registered")) {
          setError("An account with this email exists. Login instead?");
        }
        setLoading(false);
        return;
      }

      setSuccessMsg("Check your inbox to verify your email.");
      setStep('success');

    } else {
      // Login Mode
      if (otpLogin) {
        if (!otpSent) {
          setOtpSent(true);
          setSuccessMsg(`OTP sent to ${formData.email}`);
          setLoading(false);
          return;
        } else {
          if (otp !== '123456') { // Mock OTP validation
            setError("Invalid OTP. Try 123456.");
            setLoading(false);
            return;
          }
          setSuccessMsg("Phone verification successful.");
          setStep('2fa');
          setLoading(false);
          return;
        }
      }

      setKeepLoggedIn(keepLoggedIn);

      // Supabase Password Login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        const errorMsg = signInError.message.toLowerCase();
        if (errorMsg.includes('confirm') || errorMsg.includes('verify')) {
          setError("Your email address is not confirmed yet. Please verify it via the confirmation link sent to your inbox.");
        } else if (errorMsg.includes('invalid login') || errorMsg.includes('invalid credentials')) {
          const attempts = failedAttempts + 1;
          setFailedAttempts(attempts);
          if (attempts >= 3) {
            setLockoutTimer(30);
            setError("Too many login attempts. Please wait 30 seconds.");
          } else {
            setError(`Incorrect email or password. ${3 - attempts} attempts remaining.`);
          }
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Upsert profile role just in case
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          role: selectedRole,
        });
      }

      setStep('2fa');
    }
    setLoading(false);
  };

  const handleGoogleOAuth = async () => {
    if (!selectedRole) {
      setError("Please select a role path first.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { role: selectedRole }
      }
    });
    if (error) setError("Google sign-in failed. Try email instead.");
  };

  const handleRedirect = () => {
    if (!selectedRole) return;
    switch (selectedRole) {
      case 'seller': router.push('/dashboard'); break;
      case 'service_pro': router.push('/dashboard'); break;
      case 'creator': router.push('/dashboard/creator'); break;
      case 'buyer': 
      default: router.push('/buy'); break;
    }
  };

  // ─── RENDER STEP COMPONENT HELPERS ───

  const renderStepRole = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-left">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#FFD700] font-bold">Step 01 / Path selection</span>
        <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight mt-1">CHOOSE YOUR PATH</h2>
        <p className="text-gray-400 text-sm mt-1.5">Select how you want to interact with the NIRA6 ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.id;
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              role="radio"
              aria-checked={isSelected ? "true" : "false"}
              tabIndex={0}
              onClick={() => setSelectedRole(r.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setSelectedRole(r.id);
                }
              }}
              className={`group flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 relative text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] min-h-[160px] ${
                isSelected 
                  ? 'bg-[#111111]/80 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.15)]' 
                  : 'bg-[#111111]/40 border-white/[0.06] hover:bg-[#1a1a1a]/60 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <div className={`p-2.5 rounded-xl border transition-colors ${
                  isSelected 
                    ? 'bg-[#FFD700]/10 border-[#FFD700]/25 text-[#FFD700]' 
                    : 'bg-white/[0.02] border-white/[0.08] text-gray-400 group-hover:text-white group-hover:bg-white/[0.04]'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Selection Indicator Ring */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'border-[#FFD700] bg-[#FFD700]' 
                    : 'border-white/20 bg-transparent group-hover:border-white/40'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold tracking-wide text-white mt-4">{r.label}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedRole && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/15 text-xs text-[#FFD700]/90 leading-relaxed"
        >
          <strong>{ROLES.find(r => r.id === selectedRole)?.label} Privilege:</strong> {ROLES.find(r => r.id === selectedRole)?.detailed}
        </motion.div>
      )}

      <button 
        disabled={!selectedRole}
        onClick={() => setStep('method')}
        className="w-full bg-[#FFD700] hover:bg-[#FFDA03] disabled:bg-white/5 disabled:text-white/20 disabled:border-white/5 disabled:shadow-none text-black py-4 rounded-xl font-bold tracking-widest flex items-center justify-center gap-2 transition-all mt-6 shadow-[0_0_35px_rgba(255,215,0,0.25)] hover:shadow-[0_0_45px_rgba(255,215,0,0.45)] cursor-pointer disabled:cursor-not-allowed group text-xs uppercase"
      >
        <span>Continue to access setup</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );

  const renderStepMethod = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <button 
        onClick={() => setStep('role')} 
        className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-bold transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" /> Back to path selection
      </button>

      <div className="text-left mt-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#FFD700] font-bold">Step 02 / Auth configuration</span>
        <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight mt-1">ESTABLISH ACCESS</h2>
        <p className="text-gray-400 text-sm mt-1.5">Configure access credentials for your <span className="text-[#FFD700] font-bold">{ROLES.find(r => r.id === selectedRole)?.label}</span> profile.</p>
      </div>

      <div className="space-y-4 pt-2">
        <button
          onClick={handleGoogleOAuth}
          className="w-full bg-white hover:bg-gray-100 text-black py-4 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-wider transition-all hover:shadow-[0_4px_25px_rgba(255,255,255,0.15)] cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.3em]">OR SECURE VIA EMAIL</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button
          onClick={() => { setMode('signup'); setStep('form'); }}
          className="w-full bg-[#111111]/80 hover:bg-[#1a1a1a] border border-white/[0.08] hover:border-[#FFD700] text-white py-4 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          <Mail className="w-5 h-5 text-[#FFD700]" />
          Continue with Email credentials
        </button>
      </div>
    </motion.div>
  );

  const renderStepForm = () => {
    const strength = getPwdStrength();
    const currentRoleLabel = selectedRole ? ROLES.find(r => r.id === selectedRole)?.label : '';

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 w-full"
      >
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setStep('method')} 
            className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-bold transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="flex bg-[#050505] p-1 rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${mode === 'login' ? 'bg-[#FFD700] text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${mode === 'signup' ? 'bg-[#FFD700] text-black shadow-lg font-black' : 'text-gray-400 hover:text-white'}`}
            >
              SIGNUP
            </button>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {mode === 'signup' && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
              <input
                type="text" name="name" placeholder="Full Name" required
                value={formData.name} onChange={handleInputChange}
                className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
            <input
              type="text" name="email" placeholder={mode === 'signup' ? "Email Address" : "Email or Phone Number"} required
              value={formData.email} onChange={handleInputChange}
              className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
            />
            {mode === 'signup' && formData.email.includes('@') && (
              <p className="absolute -bottom-5 left-2 text-[9px] text-[#FFD700] flex items-center gap-1 font-bold tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-[#FFD700]" /> Verification email will be sent
              </p>
            )}
          </div>

          {mode === 'login' && !otpLogin && (
            <div className="relative group mt-6">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" required
                value={formData.password} onChange={handleInputChange}
                className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-12 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {mode === 'login' && otpLogin && otpSent && (
            <div className="relative group mt-6">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
              <input
                type="text" name="otp" placeholder="Enter 6-digit OTP" required
                value={otp} onChange={(e) => { setOtp(e.target.value); setError(''); }}
                maxLength={6}
                className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-between items-center mt-2">
              <button 
                type="button" 
                onClick={() => { setOtpLogin(!otpLogin); setOtpSent(false); setError(''); }} 
                className="text-xs text-[#FFD700] hover:underline font-bold tracking-wide cursor-pointer bg-transparent border-none"
              >
                {otpLogin ? 'Use Password' : 'Login via OTP (Phone/Email)'}
              </button>
              {!otpLogin && (
                <Link href="#" className="text-xs text-gray-500 hover:text-[#FFD700] transition-colors font-medium">Forgot password?</Link>
              )}
            </div>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-3 mt-4 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/[0.08] group-hover:border-[#FFD700] transition-colors">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedInState(e.target.checked)}
                  className="opacity-0 absolute inset-0 cursor-pointer"
                />
                {keepLoggedIn && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD700]" />}
              </div>
              <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                Keep me logged in for 7 days
              </span>
            </label>
          )}

          {mode === 'signup' && (
            <>
              <div className="relative group mt-6">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" required
                  value={formData.password} onChange={handleInputChange}
                  className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-12 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* PASSWORD STRENGTH */}
              <div className="pt-2 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Security Score</span>
                  <span className={`text-[9px] uppercase font-bold tracking-widest ${strength.color.split(' ')[1]}`}>{strength.label}</span>
                </div>
                <div className="flex gap-1 h-1.5 mb-3">
                  {[1,2,3,4].map(n => (
                    <div key={n} className={`flex-1 rounded-full ${n <= pwdScore ? strength.color.split(' ')[0] : 'bg-white/[0.06]'} transition-colors duration-300`} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-500">
                  <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> 8+ characters</span>
                  <span className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> Uppercase</span>
                  <span className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> Number</span>
                  <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> Special char</span>
                </div>
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" required
                  value={formData.confirmPassword} onChange={handleInputChange}
                  className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-12 text-white text-sm outline-none transition-all focus:ring-1 focus:ring-[#FFD700] placeholder:text-gray-600"
                />
              </div>

              {/* DYNAMIC ROLE FIELDS */}
              <div className="pt-4 border-t border-white/[0.08] space-y-4">
                
                {(selectedRole === 'seller' || selectedRole === 'service_pro') && (
                  <>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700]" />
                      <input type="tel" name="phone" placeholder="Phone (+91)" required value={formData.phone} onChange={handleInputChange} className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#FFD700]" />
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700]" />
                      <select name="city" required value={formData.city} onChange={handleInputChange} aria-label="Select City" title="Select City" className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none appearance-none cursor-pointer">
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

                {selectedRole === 'service_pro' && (
                  <>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700]" />
                      <input type="text" name="businessName" placeholder="Business Name" required value={formData.businessName} onChange={handleInputChange} className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#FFD700]" />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700]" />
                      <input type="text" name="gst" placeholder="GST Number (Optional)" value={formData.gst} onChange={handleInputChange} className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#FFD700]" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 mb-2 uppercase font-bold tracking-widest">Service Offerings</p>
                      <div className="flex flex-wrap gap-2">
                        {['Repair', 'Rental', 'Calibration', 'Cleaning'].map(svc => (
                          <button type="button" key={svc} onClick={() => handleServiceToggle(svc)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${formData.serviceTypes.includes(svc) ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-[#111111]/80 text-gray-400 border-white/[0.08] hover:border-white/30'}`}>
                            {formData.serviceTypes.includes(svc) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}{svc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {selectedRole === 'creator' && (
                  <>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#FFD700]" />
                      <input type="text" name="handle" placeholder="Social Handle (@)" required value={formData.handle} onChange={handleInputChange} className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:ring-1 focus:ring-[#FFD700]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select name="platform" required value={formData.platform} onChange={handleInputChange} aria-label="Primary Platform" title="Primary Platform" className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 px-4 text-white text-sm outline-none appearance-none cursor-pointer">
                        <option value="" disabled>Platform</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Both">Both</option>
                        <option value="Other">Other</option>
                      </select>
                      <select name="followers" required value={formData.followers} onChange={handleInputChange} aria-label="Followers" title="Followers" className="w-full bg-black/60 border border-white/[0.08] focus:border-[#FFD700] rounded-xl py-4 px-4 text-white text-sm outline-none appearance-none cursor-pointer">
                        <option value="" disabled>Followers</option>
                        <option value="0-10k">0 - 10k</option>
                        <option value="10k-50k">10k - 50k</option>
                        <option value="50k-100k">50k - 100k</option>
                        <option value="100k+">100k+</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* TERMS AGREEMENT */}
              <label className="flex items-start gap-3 mt-4 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-white/[0.08] group-hover:border-[#FFD700] transition-colors">
                  <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} className="opacity-0 absolute inset-0 cursor-pointer" />
                  {formData.agreeTerms && <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD700]" />}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  By signing up, you agree to NIRA6&apos;s <Link href="/terms" className="text-white hover:text-[#FFD700] underline font-medium">Terms of Service</Link>, <Link href="/privacy" className="text-white hover:text-[#FFD700] underline font-medium">Privacy Policy</Link>, and the {currentRoleLabel} Agreement.
                </p>
              </label>
            </>
          )}

          {error && (
            <div className={`p-3 rounded-lg text-xs font-bold flex items-start gap-2 ${error.includes('Too many') ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error} {lockoutTimer > 0 && `(${lockoutTimer}s)`}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || lockoutTimer > 0}
            className="w-full bg-[#FFD700] hover:bg-[#FFDA03] text-black py-4 rounded-xl font-bold tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-8 shadow-[0_0_25px_rgba(255,215,0,0.2)] hover:shadow-[0_0_35px_rgba(255,215,0,0.4)] cursor-pointer text-xs uppercase"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {mode === 'login' && otpLogin && !otpSent ? 'SEND OTP PROTOCOL' : 'ENTER VAULT PORTAL'}
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
          <div className="text-[8px] text-gray-600">
            Protected by reCAPTCHA v3. Privacy Policy & Terms apply.
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStep2FA = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 text-center max-w-sm mx-auto"
    >
      <div className="w-16 h-16 bg-[#111111]/80 border border-white/[0.08] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
        <Shield className="w-8 h-8 text-[#FFD700]" />
      </div>
      <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">SECURE YOUR VAULT</h2>
      <p className="text-gray-400 text-sm leading-relaxed">
        Enable 2-Step Verification to establish enterprise-grade security for your {selectedRole} account.
      </p>

      <div className="space-y-3 pt-6">
        <button onClick={() => setStep('success')} className="w-full bg-[#111111]/80 border border-white/[0.08] hover:border-[#FFD700] text-white py-4 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
          <Phone className="w-4 h-4 text-[#FFD700]" />
          Setup SMS OTP
        </button>
        <button onClick={() => setStep('success')} className="w-full bg-[#111111]/80 border border-white/[0.08] hover:border-[#FFD700] text-white py-4 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
          <ShieldAlert className="w-4 h-4 text-[#FFD700]" />
          Authenticator App
        </button>
      </div>

      <button onClick={handleRedirect} className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest mt-6 transition-colors cursor-pointer bg-transparent border-none">
        Skip security setup
      </button>
    </motion.div>
  );

  const renderStepSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">VAULT OPENED</h2>
      <p className="text-gray-400 text-sm leading-relaxed">{successMsg || "Authentication protocol completed successfully."}</p>
      
      {mode === 'signup' ? (
        <button 
          onClick={() => { 
            setStep('form'); 
            setMode('login'); 
            setError(''); 
            setSuccessMsg(''); 
          }} 
          className="bg-[#FFD700] hover:bg-[#FFDA03] text-black px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors mt-4 cursor-pointer"
        >
          Go to Sign in
        </button>
      ) : (
        <button onClick={handleRedirect} className="bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors mt-4 cursor-pointer">
          Enter Platform
        </button>
      )}
    </motion.div>
  );

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
              Enterprise Recommerce Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white leading-[1.15] tracking-tight">
              Liquidize, Secure, and Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#FFD700]">Creative Assets</span>.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              India&apos;s luxury creative ecosystem offering authenticated recommerce, high-end gear rentals, certified technicians, and brand-matching pipelines.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.06] backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Trade Volume</p>
              <p className="text-2xl font-heading font-extrabold text-white mt-1">₹15Cr+</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.06] backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-l-[#FFD700]/30">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Verified Network</p>
              <p className="text-2xl font-heading font-extrabold text-[#FFD700] mt-1">12k+</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.06] backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Gear Rentals</p>
              <p className="text-2xl font-heading font-extrabold text-white mt-1">1.5L+</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.06] backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Trust Rating</p>
              <p className="text-2xl font-heading font-extrabold text-green-500 mt-1">99.9%</p>
            </div>
          </div>

          {/* Visual Showcase (Laptops/Desktops only) */}
          <div className="hidden lg:block pt-6 border-t border-white/[0.06] space-y-4">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Assets & Creators</p>
            <div className="grid grid-cols-2 gap-4">
              {/* Creator Card */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD700] to-yellow-500 flex items-center justify-center font-bold text-black text-xs">
                  RS
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                    Rohan S. <CheckCircle2 className="w-3 h-3 text-[#FFD700] shrink-0" />
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">DP • Mumbai</p>
                </div>
              </div>

              {/* Gear Card */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-[#FFD700]">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">RED Raptor 8K</p>
                  <p className="text-[10px] text-[#FFD700] font-semibold">₹12,500/day</p>
                </div>
              </div>
            </div>
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
            <span>Certified Tech Audits</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - DYNAMIC PROGRESSIVE FORM */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-20 relative z-10 overflow-y-auto no-scrollbar min-h-screen">
        <div className="w-full max-w-xl bg-[#0d0d0d]/85 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 sm:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative glow-hover">
          
          {/* Stepper Header */}
          <div className="flex justify-between items-center mb-8 border-b border-white/[0.06] pb-5">
            {STEPS_LIST.map((s, idx) => {
              const currentStepIdx = STEPS_LIST.findIndex(st => st.id === step);
              const isActive = step === s.id;
              const isPassed = idx < currentStepIdx;

              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isActive 
                      ? 'bg-[#FFD700] text-black shadow-[0_0_12px_rgba(255,215,0,0.4)]' 
                      : isPassed 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/[0.04] text-gray-600 border border-white/[0.06]'
                  }`}>
                    {isPassed ? '✓' : s.num}
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider uppercase hidden sm:inline transition-colors ${
                    isActive ? 'text-[#FFD700]' : isPassed ? 'text-green-400' : 'text-gray-600'
                  }`}>
                    {s.label}
                  </span>
                  {idx < STEPS_LIST.length - 1 && (
                    <div className="w-4 h-[1px] bg-white/[0.06] hidden sm:block ml-2"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Step Display */}
          <AnimatePresence mode="wait">
            {step === 'role' && <div key="role">{renderStepRole()}</div>}
            {step === 'method' && <div key="method">{renderStepMethod()}</div>}
            {step === 'form' && <div key="form">{renderStepForm()}</div>}
            {step === '2fa' && <div key="2fa">{renderStep2FA()}</div>}
            {step === 'success' && <div key="success">{renderStepSuccess()}</div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
