'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity } from '@/store/cartSlice';
import { closeCartDrawer } from '@/store/uiSlice';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

const FREE_SHIPPING_THRESHOLD = 15000;

export default function MiniCart() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.cartDrawerOpen);
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  
  // Custom confirmation modal state
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmRemoveName, setConfirmRemoveName] = useState<string>('');

  const shippingDiff = FREE_SHIPPING_THRESHOLD - total;
  const shippingPercent = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  const handleDecreaseQuantity = (itemId: string, currentQty: number, itemName: string) => {
    if (currentQty === 1) {
      setConfirmRemoveName(itemName);
      setConfirmRemoveId(itemId);
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: currentQty - 1 }));
    }
  };

  const handleConfirmRemove = () => {
    if (confirmRemoveId) {
      dispatch(removeFromCart(confirmRemoveId));
      setConfirmRemoveId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCartDrawer())}
            className="fixed inset-0 bg-black z-50 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col h-full border-l border-neutral-100"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-900 text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-nira-yellow" />
                <h3 className="font-heading font-black text-sm uppercase tracking-wider">Your Shopping Cart</h3>
                <span className="bg-nira-yellow text-nira-dark text-[10px] font-black px-2 py-0.5 rounded-full">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button aria-label="Button" title="Button"
                onClick={() => dispatch(closeCartDrawer())}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-neutral-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gamification Progress Bar */}
            {items.length > 0 && (
              <div className="p-4 bg-neutral-50 border-b border-neutral-100">
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <span className="font-bold text-neutral-800">
                    {shippingDiff > 0 ? (
                      <>
                        You are <span className="text-nira-yellow-dark font-extrabold">{formatPrice(shippingDiff)}</span> away from <span className="font-black">Free Shipping!</span>
                      </>
                    ) : (
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                        🎉 Congratulations! You unlocked Free Shipping!
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-black text-neutral-400">{Math.round(shippingPercent)}%</span>
                </div>
                <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full transition-colors duration-300 ${
                      shippingPercent === 100 ? 'bg-emerald-500' : 'bg-nira-yellow'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="w-12 h-12 text-neutral-300 mb-3 animate-bounce" />
                  <h4 className="font-heading font-bold text-neutral-800">Your cart is empty</h4>
                  <p className="text-neutral-400 text-xs mt-1.5 max-w-[240px]">Inspect our catalog and grab some creator gear to start!</p>
                  <button
                    onClick={() => {
                      dispatch(closeCartDrawer());
                      router.push('/buy');
                    }}
                    className="mt-6 px-5 py-2.5 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 border border-neutral-100 rounded-2xl hover:bg-neutral-50/50 transition-colors bg-white shadow-xs relative group"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-neutral-800 line-clamp-1 leading-snug group-hover:text-nira-yellow-dark transition-colors">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => dispatch(removeFromCart(item.product.id))}
                            className="text-neutral-400 hover:text-red-500 p-0.5 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                          {item.product.brand} • Grade {item.product.grade}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-neutral-100 rounded-lg">
                          <button aria-label="Button" title="Button"
                            onClick={() =>
                              handleDecreaseQuantity(item.product.id, item.quantity, item.product.name)
                            }
                            className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-neutral-800">{item.quantity}</span>
                          <button aria-label="Button" title="Button"
                            onClick={() =>
                              dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity + 1 }))
                            }
                            className="p-1.5 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-heading font-black text-xs text-neutral-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-500 font-semibold">
                    <span>Subtotal</span>
                    <span className="text-neutral-800">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 font-semibold">
                    <span>Shipping</span>
                    <span>
                      {total >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="text-emerald-600 font-black uppercase">FREE</span>
                      ) : (
                        <span>{formatPrice(350)}</span>
                      )}
                    </span>
                  </div>
                  <div className="h-px bg-neutral-200/60 my-1" />
                  <div className="flex justify-between text-sm font-heading font-black text-neutral-900">
                    <span>Total Amount</span>
                    <span>{formatPrice(total + (total >= FREE_SHIPPING_THRESHOLD ? 0 : 350))}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      dispatch(closeCartDrawer());
                      router.push('/checkout');
                    }}
                    className="w-full py-4 bg-nira-yellow hover:bg-nira-yellow-dark text-nira-dark font-black tracking-wider uppercase text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-nira-yellow/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Secure Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      dispatch(closeCartDrawer());
                      router.push('/cart');
                    }}
                    className="w-full py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    View Shopping Cart Page
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" /> Powered by Razorpay SSL Secure
                </div>
              </div>
            )}

            {/* Custom Remove Confirmation Overlay Dialog */}
            <AnimatePresence>
              {confirmRemoveId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-neutral-900/60 z-55 flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    className="bg-white rounded-2xl p-5 w-full max-w-[320px] shadow-2xl text-center border border-neutral-100"
                  >
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h4 className="font-heading font-black text-sm text-neutral-900">Remove Item?</h4>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                      Are you sure you want to remove <span className="font-semibold text-neutral-800">&ldquo;{confirmRemoveName}&rdquo;</span> from your cart?
                    </p>
                    <div className="flex gap-2.5 mt-5">
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmRemove}
                        className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
