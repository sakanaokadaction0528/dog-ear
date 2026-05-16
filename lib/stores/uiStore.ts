'use client'

import { create } from 'zustand'

interface UIState {
  // Book list filters
  filterStatus: string | null
  filterCategory: string | null
  searchQuery: string
  setFilterStatus: (s: string | null) => void
  setFilterCategory: (c: string | null) => void
  setSearchQuery: (q: string) => void
  resetFilters: () => void

  // Desktop sidebar
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  filterStatus: null,
  filterCategory: null,
  searchQuery: '',
  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  resetFilters: () => set({ filterStatus: null, filterCategory: null, searchQuery: '' }),

  isSidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}))
