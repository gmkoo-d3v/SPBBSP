package com.kosa.board.api.controller;

import com.kosa.board.api.dto.ApiResponse;
import com.kosa.board.api.dto.CommentRequest;
import com.kosa.board.api.dto.CommentResponse;
import com.kosa.board.dto.CommentDTO;
import com.kosa.board.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentApiController {

    private final CommentService commentService;

    @GetMapping("/boards/{boardId}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> list(@PathVariable Long boardId) {
        List<CommentResponse> result = commentService.findAll(boardId).stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/boards/{boardId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> create(@PathVariable Long boardId,
                                                               @Valid @RequestBody CommentRequest request) {
        CommentDTO dto = new CommentDTO();
        dto.setBoardId(boardId);
        dto.setCommentWriter(request.getCommentWriter());
        dto.setCommentContents(request.getCommentContents());
        Long id = commentService.save(dto);
        CommentDTO created = commentService.findByIdOrThrow(id);
        return ResponseEntity.ok(ApiResponse.success("Comment created", CommentResponse.from(created)));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> update(@PathVariable Long id,
                                                               @Valid @RequestBody CommentRequest request) {
        CommentDTO existing = commentService.findByIdOrThrow(id);
        existing.setCommentWriter(request.getCommentWriter());
        existing.setCommentContents(request.getCommentContents());
        commentService.update(existing);
        CommentDTO updated = commentService.findByIdOrThrow(id);
        return ResponseEntity.ok(ApiResponse.success("Comment updated", CommentResponse.from(updated)));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        commentService.findByIdOrThrow(id);
        commentService.delete(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Comment deleted"));
    }
}
