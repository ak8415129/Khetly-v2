import { create } from 'zustand'
import type { ListingSearchParams, RiskLevel, LandType, HarvestSeason } from '@khetly/types'

interface ListingsState {
  filters: ListingSearchParams
  userLat: number | null
  userLng: number | null
  setFilters: (f: Partial<ListingSearchParams>) => void
  resetFilters: () => void
  setUserLocation: (lat: number, lng: number) => void
}

const DEFAULT_FILTERS: ListingSearchParams = {
  radiusKm: undefined,
  sortBy: 'newest',
  page: 1,
  pageSize: 12,
}

export const useListingsStore = create<ListingsState>((set) => ({
  filters: DEFAULT_FILTERS,
  userLat: null,
  userLng: null,

  setFilters: (f) =>
    set((s) => ({ filters: { ...s.filters, ...f, page: 1 } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setUserLocation: (lat, lng) =>
    set((s) => ({
      userLat: lat,
      userLng: lng,
      filters: { ...s.filters, lat, lng },
    })),
}))
