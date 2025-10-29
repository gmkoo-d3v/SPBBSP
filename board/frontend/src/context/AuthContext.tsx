import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginApi, signup as signupApi, me as meApi } from '../api/authApi'

type User = {
  id?: number
  username: string
  email?: string
  role?: string
}

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  signup: (username: string, password: string, email?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const bootstrap = useCallback(async () => {
    try {
      const resp = await meApi()
      setUser(resp.data)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const login = useCallback(async (username: string, password: string) => {
    const resp = await loginApi({ username, password })
    const { accessToken, refreshToken } = resp.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    await bootstrap()
  }, [bootstrap])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }, [])

  const signup = useCallback(async (username: string, password: string, email?: string) => {
    await signupApi({ username, password, email })
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  }), [user, login, logout, signup])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

