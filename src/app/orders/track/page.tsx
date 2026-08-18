'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Clock, MapPin, Truck, FileText, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';

// Dynamically import map component to avoid SSR ReferenceError: window is not defined
const TrackingMap = dynamic(() => import('@/components/orders/TrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-neutral-900 flex flex-col items-center justify-center rounded-2xl border border-white/5">
      <div className="w-8 h-8 border-4 border-nira-yellow border-t-transparent rounded-full animate-spin mb-2" />
      <span className="text-[10px] font-mono text-neutral-400">Loading interactive routing map...</span>
    </div>
  )
});

interface TrackingUpdate {
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

interface OrderDetails {
  _id: string;
  orderId?: string;
  invoiceNumber?: string;
  items: {
    product: {
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
    sku?: string;
    variant?: string;
  }[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  trackingUpdates: TrackingUpdate[];
}

interface DeliveryDetails {
  courierPartner: string;
  trackingNumber: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: string;
}

const TRACKING_STAGES = [
  { id: 'placed', label: 'Placed', desc: 'Order received.' },
  { id: 'payment_verified', label: 'Payment Verified', desc: 'Payment secure.' },
  { id: 'confirmed', label: 'Confirmed', desc: 'Confirmed by merchant.' },
  { id: 'processing', label: 'Processing', desc: 'Gathered at depot.' },
  { id: 'packed', label: 'Packed', desc: 'Checked & sealed.' },
  { id: 'ready_for_dispatch', label: 'Ready to Dispatch', desc: 'Sorted for shipping.' },
  { id: 'shipped', label: 'Shipped', desc: 'Picked up by courier.' },
  { id: 'in_transit', label: 'In Transit', desc: 'Hub routing.' },
  { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'En route to doorstep.' },
  { id: 'delivered', label: 'Delivered', desc: 'Delivery complete.' }
];

export default function PublicTrackPage() {
  const [trackingId, setTrackingId] = useState('');
  const [verification, setVerification] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim() || !verification.trim()) {
      setError('Please provide both a Tracking ID/Order ID and verification email/phone.');
      return;
    }

    setSearching(true);
    setError(null);
    try {
      const { data } = await api.post('/orders/track', {
        trackingId: trackingId.trim(),
        verification: verification.trim()
      });
      setOrder(data.order);
      setDelivery(data.delivery);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'No matching order found with the provided details.');
      setOrder(null);
      setDelivery(null);
    } finally {
      setSearching(false);
    }
  };

  const getActiveStageIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 0;
    if (s === 'confirmed') return 2;
    if (s === 'processing') return 3;
    if (s === 'packed') return 4;
    if (s === 'ready_for_dispatch') return 5;
    if (s === 'shipped') return 6;
    if (s === 'in_transit') return 7;
    if (s === 'out_for_delivery') return 8;
    if (s === 'delivered') return 9;
    return 2; // Default Confirmed
  };

  const currentStatus = order?.orderStatus || 'pending';
  const isCancelled = currentStatus === 'cancelled';
  const isReturned = ['returned', 'return_requested', 'refunded', 'refund_initiated', 'refund_completed'].includes(currentStatus);
  const activeIndex = getActiveStageIndex(currentStatus);

  return (
    <div className="min-h-screen bg-nira-gray flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {!order ? (
          /* Search Input Box */
          <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-nira-gray-dark shadow-xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-nira-yellow/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="text-center mb-6">
              <h1 className="font-heading font-black text-xl text-nira-dark uppercase tracking-wider">Track Your Gear</h1>
              <p className="text-xs text-nira-text-secondary mt-1">Access real-time shipment routing logs</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl leading-relaxed text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider">Order ID or Courier AWB</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., NIRA6-20260612-0001"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="px-4 py-3 bg-nira-gray border border-transparent focus:border-nira-yellow focus:bg-white rounded-xl text-xs font-bold text-nira-dark focus:outline-none transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-nira-text-secondary uppercase tracking-wider">Verification Email or Phone</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., name@domain.com or phone"
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  className="px-4 py-3 bg-nira-gray border border-transparent focus:border-nira-yellow focus:bg-white rounded-xl text-xs font-bold text-nira-dark focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full py-3 bg-nira-dark text-white hover:bg-nira-yellow hover:text-nira-dark font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {searching ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Locate Shipment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-nira-gray-dark text-center">
              <Link href="/dashboard" className="text-[10px] font-bold text-nira-yellow hover:underline uppercase tracking-wider">
                Or access via dashboard history
              </Link>
            </div>
          </div>
        ) : (
          /* Tracking details view */
          <div className="animate-scale-in space-y-6">
            
            {/* Title / Info card */}
            <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-nira-yellow/5 rounded-full blur-2xl -mr-10 -mt-10" />
              <div>
                <button
                  onClick={() => setOrder(null)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-nira-text-secondary hover:text-nira-dark uppercase tracking-wider mb-3 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Search Another Order
                </button>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-heading font-black text-lg sm:text-xl text-nira-dark">Order #{order.orderId || order._id.toUpperCase()}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    isCancelled ? 'bg-red-100 text-red-800'
                    : isReturned ? 'bg-purple-100 text-purple-800'
                    : 'bg-nira-yellow/20 text-nira-dark'
                  }`}>
                    {isCancelled ? 'Cancelled' : isReturned ? 'Returned' : currentStatus.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[10px] text-nira-text-secondary mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/orders/${order._id}/invoice`}
                  target="_blank"
                  className="px-4 py-2.5 bg-nira-gray hover:bg-nira-yellow/10 border border-nira-gray-dark hover:border-nira-yellow text-nira-dark font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4 text-nira-yellow" /> Printable Invoice
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Timeline & Maps */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 13-stage timeline */}
                <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                  <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-nira-dark mb-6 flex items-center gap-2 border-b border-nira-gray-dark pb-3">
                    <Clock className="w-4 h-4 text-nira-yellow" /> Shipment Fulfillment Timeline
                  </h2>

                  {isCancelled ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-semibold leading-relaxed">
                      ⚠️ This order was cancelled. Recommerced stock allocations have been restored to the depot catalog.
                    </div>
                  ) : isReturned ? (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-800 text-xs font-semibold leading-relaxed">
                      ↩️ This order was returned and fully refunded to the customer wallet.
                    </div>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-nira-gray-dark space-y-6 py-2 ml-4">
                      {TRACKING_STAGES.map((stage, idx) => {
                        const isCompleted = idx <= activeIndex;
                        const isActive = idx === activeIndex;

                        // Retrieve matching tracking update
                        const matchedUpdate = order.trackingUpdates.find(u => u.status === stage.id);

                        return (
                          <div key={stage.id} className="relative">
                            <div className={`absolute -left-[33px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isActive
                                ? 'bg-nira-yellow border-white text-nira-dark scale-110 shadow-md ring-2 ring-nira-yellow/30'
                                : isCompleted
                                  ? 'bg-emerald-500 border-white text-white'
                                  : 'bg-white border-nira-gray-dark text-nira-text-secondary'
                            }`}>
                              {isCompleted ? <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>

                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h3 className={`text-xs font-bold ${isActive ? 'text-nira-dark text-sm' : isCompleted ? 'text-nira-dark' : 'text-nira-text-secondary'}`}>
                                  {stage.label}
                                </h3>
                                {matchedUpdate && (
                                  <span className="text-[9px] text-nira-text-secondary font-mono">
                                    {new Date(matchedUpdate.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(matchedUpdate.timestamp).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-nira-text-secondary mt-0.5">
                                {matchedUpdate ? matchedUpdate.description : stage.desc}
                              </p>
                              {matchedUpdate && matchedUpdate.location && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[8px] bg-nira-gray px-1.5 py-0.5 rounded text-nira-text-secondary font-semibold uppercase">
                                  <MapPin className="w-2.5 h-2.5 text-nira-yellow" /> Hub: {matchedUpdate.location}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Leaflet shipment route map */}
                {!isCancelled && !isReturned && (
                  <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                    <h2 className="font-heading font-bold text-xs uppercase tracking-widest text-nira-dark mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-nira-yellow" /> Route Tracking Map
                    </h2>
                    <p className="text-[10px] text-nira-text-secondary mb-4">Interactive spatial checkpoint routing from depot to address</p>

                    <TrackingMap
                      originCity="Mumbai"
                      destinationCity={order.shippingAddress.city}
                      currentLocationCity={order.trackingUpdates[order.trackingUpdates.length - 1]?.location || 'Mumbai'}
                    />
                  </div>
                )}
              </div>

              {/* Sidebar stats & Courier details */}
              <div className="space-y-6">
                
                {/* Courier desk */}
                {delivery && !isCancelled && !isReturned && (
                  <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm space-y-4">
                    <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-nira-dark border-b border-nira-gray-dark pb-2">Logistics Desk</h3>
                    
                    <div className="text-xs space-y-3">
                      <div>
                        <span className="text-[9px] font-bold text-nira-text-secondary uppercase">Courier Partner</span>
                        <p className="font-bold text-nira-dark mt-0.5">{delivery.courierPartner}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-nira-text-secondary uppercase">Waybill / AWB Number</span>
                        <p className="font-mono font-bold text-nira-dark mt-0.5">{delivery.trackingNumber}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-nira-text-secondary uppercase">Estimated Delivery</span>
                        <p className="font-bold text-nira-dark mt-0.5">
                          {delivery.estimatedDeliveryDate 
                            ? new Date(delivery.estimatedDeliveryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) 
                            : 'Awaiting shipping confirmation'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping details */}
                <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-nira-dark border-b border-nira-gray-dark pb-2">Recipient</h3>
                  
                  <div className="text-xs space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-nira-text-secondary uppercase">Name</span>
                      <p className="font-bold text-nira-dark mt-0.5">{order.shippingAddress.name}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-nira-text-secondary uppercase">Delivery Address</span>
                      <p className="text-nira-text-secondary mt-0.5 leading-relaxed">
                        {order.shippingAddress.address},<br />
                        {order.shippingAddress.city} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm space-y-4">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-nira-dark border-b border-nira-gray-dark pb-2">Items Included</h3>
                  
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs items-center">
                        <span className="font-bold text-nira-dark max-w-[150px] truncate">{item.product?.name}</span>
                        <span className="text-nira-text-secondary font-mono">{item.quantity}x @ {formatPrice(item.price)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-nira-gray-dark pt-1" />
                    <div className="flex justify-between text-xs font-black text-nira-dark uppercase">
                      <span>Total Price</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
