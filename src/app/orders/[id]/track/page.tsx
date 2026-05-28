'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, Truck, MapPin, CheckCircle, FileText, 
  ArrowLeft, Shield, Clock, AlertTriangle, User, Phone, CheckCircle2 
} from 'lucide-react';
import api from '@/services/api';
import { formatPrice } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface TrackingUpdate {
  status: string;
  description: string;
  location: string;
  timestamp: string;
}

interface OrderItem {
  product: {
    _id: string;
    name: string;
    image: string;
    sku?: string;
  };
  quantity: number;
  price: number;
  sku?: string;
  variant?: string;
}

interface OrderDetails {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  platformFee: number;
  discountAmount: number;
  couponApplied: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  trackingUpdates: TrackingUpdate[];
  deliveryOtp?: string;
  otpVerified?: boolean;
}

interface DeliveryDetails {
  courierPartner: string;
  trackingNumber: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: string;
  routeHistory: {
    status: string;
    description: string;
    location: string;
    timestamp: string;
  }[];
}

const statusSteps = [
  { id: 'pending', label: 'Ordered', desc: 'Order placed, payment pending' },
  { id: 'confirmed', label: 'Confirmed', desc: 'Order approved & warehouse picked' },
  { id: 'processing', label: 'Processing', desc: 'Packed & QC verification passed' },
  { id: 'packed', label: 'Packed', desc: 'Ready for dispatch' },
  { id: 'shipped', label: 'Shipped', desc: 'Assigned to courier' },
  { id: 'in_transit', label: 'In Transit', desc: 'Between logistics hubs' },
  { id: 'out_for_delivery', label: 'Out For Delivery', desc: 'En route to doorstep' },
  { id: 'delivered', label: 'Delivered', desc: 'OTP verified & delivered' }
];

export default function OrderTrackingPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryDetails | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const handleInitiateReturn = async () => {
    if (!returnReason.trim()) {
      alert('Please enter a reason for the return.');
      return;
    }
    setSubmittingReturn(true);
    try {
      const { data } = await api.post(`/orders/${id}/return`, { reason: returnReason });
      alert(data.message || 'Return submitted successfully!');
      
      // Notify
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '↩️ Return Initiated!',
          content: `Return request registered for Order #${id.slice(-8).toUpperCase()}. Refund credited back to wallet.`
        }
      }));
      
      setReturnReason('');
      fetchTracking(); // Refresh timeline status
    } catch (err) {
      console.error(err);
      alert('Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      setOrderData(data.order);
      setDeliveryData(data.delivery);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve order tracking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTracking();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-nira-gray flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-nira-yellow border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-nira-text-secondary text-sm font-semibold">Locating fulfillment tracking records...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-nira-gray flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-heading font-bold text-nira-dark">Tracking Record Not Found</h2>
          <p className="text-xs text-nira-text-secondary mt-1.5 mb-6">{error || 'This order has not been cataloged in the tracking logistics network.'}</p>
          <Link href="/dashboard" className="px-6 py-2.5 bg-nira-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl">Back to Dashboard</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Find active step index
  const currentStatus = orderData.orderStatus;
  const isCancelled = currentStatus === 'cancelled';
  const isReturned = ['returned', 'refund_initiated', 'refund_completed'].includes(currentStatus);

  let activeStepIndex = statusSteps.findIndex(step => step.id === currentStatus);
  // Default to Confirmed or processing if step not found exactly
  if (activeStepIndex === -1 && !isCancelled && !isReturned) {
    activeStepIndex = 1; // Default Confirmed
  }

  return (
    <div className="min-h-screen bg-nira-gray flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-nira-text-secondary hover:text-nira-dark mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </Link>

        {/* Title Panel */}
        <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nira-yellow/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div>
            <span className="text-[10px] bg-nira-yellow/20 text-nira-dark font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              {isCancelled ? '❌ Order Cancelled' : isReturned ? '↩️ Returned & Refunded' : `Fulfillment: ${currentStatus.replace('_', ' ').toUpperCase()}`}
            </span>
            <h1 className="font-heading font-black text-xl sm:text-2xl mt-3 text-nira-dark">Order #{orderData._id.slice(-8).toUpperCase()}</h1>
            <p className="text-[11px] text-nira-text-secondary mt-1">Placed on {new Date(orderData.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })} at {new Date(orderData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link 
              href={`/api/orders/${orderData._id}/invoice`} // Auto generated pdf metadata check
              target="_blank"
              className="px-4 py-2.5 border border-nira-gray-dark hover:bg-nira-gray text-nira-dark font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-nira-yellow" /> Download Invoice
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline & Map Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive Timeline Card */}
            <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
              <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-nira-yellow" /> Fulfillment Milestones
              </h2>

              {isCancelled ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-semibold">
                  ⚠️ This order was cancelled. Restocked inventory blocks have been returned to warehouse inventory.
                </div>
              ) : isReturned ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-800 text-xs font-semibold">
                  ↩️ This order was returned and fully refunded to your NIRA Loyalty Wallet.
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 border-l border-nira-gray-dark space-y-8 py-2 ml-4">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= activeStepIndex;
                    const isActive = idx === activeStepIndex;
                    
                    // Retrieve matching timestamp if completed
                    const matchedUpdate = orderData.trackingUpdates.find(u => u.status === step.id);
                    
                    return (
                      <div key={step.id} className="relative">
                        {/* Circle Indicator */}
                        <div className={`absolute -left-10 sm:-left-12 top-0.5 w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${
                          isActive 
                            ? 'bg-nira-yellow border-nira-yellow-light text-nira-dark scale-110 shadow-md shadow-nira-yellow/20' 
                            : isCompleted 
                              ? 'bg-nira-success border-teal-100 text-white' 
                              : 'bg-white border-nira-gray-dark text-nira-text-secondary'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>

                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3 className={`text-xs font-bold ${isActive ? 'text-nira-dark text-sm' : isCompleted ? 'text-nira-dark' : 'text-nira-text-secondary'}`}>
                              {step.label}
                            </h3>
                            {matchedUpdate && (
                              <span className="text-[9px] text-nira-text-secondary font-mono">
                                {new Date(matchedUpdate.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-nira-text-secondary mt-0.5">
                            {matchedUpdate ? matchedUpdate.description : step.desc}
                          </p>
                          {matchedUpdate && matchedUpdate.location && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[9px] bg-nira-gray px-2 py-0.5 rounded text-nira-text-secondary font-semibold uppercase">
                              <MapPin className="w-2.5 h-2.5 text-nira-yellow" /> {matchedUpdate.location}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Simulated Logistics Hub Routing Map */}
            {deliveryData && !isCancelled && !isReturned && (
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-nira-yellow" /> Logistics Tracking Map (Simulated)
                </h2>
                <p className="text-[11px] text-nira-text-secondary mb-6">Visual tracking of package checkpoints dispatched from warehouse.</p>
                
                {/* SVG Visual Hub Map */}
                <div className="bg-nira-dark p-6 rounded-2xl relative overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                  
                  {/* Stylized route layout */}
                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 z-10 py-6">
                    {[
                      { code: 'BOM-WH', name: 'Mumbai Warehouse', active: true },
                      { code: 'PNQ-HUB', name: 'Pune Transit Hub', active: activeStepIndex >= 5 },
                      { code: 'DELI-LCL', name: 'Local Delivery Hub', active: activeStepIndex >= 6 },
                      { code: 'DEST', name: 'Customer Destination', active: activeStepIndex >= 7 }
                    ].map((hub, i, arr) => (
                      <div key={hub.code} className="flex flex-col items-center text-center relative flex-1">
                        
                        {/* Connecting Line */}
                        {i < arr.length - 1 && (
                          <div className="hidden md:block absolute top-5 left-1/2 w-full h-0.5 bg-neutral-800 -z-10">
                            <div className="h-full bg-nira-yellow transition-all duration-500" style={{ width: hub.active && arr[i+1].active ? '100%' : '0%' }} />
                          </div>
                        )}

                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                          hub.active 
                            ? 'bg-nira-yellow text-nira-dark border-nira-yellow' 
                            : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                        }`}>
                          {hub.code}
                        </div>
                        <p className={`text-[9px] font-bold mt-2 uppercase ${hub.active ? 'text-white' : 'text-neutral-500'}`}>{hub.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hub Logs List */}
                <div className="mt-6 space-y-3.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-nira-text-secondary">Checkpoint History</h4>
                  {deliveryData.routeHistory.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-nira-gray/50 border border-nira-gray-dark rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-nira-yellow mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-nira-dark">{log.status.toUpperCase()}</span>
                          <span className="text-[9px] text-nira-text-secondary font-mono">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[11px] text-nira-text-secondary mt-0.5">{log.description}</p>
                        <span className="text-[9px] font-bold text-nira-text-secondary uppercase">📍 Hub: {log.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            
            {/* Courier & Delivery OTP Details */}
            {deliveryData && !isCancelled && !isReturned && (
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-4 border-b border-nira-gray-dark pb-2">Logistics Desk</h3>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-nira-text-secondary uppercase text-[10px] font-bold tracking-wider">Courier Partner</span>
                    <p className="font-black text-nira-dark mt-0.5">{deliveryData.courierPartner}</p>
                  </div>
                  <div>
                    <span className="text-nira-text-secondary uppercase text-[10px] font-bold tracking-wider">Simulated Airway Bill (AWB)</span>
                    <p className="font-mono font-black text-nira-dark mt-0.5">{deliveryData.trackingNumber}</p>
                  </div>
                  <div>
                    <span className="text-nira-text-secondary uppercase text-[10px] font-bold tracking-wider">Estimated Doorstep Delivery</span>
                    <p className="font-black text-nira-dark mt-0.5">
                      {deliveryData.estimatedDeliveryDate 
                        ? new Date(deliveryData.estimatedDeliveryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) 
                        : 'Awaiting dispatch confirmation'}
                    </p>
                  </div>

                  {/* Delivery OTP block */}
                  {orderData.orderStatus === 'out_for_delivery' && (
                    <div className="mt-4 p-4 border border-teal-200 bg-teal-50/20 rounded-2xl flex flex-col items-center text-center">
                      <Shield className="w-5 h-5 text-nira-success mb-1" />
                      <span className="text-teal-800 font-bold uppercase text-[9px] tracking-wider">Verification Passcode</span>
                      <p className="text-lg font-mono font-black text-teal-900 tracking-widest mt-0.5">{orderData.deliveryOtp || '1234'}</p>
                      <p className="text-[10px] text-teal-700 mt-1">Provide this code to the delivery driver to complete verification and log COD updates.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Address Info */}
            <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-4 border-b border-nira-gray-dark pb-2">Shipping Destination</h3>
              <div className="text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-nira-yellow shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-nira-dark">{orderData.shippingAddress.name}</p>
                    <p className="text-nira-text-secondary">{orderData.shippingAddress.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-nira-yellow shrink-0 mt-0.5" />
                  <p className="text-nira-text-secondary leading-relaxed">
                    {orderData.shippingAddress.address}, {orderData.shippingAddress.city} - <span className="font-mono font-bold text-nira-dark">{orderData.shippingAddress.pincode}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
              <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-4 border-b border-nira-gray-dark pb-2">Receipt Breakup</h3>
              
              <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-xs gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-nira-dark truncate">{item.product?.name || 'Camera Gear'}</p>
                      <span className="text-[9px] text-nira-text-secondary font-semibold uppercase">SKU: {item.sku || 'NIRA-MOCK-SKU'}</span>
                      {item.variant && <p className="text-[9px] text-nira-text-secondary">Spec: {item.variant}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-nira-dark">{formatPrice(item.price)}</span>
                      <p className="text-[9px] text-nira-text-secondary leading-none">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-nira-gray-dark pt-3 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-nira-text-secondary">CGST (9%)</span><span className="font-semibold text-nira-dark">{formatPrice(orderData.cgst || 0)}</span></div>
                <div className="flex justify-between"><span className="text-nira-text-secondary">SGST (9%)</span><span className="font-semibold text-nira-dark">{formatPrice(orderData.sgst || 0)}</span></div>
                <div className="flex justify-between"><span className="text-nira-text-secondary">Diagnostics &amp; Platform Fee</span><span className="font-semibold text-nira-dark">{formatPrice(orderData.platformFee || 0)}</span></div>
                {orderData.discountAmount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold"><span>Coupon Savings</span><span>- {formatPrice(orderData.discountAmount)}</span></div>
                )}
                <div className="h-px bg-nira-gray-dark my-1" />
                <div className="flex justify-between font-heading font-black text-sm text-nira-dark">
                  <span>Grand Total</span><span>{formatPrice(orderData.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-nira-text-secondary font-semibold">
                  <span>Payment Mode</span><span className="uppercase">{orderData.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[10px] text-nira-text-secondary font-semibold">
                  <span>Payment status</span><span className="uppercase text-nira-success font-black">{orderData.paymentStatus}</span>
                </div>
              </div>
            </div>

            {/* Returns & Refund Desk Card */}
            {orderData.orderStatus === 'delivered' && (
              <div className="bg-white rounded-3xl p-6 border border-nira-gray-dark shadow-sm">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-nira-dark mb-4 border-b border-nira-gray-dark pb-2">Return &amp; Refund Request</h3>
                <p className="text-[11px] text-nira-text-secondary mb-4">Eligible for 7-day diagnostics warranty return. Provide inspection details below.</p>
                <div className="space-y-3">
                  <textarea
                    placeholder="Describe specific fault, e.g. Lens stabilization drift..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-4 py-3 bg-nira-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow"
                    rows={3}
                  />
                  <button
                    onClick={handleInitiateReturn}
                    disabled={submittingReturn}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer text-center"
                  >
                    {submittingReturn ? 'Submitting Return...' : 'Request Return & Refund'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
