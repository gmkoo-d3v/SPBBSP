package com.kosa.board.api.service;

import com.kosa.board.api.dto.FileUploadResponse;
import com.kosa.board.api.exception.FileUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class FileStorageService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(
            List.of("jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx")
    );

    private static final DateTimeFormatter DATE_PREFIX = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    @Value("${file.upload-dir}")
    private String uploadDir;

    public FileUploadResponse store(MultipartFile file) {
        validateFile(file);
        String originalFilename = resolveOriginalFilename(file);
        String storedFileName = buildStoredFileName(originalFilename);
        Path targetPath = resolveTargetPath(storedFileName);
        copyFile(file, targetPath);

        String fileUrl = "/upload/" + storedFileName;
        return FileUploadResponse.success(fileUrl, originalFilename);
    }

    public List<FileUploadResponse> storeAll(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new FileUploadException("No files provided for upload");
        }
        List<FileUploadResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            responses.add(store(file));
        }
        return responses;
    }

    /**
     * 비동기 다중 파일 업로드 처리.
     * - 일부 파일이 실패해도 성공한 파일의 결과는 반환합니다.
     * - 내부적으로 병렬 스트림을 사용하여 개별 파일을 병렬 처리합니다.
     */
    @Async("applicationTaskExecutor")
    public CompletableFuture<List<FileUploadResponse>> storeAllAsync(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return CompletableFuture.failedFuture(new FileUploadException("No files provided for upload"));
        }

        List<FileUploadResponse> results = files
                .parallelStream()
                .map(this::storeSafely)
                .collect(Collectors.toList());

        return CompletableFuture.completedFuture(results);
    }

    private FileUploadResponse storeSafely(MultipartFile file) {
        try {
            return store(file);
        } catch (FileUploadException ex) {
            String name;
            try {
                name = resolveOriginalFilename(file);
            } catch (Exception ignored) {
                name = "unknown";
            }
            // 실패한 파일도 메시지 포함하여 응답에 추가
            return FileUploadResponse.failure("Failed to upload '" + name + "': " + ex.getMessage());
        } catch (Exception ex) {
            String name = file != null ? file.getName() : "unknown";
            return FileUploadResponse.failure("Unexpected error for '" + name + "': " + ex.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileUploadException("File size must be 10MB or less");
        }
        String originalFilename = resolveOriginalFilename(file);
        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase(Locale.ENGLISH))) {
            throw new FileUploadException("Unsupported file type: " + extension);
        }
    }

    private String resolveOriginalFilename(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            originalFilename = file.getName();
        }
        originalFilename = StringUtils.cleanPath(originalFilename);
        if (!StringUtils.hasText(originalFilename)) {
            throw new FileUploadException("Original file name is invalid");
        }
        return originalFilename;
    }

    private String extractExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx == -1 || idx == filename.length() - 1) {
            throw new FileUploadException("File extension is required");
        }
        return filename.substring(idx + 1);
    }

    private String buildStoredFileName(String originalFilename) {
        String extension = extractExtension(originalFilename);
        String baseName = originalFilename.substring(0, originalFilename.length() - extension.length() - 1)
                .replaceAll("\\s+", "_");
        String timestamp = DATE_PREFIX.format(LocalDateTime.now());
        String randomSuffix = UUID.randomUUID().toString().replace("-", "");
        return timestamp + "_" + randomSuffix + "_" + baseName + "." + extension;
    }

    private Path resolveTargetPath(String storedFileName) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new FileUploadException("Could not create upload directory");
        }
        return uploadPath.resolve(storedFileName);
    }

    private void copyFile(MultipartFile file, Path destination) {
        try {
            file.transferTo(destination.toFile());
        } catch (IOException e) {
            throw new FileUploadException("Failed to store file");
        }
    }
}
