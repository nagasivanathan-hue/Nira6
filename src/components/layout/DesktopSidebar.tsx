'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, ShoppingBag, MessageSquare, User, Bell, LogOut, Package, Wrench, Video } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/authSlice';


export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const mainLinks = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Marketplace', icon: ShoppingBag, href: '/buy' },
    { label: 'Reels', icon: Video, href: '/creators/reels' },
    { label: 'Rentals', icon: Package, href: '/rent' },
    { label: 'Services', icon: Wrench, href: '/services' },
    { label: 'Discover', icon: Compass, href: '/creators/discover' },
  ];

  const userLinks = [
    { label: 'Messages', icon: MessageSquare, href: '/creators/chat', badge: 2 },
    { label: 'Notifications', icon: Bell, href: '/notifications', badge: 5 },
    { label: 'Dashboard', icon: User, href: '/dashboard' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen bg-gray-50 border-r border-gray-100 z-50 flex flex-col transition-all duration-300 w-[64px] hover:w-[240px] lg:w-[64px] lg:hover:w-[240px] xl:w-[240px] group">
      
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 overflow-hidden whitespace-nowrap">
        <Link href="/" className="flex items-center w-full">
          {/* Collapsed state: Favicon */}
          <div className="xl:hidden group-hover:hidden shrink-0 flex items-center justify-center w-8">
            <span className="font-heading text-xl text-nira-dark">N<span className="text-nira-yellow">6</span></span>
          </div>
          {/* Expanded state: Sticky Nav */}
          <div className="hidden xl:block group-hover:block shrink-0">
            <span className="font-heading text-2xl text-nira-dark tracking-wide">NIRA<span className="text-nira-yellow">6</span></span>
          </div>
        </Link>
      </div>

      {/* Main Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {mainLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center h-12 px-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap relative ${
                isActive ? 'bg-[#1E1E1E] text-nira-yellow' : 'text-[#777777] hover:bg-white hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 xl:opacity-100 transition-opacity text-sm">
                {link.label}
              </span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-[#1E1E1E] my-4 mx-2" />

        {/* User Actions */}
        {isAuthenticated && userLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center h-12 px-3 rounded-lg transition-colors overflow-hidden whitespace-nowrap relative ${
                isActive ? 'bg-[#1E1E1E] text-nira-yellow' : 'text-[#777777] hover:bg-white hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 xl:opacity-100 transition-opacity text-sm">
                {link.label}
              </span>
              {link.badge && (
                <span className="absolute right-3 bg-nira-yellow text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 xl:opacity-100 transition-opacity">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-2 border-t border-gray-100">
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="flex items-center w-full h-12 px-3 rounded-lg text-[#777777] hover:bg-white hover:text-red-400 transition-colors overflow-hidden whitespace-nowrap"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 xl:opacity-100 transition-opacity text-sm">
              Sign Out
            </span>
          </button>
        ) : (
          <Link href="/auth/login" className="flex items-center w-full h-12 px-3 rounded-lg text-nira-yellow bg-[#1E1E1E] hover:bg-nira-yellow hover:text-white transition-colors overflow-hidden whitespace-nowrap">
            <User className="w-5 h-5 shrink-0" />
            <span className="ml-4 font-bold opacity-0 group-hover:opacity-100 xl:opacity-100 transition-opacity text-sm">
              Sign In
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
