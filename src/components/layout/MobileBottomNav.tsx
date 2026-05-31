'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Sparkles, Film, Briefcase, User } from 'lucide-react';
import { useAppSelector } from '@/store';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // If we are in an auth page or inside a dynamic view where we want full canvas, we can hide it.
  // But generally, having it on standard client pages is premium.
  const hidePaths = ['/auth', '/auth/login', '/auth/signup', '/auth/forgot-password'];
  if (hidePaths.includes(pathname || '')) {
    return null;
  }

  const navItems: { label: string; icon: React.ComponentType<{ className?: string }>; href: string; badge?: number }[] = [
    {
      label: 'Home',
      icon: Home,
      href: '/'
    },
    {
      label: 'Studio',
      icon: Sparkles,
      href: '/studio'
    },
    {
      label: 'Reels',
      icon: Film,
      href: '/creators/reels'
    },
    {
      label: 'Services',
      icon: Briefcase,
      href: '/services'
    },
    {
      label: 'Account',
      icon: User,
      href: isAuthenticated ? '/dashboard' : '/auth'
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-t border-gray-150 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-safe-bottom transition-all">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center relative py-1 text-center cursor-pointer select-none group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <motion.div
                whileTap={{ scale: 0.88 }}
                className={`relative p-1 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'text-nira-dark font-black' : 'text-nira-text-secondary hover:text-nira-dark'
                }`}
              >
                <Icon className={`w-5.5 h-5.5 transition-transform duration-200 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[2px]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-nira-yellow text-nira-dark font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm border border-white">
                    {item.badge}
                  </span>
                )}
              </motion.div>

              <span className={`text-[9px] mt-0.5 tracking-wide font-medium transition-all ${
                isActive ? 'text-nira-dark font-bold' : 'text-nira-text-secondary'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="bottomNavTab"
                  className="absolute bottom-0 w-1.5 h-1.5 bg-nira-yellow rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
