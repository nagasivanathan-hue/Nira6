'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Package, Wallet, Settings, LogOut, Camera, TrendingUp,
  ShoppingBag, Loader2, Upload, AlertCircle, CheckCircle2, FileSpreadsheet,
  FileUp, Download, Printer, ShieldCheck, ChevronRight, CornerDownLeft,
  MessageSquare, Sparkles, Plus, Check, Eye, Search
} from 'lucide-react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/authSlice';
import { fetchWishlist } from '@/store/wishlistSlice';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';
import api from '@/services/api';
import ProductCard from '@/components/products/ProductCard';
import dynamic from 'next/dynamic';
const TrackingMap = dynamic(() => import('@/components/orders/TrackingMap'), { ssr: false });

interface ExtendedOrder extends Order {
  taxAmount?: number;
  platformFee?: number;
  discountAmount?: number;
  couponApplied?: string;
  returned?: boolean;
  returnReason?: string;
  returnRequestedAt?: string;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'orders', label: 'Orders & Receipts', icon: Package },
  { id: 'wallet', label: 'Loyalty Wallet', icon: Wallet },
  { id: 'sell', label: 'Become a Seller', icon: Camera },
  { id: 'support-tickets', label: 'CRM & Diagnostics', icon: AlertCircle },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'bulk-import', label: 'Bulk Import', icon: Upload },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const statusColors: Record<string, string> = {
  delivered: 'text-emerald-500',
  shipped: 'text-blue-500',
  processing: 'text-amber-500',
  cancelled: 'text-red-500'
};

interface ProductImport {
  rowNumber: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  grade: string;
  conditionScore?: number;
  featured: boolean;
  trending: boolean;
  specs: Record<string, string>;
  stock: number;
  description?: string;
  seller?: string;
  warranty?: string;
  errors: string[];
}

interface SheetJSUtils {
  sheet_to_json: (sheet: unknown) => Record<string, unknown>[];
  aoa_to_sheet: (aoa: (string | number | boolean)[][]) => unknown;
  book_new: () => unknown;
  book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
}

interface SheetJSLibrary {
  utils: SheetJSUtils;
  read: (data: unknown, options: { type: string }) => { SheetNames: string[]; Sheets: Record<string, unknown> };
  writeFile: (wb: unknown, filename: string) => void;
}

interface GlobalWithXLSX {
  XLSX?: SheetJSLibrary;
}

// CRM ticket interface
interface SupportTicket {
  _id: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  conversations: {
    sender: 'user' | 'agent';
    message: string;
    timestamp: string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: userInfo, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const userRole = userInfo?.role || 'user';

  // Dynamic tab configuration
  const allowedTabs = tabs.filter(tab => {
    if (tab.id === 'bulk-import') {
      return userRole === 'creator' || userRole === 'admin' || userRole === 'super_admin';
    }
    return true;
  }).map(tab => {
    if (tab.id === 'sell' && userRole === 'creator') {
      return { ...tab, label: 'Sell Gear' };
    }
    return tab;
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ProductImport[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [successData, setSuccessData] = useState<{ total: number; imported: number; message: string } | null>(null);

  // New features state
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [returnReasonInput, setReturnReasonInput] = useState('');
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);

  // Wallet simulator state
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState<{ type: string; amount: number; description: string; date: string }[]>([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  // CRM tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Buy');
  const [ticketDesc, setTicketDesc] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Multi-seller listing submission state
  const [sellForm, setSellForm] = useState({
    name: '',
    brand: '',
    category: 'Cameras',
    price: '',
    originalPrice: '',
    grade: 'Like New',
    description: '',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
    specKey1: 'Standard Resolution',
    specVal1: '24.2 Megapixels',
    specKey2: 'Optical Zoom',
    specVal2: '3x Kit Zoom'
  });
  const [submittingGear, setSubmittingGear] = useState(false);

  // Load SheetJS dynamically from CDN
  const loadSheetJS = (): Promise<SheetJSLibrary> => {
    return new Promise((resolve, reject) => {
      const globalWindow = window as unknown as GlobalWithXLSX;
      if (globalWindow.XLSX) {
        resolve(globalWindow.XLSX);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.async = true;
      script.onload = () => {
        if (globalWindow.XLSX) {
          resolve(globalWindow.XLSX);
        } else {
          reject(new Error('SheetJS library failed to initialize on window object.'));
        }
      };
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersRes = await api.get('/orders/myorders');
        setOrders(ordersRes.data);

        dispatch(fetchWishlist());

        // Fetch wallet balance
        const walletRes = await api.get('/users/wallet');
        setWalletBalance(walletRes.data.walletBalance || 0);
        setWalletHistory(walletRes.data.walletTransactions || []);

        // Fetch support tickets
        const ticketsRes = await api.get('/support/tickets');
        setTickets(ticketsRes.data || []);
      } catch (_err) {
        console.error("Failed to fetch dashboard data", _err);
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    } else if (userInfo && (userInfo.role === 'admin' || userInfo.role === 'super_admin')) {
      router.push('/dashboard/admin');
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, userInfo, router, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  // Download pre-formatted Excel template
  const downloadTemplate = async () => {
    try {
      const XLSX = await loadSheetJS();
      const headers = [
        ['name', 'brand', 'price', 'category', 'image', 'grade', 'conditionScore', 'featured', 'trending', 'stock', 'description', 'seller', 'warranty', 'specs_key1', 'specs_val1', 'specs_key2', 'specs_val2']
      ];
      const sampleData = [
        ['NIRA6 Studio Headphones Pro', 'Audio-Technica', 12500, 'Audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Excellent', 92, 'TRUE', 'FALSE', 5, 'Professional studio grade monitoring headphones with active noise cancellation.', 'NIRA6 Certified', '6 Months NIRA6 Warranty', 'Driver Size', '45mm', 'Impedance', '38 Ohms']
      ];
      const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]) as Record<string, unknown>;
      const wb = XLSX.utils.book_new() as Record<string, unknown>;
      XLSX.utils.book_append_sheet(wb, ws, 'Products Template');
      XLSX.writeFile(wb, 'NIRA6_Bulk_Product_Template.xlsx');
    } catch {
      alert('Failed to load SheetJS library. Please check your internet connection.');
    }
  };

  // Parse Excel file client-side
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setSuccessData(null);
    setParsing(true);

    try {
      const XLSX = await loadSheetJS();
      const reader = new FileReader();

      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result as string;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = XLSX.utils.sheet_to_json(ws);

          if (rawData.length === 0) {
            setUploadError('The uploaded file contains no data rows.');
            setParsing(false);
            return;
          }

          const validGrades = ['Like New', 'Excellent', 'Good', 'Fair'];
          const parsed = rawData.map((rawRow, index) => {
            const row = rawRow as Record<string, unknown> & {
              name?: string;
              brand?: string;
              price?: number;
              category?: string;
              image?: string;
              grade?: string;
              conditionScore?: number;
              featured?: string | boolean;
              trending?: string | boolean;
              stock?: number;
              description?: string;
              seller?: string;
              warranty?: string;
            };
            const errors: string[] = [];

            const name = String(row.name || '').trim();
            if (!name) errors.push('Product name is required.');

            const brand = String(row.brand || '').trim();
            if (!brand) errors.push('Brand is required.');

            const price = Number(row.price);
            if (isNaN(price) || price <= 0) errors.push('Price must be a positive number.');

            const category = String(row.category || '').trim();
            if (!category) errors.push('Category is required.');

            const image = String(row.image || '').trim();
            if (!image) errors.push('Image URL is required.');

            let grade = String(row.grade || '').trim();
            const matchedGrade = validGrades.find(g => g.toLowerCase() === grade.toLowerCase());
            if (matchedGrade) {
              grade = matchedGrade;
            } else {
              errors.push(`Grade must be 'Like New', 'Excellent', 'Good', or 'Fair' (got: "${grade}").`);
            }

            const conditionScore = row.conditionScore !== undefined ? Number(row.conditionScore) : undefined;
            if (conditionScore !== undefined && (isNaN(conditionScore) || conditionScore < 0 || conditionScore > 100)) {
              errors.push('Condition Score must be a number between 0 and 100.');
            }

            const specs: Record<string, string> = {};
            for (let i = 1; i <= 5; i++) {
              const k = row[`specs_key${i}`];
              const v = row[`specs_val${i}`];
              if (k && v) {
                specs[String(k).trim()] = String(v).trim();
              }
            }

            const featured = String(row.featured).toLowerCase() === 'true';
            const trending = String(row.trending).toLowerCase() === 'true';
            const stock = Number(row.stock || 1);

            return {
              rowNumber: index + 2,
              name,
              brand,
              price: isNaN(price) ? 0 : price,
              category,
              image,
              grade,
              conditionScore,
              featured,
              trending,
              specs,
              stock: isNaN(stock) ? 1 : stock,
              description: row.description,
              seller: row.seller,
              warranty: row.warranty,
              errors
            };
          });

          setParsedProducts(parsed);
        } catch {
          setUploadError('Error processing file layout. Ensure it is a valid spreadsheet.');
        } finally {
          setParsing(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch {
      setUploadError('Failed to initialize workbook tools.');
      setParsing(false);
    }
  };

  // Submit bulk imports to backend
  const handleBulkImportSubmit = async () => {
    const validProducts = parsedProducts.filter((p) => p.errors.length === 0);
    if (validProducts.length === 0) {
      alert('There are no valid products to import. Please fix any validation errors and re-upload.');
      return;
    }

    setImporting(true);

    try {
      const response = await api.post('/products/bulk', validProducts.map((p) => ({
        name: p.name,
        brand: p.brand,
        price: p.price,
        category: p.category,
        image: p.image,
        grade: p.grade,
        conditionScore: p.conditionScore,
        featured: p.featured,
        trending: p.trending,
        specs: p.specs,
        stock: p.stock,
        description: p.description,
        seller: p.seller,
        warranty: p.warranty
      })));

      setSuccessData({
        total: parsedProducts.length,
        imported: validProducts.length,
        message: (response.data as { message?: string }).message || 'Import successful!'
      });
      setParsedProducts([]);

      // Notify
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '📦 Bulk Import Succeeded!',
          content: `${validProducts.length} new high-end creator gear items were appended to catalogue.`
        }
      }));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Failed to import products to server.';
      setUploadError(msg);
    } finally {
      setImporting(false);
    }
  };

  // Wallet top-up handler
  const handleWalletTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(topUpAmount);
    if (!topUpAmount || isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    setDepositing(true);
    try {
      const res = await api.post('/users/wallet', { amount: amountNum });
      setWalletBalance(res.data.walletBalance);
      setWalletHistory(res.data.walletTransactions || []);
      setTopUpAmount('');

      // Trigger Notification
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '💰 Wallet Credited!',
          content: `Deposited ₹${amountNum.toLocaleString('en-IN')} via secure simulated UPI routing.`
        }
      }));
    } catch {
      alert('Failed to simulate deposit. Please try again.');
    } finally {
      setDepositing(false);
    }
  };

  // Support ticket CRM creation handler
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) {
      alert('Please enter subject and description');
      return;
    }

    setCreatingTicket(true);
    try {
      const res = await api.post('/support/tickets', {
        category: ticketCategory,
        subject: ticketSubject,
        description: ticketDesc
      });
      setTickets([res.data, ...tickets]);
      setTicketSubject('');
      setTicketDesc('');

      // Dispatch alert
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🎫 Support Ticket Registered!',
          content: `Diagnostics ticket CRM-${res.data._id.slice(-6).toUpperCase()} logged. Auto-AI is scanning.`
        }
      }));
    } catch {
      alert('Failed to log ticket. Try again.');
    } finally {
      setCreatingTicket(false);
    }
  };

  // Submit new product from Seller Hub
  const handlePublishGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellForm.name || !sellForm.brand || !sellForm.price) {
      alert('Please provide Name, Brand and Price.');
      return;
    }

    setSubmittingGear(true);
    try {
      const specsMap: Record<string, string> = {};
      if (sellForm.specKey1 && sellForm.specVal1) specsMap[sellForm.specKey1] = sellForm.specVal1;
      if (sellForm.specKey2 && sellForm.specVal2) specsMap[sellForm.specKey2] = sellForm.specVal2;

      await api.post('/products', {
        name: sellForm.name,
        brand: sellForm.brand,
        category: sellForm.category,
        price: Number(sellForm.price),
        originalPrice: sellForm.originalPrice ? Number(sellForm.originalPrice) : undefined,
        grade: sellForm.grade,
        description: sellForm.description,
        image: sellForm.image,
        specs: specsMap
      });

      // Clear Form
      setSellForm({
        name: '',
        brand: '',
        category: 'Cameras',
        price: '',
        originalPrice: '',
        grade: 'Like New',
        description: '',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
        specKey1: 'Standard Resolution',
        specVal1: '24.2 Megapixels',
        specKey2: 'Optical Zoom',
        specVal2: '3x Kit Zoom'
      });

      // Notify catalog addition
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🚀 Listing Published!',
          content: 'Your camera gear was successfully submitted & published to public recommerce catalogs.'
        }
      }));
      alert('Gear listing published successfully to NIRA6 marketplace!');
    } catch {
      alert('Failed to publish gear listing.');
    } finally {
      setSubmittingGear(false);
    }
  };

  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [returnStep, setReturnStep] = useState(1);
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);
  const [returnUploadProgress, setReturnUploadProgress] = useState(false);
  const [returnMethod, setReturnMethod] = useState('wallet');
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  const handleReturnPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setReturnUploadProgress(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setReturnPhotos(prev => [...prev, res.data.fileUrl]);
      }
    } catch {
      alert('Photo upload failed. Please try again.');
    } finally {
      setReturnUploadProgress(false);
    }
  };

  // Handle Order cancellation & returns with multi-step wizard
  const handleInitiateReturn = async (oId: string) => {
    if (!returnReasonInput) {
      alert('Please enter a brief explanation reason for your return diagnostics.');
      return;
    }

    setReturnSubmitting(true);
    try {
      await api.post(`/orders/return`, {
        orderObjectId: oId,
        reason: returnReasonInput,
        photos: returnPhotos,
        refundMethod: returnMethod
      });

      // Update order status in frontend array
      setOrders(prev => prev.map(o => o._id === oId ? { ...o, orderStatus: 'return_requested' } : o));

      // Refresh wallet balances if wallet was instantly processed (though here it requires admin approval first)
      const walletRes = await api.get('/users/wallet');
      setWalletBalance(walletRes.data.walletBalance || 0);
      setWalletHistory(walletRes.data.walletTransactions || []);

      setReturnStep(4); // Show success step

      // Dispatch alert
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '↩️ Return Registered!',
          content: `Return request submitted for Order #${(selectedOrder?.orderId || oId).slice(-8).toUpperCase()}. Awaiting admin approval.`
        }
      }));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Return processing failed. Eligible diagnostics might have expired.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* User Header Profile Card */}
        <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-6 shadow-sm border border-nira-gray-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nira-yellow/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="w-20 h-20 bg-nira-dark rounded-2xl flex items-center justify-center text-white font-heading font-bold text-2xl uppercase border-2 border-nira-yellow relative">
            {userInfo.name?.slice(0, 2)}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="font-heading font-bold text-2xl text-nira-dark">{userInfo.name}</h1>
              {userRole === 'creator' ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-nira-yellow text-nira-dark text-[9px] font-black tracking-widest uppercase rounded-full w-fit mx-auto sm:mx-0 shadow-sm border border-amber-300">
                  <Sparkles className="w-3 h-3 fill-nira-dark" /> Verified Creator & Partner
                </span>
              ) : userRole === 'admin' || userRole === 'super_admin' ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-rose-600 text-white text-[9px] font-black tracking-widest uppercase rounded-full w-fit mx-auto sm:mx-0 shadow-sm">
                  <ShieldCheck className="w-3 h-3" /> System Administrator
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-black tracking-widest uppercase rounded-full w-fit mx-auto sm:mx-0 border border-emerald-500/25">
                  <CheckCircle2 className="w-3 h-3" /> Active Member
                </span>
              )}
            </div>
            <p className="text-nira-text-secondary text-sm">{userInfo.email} • Active Member • Diagnostics Core</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2.5">
              <span className="flex items-center gap-1 text-xs text-nira-text-secondary"><ShoppingBag className="w-3.5 h-3.5 text-nira-yellow" /> <span className="font-bold text-nira-dark">{orders.length}</span> Orders</span>
              <span className="flex items-center gap-1 text-xs text-nira-text-secondary"><Wallet className="w-3.5 h-3.5 text-nira-yellow" /> Balance: <span className="font-bold text-nira-dark">₹{walletBalance.toLocaleString('en-IN')}</span></span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Dashboard Navigation Sidepanel */}
          <aside className="lg:w-60 flex-shrink-0">
            <nav className="bg-white rounded-2xl p-3 flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide shadow-sm border border-nira-gray-dark">
              {allowedTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedTicket(null);
                  }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
              <hr className="my-2 border-nira-gray-dark hidden lg:block" />
              {userInfo.role === 'creator' && (
                <Link href="/dashboard/creator" className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-nira-dark bg-nira-yellow hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer mb-1 shadow-sm">
                  <Sparkles className="w-4 h-4" /> Creator Hub
                </Link>
              )}
              {userInfo.role === 'admin' && (
                <Link href="/dashboard/admin" className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark transition-colors whitespace-nowrap cursor-pointer mb-1 shadow-sm">
                  <ShieldCheck className="w-4 h-4" /> Admin Console
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 whitespace-nowrap cursor-pointer">
                <LogOut className="w-4 h-4" /> Logout Account
              </button>
            </nav>
          </aside>

          {/* Main Work Content Panels */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-nira-gray-dark shadow-sm">
                <Loader2 className="w-8 h-8 text-nira-yellow animate-spin mb-4" />
                <p className="text-nira-text-secondary text-sm">Synchronizing diagnostics registry...</p>
              </div>
            ) : (
              <>
                {/* 1. Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats Metrics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Purchased Gear', value: orders.length.toString(), icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/15' },
                        { label: 'Wallet Balance', value: `₹${walletBalance.toLocaleString('en-IN')}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
                        { label: 'Wishlist items', value: wishlistItems.length.toString(), icon: Heart, color: 'text-red-500', bg: 'bg-red-500/15' },
                        { label: 'Logged Tickets', value: tickets.length.toString(), icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/15' },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-nira-gray-dark hover:shadow-md transition-all">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-4 h-4" />
                          </div>
                          <p className="font-heading font-black text-xl text-nira-dark">{stat.value}</p>
                          <p className="text-[10px] text-nira-text-secondary font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick Notifications Center Alert Indicator banner */}
                    <div className="bg-nira-dark text-white rounded-2xl p-5 border border-nira-yellow/20 relative overflow-hidden flex flex-col sm:flex-row items-center gap-4">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-nira-yellow/5 rounded-full blur-xl" />
                      <div className="w-10 h-10 bg-nira-yellow/10 border border-nira-yellow/20 rounded-xl flex items-center justify-center text-nira-yellow shrink-0">
                        <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h4 className="font-heading font-bold text-sm text-nira-yellow">Real-time Transaction alerts logging is active!</h4>
                        <p className="text-[11px] text-nira-text-secondary mt-0.5 leading-relaxed">Place an order or trigger returns to capture live SMS simulation layouts inside the Navbar bell drawer.</p>
                      </div>
                      <button onClick={() => setActiveTab('wallet')} className="px-4 py-2 bg-white text-nira-dark font-bold text-xs rounded-xl hover:bg-nira-yellow transition-all shrink-0 cursor-pointer">Simulate Wallet UPI</button>
                    </div>

                    {/* Recent Orders block */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-bold text-base text-nira-dark uppercase tracking-wider">Recent Transactional Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-xs text-nira-yellow font-black uppercase tracking-wider cursor-pointer">View All</button>
                      </div>
                      <div className="space-y-3">
                        {orders.length > 0 ? (
                          orders.slice(0, 3).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-3.5 bg-nira-gray/50 hover:bg-nira-gray/80 rounded-xl border border-nira-gray-dark transition-all">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-white rounded-lg border border-nira-gray-dark flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-nira-yellow" /></div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-nira-dark truncate max-w-[140px] sm:max-w-xs">{order.items[0]?.product?.name || 'Diagnostic Equipment Package'}</p>
                                  <p className="text-[10px] text-nira-text-secondary mt-0.5">#{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="font-black text-xs text-nira-dark">{formatPrice(order.totalAmount)}</p>
                                  <span className={`text-[9px] font-black uppercase ${statusColors[order.orderStatus] || 'text-amber-500'}`}>
                                    {order.returned ? 'Returned & Refunded' : order.orderStatus}
                                  </span>
                                </div>
                                <Link
                                  href={`/orders/${order._id}/track`}
                                  className="p-1.5 hover:bg-nira-yellow hover:text-nira-dark bg-nira-dark text-white rounded-lg transition-colors cursor-pointer"
                                  title="View Receipt & Tracking"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-nira-text-secondary text-xs">No purchased orders discovered in diagnostics registry.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Orders Tab */}
                {activeTab === 'orders' && (() => {
                  const filteredOrders = orders.filter((order) => {
                    const matchesQuery = 
                      (order.orderId || '').toLowerCase().includes(orderQuery.toLowerCase()) ||
                      order._id.toLowerCase().includes(orderQuery.toLowerCase()) ||
                      order.items.some(item => (item.product?.name || '').toLowerCase().includes(orderQuery.toLowerCase())) ||
                      (order.invoiceNumber || '').toLowerCase().includes(orderQuery.toLowerCase());
                    
                    if (orderStatusFilter === 'all') return matchesQuery;
                    if (orderStatusFilter === 'returned') {
                      return matchesQuery && ['returned', 'return_requested', 'refund_initiated', 'refund_completed'].includes(order.orderStatus);
                    }
                    return matchesQuery && order.orderStatus === orderStatusFilter;
                  });

                  return (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-nira-gray-dark pb-4">
                        <div>
                          <h3 className="font-heading font-bold text-base text-nira-dark uppercase tracking-wider">All Orders &amp; Receipts</h3>
                          <p className="text-[10px] text-nira-text-secondary mt-0.5">Filter and search through your visual gear purchases</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Search input */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search Order ID or item..."
                              value={orderQuery}
                              onChange={(e) => setOrderQuery(e.target.value)}
                              className="pl-8 pr-4 py-2 bg-nira-gray rounded-xl text-xs border border-transparent focus:border-nira-yellow focus:bg-white focus:outline-none w-48 font-bold text-nira-dark"
                            />
                            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3" />
                          </div>
                          {/* Filter status */}
                          <select
                            title="Filter Status"
                            aria-label="Filter Status"
                            value={orderStatusFilter}
                            onChange={(e) => setOrderStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-nira-gray rounded-xl text-xs border border-transparent focus:border-nira-yellow focus:outline-none cursor-pointer font-bold text-nira-dark"
                          >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="return_requested">Return Requested</option>
                            <option value="returned">Returned</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => (
                            <div key={order._id} className="p-4 bg-nira-gray/40 hover:bg-nira-gray/70 border border-nira-gray-dark rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 bg-white rounded-xl border border-nira-gray-dark flex items-center justify-center shrink-0 mt-0.5"><Package className="w-5 h-5 text-nira-yellow" /></div>
                                <div className="min-w-0">
                                  <p className="font-bold text-xs text-nira-dark truncate max-w-[200px] sm:max-w-sm">{order.items[0]?.product?.name || 'Visual Pack'}</p>
                                  <p className="text-[10px] text-nira-text-secondary mt-0.5">Order ID: <span className="font-mono font-bold text-nira-dark">{order.orderId || order._id.toUpperCase()}</span></p>
                                  <div className="flex gap-3 text-[9px] text-nira-text-secondary mt-1 font-semibold">
                                    <span>Date: {new Date(order.createdAt).toLocaleString('en-IN')}</span>
                                    <span>•</span>
                                    <span className="text-nira-dark font-bold">Payable: {formatPrice(order.totalAmount)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <div className="text-right mr-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    order.orderStatus === 'returned' || order.orderStatus === 'refunded' || order.orderStatus === 'refund_completed' ? 'bg-purple-100 text-purple-800' :
                                    order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                    order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {order.orderStatus.replace('_', ' ')}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setReturnStep(1);
                                    setReturnPhotos([]);
                                    setReturnMethod('wallet');
                                    setReturnReasonInput('');
                                  }}
                                  className="px-3.5 py-1.5 border border-nira-gray-dark hover:bg-nira-gray text-nira-dark font-bold text-xs rounded-xl transition-all cursor-pointer"
                                >
                                  Details &amp; Invoice
                                </button>
                                <Link
                                  href={`/orders/${order._id}/track`}
                                  className="px-3.5 py-1.5 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  Track AWB <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-nira-text-secondary text-xs">No orders recorded yet matching criteria.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Loyalty Wallet Tab */}
                {activeTab === 'wallet' && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-3 gap-6">

                      {/* Balance visual card */}
                      <div className="bg-nira-dark text-white rounded-2xl p-6 border border-nira-yellow/20 relative overflow-hidden flex flex-col justify-between sm:col-span-1 shadow-sm">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-nira-yellow/5 rounded-full blur-xl" />
                        <div>
                          <p className="text-[10px] text-nira-yellow font-black uppercase tracking-widest">Available Cash Balance</p>
                          <p className="font-heading font-black text-3xl mt-1.5">₹{walletBalance.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="mt-8 pt-4 border-t border-white/10">
                          <p className="text-[9px] text-nira-text-secondary uppercase font-bold">Estimated Loyalty Score</p>
                          <p className="text-xs font-bold text-white mt-0.5">✨ {Math.round(walletBalance * 0.1)} Points</p>
                        </div>
                      </div>

                      {/* Deposit Simulator Box */}
                      <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark sm:col-span-2 shadow-sm">
                        <h4 className="font-heading font-bold text-sm text-nira-dark uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <Wallet className="w-4 h-4 text-nira-yellow" /> UPI Credit Simulator
                        </h4>
                        <p className="text-xs text-nira-text-secondary leading-relaxed mb-4">Simulate an instant UPI loading process to test partial checkout pay features or COD waivers.</p>
                        <form onSubmit={handleWalletTopUp} className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Deposit amount (e.g. 5000)"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                            className="flex-1 px-4 py-3 bg-nira-gray rounded-xl text-xs border border-transparent focus:border-nira-yellow focus:bg-white focus:outline-none"
                            disabled={depositing}
                          />
                          <button
                            type="submit"
                            disabled={depositing}
                            className="px-5 py-3 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {depositing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Load Credit</>}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* History transaction listing */}
                    <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark shadow-sm">
                      <h4 className="font-heading font-bold text-sm text-nira-dark uppercase tracking-wider mb-4 border-b border-nira-gray-dark pb-3">Wallet transaction statements</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {walletHistory.length > 0 ? (
                          walletHistory.map((w, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-nira-gray/30 rounded-xl border border-nira-gray-dark/50">
                              <div>
                                <p className="text-xs font-bold text-nira-dark">{w.description}</p>
                                <p className="text-[9px] text-nira-text-secondary mt-0.5">{new Date(w.date).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-black text-xs ${w.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {w.type === 'credit' ? '+' : '-'} ₹{w.amount.toLocaleString('en-IN')}
                                </p>
                                <span className="text-[8px] uppercase bg-white border border-nira-gray-dark px-1.5 py-0.5 rounded font-black text-emerald-600 tracking-wider">Success</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-nira-text-secondary text-xs">No transactions recorded yet in statement history.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Sell Gear Tab (Creator seller submission) */}
                {activeTab === 'sell' && (
                  userRole === 'creator' ? (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark animate-fade-in">
                      <div className="mb-6 border-b border-nira-gray-dark pb-4">
                        <h3 className="font-heading font-bold text-base text-nira-dark uppercase tracking-wider flex items-center gap-1.5">
                          <Camera className="w-5 h-5 text-nira-yellow animate-bounce" /> Creator Sell Gear Hub
                        </h3>
                        <p className="text-xs text-nira-text-secondary leading-relaxed mt-1">Submit high-end cinematography gear details. Our backend will index it immediately and display it inside global buying markets!</p>
                      </div>

                      <div className="mb-6 bg-gradient-to-r from-nira-dark to-black p-5 rounded-2xl border border-nira-yellow/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xs font-black uppercase text-nira-yellow tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-nira-yellow animate-pulse" /> Enterprise Partner Central Hub
                          </h4>
                          <p className="text-[10px] text-white/60 leading-relaxed mt-1">
                            Looking to list freelance services (video editing, reels cuts, photo grading), manage bulk inventories, track UPI payouts, or configure Madurai studio location KYC?
                          </p>
                        </div>
                        <Link
                          href="/seller"
                          className="px-4 py-2 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow shrink-0 text-center cursor-pointer font-bold"
                        >
                          Enter Partner Central
                        </Link>
                      </div>

                      <form onSubmit={handlePublishGear} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Product Gear Title</label>
                            <input
                              type="text"
                              placeholder="Sony Alpha A7 IV Mirrorless"
                              value={sellForm.name}
                              onChange={(e) => setSellForm({ ...sellForm, name: e.target.value })}
                              className="px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Brand Manufacturer</label>
                            <input
                              type="text"
                              placeholder="Sony"
                              value={sellForm.brand}
                              onChange={(e) => setSellForm({ ...sellForm, brand: e.target.value })}
                              className="px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Market Category</label>
                            <select
                              title="Market Category"
                              aria-label="Market Category"
                              value={sellForm.category}
                              onChange={(e) => setSellForm({ ...sellForm, category: e.target.value })}
                              className="px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow cursor-pointer"
                            >
                              <option>Cameras</option>
                              <option>Lenses</option>
                              <option>Audio</option>
                              <option>Lighting</option>
                              <option>Accessories</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Physical Diagnostics Grade</label>
                            <select
                              title="Physical Diagnostics Grade"
                              aria-label="Physical Diagnostics Grade"
                              value={sellForm.grade}
                              onChange={(e) => setSellForm({ ...sellForm, grade: e.target.value })}
                              className="px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow cursor-pointer"
                            >
                              <option>Like New</option>
                              <option>Excellent</option>
                              <option>Good</option>
                              <option>Fair</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Asking Price (₹ INR)</label>
                            <input
                              type="number"
                              placeholder="135000"
                              value={sellForm.price}
                              onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                              className="px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Original Purchase Price (₹ INR)</label>
                            <input
                              type="number"
                              placeholder="165000"
                              value={sellForm.originalPrice}
                              onChange={(e) => setSellForm({ ...sellForm, originalPrice: e.target.value })}
                              className="px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Diagnostic Features & Specifications (Specs)</label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="flex gap-2">
                              <input type="text" placeholder="Resolution" value={sellForm.specKey1} onChange={(e) => setSellForm({ ...sellForm, specKey1: e.target.value })} className="w-1/3 px-3 py-2 bg-nira-gray rounded-xl text-xs border-none" />
                              <input type="text" placeholder="24.2 MP" value={sellForm.specVal1} onChange={(e) => setSellForm({ ...sellForm, specVal1: e.target.value })} className="flex-1 px-3 py-2 bg-nira-gray rounded-xl text-xs border-none" />
                            </div>
                            <div className="flex gap-2">
                              <input type="text" placeholder="Optical Zoom" value={sellForm.specKey2} onChange={(e) => setSellForm({ ...sellForm, specKey2: e.target.value })} className="w-1/3 px-3 py-2 bg-nira-gray rounded-xl text-xs border-none" />
                              <input type="text" placeholder="3x Kit Zoom" value={sellForm.specVal2} onChange={(e) => setSellForm({ ...sellForm, specVal2: e.target.value })} className="flex-1 px-3 py-2 bg-nira-gray rounded-xl text-xs border-none" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Equipment Description & Condition History</label>
                          <textarea
                            placeholder="List any scratches, repair history, usage duration, or package items..."
                            value={sellForm.description}
                            onChange={(e) => setSellForm({ ...sellForm, description: e.target.value })}
                            className="px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                            rows={3}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingGear}
                          className="w-full py-4 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {submittingGear ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Publish Listing to Catalogue</>}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-nira-gray-dark shadow-sm relative overflow-hidden animate-fade-in">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-nira-yellow/5 rounded-full blur-3xl -mr-16 -mt-16" />
                      
                      <div className="max-w-2xl mx-auto text-center py-6">
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                          <Camera className="w-8 h-8 animate-pulse" />
                        </div>
                        
                        <h3 className="font-heading font-black text-2xl text-nira-dark uppercase tracking-wide">
                          Turn Your Cinema Gear &amp; Skills Into Income
                        </h3>
                        <p className="text-sm text-nira-text-secondary mt-3 leading-relaxed">
                          Join the elite NIRA6 creator network. List your used cameras/lenses, offer freelance services (video editing, color grading, reels cuts), and get direct bookings with escrow safety.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4 my-8 text-left">
                          {[
                            { title: 'Instant UPI Payouts', desc: 'Secure advance payments held in secure escrow. Released directly to your UPI account post-job.' },
                            { title: 'Studio Location KYC', desc: 'Showcase your physical shoot setup or rental house on our interactive Madurai maps directory.' },
                            { title: 'Excel Bulk Imports', desc: 'Got a large catalog of rental or pre-owned gear? Upload hundreds of items in one single Excel sheet.' },
                            { title: 'Service Listings', desc: 'Offer editing, editing consulting, cinematography services directly to users searching NIRA6.' }
                          ].map((feat, idx) => (
                            <div key={idx} className="p-4 bg-nira-gray/50 border border-nira-gray-dark rounded-xl">
                              <h4 className="text-xs font-black uppercase text-nira-dark tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {feat.title}
                              </h4>
                              <p className="text-[11px] text-nira-text-secondary mt-1 leading-relaxed">{feat.desc}</p>
                            </div>
                          ))}
                        </div>

                        <Link
                          href="/seller"
                          className="inline-flex items-center gap-2 px-8 py-4 bg-nira-yellow hover:bg-amber-400 text-nira-dark font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Become an Onboarded Seller / Creator <ChevronRight className="w-4 h-4" />
                        </Link>
                        
                        <p className="text-[10px] text-nira-text-secondary/70 mt-4 font-semibold">
                          🛡️ Escrow protection and verified hardware checking active
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* 5. CRM Support & Diagnostics Tab */}
                {activeTab === 'support-tickets' && (
                  <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Panel: Log new ticket form */}
                    <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark lg:col-span-1 shadow-sm">
                      <h4 className="font-heading font-bold text-sm text-nira-dark uppercase tracking-wider mb-4 border-b border-nira-gray-dark pb-3">Log support ticket</h4>
                      <form onSubmit={handleCreateTicket} className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Problem Category</label>
                          <select
                            title="Problem Category"
                            aria-label="Problem Category"
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value)}
                            className="px-3.5 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none cursor-pointer"
                          >
                            <option>Buy</option>
                            <option>Sell</option>
                            <option>Rent</option>
                            <option>Payments</option>
                            <option>Technical</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Brief Subject</label>
                          <input
                            type="text"
                            placeholder="e.g. Razorpay payment got stuck"
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            className="px-3.5 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-nira-text-secondary uppercase">Description Details</label>
                          <textarea
                            placeholder="Provide diagnostic error codes, order references, or equipment faults..."
                            value={ticketDesc}
                            onChange={(e) => setTicketDesc(e.target.value)}
                            className="px-3.5 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                            rows={4}
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={creatingTicket}
                          className="w-full py-3.5 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {creatingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Submit ticket</>}
                        </button>
                      </form>
                    </div>

                    {/* Right Panel: Tickets list / conversations thread */}
                    <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark lg:col-span-2 shadow-sm flex flex-col min-h-[400px]">
                      {selectedTicket ? (
                        <div className="flex-1 flex flex-col min-h-[380px]">
                          <div className="flex items-center justify-between border-b border-nira-gray-dark pb-3 mb-4">
                            <div>
                              <button onClick={() => setSelectedTicket(null)} className="text-xs font-bold text-nira-yellow hover:underline flex items-center gap-1 cursor-pointer">
                                <CornerDownLeft className="w-3.5 h-3.5" /> Back to List
                              </button>
                              <h4 className="font-heading font-black text-sm text-nira-dark mt-1 truncate max-w-md">{selectedTicket.subject}</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                              {selectedTicket.status}
                            </span>
                          </div>

                          {/* Message dialogue bubble loops */}
                          <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 bg-nira-gray/30 rounded-2xl border border-nira-gray-dark shadow-inner max-h-[260px]">
                            <div className="bg-white p-3 rounded-xl border border-nira-gray-dark max-w-[85%]">
                              <p className="text-[10px] font-black text-nira-dark mb-1">Original Description</p>
                              <p className="text-xs text-nira-text-secondary leading-relaxed">{selectedTicket.description}</p>
                              <span className="text-[8px] text-nira-text-secondary mt-1 block">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                            </div>

                            {selectedTicket.conversations?.map((msg, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-xl border max-w-[85%] ${msg.sender === 'agent'
                                    ? 'bg-nira-dark text-white border-transparent ml-auto'
                                    : 'bg-white text-nira-dark border-nira-gray-dark'
                                  }`}
                              >
                                <p className="text-[9px] font-black uppercase tracking-wider text-nira-yellow mb-0.5">{msg.sender === 'agent' ? 'NIRA6 Diagnostics bot' : 'Creator'}</p>
                                <p className="text-xs leading-relaxed">{msg.message}</p>
                                <span className="text-[8px] text-nira-text-secondary/80 mt-1 block">{new Date(msg.timestamp).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col">
                          <h4 className="font-heading font-bold text-sm text-nira-dark uppercase tracking-wider mb-4 border-b border-nira-gray-dark pb-3">Active Diagnostics Tickets</h4>
                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px]">
                            {tickets.length > 0 ? (
                              tickets.map((t) => (
                                <div
                                  key={t._id}
                                  onClick={() => setSelectedTicket(t)}
                                  className="p-4 bg-nira-gray/30 hover:bg-nira-gray/70 border border-nira-gray-dark rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all"
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-nira-dark text-nira-yellow text-[8px] font-black uppercase rounded">CRM-{t._id.slice(-6).toUpperCase()}</span>
                                      <span className="text-[10px] text-nira-text-secondary font-bold uppercase">{t.category}</span>
                                    </div>
                                    <p className="font-bold text-xs text-nira-dark truncate max-w-xs sm:max-w-md mt-1">{t.subject}</p>
                                    <span className="text-[9px] text-nira-text-secondary block mt-0.5">{new Date(t.createdAt).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                      {t.status}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-nira-text-secondary" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                                <MessageSquare className="w-10 h-10 text-nira-text-secondary/40 mb-2" />
                                <p className="text-nira-text-secondary text-xs">No active CRM diagnostics logged. Perfect gear health!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                    <h3 className="font-heading font-semibold text-lg mb-6">My Wishlist</h3>
                    {wishlistItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-nira-text-secondary text-sm mb-4">Your wishlist is empty.</p>
                        <Link href="/buy" className="px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl inline-block cursor-pointer">Explore Gear</Link>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Bulk Import Excel Tab */}
                {activeTab === 'bulk-import' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nira-gray-dark pb-4 mb-4">
                        <div>
                          <h3 className="font-heading font-bold text-base text-nira-dark uppercase tracking-wider flex items-center gap-1.5"><FileSpreadsheet className="w-5 h-5 text-nira-yellow" /> Excel Bulk Catalogue Import</h3>
                          <p className="text-xs text-nira-text-secondary mt-1">Download the preformatted template spreadsheet, fill in your product variables, and drop it below to bulk-index catalogs.</p>
                        </div>
                        <button onClick={downloadTemplate} className="px-4 py-2.5 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer">
                          <Download className="w-4 h-4" /> Download Template
                        </button>
                      </div>

                      {/* Dropzone wrapper */}
                      <label className="border-2 border-dashed border-nira-gray-dark hover:border-nira-yellow rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-nira-gray/10 hover:bg-nira-gray/20">
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} className="hidden" />
                        <FileUp className="w-8 h-8 text-nira-text-secondary/70 mb-3" />
                        <p className="text-xs font-bold text-nira-dark mb-1">Click or drag Excel workbook spreadsheet here</p>
                        <p className="text-[10px] text-nira-text-secondary">Compatible with Microsoft Excel .xlsx, .xls, or standard CSV files</p>
                      </label>
                    </div>

                    {/* Bulk parse listing logs grid */}
                    {parsing && (
                      <div className="bg-white rounded-2xl p-8 text-center border border-nira-gray-dark shadow-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-nira-yellow mx-auto mb-2" />
                        <p className="text-xs text-nira-text-secondary">Synthesizing worksheets and checking integrity constraints...</p>
                      </div>
                    )}

                    {uploadError && (
                      <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-2.5 shadow-sm text-xs">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Parsing Integrity Error discovered</p>
                          <p className="mt-0.5 text-red-700">{uploadError}</p>
                        </div>
                      </div>
                    )}

                    {successData && (
                      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 flex items-start gap-2.5 shadow-sm text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Spreadsheet imported successfully!</p>
                          <p className="mt-0.5 text-emerald-700">Out of {successData.total} items, {successData.imported} passed validation and were successfully loaded in database stores.</p>
                        </div>
                      </div>
                    )}

                    {parsedProducts.length > 0 && (
                      <div className="bg-white rounded-2xl border border-nira-gray-dark overflow-hidden shadow-sm">
                        <div className="p-4 bg-nira-gray border-b border-nira-gray-dark flex items-center justify-between">
                          <h4 className="text-xs font-bold text-nira-dark uppercase tracking-wider">Integrity Audit Logs ({parsedProducts.length} items parsed)</h4>
                          <button
                            onClick={handleBulkImportSubmit}
                            disabled={importing}
                            className="px-4 py-2 bg-nira-yellow text-nira-dark font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Publish ${parsedProducts.filter(p => p.errors.length === 0).length} valid items`}
                          </button>
                        </div>

                        <div className="overflow-x-auto max-h-[300px]">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-nira-gray/50 text-nira-text-secondary font-bold border-b border-nira-gray-dark">
                                <th className="p-3 text-center w-12">Row</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Brand</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Grade</th>
                                <th className="p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parsedProducts.map((p, idx) => (
                                <tr key={idx} className="border-b border-nira-gray-dark last:border-0 hover:bg-nira-gray/20">
                                  <td className="p-3 font-semibold text-center text-nira-text-secondary">{p.rowNumber}</td>
                                  <td className="p-3">
                                    <div className="font-medium text-nira-dark truncate max-w-xs">{p.name || <span className="text-red-500/60 italic">&lt;Missing&gt;</span>}</div>
                                  </td>
                                  <td className="p-3 text-nira-dark">{p.brand || <span className="text-red-500/60 italic">&lt;Missing&gt;</span>}</td>
                                  <td className="p-3 text-nira-dark">{p.category || <span className="text-red-500/60 italic">&lt;Missing&gt;</span>}</td>
                                  <td className="p-3 font-semibold text-nira-dark">{isNaN(p.price) ? <span className="text-red-500 font-medium italic">&lt;Invalid&gt;</span> : `₹${p.price.toLocaleString('en-IN')}`}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.grade === 'Like New' ? 'bg-emerald-100 text-emerald-800' :
                                        p.grade === 'Excellent' ? 'bg-blue-100 text-blue-800' :
                                          p.grade === 'Good' ? 'bg-amber-100 text-amber-800' :
                                            p.grade === 'Fair' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                      }`}>{p.grade || 'Unknown'}</span>
                                  </td>
                                  <td className="p-3">
                                    {p.errors.length === 0 ? (
                                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                      </span>
                                    ) : (
                                      <div className="text-red-500 font-semibold flex flex-col gap-0.5">
                                        {p.errors.map((e: string, eIdx: number) => (
                                          <span key={eIdx} className="flex items-center gap-1 text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">
                                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {e}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 8. Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                    <h3 className="font-heading font-semibold text-lg mb-6">Account Settings</h3>
                    <div className="space-y-4 max-w-md">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-nira-text-secondary">Full Name</label>
                        <input type="text" title="Full Name" placeholder="Full Name" defaultValue={userInfo.name} className="px-4 py-3 bg-nira-gray rounded-xl text-sm border-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-nira-text-secondary">Email Address</label>
                        <input type="email" title="Email Address" placeholder="Email Address" defaultValue={userInfo.email} className="px-4 py-3 bg-nira-gray rounded-xl text-sm border-none" disabled />
                      </div>
                      <button className="px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors cursor-pointer">Save Changes</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Glassmorphic Order Details & Interactive Delivery Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-nira-gray-dark">
            <button
              onClick={() => {
                setSelectedOrder(null);
                setReturningOrderId(null);
                setReturnReasonInput('');
              }}
              className="absolute top-4 right-4 p-2 bg-nira-gray rounded-full hover:bg-nira-gray-dark transition-colors cursor-pointer text-nira-dark"
            >
              Close Window
            </button>

            {/* Interactive Timeline Progress */}
            <div className="mb-6">
              <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-nira-text-secondary mb-4">Diagnostics Tracking Timeline</h4>

              {selectedOrder.returned ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800">
                  <CornerDownLeft className="w-5 h-5 text-red-600 animate-pulse shrink-0" />
                  <div>
                    <p className="font-bold text-xs">Returned &amp; Fully Refunded</p>
                    <p className="text-[10px] text-red-700 mt-0.5">Return Reason: &quot;{selectedOrder.returnReason || 'Diagnostics Fault'}&quot;</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center relative py-4">
                  <div className="absolute left-0 right-0 h-1 bg-nira-gray-dark z-0" />

                  {/* Status Progress lines */}
                  {['processing', 'inspected', 'shipped', 'delivered'].map((step, idx) => {
                    const statusOrder = ['processing', 'inspected', 'shipped', 'delivered'];
                    const currentIdx = statusOrder.indexOf(selectedOrder.orderStatus);
                    const isActive = idx <= currentIdx;

                    return (
                      <div key={step} className="flex flex-col items-center z-10 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${isActive ? 'bg-nira-yellow text-nira-dark border-2 border-nira-dark' : 'bg-white text-nira-text-secondary border-2 border-nira-gray-dark'
                          }`}>
                          {isActive ? '✓' : idx + 1}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-nira-dark mt-1.5">{step}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Interactive Routing Map */}
            {['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(selectedOrder.orderStatus) && (
              <div className="mb-6 h-60 w-full rounded-2xl overflow-hidden border border-nira-gray-dark relative z-10">
                <TrackingMap
                  originCity="Mumbai"
                  destinationCity={selectedOrder.shippingAddress.city}
                  currentLocationCity={selectedOrder.trackingUpdates && selectedOrder.trackingUpdates.length > 0
                    ? selectedOrder.trackingUpdates[selectedOrder.trackingUpdates.length - 1].location
                    : 'Mumbai'}
                />
              </div>
            )}

            {/* Itemized Printer Friendly Tax invoice segment */}
            <div id="tax-invoice-view" className="p-5 border border-nira-gray-dark rounded-2xl bg-nira-gray/10">
              <div className="flex justify-between items-start mb-4 border-b border-nira-gray-dark pb-3">
                <div>
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-nira-dark">NIRA6 SECURE DIAGNOSTICS</h3>
                  <p className="text-[9px] text-nira-text-secondary">Diagnostics Reg No: 33AAFCN8972C1ZX</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-nira-dark">TAX INVOICE</h3>
                  <p className="text-[9px] text-nira-text-secondary">Ref: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              {/* Items loops */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-nira-gray-dark text-nira-text-secondary font-bold">
                    <th className="py-2">Item specifications</th>
                    <th className="py-2 text-center w-12">Qty</th>
                    <th className="py-2 text-right w-24">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx} className="border-b border-nira-gray-dark/50 last:border-0 text-nira-dark">
                      <td className="py-2.5 truncate max-w-[240px]">{it.product.name}</td>
                      <td className="py-2.5 text-center">{it.quantity}</td>
                      <td className="py-2.5 text-right font-medium">{formatPrice(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* CGST, SGST tax break breakdowns */}
              <div className="border-t border-nira-gray-dark mt-4 pt-3 space-y-1.5 text-xs text-nira-text-secondary">
                <div className="flex justify-between"><span>Items Subtotal</span><span className="font-semibold text-nira-dark">{formatPrice(selectedOrder.totalAmount - (selectedOrder.taxAmount || 0) - (selectedOrder.platformFee || 199) + (selectedOrder.discountAmount || 0))}</span></div>
                {selectedOrder.discountAmount ? (
                  <div className="flex justify-between text-red-500"><span>Applied Discount ({selectedOrder.couponApplied || 'Coupon'})</span><span className="font-bold">- {formatPrice(selectedOrder.discountAmount)}</span></div>
                ) : null}
                <div className="flex justify-between"><span>CGST (9%)</span><span className="font-semibold text-nira-dark">{formatPrice(Math.round((selectedOrder.taxAmount || 0) / 2))}</span></div>
                <div className="flex justify-between"><span>SGST (9%)</span><span className="font-semibold text-nira-dark">{formatPrice(Math.round((selectedOrder.taxAmount || 0) / 2))}</span></div>
                <div className="flex justify-between"><span>Platform diagnostics fee</span><span className="font-semibold text-nira-dark">{formatPrice(selectedOrder.platformFee || 0)}</span></div>
                <div className="h-px bg-nira-gray-dark my-1" />
                <div className="flex justify-between font-bold text-nira-dark text-sm">
                  <span>Grand total Paid</span><span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Modal Controls buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-nira-gray hover:bg-nira-gray-dark text-nira-dark font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Tax Receipt
              </button>

              {/* Multi-Step Return Request Wizard */}
              {!['cancelled', 'return_requested', 'returned', 'refunded', 'refund_initiated', 'refund_completed'].includes(selectedOrder.orderStatus) && (
                returningOrderId === selectedOrder._id ? (
                  <div className="flex-1 bg-neutral-50 border border-nira-gray-dark rounded-2xl p-5 mt-6 animate-scale-in">
                    {/* Wizard Steps indicator */}
                    <div className="flex justify-between items-center mb-5 border-b border-nira-gray-dark pb-3">
                      <h5 className="font-heading font-black text-[10px] uppercase tracking-wider text-nira-dark">Return Wizard</h5>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((stepNum) => (
                          <div
                            key={stepNum}
                            className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                              returnStep >= stepNum ? 'bg-nira-yellow text-nira-dark' : 'bg-nira-gray text-nira-text-secondary'
                            }`}
                          >
                            {stepNum}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 1: Reason Selection */}
                    {returnStep === 1 && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Return Category</label>
                          <select
                            title="Return Reason Category"
                            aria-label="Return Reason Category"
                            value={returnReasonInput.split(' - ')[0] || ''}
                            onChange={(e) => setReturnReasonInput(e.target.value + ' - ')}
                            className="px-3 py-2 bg-white border border-nira-gray-dark rounded-xl text-xs focus:outline-none"
                          >
                            <option value="">Select reason category...</option>
                            <option value="Defective / Faulty Gear">Defective / Faulty Gear</option>
                            <option value="Damaged during shipping">Damaged during shipping</option>
                            <option value="Doesn't match description">Doesn't match description</option>
                            <option value="Wrong model / size shipped">Wrong model / size shipped</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Elaborated details</label>
                          <textarea
                            placeholder="Please explain the issues with your product physical diagnostics..."
                            value={returnReasonInput.includes(' - ') ? returnReasonInput.split(' - ').slice(1).join(' - ') : returnReasonInput}
                            onChange={(e) => {
                              const category = returnReasonInput.split(' - ')[0] || 'Other';
                              setReturnReasonInput(category + ' - ' + e.target.value);
                            }}
                            className="px-3 py-2 bg-white border border-nira-gray-dark rounded-xl text-xs focus:outline-none"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReturnStep(2)}
                            disabled={!returnReasonInput.trim()}
                            className="flex-1 py-2 bg-nira-dark text-white hover:bg-nira-yellow hover:text-nira-dark disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Next: Upload Proof
                          </button>
                          <button
                            type="button"
                            onClick={() => setReturningOrderId(null)}
                            className="px-4 py-2 border border-nira-gray-dark bg-white text-nira-dark text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Proof attachments */}
                    {returnStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Upload Proof Photos</label>
                          <p className="text-[9px] text-nira-text-secondary leading-relaxed mb-2">Upload physical inspection snaps verifying the issue. Mandatory for automated returns approval.</p>
                          
                          <label className="border-2 border-dashed border-nira-gray-dark hover:border-nira-yellow rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleReturnPhotoUpload}
                              className="hidden"
                            />
                            <span className="text-[10px] font-bold text-nira-dark">Choose photos of return gear</span>
                          </label>
                        </div>

                        {returnUploadProgress && (
                          <div className="flex items-center justify-center gap-1 text-[10px] text-nira-yellow font-bold animate-pulse">
                            Uploading image to server...
                          </div>
                        )}

                        {returnPhotos.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 pt-2">
                            {returnPhotos.map((url, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg border border-nira-gray-dark overflow-hidden bg-white">
                                <img src={url} alt="Proof upload" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReturnStep(1)}
                            className="px-4 py-2 border border-nira-gray-dark bg-white text-nira-dark text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setReturnStep(3)}
                            className="flex-1 py-2 bg-nira-dark text-white hover:bg-nira-yellow hover:text-nira-dark text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Next: Refund Method
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Refund Method selection */}
                    {returnStep === 3 && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Refund Destination</label>
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <label className={`p-3 border rounded-xl cursor-pointer flex flex-col justify-between transition-all ${
                              returnMethod === 'wallet' ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark bg-white hover:bg-nira-gray/30'
                            }`}>
                              <input
                                type="radio"
                                name="refund_destination"
                                checked={returnMethod === 'wallet'}
                                onChange={() => setReturnMethod('wallet')}
                                className="sr-only"
                              />
                              <span className="text-xs font-bold text-nira-dark">NIRA Loyalty Wallet</span>
                              <span className="text-[9px] text-nira-text-secondary mt-1">Processed instantly after physical inspection.</span>
                            </label>

                            <label className={`p-3 border rounded-xl cursor-pointer flex flex-col justify-between transition-all ${
                              returnMethod === 'original_payment' ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark bg-white hover:bg-nira-gray/30'
                            }`}>
                              <input
                                type="radio"
                                name="refund_destination"
                                checked={returnMethod === 'original_payment'}
                                onChange={() => setReturnMethod('original_payment')}
                                className="sr-only"
                              />
                              <span className="text-xs font-bold text-nira-dark">Original Payment Source</span>
                              <span className="text-[9px] text-nira-text-secondary mt-1">Takes 5-7 working days following validation.</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReturnStep(2)}
                            className="px-4 py-2 border border-nira-gray-dark bg-white text-nira-dark text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInitiateReturn(selectedOrder._id)}
                            disabled={returnSubmitting}
                            className="flex-1 py-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            {returnSubmitting ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Confirm Return Request'
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Success confirmation screen */}
                    {returnStep === 4 && (
                      <div className="text-center py-4 space-y-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-base">✓</div>
                        <h4 className="font-heading font-bold text-sm text-nira-dark">Return Registered Successfully!</h4>
                        <p className="text-[10px] text-nira-text-secondary leading-relaxed">
                          Your return request for Order #{selectedOrder._id.slice(-8).toUpperCase()} has been submitted. Our logistics partner will pick up the package within 48 hours for inspection.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(null);
                            setReturningOrderId(null);
                            setReturnReasonInput('');
                          }}
                          className="px-6 py-2 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Finish &amp; Close
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setReturningOrderId(selectedOrder._id);
                      setReturnStep(1);
                    }}
                    className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CornerDownLeft className="w-4 h-4" /> Return Item &amp; Refund
                  </button>
                )
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-nira-text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Standard 30-Point physical diagnostics verified statement.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
