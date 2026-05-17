'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectCartCount } from '@/store/cartSlice';
import { toggleMobileMenu, closeMobileMenu, toggleSearch, setSearchQuery } from '@/store/uiSlice';
import { NAV_LINKS } from '@/lib/constants';
import { Search, ShoppingCart, User, Menu, X, Heart, Bell, MessageSquare, Mail, Smartphone, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NiraNotification {
  id: string;
  type: 'push' | 'sms' | 'email';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const { mobileMenuOpen, searchOpen, searchQuery } = useAppSelector((s) => s.ui);
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  // Simulated notifications terminal log
  const [notifications, setNotifications] = useState<NiraNotification[]>([
    {
      id: 'n1',
      type: 'push',
      title: '🌟 Welcome to NIRA6 Platform!',
      content: 'Complete your profile setup to receive full creator features + a free ₹500 starting wallet bonus.',
      timestamp: 'Just now',
      read: false
    },
    {
      id: 'n2',
      type: 'sms',
      title: 'SMS Alert: OTP Login',
      content: 'NIRA6 SECURE CODE: Use code 7894 to complete your verified creator account sign-in. Do not share this OTP.',
      timestamp: '1 min ago',
      read: false
    },
    {
      id: 'n3',
      type: 'email',
      title: 'Invoice Confirmation: NIRA6 Hub',
      content: '<h3>Thanks for choosing NIRA6!</h3><p>Your seller transaction is confirmed and pre-owned camera gear has been auto-submitted to expert verification checks!</p>',
      timestamp: '5 min ago',
      read: true
    }
  ]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'all' | 'push' | 'sms' | 'email'>('all');
  const [toastAlert, setToastAlert] = useState<NiraNotification | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, title, content } = customEvent.detail;
      const newNotif: NiraNotification = {
        id: Math.random().toString(36).substring(7),
        type,
        title,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      
      // Trigger a slide-in push/toast alert in top right
      setToastAlert(newNotif);
      setTimeout(() => {
        setToastAlert(null);
      }, 6000);
    };

    window.addEventListener('nira_notification', handleNotification);
    return () => window.removeEventListener('nira_notification', handleNotification);
  }, []);

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

              {/* Simulated Notification Bell & Log Terminal */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                  className={`p-2 hover:bg-nira-gray rounded-lg transition-colors relative ${notifOpen ? 'text-nira-yellow bg-nira-dark' : 'text-nira-dark'}`}
                  aria-label="Notifications Center"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-3 w-[340px] sm:w-[420px] bg-white border border-nira-gray-dark rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[500px]"
                    >
                      <div className="p-4 bg-nira-dark text-white flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-nira-yellow animate-bounce" />
                          <h4 className="font-heading font-bold text-xs tracking-wider uppercase">Transactional Alerts Terminal</h4>
                        </div>
                        <span className="text-[10px] bg-nira-yellow text-nira-dark font-black px-2 py-0.5 rounded-full uppercase scale-90">Simulated</span>
                      </div>

                      {/* Tab Selectors */}
                      <div className="flex bg-nira-gray border-b border-nira-gray-dark p-1">
                        {(['all', 'push', 'sms', 'email'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveNotifTab(tab)}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${activeNotifTab === tab ? 'bg-white text-nira-dark shadow-sm' : 'text-nira-text-secondary hover:text-nira-dark'}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Notifs scroll list */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[380px]">
                        {notifications.filter(n => activeNotifTab === 'all' || n.type === activeNotifTab).length === 0 ? (
                          <div className="py-10 text-center text-nira-text-secondary text-xs font-semibold">
                            No logs captured yet. Try applying a checkout coupon or placing a COD order!
                          </div>
                        ) : (
                          notifications
                            .filter(n => activeNotifTab === 'all' || n.type === activeNotifTab)
                            .map(n => (
                              <div key={n.id} className="p-3 border border-nira-gray-dark rounded-xl hover:bg-nira-gray/10 transition-colors">
                                <div className="flex items-start gap-2.5">
                                  {n.type === 'push' && <Smartphone className="w-4 h-4 text-purple-500 mt-0.5" />}
                                  {n.type === 'sms' && <MessageSquare className="w-4 h-4 text-nira-success mt-0.5" />}
                                  {n.type === 'email' && <Mail className="w-4 h-4 text-blue-500 mt-0.5" />}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-bold text-nira-dark truncate">{n.title}</p>
                                      <span className="text-[9px] text-nira-text-secondary font-medium">{n.timestamp}</span>
                                    </div>

                                    {n.type === 'email' ? (
                                      <div className="mt-1.5 p-2 bg-nira-gray rounded-lg border border-nira-gray-dark text-[10px] text-nira-dark overflow-x-auto shadow-inner max-h-[140px] overflow-y-auto">
                                        <div className="border-b border-nira-gray-dark pb-1 mb-1 font-bold text-nira-text-secondary text-[8px] uppercase tracking-wider">From: services@nira6.in (Simulated Receipt)</div>
                                        <div className="prose prose-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: n.content }} />
                                      </div>
                                    ) : n.type === 'sms' ? (
                                      <div className="mt-1.5 p-2 bg-nira-dark text-white rounded-xl text-[10px] font-mono leading-relaxed relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at top right, #222, #000)' }}>
                                        <div className="border-b border-white/10 pb-1 mb-1 font-bold text-[8px] text-nira-yellow uppercase tracking-widest">NIRA6 SECURE GATEWAY (SMS)</div>
                                        {n.content}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-nira-text-secondary leading-relaxed mt-0.5">{n.content}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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

      {/* Global simulated slide-in toast alert */}
      <AnimatePresence>
        {toastAlert && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-6 z-[99] max-w-sm bg-nira-dark border border-nira-yellow/20 rounded-2xl shadow-2xl p-4 flex gap-3 text-white cursor-pointer"
            onClick={() => {
              setNotifOpen(true);
              setToastAlert(null);
            }}
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
          >
            {toastAlert.type === 'push' && <Smartphone className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0 animate-pulse" />}
            {toastAlert.type === 'sms' && <MessageSquare className="w-5 h-5 text-nira-success mt-0.5 flex-shrink-0 animate-bounce" />}
            {toastAlert.type === 'email' && <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />}
            <div>
              <h5 className="font-heading font-bold text-xs tracking-wider text-nira-yellow uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Simulated Alert Triggered
              </h5>
              <p className="text-[11px] font-bold mt-1 text-white leading-tight">{toastAlert.title}</p>
              <p className="text-[10px] mt-0.5 text-nira-text-secondary line-clamp-1">Click to view log details</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
