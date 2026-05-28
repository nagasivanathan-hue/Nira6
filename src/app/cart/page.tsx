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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-heading font-black text-3xl text-neutral-900">Shopping Cart</h1>
            <p className="text-sm font-bold text-neutral-500 mt-1">{items.length} items in your cart</p>
          </div>
          <button onClick={() => dispatch(clearCart())} className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer transition-colors uppercase tracking-wider">Empty Cart</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-5">
            {items.map((item, i) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 flex gap-5 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <div className="relative w-28 h-28 bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-3">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-contain" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/buy/${item.product.id}`}>
                          <h3 className="font-bold text-neutral-800 line-clamp-2 leading-snug group-hover:text-nira-yellow-dark transition-colors">{item.product.name}</h3>
                        </Link>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">
                          {item.product.brand} • Grade {item.product.grade}
                        </p>
                      </div>
                      <button onClick={() => dispatch(removeFromCart(item.product.id))} className="text-neutral-400 hover:text-red-500 p-1.5 transition-colors" aria-label="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Simulated Delivery ETA */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 w-fit px-2 py-0.5 rounded border border-emerald-100">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Delivery by Tomorrow, 5 PM
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: Math.max(1, item.quantity - 1) }))} 
                        className="px-3 py-2 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                        title="Decrease quantity"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-black text-neutral-900">{item.quantity}</span>
                      <button 
                        onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity + 1 }))} 
                        className="px-3 py-2 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                        title="Increase quantity"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-heading font-black text-xl text-neutral-900">{formatPrice(item.product.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-neutral-400 font-bold">{formatPrice(item.product.price)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sticky Order Summary */}
          <div className="bg-white rounded-2xl p-6 h-fit sticky top-28 border border-neutral-200 shadow-lg">
            <h3 className="font-heading font-black text-lg text-neutral-900 mb-5 border-b border-neutral-100 pb-4">Order Summary</h3>
            <div className="space-y-4 text-sm font-semibold mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-500">Items Subtotal</span>
                <span className="text-neutral-900">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping Estimate</span>
                {total >= 15000 ? (
                  <span className="text-emerald-600 font-black uppercase">FREE</span>
                ) : (
                  <span className="text-neutral-900">{formatPrice(350)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Diagnostics Fee</span>
                <span className="text-neutral-900">{formatPrice(Math.round(total * 0.02))}</span>
              </div>
              
              <div className="h-px bg-neutral-200 w-full" />
              
              <div className="flex justify-between font-heading font-black text-2xl text-neutral-900 pt-2">
                <span>Total</span>
                <span>{formatPrice(total + Math.round(total * 0.02) + (total >= 15000 ? 0 : 350))}</span>
              </div>
            </div>

            <Link href="/checkout" className="w-full py-4 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark font-black tracking-wider uppercase text-xs rounded-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-sm">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> 100% Secure Checkout Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
