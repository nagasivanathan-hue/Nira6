'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, clearError } from '@/store/authSlice';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, router, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-nira-gray flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-nira-yellow rounded-2xl flex items-center justify-center font-heading font-black text-nira-dark text-xl mx-auto mb-4">N6</div>
          <h1 className="font-heading font-bold text-2xl">Welcome Back</h1>
          <p className="text-nira-text-secondary text-sm">Sign in to your creator account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-nira-error/10 border border-nira-error/20 rounded-xl flex items-center gap-3 text-nira-error text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" 
              className="w-full pl-12 pr-4 py-3.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-3.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow transition-all"
            />
          </div>
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-nira-yellow hover:underline">Forgot password?</Link>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-nira-yellow text-nira-dark font-bold rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            className="w-full flex items-center justify-center gap-2 py-3 border border-nira-gray-dark rounded-xl text-sm hover:bg-nira-gray transition-all"
          >
            <Globe className="w-4 h-4" /> Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-nira-text-secondary">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-nira-yellow font-bold hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
