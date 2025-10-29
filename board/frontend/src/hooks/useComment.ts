import { useCallback, useEffect, useMemo, useState } from 'react'
import { commentApi, replyApi } from '../services/commentService'
import type { CommentDTO } from '../types'

interface UseCommentOptions {
  boardId: number
}

interface UseCommentResult {
  comments: CommentDTO[]
  loading: boolean
  error: string | null
  counts: Record<number, number>
  refresh: () => Promise<void>
  add: (input: { commentWriter: string; commentContents: string }) => Promise<void>
  remove: (commentId: number) => Promise<void>
}

export function useComment({ boardId }: UseCommentOptions): UseCommentResult {
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCounts = useCallback(async (commentIds: number[]) => {
    try {
      // 병렬로 대댓글 목록을 불러와서 갯수만 추려 저장
      const results = await Promise.all(
        commentIds.map(async (id) => {
          try {
            const res = await replyApi.list(id)
            const list = Array.isArray(res.data) ? res.data : res.data?.data
            return { id, count: Array.isArray(list) ? list.length : 0 }
          } catch {
            return { id, count: 0 }
          }
        })
      )
      setCounts(results.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.count }), {}))
    } catch {
      // counts는 실패해도 전체 기능에는 영향 없도록 무시
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await commentApi.list(boardId)
      const list: CommentDTO[] = Array.isArray(res.data) ? res.data : res.data?.data
      setComments(list || [])
      if (list && list.length) {
        await loadCounts(list.map((c) => c.id))
      } else {
        setCounts({})
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '댓글을 불러오지 못했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [boardId, loadCounts])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback(
    async (input: { commentWriter: string; commentContents: string }) => {
      const { commentWriter, commentContents } = input
      if (!commentWriter?.trim() || !commentContents?.trim()) {
        window.Swal?.fire({ icon: 'warning', title: '입력 오류', text: '작성자와 내용을 입력해주세요.' })
        return
      }
      try {
        setLoading(true)
        await commentApi.save({ boardId, commentWriter: commentWriter.trim(), commentContents: commentContents.trim() })
        window.Swal?.fire({ icon: 'success', title: '댓글이 등록되었습니다', timer: 1200, showConfirmButton: false })
        await refresh()
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : '댓글 등록 실패'
        window.Swal?.fire({ icon: 'error', title: '오류', text: message })
      } finally {
        setLoading(false)
      }
    },
    [boardId, refresh]
  )

  const remove = useCallback(
    async (commentId: number) => {
      const result = await window.Swal?.fire({
        title: '댓글을 삭제하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        confirmButtonColor: '#ff6b6b',
      })
      if (!result?.isConfirmed) return

      try {
        setLoading(true)
        await commentApi.delete(commentId, boardId)
        window.Swal?.fire({ icon: 'success', title: '댓글이 삭제되었습니다', timer: 1200, showConfirmButton: false })
        await refresh()
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : '댓글 삭제 실패'
        window.Swal?.fire({ icon: 'error', title: '오류', text: message })
      } finally {
        setLoading(false)
      }
    },
    [boardId, refresh]
  )

  return useMemo(
    () => ({ comments, loading, error, counts, refresh, add, remove }),
    [comments, loading, error, counts, refresh, add, remove]
  )
}
