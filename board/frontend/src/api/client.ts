import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090'

export const api = axios.create({
  baseURL: `${API_BASE}`,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  // Fallback: if server uses custom CSRF meta tags
  if (typeof document !== 'undefined') {
    const metaToken = (document.querySelector("meta[name='_csrf']") as HTMLMetaElement)?.content
    const metaHeader = (document.querySelector("meta[name='_csrf_header']") as HTMLMetaElement)?.content
    if (metaToken && metaHeader) {
      config.headers = config.headers || {}
      ;(config.headers as Record<string, string>)[metaHeader] = metaToken
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const resp = await api.post('/api/auth/refresh', { refreshToken })
          const { accessToken, refreshToken: nextRefresh } = resp.data.data
          localStorage.setItem('accessToken', accessToken)
          if (nextRefresh) localStorage.setItem('refreshToken', nextRefresh)
          original.headers = original.headers || {}
          original.headers['Authorization'] = `Bearer ${accessToken}`
          return api(original)
        } catch (e) {
          // fall through to reject
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
