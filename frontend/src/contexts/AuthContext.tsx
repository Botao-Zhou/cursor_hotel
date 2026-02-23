import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User, UserRole } from '@/types/user'

const STORAGE_TOKEN = 'pc_token'
const STORAGE_USER = 'pc_user'

export type { User, UserRole }

interface AuthState {
  token: string | null
  user: User | null
  isReady: boolean
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void
  logout: () => void
  setUserFromStorage: () => void
}

const defaultState: AuthState = {
  token: null,
  user: null,
  isReady: false,
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStored(): { token: string | null; user: User | null } {
  if (typeof localStorage === 'undefined') return { token: null, user: null }
  const token = localStorage.getItem(STORAGE_TOKEN)
  const raw = localStorage.getItem(STORAGE_USER)
  let user: User | null = null
  if (raw) {
    try {
      user = JSON.parse(raw) as User
    } catch {
      user = null
    }
  }
  return { token, user }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    ...defaultState,
    isReady: true,
    ...loadStored(),
  }))

  const setUserFromStorage = useCallback(() => {
    setState((prev) => ({ ...prev, ...loadStored() }))
  }, [])

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem(STORAGE_TOKEN, token)
    localStorage.setItem(STORAGE_USER, JSON.stringify(user))
    setState((prev) => ({ ...prev, token, user }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    setState((prev) => ({ ...prev, token: null, user: null }))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      setUserFromStorage,
    }),
    [state.token, state.user, state.isReady, login, logout, setUserFromStorage]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
