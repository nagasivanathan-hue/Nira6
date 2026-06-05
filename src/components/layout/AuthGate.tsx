'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoginPage from '@/app/auth/login/page';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import MiniCart from '@/components/cart/MiniCart';
import dynamic from 'next/dynamic';

const LiveChatWidget = dynamic(() => import('@/components/support/LiveChatWidget'));

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  // Allow accessing Auth pages, homepage, and reels feed without nesting inside AuthGate
  const isHomePage = pathname === '/';
  const isReelsPage = pathname === '/creators/reels';
  const isAboutPage = pathname === '/about';
  const isAuthPage = pathname?.startsWith('/auth/');

  if (!mounted) {
    // Render a minimal loader that looks identical on server and client to avoid hydration mismatch
    return (
      <div className="min-h-screen bg-[#0c0c10] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-nira-yellow/20 border-t-nira-yellow rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (!isAuthenticated && !isHomePage && !isReelsPage && !isAboutPage) {
    // If not authenticated, force display of the login portal directly, shielding all other content
    return <LoginPage />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <LiveChatWidget />
      <MiniCart />
    </>
  );
}
