package com.kosa.board.api.dto;

import com.kosa.board.dto.BoardFileDTO;

public class BoardFileInfo {
    private final Long id;
    private final String fileName;       // original file name
    private final String storedFileName; // stored name on server
    private final String fileUrl;        // resolved URL for download/view

    public BoardFileInfo(Long id, String fileName, String storedFileName, String fileUrl) {
        this.id = id;
        this.fileName = fileName;
        this.storedFileName = storedFileName;
        this.fileUrl = fileUrl;
    }

    public static BoardFileInfo from(BoardFileDTO dto) {
        if (dto == null) return null;
        String stored = dto.getStoredFileName();
        String url = stored != null ? "/upload/" + stored : null;
        return new BoardFileInfo(dto.getId(), dto.getOriginalFileName(), stored, url);
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getStoredFileName() { return storedFileName; }
    public String getFileUrl() { return fileUrl; }
}
