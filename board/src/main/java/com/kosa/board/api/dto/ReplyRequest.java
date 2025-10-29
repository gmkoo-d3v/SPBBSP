package com.kosa.board.api.dto;

import jakarta.validation.constraints.NotBlank;

public class ReplyRequest {
    @NotBlank
    private String replyWriter;
    @NotBlank
    private String replyContents;

    public String getReplyWriter() { return replyWriter; }
    public void setReplyWriter(String replyWriter) { this.replyWriter = replyWriter; }
    public String getReplyContents() { return replyContents; }
    public void setReplyContents(String replyContents) { this.replyContents = replyContents; }
}

