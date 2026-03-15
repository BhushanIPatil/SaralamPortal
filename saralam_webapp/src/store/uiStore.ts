import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  mobileNavOpen: boolean
  setSidebarOpen: (open: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  toggleSidebar: () => void
  toggleMobileNav: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
}))
