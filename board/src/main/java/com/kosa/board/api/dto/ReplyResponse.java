package com.kosa.board.api.dto;

import com.kosa.board.dto.ReplyDTO;

public class ReplyResponse {
    private Long id;
    private String replyWriter;
    private String replyContents;
    private Long commentId;
    private String createdAt;

    public static ReplyResponse from(ReplyDTO dto) {
        ReplyResponse r = new ReplyResponse();
        r.id = dto.getId();
        r.replyWriter = dto.getReplyWriter();
        r.replyContents = dto.getReplyContents();
        r.commentId = dto.getCommentId();
        r.createdAt = dto.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getReplyWriter() { return replyWriter; }
    public String getReplyContents() { return replyContents; }
    public Long getCommentId() { return commentId; }
    public String getCreatedAt() { return createdAt; }
}

