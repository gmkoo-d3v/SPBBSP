export interface FileUploadResponse {
  fileUrl: string
  fileName: string
}

export interface BoardContent {
  html: string
  text: string
}

export interface EditorProps {
  value?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (content: BoardContent) => void
}

// ---- Board Detail / Comments / Replies types ----

export interface ApiResponse<T> {
  success: boolean
  message?: string | null
  data: T
}

export interface BoardResponse {
  id: number
  boardWriter: string
  boardTitle: string
  boardContents: string
  boardHits: number
  createdAt: string
  fileAttached: number
  files?: Array<{
    id?: number
    fileName: string
    storedFileName?: string
    fileUrl: string
  }>
}

// Backward compatibility alias
export type Board = BoardResponse

export interface CommentDTO {
  id: number
  commentWriter: string
  commentContents: string
  boardId: number
  createdAt: string
}

export interface ReplyDTO {
  id: number
  replyWriter: string
  replyContents: string
  commentId: number
  createdAt: string
}

// Minimal SweetAlert2 type surface we use
export interface SweetAlertResult {
  isConfirmed: boolean
  isDenied: boolean
  isDismissed: boolean
}

export interface SweetAlertOptions {
  title?: string
  text?: string
  html?: string
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question'
  showCancelButton?: boolean
  confirmButtonColor?: string
  cancelButtonColor?: string
  confirmButtonText?: string
  cancelButtonText?: string
  timer?: number
  showConfirmButton?: boolean
}

export interface SweetAlert {
  fire: (options: SweetAlertOptions) => Promise<SweetAlertResult>
}

declare global {
  interface Window {
    Swal?: SweetAlert
    __BOARD_FILES__?: Array<{ id: number; boardId: number; originalFileName: string; storedFileName: string }>
  }
}
