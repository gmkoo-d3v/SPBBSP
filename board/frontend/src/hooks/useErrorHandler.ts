import { useCallback, useState } from 'react'

type ParsedError = {
  userMessage: string
  code?: string
  fieldErrors?: Record<string, string>
  status?: number
}

function isAxiosError(err: unknown): err is {
  isAxiosError: boolean
  message: string
  response?: { status?: number; data?: any }
} {
  return typeof err === 'object' && err !== null && 'isAxiosError' in err
}

export function parseError(error: unknown): ParsedError {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data
    const apiMsg = typeof data?.message === 'string' ? data.message : undefined
    const code = typeof data?.code === 'string' ? data.code : undefined
    const details = typeof data?.details === 'object' ? data.details : undefined
    return {
      userMessage:
        apiMsg ||
        (status === 0
          ? '네트워크에 연결할 수 없습니다.'
          : status && status >= 500
          ? '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          : error.message || '요청 처리에 실패했습니다.'),
      code,
      fieldErrors: details ?? undefined,
      status,
    }
  }

  if (error instanceof Error) {
    return { userMessage: error.message }
  }

  return { userMessage: '알 수 없는 오류가 발생했습니다.' }
}

export default function useErrorHandler() {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: unknown) => {
    const parsed = parseError(err)
    setError(parsed.userMessage)
    window.Swal?.fire({ icon: 'error', title: '오류', text: parsed.userMessage })
  }, [])

  const resetError = useCallback(() => setError(null), [])

  return { error, handleError, resetError }
}

