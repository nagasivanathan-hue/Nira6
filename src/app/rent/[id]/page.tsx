'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles, Plus, Star, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RentGallery from '@/components/rental/RentGallery';
import RentSpecs from '@/components/rental/RentSpecs';
import RentBookingPanel from '@/components/rental/RentBookingPanel';
import RentReviews from '@/components/rental/RentReviews';
import RentSimilar from '@/components/rental/RentSimilar';
import { RentalItem } from '@/types';
import { formatPrice } from '@/lib/utils';

// Accessories helper
function getBundleAccessories(category: string) {
  switch (category?.toLowerCase()) {
    case 'cameras':
      return [
        { id: 'acc-bat', name: 'Nira Dual Power Battery Pack', dailyRate: 150, image: '/assets/product-camera.png' },
        { id: 'acc-sd', name: 'SanDisk Extreme Pro 128GB V90 SDXC', dailyRate: 250, image: '/assets/product-lens.png' },
      ];
    case 'drones':
      return [
        { id: 'acc-bat-drone', name: 'DJI Intelligent Flight Battery', dailyRate: 350, image: '/assets/product-drone.png' },
        { id: 'acc-prop', name: 'Propeller Guard Pack (4 Blades)', dailyRate: 100, image: '/assets/product-drone.png' },
      ];
    case 'lenses':
      return [
        { id: 'acc-filter', name: 'Variable ND Filter 82mm (1-5 Stop)', dailyRate: 150, image: '/assets/product-lens.png' },
        { id: 'acc-hood', name: 'Carbon Fiber Matte Box / Hood', dailyRate: 200, image: '/assets/product-lens.png' },
      ];
    default:
      return [
        { id: 'acc-charger', name: 'Fast Charging Dock & Cable Kit', dailyRate: 100, image: '/assets/product-camera.png' },
        { id: 'acc-bag', name: 'Premium Creator Travel Backpack', dailyRate: 180, image: '/assets/product-camera.png' },
      ];
  }
}

export default function RentalDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<RentalItem | null>(null);
  const [similar, setSimilar] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<RentalItem[]>([]);
  const [selectedBundleItems, setSelectedBundleItems] = useState<string[]>([]);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/rentals/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setItem(data.item);
        setSimilar(data.similar || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  // Frequently Rented Together states initialization
  useEffect(() => {
    if (item) {
      const accs = getBundleAccessories(item.category);
      Promise.resolve().then(() => {
        setSelectedBundleItems([item.id, ...accs.map(a => a.id)]);
      });
    }
  }, [item]);

  // Recently viewed tracker
  useEffect(() => {
    if (item) {
      const existing = localStorage.getItem('nira_recently_viewed_rentals');
      let list: RentalItem[] = [];
      try {
        list = existing ? JSON.parse(existing) : [];
      } catch {
        list = [];
      }
      const filtered = list.filter((x: RentalItem) => x.id !== item.id);
      const updated = [item, ...filtered].slice(0, 6);
      localStorage.setItem('nira_recently_viewed_rentals', JSON.stringify(updated));
      Promise.resolve().then(() => {
        setRecentlyViewed(updated);
      });
    }
  }, [item]);

  if (loading) {
    return (
      <div className="rent-dark min-h-screen flex items-center justify-center bg-nira-dark">
        <Loader2 className="w-6 h-6 text-nira-yellow animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rent-dark min-h-screen flex flex-col items-center justify-center gap-4 bg-nira-dark">
        <p className="text-white/40 font-heading font-bold text-xl">Item not found</p>
        <Link href="/rent" className="text-nira-yellow text-sm font-bold hover:underline">← Back to Rentals</Link>
      </div>
    );
  }

  const bundleAccessories = getBundleAccessories(item.category);
  const totalBundleDailyRate = item.dailyRate + bundleAccessories
    .filter(a => selectedBundleItems.includes(a.id))
    .reduce((sum, curr) => sum + curr.dailyRate, 0);

  const toggleBundle = (id: string) => {
    setSelectedBundleItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleScrollToBooking = () => {
    const el = document.getElementById('rent-booking-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAddBundleToCart = () => {
    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: { 
        type: 'push', 
        title: '🎉 Bundle Selected!', 
        content: `Main item and accessories selected. Choose dates below to confirm total rates.` 
      }
    }));
    handleScrollToBooking();
  };

  return (
    <div className="rent-dark min-h-screen pt-20 lg:pt-24 pb-24 bg-nira-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link href="/rent" className="inline-flex items-center gap-2 text-white/30 hover:text-nira-yellow text-xs font-bold transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
        </motion.div>

        {/* Top: Gallery + Booking Panel */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-3">
            <RentGallery item={item} />
          </div>
          <div className="lg:col-span-2">
            <RentBookingPanel item={item} />
          </div>
        </div>

        {/* Frequently Rented Together */}
        <div className="card-dark rounded-3xl p-6 md:p-8 mb-12 border border-white/5 bg-white/[0.01]">
          <h3 className="font-heading font-black text-base text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-nira-yellow" /> Frequently Rented Together
          </h3>
          <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
              {/* Main Item card representation */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10 w-28 text-center">
                <div className="w-16 h-16 relative mb-2 flex items-center justify-center bg-white/3 rounded-xl p-2">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                </div>
                <p className="text-[10px] text-white/80 font-bold truncate w-full">{item.name}</p>
                <p className="text-[10px] text-nira-yellow font-black mt-1">{formatPrice(item.dailyRate)}/day</p>
              </div>

              {bundleAccessories.map((acc) => (
                <div key={acc.id} className="flex items-center gap-4">
                  <Plus className="w-4 h-4 text-white/30" />
                  <button 
                    onClick={() => toggleBundle(acc.id)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all w-28 text-center relative ${
                      selectedBundleItems.includes(acc.id)
                        ? 'bg-nira-yellow/10 border-nira-yellow text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/40'
                    }`}
                  >
                    <div className="w-16 h-16 relative mb-2 flex items-center justify-center bg-white/3 rounded-xl p-2">
                      <Image src={acc.image} alt={acc.name} fill className="object-contain p-1" />
                    </div>
                    <p className="text-[10px] font-bold truncate w-full">{acc.name}</p>
                    <p className="text-[10px] text-nira-yellow font-black mt-1">+{formatPrice(acc.dailyRate)}/day</p>
                    {selectedBundleItems.includes(acc.id) && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-nira-yellow text-nira-dark rounded-full flex items-center justify-center text-[9px] font-black">
                        ✓
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 w-full lg:max-w-xs flex flex-col gap-4 text-center lg:text-left">
              <div>
                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Total Bundle Price</p>
                <p className="font-heading font-black text-2xl text-nira-yellow mt-1">{formatPrice(totalBundleDailyRate)}<span className="text-xs text-white/50 font-normal">/day</span></p>
                <p className="text-[9px] text-white/30 mt-1">For {selectedBundleItems.length} items in package</p>
              </div>
              <button 
                onClick={handleAddBundleToCart}
                className="py-3 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Book Selected Bundle
              </button>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="mb-12">
          <RentSpecs item={item} />
        </div>

        {/* Comparison Matrix */}
        {similar.length > 0 && (
          <div className="card-dark rounded-3xl p-6 md:p-8 mb-12 border border-white/5 bg-white/[0.01]">
            <h3 className="font-heading font-black text-base text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-nira-yellow" /> Compare Rental Gear
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40">
                    <th className="py-3.5 pr-4 font-bold uppercase tracking-widest text-[9px]">Features</th>
                    <th className="py-3.5 px-4 font-bold text-nira-yellow uppercase tracking-widest text-[9px] bg-white/[0.02] rounded-t-xl">This Item ({item.name.split(' ')[0]})</th>
                    {similar.slice(0, 2).map((s) => (
                      <th key={s.id} className="py-3.5 px-4 font-bold uppercase tracking-widest text-[9px]">{s.name.split(' ')[0]} {s.name.split(' ')[1] || ''}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-4 pr-4 font-bold text-white/50">Daily Rental</td>
                    <td className="py-4 px-4 font-black text-nira-yellow bg-white/[0.02]">{formatPrice(item.dailyRate)}/day</td>
                    {similar.slice(0, 2).map(s => (
                      <td key={s.id} className="py-4 px-4 font-bold text-white/80">{formatPrice(s.dailyRate)}/day</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-bold text-white/50">Security Deposit</td>
                    <td className="py-4 px-4 font-bold text-white bg-white/[0.02]">{formatPrice(item.securityDeposit)}</td>
                    {similar.slice(0, 2).map(s => (
                      <td key={s.id} className="py-4 px-4 text-white/70">{formatPrice(s.securityDeposit)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-bold text-white/50">Condition Score</td>
                    <td className="py-4 px-4 font-bold text-emerald-400 bg-white/[0.02]">Grade A+ (94%)</td>
                    {similar.slice(0, 2).map(s => (
                      <td key={s.id} className="py-4 px-4 text-white/70">Grade A (88%)</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-bold text-white/50">Locations</td>
                    <td className="py-4 px-4 text-white/80 bg-white/[0.02]">{item.location}</td>
                    {similar.slice(0, 2).map(s => (
                      <td key={s.id} className="py-4 px-4 text-white/60">{s.location}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 font-bold text-white/50">Reviews Rating</td>
                    <td className="py-4 px-4 font-bold text-white bg-white/[0.02] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-nira-yellow fill-nira-yellow inline" /> {item.rating} ({item.reviewCount})
                    </td>
                    {similar.slice(0, 2).map(s => (
                      <td key={s.id} className="py-4 px-4 text-white/70">
                        <Star className="w-3 h-3 text-nira-yellow fill-nira-yellow inline mr-1" /> {s.rating} ({s.reviewCount})
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mb-12">
          <RentReviews reviews={item.reviews || []} rating={item.rating} reviewCount={item.reviewCount} />
        </div>

        {/* Recently Viewed Tracker */}
        {recentlyViewed.length > 1 && (
          <div className="border-t border-white/5 pt-12 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-heading font-black text-sm uppercase tracking-wider text-white">Recently Viewed Rental Gear</h4>
              <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-full font-bold text-white/40">History tracked</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentlyViewed.filter(x => x.id !== item.id).map(r => (
                <Link 
                  href={`/rent/${r.id}`} 
                  key={r.id} 
                  className="group block card-dark rounded-2xl p-3 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                >
                  <div className="aspect-square relative bg-white/3 rounded-xl overflow-hidden mb-2 p-2 flex items-center justify-center">
                    <Image src={r.image} alt={r.name} fill className="object-contain p-1.5 group-hover:scale-105 transition-transform" />
                  </div>
                  <h5 className="font-bold text-[11px] text-white/90 truncate">{r.name}</h5>
                  <p className="text-[10px] text-nira-yellow font-black mt-0.5">{formatPrice(r.dailyRate)}/day</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar Items */}
        {similar.length > 0 && <RentSimilar items={similar} />}
      </div>

      {/* Mobile Sticky Booking CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-nira-dark/95 backdrop-blur-xl border-t border-white/10 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] flex items-center justify-between lg:hidden md:px-6">
        <div className="flex flex-col min-w-0 pr-4">
          <h4 className="text-xs font-bold text-white truncate leading-snug">{item.name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-heading font-black text-sm text-nira-yellow">{formatPrice(item.dailyRate)}<span className="text-[10px] font-normal text-white/40">/day</span></span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Checked</span>
          </div>
        </div>
        <button
          onClick={handleScrollToBooking}
          className="px-6 py-2.5 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark font-black tracking-wider uppercase text-xs rounded-xl shadow-md cursor-pointer transition-colors"
        >
          Book Now
        </button>
      </div>

    </div>
  );
}
