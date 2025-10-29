import { useCallback, useEffect, useRef, useState } from 'react'
import FileUploadService from '../services/fileUpload'
import type { FileUploadResponse } from '../types'

type UploadableInput = File | File[] | FileList

const normalizeFiles = (input: UploadableInput): File[] => {
  if (input instanceof FileList) {
    return Array.from(input)
  }

  return Array.isArray(input) ? input : [input]
}

const useFileUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const uploadFile = useCallback(
    async (input: UploadableInput): Promise<FileUploadResponse[]> => {
      const files = normalizeFiles(input)

      if (!files.length) {
        return []
      }

      setUploading(true)
      setProgress(0)
      setError(null)
      // Abort any in-flight request before starting a new one
      if (abortRef.current) {
        try { abortRef.current.abort() } catch { /* no-op */ }
      }
      abortRef.current = new AbortController()

      try {
        const responses = await FileUploadService.uploadMultipleFiles(
          files,
          (value) => setProgress(value),
          { signal: abortRef.current.signal },
        )
        setProgress(100)
        return responses
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        setError(message)
        throw error instanceof Error ? error : new Error(message)
      } finally {
        setUploading(false)
      }
    },
    [],
  )

  const abort = useCallback(() => {
    if (abortRef.current) {
      try { abortRef.current.abort() } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    return () => {
      // Abort in-flight requests on unmount to avoid leaks
      if (abortRef.current) {
        try { abortRef.current.abort() } catch { /* ignore */ }
      }
    }
  }, [])

  return {
    uploadFile,
    abort,
    uploading,
    progress,
    error,
  }
}

export default useFileUpload
