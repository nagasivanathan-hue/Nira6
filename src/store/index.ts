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

const analyticsMiddleware: Middleware = (storeAPI) => (next) => (action: any) => {
  const result = next(action);

  // Track Cart Events
  if (action.type.startsWith('cart/')) {
    const state = storeAPI.getState();
    const cartItems = state.cart.items;
    
    if (action.type === 'cart/addToCart') {
      trackEvent('ADD_TO_CART', { productId: action.payload.id, quantity: action.payload.quantity || 1 });
    }
    
    trackEvent('CART_UPDATED', {
      totalItems: cartItems.length,
      cartTotal: cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
      actionType: action.type
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
