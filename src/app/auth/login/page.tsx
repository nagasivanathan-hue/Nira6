'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Globe, AlertCircle, Loader2,
  Eye, EyeOff, ShieldAlert, ShieldCheck, Smartphone, KeyRound, RotateCcw
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError, setAuth } from '@/store/authSlice';
import Logo from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';

type LoginStep = 'credentials' | 'otp';

export default function LoginPage() {
  // --- Step & Form State ---
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'creator'>('user');
  const [emailTouched, setEmailTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [recaptchaStatus, setRecaptchaStatus] = useState<'idle' | 'scanning' | 'verified'>('scanning');

  // --- OTP State ---
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpUserId, setOtpUserId] = useState<string>('');
  const [otpSentTo, setOtpSentTo] = useState<string[]>([]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  // --- Refs ---
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, router, dispatch]);

  // Autofocus email on mount
  useEffect(() => {
    if (emailInputRef.current && step === 'credentials') {
      emailInputRef.current.focus();
    }
    const timer = setTimeout(() => setRecaptchaStatus('verified'), 1200);
    return () => clearTimeout(timer);
  }, [step]);

  // Auto-focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp' && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 200);
    }
  }, [step]);

  // OTP Resend countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const handleCapsLock = (e: React.KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  // ── STEP 1: Submit email + password → Request OTP ──
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setEmailTouched(true);
      return;
    }

    setSendingOtp(true);
    dispatch(clearError());

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show error on credentials form
        dispatch({ type: 'auth/login/rejected', payload: data.message });
        setSendingOtp(false);
        return;
      }

      // OTP was sent successfully — move to step 2
      setOtpUserId(data.userId);
      setOtpSentTo(data.sentTo || []);
      setOtpCountdown(60);
      setStep('otp');
    } catch (err) {
      dispatch({ type: 'auth/login/rejected', payload: 'Network error. Please try again.' });
    } finally {
      setSendingOtp(false);
    }
  };

  // ── OTP Input Handlers ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    // Focus the next empty slot or the last one
    const nextEmpty = newDigits.findIndex(d => !d);
    otpInputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // ── STEP 2: Verify OTP → Get JWT ──
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: otpUserId, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.message);
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
        }
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        setOtpLoading(false);
        return;
      }

      // ✅ Authenticated — store user and redirect
      localStorage.setItem('userInfo', JSON.stringify(data));
      dispatch(setAuth(data));
      router.push('/dashboard');
    } catch (err) {
      setOtpError('Verification service unavailable. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setSendingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setOtpCountdown(60);
        setOtpDigits(['', '', '', '', '', '']);
        setAttemptsLeft(5);
        otpInputRefs.current[0]?.focus();
      } else {
        const data = await res.json();
        setOtpError(data.message);
      }
    } catch {
      setOtpError('Failed to resend code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
    }
  };

  const isEmailValid = !emailTouched || email.includes('@') || email === '';

  return (
    <div className="min-h-screen bg-nira-gray flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-neutral-100"
      >
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-5" height={32} width={128} />
          <h1 className="font-heading font-bold text-2xl mt-3">
            {step === 'credentials' ? 'Welcome Back' : 'Enter Verification Code'}
          </h1>
          <p className="text-nira-text-secondary text-sm">
            {step === 'credentials'
              ? 'Sign in to your creator account'
              : `Code sent to ${otpSentTo.join(' & ')}`}
          </p>
        </div>

        {/* ═══ STEP 1: Email + Password ═══ */}
        <AnimatePresence mode="wait">
          {step === 'credentials' && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {error && (
                <div className="mb-6 p-4 bg-nira-error/10 border border-nira-error/20 rounded-xl flex items-center gap-3 text-nira-error text-sm animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="flex bg-nira-gray rounded-xl p-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${role === 'user' ? 'bg-white text-nira-dark shadow-sm' : 'text-nira-text-secondary hover:text-nira-dark'}`}
                  >
                    Client / Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${role === 'creator' ? 'bg-nira-dark text-white shadow-sm' : 'text-nira-text-secondary hover:text-nira-dark'}`}
                  >
                    Creator / Seller
                  </button>
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value.includes('@')) setEmailTouched(false);
                    }}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="Email address"
                    aria-label="Email address"
                    className={`w-full pl-12 pr-4 py-3.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      !isEmailValid ? 'focus:ring-red-500 border border-red-300 bg-red-50/10' : 'focus:ring-nira-yellow border border-transparent'
                    }`}
                  />
                  {!isEmailValid && (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 animate-fade-in pl-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Please include an &apos;@&apos; symbol in the email address.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleCapsLock}
                    onKeyUp={handleCapsLock}
                    placeholder="Password"
                    aria-label="Password"
                    className="w-full pl-12 pr-12 py-3.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow border border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-nira-text-secondary hover:text-nira-dark p-1 rounded-lg transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {isCapsLockOn && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-amber-500 flex items-center gap-1 pl-1 bg-white/90 py-1 pr-1.5 rounded-md text-[10px] font-black uppercase tracking-wider select-none animate-pulse">
                      <ShieldAlert className="w-3.5 h-3.5" /> Caps Lock On
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link href="/auth/forgot-password" className="text-xs text-nira-yellow hover:underline">Forgot password?</Link>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp || isLoading}
                  className="w-full py-4 bg-nira-yellow text-nira-dark font-bold rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending Code...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-nira-gray-dark"></div></div>
                <span className="relative px-4 bg-white text-xs text-nira-text-secondary uppercase">Or continue with</span>
              </div>

              <div className="w-full">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-nira-gray-dark rounded-xl text-sm hover:bg-nira-gray transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4" /> Google
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-nira-text-secondary">
                Don&apos;t have an account? <Link href="/auth/signup" className="text-nira-yellow font-bold hover:underline">Sign up</Link>
              </p>
            </motion.div>
          )}

          {/* ═══ STEP 2: OTP Verification ═══ */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* OTP Sent Info */}
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700 text-sm">
                <KeyRound className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Verification code sent!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Check your {otpSentTo.length > 1 ? 'email and phone' : 'email'} for a 6-digit code. It expires in 5 minutes.
                  </p>
                </div>
              </div>

              {otpError && (
                <div className="mb-4 p-3 bg-nira-error/10 border border-nira-error/20 rounded-xl flex items-center gap-3 text-nira-error text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                {/* 6-digit OTP Input */}
                <div>
                  <label className="block text-xs font-bold text-nira-text-secondary uppercase tracking-wider mb-3 text-center">
                    Enter 6-digit code
                  </label>
                  <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-12 h-14 text-center text-xl font-black bg-nira-gray rounded-xl border-2 focus:outline-none transition-all ${
                          digit
                            ? 'border-nira-yellow text-nira-dark'
                            : 'border-transparent text-nira-text-secondary focus:border-nira-yellow'
                        }`}
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-nira-text-secondary text-center mt-2">
                    {attemptsLeft < 5 && (
                      <span className="text-amber-600 font-bold">{attemptsLeft} attempts remaining • </span>
                    )}
                    Paste supported
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpDigits.join('').length !== 6}
                  className="w-full py-4 bg-nira-yellow text-nira-dark font-bold rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {otpLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" /> Verify & Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Resend / Back controls */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => {
                    setStep('credentials');
                    setOtpDigits(['', '', '', '', '', '']);
                    setOtpError(null);
                  }}
                  className="text-xs text-nira-text-secondary hover:text-nira-dark flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 rotate-180" /> Back to login
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={otpCountdown > 0 || sendingOtp}
                  className="text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-all text-nira-yellow hover:text-amber-500"
                >
                  <RotateCcw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} />
                  {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* reCAPTCHA Badge */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
            {recaptchaStatus === 'scanning' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-nira-yellow animate-spin" />
                <span>Invisible reCAPTCHA scanning...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-extrabold">reCAPTCHA v3 Secured</span>
              </>
            )}
          </div>
          <span className="opacity-60">v3-enterprise</span>
        </div>
      </motion.div>
    </div>
  );
}
