package com.kosa.board.controller;

import com.kosa.board.dto.CommentDTO;
import com.kosa.board.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/comment")
public class CommentController {
    private final CommentService commentService;

    @PostMapping("/save")
    public String save(@ModelAttribute CommentDTO commentDTO) {
        commentService.save(commentDTO);
        return "redirect:/" + commentDTO.getBoardId();
    }

    @GetMapping("/list/{boardId}")
    @ResponseBody
    public List<CommentDTO> findAll(@PathVariable Long boardId) {
        return commentService.findAll(boardId);
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id, @RequestParam Long boardId) {
        commentService.delete(id);
        return "redirect:/" + boardId;
    }
}
