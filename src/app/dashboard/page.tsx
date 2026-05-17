'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Package, Wallet, Settings, LogOut, Star, Camera, TrendingUp, ShoppingBag, Loader2, Upload, AlertCircle, CheckCircle2, FileSpreadsheet, FileUp, Download } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout } from '@/store/authSlice';
import { fetchWishlist } from '@/store/wishlistSlice';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';
import api from '@/services/api';
import ProductCard from '@/components/products/ProductCard';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'bulk-import', label: 'Bulk Import', icon: Upload },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const statusColors: Record<string, string> = {
  delivered: '#10B981',
  shipped: '#3B82F6',
  processing: '#F59E0B',
  cancelled: '#EF4444'
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

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: userInfo, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ProductImport[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successData, setSuccessData] = useState<{ total: number; imported: number; message: string } | null>(null);

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

            return {
              rowNumber: index + 2,
              name,
              brand,
              price,
              category,
              image,
              grade,
              conditionScore,
              featured: String(row.featured || '').toLowerCase() === 'true',
              trending: String(row.trending || '').toLowerCase() === 'true',
              specs,
              stock: row.stock !== undefined && !isNaN(Number(row.stock)) ? Number(row.stock) : 1,
              description: row.description ? String(row.description).trim() : undefined,
              seller: row.seller ? String(row.seller).trim() : 'NIRA6 Certified',
              warranty: row.warranty ? String(row.warranty).trim() : '6 Months NIRA6 Warranty',
              errors
            };
          });

          setParsedProducts(parsed);
          setParsing(false);
        } catch {
          setUploadError('Failed to parse Excel file content. Make sure it is a valid .xlsx or .csv file.');
          setParsing(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Error reading the file.');
        setParsing(false);
      };

      reader.readAsBinaryString(file);
    } catch {
      setUploadError('Could not load the Excel parser library. Please check your network connection.');
      setParsing(false);
    }
  };

  // Perform bulk API upload
  const handleImportConfirm = async () => {
    const validProducts = parsedProducts.filter(p => p.errors.length === 0);
    if (validProducts.length === 0) {
      alert('There are no valid products to import. Please fix any validation errors and re-upload.');
      return;
    }

    setImporting(true);
    setUploadProgress(20);

    try {
      setUploadProgress(50);
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

      setUploadProgress(100);
      setSuccessData({
        total: parsedProducts.length,
        imported: validProducts.length,
        message: (response.data as { message?: string }).message || 'Import successful!'
      });
      setParsedProducts([]);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || 'Failed to import products to server.';
      setUploadError(msg);
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
        dispatch(fetchWishlist());
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, router, dispatch]);


  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  if (!userInfo) return null;

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Header */}
        <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-6 shadow-sm border border-nira-gray-dark">
          <div className="w-20 h-20 bg-nira-dark rounded-2xl flex items-center justify-center text-white font-heading font-bold text-2xl uppercase">
            {userInfo.name?.slice(0, 2)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-heading font-bold text-2xl">{userInfo.name}</h1>
            <p className="text-nira-text-secondary text-sm">{userInfo.email} • Member since Dec 2024</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm"><ShoppingBag className="w-4 h-4 text-nira-yellow" /> {orders.length} Orders</span>
              <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 text-nira-yellow" /> Gold Member</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl p-3 flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide shadow-sm border border-nira-gray-dark">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-nira-yellow text-nira-dark' : 'text-nira-text-secondary hover:bg-nira-gray'}`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-nira-error hover:bg-nira-error/5 whitespace-nowrap">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-nira-gray-dark">
                <Loader2 className="w-8 h-8 text-nira-yellow animate-spin mb-4" />
                <p className="text-nira-text-secondary">Loading your dashboard...</p>
              </div>
            ) : (
              <>
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Orders', value: orders.length.toString(), icon: Package, color: '#3B82F6' },
                        { label: 'Wallet Balance', value: '₹0', icon: Wallet, color: '#10B981' },
                        { label: 'Wishlist Items', value: wishlistItems.length.toString(), icon: Heart, color: '#EF4444' },
                        { label: 'Items Sold', value: '0', icon: Camera, color: '#A855F7' },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-nira-gray-dark">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: stat.color + '15', color: stat.color }}>
                            <stat.icon className="w-5 h-5" />
                          </div>
                          <p className="font-heading font-bold text-2xl">{stat.value}</p>
                          <p className="text-sm text-nira-text-secondary">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading font-semibold text-lg">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-sm text-nira-yellow font-semibold">View All</button>
                      </div>
                      <div className="space-y-3">
                        {orders.length > 0 ? (
                          orders.slice(0, 3).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-3 bg-nira-gray rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-nira-text-secondary" /></div>
                                <div>
                                  <p className="font-medium text-sm truncate max-w-[150px] sm:max-w-xs">{order.items[0]?.product?.name || 'Package'}</p>
                                  <p className="text-xs text-nira-text-secondary">{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">{formatPrice(order.totalAmount)}</p>
                                <span className="text-xs font-medium uppercase" style={{ color: statusColors[order.orderStatus] }}>{order.orderStatus}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-nira-text-secondary text-sm">No orders yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                    <h3 className="font-heading font-semibold text-lg mb-4">All Orders</h3>
                    <div className="space-y-3">
                      {orders.length > 0 ? (
                        orders.map((order) => (
                          <div key={order._id} className="flex items-center justify-between p-4 border border-nira-gray-dark rounded-xl hover:border-nira-yellow transition-colors bg-white">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-nira-gray rounded-xl flex items-center justify-center flex-shrink-0">
                                {order.items[0]?.product?.image ? (
                                  <Image src={order.items[0].product.image} alt="product" width={32} height={32} className="object-contain" />
                                ) : (
                                  <Package className="w-6 h-6" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium truncate max-w-[200px] sm:max-w-md">{order.items[0]?.product?.name || 'Product'}</p>
                                <p className="text-sm text-nira-text-secondary">{order._id.toUpperCase()} • Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="font-heading font-bold">{formatPrice(order.totalAmount)}</p>
                              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-lg" style={{ backgroundColor: statusColors[order.orderStatus] + '15', color: statusColors[order.orderStatus] }}>{order.orderStatus}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-nira-gray-dark mx-auto mb-3" />
                          <p className="text-nira-text-secondary">You haven&apos;t placed any orders yet.</p>
                          <Link href="/buy" className="text-nira-yellow font-semibold mt-2 inline-block">Start Shopping</Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Wallet Tab */}
                {activeTab === 'wallet' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-nira-dark to-nira-dark/80 rounded-2xl p-6 text-white shadow-lg">
                      <p className="text-white/60 text-sm mb-1">Available Balance</p>
                      <p className="font-heading font-black text-4xl mb-4">₹0</p>
                      <div className="flex gap-3">
                        <button disabled className="px-4 py-2 bg-nira-yellow text-nira-dark font-semibold text-sm rounded-lg opacity-50">Withdraw</button>
                        <button disabled className="px-4 py-2 bg-white/10 text-white font-semibold text-sm rounded-lg opacity-50">Add Money</button>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                      <h3 className="font-heading font-semibold text-lg mb-4">Transactions</h3>
                      <div className="text-center py-12">
                        <p className="text-nira-text-secondary text-sm">No transactions yet.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wishlist */}
                {activeTab === 'wishlist' && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-heading font-semibold text-lg">Your Wishlist</h3>
                      <p className="text-sm text-nira-text-secondary">{wishlistItems.length} items saved</p>
                    </div>

                    {wishlistItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {wishlistItems.map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Heart className="w-12 h-12 text-nira-gray-dark mx-auto mb-3" />
                        <h3 className="font-heading font-semibold text-lg mb-2">Wishlist is empty</h3>
                        <p className="text-nira-text-secondary text-sm">Items you save will appear here. Start exploring gear!</p>
                        <Link href="/buy" className="mt-4 inline-block px-6 py-2 bg-nira-yellow text-nira-dark font-semibold rounded-xl">Browse Store</Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings */}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-nira-gray-dark">
                    <h3 className="font-heading font-semibold text-lg mb-2">Account Settings</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Full Name</label>
                        <input type="text" defaultValue={userInfo.name} className="w-full px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <input type="email" disabled defaultValue={userInfo.email} className="w-full px-4 py-3 bg-nira-gray rounded-xl text-sm opacity-60" />
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors">Save Changes</button>
                  </div>
                )}

                {/* Bulk Import Tab */}
                {activeTab === 'bulk-import' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-nira-gray-dark flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-bold text-xl mb-1 flex items-center gap-2 text-nira-dark">
                          <FileSpreadsheet className="w-6 h-6 text-nira-yellow" /> Excel/CSV Bulk Product Import
                        </h3>
                        <p className="text-nira-text-secondary text-sm">
                          Instantly upload your product list. Drag & drop your Excel sheet, preview live rows, check validation issues, and commit them directly.
                        </p>
                      </div>
                      <button
                        onClick={downloadTemplate}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-nira-gray hover:bg-nira-gray-dark text-nira-dark font-semibold text-sm rounded-xl transition-all flex-shrink-0"
                      >
                        <Download className="w-4 h-4 text-nira-text" /> Download Excel Template
                      </button>
                    </div>

                    {/* Alert / Errors */}
                    {uploadError && (
                      <div className="bg-nira-error/5 border border-nira-error/20 text-nira-error rounded-2xl p-4 flex gap-3 items-start animate-scale-in">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Upload Issue Detected</p>
                          <p className="text-xs mt-0.5 opacity-90">{uploadError}</p>
                        </div>
                      </div>
                    )}

                    {/* Success State */}
                    {successData && (
                      <div className="bg-nira-success/5 border border-nira-success/20 text-nira-success rounded-2xl p-6 flex flex-col items-center text-center gap-4 animate-scale-in">
                        <div className="w-12 h-12 bg-nira-success/10 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-lg text-nira-dark">Bulk Upload Complete!</h4>
                          <p className="text-sm text-nira-text-secondary mt-1">
                            Successfully imported <span className="font-bold text-nira-success">{successData.imported}</span> of <span className="font-bold">{successData.total}</span> products into the NIRA6 platform.
                          </p>
                        </div>
                        <Link
                          href="/buy"
                          className="px-6 py-2 bg-nira-yellow text-nira-dark font-bold rounded-xl text-sm hover:bg-nira-yellow-dark transition-colors"
                        >
                          View in Shop
                        </Link>
                      </div>
                    )}

                    {/* Upload Drop Zone / Progress */}
                    {importing ? (
                      <div className="bg-white rounded-2xl p-12 border border-nira-gray-dark flex flex-col items-center justify-center text-center shadow-sm">
                        <Loader2 className="w-10 h-10 text-nira-yellow animate-spin mb-4" />
                        <h4 className="font-heading font-bold text-lg mb-1">Importing Products...</h4>
                        <p className="text-nira-text-secondary text-sm mb-4">Please wait while we insert your catalog into MongoDB.</p>
                        <div className="w-full max-w-xs bg-nira-gray rounded-full h-2 overflow-hidden">
                          <div className="bg-nira-yellow h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    ) : parsedProducts.length === 0 ? (
                      <div className="bg-white rounded-2xl p-10 border border-nira-gray-dark shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:border-nira-yellow duration-300">
                        <div className="w-16 h-16 bg-nira-gray rounded-2xl flex items-center justify-center text-nira-text-secondary mb-4 group-hover:bg-nira-yellow/10 group-hover:text-nira-yellow transition-all duration-300">
                          {parsing ? (
                            <Loader2 className="w-8 h-8 animate-spin text-nira-yellow" />
                          ) : (
                            <FileUp className="w-8 h-8" />
                          )}
                        </div>
                        <h4 className="font-heading font-semibold text-lg mb-1">
                          {parsing ? 'Parsing Excel Data...' : 'Upload your Excel or CSV sheet'}
                        </h4>
                        <p className="text-nira-text-secondary text-sm max-w-sm mb-6">
                          Select or drag your product worksheet here. Supports `.xlsx`, `.xls`, or `.csv` files.
                        </p>
                        <label className="px-6 py-2.5 bg-nira-dark text-white font-semibold rounded-xl text-sm cursor-pointer hover:bg-nira-dark/80 transition-colors shadow-sm">
                          {parsing ? 'Parsing...' : 'Select File'}
                          <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            disabled={parsing}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary Block */}
                        <div className="bg-white rounded-2xl p-4 border border-nira-gray-dark flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                          <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 bg-nira-yellow/10 rounded-xl flex items-center justify-center text-nira-yellow">
                              <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-nira-dark">Parsed Product Catalog</p>
                              <p className="text-xs text-nira-text-secondary">
                                Found {parsedProducts.length} rows. Valid: {parsedProducts.filter(p => p.errors.length === 0).length} • Invalid: {parsedProducts.filter(p => p.errors.length > 0).length}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => setParsedProducts([])}
                              className="w-1/2 sm:w-auto px-4 py-2 border border-nira-gray-dark hover:bg-nira-gray text-nira-dark font-semibold text-sm rounded-xl transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleImportConfirm}
                              disabled={parsedProducts.filter(p => p.errors.length === 0).length === 0}
                              className="w-1/2 sm:w-auto px-6 py-2 bg-nira-yellow text-nira-dark font-bold text-sm rounded-xl hover:bg-nira-yellow-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                              <Upload className="w-4 h-4" /> Confirm & Import ({parsedProducts.filter(p => p.errors.length === 0).length})
                            </button>
                          </div>
                        </div>

                        {/* Preview Table */}
                        <div className="bg-white rounded-2xl border border-nira-gray-dark shadow-sm overflow-hidden animate-slide-up">
                          <div className="p-4 border-b border-nira-gray-dark bg-nira-gray/50">
                            <h4 className="font-heading font-semibold text-sm">Products Preview Grid</h4>
                          </div>
                          <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-nira-gray-dark bg-nira-gray/30 text-nira-text-secondary font-medium">
                                  <th className="p-3 w-16 text-center">Row</th>
                                  <th className="p-3 min-w-[150px]">Product Name</th>
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
                                      <div className="font-medium text-nira-dark truncate max-w-xs">{p.name || <span className="text-nira-error/60 italic">&lt;Missing&gt;</span>}</div>
                                      {p.description && <p className="text-[10px] text-nira-text-secondary truncate max-w-xs">{p.description}</p>}
                                    </td>
                                    <td className="p-3 text-nira-dark">{p.brand || <span className="text-nira-error/60 italic">&lt;Missing&gt;</span>}</td>
                                    <td className="p-3 text-nira-dark">{p.category || <span className="text-nira-error/60 italic">&lt;Missing&gt;</span>}</td>
                                    <td className="p-3 font-semibold text-nira-dark">{isNaN(p.price) ? <span className="text-nira-error font-medium italic">&lt;Invalid&gt;</span> : `₹${p.price.toLocaleString('en-IN')}`}</td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        p.grade === 'Like New' ? 'bg-emerald-100 text-emerald-800' :
                                        p.grade === 'Excellent' ? 'bg-blue-100 text-blue-800' :
                                        p.grade === 'Good' ? 'bg-amber-100 text-amber-800' :
                                        p.grade === 'Fair' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                      }`}>{p.grade || 'Unknown'}</span>
                                    </td>
                                    <td className="p-3">
                                      {p.errors.length === 0 ? (
                                        <span className="text-nira-success font-semibold flex items-center gap-1">
                                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                        </span>
                                      ) : (
                                        <div className="text-nira-error font-semibold flex flex-col gap-0.5">
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
                      </div>
                    )}

                    {/* Columns Help Guide */}
                    <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark shadow-sm">
                      <h4 className="font-heading font-bold text-sm mb-3">📋 Excel Spreadsheet Columns Format Guide</h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-nira-gray rounded-xl">
                          <p className="font-bold text-nira-dark mb-1">Required Core Fields</p>
                          <ul className="list-disc list-inside space-y-1 text-nira-text-secondary">
                            <li><code className="text-nira-dark font-bold font-mono">name</code>: Title of product</li>
                            <li><code className="text-nira-dark font-bold font-mono">brand</code>: Brand/Manufacturer</li>
                            <li><code className="text-nira-dark font-bold font-mono">category</code>: Product Category</li>
                            <li><code className="text-nira-dark font-bold font-mono">price</code>: Cost (in INR, e.g. 15000)</li>
                            <li><code className="text-nira-dark font-bold font-mono">image</code>: Absolute URL of image</li>
                            <li><code className="text-nira-dark font-bold font-mono">grade</code>: &apos;Like New&apos;, &apos;Excellent&apos;, &apos;Good&apos;, &apos;Fair&apos;</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-nira-gray rounded-xl">
                          <p className="font-bold text-nira-dark mb-1">Optional Details</p>
                          <ul className="list-disc list-inside space-y-1 text-nira-text-secondary">
                            <li><code className="text-nira-dark font-bold font-mono">conditionScore</code>: 0 to 100 number</li>
                            <li><code className="text-nira-dark font-bold font-mono">stock</code>: Quantity (default 1)</li>
                            <li><code className="text-nira-dark font-bold font-mono">description</code>: Text summary</li>
                            <li><code className="text-nira-dark font-bold font-mono">seller</code>: e.g. &apos;NIRA6 Certified&apos;</li>
                            <li><code className="text-nira-dark font-bold font-mono">warranty</code>: warranty term</li>
                            <li><code className="text-nira-dark font-bold font-mono">featured</code> / <code className="text-nira-dark font-bold font-mono">trending</code>: &apos;TRUE&apos; or &apos;FALSE&apos;</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-nira-gray rounded-xl sm:col-span-2 lg:col-span-1">
                          <p className="font-bold text-nira-dark mb-1">Specs Properties Map</p>
                          <p className="text-nira-text-secondary leading-relaxed">
                            You can map up to 5 custom spec key-value pairs using numbered columns:<br/>
                            <code className="text-nira-dark font-bold font-mono bg-white px-1 py-0.5 rounded border">specs_key1</code>, <code className="text-nira-dark font-bold font-mono bg-white px-1 py-0.5 rounded border">specs_val1</code> etc.
                          </p>
                          <p className="text-nira-text-secondary mt-2">
                            e.g. <code className="font-bold">specs_key1</code> = &quot;Driver Size&quot;, <code className="font-bold">specs_val1</code> = &quot;45mm&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

