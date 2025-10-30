import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

// 공통 Axios 인스턴스 생성: CSRF 자동 포함, 타임아웃, 재시도
const createHttp = (): AxiosInstance => {
  const instance = axios.create({
    timeout: 15000,
    withCredentials: false,
  })

  // CSRF 토큰 자동 포함
  instance.interceptors.request.use((config) => {
    const token = (document.querySelector("meta[name='_csrf']") as HTMLMetaElement)?.content
    const header = (document.querySelector("meta[name='_csrf_header']") as HTMLMetaElement)?.content
    if (token && header) {
      config.headers = config.headers || {}
      config.headers[header] = token
    }
    return config
  })

  return instance
}

const http = createHttp()

// Exponential backoff 재시도 유틸
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseDelayMs = 300): Promise<T> {
  let attempt = 0
  let lastError: unknown
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const axiosErr = err as AxiosError
      const status = axiosErr.response?.status
      const isTimeout = axiosErr.code === 'ECONNABORTED'
      const isRetriable = isTimeout || !status || (status >= 500 && status < 600)
      attempt += 1
      if (attempt >= retries || !isRetriable) break
      const jitter = Math.floor(Math.random() * 100)
      const wait = baseDelayMs * Math.pow(2, attempt - 1) + jitter
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw lastError
}

// ApiResponse(success=false)를 에러로 변환
function ensureApiOk(res: any) {
  const body = res?.data
  if (body && typeof body.success === 'boolean' && body.success === false) {
    const message = body.message || '요청이 실패했습니다.'
    const err = new Error(message)
    ;(err as any).response = res
    throw err
  }
  return res
}

// 댓글 API
export const commentApi = {
  list(boardId: number) {
    return withRetry(() => http.get(`/comment/list/${boardId}`))
  },
  save(payload: { boardId: number; commentWriter: string; commentContents: string }) {
    const config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } }
    return withRetry(() => http.post('/comment/save', payload, config).then(ensureApiOk))
  },
  delete(commentId: number, _boardId?: number) {
    const config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } }
    return withRetry(() => http.post(`/comment/delete/${commentId}`, {}, config).then(ensureApiOk))
  },
}

// 대댓글 API
export const replyApi = {
  list(commentId: number) {
    return withRetry(() => http.get(`/reply/list/${commentId}`))
  },
  save(payload: { commentId: number; replyWriter: string; replyContents: string }) {
    const config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } }
    return withRetry(() => http.post('/reply/save', payload, config).then(ensureApiOk))
  },
  delete(replyId: number) {
    const config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } }
    return withRetry(() => http.post(`/reply/delete/${replyId}`, {}, config).then(ensureApiOk))
  },
}

// 게시글 API (상세)
export const boardApi = {
  get(id: number) {
    return withRetry(() => http.get(`/api/boards/${id}`))
  },
}
