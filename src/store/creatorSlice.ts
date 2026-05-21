'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Creator, CreatorCategory, AvailabilityStatus } from '@/types/creator';

interface CreatorFilters {
  category: CreatorCategory | 'all';
  minBudget: number;
  maxBudget: number;
  minRating: number;
  availability: AvailabilityStatus | 'all';
  searchQuery: string;
  sortBy: 'rating' | 'price_low' | 'price_high' | 'distance' | 'jobs';
}

interface CreatorState {
  filters: CreatorFilters;
  selectedCreatorId: string | null;
  activeSection: string;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  viewMode: 'grid' | 'map' | 'list';
}

const initialState: CreatorState = {
  filters: {
    category: 'all',
    minBudget: 0,
    maxBudget: 500000,
    minRating: 0,
    availability: 'all',
    searchQuery: '',
    sortBy: 'rating',
  },
  selectedCreatorId: null,
  activeSection: 'discover',
  mapCenter: { lat: 20.5937, lng: 78.9629 }, // India center
  mapZoom: 5,
  viewMode: 'grid',
};

const creatorSlice = createSlice({
  name: 'creator',
  initialState,
  reducers: {
    setCreatorFilter: (state, action: PayloadAction<Partial<CreatorFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedCreator: (state, action: PayloadAction<string | null>) => {
      state.selectedCreatorId = action.payload;
    },
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
    },
    setMapCenter: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'map' | 'list'>) => {
      state.viewMode = action.payload;
    },
  },
});

export const {
  setCreatorFilter,
  resetFilters,
  setSelectedCreator,
  setActiveSection,
  setMapCenter,
  setMapZoom,
  setViewMode,
} = creatorSlice.actions;

export default creatorSlice.reducer;

// Selectors
export const selectCreatorFilters = (state: { creator: CreatorState }) => state.creator.filters;
export const selectViewMode = (state: { creator: CreatorState }) => state.creator.viewMode;

export const filterCreators = (creators: Creator[], filters: CreatorFilters): Creator[] => {
  let result = [...creators];

  if (filters.category !== 'all') {
    result = result.filter(c => c.category === filters.category);
  }
  if (filters.minBudget > 0) {
    result = result.filter(c => c.startingPrice >= filters.minBudget);
  }
  if (filters.maxBudget < 500000) {
    result = result.filter(c => c.startingPrice <= filters.maxBudget);
  }
  if (filters.minRating > 0) {
    result = result.filter(c => c.rating >= filters.minRating);
  }
  if (filters.availability !== 'all') {
    result = result.filter(c => c.availability === filters.availability);
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  switch (filters.sortBy) {
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    case 'price_low': result.sort((a, b) => a.startingPrice - b.startingPrice); break;
    case 'price_high': result.sort((a, b) => b.startingPrice - a.startingPrice); break;
    case 'jobs': result.sort((a, b) => b.completedJobs - a.completedJobs); break;
  }

  return result;
};
