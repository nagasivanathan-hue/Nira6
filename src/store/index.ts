'use client';
import { configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import productReducer from './productSlice';
import wishlistReducer from './wishlistSlice';
import creatorReducer from './creatorSlice';
import { trackEvent } from '@/lib/analytics';

import { Action } from '@reduxjs/toolkit';

const analyticsMiddleware: Middleware = (storeAPI) => (next) => (action: unknown) => {
  const result = next(action);

  // Track Cart Events
  if (typeof action === 'object' && action !== null && 'type' in action && typeof (action as Action).type === 'string' && (action as Action).type.startsWith('cart/')) {
    const typedAction = action as { type: string; payload?: { id: string, quantity?: number } };
    const state = storeAPI.getState();
    const cartItems = state.cart.items;
    
    if (typedAction.type === 'cart/addToCart' && typedAction.payload) {
      trackEvent('ADD_TO_CART', { productId: typedAction.payload.id, quantity: typedAction.payload.quantity || 1 });
    }
    
    trackEvent('CART_UPDATED', {
      totalItems: cartItems.length,
      cartTotal: cartItems.reduce((acc: number, item: { price: number; quantity: number }) => acc + (item.price * item.quantity), 0),
      actionType: typedAction.type
    });
  }

  return result;
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    ui: uiReducer,
    products: productReducer,
    wishlist: wishlistReducer,
    creator: creatorReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(analyticsMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
