package com.kosa.board.api.controller;

import com.kosa.board.api.dto.ApiResponse;
import com.kosa.board.api.dto.BoardRequest;
import com.kosa.board.api.dto.BoardResponse;
import com.kosa.board.api.dto.BoardUpdateRequest;
import com.kosa.board.api.service.BoardApiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardApiController {

    private final BoardApiService boardApiService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BoardResponse>>> getBoards() {
        List<BoardResponse> boards = boardApiService.getAllBoards();
        return ResponseEntity.ok(ApiResponse.success(boards));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BoardResponse>> getBoard(@PathVariable Long id) {
        BoardResponse board = boardApiService.getBoard(id);
        return ResponseEntity.ok(ApiResponse.success(board));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BoardResponse>> createBoard(@Valid @RequestBody BoardRequest request) {
        BoardResponse created = boardApiService.createBoard(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Board created successfully", created));
    }

    @PostMapping(value = "/with-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BoardResponse>> createBoardWithFiles(
            @RequestPart("board") String boardJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            BoardRequest request = objectMapper.readValue(boardJson, BoardRequest.class);
            BoardResponse created = boardApiService.createBoard(request, files);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Board created successfully with files", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.failure("Failed to create board: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BoardResponse>> updateBoard(@PathVariable Long id,
                                                                  @Valid @RequestBody BoardUpdateRequest request) {
        BoardResponse updated = boardApiService.updateBoard(id, request);
        return ResponseEntity.ok(ApiResponse.success("Board updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(@PathVariable Long id) {
        boardApiService.deleteBoard(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Board deleted successfully"));
    }
}
