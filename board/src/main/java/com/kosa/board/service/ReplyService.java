package com.kosa.board.service;

import com.kosa.board.dto.ReplyDTO;
import com.kosa.board.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReplyService {
    private final ReplyRepository replyRepository;

    public void save(ReplyDTO replyDTO) {
        replyRepository.save(replyDTO);
    }

    public List<ReplyDTO> findAll(Long commentId) {
        return replyRepository.findAll(commentId);
    }

    public ReplyDTO findById(Long id) {
        return replyRepository.findById(id);
    }

    public void update(ReplyDTO replyDTO) {
        replyRepository.update(replyDTO);
    }

    public void delete(Long id) {
        replyRepository.delete(id);
    }
}
