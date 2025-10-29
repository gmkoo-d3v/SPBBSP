import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBoard, getBoard, updateBoard } from '../api/boardApi'
import TiptapEditor from '../components/TiptapEditor'
import { Save, ArrowLeft } from 'lucide-react'
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
        await createBoard(form)
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

