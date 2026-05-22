'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Shield, ChevronRight, MapPin, ArrowLeft, CheckCircle, Loader2, Sparkles, Coins } from 'lucide-react';
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
  const { user: userInfo, isAuthenticated } = useAppSelector((state) => state.auth);

  const [payMethod, setPayMethod] = useState('razorpay');
  const [placed, setPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping form fields
  const [address, setAddress] = useState({
    name: userInfo?.name || '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  // Guest Checkout State (Disabled to enforce user auth for payments)
  const [isGuestMode] = useState(false);
  const isGuest = userInfo ? false : isGuestMode;
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Enforce authentication check for final buying payment
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  // Load wallet balance on mount if authenticated
  useEffect(() => {
    if (userInfo) {
      api.get('/users/wallet')
        .then((res) => {
          setWalletBalance(res.data.walletBalance || 0);
        })
        .catch((err) => console.log('Wallet loading skipped/failed', err));
    }
  }, [userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Pricing calculations
  const subtotalAfterDiscount = total - discountAmount;

  // Taxes: CGST 9% + SGST 9% of discounted subtotal
  const cgst = Math.round(subtotalAfterDiscount * 0.09);
  const sgst = Math.round(subtotalAfterDiscount * 0.09);
  const taxTotal = cgst + sgst;

  // Platform Fee
  const platformFee = appliedCoupon === 'FREESHIP' ? 0 : 199;

  // Grand Total before Wallet Deduction
  const checkoutGrandTotal = Math.max(0, subtotalAfterDiscount + taxTotal + platformFee);

  // Wallet logic
  let walletDeducted = 0;
  if (useWallet && walletBalance > 0) {
    walletDeducted = Math.min(checkoutGrandTotal, walletBalance);
  }
  const finalPayable = Math.max(0, checkoutGrandTotal - walletDeducted);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const { data } = await api.post('/coupons', { code, orderAmount: total });
      setAppliedCoupon(data.code);
      setDiscountAmount(data.discountAmount);
      setCouponSuccess(`Coupon ${data.code} applied successfully!`);
      // Dispatch notification
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'push',
          title: '🎟️ Coupon Applied!',
          content: `Coupon code ${data.code} was successfully verified. You saved ₹${data.discountAmount.toLocaleString('en-IN')}!`
        }
      }));
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setCouponError(error.response?.data?.message || 'Invalid coupon code. Try CREATOR20 or FREESHIP.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setDiscountAmount(0);
    setCouponInput('');
    setCouponSuccess('');
    setCouponError('');
  };

  const triggerSimulatedNotifications = (ordId: string, finalTotal: number) => {
    // 1. Trigger Push Toast Notification
    window.dispatchEvent(new CustomEvent('nira_notification', {
      detail: {
        type: 'push',
        title: '🎉 Order Placed Successfully!',
        content: `Your creator order #${ordId.slice(-8).toUpperCase()} has been registered. View logs below.`
      }
    }));

    // 2. Trigger simulated Transactional SMS
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'sms',
          title: 'SMS Transaction Alert',
          content: `NIRA6 SECURE ORDER: Hi Creator, order #${ordId.slice(-8).toUpperCase()} for ₹${finalTotal.toLocaleString('en-IN')} has been placed. You earned ₹${Math.round(total * 0.01)} NIRA loyalty points! Tracking link: nira6.in/track`
        }
      }));
    }, 1500);

    // 3. Trigger styled HTML Email invoice
    setTimeout(() => {
      const emailHtml = `
        <div style="font-family: sans-serif; color: #1e1e1e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #0f0f0f; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NIRA6 RECOMMERCE</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #FFDA03; font-weight: bold; text-transform: uppercase;">Creator Order Receipt</p>
          </div>
          <div style="padding: 24px;">
            <p>Dear Creator,</p>
            <p>Your pre-owned creative equipment order has been confirmed! Our lab technicians are preparing standard 30-point inspections for shipment.</p>
            
            <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 8px 0;">Order Summary: #${ordId.slice(-8).toUpperCase()}</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                ${items.map(item => `
                  <tr>
                    <td style="padding: 6px 0; color: #4a5568;">${item.product.name} × ${item.quantity}</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: bold;">₹${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 6px 0; color: #718096;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
                </tr>
                ${discountAmount > 0 ? `
                  <tr>
                    <td style="padding: 6px 0; color: #e53e3e;">Coupon Discount (${appliedCoupon})</td>
                    <td style="padding: 6px 0; text-align: right; color: #e53e3e;">-₹${discountAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 6px 0; color: #718096;">CGST (9%) + SGST (9%)</td>
                  <td style="padding: 6px 0; text-align: right;">₹${taxTotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #718096;">Platform Fee</td>
                  <td style="padding: 6px 0; text-align: right;">₹${platformFee.toLocaleString('en-IN')}</td>
                </tr>
                ${walletDeducted > 0 ? `
                  <tr>
                    <td style="padding: 6px 0; color: #319795; font-weight: bold;">Paid via NIRA Wallet</td>
                    <td style="padding: 6px 0; text-align: right; color: #319795; font-weight: bold;">-₹${walletDeducted.toLocaleString('en-IN')}</td>
                  </tr>
                ` : ''}
                <tr style="border-top: 2px solid #e2e8f0; font-size: 15px; font-weight: bold;">
                  <td style="padding: 10px 0; color: #0f0f0f;">Amount Payable</td>
                  <td style="padding: 10px 0; text-align: right; color: #0f0f0f;">₹${finalPayable.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 12px; color: #718096; text-align: center; margin-top: 30px;">
              This is a digital simulated transactional statement generated by NIRA6 recommerce diagnostics engines.
            </p>
          </div>
        </div>
      `;
      window.dispatchEvent(new CustomEvent('nira_notification', {
        detail: {
          type: 'email',
          title: '📧 Your NIRA6 Order Receipt - #' + ordId.slice(-8).toUpperCase(),
          content: emailHtml
        }
      }));
    }, 3000);
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (isGuest) {
      if (!guestEmail || !guestPhone) {
        alert('Please fill email and phone for guest checkout');
        return;
      }
    }
    if (!address.name || !address.phone || !address.address) {
      alert('Please fill all shipping details');
      return;
    }

    setLoading(true);
    try {
      // Setup payload including new e-commerce fields
      const orderPayload = {
        orderItems: items.map(i => ({
          product: i.product.id,
          quantity: i.quantity,
          price: i.product.price
        })),
        shippingAddress: address,
        paymentMethod: finalPayable === 0 ? 'wallet' : payMethod,
        totalAmount: checkoutGrandTotal,
        taxAmount: taxTotal,
        platformFee,
        discountAmount,
        couponApplied: appliedCoupon,
        isGuestCheckout: isGuest,
        guestEmail: isGuest ? guestEmail : undefined,
        guestPhone: isGuest ? guestPhone : undefined,
        walletDeducted
      };

      // Scenario A: Full Wallet payment or Cash on Delivery
      if (finalPayable === 0 || payMethod === 'cod') {
        const { data: order } = await api.post('/orders', orderPayload);
        
        // Deduct balance from User's profile if wallet applied
        if (walletDeducted > 0 && userInfo) {
          await api.post('/users/wallet', { amount: -walletDeducted });
        }

        setOrderId(order.id || order._id);
        setPlaced(true);
        triggerSimulatedNotifications(order.id || order._id, checkoutGrandTotal);
        dispatch(clearCart());
      } 
      // Scenario B: Razorpay integration for remaining payable
      else {
        const { data: rzpOrder } = await api.post('/orders/razorpay', { amount: finalPayable });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "NIRA6",
          description: "Purchase Gear",
          order_id: rzpOrder.id,
          handler: async (response: RazorpayResponse) => {
            try {
              const verifyPayload = {
                ...response,
                ...orderPayload,
                totalAmount: checkoutGrandTotal
              };

              const { data: result } = await api.post('/orders/verify', verifyPayload);
              if (result.success) {
                // If wallet deduction occurred, update account backend balance
                if (walletDeducted > 0 && userInfo) {
                  await api.post('/users/wallet', { amount: -walletDeducted });
                }

                setOrderId(result.order.id || result.order._id);
                setPlaced(true);
                triggerSimulatedNotifications(result.order.id || result.order._id, checkoutGrandTotal);
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
            email: userInfo?.email || guestEmail
          },
          theme: { color: "#FFDA03" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err: unknown) {
      console.error("Order placement failed", err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error.response?.data?.message || "Something went wrong while placing your order");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-nira-gray flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg border border-nira-gray-dark">
          <div className="w-16 h-16 bg-nira-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-nira-success animate-pulse" />
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2 text-nira-dark">Order Confirmed!</h2>
          <p className="text-nira-text-secondary mb-4 text-sm">Your creative tools have passed core inspection. SMS and Email receipts have been simulated in the Navbar terminal.</p>
          <div className="bg-nira-gray rounded-xl p-3 mb-6">
            <p className="text-[10px] text-nira-text-secondary font-bold uppercase tracking-wider">Tracking Reference</p>
            <p className="font-mono font-bold text-nira-dark text-sm mt-0.5">{orderId}</p>
          </div>
          <Link href="/dashboard" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors cursor-pointer">
            Track in Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="min-h-screen bg-nira-gray flex flex-col items-center justify-center py-12 px-4">
        <h2 className="text-2xl font-bold mb-4 font-heading">Your cart is empty</h2>
        <Link href="/buy" className="px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl cursor-pointer">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-nira-text-secondary hover:text-nira-dark mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <h1 className="font-heading font-bold text-3xl mb-8 text-nira-dark">Secure Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Authenticated Check / Guest Mode Details */}
            {isGuest && (
              <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark">
                <div className="flex items-center justify-between mb-4 border-b border-nira-gray-dark pb-3">
                  <h2 className="font-heading font-semibold text-lg flex items-center gap-2 text-nira-dark">
                    <Sparkles className="w-5 h-5 text-nira-yellow" /> Guest Checkout
                  </h2>
                  <Link href="/auth/login" className="text-xs font-bold text-nira-yellow hover:underline">
                    Login instead?
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-nira-text-secondary">Guest Email</label>
                    <input 
                      type="email" 
                      placeholder="creator@nira6.in" 
                      value={guestEmail} 
                      onChange={(e) => setGuestEmail(e.target.value)} 
                      className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-nira-text-secondary">Guest Contact Phone</label>
                    <input 
                      type="tel" 
                      placeholder="9876543210" 
                      value={guestPhone} 
                      onChange={(e) => setGuestPhone(e.target.value)} 
                      className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping details */}
            <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-4 text-nira-dark"><MapPin className="w-5 h-5 text-nira-yellow" /> Shipping Destination</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" name="name" value={address.name} onChange={handleInputChange} placeholder="Receiver Full Name" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow" />
                <input type="tel" name="phone" value={address.phone} onChange={handleInputChange} placeholder="Primary Phone Number" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow" />
                <textarea name="address" value={address.address} onChange={handleInputChange} placeholder="Door No., Street Address, Locality" className="sm:col-span-2 px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow" rows={2} />
                <input type="text" name="city" value={address.city} onChange={handleInputChange} placeholder="City/Region" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow" />
                <input type="text" name="pincode" value={address.pincode} onChange={handleInputChange} placeholder="6-Digit PIN Code" className="px-4 py-3 bg-nira-gray rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow" />
              </div>
            </div>

            {/* Loyalty wallet integration */}
            {userInfo && walletBalance > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark">
                <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-3 text-nira-dark">
                  <Coins className="w-5 h-5 text-nira-yellow animate-bounce" /> Pay via NIRA Wallet
                </h2>
                <div className="flex items-center justify-between p-4 rounded-xl border border-teal-200 bg-teal-50/30">
                  <div>
                    <p className="text-xs font-bold text-teal-800">Loyalty & Referral Rewards Credit</p>
                    <p className="text-sm font-black text-teal-900 mt-0.5">Available Balance: ₹{walletBalance.toLocaleString('en-IN')}</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useWallet} 
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-5 h-5 rounded accent-teal-600"
                    />
                    <span className="text-xs font-bold text-teal-800">Use balance</span>
                  </label>
                </div>
              </div>
            )}

            {/* Payment methods */}
            <div className="bg-white rounded-2xl p-6 border border-nira-gray-dark">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2 mb-4 text-nira-dark"><CreditCard className="w-5 h-5 text-nira-yellow" /> Payment Method</h2>
              <div className="space-y-3">
                {finalPayable === 0 ? (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs font-semibold text-center">
                    🎉 Your Wallet Balance fully covers this transaction! Wallet Checkout will be processed securely.
                  </div>
                ) : (
                  [
                    { id: 'razorpay', label: 'Razorpay Gateway (UPI, Cards, Netbanking)', desc: 'Secure payment powered by encrypted channels' },
                    { id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay with cash or UPI at your doorstep' },
                  ].map((m) => (
                    <label key={m.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod === m.id ? 'border-nira-yellow bg-nira-yellow/5' : 'border-nira-gray-dark'}`}>
                      <input type="radio" name="payment" checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="mt-0.5 accent-nira-yellow" />
                      <div>
                        <p className="font-bold text-sm text-nira-dark">{m.label}</p>
                        <p className="text-xs text-nira-text-secondary">{m.desc}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Summary receipt summary sidecard */}
          <div className="bg-white rounded-2xl p-6 h-fit sticky top-24 border border-nira-gray-dark shadow-sm">
            <h3 className="font-heading font-bold text-lg mb-4 border-b border-nira-gray-dark pb-3 text-nira-dark">Order Receipt Summary</h3>
            <div className="space-y-3 mb-5 max-h-[160px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-xs">
                  <span className="text-nira-text-secondary truncate max-w-[65%]">{item.product.name} <span className="font-bold">×{item.quantity}</span></span>
                  <span className="font-bold text-nira-dark">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon Application Box */}
            <div className="border-t border-b border-nira-gray-dark py-4 my-4 space-y-2">
              <p className="text-[10px] font-bold uppercase text-nira-text-secondary tracking-wider">Promo Coupon Code</p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-nira-yellow/10 border border-nira-yellow/30 p-2.5 rounded-xl">
                  <div>
                    <span className="text-xs font-black text-nira-dark">{appliedCoupon}</span>
                    <p className="text-[9px] text-nira-success font-semibold">Active: saved ₹{discountAmount || 'fees'}</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-xs text-red-500 font-bold hover:underline cursor-pointer">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CREATOR20, FREESHIP"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-nira-gray rounded-xl text-xs focus:outline-none border border-transparent focus:border-nira-yellow"
                  />
                  <button onClick={handleApplyCoupon} className="px-4 py-2 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Apply</button>
                </div>
              )}
              {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-nira-success font-bold">{couponSuccess}</p>}
            </div>

            {/* Price lines breaks and GST tax calculation */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-nira-text-secondary">Items Subtotal</span><span className="font-semibold text-nira-dark">{formatPrice(total)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-500"><span className="font-semibold">Discount ({appliedCoupon})</span><span className="font-bold">- {formatPrice(discountAmount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-nira-text-secondary">CGST (9%)</span><span className="font-semibold text-nira-dark">{formatPrice(cgst)}</span></div>
              <div className="flex justify-between"><span className="text-nira-text-secondary">SGST (9%)</span><span className="font-semibold text-nira-dark">{formatPrice(sgst)}</span></div>
              <div className="flex justify-between">
                <span className="text-nira-text-secondary">Diagnostics &amp; Platform Fee</span>
                <span>{platformFee === 0 ? <span className="text-nira-success font-black uppercase">Waived</span> : formatPrice(platformFee)}</span>
              </div>
              
              {walletDeducted > 0 && (
                <div className="flex justify-between text-teal-600 font-bold bg-teal-50/50 p-1.5 rounded-lg border border-teal-100">
                  <span>Loyalty Wallet Pay</span>
                  <span>- {formatPrice(walletDeducted)}</span>
                </div>
              )}

              <div className="h-px bg-nira-gray-dark my-2" />
              <div className="flex justify-between font-heading font-black text-lg text-nira-dark">
                <span>Payable</span><span>{formatPrice(finalPayable)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-6 w-full py-4 bg-nira-yellow text-nira-dark font-black tracking-wide rounded-xl hover:bg-nira-yellow-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-nira-yellow/20 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : finalPayable === 0 ? 'Complete Wallet Order' : `Pay ${formatPrice(finalPayable)}`}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-nira-text-secondary">
              <Shield className="w-3.5 h-3.5 text-nira-success" /> 256-Bit SSL Diagnostics &amp; Gateway Secured
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
