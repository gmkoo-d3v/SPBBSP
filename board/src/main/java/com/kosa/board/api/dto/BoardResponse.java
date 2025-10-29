package com.kosa.board.api.dto;

import com.kosa.board.dto.BoardDTO;
import com.kosa.board.dto.BoardFileDTO;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class BoardResponse {
    private final Long id;
    private final String boardWriter;
    private final String boardTitle;
    private final String boardContents;
    private final int boardHits;
    private final String createdAt;
    private final int fileAttached;
    private final List<BoardFileInfo> files;

    private BoardResponse(Long id,
                          String boardWriter,
                          String boardTitle,
                          String boardContents,
                          int boardHits,
                          String createdAt,
                          int fileAttached,
                          List<BoardFileInfo> files) {
        this.id = id;
        this.boardWriter = boardWriter;
        this.boardTitle = boardTitle;
        this.boardContents = boardContents;
        this.boardHits = boardHits;
        this.createdAt = createdAt;
        this.fileAttached = fileAttached;
        this.files = files != null ? Collections.unmodifiableList(new ArrayList<>(files)) : Collections.emptyList();
    }

    public static BoardResponse from(BoardDTO boardDTO) {
        if (boardDTO == null) {
            return null;
        }
        return new BoardResponse(
                boardDTO.getId(),
                boardDTO.getBoardWriter(),
                boardDTO.getBoardTitle(),
                boardDTO.getBoardContents(),
                boardDTO.getBoardHits(),
                boardDTO.getCreatedAt(),
                boardDTO.getFileAttached(),
                null
        );
    }

    public static BoardResponse of(BoardDTO boardDTO, List<BoardFileDTO> fileDTOs) {
        if (boardDTO == null) {
            return null;
        }
        List<BoardFileInfo> mapped = fileDTOs == null ? Collections.emptyList()
                : fileDTOs.stream().map(BoardFileInfo::from).collect(Collectors.toList());
        return new BoardResponse(
                boardDTO.getId(),
                boardDTO.getBoardWriter(),
                boardDTO.getBoardTitle(),
                boardDTO.getBoardContents(),
                boardDTO.getBoardHits(),
                boardDTO.getCreatedAt(),
                boardDTO.getFileAttached(),
                mapped
        );
    }

    public Long getId() { return id; }
    public String getBoardWriter() { return boardWriter; }
    public String getBoardTitle() { return boardTitle; }
    public String getBoardContents() { return boardContents; }
    public int getBoardHits() { return boardHits; }
    public String getCreatedAt() { return createdAt; }
    public int getFileAttached() { return fileAttached; }
    public List<BoardFileInfo> getFiles() { return files; }
}
