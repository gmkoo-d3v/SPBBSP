import axios, { AxiosError, AxiosResponse } from 'axios'
import type { ApiErrorResponse } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090'

/**
 * API 에러 로깅
 */
const logApiError = (error: AxiosError | Error, context: string): void => {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as Partial<ApiErrorResponse> | undefined
    console.error(`[API Error - ${context}]`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: errorData?.message || error.message,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString(),
      data: errorData,
    })
  } else {
    console.error(`[API Error - ${context}]`, {
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    // 401: 인증 실패
    if (status === 401) {
      return '인증이 만료되었습니다. 다시 로그인해주세요.'
    }

    // 403: 권한 없음
    if (status === 403) {
      return '해당 작업을 수행할 권한이 없습니다.'
    }

    // 404: 찾을 수 없음
    if (status === 404) {
      return '요청한 리소스를 찾을 수 없습니다.'
    }

    // 409: 충돌
    if (status === 409) {
      return '요청 처리 중 충돌이 발생했습니다.'
    }

    // 500+: 서버 에러
    if (status && status >= 500) {
      return '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }

    // 커스텀 에러 메시지
    const errorData = error.response?.data as Partial<ApiErrorResponse> | undefined
    if (errorData?.message) {
      return errorData.message
    }

    // 네트워크 에러
    if (error.code === 'ECONNABORTED') {
      return '요청이 시간 초과되었습니다.'
    }

    if (error.message === 'Network Error') {
      return '네트워크 연결을 확인해주세요.'
    }
  }

  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
}

/**
 * 401 에러 시 처리 (토큰 갱신 또는 로그아웃)
 */
const handle401Error = async (config: any): Promise<AxiosResponse | void> => {
  const refreshToken = localStorage.getItem('refreshToken')

  if (!refreshToken) {
    // 리프레시 토큰이 없으면 로그아웃
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
    return
  }

  try {
    // 토큰 갱신 시도
    const resp = await api.post('/api/auth/refresh', { refreshToken })
    const { accessToken, refreshToken: nextRefresh } = resp.data.data

    // 새 토큰 저장
    localStorage.setItem('accessToken', accessToken)
    if (nextRefresh) {
      localStorage.setItem('refreshToken', nextRefresh)
    }

    // 원래 요청 재시도
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${accessToken}`

    return api(config)
  } catch (error) {
    // 토큰 갱신 실패 시 로그아웃
    logApiError(error as AxiosError, '토큰 갱신 실패')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
  }
}

export const api = axios.create({
  baseURL: `${API_BASE}`,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout: 15000,
})

/**
 * 요청 인터셉터: Authorization 헤더 추가
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // Fallback: CSRF 토큰이 meta 태그에 있는 경우
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

/**
 * 응답 인터셉터: 에러 처리 및 토큰 갱신
 */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any

    // 401 에러 처리 (토큰 갱신)
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      logApiError(error, '토큰 갱신 필요')

      const result = await handle401Error(original)
      if (result) {
        return result
      }

      // 리다이렉트된 경우
      return Promise.reject(error)
    }

    // 기타 에러 로깅
    if (error.response?.status !== 401) {
      logApiError(error, `HTTP ${error.response?.status}`)
    }

    // 에러 객체에 사용자 메시지 추가
    const message = getErrorMessage(error)
    const enhancedError = new Error(message) as AxiosError
    enhancedError.config = error.config
    enhancedError.response = error.response

    return Promise.reject(enhancedError)
  }
)

export default api
