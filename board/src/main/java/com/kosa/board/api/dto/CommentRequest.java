package com.kosa.board.api.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {
    @NotBlank
    private String commentWriter;
    @NotBlank
    private String commentContents;

    public String getCommentWriter() { return commentWriter; }
    public void setCommentWriter(String commentWriter) { this.commentWriter = commentWriter; }
    public String getCommentContents() { return commentContents; }
    public void setCommentContents(String commentContents) { this.commentContents = commentContents; }
}

