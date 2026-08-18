'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, ShieldAlert, Check, X, CreditCard, 
  Loader2, TrendingUp, Package, Box, MapPin, 
  AlertTriangle, RefreshCw, BarChart3, Layers, ClipboardList,
  Search, CornerDownLeft, History, FileText,
  Menu, Sun, Moon, Bell, Settings, Activity, Plus, Edit,
  Trash2, Copy, Download, Upload, ShoppingBag, Users
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

interface AdminProduct {
  _id?: string;
  sku?: string;
  name: string;
  brand: string;
  price: number | string;
  category: string;
  image: string;
  grade: string;
  conditionScore?: number | string;
  featured?: boolean;
  trending?: boolean;
  originalPrice?: number | string;
  description?: string;
  warranty?: string;
  stock?: number | string;
  tags?: string[] | string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[] | string;
  variants?: Record<string, unknown>[];
}

interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  role: string;
  ordersCount?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  adminApprovedByOwner?: boolean;
}

interface AdminActivityLog {
  _id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  ipAddress: string;
  device: string;
  details: string;
}

interface DashboardNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  time: string;
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
  orderId?: string;
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
  trackingNumber?: string;
  courierPartner?: string;
  trackingUpdates?: {
    status: string;
    description: string;
    location: string;
    timestamp: string;
  }[];
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

interface KycRequest {
  _id: string;
  businessName?: string;
  userId?: {
    name: string;
    avatar?: string;
  };
  category: string;
  location: string;
  govtIdUrl?: string;
}

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    averageOrderValue: number;
  };
  chartData: {
    date: string;
    sales: number;
  }[];
  statusCounts: Record<string, number>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'fulfillment' | 'warehouse' | 'inventory' | 'escrow' | 'kyc' | 'returns' | 'audit' | 'products' | 'customers' | 'activity' | 'settings'>('analytics');
  
  // Dark mode
  const [darkMode, setDarkMode] = useState(false);
  // Sidebar Collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Products Management state
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [productForm, setProductForm] = useState({
    _id: '',
    name: '',
    brand: '',
    price: '',
    category: 'Cameras',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
    grade: 'Like New',
    conditionScore: '95',
    featured: false,
    trending: false,
    originalPrice: '',
    description: '',
    warranty: '6 Months NIRA6 Warranty',
    stock: '1',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    variants: [] as Record<string, unknown>[]
  });
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Customers Management state
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Admin Activity Logs state
  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<DashboardNotification[]>([
    { id: 1, title: '📦 New Order Placed', message: 'Order NIRA6-20260612-0042 received.', type: 'info', time: '5m ago' },
    { id: 2, title: '⚠️ Low Stock Alert', message: 'Sony Alpha A7 III is down to 1 unit.', type: 'warning', time: '12m ago' },
    { id: 3, title: '↩️ Return Request', message: 'Customer requested return for INV-20260611-0023.', type: 'refund', time: '40m ago' }
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Global search query
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Settings Panel state
  const [settings, setSettings] = useState({
    gatewayMode: 'test',
    taxType: 'gst',
    cgstRate: '9',
    sgstRate: '9',
    igstRate: '18',
    couponCode: 'NIRA6WELCOME',
    couponDiscount: '10',
    emailTemplate: 'Thank you for choosing NIRA6. Your order #{{orderId}} is verified.',
    smsTemplate: 'NIRA6: Your order #{{orderId}} has been shipped via {{courier}}.',
    whatsappTemplate: 'Hi {{name}}, your return request for #{{orderId}} has been approved.'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // KYC State
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  // Bookings / Escrows State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resolvingBookingId, setResolvingBookingId] = useState<string | null>(null);
  const [escrowStats, setEscrowStats] = useState({
    totalBookings: 0,
    escrowHeld: 0,
    escrowRefunded: 0,
    escrowDisbursed: 0
  });

  // Returns state variables
  interface ReturnRequestItem {
    _id: string;
    orderId: string;
    order: {
      _id: string;
      orderId?: string;
      items: {
        product: {
          name: string;
        }
      }[];
      totalAmount: number;
    };
    user: {
      name: string;
      email: string;
    };
    reason: string;
    photos: string[];
    refundMethod: string;
    refundAmount: number;
    status: string;
    createdAt: string;
    adminNotes?: string;
    pickupCourier?: string;
    pickupAWB?: string;
    pickupDate?: string;
  }
  const [returnRequests, setReturnRequests] = useState<ReturnRequestItem[]>([]);
  const [adminNotesInputs, setAdminNotesInputs] = useState<Record<string, string>>({});
  const [pickupCourierInputs, setPickupCourierInputs] = useState<Record<string, string>>({});
  const [pickupDateInputs, setPickupDateInputs] = useState<Record<string, string>>({});

  // Audit state variables
  interface AuditLogItem {
    _id: string;
    orderId: string;
    eventName: string;
    notes: string;
    operator: string;
    role: string;
    timestamp: string;
  }
  const [selectedAuditOrder, setSelectedAuditOrder] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  // E-commerce state
  const [, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
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
      const adminOrdersRes = await api.get('/admin/orders');
      setOrders(adminOrdersRes.data.orders || adminOrdersRes.data);

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

      // Fetch Return requests
      try {
        const returnsRes = await api.get('/admin/returns');
        setReturnRequests(returnsRes.data);
      } catch (e) {
        console.error('Failed to fetch return requests', e);
      }

      // Fetch Admin Products
      try {
        const productsRes = await api.get('/admin/products');
        setAdminProducts(productsRes.data);
      } catch (e) {
        console.error('Failed to fetch admin products', e);
      }

      // Fetch Customers
      try {
        const customersRes = await api.get('/admin/customers');
        setCustomers(customersRes.data);
      } catch (e) {
        console.error('Failed to fetch customers', e);
      }

      // Fetch Admin Activity Logs
      try {
        const logsRes = await api.get('/admin/activity-logs');
        setAdminActivityLogs(logsRes.data.logs || logsRes.data);
      } catch (e) {
        console.error('Failed to fetch activity logs', e);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const isOwner = currentUser.email === 'nira6studio@gmail.com';
    const isApprovedStaff = ['admin', 'super_admin'].includes(currentUser.role) && currentUser.adminApprovedByOwner;
    
    if (isOwner || isApprovedStaff) {
      const timeout = setTimeout(() => { void fetchAdminData(); }, 0);
      return () => clearTimeout(timeout);
    } else {
      router.push('/');
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

  const handleReturnAction = async (returnRequestId: string, action: string, extra = {}) => {
    try {
      const res = await api.post('/admin/returns', {
        returnRequestId,
        action,
        ...extra
      });
      alert(`Return action '${action.toUpperCase()}' processed successfully.`);
      fetchAdminData();

      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '↩️ Return Processed',
          content: `Return status updated to: ${res.data.returnRequest?.status || action}.`
        }
      }));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Moderation action failed.');
    }
  };

  const fetchAuditLogs = async (orderObjectId: string) => {
    if (!orderObjectId) {
      setAuditLogs([]);
      return;
    }
    setLoadingAudits(true);
    try {
      const res = await api.get(`/orders/${orderObjectId}/audit`);
      setAuditLogs(res.data);
    } catch {
      alert('Failed to retrieve audit records.');
    } finally {
      setLoadingAudits(false);
    }
  };

  useEffect(() => {
    if (selectedAuditOrder) {
      const timer = setTimeout(() => {
        void fetchAuditLogs(selectedAuditOrder);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      Promise.resolve().then(() => setAuditLogs([]));
    }
  }, [selectedAuditOrder]);

  // Product Save/Update Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.brand || !productForm.price) {
      alert('Product name, brand, and price are required.');
      return;
    }
    setIsSubmittingProduct(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock),
        conditionScore: Number(productForm.conditionScore),
        tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        seoKeywords: productForm.seoKeywords.split(',').map(k => k.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
        alert('Product updated successfully.');
      } else {
        await api.post('/admin/products', payload);
        alert('Product added successfully.');
      }

      setProductForm({
        _id: '',
        name: '',
        brand: '',
        price: '',
        category: 'Cameras',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
        grade: 'Like New',
        conditionScore: '95',
        featured: false,
        trending: false,
        originalPrice: '',
        description: '',
        warranty: '6 Months NIRA6 Warranty',
        stock: '1',
        tags: '',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        variants: []
      });
      setEditingProduct(null);
      fetchAdminData();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to save product.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Duplicate product pre-fill
  const handleDuplicateProduct = (prod: AdminProduct) => {
    setProductForm({
      _id: '',
      name: `${prod.name} (Copy)`,
      brand: prod.brand,
      price: String(prod.price),
      category: prod.category,
      image: prod.image,
      grade: prod.grade,
      conditionScore: String(prod.conditionScore || 90),
      featured: !!prod.featured,
      trending: !!prod.trending,
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
      description: prod.description || '',
      warranty: prod.warranty || '6 Months NIRA6 Warranty',
      stock: String(prod.stock || 1),
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : '',
      seoTitle: prod.seoTitle || '',
      seoDescription: prod.seoDescription || '',
      seoKeywords: Array.isArray(prod.seoKeywords) ? prod.seoKeywords.join(', ') : '',
      variants: prod.variants || []
    });
    setEditingProduct(null);
    setActiveSubTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('Product details duplicated. You can now edit and save.');
  };

  // Archive product
  const handleArchiveProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to archive this product? This will remove it from store listing.')) return;
    try {
      await api.delete(`/admin/products/${prodId}`);
      alert('Product archived.');
      fetchAdminData();
    } catch {
      alert('Failed to archive product.');
    }
  };

  // Export Catalog as JSON
  const handleExportProducts = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(adminProducts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nira6_catalog_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Catalog JSON/CSV
  const handleImportProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        
        let successCount = 0;
        for (const item of list) {
          try {
            await api.post('/admin/products', {
              name: item.name || 'Imported Product',
              brand: item.brand || 'NIRA6',
              price: item.price || 100,
              category: item.category || 'Cameras',
              image: item.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
              grade: item.grade || 'Like New',
              originalPrice: item.originalPrice,
              stock: item.stock || 1,
              description: item.description || '',
              variants: item.variants || []
            });
            successCount++;
          } catch (itemErr) {
            console.error('Failed to import product item:', itemErr);
          }
        }
        alert(`Successfully imported ${successCount} products!`);
        fetchAdminData();
      } catch {
        alert('Invalid JSON file format. Make sure it is a product details array.');
      }
    };
    reader.readAsText(file);
  };

  // Toggle staff permissions (owner only)
  const handleToggleAdminPermission = async (userId: string, currentRole: string, currentApproved: boolean) => {
    const action = (currentRole === 'admin' && currentApproved) ? 'revoke_admin' : 'approve_admin';
    const msg = action === 'approve_admin' 
      ? 'Promote user to administrator and grant dashboard access?'
      : 'Revoke administrator permissions and block dashboard access?';
    
    if (!confirm(msg)) return;

    try {
      const res = await api.put('/admin/customers', { targetUserId: userId, action });
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to toggle admin status.');
    }
  };

  // Save Settings configuration
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      alert('Dashboard & Operations settings updated successfully.');
      
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '⚙️ Settings Updated',
          content: `Payment gateways configured to ${settings.gatewayMode} mode. CGST/SGST/IGST rates updated.`
        }
      }));
    }, 800);
  };

  const isOwner = currentUser?.email === 'nira6studio@gmail.com';
  const isApprovedStaff = ['admin', 'super_admin'].includes(currentUser?.role || '') && currentUser?.adminApprovedByOwner;

  if (!currentUser || (!isOwner && !isApprovedStaff)) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold font-heading mb-2">Access Restrained</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          This command deck is strictly restricted to the owner (<strong className="text-white">nira6studio@gmail.com</strong>) and authorized staff accounts approved by the owner.
        </p>
        <Link href="/" className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-950">
          Return to Homepage
        </Link>
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
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Collapsible Left Sidebar */}
      <aside className={`border-r shrink-0 transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} ${sidebarCollapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col`}>
        {/* Brand/Logo */}
        <div className={`flex items-center gap-3 p-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-base shadow-md">
            N
          </div>
          {!sidebarCollapsed && (
            <div className="font-heading font-black text-lg tracking-wider">
              NIRA<span className="text-rose-600">6</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-600/10 text-[9px] text-rose-500 uppercase tracking-widest font-black">
                Admin
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {[
            { id: 'analytics', label: 'Overview & Charts', icon: BarChart3 },
            { id: 'fulfillment', label: 'Fulfillment Queue', icon: ClipboardList },
            { id: 'products', label: 'Products Catalog', icon: ShoppingBag },
            { id: 'inventory', label: 'SKU Inventory Desk', icon: Layers },
            { id: 'warehouse', label: 'Warehouse Simulator', icon: Box },
            { id: 'customers', label: 'Customers CRM', icon: Users },
            { id: 'returns', label: 'Returns Desk', icon: CornerDownLeft },
            { id: 'escrow', label: 'Escrow Moderation', icon: CreditCard },
            { id: 'kyc', label: 'Creator KYC', icon: ShieldCheck },
            { id: 'audit', label: 'Audit Trails', icon: History },
            { id: 'activity', label: 'Activity Logs', icon: Activity },
            { id: 'settings', label: 'Settings Panel', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSubTab(item.id as 'analytics' | 'fulfillment' | 'warehouse' | 'inventory' | 'escrow' | 'kyc' | 'returns' | 'audit' | 'products' | 'customers' | 'activity' | 'settings');
                  setSelectedFulfillmentOrder(null);
                  setWorkflowStep(0);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  active 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                    : `${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-30 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4 flex-1">
            {/* Sidebar toggle */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search orders, products, customers..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none transition-all ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-rose-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-rose-500'
                }`}
              />
            </div>
          </div>

          {/* Topbar Right Controls */}
          <div className="flex items-center gap-3">
            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                darkMode ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-50 text-indigo-600'
              }`}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2.5 rounded-xl border relative transition-all ${
                  darkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              {notificationsOpen && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-xl border p-4 space-y-3 z-50 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
                    <span className="text-xs font-black uppercase tracking-wider">Operational Alerts</span>
                    <span className="text-[10px] text-rose-500 cursor-pointer hover:underline" onClick={() => setNotifications([])}>Clear all</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="text-xs border-b border-slate-700/20 pb-2 last:border-none last:pb-0">
                        <div className="font-bold flex justify-between">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-center text-[11px] text-slate-400 py-3">No unresolved operations notifications.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Seeding Trigger */}
            <button
              onClick={runSeeding}
              disabled={seeding}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">Seed Transaction</span>
            </button>

            {/* Profile Dropdown / Logged in operator name */}
            <div className="flex items-center gap-2 border-l pl-3 border-slate-200 dark:border-slate-800 text-xs">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-bold truncate max-w-[100px]">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Operator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto scrollbar-hide gap-1 p-3 bg-slate-900 border-b border-slate-800 sticky top-16 z-30">
          {[
            { id: 'analytics', label: 'Overview', icon: BarChart3 },
            { id: 'fulfillment', label: 'Queue', icon: ClipboardList },
            { id: 'products', label: 'Catalog', icon: ShoppingBag },
            { id: 'inventory', label: 'Stock', icon: Layers },
            { id: 'warehouse', label: 'Warehouse', icon: Box },
            { id: 'customers', label: 'CRM', icon: Users },
            { id: 'returns', label: 'Returns', icon: CornerDownLeft },
            { id: 'escrow', label: 'Escrow', icon: CreditCard },
            { id: 'kyc', label: 'KYC', icon: ShieldCheck },
            { id: 'audit', label: 'Audits', icon: History },
            { id: 'activity', label: 'Logs', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as 'analytics' | 'fulfillment' | 'warehouse' | 'inventory' | 'escrow' | 'kyc' | 'returns' | 'audit' | 'products' | 'customers' | 'activity' | 'settings');
                setSelectedFulfillmentOrder(null);
                setWorkflowStep(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeSubTab === tab.id 
                  ? 'bg-rose-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Main Section Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

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
                  {(() => {
                    const chartBars = analytics?.chartData || [
                      { date: '1 May', sales: 45000 },
                      { date: '2 May', sales: 65000 },
                      { date: '3 May', sales: 12000 },
                      { date: '4 May', sales: 89000 },
                      { date: '5 May', sales: 54000 },
                      { date: '6 May', sales: 110000 },
                      { date: '7 May', sales: 76000 }
                    ];
                    const maxVal = Math.max(...chartBars.map((c: { sales: number }) => c.sales), 100000);
                    const styles = chartBars.map((bar: { sales: number }, idx: number) => {
                      const percentage = Math.min(100, Math.round((bar.sales / maxVal) * 100));
                      return `.chart-bar-${idx} { height: ${percentage}%; }`;
                    }).join('\n');

                    return (
                      <>
                        <style dangerouslySetInnerHTML={{ __html: styles }} />
                        {chartBars.map((bar: { date: string; sales: number }, idx: number) => {
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full mb-2 bg-nira-dark text-white px-2 py-1 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {formatPrice(bar.sales)}
                              </div>

                              {/* Chart Bar */}
                              <div className={`w-full bg-nira-yellow rounded-t-lg transition-all duration-700 chart-bar-${idx}`} />

                              {/* Date Label */}
                              <span className="text-[9px] text-nira-text-secondary font-bold mt-2 truncate w-full text-center">{bar.date}</span>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
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

            {/* Extended Operations Analytics Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Card 1: Conversion Rates */}
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark mb-4 border-b border-nira-gray-dark pb-2">
                  Visitor Conversion funnel
                </h3>
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-nira-dark mb-1">
                      <span>Unique Sessions</span>
                      <span>42,105 visitors</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-nira-dark" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-nira-dark mb-1">
                      <span>Add to Cart Rate (12.8%)</span>
                      <span>5,389 sessions</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-[12.8%] h-full bg-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-nira-dark mb-1">
                      <span>Checkout Initiations (8.2%)</span>
                      <span>3,452 sessions</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-[8.2%] h-full bg-amber-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-nira-dark mb-1">
                      <span>Completed Transactions (3.4%)</span>
                      <span>{orders.length} orders</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="w-[3.4%] h-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Return Frequencies */}
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark mb-4 border-b border-nira-gray-dark pb-2">
                  Return Frequencies &amp; Quality
                </h3>
                <div className="space-y-4 text-xs font-bold">
                  <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-xl border border-nira-gray-dark">
                    <span className="text-nira-text-secondary">Global Return Rate</span>
                    <span className="text-red-600 text-sm font-black">
                      {orders.length > 0 ? ((returnRequests.length / orders.length) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-xl border border-nira-gray-dark">
                    <span className="text-nira-text-secondary">Main Defect Driver</span>
                    <span className="text-nira-dark text-xs truncate max-w-[120px]">Hardware Fault</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-xl border border-nira-gray-dark">
                    <span className="text-nira-text-secondary">QC Pass Rating</span>
                    <span className="text-emerald-600 text-sm font-black">98.9%</span>
                  </div>
                  <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-xl border border-nira-gray-dark">
                    <span className="text-nira-text-secondary">Wallet Refund Ratio</span>
                    <span className="text-indigo-600 text-sm font-black">74.5%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Courier Shipment Timings */}
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-nira-dark mb-4 border-b border-nira-gray-dark pb-2">
                  Logistics &amp; Courier Timings
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'NIRA Express (Local TN)', time: '0.6 Days Avg', score: '99.8%', pct: 99 },
                    { name: 'BlueDart (Priority Air)', time: '1.2 Days Avg', score: '98.5%', pct: 85 },
                    { name: 'Delhivery (Surface Logistics)', time: '2.8 Days Avg', score: '94.2%', pct: 60 },
                    { name: 'DHL Express (Interstate Air)', time: '1.4 Days Avg', score: '97.6%', pct: 80 }
                  ].map((courier, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between font-bold text-nira-dark">
                        <span>{courier.name}</span>
                        <span>{courier.time}</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-1">
                        <div className={`h-full bg-nira-yellow ${
                          courier.pct === 99 ? 'w-[99%]' :
                          courier.pct === 85 ? 'w-[85%]' :
                          courier.pct === 80 ? 'w-[80%]' :
                          courier.pct === 60 ? 'w-[60%]' : 'w-0'
                        }`} />
                      </div>
                    </div>
                  ))}
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

            {/* Escrow Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-nira-gray/25 border-b border-nira-gray-dark">
              <div className="bg-white p-3 rounded-2xl border border-nira-gray-dark">
                <p className="text-[9px] font-bold text-nira-text-secondary uppercase">Total Bookings</p>
                <p className="text-sm font-black text-nira-dark mt-1">{escrowStats.totalBookings}</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-nira-gray-dark">
                <p className="text-[9px] font-bold text-nira-text-secondary uppercase">Escrow Held</p>
                <p className="text-sm font-black text-nira-yellow mt-1">₹{escrowStats.escrowHeld.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-nira-gray-dark">
                <p className="text-[9px] font-bold text-nira-text-secondary uppercase">Escrow Refunded</p>
                <p className="text-sm font-black text-red-600 mt-1">₹{escrowStats.escrowRefunded.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-nira-gray-dark">
                <p className="text-[9px] font-bold text-nira-text-secondary uppercase">Escrow Disbursed</p>
                <p className="text-sm font-black text-emerald-600 mt-1">₹{escrowStats.escrowDisbursed.toLocaleString('en-IN')}</p>
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
                  {kycRequests.map((req: KycRequest) => (
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
                          } catch { alert('Error rejecting KYC'); }
                        }} className="px-4 py-2 bg-white text-red-600 font-bold text-xs uppercase rounded-lg border border-red-200 hover:bg-red-50">Reject</button>
                        <button onClick={async () => {
                          try {
                            await api.post('/admin/creators/kyc/approve', { creatorId: req._id, action: 'approve' });
                            setKycRequests(prev => prev.filter(p => p._id !== req._id));
                          } catch { alert('Error approving KYC'); }
                        }} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs uppercase rounded-lg hover:bg-emerald-700">Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Returns Moderation Desk */}
        {activeSubTab === 'returns' && (
          <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-nira-gray-dark flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-nira-dark uppercase tracking-wider flex items-center gap-2">
                  <CornerDownLeft className="w-5 h-5 text-nira-yellow" /> Returns &amp; Refunds Moderation Desk
                </h2>
                <p className="text-xs text-nira-text-secondary mt-1">Review return requests, schedule reverse pickups, and process customer wallet payouts.</p>
              </div>
            </div>
            <div className="p-6">
              {returnRequests.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-nira-text-secondary font-bold">No active return requests found in database registry.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returnRequests.map((req) => {
                    const notes = adminNotesInputs[req._id] || '';
                    const courier = pickupCourierInputs[req._id] || 'Delhivery';
                    const pDate = pickupDateInputs[req._id] || '';

                    return (
                      <div key={req._id} className="bg-neutral-50 rounded-2xl p-5 border border-nira-gray-dark flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-3 flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono font-bold text-xs bg-nira-dark text-white px-2 py-0.5 rounded">
                              Order ID: {req.order?.orderId || req.orderId || 'MOCK-ID'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {req.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-bold text-nira-text-secondary">Customer Detail</p>
                              <p className="font-bold text-nira-dark mt-0.5">{req.user?.name || 'Customer'}</p>
                              <p className="text-nira-text-secondary">{req.user?.email || '-'}</p>
                            </div>
                            <div>
                              <p className="font-bold text-nira-text-secondary">Reason &amp; Request Info</p>
                              <p className="font-bold text-nira-dark mt-0.5 italic">&ldquo;{req.reason}&rdquo;</p>
                              <p className="text-nira-text-secondary mt-0.5">Refund: <span className="font-bold text-nira-dark">₹{req.refundAmount}</span> ({req.refundMethod})</p>
                            </div>
                          </div>

                          {/* Render proof photos */}
                          {req.photos && req.photos.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold text-nira-text-secondary uppercase mb-1.5">Proof Attachments ({req.photos.length})</p>
                              <div className="flex flex-wrap gap-2">
                                {req.photos.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg border border-nira-gray-dark overflow-hidden hover:opacity-80 transition-opacity bg-white">
                                    <img src={url} alt="Return snap" className="w-full h-full object-cover" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Show pickup details if scheduled */}
                          {req.pickupAWB && (
                            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                              <p className="font-bold">Reverse Pickup Scheduled</p>
                              <p className="mt-0.5">Courier: <span className="font-bold">{req.pickupCourier}</span> | AWB: <span className="font-mono font-bold">{req.pickupAWB}</span></p>
                              {req.pickupDate && <p className="text-[10px] text-indigo-700 mt-0.5">Scheduled Date: {new Date(req.pickupDate).toDateString()}</p>}
                            </div>
                          )}
                        </div>

                        {/* Actions desk */}
                        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-nira-gray-dark pt-4 md:pt-0 md:pl-6 space-y-3 flex flex-col justify-center shrink-0">
                          {req.status === 'pending' && (
                            <div className="space-y-3 w-full">
                              <input
                                type="text"
                                placeholder="Decision remarks..."
                                value={notes}
                                onChange={(e) => setAdminNotesInputs(prev => ({ ...prev, [req._id]: e.target.value }))}
                                className="w-full px-3 py-2 border border-nira-gray-dark bg-white rounded-xl text-xs focus:outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReturnAction(req._id, 'approve', { adminNotes: notes })}
                                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReturnAction(req._id, 'reject', { adminNotes: notes })}
                                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}

                          {req.status === 'approved' && (
                            <div className="space-y-3 w-full">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Pickup Courier</label>
                                <select
                                  title="Courier"
                                  value={courier}
                                  onChange={(e) => setPickupCourierInputs(prev => ({ ...prev, [req._id]: e.target.value }))}
                                  className="px-2 py-1.5 bg-white border border-nira-gray-dark rounded-lg text-xs"
                                >
                                  <option value="Delhivery">Delhivery</option>
                                  <option value="BlueDart">BlueDart</option>
                                  <option value="DTDC">DTDC</option>
                                  <option value="Shiprocket">Shiprocket</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-nira-text-secondary uppercase">Pickup Date</label>
                                <input
                                  type="date"
                                  title="Pickup Date"
                                  value={pDate}
                                  onChange={(e) => setPickupDateInputs(prev => ({ ...prev, [req._id]: e.target.value }))}
                                  className="px-2 py-1.5 bg-white border border-nira-gray-dark rounded-lg text-xs"
                                />
                              </div>
                              <button
                                onClick={() => handleReturnAction(req._id, 'schedule_pickup', { pickupCourier: courier, pickupDate: pDate })}
                                className="w-full py-2 bg-nira-dark hover:bg-nira-yellow text-white hover:text-nira-dark font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                              >
                                Schedule Reverse Pickup
                              </button>
                            </div>
                          )}

                          {req.status === 'pickup_scheduled' && (
                            <button
                              onClick={() => handleReturnAction(req._id, 'receive')}
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                            >
                              Confirm Hub Package Receipt &amp; QC
                            </button>
                          )}

                          {req.status === 'received' && (
                            <button
                              onClick={() => handleReturnAction(req._id, 'process_refund')}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-xl cursor-pointer"
                            >
                              Process Refund payout (₹{req.refundAmount})
                            </button>
                          )}

                          {req.status === 'completed' && (
                            <div className="text-center py-2 text-emerald-600 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 rounded-xl border border-emerald-100">
                              Refund fully processed
                            </div>
                          )}

                          {req.status === 'rejected' && (
                            <div className="text-center py-2 text-red-600 font-bold text-[10px] uppercase tracking-wider bg-red-50 rounded-xl border border-red-100">
                              Request Rejected
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. Audit Trails */}
        {activeSubTab === 'audit' && (
          <div className="bg-white rounded-2xl shadow-sm border border-nira-gray-dark overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-nira-gray-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-nira-dark uppercase tracking-wider flex items-center gap-2">
                  <History className="w-5 h-5 text-nira-yellow" /> Administrative Audit Trails
                </h2>
                <p className="text-xs text-nira-text-secondary mt-1">Audit log records of operator actions, status transitions, and refund parameters.</p>
              </div>
              <div className="relative w-full sm:w-80">
                <select
                  aria-label="Select order to inspect"
                  title="Select order to inspect"
                  value={selectedAuditOrder}
                  onChange={(e) => setSelectedAuditOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-nira-gray rounded-xl text-xs font-bold focus:outline-none border border-transparent focus:border-nira-yellow focus:bg-white cursor-pointer"
                >
                  <option value="">Choose order to inspect audits...</option>
                  {orders.map(o => (
                    <option key={o._id} value={o._id}>
                      Order #{o.orderId || o._id.slice(-8).toUpperCase()} - {o.shippingAddress.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6">
              {!selectedAuditOrder ? (
                <div className="text-center py-12 text-nira-text-secondary text-xs">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold">No order selected for auditing</p>
                  <p className="mt-1">Select an order from the dropdown list to pull historical log records.</p>
                </div>
              ) : loadingAudits ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-nira-yellow animate-spin" />
                  <p className="text-xs text-nira-text-secondary mt-2">Pulling log data from audit counters...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-nira-text-secondary text-xs">
                  <p className="font-bold text-nira-dark">No audit records exist for this order.</p>
                  <p className="mt-1">Status changes done prior to audit ledger updates won't be displayed.</p>
                </div>
              ) : (
                <div className="relative border-l border-nira-gray-dark ml-4 pl-6 space-y-6">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 bg-nira-yellow text-nira-dark border-2 border-nira-dark rounded-full flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                      
                      <div className="bg-neutral-50 border border-nira-gray-dark rounded-xl p-4 max-w-2xl">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-nira-yellow uppercase tracking-wider bg-nira-dark text-white px-2.5 py-0.5 rounded">
                              {log.eventName.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-nira-text-secondary font-bold ml-2">
                              Operator: {log.operator} ({log.role})
                            </span>
                          </div>
                          <span className="text-[10px] text-nira-text-secondary font-semibold">
                            {new Date(log.timestamp).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-nira-dark font-medium mt-2 leading-relaxed">
                          {log.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. Products Catalog Tab */}
        {activeSubTab === 'products' && (
          <div className="space-y-6 animate-scale-in text-left">
            {/* Catalog Actions Header */}
            <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-rose-500" /> Products Management Desk
                </h2>
                <p className="text-xs text-slate-400 mt-1">Add, edit, duplicate, archive or export your store products and variant configurations.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleExportProducts}
                  className="px-4 py-2 border border-slate-700/50 hover:bg-slate-800 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" /> Export JSON
                </button>
                <label className="px-4 py-2 border border-slate-700/50 hover:bg-slate-800 text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer transition-all">
                  <Upload className="w-4 h-4" /> Import JSON
                  <input type="file" accept=".json" onChange={handleImportProducts} className="hidden" />
                </label>
              </div>
            </div>

            {/* Add / Edit Product Form Card */}
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="font-heading font-black text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-3 flex items-center gap-1.5">
                {editingProduct ? <Edit className="w-4.5 h-4.5 text-rose-500" /> : <Plus className="w-4.5 h-4.5 text-rose-500" />}
                {editingProduct ? `Edit Product: "${editingProduct.name}"` : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Sony Alpha A7 IV"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Brand *</label>
                    <input
                      type="text"
                      required
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="e.g. Sony"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      title="Product Category"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <option value="Cameras">Cameras</option>
                      <option value="Lenses">Lenses</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Audio">Audio</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Sale Price (INR) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="e.g. 185000"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Original Price (INR)</label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      placeholder="e.g. 210000"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Physical Grade *</label>
                    <select
                      value={productForm.grade}
                      onChange={(e) => setProductForm({ ...productForm, grade: e.target.value })}
                      title="Physical Grade"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Condition Score (0-100) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.conditionScore}
                      onChange={(e) => setProductForm({ ...productForm, conditionScore: e.target.value })}
                      placeholder="95"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Primary Product Image URL *</label>
                    <input
                      type="url"
                      required
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      title="Primary Product Image URL"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      placeholder="1"
                      className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>

                {/* Tags and SEO settings */}
                <div className="grid md:grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Categorization &amp; Tags</p>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Product Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={productForm.tags}
                        onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                        placeholder="new-arrival, professional, mirrorless"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Warranty Details</label>
                      <input
                        type="text"
                        value={productForm.warranty}
                        onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                        placeholder="6 Months NIRA6 Warranty"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">SEO Headers Optimization</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">SEO Meta Title</label>
                        <input
                          type="text"
                          value={productForm.seoTitle}
                          onChange={(e) => setProductForm({ ...productForm, seoTitle: e.target.value })}
                          placeholder="Sony Alpha A7 IV Recommerce"
                          className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">SEO Keywords</label>
                        <input
                          type="text"
                          value={productForm.seoKeywords}
                          onChange={(e) => setProductForm({ ...productForm, seoKeywords: e.target.value })}
                          placeholder="sony a7, mirrorless, buy cameras"
                          className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">SEO Description</label>
                      <input
                        type="text"
                        value={productForm.seoDescription}
                        onChange={(e) => setProductForm({ ...productForm, seoDescription: e.target.value })}
                        placeholder="Get certified used Sony mirrorless camera at NIRA6 store."
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Product Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter thorough specifications, defect notes, or bundle details..."
                    className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          _id: '',
                          name: '',
                          brand: '',
                          price: '',
                          category: 'Cameras',
                          image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
                          grade: 'Like New',
                          conditionScore: '95',
                          featured: false,
                          trending: false,
                          originalPrice: '',
                          description: '',
                          warranty: '6 Months NIRA6 Warranty',
                          stock: '1',
                          tags: '',
                          seoTitle: '',
                          seoDescription: '',
                          seoKeywords: '',
                          variants: []
                        });
                      }}
                      className="px-5 py-2.5 border border-slate-700/50 hover:bg-slate-850 text-xs font-bold uppercase rounded-xl transition-all"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmittingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>

            {/* Products Search & List */}
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider">Products Catalog List ({adminProducts.length})</h3>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search by name, brand, SKU..."
                    title="Search products"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                  />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    title="Filter by category"
                    className={`px-3 py-2 border rounded-xl text-xs focus:outline-none ${darkMode ? 'bg-slate-850 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="all">All Categories</option>
                    <option value="Cameras">Cameras</option>
                    <option value="Lenses">Lenses</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Audio">Audio</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-850/50 border-slate-800 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-500'}`}>
                      <th className="p-4">Item Detail</th>
                      <th className="p-4">SKU / Code</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Sale Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Condition</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProducts
                      .filter((p) => {
                        const searchMatch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku || '').toLowerCase().includes(productSearch.toLowerCase());
                        const catMatch = productCategoryFilter === 'all' || p.category === productCategoryFilter;
                        return searchMatch && catMatch;
                      })
                      .map((prod) => (
                        <tr key={prod._id} className={`border-b hover:bg-slate-800/10 transition-colors ${darkMode ? 'border-slate-850 text-slate-300' : 'border-slate-105 text-slate-700'}`}>
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-white">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-left">{prod.name}</p>
                              <p className="text-[10px] text-slate-400 text-left">{prod.brand}</p>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-400">{prod.sku || 'N/A'}</td>
                          <td className="p-4 font-bold">{prod.category}</td>
                          <td className="p-4 font-bold text-rose-500">₹{prod.price.toLocaleString('en-IN')}</td>
                          <td className="p-4 font-bold">{prod.stock}</td>
                          <td className="p-4 text-left">
                            <span className="px-2 py-0.5 rounded bg-slate-700 text-[9px] font-bold text-white">{prod.grade}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setProductForm({
                                    _id: prod._id || '',
                                    name: prod.name,
                                    brand: prod.brand,
                                    price: String(prod.price),
                                    category: prod.category,
                                    image: prod.image,
                                    grade: prod.grade,
                                    conditionScore: String(prod.conditionScore || 95),
                                    featured: !!prod.featured,
                                    trending: !!prod.trending,
                                    originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
                                    description: prod.description || '',
                                    warranty: prod.warranty || '6 Months NIRA6 Warranty',
                                    stock: String(prod.stock || 1),
                                    tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : '',
                                    seoTitle: prod.seoTitle || '',
                                    seoDescription: prod.seoDescription || '',
                                    seoKeywords: Array.isArray(prod.seoKeywords) ? prod.seoKeywords.join(', ') : '',
                                    variants: prod.variants || []
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-1.5 bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-500 rounded-lg"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(prod)}
                                className="p-1.5 bg-amber-600/10 hover:bg-amber-600/25 text-amber-500 rounded-lg"
                                title="Duplicate Product"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleArchiveProduct(prod._id || '')}
                                className="p-1.5 bg-rose-600/10 hover:bg-rose-600/25 text-rose-500 rounded-lg"
                                title="Archive/Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 9. Customers CRM Tab */}
        {activeSubTab === 'customers' && (
          <div className="space-y-6 animate-scale-in text-left">
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-5 h-5 text-rose-500" /> Customers Directory CRM
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Monitor buyer details, order statistics, total spending volume, and manage administrator access keys.</p>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-850/50 border-slate-800 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-500'}`}>
                      <th className="p-4">Customer Detail</th>
                      <th className="p-4">System Role</th>
                      <th className="p-4">Orders Placed</th>
                      <th className="p-4">Total Spending</th>
                      <th className="p-4">AOV</th>
                      <th className="p-4">Admin Status</th>
                      {currentUser?.email === 'nira6studio@gmail.com' && <th className="p-4 text-center">Owner Controls</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter((c) => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()))
                      .map((cust) => (
                        <tr key={cust._id} className={`border-b hover:bg-slate-800/10 transition-colors ${darkMode ? 'border-slate-850 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                          <td className="p-4">
                            <p className="font-bold text-left">{cust.name}</p>
                            <p className="text-[10px] text-slate-400 text-left">{cust.email}</p>
                          </td>
                          <td className="p-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">{cust.role}</td>
                          <td className="p-4 font-bold">{cust.ordersCount || 0}</td>
                          <td className="p-4 font-bold text-rose-500">₹{(cust.totalSpent || 0).toLocaleString('en-IN')}</td>
                          <td className="p-4 font-bold">₹{(cust.averageOrderValue || 0).toLocaleString('en-IN')}</td>
                          <td className="p-4 text-left">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${cust.adminApprovedByOwner ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-850 text-slate-400'}`}>
                              {cust.adminApprovedByOwner ? 'Approved' : 'Unapproved'}
                            </span>
                          </td>
                          {currentUser?.email === 'nira6studio@gmail.com' && (
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleAdminPermission(cust._id, cust.role, cust.adminApprovedByOwner || false)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                  cust.adminApprovedByOwner 
                                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                }`}
                              >
                                {cust.adminApprovedByOwner ? 'Revoke Permission' : 'Approve Admin'}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 10. Admin Activity Logs Tab */}
        {activeSubTab === 'activity' && (
          <div className="space-y-6 animate-scale-in text-left">
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="mb-4">
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500" /> Immutable Activity Logs Ledger
                </h2>
                <p className="text-xs text-slate-400 mt-1">Logs of all events, logins, and configurations executed by platform administrators.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-850/50 border-slate-800 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-500'}`}>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Operator Email</th>
                      <th className="p-4">Operation</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Device Agent</th>
                      <th className="p-4">Action Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminActivityLogs.map((log) => (
                      <tr key={log._id} className={`border-b hover:bg-slate-800/10 transition-colors ${darkMode ? 'border-slate-850 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                        <td className="p-4 font-bold text-slate-400">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                        <td className="p-4 font-bold">{log.adminEmail}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.action.includes('FAIL') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{log.ipAddress}</td>
                        <td className="p-4 truncate max-w-[150px]" title={log.device}>{log.device}</td>
                        <td className="p-4 text-slate-400 text-left">{log.details}</td>
                      </tr>
                    ))}
                    {adminActivityLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-500">No activity logged in this session.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 11. Settings Panel Tab */}
        {activeSubTab === 'settings' && (
          <div className="space-y-6 animate-scale-in text-left">
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="mb-4 border-b border-slate-800 pb-3">
                <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-5 h-5 text-rose-500" /> Platform Operations Configuration
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure live API credentials, tax codes (Tamil Nadu CGST/SGST/IGST structure), and notification alerts templates.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Section 1: Gateways */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Payment &amp; Escrow Gateway</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Environment Mode</label>
                      <select
                        value={settings.gatewayMode}
                        onChange={(e) => setSettings({ ...settings, gatewayMode: e.target.value })}
                        title="Gateway Environment Mode"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <option value="test">Sandbox (Test Mode)</option>
                        <option value="live">Production (Live Payments)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Razorpay API Key ID</label>
                      <input
                        type="password"
                        value="rzp_test_k9382103kjsad82"
                        disabled
                        title="Razorpay API Key ID"
                        placeholder="Enter API Key"
                        className={`px-3 py-2 border rounded-xl text-xs opacity-50 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Taxes */}
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Tax Settings (Base State: Tamil Nadu)</h3>
                  <p className="text-[10px] text-slate-400">Standard configurations: local orders taxed with CGST (9%) + SGST (9%), interstate sales charged with IGST (18%).</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Local CGST Rate (%)</label>
                      <input
                        type="number"
                        value={settings.cgstRate}
                        onChange={(e) => setSettings({ ...settings, cgstRate: e.target.value })}
                        title="CGST Rate"
                        placeholder="9"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Local SGST Rate (%)</label>
                      <input
                        type="number"
                        value={settings.sgstRate}
                        onChange={(e) => setSettings({ ...settings, sgstRate: e.target.value })}
                        title="SGST Rate"
                        placeholder="9"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Interstate IGST Rate (%)</label>
                      <input
                        type="number"
                        value={settings.igstRate}
                        onChange={(e) => setSettings({ ...settings, igstRate: e.target.value })}
                        title="IGST Rate"
                        placeholder="18"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Promos */}
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Coupons &amp; Promotions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Active Promo Code</label>
                      <input
                        type="text"
                        value={settings.couponCode}
                        onChange={(e) => setSettings({ ...settings, couponCode: e.target.value })}
                        title="Active Promo Code"
                        placeholder="E.g. NIRA6NEW"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Discount Percentage (%)</label>
                      <input
                        type="number"
                        value={settings.couponDiscount}
                        onChange={(e) => setSettings({ ...settings, couponDiscount: e.target.value })}
                        title="Discount Percentage"
                        placeholder="E.g. 15"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Templates */}
                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">Notifications &amp; Dispatch Templates</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Order Confirmation Email Template</label>
                      <textarea
                        rows={2}
                        value={settings.emailTemplate}
                        onChange={(e) => setSettings({ ...settings, emailTemplate: e.target.value })}
                        title="Email template body"
                        placeholder="Enter email HTML/text structure"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Courier Dispatch SMS Template</label>
                      <textarea
                        rows={2}
                        value={settings.smsTemplate}
                        onChange={(e) => setSettings({ ...settings, smsTemplate: e.target.value })}
                        title="SMS template body"
                        placeholder="Enter SMS dispatch text structure"
                        className={`px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-rose-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>
  );
}
