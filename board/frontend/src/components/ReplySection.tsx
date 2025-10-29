import React, { useCallback, useMemo, useState } from 'react'
import { useReply } from '../hooks/useReply'
import Spinner from './Spinner'

interface ReplySectionProps {
  commentId: number
}

const ReplySection: React.FC<ReplySectionProps> = ({ commentId }) => {
  const { replies, loading, error, visible, toggle, add, remove } = useReply({ commentId })
  const [writer, setWriter] = useState('')
  const [contents, setContents] = useState('')

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await add({ replyWriter: writer, replyContents: contents })
      setWriter('')
      setContents('')
    },
    [add, writer, contents]
  )

  const list = useMemo(() => replies, [replies])

  return (
    <div className="mt-3">
      <div className="d-flex gap-3">
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={toggle}>
          {visible ? '답글 접기' : '답글 보기'}
        </button>
      </div>

      {visible && (
        <div className="reply-section mt-3">
          <div className="reply-form card card-body mb-3" style={{ display: 'block' }}>
            <h6 className="mb-2"><i className="bi bi-reply-fill" /> 답글 작성</h6>
            <form onSubmit={onSubmit}>
              <div className="mb-2">
                <input className="form-control form-control-sm" placeholder="작성자" value={writer} onChange={(e) => setWriter(e.target.value)} required />
              </div>
              <div className="mb-2">
                <textarea className="form-control form-control-sm" rows={2} placeholder="답글 내용" value={contents} onChange={(e) => setContents(e.target.value)} required />
              </div>
              <button disabled={loading} className="btn btn-success btn-sm" type="submit">
                {loading ? <Spinner small text="등록 중" /> : <><i className="bi bi-send" /> 답글 등록</>}
              </button>
            </form>
          </div>

          {loading && list.length === 0 ? (
            <div className="text-center text-muted py-3"><Spinner text="로딩 중" /></div>
          ) : error ? (
            <div className="text-danger">{error}</div>
          ) : list.length === 0 ? (
            <div className="text-muted">답글이 없습니다</div>
          ) : (
            list.map((reply) => (
              <div className="reply-item" key={reply.id}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span className="reply-author"><i className="bi bi-arrow-return-right" /> {reply.replyWriter}</span>
                    <span className="comment-date ms-2"><i className="bi bi-clock" /> {reply.createdAt}</span>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(reply.id)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
                <div>{reply.replyContents}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ReplySection

