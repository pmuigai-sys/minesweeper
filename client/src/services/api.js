import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

let authToken = null
let csrfToken = null

export const setAuthToken = (token) => {
  authToken = token || null
}

export const setCsrfToken = (token) => {
  csrfToken = token || null
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['x-csrf-token'] = csrfToken
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('kabarak:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    register: '/auth/register',
  },
  elections: {
    root: '/elections',
    active: '/elections/active',
  },
  votes: {
    root: '/votes',
    stats: '/votes/stats',
    history: '/votes/history',
  },
  blockchain: {
    root: '/blockchain',
    verify: '/blockchain/verify',
  },
  reports: {
    export: '/reports/export',
  },
}

export default api
