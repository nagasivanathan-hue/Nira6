'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import DesktopSidebar from './DesktopSidebar';

export default function ResponsiveNav() {
  const pathname = usePathname();

  // Hide global navigation on auth pages or fullscreen specific pages
  const hidePaths = ['/auth/login', '/auth/signup', '/auth/forgot-password'];
  if (hidePaths.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <>
      {/* Mobile & Tablet: Top Bar (<1024px) */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      {/* Desktop: Sidebar (>=1024px) */}
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>

      {/* Mobile: Bottom Tabs (<768px) */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}
