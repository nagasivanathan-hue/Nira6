'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { removeFromCart, updateQuantity, clearCart, selectCartItems, selectCartTotal } from '@/store/cartSlice';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-nira-gray flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-nira-text-secondary mx-auto mb-4" />
          <h2 className="font-heading font-bold text-2xl mb-2">Your cart is empty</h2>
          <p className="text-nira-text-secondary mb-6">Looks like you haven&apos;t added anything yet</p>
          <Link href="/buy" className="inline-flex items-center gap-2 px-6 py-3 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nira-gray">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading font-bold text-3xl">Your Cart ({items.length})</h1>
          <button onClick={() => dispatch(clearCart())} className="text-sm text-nira-error hover:underline">Clear All</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 bg-nira-gray rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-nira-text-secondary uppercase">{item.product.brand}</p>
                      <h3 className="font-semibold truncate">{item.product.name}</h3>
                    </div>
                    <button onClick={() => dispatch(removeFromCart(item.product.id))} className="text-nira-text-secondary hover:text-nira-error p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-nira-gray rounded-lg">
                      <button onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: Math.max(1, item.quantity - 1) }))} className="p-2 hover:bg-nira-gray-dark rounded-lg"><Minus className="w-3 h-3" /></button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity + 1 }))} className="p-2 hover:bg-nira-gray-dark rounded-lg"><Plus className="w-3 h-3" /></button>
                    </div>
                    <p className="font-heading font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 h-fit sticky top-24">
            <h3 className="font-heading font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-nira-text-secondary">Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-nira-text-secondary">Shipping</span><span className="text-nira-success font-medium">FREE</span></div>
              <div className="flex justify-between"><span className="text-nira-text-secondary">Platform Fee</span><span>{formatPrice(Math.round(total * 0.02))}</span></div>
              <div className="h-px bg-nira-gray-dark" />
              <div className="flex justify-between font-heading font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(Math.round(total * 1.02))}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-6 w-full py-3.5 bg-nira-yellow text-nira-dark font-semibold rounded-xl hover:bg-nira-yellow-dark transition-colors flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-nira-text-secondary">
              <Shield className="w-3.5 h-3.5" /> Secure checkout powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
