package com.kosa.board.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BoardUpdateRequest {
    // Optional on update
    @Size(max = 50, message = "Writer must be 50 characters or fewer")
    private String boardWriter;

    // Optional on update
    @Size(max = 100, message = "Password must be 100 characters or fewer")
    private String boardPass;

    // Required on update
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be 200 characters or fewer")
    private String boardTitle;

    // Required on update
    @NotBlank(message = "Contents are required")
    private String boardContents;

    public String getBoardWriter() { return boardWriter; }
    public String getBoardPass() { return boardPass; }
    public String getBoardTitle() { return boardTitle; }
    public String getBoardContents() { return boardContents; }
}

