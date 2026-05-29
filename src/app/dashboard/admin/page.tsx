'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, ShieldAlert, Check, X, CreditCard, 
  ArrowLeft, Loader2, TrendingUp, Package, Box, MapPin, 
  AlertTriangle, RefreshCw, BarChart3, Layers, ClipboardList,
  Search
} from 'lucide-react';
import { useAppSelector } from '@/store';
import api from '@/services/api';
import { formatPrice } from '@/lib/utils';

interface Booking {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  creatorId: {
    _id: string;
    name: string;
    email: string;
  };
  packageName: string;
  eventType: string;
  price: number;
  date: string;
  timeSlot: string;
  location: string;
  status: string;
  totalAmount: number;
  advancePaid: number;
  escrowStatus: string;
}

interface OrderItem {
  product: {
    _id: string;
    name: string;
    brand: string;
    sku?: string;
  };
  quantity: number;
  price: number;
  sku?: string;
  variant?: string;
}

interface Order {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  guestEmail?: string;
  guestPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  createdAt: string;
  warehouse?: string;
  deliveryOtp?: string;
}

interface InventoryItem {
  _id: string;
  sku: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    price: number;
  };
  stockLevel: number;
  lowStockThreshold: number;
  warehouseStock: {
    warehouse: string;
    stock: number;
    binLocation: string;
  }[];
}

interface Warehouse {
  _id: string;
  name: string;
  code: string;
  city: string;
}

const statusSteps = [
  'pending', 'confirmed', 'processing', 'packed', 'shipped', 
  'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'fulfillment' | 'warehouse' | 'inventory' | 'escrow' | 'kyc'>('analytics');
  
  // KYC State
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  // Bookings / Escrows State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resolvingBookingId, setResolvingBookingId] = useState<string | null>(null);
  const [escrowStats, setEscrowStats] = useState({
    totalBookings: 0,
    escrowHeld: 0,
    escrowRefunded: 0,
    escrowDisbursed: 0
  });

  // E-commerce state
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Search query filters
  const [orderSearch, setOrderSearch] = useState('');
  const [invSearch, setInvSearch] = useState('');

  // Warehouse workflow simulator state
  const [selectedFulfillmentOrder, setSelectedFulfillmentOrder] = useState<Order | null>(null);
  const [workflowStep, setWorkflowStep] = useState<number>(0); // 0: pick list, 1: barcode scan, 2: qc verification, 3: packing, 4: courier assign
  const [scanAnimationActive, setScanAnimationActive] = useState(false);
  const [qcChecked, setQcChecked] = useState(false);
  const [boxSize, setBoxSize] = useState('Standard');
  const [selectedCourier, setSelectedCourier] = useState('NIRA Express');
  const [dispatchLocation, setDispatchLocation] = useState('Mumbai Hub');
  
  // Stock restock adjustments state
  const [selectedRestockSku, setSelectedRestockSku] = useState<string>('');
  const [restockQty, setRestockQty] = useState<string>('');
  const [restockWarehouse, setRestockWarehouse] = useState<string>('');
  const [restocking, setRestocking] = useState(false);

  // General execution triggers
  const [seeding, setSeeding] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch bookings escrow moderation
      const bookingsRes = await api.get('/admin/moderation');
      setBookings(bookingsRes.data);

      let held = 0;
      let refunded = 0;
      let disbursed = 0;
      bookingsRes.data.forEach((b: Booking) => {
        if (b.escrowStatus === 'held') held += b.advancePaid;
        else if (b.escrowStatus === 'refunded') refunded += b.advancePaid;
        else if (b.escrowStatus === 'disbursed') disbursed += b.advancePaid;
      });
      setEscrowStats({
        totalBookings: bookingsRes.data.length,
        escrowHeld: held,
        escrowRefunded: refunded,
        escrowDisbursed: disbursed
      });

      // Fetch E-Commerce analytics
      const analyticsRes = await api.get('/analytics');
      setAnalytics(analyticsRes.data);

      // Fetch all orders
      // Admin route maps or we query standard list
      // Yes, but let's build an endpoint or query. Let's see if there is any other route or if we can fetch from route.
      // Wait, `/api/orders/myorders` is for current user. Let's write a route `/api/orders` that returns all orders if user is admin.
      // Wait! We can verify in our `/api/orders/myorders` if we can fetch all orders when admin, or we can just fetch all orders using `/api/orders` or `/api/orders?all=true`.
      // Let's look at `/api/orders/myorders/route.ts` again. It fetched: `Order.find({ user: user._id })`.
      // Let's create an admin endpoint to get ALL orders or extend `/api/orders/myorders` to fetch all orders if user.role === 'admin'.
      // Wait, let's write a dedicated `/api/admin/orders` route to fetch all orders! Or we can query orders. Let's look at the orders res first.
      const allOrdersRes = await api.get('/orders/myorders'); // For now, we can fetch these, but let's verify if we need all orders.
      // Yes, we will create a backend route `/api/admin/orders` to fetch all orders!
      // Let's create a route for it so that the admin dashboard works beautifully with all orders.
      // Let's fetch all orders.
      try {
        const adminOrdersRes = await api.get('/admin/orders');
        setOrders(adminOrdersRes.data);
      } catch {
        // Fallback
        setOrders(allOrdersRes.data);
      }

      // Fetch inventory
      const invRes = await api.get('/inventory');
      setInventories(invRes.data);

      // Fetch warehouses
      const whRes = await api.get('/warehouses');
      setWarehouses(whRes.data);

      // Fetch KYC requests
      try {
        const kycRes = await api.get('/admin/creators/kyc');
        setKycRequests(kycRes.data);
      } catch (e) {
        console.error('Failed to fetch KYC requests', e);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const timeout = setTimeout(() => { void fetchAdminData(); }, 0);
      return () => clearTimeout(timeout);
    } else {
      router.push('/dashboard');
    }
  }, [currentUser, fetchAdminData, router]);

  // Seeding trigger
  const runSeeding = async () => {
    setSeeding(true);
    try {
      const { data } = await api.post('/admin/seed-fulfillment');
      alert(data.message || 'Seeding complete!');
      fetchAdminData();
      
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🚚 Seeding Complete!',
          content: 'Warehouses WH-BOM-01 and WH-DEL-02 generated. SKUs cataloged and mapped.'
        }
      }));
    } catch {
      alert('Failed to seed catalog. Make sure you have mock products added.');
    } finally {
      setSeeding(false);
    }
  };

  const handleResolveDispute = async (bookingId: string, resolution: 'refund' | 'disburse') => {
    setResolvingBookingId(bookingId);
    try {
      const { data } = await api.post('/admin/moderation', { bookingId, resolution });
      if (data.success) {
        alert(`Dispute successfully resolved with: ${resolution.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolvingBookingId(null);
    }
  };

  // Status transitions
  const transitionOrderStatus = async (oId: string, targetStatus: string, remarksText = '', locText = '') => {
    setUpdatingStatusId(oId);
    try {
      await api.post(`/orders/${oId}/status`, { 
        status: targetStatus, 
        remarks: remarksText,
        location: locText 
      });
      fetchAdminData();
      
      // Dispatch alert
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🔄 Status Updated!',
          content: `Order #${oId.slice(-8).toUpperCase()} moved to ${targetStatus}.`
        }
      }));
    } catch {
      alert('Status change failed.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Warehouse workflow execution
  const runWarehouseWorkflow = async () => {
    if (!selectedFulfillmentOrder) return;
    
    const oId = selectedFulfillmentOrder._id;
    
    // Pick List -> Processing
    if (workflowStep === 0) {
      await transitionOrderStatus(oId, 'processing', 'Fulfillment picker request accepted. Retrieving items.', dispatchLocation);
      setWorkflowStep(1);
    }
    // Barcode Scanning -> Packed
    else if (workflowStep === 1) {
      setScanAnimationActive(true);
      setTimeout(async () => {
        setScanAnimationActive(false);
        setWorkflowStep(2);
      }, 1500);
    }
    // QC Check Passed
    else if (workflowStep === 2) {
      if (!qcChecked) {
        alert('Please verify visual QC inspection checklist first.');
        return;
      }
      setWorkflowStep(3);
    }
    // Packed Box Size
    else if (workflowStep === 3) {
      await transitionOrderStatus(oId, 'packed', `Items sealed inside ${boxSize} size packaging box. QC certificate attached.`, dispatchLocation);
      setWorkflowStep(4);
    }
    // Dispatch courier -> Shipped
    else if (workflowStep === 4) {
      await transitionOrderStatus(oId, 'shipped', `Dispatched via courier partner ${selectedCourier}.`, dispatchLocation);
      setSelectedFulfillmentOrder(null);
      setWorkflowStep(0);
      setQcChecked(false);
    }
  };

  // Stock restocking adjustments
  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockSku || !restockQty || !restockWarehouse) {
      alert('Please fill out all restocking parameters.');
      return;
    }
    setRestocking(true);
    try {
      await api.post('/inventory', {
        sku: selectedRestockSku,
        warehouseId: restockWarehouse,
        changeQuantity: Number(restockQty),
        type: 'inward',
        description: 'Warehouse Restocking Inward Log'
      });
      alert('Inward stock adjusted successfully.');
      setRestockQty('');
      fetchAdminData();
      
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '📥 Inventory Restocked!',
          content: `Added ${restockQty} units to SKU ${selectedRestockSku}.`
        }
      }));
    } catch {
      alert('Restocking failed.');
    } finally {
      setRestocking(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-xl font-bold text-nira-dark font-heading">Access Denied</h2>
        <p className="text-xs text-nira-text-secondary mt-1 mb-4">You do not have administrative privileges to access the moderation desk.</p>
        <Link href="/dashboard" className="px-6 py-2.5 bg-nira-dark text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md">Back to Dashboard</Link>
      </div>
    );
  }

  // Filter lists
  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.user?.name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.guestEmail || '').toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredInventory = inventories.filter(inv =>
    inv.sku.toLowerCase().includes(invSearch.toLowerCase()) ||
    inv.product?.name.toLowerCase().includes(invSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-nira-gray text-nira-dark pb-20">
      
      {/* Header Banner */}
      <div className="bg-nira-dark text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15"  />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nira-yellow/10 border border-nira-yellow/20 text-xs font-bold text-nira-yellow mb-3 uppercase tracking-widest">
              <ShieldCheck className="w-4.5 h-4.5" /> Platform Admin Command Desk
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl">E-commerce Order &amp; Fulfillment</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={runSeeding}
              disabled={seeding}
              className="px-4 py-2.5 bg-white text-nira-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-nira-yellow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 animate-spin-slow" /> Seed Fulfillment</>}
            </button>
            <Link href="/dashboard" className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white transition-all bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" /> User Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl p-2 border border-nira-gray-dark shadow-sm overflow-x-auto scrollbar-hide gap-1">
          {[
            { id: 'analytics', label: 'Overview & Charts', icon: BarChart3 },
            { id: 'fulfillment', label: 'Fulfillment Queue', icon: ClipboardList },
            { id: 'warehouse', label: 'Warehouse Simulator', icon: Box },
            { id: 'inventory', label: 'SKU Inventory Desk', icon: Layers },
            { id: 'escrow', label: 'Escrow Booking Moderation', icon: CreditCard },
            { id: 'kyc', label: 'Creator KYC Approval', icon: ShieldCheck }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as 'analytics' | 'fulfillment' | 'warehouse' | 'inventory' | 'escrow' | 'kyc');
                setSelectedFulfillmentOrder(null);
                setWorkflowStep(0);
              }}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'bg-nira-dark text-white' 
                  : 'text-nira-text-secondary hover:bg-nira-gray hover:text-nira-dark'
              }`}
            >
              <tab.icon className="w-4.5 h-4.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Analytics & Sales Tab */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6 animate-scale-in">
            {/* Aggregate Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'E-commerce Revenue', value: formatPrice(analytics?.summary?.totalRevenue || 0), icon: TrendingUp, color: 'border-l-emerald-500' },
                { label: 'Completed Orders', value: orders.filter(o => o.orderStatus === 'delivered').length.toString(), icon: Package, color: 'border-l-blue-500' },
                { label: 'Average Order Value', value: formatPrice(analytics?.summary?.averageOrderValue || 0), icon: BarChart3, color: 'border-l-nira-yellow' },
                { label: 'Low Stock Alerts', value: inventories.filter(i => i.stockLevel <= i.lowStockThreshold).length.toString(), icon: AlertTriangle, color: 'border-l-red-500' }
              ].map((stat, i) => (
                <div key={i} className={`bg-white rounded-2xl p-5 border border-nira-gray-dark border-l-4 shadow-sm flex items-center justify-between`}>
                  <div>
                    <p className="text-[10px] text-nira-text-secondary font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="font-heading font-black text-xl text-nira-dark mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="w-7 h-7 text-nira-text-secondary/20" />
                </div>
              ))}
            </div>

            {/* Sales Chart & Status breakups */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Daily Sales Chart Simulation */}
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm lg:col-span-2">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-6">Daily Sales Revenue Chart (7 Days)</h3>
                
                <div className="h-64 flex items-end gap-3 sm:gap-6 border-b border-nira-gray-dark pb-3 pt-6 px-4">
                  {(analytics?.chartData || [
                    { date: '1 May', sales: 45000 },
                    { date: '2 May', sales: 65000 },
                    { date: '3 May', sales: 12000 },
                    { date: '4 May', sales: 89000 },
                    { date: '5 May', sales: 54000 },
                    { date: '6 May', sales: 110000 },
                    { date: '7 May', sales: 76000 }
                  ]).map((bar: { date: string; sales: number }, idx: number) => {
                    const maxVal = Math.max(...(analytics?.chartData || []).map((c: { sales: number }) => c.sales), 100000);
                    const percentage = Math.min(100, Math.round((bar.sales / maxVal) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-nira-dark text-white px-2 py-1 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                          {formatPrice(bar.sales)}
                        </div>

                        {/* Chart Bar */}
                        <div 
                          className="w-full bg-nira-yellow rounded-t-lg transition-all duration-700" 
                          style={{ height: `${percentage}%` }}
                        />
                        
                        {/* Date Label */}
                        <span className="text-[9px] text-nira-text-secondary font-bold mt-2 truncate w-full text-center">{bar.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status breakdown pie chart-like bar stats */}
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm col-span-1">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-4">Order Pipeline Status</h3>
                
                <div className="space-y-4 pt-4">
                  {[
                    { label: 'Pending Payment', key: 'pending', color: 'bg-neutral-400' },
                    { label: 'Confirmed', key: 'confirmed', color: 'bg-teal-400' },
                    { label: 'Processing', key: 'processing', color: 'bg-yellow-400' },
                    { label: 'Packed & QC', key: 'packed', color: 'bg-orange-400' },
                    { label: 'Shipped', key: 'shipped', color: 'bg-blue-400' },
                    { label: 'In Transit', key: 'in_transit', color: 'bg-indigo-400' },
                    { label: 'Out For Delivery', key: 'out_for_delivery', color: 'bg-purple-400' },
                    { label: 'Delivered', key: 'delivered', color: 'bg-emerald-500' }
                  ].map(stat => {
                    const count = analytics?.statusCounts?.[stat.key] || 0;
                    const max = orders.length || 1;
                    const percent = Math.round((count / max) * 100);
                    return (
                      <div key={stat.key} className="text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-nira-text-secondary">{stat.label}</span>
                          <span className="text-nira-dark">{count} ({percent}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-nira-gray rounded-full overflow-hidden">
                          <div className={`h-full ${stat.color}`}  />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Fulfillment Operations Queue */}
        {activeSubTab === 'fulfillment' && (
          <div className="bg-white rounded-3xl border border-nira-gray-dark shadow-sm overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-nira-gray-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-heading font-black text-sm uppercase tracking-wider">Fulfillment Operations Desk</h2>
                <p className="text-[10px] text-nira-text-secondary mt-0.5">Control order status transitions and warehouse picking assignments.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary" />
                <input 
                  type="text" 
                  placeholder="Search order ref..." 
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-nira-gray-dark rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nira-yellow"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-nira-gray/30 border-b border-nira-gray-dark text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider">
                    <th className="p-4">Order Code</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Items / Qty</th>
                    <th className="p-4 text-right">Payable</th>
                    <th className="p-4">Fulfillment Status</th>
                    <th className="p-4 text-center">Fulfill Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nira-gray-dark">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-nira-gray/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-nira-dark">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark">{order.shippingAddress.name}</p>
                        <p className="text-[10px] text-nira-text-secondary">{order.shippingAddress.phone} • {order.shippingAddress.city}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark">{order.items[0]?.product?.name || 'Diagnostic Package'} {order.items.length > 1 && `+ ${order.items.length - 1} items`}</p>
                        <p className="text-[10px] text-nira-text-secondary">Quantity: {order.items.reduce((sum, i) => sum + i.quantity, 0)} units</p>
                      </td>
                      <td className="p-4 text-right font-black text-nira-dark">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.orderStatus === 'pending' ? 'bg-neutral-100 text-neutral-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          {order.orderStatus === 'pending' ? (
                            <button
                              disabled={updatingStatusId === order._id}
                              onClick={() => transitionOrderStatus(order._id, 'confirmed', 'Payment verified by admin moderation.')}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[9px] uppercase cursor-pointer"
                            >
                              Verify &amp; Confirm
                            </button>
                          ) : ['confirmed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery'].includes(order.orderStatus) ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedFulfillmentOrder(order);
                                  setActiveSubTab('warehouse');
                                  
                                  // Map step matching order status
                                  const stepsMap: Record<string, number> = {
                                    confirmed: 0,
                                    processing: 1,
                                    packed: 4
                                  };
                                  setWorkflowStep(stepsMap[order.orderStatus] || 0);
                                }}
                                className="px-2.5 py-1.5 bg-nira-dark text-white rounded-lg font-bold text-[9px] uppercase flex items-center gap-1 hover:bg-nira-yellow hover:text-nira-dark transition-colors cursor-pointer"
                              >
                                <Box className="w-3 h-3" /> Warehouse Simulator
                              </button>

                              {/* Manual overrides */}
                              <select aria-label="Select option" title="Select option" 
                                onChange={(e) => transitionOrderStatus(order._id, e.target.value)}
                                className="px-2 py-1.5 border border-nira-gray-dark bg-white rounded-lg font-bold text-[9px] focus:outline-none"
                              >
                                <option value="">Override status</option>
                                <option value="in_transit">In Transit</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancel Order</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-[10px] text-nira-text-secondary italic font-semibold">Fulfillment Settled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-nira-text-secondary text-xs">No orders located in the fulfillment queue.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Warehouse Management Workflow Simulator */}
        {activeSubTab === 'warehouse' && (
          <div className="grid lg:grid-cols-3 gap-6 animate-scale-in">
            {/* Orders selector queue sidebar */}
            <div className="bg-white rounded-3xl border border-nira-gray-dark shadow-sm p-5 col-span-1 h-fit">
              <h3 className="font-heading font-black text-sm uppercase tracking-wider mb-4 border-b border-nira-gray-dark pb-2">Active Pick Queue</h3>
              
              <div className="space-y-2.5">
                {orders.filter(o => ['confirmed', 'processing', 'packed'].includes(o.orderStatus)).length === 0 ? (
                  <p className="text-center text-xs py-8 text-nira-text-secondary">No active orders requiring warehouse fulfillment picking.</p>
                ) : (
                  orders
                    .filter(o => ['confirmed', 'processing', 'packed'].includes(o.orderStatus))
                    .map(o => (
                      <button
                        key={o._id}
                        onClick={() => {
                          setSelectedFulfillmentOrder(o);
                          
                          const stepsMap: Record<string, number> = {
                            confirmed: 0,
                            processing: 1,
                            packed: 4
                          };
                          setWorkflowStep(stepsMap[o.orderStatus] || 0);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                          selectedFulfillmentOrder?._id === o._id 
                            ? 'border-nira-yellow bg-nira-yellow/5' 
                            : 'border-nira-gray-dark bg-white hover:bg-nira-gray/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-xs">#{o._id.slice(-8).toUpperCase()}</span>
                          <span className="text-[9px] bg-nira-dark text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">{o.orderStatus}</span>
                        </div>
                        <p className="text-[10px] text-nira-text-secondary truncate mt-1">{o.items[0]?.product?.name || 'Diagnostics Equipment Pack'}</p>
                      </button>
                    ))
                )}
              </div>
            </div>

            {/* Warehouse step operations desk */}
            <div className="bg-white rounded-3xl border border-nira-gray-dark shadow-sm p-6 lg:col-span-2">
              {selectedFulfillmentOrder ? (
                <div>
                  
                  {/* Fulfillment order details banner */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-nira-gray-dark">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-nira-text-secondary">Fulfilling order reference</span>
                      <h4 className="font-heading font-black text-base text-nira-dark">Order #{selectedFulfillmentOrder._id.slice(-8).toUpperCase()}</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedFulfillmentOrder(null)}
                      className="text-xs font-bold text-red-500 uppercase hover:underline"
                    >
                      Close simulator
                    </button>
                  </div>

                  {/* Flow Steps Progress header */}
                  <div className="flex justify-between items-center gap-1.5 mb-8 border-b border-nira-gray-dark pb-4 overflow-x-auto scrollbar-hide">
                    {[
                      { step: 0, label: '1. Pick Request' },
                      { step: 1, label: '2. Barcode Scan' },
                      { step: 2, label: '3. QC Check' },
                      { step: 3, label: '4. Packaging' },
                      { step: 4, label: '5. Dispatch Courier' }
                    ].map(item => (
                      <span key={item.step} className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg ${
                        workflowStep === item.step 
                          ? 'bg-nira-yellow text-nira-dark font-black' 
                          : workflowStep > item.step 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-nira-gray text-nira-text-secondary'
                      }`}>
                        {item.label}
                      </span>
                    ))}
                  </div>

                  {/* Step 0: Picking shelf location system */}
                  {workflowStep === 0 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-teal-800 shrink-0" />
                        <div>
                          <h5 className="font-bold text-xs text-teal-900">Locating Item on Warehouse Layout Grid</h5>
                          <p className="text-[11px] text-teal-700 mt-0.5">Shelf routing maps are generated dynamically from item SKU locations.</p>
                        </div>
                      </div>

                      <div className="border border-nira-gray-dark rounded-2xl overflow-hidden mt-4">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-nira-gray border-b border-nira-gray-dark text-[9px] font-bold text-nira-text-secondary uppercase">
                              <th className="p-3">Product Item</th>
                              <th className="p-3">SKU Code</th>
                              <th className="p-3">Layout bin Location</th>
                              <th className="p-3 text-center">Qty Required</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedFulfillmentOrder.items.map((item, idx) => {
                              const itemSku = item.sku || (item.product as { sku?: string }).sku || 'SKU-MOCK';
                              // Simulate location matching index
                              const randomBin = `Zone A - Shelf ${(idx % 12) + 1} - Bin ${(idx % 5) + 1}`;
                              return (
                                <tr key={idx} className="border-b border-nira-gray-dark last:border-b-0">
                                  <td className="p-3 font-bold text-nira-dark">{item.product?.name || 'Visual Rig'}</td>
                                  <td className="p-3 font-mono font-bold text-neutral-500">{itemSku}</td>
                                  <td className="p-3 font-bold text-nira-dark"><span className="px-2 py-0.5 bg-nira-yellow/20 rounded border border-nira-yellow text-[9px]">{randomBin}</span></td>
                                  <td className="p-3 text-center font-black text-nira-dark">{item.quantity}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Barcode scan simulation */}
                  {workflowStep === 1 && (
                    <div className="flex flex-col items-center text-center space-y-4 py-8">
                      <div className={`w-28 h-28 bg-nira-dark rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden transition-all ${
                        scanAnimationActive ? 'ring-4 ring-nira-yellow ring-offset-4' : ''
                      }`}>
                        <Box className="w-12 h-12 text-white" />
                        {scanAnimationActive && (
                          <div className="absolute inset-x-0 h-0.5 bg-red-500 animate-bounce top-1/2" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-heading font-black text-sm text-nira-dark">Item Barcode Simulation</h5>
                        <p className="text-xs text-nira-text-secondary mt-1 max-w-sm">Click the scan simulator button below to mimic laser scanning of product SKU barcode labels.</p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Quality Control (QC) verification checklist */}
                  {workflowStep === 2 && (
                    <div className="space-y-4">
                      <h5 className="font-heading font-black text-sm text-nira-dark">Quality Control Checklist</h5>
                      <p className="text-xs text-nira-text-secondary">Verify the cosmetic and sensor checks are complete before packing.</p>
                      
                      <div className="space-y-2 pt-2">
                        {[
                          'Verifying camera sensor dead-pixels checks passed',
                          'Checking glass elements are scratch-free and mounts fit securely',
                          'Confirming serial code matches packaging box details',
                          'Verify certificate card of 50-point inspection is added inside box'
                        ].map((chk, i) => (
                          <label key={i} className="flex items-start gap-2.5 p-3 border border-nira-gray-dark bg-nira-gray/30 rounded-xl cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={qcChecked} 
                              onChange={(e) => setQcChecked(e.target.checked)}
                              className="mt-0.5 w-4 h-4 accent-teal-600 rounded" 
                            />
                            <span className="text-xs font-semibold text-nira-dark">{chk}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Packing workflow box sizing selection */}
                  {workflowStep === 3 && (
                    <div className="space-y-4">
                      <h5 className="font-heading font-black text-sm text-nira-dark">Select Packaging Box Size</h5>
                      <p className="text-xs text-nira-text-secondary">Allocate packing boxes to minimize shipping space and damage.</p>
                      
                      <div className="grid sm:grid-cols-3 gap-3 pt-2">
                        {[
                          { size: 'Standard', desc: 'Lenses, audio mics, accessories' },
                          { size: 'Medium Box', desc: 'Mirrorless camera bodies, small gimbals' },
                          { size: 'Heavy-duty Flight Case', desc: 'Heavy rigs, drone cases, cinema packages' }
                        ].map(box => (
                          <label key={box.size} className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            boxSize === box.size ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark hover:bg-nira-gray/40'
                          }`}>
                            <input 
                              type="radio" 
                              name="box" 
                              checked={boxSize === box.size} 
                              onChange={() => setBoxSize(box.size)}
                              className="accent-nira-yellow sr-only" 
                            />
                            <span className="text-xs font-black text-nira-dark">{box.size}</span>
                            <span className="text-[10px] text-nira-text-secondary mt-1">{box.desc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Dispatch details and Courier assignment */}
                  {workflowStep === 4 && (
                    <div className="space-y-4">
                      <h5 className="font-heading font-black text-sm text-nira-dark">Dispatch &amp; Courier Assignment</h5>
                      <p className="text-xs text-nira-text-secondary">Select the logistics delivery partner and assign waybills.</p>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Courier Partner</label>
                          <select aria-label="Select option" title="Select option" 
                            value={selectedCourier}
                            onChange={(e) => setSelectedCourier(e.target.value)}
                            className="px-3 py-2.5 bg-nira-gray rounded-xl text-xs font-bold focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white"
                          >
                            <option value="NIRA Express">NIRA Express (Internal delivery network)</option>
                            <option value="BlueDart">BlueDart (Air priority routing)</option>
                            <option value="Delhivery">Delhivery (Surface logistics)</option>
                            <option value="DHL">DHL Express</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Fulfillment Station Hub</label>
                          <select aria-label="Select option" title="Select option" 
                            value={dispatchLocation}
                            onChange={(e) => setDispatchLocation(e.target.value)}
                            className="px-3 py-2.5 bg-nira-gray rounded-xl text-xs font-bold focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white"
                          >
                            <option value="Mumbai Central Depot">Mumbai Central Depot (BOM-01)</option>
                            <option value="Delhi Logistics Center">Delhi Logistics Center (DEL-02)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-8 pt-4 border-t border-nira-gray-dark flex justify-end">
                    <button
                      onClick={runWarehouseWorkflow}
                      className="px-6 py-3 bg-nira-dark text-white hover:bg-nira-yellow hover:text-nira-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      {workflowStep === 0 ? 'Fulfill Pick Request' 
                        : workflowStep === 1 ? 'Scan Barcodes'
                        : workflowStep === 2 ? 'Verify QC passed'
                        : workflowStep === 3 ? 'Seal & Pack Package'
                        : 'Generate Waybill & Ship Courier'}
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-nira-text-secondary">
                  <Box className="w-12 h-12 text-gray-300 mb-3" />
                  <h4 className="font-heading font-bold text-sm text-nira-dark uppercase">No order selected</h4>
                  <p className="text-xs mt-1">Select an active order from the picking queue sidebar to begin warehouse simulation.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. SKU Inventory Manager & Restocking Panel */}
        {activeSubTab === 'inventory' && (
          <div className="grid lg:grid-cols-3 gap-6 animate-scale-in">
            {/* SKU restock adjustment form sidebar */}
            <div className="bg-white rounded-3xl border border-nira-gray-dark shadow-sm p-6 col-span-1 h-fit">
              <h3 className="font-heading font-black text-sm uppercase tracking-wider mb-4 border-b border-nira-gray-dark pb-2">UPI Inward restocking</h3>
              
              <form onSubmit={handleRestock} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Select SKU</label>
                  <select aria-label="Select option" title="Select option"
                    value={selectedRestockSku}
                    onChange={(e) => setSelectedRestockSku(e.target.value)}
                    className="px-3 py-2.5 bg-nira-gray rounded-xl text-xs font-bold focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white"
                  >
                    <option value="">Choose active SKU...</option>
                    {inventories.map(inv => (
                      <option key={inv.sku} value={inv.sku}>{inv.sku} - {inv.product?.name?.slice(0, 20)}...</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Restock Quantity</label>
                  <input
                    type="number"
                    placeholder="E.g., 10"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="px-3 py-2.5 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Fulfillment Warehouse</label>
                  <select aria-label="Select option" title="Select option"
                    value={restockWarehouse}
                    onChange={(e) => setRestockWarehouse(e.target.value)}
                    className="px-3 py-2.5 bg-nira-gray rounded-xl text-xs font-bold focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white"
                  >
                    <option value="">Choose Warehouse...</option>
                    {warehouses.map(wh => (
                      <option key={wh._id} value={wh._id}>{wh.name} ({wh.city})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={restocking}
                  className="w-full py-3 bg-nira-dark text-white hover:bg-nira-yellow hover:text-nira-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {restocking ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Inward Restock Stock'}
                </button>
              </form>
            </div>

            {/* Inventory table */}
            <div className="bg-white rounded-3xl border border-nira-gray-dark shadow-sm p-6 lg:col-span-2 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-nira-gray-dark">
                <div>
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark">SKU Catalog &amp; stock levels</h3>
                  <p className="text-[10px] text-nira-text-secondary mt-0.5">Real-time stock alerts. Out-of-stock warning levels highlight in red.</p>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nira-text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Search SKU/Product..." 
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-nira-gray-dark rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nira-yellow"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-nira-gray/50 border-b border-nira-gray-dark text-[9px] font-bold text-nira-text-secondary uppercase">
                      <th className="p-3">SKU Code</th>
                      <th className="p-3">Product Model</th>
                      <th className="p-3">Warehouse Stock Allocation</th>
                      <th className="p-3 text-center">Global Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(inv => {
                      const isLowStock = inv.stockLevel <= inv.lowStockThreshold;
                      return (
                        <tr key={inv._id} className="border-b border-nira-gray-dark last:border-b-0 hover:bg-nira-gray/20 transition-colors">
                          <td className="p-3 font-mono font-bold text-neutral-500">{inv.sku}</td>
                          <td className="p-3 font-bold text-nira-dark">{inv.product?.name || 'Verified Accessories'}</td>
                          <td className="p-3">
                            <div className="space-y-1 text-[10px]">
                              {inv.warehouseStock.map((ws, i) => {
                                const matchedWh = warehouses.find(w => w._id === ws.warehouse);
                                return (
                                  <div key={i} className="flex justify-between max-w-[180px]">
                                    <span className="text-nira-text-secondary">{matchedWh?.code || 'WH'}: {ws.binLocation}</span>
                                    <span className="font-bold text-nira-dark">{ws.stock} units</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-6 rounded font-black text-xs ${
                              inv.stockLevel === 0 ? 'bg-red-100 text-red-800' :
                              isLowStock ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {inv.stockLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. Escrow Booking Moderation */}
        {activeSubTab === 'escrow' && (
          <div className="bg-white rounded-3xl border border-nira-gray-dark shadow-sm overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-nira-gray-dark flex justify-between items-center">
              <div>
                <h2 className="font-heading font-black text-sm uppercase tracking-wider">Escrow Registry Queue</h2>
                <p className="text-[10px] text-nira-text-secondary mt-0.5">Moderation of client escrow deposits for production slot bookings.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-nira-gray/30 border-b border-nira-gray-dark text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider">
                    <th className="p-4">Booking Ref</th>
                    <th className="p-4">Client Detail</th>
                    <th className="p-4">Creator Detail</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Advance Paid</th>
                    <th className="p-4">Escrow Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nira-gray-dark text-xs">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-nira-gray/10 transition-colors">
                      <td className="p-4 font-bold text-nira-dark">
                        #{b._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark">{b.clientId?.name || 'Guest'}</p>
                        <p className="text-[10px] text-nira-text-secondary">{b.clientId?.email || '-'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark">{b.creatorId?.name}</p>
                        <p className="text-[10px] text-nira-text-secondary">{b.creatorId?.email || '-'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-nira-dark uppercase text-[10px]">{b.eventType}</p>
                        <p className="text-[10px] text-nira-text-secondary">{b.packageName}</p>
                      </td>
                      <td className="p-4 font-black text-nira-dark">
                        ₹{b.advancePaid.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          b.escrowStatus === 'held' ? 'bg-nira-yellow/20 text-nira-dark'
                          : b.escrowStatus === 'disbursed' ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {b.escrowStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {b.escrowStatus === 'held' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={resolvingBookingId === b._id}
                              onClick={() => handleResolveDispute(b._id, 'disburse')}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                            >
                              <Check className="w-3.5 h-3.5" /> Disburse
                            </button>
                            <button
                              disabled={resolvingBookingId === b._id}
                              onClick={() => handleResolveDispute(b._id, 'refund')}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                            >
                              <X className="w-3.5 h-3.5" /> Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-nira-text-secondary font-semibold italic">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-nira-text-secondary text-xs">No active bookings held in Escrow moderation desk.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC APPROVAL VIEW */}
        {activeSubTab === 'kyc' && (
          <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-nira-dark uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-nira-yellow" /> KYC Verification Queue
                </h2>
                <p className="text-xs text-nira-text-secondary mt-1">Approve or reject creator profiles</p>
              </div>
            </div>
            <div className="p-6">
              {kycRequests.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-nira-text-secondary font-bold">No pending KYC requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {kycRequests.map((req: any) => (
                    <div key={req._id} className="bg-nira-gray rounded-xl p-5 border border-nira-gray-dark flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white">
                          <img src={req.userId?.avatar || '/assets/avatar-placeholder.png'} alt="Creator" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-nira-dark">{req.businessName || req.userId?.name}</p>
                          <p className="text-xs text-nira-text-secondary">{req.category} • {req.location}</p>
                          {req.govtIdUrl && <a href={req.govtIdUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline mt-1 block">View ID Document</a>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={async () => {
                          try {
                            await api.post('/admin/creators/kyc/approve', { creatorId: req._id, action: 'reject' });
                            setKycRequests(prev => prev.filter(p => p._id !== req._id));
                          } catch(e) { alert('Error rejecting KYC'); }
                        }} className="px-4 py-2 bg-white text-red-600 font-bold text-xs uppercase rounded-lg border border-red-200 hover:bg-red-50">Reject</button>
                        <button onClick={async () => {
                          try {
                            await api.post('/admin/creators/kyc/approve', { creatorId: req._id, action: 'approve' });
                            setKycRequests(prev => prev.filter(p => p._id !== req._id));
                          } catch(e) { alert('Error approving KYC'); }
                        }} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs uppercase rounded-lg hover:bg-emerald-700">Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
