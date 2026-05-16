'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Package, Wallet, Settings, LogOut, Star, Camera, TrendingUp, ShoppingBag, Loader2 } from 'lucide-react';
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
  { id: 'settings', label: 'Settings', icon: Settings },
];

const statusColors: Record<string, string> = {
  delivered: '#10B981',
  shipped: '#3B82F6',
  processing: '#F59E0B',
  cancelled: '#EF4444'
};

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: userInfo, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

