import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, endpoints, setAuthToken, setCsrfToken } from '../services/api'
import { clearAuthStorage, loadAuthFromStorage, persistAuthToStorage } from '../utils/storage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [csrfTokenValue, setCsrfTokenValue] = useState(null)

  const bootstrap = useCallback(async () => {
    const stored = loadAuthFromStorage()
    if (!stored?.token) {
      setLoading(false)
      return
    }

    try {
      setAuthToken(stored.token)
      setToken(stored.token)
      if (stored.user) {
        setUser(stored.user)
      }
      if (stored.csrfToken) {
        setCsrfToken(stored.csrfToken)
        setCsrfTokenValue(stored.csrfToken)
      }
      const { data } = await api.get(endpoints.auth.me)
      setUser(data.user)
    } catch (error) {
      console.error('Auth bootstrap failed', error)
      clearAuthStorage()
      setAuthToken(null)
      setCsrfToken(null)
      setUser(null)
      setToken(null)
      setCsrfTokenValue(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearAuthStorage()
    setAuthToken(null)
    setCsrfToken(null)
    setUser(null)
    setToken(null)
    setCsrfTokenValue(null)
  }, [])

  useEffect(() => {
    bootstrap()
    const handleUnauthorized = () => logout()
    window.addEventListener('kabarak:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('kabarak:unauthorized', handleUnauthorized)
  }, [bootstrap, logout])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post(endpoints.auth.login, credentials)
    setAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    setCsrfToken(data.csrfToken)
    setCsrfTokenValue(data.csrfToken)
    persistAuthToStorage({ token: data.token, user: data.user, csrfToken: data.csrfToken })
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post(endpoints.auth.register, payload)
    setAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    setCsrfToken(data.csrfToken)
    setCsrfTokenValue(data.csrfToken)
    persistAuthToStorage({ token: data.token, user: data.user, csrfToken: data.csrfToken })
    return data
  }, [])

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false
      const allowed = Array.isArray(roles) ? roles : [roles]
      return allowed.includes(user.role)
    },
    [user],
  )

  const value = useMemo(
    () => ({ user, token, csrfToken: csrfTokenValue, loading, login, logout, register, hasRole }),
    [user, token, csrfTokenValue, loading, login, logout, register, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export default AuthContext
