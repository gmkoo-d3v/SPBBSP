package com.kosa.board.api.controller;

import com.kosa.board.api.dto.ApiResponse;
import com.kosa.board.api.dto.FileUploadResponse;
import com.kosa.board.api.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.springframework.web.context.request.async.WebAsyncTask;

@RestController
@RequestMapping("/api/files")
@Validated
@RequiredArgsConstructor
public class FileUploadApiController {

    private final FileStorageService fileStorageService;
    @Value("${app.upload.async-timeout-ms:30000}")
    private long asyncTimeoutMs;

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        FileUploadResponse response = fileStorageService.store(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-multiple")
    public WebAsyncTask<ResponseEntity<ApiResponse<List<FileUploadResponse>>>> uploadMultiple(@RequestParam("files") List<MultipartFile> files) {
        WebAsyncTask<ResponseEntity<ApiResponse<List<FileUploadResponse>>>> task = new WebAsyncTask<>(asyncTimeoutMs, () -> {
            CompletableFuture<List<FileUploadResponse>> future = fileStorageService.storeAllAsync(files);
            List<FileUploadResponse> responses = future.join();
            return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", responses));
        });

        task.onTimeout(() -> ResponseEntity.status(503)
                .body(ApiResponse.failure("Upload timed out. Please try again.")));

        return task;
    }
}
