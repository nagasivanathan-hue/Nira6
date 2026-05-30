'use client';
import { useState } from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, MapPin, BarChart3, 
  Package, Calendar, Truck, Wallet, MessageSquare, Star, 
  ShieldAlert, Sparkles, Plus, Trash2, Upload, 
  User, ChevronRight, Info
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';
import ProductListingForm from '@/components/seller/ProductListingForm';

// Mock Initial Seller Data for Dashboard Simulation
const initialProducts: Product[] = [
  {
    id: 'prod-sell-1',
    name: 'Sony Alpha A7 IV (Partner Verified)',
    brand: 'Sony',
    price: 189000,
    originalPrice: 199000,
    discount: 10000,
    category: 'Cameras',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60'],
    condition: 'Like New',
    grade: 'A+',
    warranty: '1 Year Brand Warranty',
    rating: 4.8,
    reviewCount: 12,
    sellerName: 'Madurai Cine Studio',
    sellerRating: 4.9,
    specs: { 'Resolution': '33 MP', 'Sensor': 'Full Frame' },
    description: 'Ultra-high diagnostics grade verified Sony full-frame mirrorless.',
    emiAvailable: true,
    inStock: true,
    featured: true,
    trending: true,
    createdAt: '2026-05-17T00:00:00.000Z'
  },
  {
    id: 'prod-sell-2',
    name: 'Sigma 24-70mm f/2.8 DG DN Art',
    brand: 'Sigma',
    price: 94000,
    originalPrice: 99000,
    discount: 5000,
    category: 'Lenses',
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=500&auto=format&fit=crop&q=60',
    images: ['https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=500&auto=format&fit=crop&q=60'],
    condition: 'Excellent',
    grade: 'A',
    warranty: '6 Months Seller Warranty',
    rating: 4.6,
    reviewCount: 8,
    sellerName: 'Madurai Cine Studio',
    sellerRating: 4.9,
    specs: { 'Focal Length': '24-70mm', 'Aperture': 'f/2.8' },
    description: 'Perfect bokeh, zero cosmetic dust, original lens cap and box included.',
    emiAvailable: true,
    inStock: true,
    featured: false,
    trending: true,
    createdAt: '2026-05-17T00:00:00.000Z'
  }
];

interface ServiceListing {
  id: string;
  title: string;
  category: string;
  pricePerHour: number;
  availableTimings: string;
  serviceArea: string;
  experience: string;
  certifications: string;
  description: string;
}

const initialServices: ServiceListing[] = [
  {
    id: 'srv-sell-1',
    title: 'Cinematic Wedding Film Editing',
    category: 'Video Editor',
    pricePerHour: 1500,
    availableTimings: 'Mon-Fri: 10 AM - 6 PM',
    serviceArea: 'Remote / Nationwide',
    experience: '5+ Years in High-end Wedding Cinema',
    certifications: 'Adobe Certified Professional - Premiere Pro',
    description: 'Vibrant HSL color grading, multicam sound synching, and dynamic custom transitions for YouTube or local distributions.'
  },
  {
    id: 'srv-sell-2',
    title: 'Instagram Reels & Shorts Fast Cut Editing',
    category: 'Reels Editor',
    pricePerHour: 800,
    availableTimings: '24/7 Priority Support',
    serviceArea: 'Remote / Virtual Desk',
    experience: '3+ Years with 10M+ aggregate views generated',
    certifications: 'NIRA6 Certified Reels Creator',
    description: 'Retention-optimized typography, sound design, auto-captions, and micro-hook layouts.'
  }
];

interface OrderListing {
  id: string;
  customerName: string;
  itemName: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingId?: string;
  shippingProvider?: string;
}

const initialOrders: OrderListing[] = [
  {
    id: 'ORD-PART-7821',
    customerName: 'Sanjay Kumar',
    itemName: 'Sony Alpha A7 IV (Partner Verified)',
    amount: 189000,
    date: '2026-05-17',
    status: 'Pending'
  },
  {
    id: 'ORD-PART-6591',
    customerName: 'Divya Pandian',
    itemName: 'Sigma 24-70mm f/2.8 DG DN Art',
    amount: 94000,
    date: '2026-05-15',
    status: 'Delivered',
    trackingId: 'TRK-NIRA-980123',
    shippingProvider: 'Delhivery'
  }
];


interface PayoutLog {
  id: string;
  amount: number;
  date: string;
  status: string;
  channel: string;
}

interface SellerChatMessage {
  sender: 'buyer' | 'seller';
  text: string;
  time: string;
}

function generateTrackingNumber(): string {
  return `TRK-NIRA-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function SellerPartnerPage() {
  // Onboarding Phase Control
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [partnerRole, setPartnerRole] = useState<'seller' | 'provider'>('seller');
  
  // Onboarding Form States
  const [regForm, setRegForm] = useState({
    fullName: '',
    businessName: 'Madurai Cine Studio',
    email: 'nira6studio@gmail.com',
    phone: '+91 98765 43210',
    password: '',
    businessType: 'Partnership',
    address: '12 East Veli Street, Madurai',
    location: 'Madurai, India',
    govtId: 'IN-GOVT-PAN-9821A',
    gstin: '33AAACM1928K1Z5',
    bankAccount: '9082100821908',
    ifscCode: 'SBIN0001234',
    upiId: 'nira6studio@okaxis'
  });

  // Verification Badging simulations
  const [kycStatus, setKycStatus] = useState<'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [isBadgeGranted, setIsBadgeGranted] = useState(false);

  // Active Dashboard States
  const [activeDashTab, setActiveDashTab] = useState<'overview' | 'products' | 'services' | 'orders' | 'payouts' | 'chat' | 'moderation'>('overview');
  
  // Catalogs and listings states
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [services, setServices] = useState<ServiceListing[]>(initialServices);
  const [orders, setOrders] = useState<OrderListing[]>(initialOrders);

  const [newSrv, setNewSrv] = useState({
    title: '',
    category: 'Video Editor',
    pricePerHour: 1000,
    availableTimings: 'Mon-Sat: 9 AM - 6 PM',
    serviceArea: 'Remote / India',
    experience: '2 Years',
    certifications: 'NIRA6 Creator Lab certified',
    description: ''
  });

  // Withdrawal ledger states
  const [balance, setBalance] = useState(283000);
  const [payoutLogs, setPayoutLogs] = useState<PayoutLog[]>([
    { id: 'PAY-8921', amount: 154000, date: '2026-05-10', status: 'Completed', channel: 'Bank Transfer' },
    { id: 'PAY-7822', amount: 35000, date: '2026-05-04', status: 'Completed', channel: 'UPI' }
  ]);
  const [withdrawAmt, setWithdrawAmt] = useState('');
  
  // Live simulated chat states
  const [chatMessages, setChatMessages] = useState<SellerChatMessage[]>([
    { sender: 'buyer', text: 'Hi Madurai Studio, is the Sigma lens available for instant shipping today?', time: '10:05 AM' }
  ]);
  const [replyInput, setReplyInput] = useState('');

  // Bulk Product Spreadsheet Uploader Simulator
  const [bulkProgress, setBulkProgress] = useState(false);

  // Auto Onboarding demo bypass
  const handleBypassDemo = () => {
    setRegForm({
      ...regForm,
      fullName: 'Siva Nagasivanathan',
      businessName: 'Madurai Cine Studio',
      email: 'nira6studio@gmail.com',
      phone: '+91 98765 43210'
    });
    setKycStatus('Verified');
    setIsBadgeGranted(true);
    setIsOnboarded(true);
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardStep < 3) {
      setOnboardStep(onboardStep + 1);
    } else {
      setKycStatus('Verified');
      setIsBadgeGranted(true);
      setIsOnboarded(true);
      
      // Send verified push event
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🎖️ NIRA6 Seller Verified!',
          content: `Welcome aboard "${regForm.businessName}"! KYC verified & Madurai geolocations active.`
        }
      }));
    }
  };

  // Add Product Complete Handler
  const handleProductAdded = (created: Product) => {
    setProducts([created, ...products]);

    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: {
        type: 'push',
        title: '📦 Product Indexed Successfully',
        content: `"${created.name}" is now live in the NIRA6 Recommerce Marketplace!`
      }
    }));
    alert('Product cataloged successfully and synced into the live search index.');
  };

  // Add Service Listing Submit
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrv.title || newSrv.pricePerHour <= 0) {
      alert('Please enter valid service listings terms.');
      return;
    }
    const created: ServiceListing = {
      id: `srv-sell-${Date.now()}`,
      title: newSrv.title,
      category: newSrv.category,
      pricePerHour: Number(newSrv.pricePerHour),
      availableTimings: newSrv.availableTimings,
      serviceArea: newSrv.serviceArea,
      experience: newSrv.experience,
      certifications: newSrv.certifications,
      description: newSrv.description
    };
    setServices([created, ...services]);
    setNewSrv({
      title: '',
      category: 'Video Editor',
      pricePerHour: 1000,
      availableTimings: 'Mon-Sat: 9 AM - 6 PM',
      serviceArea: 'Remote / India',
      experience: '2 Years',
      certifications: 'NIRA6 Creator Lab certified',
      description: ''
    });

    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: {
        type: 'push',
        title: '💼 Creator Service Indexed!',
        content: `Your Freelance "${created.title}" service profile has been verified.`
      }
    }));
    alert('Creator Freelance Service Profile indexed successfully in dynamic matching tables.');
  };

  // Accept Order & Generate Pickup Request
  const handleShipOrder = (orderId: string) => {
    const trackingNo = generateTrackingNumber();
    setOrders(orders.map(o => o.id === orderId ? {
      ...o,
      status: 'Shipped',
      trackingId: trackingNo,
      shippingProvider: 'Delhivery Partner'
    } : o));

    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: {
        type: 'push',
        title: '🚚 Dispatch Logistics Activated',
        content: `Order ${orderId} accepted. Pickup scheduled. Delhivery Waybill: ${trackingNo}`
      }
    }));
    alert(`Delhivery Pickup generated! Tracking Waybill: ${trackingNo}`);
  };

  // Withdraw simulation
  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmt);
    if (isNaN(amt) || amt <= 0 || amt > balance) {
      alert('Please enter a valid payout withdrawal amount within your balance limits.');
      return;
    }
    setBalance(balance - amt);
    const newLog = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amt,
      date: new Date().toISOString().slice(0, 10),
      status: 'Processing',
      channel: regForm.upiId ? 'UPI Wallet Transfer' : 'Direct Bank Payout'
    };
    setPayoutLogs([newLog, ...payoutLogs]);
    setWithdrawAmt('');
    
    // Notification dispatch
    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: {
        type: 'push',
        title: '💸 Payout Withdrawal Initiated',
        content: `₹${amt} requested securely to UPI: ${regForm.upiId}. Instant verification pending.`
      }
    }));
    alert(`Withdrawal request processed securely. UPI Ref Transmitting...`);
  };

  // Chat message simulator reply
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    const sentMsg: SellerChatMessage = { sender: 'seller', text: replyInput, time: 'Just Now' };
    setChatMessages([...chatMessages, sentMsg]);
    setReplyInput('');

    // Simulate auto buyer reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: 'buyer',
        text: 'Awesome, thanks for the fast reply! Placing the purchase now from my dashboard cart.',
        time: 'Just Now'
      }]);
    }, 1500);
  };

  // Bulk spreadsheets simulation
  const handleBulkUploadSimulate = () => {
    setBulkProgress(true);
    setTimeout(() => {
      const bulkAdd: Product[] = [
        {
          id: 'prod-bulk-1',
          name: 'dji RS 3 Pro Gimbal Stabilizer',
          brand: 'DJI',
          category: 'Accessories',
          price: 68000,
          originalPrice: 75000,
          discount: 7000,
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60',
          images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60'],
          condition: 'Like New',
          grade: 'A+',
          warranty: '1 Year Brand Warranty',
          rating: 4.9,
          reviewCount: 22,
          sellerName: regForm.businessName,
          sellerRating: 5.0,
          specs: { 'Weight Limit': '4.5 kg', 'Battery Life': '12 hours' },
          description: 'Carbon fiber active axis locking, LiDAR focus tracking included.',
          emiAvailable: true,
          inStock: true,
          featured: true,
          trending: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'prod-bulk-2',
          name: 'Shure SM7B Vocal Studio Mic',
          brand: 'Shure',
          category: 'Audio',
          price: 34500,
          originalPrice: 38000,
          discount: 3500,
          image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=60',
          images: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=60'],
          condition: 'Excellent',
          grade: 'A',
          warranty: '2 Year Brand Warranty',
          rating: 4.7,
          reviewCount: 35,
          sellerName: regForm.businessName,
          sellerRating: 5.0,
          specs: { 'Polar Pattern': 'Cardioid', 'Connector': 'XLR' },
          description: 'Perfect broadcasting vocal response shield. Pristine conditions.',
          emiAvailable: true,
          inStock: true,
          featured: false,
          trending: true,
          createdAt: new Date().toISOString()
        }
      ];
      setProducts(prev => [...prev, ...bulkAdd]);
      setBulkProgress(false);
      alert('Simulated spreadsheet import complete! 2 high-fidelity audio/stabilizer records added.');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-nira-gray text-nira-dark pb-16">
      {/* Onboarding Header Banner */}
      <div className="bg-nira-dark text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-nira-yellow/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1 bg-nira-yellow/20 border border-nira-yellow/30 px-3 py-1 rounded-full text-nira-yellow text-[9px] font-black tracking-widest uppercase mb-3">
            <Sparkles className="w-3 h-3" /> NIRA6 Creator Partner Central
          </div>
          <h1 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-wider mb-2">Partner Central</h1>
          <p className="text-white/60 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Unleash your creative enterprise. List high-end diagnostics cameras, lenses, stabilizing accessories, or offer high-paying freelance video editing, reels directing, and technical inspections!
          </p>

          {!isOnboarded && (
            <button 
              onClick={handleBypassDemo}
              className="mt-6 px-6 py-2.5 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <Info className="w-4 h-4" /> Instant Demo Bypass (Seller Login)
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* PHASE 1: KYC ONBOARDING AND REGISTRATION STEPS */}
        {!isOnboarded ? (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-nira-gray-dark shadow-sm overflow-hidden">
            {/* Step Indicators */}
            <div className="grid grid-cols-3 border-b border-nira-gray-dark text-center">
              <div className={`py-4 text-xs font-bold uppercase tracking-wider border-r border-nira-gray-dark ${onboardStep === 1 ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary'}`}>
                1. Account Details
              </div>
              <div className={`py-4 text-xs font-bold uppercase tracking-wider border-r border-nira-gray-dark ${onboardStep === 2 ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary'}`}>
                2. Studio Base & KYC
              </div>
              <div className={`py-4 text-xs font-bold uppercase tracking-wider ${onboardStep === 3 ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary'}`}>
                3. Payout & Bank Verification
              </div>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-8 space-y-6">
              {/* STEP 1: ACCOUNT TYPE & BASIC REGISTRATION */}
              {onboardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">Select Partner Domain</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button" 
                      onClick={() => setPartnerRole('seller')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${partnerRole === 'seller' ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark hover:border-nira-yellow/30'}`}
                    >
                      <Package className="w-8 h-8 text-nira-dark mb-3" />
                      <h4 className="text-xs font-black text-nira-dark uppercase tracking-wider">Product Seller</h4>
                      <p className="text-[10px] text-nira-text-secondary mt-1">Rent or sell second-hand cameras, lenses, stabilizer gimbals, microphones, or memory packs.</p>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPartnerRole('provider')}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${partnerRole === 'provider' ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark hover:border-nira-yellow/30'}`}
                    >
                      <User className="w-8 h-8 text-nira-dark mb-3" />
                      <h4 className="text-xs font-black text-nira-dark uppercase tracking-wider">Service Provider</h4>
                      <p className="text-[10px] text-nira-text-secondary mt-1">Offer dynamic video editing, professional photo grading, active reels production, or expert diagnostics.</p>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setAccountType('individual')}
                      className={`py-3 text-xs font-bold rounded-xl border text-center uppercase tracking-wider transition-all ${accountType === 'individual' ? 'bg-nira-dark text-white border-nira-dark' : 'border-nira-gray-dark'}`}
                    >
                      Individual / Freelancer
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAccountType('business')}
                      className={`py-3 text-xs font-bold rounded-xl border text-center uppercase tracking-wider transition-all ${accountType === 'business' ? 'bg-nira-dark text-white border-nira-dark' : 'border-nira-gray-dark'}`}
                    >
                      Business / Studio Group
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Full Representative Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Nagasivanathan Siva"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Studio / Company Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Madurai Cine Studio"
                        value={regForm.businessName}
                        onChange={(e) => setRegForm({ ...regForm, businessName: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Secure Contact Email *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="nira6studio@gmail.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Phone Number (OTP Verification)*</label>
                      <input 
                        type="text" 
                        required
                        placeholder="+91 98765 43210"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS, STUDIO BASE AND GOVERNMENT KYC */}
              {onboardStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">KYC, Licenses & Geolocation</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Government ID / PAN Number *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="IN-GOVT-PAN-9821A"
                        value={regForm.govtId}
                        onChange={(e) => setRegForm({ ...regForm, govtId: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">GSTIN Number (Optional for Freelancers)</label>
                      <input 
                        type="text" 
                        placeholder="33AAACM1928K1Z5"
                        value={regForm.gstin}
                        onChange={(e) => setRegForm({ ...regForm, gstin: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Studio Address Location *</label>
                    <textarea 
                      required
                      placeholder="12 East Veli Street, Madurai"
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                      className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      rows={2}
                    />
                  </div>

                  {/* Google Map Service Geolocation center display */}
                  <div className="p-4 bg-nira-gray/40 border border-nira-gray-dark rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-nira-dark">
                        <MapPin className="w-3.5 h-3.5 text-nira-yellow" /> Studio Location Center (Madurai, India)
                      </div>
                      <span className="text-[8px] bg-nira-success/10 text-nira-success px-2 py-0.5 rounded font-black uppercase">Service Active</span>
                    </div>
                    <p className="text-[10px] text-nira-text-secondary leading-relaxed mb-3">
                      Your business coordinates map is verified centered on Madurai, India. Verified creator listings display direct regional pickup and logistics availability.
                    </p>
                    <iframe
                      title="Studio Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15720.573217431782!2d78.1130985558488!3d9.92520067332711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b118d53f%3A0x34cdfb07b9094c63!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin"
                      className="w-full h-32 rounded-xl border border-nira-gray-dark shadow-inner"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-2">Upload Government ID / Business License Proof *</label>
                    <div className="border-2 border-dashed border-nira-gray-dark hover:border-nira-yellow rounded-2xl p-6 text-center cursor-pointer transition-colors">
                      <Upload className="w-8 h-8 text-nira-text-secondary mx-auto mb-2" />
                      <span className="text-xs text-nira-dark block font-bold">Select PDF, PNG or JPG files</span>
                      <span className="text-[9px] text-nira-text-secondary block mt-1">Maximum file size: 5MB</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYOUT METHOD, BANK DETAILS & UPI LEDGER WALLET */}
              {onboardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">Payout Ledgers & Escrow Channels</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Bank Account Number *</label>
                      <input 
                        type="password" 
                        required
                        placeholder="9082100821908"
                        value={regForm.bankAccount}
                        onChange={(e) => setRegForm({ ...regForm, bankAccount: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">Bank IFSC Code *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="SBIN0001234"
                        value={regForm.ifscCode}
                        onChange={(e) => setRegForm({ ...regForm, ifscCode: e.target.value })}
                        className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-nira-text-secondary uppercase mb-1">UPI ID for Instant Earning Withdrawals *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="nira6studio@okaxis"
                      value={regForm.upiId}
                      onChange={(e) => setRegForm({ ...regForm, upiId: e.target.value })}
                      className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                    />
                  </div>

                  <div className="p-4 bg-nira-yellow/10 border border-nira-yellow/30 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-nira-dark shrink-0 mt-0.5" />
                    <p className="text-[10px] text-nira-text-secondary leading-relaxed">
                      NIRA6 Partner Central operates under safe secure escrow frameworks. Funds are disbursed instantly to your listed bank/UPI account upon customer diagnostics approval or delivery confirmation tracking triggers.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons inside onboarding */}
              <div className="flex justify-between items-center pt-6 border-t border-nira-gray-dark">
                {onboardStep > 1 ? (
                  <button 
                    type="button"
                    onClick={() => setOnboardStep(onboardStep - 1)}
                    className="px-5 py-2.5 bg-white border border-nira-gray-dark rounded-xl text-xs font-bold uppercase tracking-wider text-nira-text-secondary hover:bg-nira-gray transition-colors"
                  >
                    Back Step
                  </button>
                ) : <div />}

                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer inline-flex items-center gap-1.5"
                >
                  {onboardStep === 3 ? 'Complete Onboarding & Verify' : 'Save & Continue'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          
          /* PHASE 2: VERIFIED SELLER DASHBOARD CENTRAL HUB */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar navigation tabs */}
            <div className="lg:col-span-3 space-y-4">
              {/* Profile Card Summary */}
              <div className="bg-white rounded-3xl border border-nira-gray-dark p-6 text-center shadow-sm">
                <div className="relative w-16 h-16 bg-nira-dark rounded-2xl flex items-center justify-center font-heading font-black text-nira-yellow text-2xl mx-auto mb-3 shadow-inner">
                  M6
                  {isBadgeGranted && (
                    <span title="Verified Studio Badge" className="absolute -bottom-1.5 -right-1.5 bg-nira-success text-white p-0.5 rounded-full border-2 border-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-extrabold text-sm text-nira-dark uppercase tracking-wider leading-relaxed">{regForm.businessName}</h3>
                <p className="text-[9px] text-nira-text-secondary uppercase tracking-widest font-black mt-1">Verified partner base Madurai</p>
                <div className="mt-3 flex justify-center gap-1.5">
                  <span className="text-[8px] bg-nira-success/15 text-nira-success px-2 py-0.5 rounded-full font-black uppercase">KYC: {kycStatus}</span>
                  <span className="text-[8px] bg-nira-yellow/20 text-nira-dark px-2 py-0.5 rounded-full font-black uppercase">Role: {partnerRole === 'seller' ? 'Gear Vendor' : 'Service Expert'}</span>
                </div>
              </div>

              {/* Navigation lists */}
              <div className="bg-white rounded-3xl border border-nira-gray-dark overflow-hidden p-2.5 shadow-sm space-y-1">
                <button 
                  onClick={() => setActiveDashTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeDashTab === 'overview' ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <BarChart3 className="w-4 h-4" /> Performance Analytics
                </button>
                <button 
                  onClick={() => setActiveDashTab('products')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeDashTab === 'products' ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <Package className="w-4 h-4" /> Product Catalog
                </button>
                <button 
                  onClick={() => setActiveDashTab('services')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeDashTab === 'services' ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <Calendar className="w-4 h-4" /> Freelance Bookings
                </button>
                <button 
                  onClick={() => setActiveDashTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeDashTab === 'orders' ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <Truck className="w-4 h-4" /> Dispatch & Logistics
                </button>
                <button 
                  onClick={() => setActiveDashTab('payouts')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeDashTab === 'payouts' ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <Wallet className="w-4 h-4" /> Wallet & Withdrawals
                </button>
                <button 
                  onClick={() => setActiveDashTab('chat')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeDashTab === 'chat' ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Buyer-Seller Chat
                </button>
                <button 
                  onClick={() => setActiveDashTab('moderation')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeDashTab === 'moderation' ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> Admin Moderations
                </button>
              </div>

              {/* Help & Support Card */}
              <div className="bg-nira-dark text-white rounded-3xl p-5 text-left relative overflow-hidden shadow-md">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-yellow mb-1">Madurai Partner Help</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">Need physical diagnostic equipment support, tags calibration or waybill dispatch inquiries?</p>
                <a href="mailto:nira6studio@gmail.com" className="text-[10px] text-nira-yellow underline font-bold mt-2 block hover:text-white transition-colors">
                  nira6studio@gmail.com
                </a>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* TAB 1: OVERVIEW & PERFORMANCE ANALYTICS */}
              {activeDashTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 shadow-sm">
                      <span className="text-[9px] text-nira-text-secondary uppercase font-bold tracking-wider">Gross Volume Earning</span>
                      <h3 className="font-heading font-black text-xl text-nira-dark mt-1">{formatPrice(balance + 189000)}</h3>
                      <span className="text-[8px] text-nira-success font-bold">↑ 12.8% this month</span>
                    </div>
                    <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 shadow-sm">
                      <span className="text-[9px] text-nira-text-secondary uppercase font-bold tracking-wider">Pending Escrow</span>
                      <h3 className="font-heading font-black text-xl text-nira-dark mt-1">{formatPrice(balance)}</h3>
                      <span className="text-[8px] text-nira-text-secondary font-bold">Awaiting delivery verification</span>
                    </div>
                    <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 shadow-sm">
                      <span className="text-[9px] text-nira-text-secondary uppercase font-bold tracking-wider">Active Catalog Size</span>
                      <h3 className="font-heading font-black text-xl text-nira-dark mt-1">{products.length} Items</h3>
                      <span className="text-[8px] text-nira-yellow font-bold">{services.length} active service bookings</span>
                    </div>
                    <div className="bg-white border border-nira-gray-dark rounded-3xl p-5 shadow-sm">
                      <span className="text-[9px] text-nira-text-secondary uppercase font-bold tracking-wider">Performance Score</span>
                      <h3 className="font-heading font-black text-xl text-nira-dark mt-1">98 / 100</h3>
                      <span className="text-[8px] text-nira-success font-bold">★ Premium Seller Tier</span>
                    </div>
                  </div>

                  {/* Analytics chart simulation */}
                  <div className="bg-white rounded-3xl border border-nira-gray-dark p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark">Revenue Analytics (Live Tracker)</h3>
                        <p className="text-[10px] text-nira-text-secondary mt-0.5">Real-time daily transaction distributions across product catalog indices.</p>
                      </div>
                      <span className="text-[8px] bg-nira-success/10 text-nira-success px-2 py-0.5 rounded font-black uppercase">Live Updates Active</span>
                    </div>
                    
                    {/* Simulated visual graph lines */}
                    <div className="relative h-44 w-full bg-nira-gray/20 rounded-2xl overflow-hidden flex items-end p-4 border border-nira-gray-dark gap-2">
                      <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-20 pointer-events-none">
                        <div className="border-b border-nira-dark w-full" />
                        <div className="border-b border-nira-dark w-full" />
                        <div className="border-b border-nira-dark w-full" />
                      </div>
                      <div className="w-full flex items-end justify-between h-32 px-4 z-10">
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-6 sm:w-10 bg-nira-dark hover:bg-nira-yellow transition-all rounded-t-lg h-12" title="Week 1: ₹35,000" />
                          <span className="text-[8px] font-bold text-nira-text-secondary mt-1">Week 1</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-6 sm:w-10 bg-nira-dark hover:bg-nira-yellow transition-all rounded-t-lg h-24" title="Week 2: ₹125,000" />
                          <span className="text-[8px] font-bold text-nira-text-secondary mt-1">Week 2</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-6 sm:w-10 bg-nira-dark hover:bg-nira-yellow transition-all rounded-t-lg h-16" title="Week 3: ₹74,000" />
                          <span className="text-[8px] font-bold text-nira-text-secondary mt-1">Week 3</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-6 sm:w-10 bg-nira-yellow transition-all rounded-t-lg h-28" title="Week 4: ₹189,000" />
                          <span className="text-[8px] font-bold text-nira-text-secondary mt-1">Week 4 (Current)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer feedback list */}
                  <div className="bg-white rounded-3xl border border-nira-gray-dark p-6 shadow-sm">
                    <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-4">Recent Partner Reviews</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-nira-gray/30 border border-nira-gray-dark rounded-2xl flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-nira-dark">Karthik R. <span className="text-[8px] bg-nira-success/15 text-nira-success px-2 py-0.5 rounded-full font-black uppercase">Verified Buyer</span></p>
                          <p className="text-xs text-nira-text-secondary mt-1">&quot;The Sony full-frame camera condition matches flawless. Madurai Cine Studio is very professional and packaged the original accessories very cleanly!&quot;</p>
                        </div>
                        <div className="flex gap-0.5 text-nira-yellow shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCT MANAGEMENT SYSTEM */}
              {activeDashTab === 'products' && (
                <div className="space-y-6">
                  {/* Top bar controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">Product Catalog Central</h3>
                      <p className="text-xs text-nira-text-secondary">Sync specs tags, dimensions, brand categorizations, and physical details.</p>
                    </div>
                    
                    <button 
                      onClick={handleBulkUploadSimulate}
                      disabled={bulkProgress}
                      className="px-5 py-2.5 bg-nira-dark text-white hover:bg-nira-yellow hover:text-nira-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" /> {bulkProgress ? 'Importing Workbooks...' : 'Bulk Spreadsheet Upload'}
                    </button>
                  </div>

                  {/* Advanced Product Listing Form Component */}
                  <ProductListingForm onSuccess={handleProductAdded} sellerName={regForm.businessName} />

                  {/* Active Products List */}
                  <div className="bg-white rounded-3xl border border-nira-gray-dark overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-nira-gray-dark bg-nira-gray/10">
                      <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark">Listed Gear ({products.length})</h4>
                    </div>
                    <div className="divide-y divide-nira-gray-dark">
                      {products.map((p) => (
                        <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-nira-gray rounded-xl overflow-hidden relative shrink-0">
                              <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
                            </div>
                            <div>
                              <p className="text-xs font-black text-nira-dark">{p.name}</p>
                              <p className="text-[9px] text-nira-text-secondary uppercase font-bold">{p.brand} • SKU: {p.id.slice(-6)} • {p.inStock ? 'In Stock' : 'Out of Stock'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                            <span className="font-heading font-black text-sm text-nira-dark">{formatPrice(p.price)}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] bg-nira-success/15 text-nira-success px-2 py-0.5 rounded font-black uppercase">Active</span>
                              <button aria-label="Button" title="Button" 
                                onClick={() => {
                                  setProducts(products.filter(item => item.id !== p.id));
                                  alert('Item de-indexed successfully.');
                                }}
                                className="p-2 text-nira-text-secondary hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SERVICES AND FREELANCE BOOKINGS */}
              {activeDashTab === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">Freelance Services Hub</h3>
                    <p className="text-xs text-nira-text-secondary">Publish hourly freelance schedules, photo editing, reels creation portfolios, or dynamic wedding editing.</p>
                  </div>

                  {/* Add Service listing form */}
                  <div className="bg-white rounded-3xl border border-nira-gray-dark p-6 shadow-sm">
                    <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark mb-4 pb-2 border-b border-nira-gray-dark flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-nira-yellow" /> Create Service Profile Listing
                    </h4>
                    
                    <form onSubmit={handleAddService} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Service Profile Title *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Reels Fast-Cut Cinematic Editing"
                            value={newSrv.title}
                            onChange={(e) => setNewSrv({ ...newSrv, title: e.target.value })}
                            className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Role Category</label>
                          <select aria-label="Select option" title="Select option"
                            value={newSrv.category}
                            onChange={(e) => setNewSrv({ ...newSrv, category: e.target.value })}
                            className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent cursor-pointer"
                          >
                            <option value="Video Editor">Video Editor</option>
                            <option value="Photo Editor">Photo Editor</option>
                            <option value="Reels Editor">Reels Editor</option>
                            <option value="Renter Support">Renter Coordinator</option>
                            <option value="Diagnostics Inspector">Diagnostics Inspector</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Rate (₹ Per Hour) *</label>
                          <input 
                            type="number" 
                            required
                            placeholder="1200"
                            value={newSrv.pricePerHour || ''}
                            onChange={(e) => setNewSrv({ ...newSrv, pricePerHour: Number(e.target.value) })}
                            className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Timings Availability</label>
                          <input 
                            type="text" 
                            placeholder="Mon-Sat: 10 AM - 7 PM"
                            value={newSrv.availableTimings}
                            onChange={(e) => setNewSrv({ ...newSrv, availableTimings: e.target.value })}
                            className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Service Area Range</label>
                          <input 
                            type="text" 
                            placeholder="Remote / Madurai Studio desk"
                            value={newSrv.serviceArea}
                            onChange={(e) => setNewSrv({ ...newSrv, serviceArea: e.target.value })}
                            className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Creator Experience / Portfolios Link</label>
                          <input 
                            type="text" 
                            placeholder="5 Years wedding editing"
                            value={newSrv.experience}
                            onChange={(e) => setNewSrv({ ...newSrv, experience: e.target.value })}
                            className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Certifications</label>
                        <input 
                          type="text" 
                          placeholder="Adobe Certified Premier Pro Expert"
                          value={newSrv.certifications}
                          onChange={(e) => setNewSrv({ ...newSrv, certifications: e.target.value })}
                          className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Service Listings Descriptions *</label>
                        <textarea 
                          required
                          placeholder="Details of editing tools, HSL color grading styles, reels transition templates, or render outputs."
                          value={newSrv.description}
                          onChange={(e) => setNewSrv({ ...newSrv, description: e.target.value })}
                          className="px-4 py-3 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none focus:border-nira-yellow border border-transparent"
                          rows={2}
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Publish Freelancer Service Profile
                      </button>
                    </form>
                  </div>

                  {/* Active Services List */}
                  <div className="bg-white rounded-3xl border border-nira-gray-dark overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-nira-gray-dark bg-nira-gray/10">
                      <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark">Active Service Listings ({services.length})</h4>
                    </div>
                    <div className="divide-y divide-nira-gray-dark">
                      {services.map((s) => (
                        <div key={s.id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div>
                            <span className="text-[8px] bg-nira-dark text-nira-yellow px-2 py-0.5 rounded font-black uppercase tracking-widest">{s.category}</span>
                            <h4 className="text-xs font-black text-nira-dark mt-1.5">{s.title}</h4>
                            <p className="text-[10px] text-nira-text-secondary mt-1">{s.description}</p>
                            <div className="mt-2.5 flex items-center gap-4 text-[9px] text-nira-text-secondary font-bold">
                              <span>📅 {s.availableTimings}</span>
                              <span>📍 {s.serviceArea}</span>
                              <span>🎓 {s.certifications}</span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 gap-2">
                            <span className="font-heading font-black text-sm text-nira-dark">₹{s.pricePerHour}/hr</span>
                            <button 
                              onClick={() => {
                                setServices(services.filter(item => item.id !== s.id));
                                alert('Service profile de-indexed.');
                              }}
                              className="text-[9px] bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl font-black uppercase tracking-wider transition-colors shrink-0"
                            >
                              Remove Listing
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DISPATCH, PICKUP REQUESTS & LOGISTICS */}
              {activeDashTab === 'orders' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">Logistics & Shipments Manager</h3>
                    <p className="text-xs text-nira-text-secondary">Delhivery & Bluedart logistics sync. Generate waybill labels and pickup requests centered in Madurai India.</p>
                  </div>

                  {/* Active Orders List */}
                  <div className="bg-white rounded-3xl border border-nira-gray-dark overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-nira-gray-dark bg-nira-gray/10">
                      <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark">Partner Customer Orders ({orders.length})</h4>
                    </div>
                    <div className="divide-y divide-nira-gray-dark">
                      {orders.map((o) => (
                        <div key={o.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[8px] bg-nira-gray px-2 py-0.5 rounded font-black uppercase tracking-widest text-nira-text-secondary">{o.id} • {o.date}</span>
                            <h4 className="text-xs font-black text-nira-dark mt-1.5">{o.itemName}</h4>
                            <p className="text-[10px] text-nira-text-secondary mt-1">Customer: <span className="font-bold">{o.customerName}</span></p>
                            {o.trackingId && (
                              <div className="mt-2 text-[9px] bg-nira-gray/50 border border-nira-gray-dark rounded-lg p-2 max-w-sm inline-block">
                                <span className="font-bold text-nira-dark block">Waybill Label Generated</span>
                                <span className="text-nira-text-secondary">Provider: {o.shippingProvider} | Waybill ID: {o.trackingId}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 gap-2">
                            <span className="font-heading font-black text-sm text-nira-dark">{formatPrice(o.amount)}</span>
                            {o.status === 'Pending' ? (
                              <button 
                                onClick={() => handleShipOrder(o.id)}
                                className="px-4 py-2 bg-nira-success text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-nira-success/90 transition-colors"
                              >
                                Accept & Dispatch Pickup
                              </button>
                            ) : (
                              <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase ${o.status === 'Shipped' ? 'bg-nira-yellow/20 text-nira-dark' : 'bg-nira-success/15 text-nira-success'}`}>
                                {o.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: WALLET, EARNINGS LEDGER AND PAYOUTS */}
              {activeDashTab === 'payouts' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider">Earnings Wallet Central</h3>
                    <p className="text-xs text-nira-text-secondary">Withdraw accumulated balances instantly to your Madurai linked accounts or UPI ID.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Wallet card */}
                    <div className="md:col-span-1 bg-white border border-nira-gray-dark rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-nira-text-secondary uppercase font-bold tracking-wider">Escrow Balance</span>
                        <h2 className="font-heading font-black text-3xl text-nira-dark mt-2">{formatPrice(balance)}</h2>
                        <p className="text-[8px] text-nira-text-secondary leading-relaxed mt-2">Verified diagnostics guarantees automatic checkout unlocks.</p>
                      </div>

                      <form onSubmit={handleWithdrawal} className="mt-6 space-y-3 border-t border-nira-gray-dark pt-4">
                        <label className="block text-[8px] font-bold text-nira-text-secondary uppercase">Withdrawal Amount (₹ INR)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="50000"
                          value={withdrawAmt}
                          onChange={(e) => setWithdrawAmt(e.target.value)}
                          className="w-full px-4 py-2.5 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none border border-transparent focus:border-nira-yellow"
                        />
                        <button 
                          type="submit"
                          className="w-full py-2.5 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          Withdraw to {regForm.upiId ? 'UPI' : 'Bank'}
                        </button>
                      </form>
                    </div>

                    {/* Withdrawal Ledger logs */}
                    <div className="md:col-span-2 bg-white rounded-3xl border border-nira-gray-dark overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-nira-gray-dark bg-nira-gray/10">
                        <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark">Escrow & Payout Ledger logs</h4>
                      </div>
                      <div className="divide-y divide-nira-gray-dark">
                        {payoutLogs.map((log) => (
                          <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[8px] bg-nira-gray px-2 py-0.5 rounded font-black uppercase text-nira-text-secondary">{log.id} • {log.date}</span>
                              <p className="text-[10px] text-nira-text-secondary mt-1">Channel: {log.channel}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-heading font-bold text-xs text-nira-dark">-{formatPrice(log.amount)}</span>
                              <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${log.status === 'Completed' ? 'bg-nira-success/15 text-nira-success' : 'bg-nira-yellow/20 text-nira-dark'}`}>
                                {log.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: BUYER-SELLER INTERACTIVE CHAT SIMULATOR */}
              {activeDashTab === 'chat' && (
                <div className="bg-white rounded-3xl border border-nira-gray-dark overflow-hidden shadow-sm flex flex-col h-[500px]">
                  {/* Header info */}
                  <div className="p-4 border-b border-nira-gray-dark bg-nira-gray/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-nira-dark text-nira-yellow rounded-xl flex items-center justify-center font-black text-xs">SK</div>
                      <div>
                        <h4 className="text-xs font-black text-nira-dark">Sanjay Kumar (Buyer)</h4>
                        <span className="text-[8px] text-nira-success font-bold">Active Buyer • Inquiring Sony Alpha</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-nira-success/10 text-nira-success px-2 py-0.5 rounded font-black uppercase">Live Chat Channel Secure</span>
                  </div>

                  {/* Messaging logs body */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-nira-gray/20">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`flex flex-col max-w-[70%] ${msg.sender === 'seller' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'seller' ? 'bg-nira-dark text-white rounded-tr-none' : 'bg-white border border-nira-gray-dark text-nira-dark rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-nira-text-secondary mt-1">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendChat} className="p-3 border-t border-nira-gray-dark flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type secure studio answer details..."
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-nira-gray rounded-xl text-xs text-nira-dark focus:outline-none border border-transparent focus:border-nira-yellow"
                    />
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      Transmit
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: ADMIN MODERATION PANEL BYPASS */}
              {activeDashTab === 'moderation' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-black text-lg text-nira-dark uppercase tracking-wider flex items-center gap-1.5 text-red-500">
                      <ShieldAlert className="w-5 h-5 animate-pulse" /> Admin Moderation & Overrides
                    </h3>
                    <p className="text-xs text-nira-text-secondary">Simulate admin moderators operations, KYC statuses updates, or verified tags granting.</p>
                  </div>

                  <div className="bg-white rounded-3xl border border-nira-gray-dark p-6 shadow-sm space-y-4">
                    <h4 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark pb-2 border-b border-nira-gray-dark">
                      Simulation Toggles
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* KYC Toggler */}
                      <div className="p-4 bg-nira-gray/30 border border-nira-gray-dark rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black text-nira-dark uppercase tracking-wider">KYC Approval State</span>
                          <p className="text-[9px] text-nira-text-secondary mt-1">Approve or reject the manual government Pan & license document uploads.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => {
                              setKycStatus('Verified');
                              alert('Admin KYC Verified status activated!');
                            }}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-colors ${kycStatus === 'Verified' ? 'bg-nira-success text-white border-nira-success' : 'border-nira-gray-dark hover:bg-nira-gray'}`}
                          >
                            Verified
                          </button>
                          <button 
                            onClick={() => {
                              setKycStatus('Pending');
                              alert('KYC state reset to Pending.');
                            }}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-colors ${kycStatus === 'Pending' ? 'bg-nira-yellow text-nira-dark' : 'border-nira-gray-dark hover:bg-nira-gray'}`}
                          >
                            Pending
                          </button>
                        </div>
                      </div>

                      {/* Verified Badge Toggler */}
                      <div className="p-4 bg-nira-gray/30 border border-nira-gray-dark rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black text-nira-dark uppercase tracking-wider">Verified badge grant</span>
                          <p className="text-[9px] text-nira-text-secondary mt-1">Grant the verified badge icon showing next to products search catalogues.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => {
                              setIsBadgeGranted(true);
                              alert('Verified badge granted!');
                            }}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-colors ${isBadgeGranted ? 'bg-nira-success text-white border-nira-success' : 'border-nira-gray-dark hover:bg-nira-gray'}`}
                          >
                            Granted
                          </button>
                          <button 
                            onClick={() => {
                              setIsBadgeGranted(false);
                              alert('Verified badge revoked.');
                            }}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-colors ${!isBadgeGranted ? 'bg-red-500 text-white border-red-500' : 'border-nira-gray-dark hover:bg-nira-gray'}`}
                          >
                            Revoked
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
