import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { boardApi } from '../services/commentService'
import type { ApiResponse, BoardResponse } from '../types'
import { sanitizeHtml, sanitizeAttribute } from '../utils/sanitize'
import Spinner from './Spinner'
import CommentSection from './CommentSection'

interface BoardDetailProps {
  boardId: number
}

const BoardDetail: React.FC<BoardDetailProps> = ({ boardId }) => {
  const [board, setBoard] = useState<BoardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await boardApi.get(boardId)
      const data = (res.data as ApiResponse<BoardResponse>).data
      setBoard(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '게시글을 불러오지 못했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const onList = useCallback(() => {
    location.href = '/list'
  }, [])

  const onEdit = useCallback(() => {
    location.href = `/update/${boardId}`
  }, [boardId])

  const onDelete = useCallback(async () => {
    const result = await window.Swal?.fire({
      title: '게시글을 삭제하시겠습니까?',
      text: '삭제된 게시글은 복구할 수 없습니다!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-trash"></i> 삭제',
      cancelButtonText: '취소',
    })
    if (result?.isConfirmed) {
      location.href = `/delete/${boardId}`
    }
  }, [boardId])

  const images = useMemo(() => {
    const list = window.__BOARD_FILES__ || []
    return list.map((f) => `/upload/${f.storedFileName}`)
  }, [])

  if (loading && !board) {
    return (
      <div className="container">
        <div className="top-navigation">
          <div className="d-flex justify-content-between align-items-center">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><a href="/list"><i className="bi bi-house-door" /> 홈</a></li>
                <li className="breadcrumb-item"><a href="/list">게시판</a></li>
                <li className="breadcrumb-item active" aria-current="page">게시글 상세</li>
              </ol>
            </nav>
            <button className="btn btn-back" onClick={onList}>
              <i className="bi bi-arrow-left" /> 목록으로
            </button>
          </div>
        </div>
        <div className="detail-container"><Spinner text="로딩 중" /></div>
      </div>
    )
  }

  if (error && !board) {
    return (
      <div className="container">
        <div className="detail-container text-danger">{error}</div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Top Navigation & Breadcrumb */}
      <div className="top-navigation">
        <div className="d-flex justify-content-between align-items-center">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/list"><i className="bi bi-house-door" /> 홈</a></li>
              <li className="breadcrumb-item"><a href="/list">게시판</a></li>
              <li className="breadcrumb-item active" aria-current="page">게시글 상세</li>
            </ol>
          </nav>
          <button className="btn btn-back" onClick={onList}>
            <i className="bi bi-arrow-left" /> 목록으로
          </button>
        </div>
      </div>

      {/* 게시글 상세 */}
      <div className="detail-container">
        <h2 className="detail-title">{sanitizeAttribute(board?.boardTitle || '')}</h2>

        <div className="detail-info">
          <div className="info-item">
            <i className="bi bi-person-fill" />
            <strong>{sanitizeAttribute(board?.boardWriter || '')}</strong>
          </div>
          <div className="info-item">
            <i className="bi bi-calendar-event" />
            <span>{sanitizeAttribute(board?.createdAt || '')}</span>
          </div>
          <div className="info-item">
            <i className="bi bi-eye-fill" />
            <span>조회수 <strong>{board?.boardHits ?? 0}</strong></span>
          </div>
        </div>

        <div
          className="detail-content prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(board?.boardContents || '') }}
        />

        {/* 첨부 이미지 */}
        {board?.fileAttached === 1 && images.length > 0 && (
          <div className="image-gallery">
            <h5 className="mb-3"><i className="bi bi-image" /> 첨부 이미지</h5>
            <div className="row g-3">
              {images.map((src, idx) => (
                <div className="col-md-4" key={idx}>
                  <img src={src} alt="첨부 이미지" className="img-fluid gallery-image" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="action-buttons mt-4">
          <button className="btn btn-action btn-list" onClick={onList}>
            <i className="bi bi-list" /> 목록
          </button>
          <button className="btn btn-action btn-edit" onClick={onEdit}>
            <i className="bi bi-pencil" /> 수정
          </button>
          <button className="btn btn-action btn-delete" onClick={onDelete}>
            <i className="bi bi-trash" /> 삭제
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <CommentSection boardId={boardId} />
    </div>
  )
}

export default BoardDetail
