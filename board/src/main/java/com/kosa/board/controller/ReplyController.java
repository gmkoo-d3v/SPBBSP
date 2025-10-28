package com.kosa.board.controller;

import com.kosa.board.dto.ReplyDTO;
import com.kosa.board.service.ReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/reply")
public class ReplyController {
    private final ReplyService replyService;

    @PostMapping("/save")
    @ResponseBody
    public String save(@ModelAttribute ReplyDTO replyDTO) {
        replyService.save(replyDTO);
        return "success";
    }

    @GetMapping("/list/{commentId}")
    @ResponseBody
    public List<ReplyDTO> findAll(@PathVariable Long commentId) {
        return replyService.findAll(commentId);
    }

    @PostMapping("/delete/{id}")
    @ResponseBody
    public String delete(@PathVariable Long id) {
        replyService.delete(id);
        return "success";
    }
}
