import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;
  activeModal: string | null;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  cartDrawerOpen: boolean;
}

const initialState: UIState = {
  mobileMenuOpen: false,
  searchOpen: false,
  searchQuery: '',
  activeModal: null,
  toasts: [],
  cartDrawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    setSearchQuery: (state, action: PayloadAction<string>) => { state.searchQuery = action.payload; },
    openModal: (state, action: PayloadAction<string>) => { state.activeModal = action.payload; },
    closeModal: (state) => { state.activeModal = null; },
    toggleCartDrawer: (state) => { state.cartDrawerOpen = !state.cartDrawerOpen; },
    openCartDrawer: (state) => { state.cartDrawerOpen = true; },
    closeCartDrawer: (state) => { state.cartDrawerOpen = false; },
    addToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      state.toasts.push({ id: Date.now().toString(), ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { toggleMobileMenu, closeMobileMenu, toggleSearch, setSearchQuery, openModal, closeModal, toggleCartDrawer, openCartDrawer, closeCartDrawer, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
