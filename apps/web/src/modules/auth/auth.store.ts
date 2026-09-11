import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { AuthUser, AuthTokens } from '@khetly/types'

interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isHydrated: boolean

  setUser: (user: AuthUser, tokens: AuthTokens) => void
  setTokens: (tokens: AuthTokens) => void
  updateUser: (partial: Partial<AuthUser>) => void
  logout: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isHydrated: false,

      setUser: (user, tokens) =>
        set((state) => {
          state.user = user
          state.tokens = tokens
          state.isAuthenticated = true
        }),

      setTokens: (tokens) =>
        set((state) => {
          state.tokens = tokens
          state.isAuthenticated = true
        }),

      updateUser: (partial) =>
        set((state) => {
          if (state.user) Object.assign(state.user, partial)
        }),

      logout: () =>
        set((state) => {
          state.user = null
          state.tokens = null
          state.isAuthenticated = false
        }),

      setHydrated: () =>
        set((state) => {
          state.isHydrated = true
        }),
    })),
    {
      name: 'khetly-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
