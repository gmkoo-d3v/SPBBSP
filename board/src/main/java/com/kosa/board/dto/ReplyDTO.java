package com.kosa.board.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ReplyDTO {
    private Long id;
    private String replyWriter;
    private String replyContents;
    private Long commentId;
    private String createdAt;
}
