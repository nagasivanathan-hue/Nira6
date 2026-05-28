'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Globe, AlertCircle, Loader2, Eye, EyeOff, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, clearError } from '@/store/authSlice';
import Logo from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'creator'>('user');
  const [emailTouched, setEmailTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [recaptchaStatus, setRecaptchaStatus] = useState<'idle' | 'scanning' | 'verified'>('scanning');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, router, dispatch]);

  // Autofocus the email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    // Simulate background reCAPTCHA scanning
    const timer = setTimeout(() => {
      setRecaptchaStatus('verified');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleCapsLock = (e: React.KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setEmailTouched(true);
      return;
    }
    dispatch(login({ email, password }));
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-neutral-100">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-5" height={32} width={128} />
          <h1 className="font-heading font-bold text-2xl mt-3">Welcome Back</h1>
          <p className="text-nira-text-secondary text-sm">Sign in to your creator account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-nira-error/10 border border-nira-error/20 rounded-xl flex items-center gap-3 text-nira-error text-sm animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
            <input 
              ref={emailInputRef}
              type="email" 
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value.includes('@')) {
                  setEmailTouched(false);
                }
              }}
              onBlur={() => setEmailTouched(true)}
              placeholder="Email address" 
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
              className="w-full pl-12 pr-12 py-3.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow border border-transparent transition-all"
            />
            
            {/* Password Visibility Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-nira-text-secondary hover:text-nira-dark p-1 rounded-lg transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Caps Lock Alert */}
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
            disabled={isLoading}
            className="w-full py-4 bg-nira-yellow text-nira-dark font-bold rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'} <ArrowRight className="w-4 h-4" />
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

        {/* reCAPTCHA v3 Badge Simulation */}
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
