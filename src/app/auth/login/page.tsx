'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, Package, Wrench, Video, ArrowRight, ArrowLeft, 
  Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, 
  ShieldCheck, ShieldAlert, Loader2, KeyRound, User, Phone, MapPin, Building, Play, Plus, Hash
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { setKeepLoggedIn } from '@/store/authSlice';

type Role = 'buyer' | 'seller' | 'service_pro' | 'creator' | 'rental';
type Step = 'role' | 'method' | 'form' | '2fa' | 'success';

const ROLES = [
  { id: 'buyer', label: 'Buyer', desc: 'I want to buy gear', icon: ShoppingCart },
  { id: 'seller', label: 'Seller', desc: 'I want to sell my gear', icon: Package },
  { id: 'service_pro', label: 'Service Pro', desc: 'I offer repair services', icon: Wrench },
  { id: 'creator', label: 'Creator', desc: 'I create content / reviews', icon: Video },
  { id: 'rental', label: 'Rental House', desc: 'I rent out my gear', icon: Package },
] as const;

export default function NIRA6AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  // Navigation State
  const [step, setStep] = useState<Step>('role');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [selectedRole, setSelectedRole] = useState<Role>('buyer');

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
    return { label: 'Fortress', color: 'bg-[#FFDA03] text-[#FFDA03]' };
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
    setError(''); // Clear error on typing
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(service)
        ? prev.serviceTypes.filter(s => s !== service)
        : [...prev.serviceTypes, service]
    }));
  };

  // ─── AUTHENTICATION HANDLERS ───

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    
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
      const { data, error: signUpError } = await supabase.auth.signUp({
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

      // If successful, show "Check your inbox"
      setSuccessMsg("Check your inbox to verify your email.");
      setStep('success');

    } else {
      // Login Mode
      if (otpLogin) {
        if (!otpSent) {
          // Send OTP logic
          setOtpSent(true);
          setSuccessMsg(`OTP sent to ${formData.email}`);
          setLoading(false);
          return;
        } else {
          // Verify OTP logic
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

      // Save "keep me logged in" preference before authentication
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
          role: selectedRole, // The user selected this role on login page, though normally we'd pull from DB. We'll update it here based on their selection.
        });
      }

      // Success! Move to 2FA prompt
      setStep('2fa');
    }
    setLoading(false);
  };

  const handleGoogleOAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { role: selectedRole }
      }
    });
    if (error) setError("Google sign-in failed. Try email instead.");
  };

  const handleRedirect = () => {
    switch (selectedRole) {
      case 'seller': router.push('/dashboard'); break;
      case 'service_pro': router.push('/dashboard'); break;
      case 'creator': router.push('/dashboard/creator'); break;
      case 'buyer': 
      default: router.push('/buy'); break;
    }
  };

  // ─── RENDERERS ───

  const renderStepRole = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl text-white tracking-wide">CHOOSE YOUR PATH</h2>
        <p className="text-[#555555] text-sm mt-2">Select how you want to use the NIRA6 platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.id;
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => { setSelectedRole(r.id); setStep('method'); }}
              className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-300 group overflow-hidden ${
                isSelected 
                  ? 'bg-[#111111] border-[#FFDA03] shadow-[0_0_20px_rgba(255,218,3,0.15)]' 
                  : 'bg-[#111111] border-[#1E1E1E] hover:border-[#555555]'
              }`}
            >
              {isSelected && <div className="absolute inset-0 bg-[#FFDA03]/5 opacity-50" />}
              <Icon className={`w-12 h-12 mb-4 transition-colors ${isSelected ? 'text-[#FFDA03]' : 'text-[#555555] group-hover:text-white'}`} />
              <h3 className={`font-heading text-2xl tracking-wider transition-colors ${isSelected ? 'text-white' : 'text-[#888888]'}`}>{r.label}</h3>
              <p className={`text-xs mt-1 transition-colors ${isSelected ? 'text-[#AAAAAA]' : 'text-[#555555]'}`}>{r.desc}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStepMethod = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <button onClick={() => setStep('role')} className="text-[#555555] hover:text-white flex items-center gap-2 text-xs mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to roles
      </button>

      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl text-white tracking-wide">ENTER THE VAULT</h2>
        <p className="text-[#555555] text-sm mt-2">Continue as a {ROLES.find(r => r.id === selectedRole)?.label}</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        <button
          onClick={handleGoogleOAuth}
          className="w-full bg-white hover:bg-gray-100 text-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all hover:shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 py-4">
          <div className="h-px bg-[#1E1E1E] flex-1"></div>
          <span className="text-[#555555] text-xs font-bold uppercase tracking-widest">OR</span>
          <div className="h-px bg-[#1E1E1E] flex-1"></div>
        </div>

        <button
          onClick={() => { setMode('signup'); setStep('form'); }}
          className="w-full bg-[#111111] hover:bg-[#1E1E1E] border border-[#1E1E1E] hover:border-[#FFDA03] text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all"
        >
          <Mail className="w-5 h-5 text-[#FFDA03]" />
          Continue with Email
        </button>
      </div>
    </motion.div>
  );

  const renderStepForm = () => {
    const strength = getPwdStrength();

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
        className="space-y-6 w-full max-w-md mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStep('method')} className="text-[#555555] hover:text-white flex items-center gap-2 text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex bg-[#111111] p-1 rounded-lg border border-[#1E1E1E]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === 'login' ? 'bg-[#1E1E1E] text-white' : 'text-[#555555] hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${mode === 'signup' ? 'bg-[#1E1E1E] text-white' : 'text-[#555555] hover:text-white'}`}
            >
              Signup
            </button>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5">
          
          {/* LOGIN/SIGNUP SHARED FIELDS */}
          {mode === 'signup' && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03] transition-colors" />
              <input
                type="text" name="name" placeholder="Full Name" required
                value={formData.name} onChange={handleInputChange}
                className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none transition-all focus:shadow-[0_0_15px_rgba(255,218,3,0.1)] peer"
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03] transition-colors" />
            <input
              type="text" name="email" placeholder={mode === 'signup' ? "Email Address" : "Email or Phone Number"} required
              value={formData.email} onChange={handleInputChange}
              className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none transition-all focus:shadow-[0_0_15px_rgba(255,218,3,0.1)]"
            />
            {mode === 'signup' && formData.email.includes('@') && (
              <p className="absolute -bottom-5 left-2 text-[10px] text-[#555555] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Verification email will be sent
              </p>
            )}
          </div>

          {mode === 'login' && !otpLogin && (
            <div className="relative group mt-6">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03] transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" required
                value={formData.password} onChange={handleInputChange}
                className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-12 text-white text-sm outline-none transition-all focus:shadow-[0_0_15px_rgba(255,218,3,0.1)]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-white">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {mode === 'login' && otpLogin && otpSent && (
            <div className="relative group mt-6">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03] transition-colors" />
              <input
                type="text" name="otp" placeholder="Enter 6-digit OTP" required
                value={otp} onChange={(e) => { setOtp(e.target.value); setError(''); }}
                maxLength={6}
                className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none transition-all focus:shadow-[0_0_15px_rgba(255,218,3,0.1)]"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-between items-center mt-2">
              <button 
                type="button" 
                onClick={() => { setOtpLogin(!otpLogin); setOtpSent(false); setError(''); }} 
                className="text-xs text-[#FFDA03] hover:underline"
              >
                {otpLogin ? 'Use Password instead' : 'Login via OTP (Phone/Email)'}
              </button>
              {!otpLogin && (
                <Link href="#" className="text-xs text-[#555555] hover:text-[#FFDA03] transition-colors">Forgot password?</Link>
              )}
            </div>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-3 mt-4 cursor-pointer group select-none">
              <div className="relative flex items-center justify-center w-5 h-5 rounded border border-[#1E1E1E] group-hover:border-[#FFDA03] transition-colors">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedInState(e.target.checked)}
                  className="opacity-0 absolute inset-0 cursor-pointer"
                />
                {keepLoggedIn && <CheckCircle2 className="w-3 h-3 text-[#FFDA03]" />}
              </div>
              <span className="text-xs text-[#888888] group-hover:text-white transition-colors">
                Keep me logged in for 7 days
              </span>
            </label>
          )}

          {mode === 'signup' && (
            <>
              <div className="relative group mt-6">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" required
                  value={formData.password} onChange={handleInputChange}
                  className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-12 text-white text-sm outline-none transition-all focus:shadow-[0_0_15px_rgba(255,218,3,0.1)]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555555] hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* PASSWORD STRENGTH */}
              <div className="pt-2 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#555555]">Password Strength</span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${strength.color.split(' ')[1]}`}>{strength.label}</span>
                </div>
                <div className="flex gap-1 h-1.5 mb-3">
                  {[1,2,3,4].map(n => (
                    <div key={n} className={`flex-1 rounded-full ${n <= pwdScore ? strength.color.split(' ')[0] : 'bg-[#1E1E1E]'} transition-colors duration-300`} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#555555]">
                  <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> 8+ characters</span>
                  <span className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> Uppercase</span>
                  <span className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> Number</span>
                  <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : ''}`}><CheckCircle2 className="w-3 h-3"/> Special char</span>
                </div>
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm Password" required
                  value={formData.confirmPassword} onChange={handleInputChange}
                  className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-12 text-white text-sm outline-none transition-all focus:shadow-[0_0_15px_rgba(255,218,3,0.1)]"
                />
              </div>

              {/* DYNAMIC ROLE FIELDS */}
              <div className="pt-4 border-t border-[#1E1E1E] space-y-4">
                
                {/* SELLER & SERVICE PRO SHARED */}
                {(selectedRole === 'seller' || selectedRole === 'service_pro') && (
                  <>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03]" />
                      <input type="tel" name="phone" placeholder="Phone (+91)" required value={formData.phone} onChange={handleInputChange} className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none" />
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03]" />
                      <select name="city" required value={formData.city} onChange={handleInputChange} aria-label="Select City" title="Select City" className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none appearance-none">
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

                {/* SERVICE PRO SPECIFIC */}
                {selectedRole === 'service_pro' && (
                  <>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03]" />
                      <input type="text" name="businessName" placeholder="Business Name" required value={formData.businessName} onChange={handleInputChange} className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none" />
                    </div>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03]" />
                      <input type="text" name="gst" placeholder="GST Number (Optional)" value={formData.gst} onChange={handleInputChange} className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <p className="text-xs text-[#555555] mb-2 uppercase font-bold tracking-widest">Service Types</p>
                      <div className="flex flex-wrap gap-2">
                        {['Repair', 'Rental', 'Calibration', 'Cleaning'].map(svc => (
                          <button type="button" key={svc} onClick={() => handleServiceToggle(svc)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${formData.serviceTypes.includes(svc) ? 'bg-[#FFDA03] text-[#0A0A0A] border-[#FFDA03]' : 'bg-[#111111] text-[#555555] border-[#1E1E1E] hover:border-[#555555]'}`}>
                            {formData.serviceTypes.includes(svc) && <CheckCircle2 className="w-3 h-3 inline mr-1" />}{svc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* CREATOR SPECIFIC */}
                {selectedRole === 'creator' && (
                  <>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#FFDA03]" />
                      <input type="text" name="handle" placeholder="Social Handle (@)" required value={formData.handle} onChange={handleInputChange} className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 pl-12 pr-4 text-white text-sm outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select name="platform" required value={formData.platform} onChange={handleInputChange} aria-label="Primary Platform" title="Primary Platform" className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 px-4 text-white text-sm outline-none appearance-none">
                        <option value="" disabled>Primary Platform</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Both">Both</option>
                        <option value="Other">Other</option>
                      </select>
                      <select name="followers" required value={formData.followers} onChange={handleInputChange} aria-label="Followers" title="Followers" className="w-full bg-[#111111] border border-[#1E1E1E] focus:border-[#FFDA03] rounded-xl py-3.5 px-4 text-white text-sm outline-none appearance-none">
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
              <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-[#1E1E1E] group-hover:border-[#FFDA03] transition-colors">
                  <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} className="opacity-0 absolute inset-0 cursor-pointer" />
                  {formData.agreeTerms && <CheckCircle2 className="w-3 h-3 text-[#FFDA03]" />}
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  By creating an account, you agree to NIRA6's <Link href="/terms" className="text-white hover:text-[#FFDA03] underline">Terms of Service</Link>, <Link href="/privacy" className="text-white hover:text-[#FFDA03] underline">Privacy Policy</Link>, and the {ROLES.find(r=>r.id===selectedRole)?.label} Agreement.
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
            className="w-full bg-[#FFDA03] hover:bg-yellow-400 text-[#0A0A0A] py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-8 shadow-[0_0_20px_rgba(255,218,3,0.2)] hover:shadow-[0_0_30px_rgba(255,218,3,0.4)]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {mode === 'login' && otpLogin && !otpSent ? 'SEND OTP' : 'ENTER NIRA6'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="pt-8 flex flex-col items-center gap-4 border-t border-[#1E1E1E]">
          <div className="flex items-center gap-2 text-[10px] text-[#555555] uppercase tracking-widest font-bold">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            256-bit SSL Encrypted • Data never sold
          </div>
          <div className="text-[9px] text-[#333333]">
            Protected by reCAPTCHA v3. Privacy Policy & Terms apply.
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStep2FA = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6 text-center max-w-sm mx-auto"
    >
      <div className="w-16 h-16 bg-[#111111] border border-[#1E1E1E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,218,3,0.1)]">
        <KeyRound className="w-8 h-8 text-[#FFDA03]" />
      </div>
      <h2 className="font-heading text-4xl text-white tracking-wide">SECURE YOUR VAULT</h2>
      <p className="text-[#555555] text-sm leading-relaxed">
        We highly recommend enabling 2-Step Verification to protect your {selectedRole} account.
      </p>

      <div className="space-y-3 pt-6">
        <button onClick={() => setStep('success')} className="w-full bg-[#111111] border border-[#1E1E1E] hover:border-[#FFDA03] text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all">
          <Phone className="w-4 h-4 text-[#FFDA03]" />
          Setup SMS OTP
        </button>
        <button onClick={() => setStep('success')} className="w-full bg-[#111111] border border-[#1E1E1E] hover:border-[#FFDA03] text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm transition-all">
          <ShieldAlert className="w-4 h-4 text-[#FFDA03]" />
          Authenticator App
        </button>
      </div>

      <button onClick={handleRedirect} className="text-[#555555] hover:text-white text-xs font-bold uppercase tracking-widest mt-6 transition-colors">
        Skip for now
      </button>
    </motion.div>
  );

  const renderStepSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="font-heading text-4xl text-white tracking-wide">SUCCESS</h2>
      <p className="text-[#555555] text-sm">{successMsg || "Authentication successful."}</p>
      
      {mode === 'signup' ? (
        <button 
          onClick={() => { 
            setStep('form'); 
            setMode('login'); 
            setError(''); 
            setSuccessMsg(''); 
          }} 
          className="bg-[#FFDA03] hover:bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold text-sm transition-colors mt-4"
        >
          Go to Login
        </button>
      ) : (
        <button onClick={handleRedirect} className="bg-[#1E1E1E] hover:bg-white hover:text-black text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors mt-4">
          Continue to NIRA6
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row relative overflow-hidden">
      {/* GLOBAL CSS */}
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .scanline {
          position: absolute;
          top: 0; left: 0; right: 0; height: 10px;
          background: linear-gradient(to bottom, transparent, rgba(255,218,3,0.1), transparent);
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 50;
        }
        .radial-spotlight {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255,218,3,0.03) 0%, rgba(10,10,10,0) 70%);
          top: -200px;
          left: -200px;
          animation: pulseGlow 10s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }
        .gear-spin {
          animation: spin 20s linear infinite;
        }
      `}</style>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-noise z-0"></div>
      <div className="radial-spotlight z-0"></div>
      <div className="scanline z-50"></div>

      {/* LEFT PANEL - BRAND */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between relative z-10 border-b md:border-b-0 md:border-r border-[#1E1E1E] bg-[#0A0A0A]/50 backdrop-blur-sm">
        <div>
          <Link href="/" className="inline-block">
            <h1 className="font-heading text-6xl md:text-7xl tracking-widest text-white mb-2">
              NIRA<span className="text-[#FFDA03]">6</span>
            </h1>
          </Link>
          <p className="text-[#555555] font-sans tracking-wide text-sm md:text-base">The Vault for Creators</p>
        </div>

        {/* Decorative Gear animation */}
        <div className="hidden md:flex flex-1 items-center justify-center relative">
          <div className="absolute w-64 h-64 border border-[#1E1E1E] rounded-full flex items-center justify-center">
            <div className="w-48 h-48 border border-[#FFDA03]/20 rounded-full gear-spin"></div>
            <Video className="absolute w-16 h-16 text-[#FFDA03]/10" />
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-6">
          <div className="flex items-center gap-4 text-white/80">
            <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#1E1E1E] flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#FFDA03]" />
            </div>
            <div>
              <p className="font-bold text-sm">Bank-grade Encryption</p>
              <p className="text-[#555555] text-xs">Your data is secured in the vault</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/80">
            <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#1E1E1E] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#FFDA03]" />
            </div>
            <div>
              <p className="font-bold text-sm">Verified Network</p>
              <p className="text-[#555555] text-xs">Only trusted creators and sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto min-h-[60vh] md:min-h-screen no-scrollbar">
        <div className="w-full max-w-lg bg-[#111111]/90 backdrop-blur-2xl border border-[#1E1E1E] rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {step === 'role' && <motion.div key="role">{renderStepRole()}</motion.div>}
            {step === 'method' && <motion.div key="method">{renderStepMethod()}</motion.div>}
            {step === 'form' && <motion.div key="form">{renderStepForm()}</motion.div>}
            {step === '2fa' && <motion.div key="2fa">{renderStep2FA()}</motion.div>}
            {step === 'success' && <motion.div key="success">{renderStepSuccess()}</motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
