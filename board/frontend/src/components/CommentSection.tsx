import React, { useCallback, useMemo, useState } from 'react'
import { useComment } from '../hooks/useComment'
import Spinner from './Spinner'
import ReplySection from './ReplySection'

interface CommentSectionProps {
  boardId: number
}

const CommentSection: React.FC<CommentSectionProps> = ({ boardId }) => {
  const { comments, counts, loading, error, add, remove } = useComment({ boardId })
  const [writer, setWriter] = useState('')
  const [contents, setContents] = useState('')

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await add({ commentWriter: writer, commentContents: contents })
      setWriter('')
      setContents('')
    },
    [add, writer, contents]
  )

  const list = useMemo(() => comments, [comments])

  return (
    <div className="comment-section">
      <div className="comment-header">
        <i className="bi bi-chat-left-text" />
        <span>댓글 (<span>{list.length}</span>)</span>
      </div>

      <div className="comment-form-card">
        <h6 className="mb-3"><i className="bi bi-pencil-square" /> 댓글 작성</h6>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <input className="form-control" placeholder="작성자" value={writer} onChange={(e) => setWriter(e.target.value)} required />
          </div>
          <div className="mb-3">
            <textarea className="form-control" rows={3} placeholder="댓글 내용을 입력하세요" value={contents} onChange={(e) => setContents(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-comment" disabled={loading}>
            {loading ? <Spinner text="등록 중" /> : (<><i className="bi bi-send" /> 댓글 등록</>)}
          </button>
        </form>
      </div>

      {loading && list.length === 0 ? (
        <div className="text-center text-muted py-5"><Spinner text="로딩 중" /></div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : list.length === 0 ? (
        <div className="text-center text-muted py-5"><i className="bi bi-chat-dots" style={{ fontSize: '3rem' }} />
          <p className="mt-3">댓글이 없습니다</p>
        </div>
      ) : (
        <div id="comment-list-area">
          {list.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="comment-author"><i className="bi bi-person-circle" /> {comment.commentWriter}</span>
                  <span className="comment-date ms-2"><i className="bi bi-clock" /> {comment.createdAt}</span>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(comment.id)}>
                  <i className="bi bi-trash" /> 삭제
                </button>
              </div>
              <div className="comment-content">{comment.commentContents}</div>

              <div className="mt-3 d-flex gap-3">
                <span className="reply-toggle" onClick={(e) => e.preventDefault()}>
                  <i className="bi bi-chat-dots" /> 답글 (<span>{counts[comment.id] ?? 0}</span>)
                </span>
              </div>

              <ReplySection commentId={comment.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection

