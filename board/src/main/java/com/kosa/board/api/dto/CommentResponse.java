package com.kosa.board.api.dto;

import com.kosa.board.dto.CommentDTO;

public class CommentResponse {
    private Long id;
    private String commentWriter;
    private String commentContents;
    private Long boardId;
    private String createdAt;

    public static CommentResponse from(CommentDTO dto) {
        CommentResponse r = new CommentResponse();
        r.id = dto.getId();
        r.commentWriter = dto.getCommentWriter();
        r.commentContents = dto.getCommentContents();
        r.boardId = dto.getBoardId();
        r.createdAt = dto.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getCommentWriter() { return commentWriter; }
    public String getCommentContents() { return commentContents; }
    public Long getBoardId() { return boardId; }
    public String getCreatedAt() { return createdAt; }
}

