import { useCallback, useMemo, useState } from 'react'
import { replyApi } from '../services/commentService'
import type { ReplyDTO } from '../types'

interface UseReplyOptions {
  commentId: number
}

interface UseReplyResult {
  replies: ReplyDTO[]
  loading: boolean
  error: string | null
  visible: boolean
  toggle: () => void
  refresh: () => Promise<void>
  add: (input: { replyWriter: string; replyContents: string }) => Promise<void>
  remove: (replyId: number) => Promise<void>
}

export function useReply({ commentId }: UseReplyOptions): UseReplyResult {
  const [replies, setReplies] = useState<ReplyDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await replyApi.list(commentId)
      const list: ReplyDTO[] = Array.isArray(res.data) ? res.data : res.data?.data
      setReplies(list || [])
    } catch (e: any) {
      setError(e?.message || '답글을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [commentId])

  const toggle = useCallback(() => {
    setVisible((v) => !v)
    if (!visible) {
      // 열릴 때 불러오기
      refresh()
    }
  }, [visible, refresh])

  const add = useCallback(
    async (input: { replyWriter: string; replyContents: string }) => {
      const { replyWriter, replyContents } = input
      if (!replyWriter?.trim() || !replyContents?.trim()) {
        window.Swal?.fire({ icon: 'warning', title: '입력 오류', text: '작성자와 내용을 입력해주세요.' })
        return
      }
      try {
        setLoading(true)
        await replyApi.save({ commentId, replyWriter: replyWriter.trim(), replyContents: replyContents.trim() })
        window.Swal?.fire({ icon: 'success', title: '답글이 등록되었습니다', timer: 1200, showConfirmButton: false })
        await refresh()
      } catch (e: any) {
        window.Swal?.fire({ icon: 'error', title: '오류', text: e?.message || '답글 등록 실패' })
      } finally {
        setLoading(false)
      }
    },
    [commentId, refresh]
  )

  const remove = useCallback(
    async (replyId: number) => {
      const result = await window.Swal?.fire({
        title: '답글을 삭제하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        confirmButtonColor: '#ff6b6b',
      })
      if (!result?.isConfirmed) return
      try {
        setLoading(true)
        await replyApi.delete(replyId)
        window.Swal?.fire({ icon: 'success', title: '답글이 삭제되었습니다', timer: 1200, showConfirmButton: false })
        await refresh()
      } catch (e: any) {
        window.Swal?.fire({ icon: 'error', title: '오류', text: e?.message || '답글 삭제 실패' })
      } finally {
        setLoading(false)
      }
    },
    [refresh]
  )

  return useMemo(
    () => ({ replies, loading, error, visible, toggle, refresh, add, remove }),
    [replies, loading, error, visible, toggle, refresh, add, remove]
  )
}

