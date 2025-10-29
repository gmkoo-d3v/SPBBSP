package com.kosa.board.api.controller;

import com.kosa.board.api.dto.ApiResponse;
import com.kosa.board.api.dto.ReplyRequest;
import com.kosa.board.api.dto.ReplyResponse;
import com.kosa.board.dto.ReplyDTO;
import com.kosa.board.service.ReplyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReplyApiController {

    private final ReplyService replyService;

    @PostMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<ReplyResponse>> create(@PathVariable Long commentId,
                                                             @Valid @RequestBody ReplyRequest request) {
        ReplyDTO dto = new ReplyDTO();
        dto.setCommentId(commentId);
        dto.setReplyWriter(request.getReplyWriter());
        dto.setReplyContents(request.getReplyContents());
        Long id = replyService.save(dto);
        ReplyDTO created = replyService.findByIdOrThrow(id);
        return ResponseEntity.ok(ApiResponse.success("Reply created", ReplyResponse.from(created)));
    }

    @PutMapping("/replies/{id}")
    public ResponseEntity<ApiResponse<ReplyResponse>> update(@PathVariable Long id,
                                                             @Valid @RequestBody ReplyRequest request) {
        ReplyDTO existing = replyService.findByIdOrThrow(id);
        existing.setReplyWriter(request.getReplyWriter());
        existing.setReplyContents(request.getReplyContents());
        replyService.update(existing);
        ReplyDTO updated = replyService.findByIdOrThrow(id);
        return ResponseEntity.ok(ApiResponse.success("Reply updated", ReplyResponse.from(updated)));
    }

    @DeleteMapping("/replies/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        replyService.findByIdOrThrow(id);
        replyService.delete(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Reply deleted"));
    }
}
