import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
}

const isClient = typeof window !== 'undefined';

const loadCartFromStorage = (): CartItem[] => {
  if (!isClient) return [];
  try {
    const saved = localStorage.getItem('nira_cart_items');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find((i) => i.product.id === action.payload.id);
      if (existing) { existing.quantity += 1; }
      else { state.items.push({ product: action.payload, quantity: 1 }); }
      if (isClient) {
        localStorage.setItem('nira_cart_items', JSON.stringify(state.items));
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.product.id !== action.payload);
      if (isClient) {
        localStorage.setItem('nira_cart_items', JSON.stringify(state.items));
      }
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((i) => i.product.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.product.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      if (isClient) {
        localStorage.setItem('nira_cart_items', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      if (isClient) {
        localStorage.removeItem('nira_cart_items');
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
export const selectCartCount = (state: { cart: CartState }) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export default cartSlice.reducer;
