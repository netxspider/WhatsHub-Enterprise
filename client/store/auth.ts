import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
    user: User | null
    token: string | null
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    logout: () => void
    isAuthenticated: boolean
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setToken: (token) => {
                if (token) {
                    localStorage.setItem('token', token)
                } else {
                    localStorage.removeItem('token')
                }
                set({ token })
            },
            logout: () => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                set({ user: null, token: null, isAuthenticated: false })
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)
