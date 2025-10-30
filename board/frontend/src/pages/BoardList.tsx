import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBoards } from '../api/boardApi'
import { sanitizeAttribute } from '../utils/sanitize'
import { useBoardStore } from '../store/boardStore'
import type { BoardResponse } from '../types'
import { Eye, User, MessageCircle } from 'lucide-react'
import Swal from 'sweetalert2'

const BoardList: React.FC = () => {
  const [items, setItems] = useState<BoardResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setBoards } = useBoardStore()

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getBoards()
      const boards = res.data || []
      setItems(boards)
      setBoards(boards)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">게시판</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">전체 {items.length}개의 게시글</p>
        </div>
        <Link
          to="/boards/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <span>✏️</span>
          새 글 작성
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Board List - Grid Layout */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className="card p-4 group hover:shadow-hover"
            >
              <div className="space-y-3">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {sanitizeAttribute(board.boardTitle)}
                </h3>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{sanitizeAttribute(board.boardWriter)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{board.boardHits}</span>
                  </div>
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {sanitizeAttribute(board.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">아직 작성된 게시글이 없습니다.</p>
          <Link to="/boards/new" className="btn btn-primary">
            첫 게시글 작성하기
          </Link>
        </div>
      )}
    </div>
  )
}

export default BoardList

