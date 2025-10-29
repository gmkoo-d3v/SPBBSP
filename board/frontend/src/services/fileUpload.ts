import { api } from '../api/client'
import { isAxiosError, type AxiosError } from 'axios'
import type { FileUploadResponse } from '../types'

type ProgressCallback = (progress: number) => void

const API_ENDPOINT = '/api/files/upload'
const API_ENDPOINT_MULTIPLE = '/api/files/upload-multiple'

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    const messageFromResponse = axiosError.response?.data?.message
    if (messageFromResponse) {
      return messageFromResponse
    }

    if (axiosError.message) {
      return axiosError.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to upload file.'
}

type UploadOptions = {
  signal?: AbortSignal
  timeoutMs?: number
}

const DEFAULT_TIMEOUT = 30_000 // 30s
const LARGE_TIMEOUT = 120_000 // 2m
const LARGE_THRESHOLD = 5 * 1024 * 1024 // 5MB

const uploadFile = async (
  file: File,
  onProgress?: ProgressCallback,
  options?: UploadOptions,
): Promise<FileUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post<FileUploadResponse>(API_ENDPOINT, formData, {
      signal: options?.signal,
      timeout: options?.timeoutMs ?? (file.size > LARGE_THRESHOLD ? LARGE_TIMEOUT : DEFAULT_TIMEOUT),
      onUploadProgress: (event) => {
        if (event.total) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress?.(percent)
        }
      },
    })

    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

const uploadMultipleFiles = async (
  files: File[],
  onProgress?: ProgressCallback,
  options?: UploadOptions,
): Promise<FileUploadResponse[]> => {
  if (!files.length) {
    return []
  }

  // Create a single multipart/form-data payload with multiple files
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  try {
    const response = await api.post<{ success: boolean; message?: string; data: FileUploadResponse[] }>(
      API_ENDPOINT_MULTIPLE,
      formData,
      {
        signal: options?.signal,
        // Use larger timeout if any file is large
        timeout:
          options?.timeoutMs ?? (files.some((f) => f.size > LARGE_THRESHOLD) ? LARGE_TIMEOUT : DEFAULT_TIMEOUT),
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded / event.total) * 100)
            onProgress?.(percent)
          }
        },
      },
    )

    // Backend returns ApiResponse<List<FileUploadResponse>>
    const body = response.data as unknown as { success: boolean; data: FileUploadResponse[]; message?: string }
    if (!body?.success) {
      throw new Error(body?.message || 'Failed to upload files')
    }
    onProgress?.(100)
    return body.data || []
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

const FileUploadService = {
  uploadFile,
  uploadMultipleFiles,
}

export { uploadFile, uploadMultipleFiles }
export default FileUploadService
