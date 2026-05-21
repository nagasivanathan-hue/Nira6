'use client';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoginPage from '@/app/auth/login/page';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import dynamic from 'next/dynamic';

const LiveChatWidget = dynamic(() => import('@/components/support/LiveChatWidget'));

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Allow accessing Auth pages without nesting inside AuthGate
  const isAuthPage = pathname?.startsWith('/auth/');

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (!isAuthenticated) {
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
    </>
  );
}
