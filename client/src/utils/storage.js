const STORAGE_KEY = 'kabarak-auth'

export const loadAuthFromStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Failed to parse auth from storage', error)
    return null
  }
}

export const persistAuthToStorage = (payload) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('Failed to persist auth to storage', error)
  }
}

export const clearAuthStorage = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export default {
  loadAuthFromStorage,
  persistAuthToStorage,
  clearAuthStorage,
}
