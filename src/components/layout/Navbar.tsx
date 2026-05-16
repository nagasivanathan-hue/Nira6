'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectCartCount } from '@/store/cartSlice';
import { toggleMobileMenu, closeMobileMenu, toggleSearch, setSearchQuery } from '@/store/uiSlice';
import { NAV_LINKS } from '@/lib/constants';
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const { mobileMenuOpen, searchOpen, searchQuery } = useAppSelector((s) => s.ui);
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > 100 && y > lastY);
      setLastY(y);
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, [lastY]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled ? 'glass shadow-lg' : 'bg-white'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group" onClick={() => dispatch(closeMobileMenu())}>
              <div className="w-10 h-10 bg-nira-yellow rounded-xl flex items-center justify-center font-heading font-black text-nira-dark text-lg group-hover:scale-110 transition-transform">
                N6
              </div>
              <span className="font-heading font-bold text-xl hidden sm:block">NIRA6</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-nira-text-secondary hover:text-nira-dark hover:bg-nira-gray rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary group-focus-within:text-nira-yellow transition-colors" />
                <input
                  type="text"
                  placeholder="Search cameras, lenses, drones..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      router.push('/buy');
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-nira-gray rounded-xl text-sm border border-transparent focus:border-nira-yellow focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-2">
              <button onClick={() => dispatch(toggleSearch())} className="md:hidden p-2 hover:bg-nira-gray rounded-lg transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/dashboard" className="p-2 hover:bg-nira-gray rounded-lg transition-colors hidden sm:flex" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative p-2 hover:bg-nira-gray rounded-lg transition-colors" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-nira-yellow text-nira-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-nira-dark text-white text-sm font-medium rounded-xl hover:bg-nira-dark/90 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user?.name?.split(' ')[0] || 'Dashboard'}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-nira-dark text-white text-sm font-medium rounded-xl hover:bg-nira-dark/90 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              )}
              <button onClick={() => dispatch(toggleMobileMenu())} className="lg:hidden p-2 hover:bg-nira-gray rounded-lg transition-colors" aria-label="Menu">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-nira-gray-dark overflow-hidden"
            >
              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search cameras, lenses, drones..."
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        dispatch(toggleSearch());
                        router.push('/buy');
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => dispatch(closeMobileMenu())}
          >
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => dispatch(closeMobileMenu())}
                    className="px-4 py-3 text-base font-medium hover:bg-nira-gray rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-4 border-nira-gray-dark" />
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-nira-dark text-white font-medium rounded-xl"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-nira-dark text-white font-medium rounded-xl"
                  >
                    <User className="w-4 h-4" />
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
