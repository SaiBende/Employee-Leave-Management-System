import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, LoginRequest } from '@/types'
import { api } from '@/api/client'

interface AuthContextType {
  user: User | null
  login: (data: LoginRequest) => Promise<User>
  establishSession: (user: User) => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored) as User)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const establishSession = (userData: User) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const login = async (data: LoginRequest) => {
    const res = await api.post<{ success: boolean; data: User }>('/auth/login', data)
    establishSession(res.data)
    return res.data
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword })
    if (user) {
      const updated = { ...user, mustChangePassword: false }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, establishSession, changePassword, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
