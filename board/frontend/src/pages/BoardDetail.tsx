import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getBoard, deleteBoard } from '../api/boardApi'
import DOMPurify from 'dompurify'
import { ArrowLeft, Edit, Trash2, Image as ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Swal from 'sweetalert2'

interface BoardFile {
  id: number
  fileName: string
  storedFileName: string
  fileUrl: string
}

interface Board {
  id: number
  boardTitle: string
  boardWriter: string
  boardContents: string
  boardHits: number
  createdAt: string
  fileAttached: number
  files?: BoardFile[]
}

const BoardDetail: React.FC = () => {
  const { id } = useParams()
  const nav = useNavigate()
  const [item, setItem] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchBoard()
  }, [id])

  const fetchBoard = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await getBoard(parseInt(id))
      setItem(res.data)
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

  const onDelete = async () => {
    if (!id) return
    const result = await Swal.fire({
      title: '게시글 삭제',
      text: '정말 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      confirmButtonColor: '#ef4444',
    })

    if (result.isConfirmed) {
      try {
        await deleteBoard(parseInt(id))
        Swal.fire({
          icon: 'success',
          title: '삭제 완료',
          text: '게시글이 삭제되었습니다.',
          timer: 1500,
          showConfirmButton: false,
        })
        nav('/')
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: '오류',
          text: err?.message || '삭제 중 오류가 발생했습니다.',
        })
      }
    }
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    if (item?.files) {
      setCurrentImageIndex((prev) => (prev + 1) % item.files!.length)
    }
  }

  const prevImage = () => {
    if (item?.files) {
      setCurrentImageIndex((prev) => (prev - 1 + item.files!.length) % item.files!.length)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return

      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') prevImage()
      else if (e.key === 'ArrowRight') nextImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, item?.files])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error || '게시글을 찾을 수 없습니다.'}</p>
        <Link to="/" className="btn btn-primary">
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const sanitizedHtml = DOMPurify.sanitize(item.boardContents)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        목록으로 돌아가기
      </Link>

      {/* Post Header */}
      <div className="card p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {item.boardTitle}
        </h1>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t border-b border-gray-200 dark:border-gray-700 py-3">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-900 dark:text-white">
              작성자: {item.boardWriter}
            </span>
            <span>{item.createdAt}</span>
          </div>
          <span className="flex items-center gap-1">
            👁️ {item.boardHits}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="card p-6">
        <div
          className="prose dark:prose-invert max-w-none prose-p:my-3 prose-headings:my-2 prose-img:rounded-lg prose-a:text-blue-600 dark:prose-a:text-blue-400"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>

      {/* Attached Files */}
      {item.fileAttached === 1 && item.files && item.files.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            첨부 이미지 ({item.files.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {item.files.map((file, index) => (
              <div
                key={file.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-sm hover:shadow-lg"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                  <img
                    src={file.fileUrl}
                    alt={file.fileName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                      <ZoomIn className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm text-white truncate" title={file.fileName}>
                    {file.fileName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && item?.files && item.files.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {item.files.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-7xl max-h-[90vh] w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={item.files[currentImageIndex].fileUrl}
              alt={item.files[currentImageIndex].fileName}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <p className="text-white text-lg font-medium">
                {item.files[currentImageIndex].fileName}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                {currentImageIndex + 1} / {item.files.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-center">
        <Link
          to={`/boards/${item.id}/edit`}
          className="btn btn-secondary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          수정
        </Link>
        <button
          onClick={onDelete}
          className="btn btn-danger flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <CommentSection boardId={item.id} />
      </div>
    </div>
  )
}

// Import CommentSection at the top
import CommentSection from '../components/CommentSection'

export default BoardDetail

