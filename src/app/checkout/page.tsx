'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Shield, ChevronRight, MapPin, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectCartItems, selectCartTotal, clearCart } from '@/store/cartSlice';
import { formatPrice } from '@/lib/utils';
import api from '@/services/api';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    contact: string;
    email?: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { user: userInfo } = useAppSelector((state) => state.auth);

  const [payMethod, setPayMethod] = useState('razorpay');
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [address, setAddress] = useState({
    name: userInfo?.name || '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [userInfo, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.address) {
      alert('Please fill all shipping details');
      return;
    }

    setLoading(true);
    try {
      const grandTotal = Math.round(total * 1.02);

      if (payMethod === 'razorpay') {
        // 1. Create Razorpay Order on backend
        const { data: rzpOrder } = await api.post('/orders/razorpay', { amount: grandTotal });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "NIRA6",
          description: "Purchase Gear",
          order_id: rzpOrder.id,
          handler: async (response: RazorpayResponse) => {
            try {
              // 2. Verify Payment on backend
              const verifyData = {
                ...response,
                orderItems: items.map(i => ({
                  product: i.product.id,
                  quantity: i.quantity,
                  price: i.product.price
                })),
                shippingAddress: address,
                paymentMethod: 'razorpay',
                totalAmount: grandTotal
              };

              const { data: result } = await api.post('/orders/verify', verifyData);
              if (result.success) {
                setOrderId(result.order.id || result.order._id);
                setPlaced(true);
                dispatch(clearCart());
              }
            } catch (err) {
              console.error("Verification failed", err);
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: address.name,
            contact: address.phone,
            email: userInfo?.email
          },
          theme: { color: "#FFDA03" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Handle COD
        const orderData = {
          orderItems: items.map(i => ({
            product: i.product.id,
            quantity: i.quantity,
            price: i.product.price
          })),
          shippingAddress: address,
          paymentMethod: payMethod,
          totalAmount: grandTotal
        };

        const { data: order } = await api.post('/orders', orderData);
        setOrderId(order.id || order._id);
        setPlaced(true);
        dispatch(clearCart());
      }
    } catch (err: unknown) {
      console.error("Order placement failed", err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error.response?.data?.message || "Something went wrong while placing order");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-nira-gray flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-nira-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-nira-success" />
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2">Order Placed!</h2>
          <p className="text-nira-text-secondary mb-6">Your order has been confirmed and will be shipped shortly.</p>
          <p className="text-sm bg-nira-gray rounded-xl p-3 mb-6">Order ID: <span className="font-mono font-bold">{orderId}</span></p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl">View in Dashboard <ChevronRight className="w-4 h-4" /></Link>
        </motion.div>
      </div>
    );
  }

  const grandTotal = Math.round(total * 1.02);

  if (items.length === 0 && !placed) {
    return (
      <div className="min-h-screen bg-nira-gray flex flex-col items-center justify-center py-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/buy" className="px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-nira-text-secondary hover:text-nira-dark mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="font-heading font-bold text-3xl mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-4"><MapPin className="w-5 h-5" /> Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" name="name" value={address.name} onChange={handleInputChange} placeholder="Full name" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                <input type="tel" name="phone" value={address.phone} onChange={handleInputChange} placeholder="Phone number" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                <textarea name="address" value={address.address} onChange={handleInputChange} placeholder="Full Address" className="sm:col-span-2 px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow" rows={2} />
                <input type="text" name="city" value={address.city} onChange={handleInputChange} placeholder="City" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
                <input type="text" name="pincode" value={address.pincode} onChange={handleInputChange} placeholder="PIN Code" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-nira-yellow" />
              </div>
            </div>
            {/* Payment */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5" /> Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'razorpay', label: 'Razorpay (Cards, UPI, Netbanking)', desc: 'Secure payment powered by Razorpay' },
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                ].map((m) => (
                  <label key={m.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod === m.id ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark'}`}>
                    <input type="radio" name="payment" checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="mt-0.5 accent-nira-yellow" />
                    <div>
                      <p className="font-medium text-sm">{m.label}</p>
                      <p className="text-xs text-nira-text-secondary">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 h-fit sticky top-24">
            <h3 className="font-heading font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-nira-text-secondary truncate max-w-[60%]">{item.product.name} ×{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-nira-gray-dark pt-4">
              <div className="flex justify-between"><span className="text-nira-text-secondary">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-nira-text-secondary">Shipping</span><span className="text-nira-success font-medium">FREE</span></div>
              <div className="flex justify-between"><span className="text-nira-text-secondary">Platform Fee</span><span>{formatPrice(Math.round(total * 0.02))}</span></div>
              <div className="h-px bg-nira-gray-dark" />
              <div className="flex justify-between font-heading font-bold text-lg">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-6 w-full py-3.5 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${formatPrice(grandTotal)}`}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-nira-text-secondary">
              <Shield className="w-3.5 h-3.5" /> SSL Encrypted &amp; Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

