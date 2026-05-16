'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { register, clearError } from '@/store/authSlice';

export default function SignupPage() {
  const [name, setName] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register({ name, email, password }));
  };

  return (
    <div className="min-h-screen bg-nira-gray flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-nira-yellow rounded-2xl flex items-center justify-center font-heading font-black text-nira-dark text-xl mx-auto mb-4">N6</div>
          <h1 className="font-heading font-bold text-2xl">Create Account</h1>
          <p className="text-nira-text-secondary text-sm">Join India&apos;s largest creator ecosystem</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-nira-error/10 border border-nira-error/20 rounded-xl flex items-center gap-3 text-nira-error text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nira-text-secondary" />
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name" 
              className="w-full pl-12 pr-4 py-3.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow transition-all"
            />
          </div>
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

          <div className="flex items-start gap-3 py-2">
            <div className="mt-1"><ShieldCheck className="w-4 h-4 text-nira-success" /></div>
            <p className="text-[11px] text-nira-text-secondary leading-relaxed">
              By signing up, you agree to our <Link href="/terms" className="text-nira-dark underline">Terms</Link> and that you have read our <Link href="/privacy" className="text-nira-dark underline">Data Policy</Link>.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-nira-yellow text-nira-dark font-bold rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-nira-text-secondary">
          Already have an account? <Link href="/auth/login" className="text-nira-yellow font-bold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
