import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBoard, createBoardWithFiles, getBoard, updateBoard } from '../api/boardApi'
import TiptapEditor from '../components/TiptapEditor'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'
import Swal from 'sweetalert2'

interface FormData {
  boardTitle: string
  boardWriter: string
  boardPass: string
  boardContents: string
}

const BoardForm: React.FC = () => {
  const { id } = useParams()
  const isEdit = !!id
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    boardTitle: '',
    boardWriter: '',
    boardPass: '',
    boardContents: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEdit && id) {
      fetchBoard()
    }
  }, [id, isEdit])

  const fetchBoard = async () => {
    if (!isEdit || !id) return
    setLoading(true)
    try {
      const res = await getBoard(parseInt(id))
      const board = res.data
      setForm({
        boardTitle: board.boardTitle || '',
        boardWriter: board.boardWriter || '',
        boardPass: '',
        boardContents: board.boardContents || '',
      })
    } catch (err: any) {
      const errorMsg = err?.message || '게시글을 불러오지 못했습니다.'
      setError(errorMsg)
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditorChange = (contents: string | { html: string; text: string }) => {
    const htmlContent = typeof contents === 'string' ? contents : contents.html
    setForm((prev) => ({
      ...prev,
      boardContents: htmlContent,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // Limit to 10 files
    if (files.length + selectedFiles.length > 10) {
      Swal.fire({
        icon: 'warning',
        title: '파일 개수 초과',
        text: '최대 10개까지 첨부할 수 있습니다.',
      })
      return
    }

    // Create preview URLs
    const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file))
    setFiles([...files, ...selectedFiles])
    setPreviewUrls([...previewUrls, ...newPreviewUrls])
  }

  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(previewUrls[index])
    setFiles(files.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }

  useEffect(() => {
    // Cleanup preview URLs on unmount
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.boardTitle.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '제목을 입력해주세요.',
      })
      return
    }

    if (!form.boardWriter.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '작성자를 입력해주세요.',
      })
      return
    }

    if (!form.boardContents || !form.boardContents.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '내용을 입력해주세요.',
      })
      return
    }

    setLoading(true)
    try {
      if (isEdit && id) {
        await updateBoard(parseInt(id), form)
        Swal.fire({
          icon: 'success',
          title: '수정 완료',
          text: '게시글이 수정되었습니다.',
          timer: 1500,
          showConfirmButton: false,
        })
      } else {
        // Use createBoardWithFiles if files are attached
        if (files.length > 0) {
          await createBoardWithFiles(form, files)
        } else {
          await createBoard(form)
        }
        Swal.fire({
          icon: 'success',
          title: '작성 완료',
          text: '게시글이 작성되었습니다.',
          timer: 1500,
          showConfirmButton: false,
        })
      }
      nav('/')
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: err?.message || '저장 중 오류가 발생했습니다.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => nav('/')}
        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        목록으로 돌아가기
      </button>

      {/* Form Card */}
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {isEdit ? '게시글 수정' : '새 게시글 작성'}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="boardTitle" className="form-label">
              제목 *
            </label>
            <input
              id="boardTitle"
              type="text"
              name="boardTitle"
              value={form.boardTitle}
              onChange={handleChange}
              placeholder="게시글 제목을 입력해주세요"
              className="input"
              required
            />
          </div>

          {/* Writer */}
          <div className="form-group">
            <label htmlFor="boardWriter" className="form-label">
              작성자 *
            </label>
            <input
              id="boardWriter"
              type="text"
              name="boardWriter"
              value={form.boardWriter}
              onChange={handleChange}
              placeholder="작성자명을 입력해주세요"
              className="input"
              required
            />
          </div>

          {/* Password */}
          {!isEdit && (
            <div className="form-group">
              <label htmlFor="boardPass" className="form-label">
                비밀번호 *
              </label>
              <input
                id="boardPass"
                type="password"
                name="boardPass"
                value={form.boardPass}
                onChange={handleChange}
                placeholder="게시글 수정/삭제 시 필요한 비밀번호"
                className="input"
                required
              />
            </div>
          )}

          {/* Editor */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              내용 *
            </label>
            <TiptapEditor
              value={form.boardContents}
              onChange={handleEditorChange}
            />
          </div>

          {/* File Upload */}
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">
                이미지 첨부 (최대 10개)
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    파일 선택
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {files.length}개 선택됨
                  </span>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group"
                      >
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                            title="삭제"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800">
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => nav('/')}
              className="btn btn-secondary"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BoardForm

