package com.kosa.board.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileUploadResponse {
    private final boolean success;
    private final String fileUrl;
    private final String fileName;
    private final String message;

    private FileUploadResponse(boolean success, String fileUrl, String fileName, String message) {
        this.success = success;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.message = message;
    }

    public static FileUploadResponse success(String fileUrl, String fileName) {
        return new FileUploadResponse(true, fileUrl, fileName, null);
    }

    public static FileUploadResponse failure(String message) {
        return new FileUploadResponse(false, null, null, message);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public String getMessage() {
        return message;
    }
}
