package com.kosa.board.exception;

import com.kosa.board.api.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice(basePackages = "com.kosa.board")
public class GlobalExceptionHandler {

    @ExceptionHandler(com.kosa.board.api.exception.ApiException.class)
    public ResponseEntity<ApiResponse<com.kosa.board.api.dto.ErrorResponse>> handleApiExceptions(com.kosa.board.api.exception.ApiException ex) {
        HttpStatus status = ex.getStatus();
        String code = status != null ? status.name() : "API_ERROR";
        return ResponseEntity.status(status != null ? status : HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure("API error", new com.kosa.board.api.dto.ErrorResponse(code, ex.getMessage())));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<com.kosa.board.api.dto.ErrorResponse>> handleBusiness(BusinessException ex) {
        HttpStatus status = ex.getStatus() != null ? ex.getStatus() : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status)
                .body(ApiResponse.failure("Business error", new com.kosa.board.api.dto.ErrorResponse("BUSINESS_ERROR", ex.getMessage())));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<com.kosa.board.api.dto.ErrorResponse>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.failure("Unauthorized", new com.kosa.board.api.dto.ErrorResponse("UNAUTHORIZED", ex.getMessage())));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> validationErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure("Validation failed", validationErrors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.failure("Request body is invalid or malformed"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUpload(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.failure("Uploaded files exceed the maximum allowed size"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.failure("An unexpected error occurred"));
    }
}
