'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectCartCount } from '@/store/cartSlice';
import { toggleMobileMenu, closeMobileMenu, toggleSearch, setSearchQuery } from '@/store/uiSlice';
import { NAV_LINKS } from '@/lib/constants';
import { Search, ShoppingCart, User, Menu, X, Heart, Bell, MessageSquare, Mail, Smartphone, AlertCircle, Sparkles, History, Tag, Award, Package, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { mockProducts } from '@/lib/mockData';
import Logo from './Logo';

interface NiraNotification {
  id: string;
  type: 'push' | 'sms' | 'email';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
}

function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <strong key={index} className="text-nira-dark font-extrabold">{part}</strong>
        ) : (
          <span key={index} className="text-neutral-500 font-normal">{part}</span>
        )
      )}
    </span>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const { mobileMenuOpen, searchOpen, searchQuery } = useAppSelector((s) => s.ui);
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [scrolled, setScrolled] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const isDarkPage = pathname === '/' || pathname === '/creators/reels' || pathname?.startsWith('/rent');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [keyboardIndex, setKeyboardIndex] = useState(-1);

  const CATEGORIES = ['Cameras', 'Lenses', 'Drones', 'Gimbals', 'Audio', 'Lighting', 'Accessories'];
  const BRANDS = ['Sony', 'Canon', 'Nikon', 'DJI', 'Fujifilm', 'Sigma', 'Godox', 'Rode'];
  const POPULAR_TAGS = ['Sony FX30', 'DJI Mavic 3', 'Rode NTG5', 'Sigma 35mm', 'Canon R6', 'GoPro HERO12'];

  useEffect(() => {
    const saved = localStorage.getItem('nira_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('nira_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearchSubmit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    saveSearchTerm(trimmed);
    dispatch(setSearchQuery(trimmed));
    setShowSuggestions(false);
    router.push('/buy');
  };

  const getSuggestions = () => {
    if (!localSearch.trim()) return [];
    const query = localSearch.toLowerCase().trim();
    const suggestionsSet = new Set<string>();
    const results: any[] = [];

    // 1. Matches for Brands
    BRANDS.forEach(brand => {
      if (brand.toLowerCase().includes(query)) {
        suggestionsSet.add(brand.toLowerCase());
        results.push({ text: brand, category: 'Brand', type: 'brand' });
      }
    });

    // 2. Matches for Categories
    CATEGORIES.forEach(cat => {
      if (cat.toLowerCase().includes(query)) {
        suggestionsSet.add(cat.toLowerCase());
        results.push({ text: cat, category: 'Category', type: 'category' });
      }
    });

    // 3. Matches for Products
    mockProducts.forEach(p => {
      if (p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)) {
        if (!suggestionsSet.has(p.name.toLowerCase())) {
          suggestionsSet.add(p.name.toLowerCase());
          results.push({
            id: p.id,
            text: p.name,
            category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
            type: 'product',
            image: p.image,
            price: p.price,
            brand: p.brand
          });
        }
      }
    });

    return results.slice(0, 8);
  };

  const suggestions = getSuggestions();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isMobile = false) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setKeyboardIndex(prev => (prev + 1) % (suggestions.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setKeyboardIndex(prev => (prev - 1 + (suggestions.length || 1)) % (suggestions.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (keyboardIndex >= 0 && keyboardIndex < suggestions.length) {
        const selected = suggestions[keyboardIndex];
        if (selected.type === 'product') {
          saveSearchTerm(selected.text);
          setShowSuggestions(false);
          if (isMobile) dispatch(toggleSearch());
          router.push(`/buy/${selected.id}`);
        } else {
          setLocalSearch(selected.text);
          handleSearchSubmit(selected.text);
          if (isMobile) dispatch(toggleSearch());
        }
      } else {
        handleSearchSubmit(localSearch);
        if (isMobile) dispatch(toggleSearch());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const renderSuggestions = (isMobile: boolean) => {
    if (!showSuggestions) return null;
    return (
      <div className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fade-in max-h-[380px] overflow-y-auto ${isMobile ? 'relative mt-3' : 'absolute'} ${
        isDarkPage 
          ? 'bg-neutral-900 border-neutral-800 text-white' 
          : 'bg-white border-neutral-100 text-neutral-800'
      }`}>
        {localSearch.trim() === '' ? (
          <div className="p-4 text-neutral-800">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <History className="w-3 h-3 text-neutral-400" />
                    Recent Searches
                  </h4>
                  <button 
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('nira_recent_searches');
                    }}
                    className="text-[9px] text-neutral-400 hover:text-red-500 font-bold uppercase transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map(term => (
                    <div key={term} className="flex items-center gap-1 bg-neutral-100 hover:bg-nira-yellow/10 rounded-lg pl-2.5 pr-1 py-1 group">
                      <button
                        onClick={() => {
                          setLocalSearch(term);
                          handleSearchSubmit(term);
                          if (isMobile) dispatch(toggleSearch());
                        }}
                        className="text-neutral-700 group-hover:text-nira-dark text-xs font-semibold cursor-pointer"
                      >
                        {term}
                      </button>
                      <button
                        onClick={() => {
                          setRecentSearches(prev => {
                            const updated = prev.filter(t => t !== term);
                            localStorage.setItem('nira_recent_searches', JSON.stringify(updated));
                            return updated;
                          });
                        }}
                        className="text-neutral-400 hover:text-red-500 p-0.5 rounded-full"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="mb-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-nira-yellow fill-nira-yellow" />
                Popular Searches
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setLocalSearch(tag);
                      handleSearchSubmit(tag);
                      if (isMobile) dispatch(toggleSearch());
                    }}
                    className="px-2.5 py-1 bg-neutral-50 hover:bg-nira-yellow/10 hover:text-nira-dark text-neutral-600 text-xs font-medium rounded-lg border border-neutral-200/60 transition-all cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Categories */}
            <div>
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                Quick Categories
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setLocalSearch(cat);
                      handleSearchSubmit(cat);
                      if (isMobile) dispatch(toggleSearch());
                    }}
                    className="flex items-center justify-between px-2.5 py-1.5 border border-neutral-100 hover:border-nira-yellow hover:bg-neutral-50 rounded-lg text-left text-xs font-semibold text-neutral-700 transition-all cursor-pointer"
                  >
                    <span>{cat}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-1 text-neutral-800">
            {suggestions.map((item, idx) => (
              <div key={item.text + idx}>
                {item.type === 'product' ? (
                  <a
                    href={`/buy/${item.id}`}
                    onClick={() => {
                      saveSearchTerm(item.text);
                      setShowSuggestions(false);
                      if (isMobile) dispatch(toggleSearch());
                    }}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                      keyboardIndex === idx ? 'bg-nira-yellow/10' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0 bg-neutral-50 rounded border border-neutral-100 flex items-center justify-center p-1">
                      <Image
                        src={item.image}
                        alt={item.text}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 truncate">
                        <HighlightText text={item.text} highlight={localSearch} />
                      </p>
                      <p className="text-[9px] text-neutral-400 font-semibold uppercase">{item.brand} • {item.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-neutral-900">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setLocalSearch(item.text);
                      handleSearchSubmit(item.text);
                      if (isMobile) dispatch(toggleSearch());
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                      keyboardIndex === idx ? 'bg-nira-yellow/10' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.type === 'category' ? (
                        <Tag className="w-3.5 h-3.5 text-purple-500" />
                      ) : (
                        <Award className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span className="text-xs font-medium text-neutral-700">
                        Search for <HighlightText text={item.text} highlight={localSearch} />
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                      item.type === 'category' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {item.category}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        dispatch(setSearchQuery(localSearch));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, dispatch, searchQuery]);

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
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 translate-y-0 ${
          isDarkPage
            ? scrolled 
              ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] text-white' 
              : 'bg-transparent border-b border-transparent text-white'
            : scrolled 
              ? 'bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] text-nira-dark' 
              : 'bg-white/40 backdrop-blur-md border-b border-transparent text-nira-dark'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group py-2" onClick={() => dispatch(closeMobileMenu())}>
              <Logo className="group-hover:scale-[1.02] transition-transform duration-300" height={28} theme={isDarkPage ? 'dark' : 'light'} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive 
                        ? (isDarkPage ? 'text-white' : 'text-nira-dark') 
                        : (isDarkPage ? 'text-neutral-400 hover:text-white' : 'text-nira-text-secondary hover:text-nira-dark')
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-nira-yellow rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar - Desktop */}
            <div className={`hidden md:flex flex-1 max-w-md mx-6 relative ${showSuggestions ? 'z-50' : 'z-10'}`}>
              <div className="relative w-full group">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-nira-yellow transition-colors ${isDarkPage ? 'text-neutral-400' : 'text-nira-text-secondary'}`} />
                <input
                  type="text"
                  placeholder="Search cameras, lenses, drones..."
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setShowSuggestions(true);
                    setKeyboardIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => handleKeyDown(e, false)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border transition-all ${
                    isDarkPage 
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-nira-yellow focus:bg-[#121214] focus:outline-none' 
                      : 'bg-nira-gray border-transparent focus:border-nira-yellow focus:bg-white focus:outline-none'
                  }`}
                />
                {localSearch && (
                  <button
                    onClick={() => {
                      setLocalSearch('');
                      dispatch(setSearchQuery(''));
                      setKeyboardIndex(-1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {showSuggestions && (
                <>
                  <div className="fixed inset-0 z-45 bg-transparent" onClick={() => setShowSuggestions(false)} />
                  {renderSuggestions(false)}
                </>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => dispatch(toggleSearch())} 
                className={`p-3 rounded-lg transition-colors md:hidden ${isDarkPage ? 'hover:bg-white/10 text-white' : 'hover:bg-nira-gray text-nira-dark'}`} 
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link 
                href="/dashboard" 
                className={`p-3 rounded-lg transition-colors hidden sm:flex ${isDarkPage ? 'hover:bg-white/10 text-white' : 'hover:bg-nira-gray text-nira-dark'}`} 
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>
              <Link 
                href="/cart" 
                className={`relative p-3 rounded-lg transition-colors ${isDarkPage ? 'hover:bg-white/10 text-white' : 'hover:bg-nira-gray text-nira-dark'}`} 
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-nira-yellow text-nira-dark text-[10px] font-bold rounded-full flex items-center justify-center">
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
                  className={`p-3 rounded-lg transition-colors relative ${
                    notifOpen 
                      ? (isDarkPage ? 'text-nira-yellow bg-white/10' : 'text-nira-yellow bg-nira-dark') 
                      : (isDarkPage ? 'text-white hover:bg-white/10' : 'text-nira-dark hover:bg-nira-gray')
                  }`}
                  aria-label="Notifications Center"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
              <button onClick={() => dispatch(toggleMobileMenu())} className="lg:hidden p-3 hover:bg-nira-gray rounded-lg transition-colors" aria-label="Menu">
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
              className="md:hidden border-t border-nira-gray-dark overflow-visible z-50 relative bg-white"
            >
              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search cameras, lenses, drones..."
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value);
                      setShowSuggestions(true);
                      setKeyboardIndex(-1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    className="w-full pl-10 pr-10 py-2.5 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow"
                    autoFocus
                  />
                  {localSearch && (
                    <button
                      onClick={() => {
                        setLocalSearch('');
                        dispatch(setSearchQuery(''));
                        setKeyboardIndex(-1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 rounded-full text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {renderSuggestions(true)}
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
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 pt-8 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <Logo height={26} theme="light" />
                <button onClick={() => dispatch(closeMobileMenu())} className="p-2 hover:bg-neutral-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-nira-dark" />
                </button>
              </div>
              <div className="flex flex-col gap-2 flex-1">
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
