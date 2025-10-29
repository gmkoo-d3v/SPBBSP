package com.kosa.board.service;

import com.kosa.board.api.exception.ResourceNotFoundException;
import com.kosa.board.dto.ReplyDTO;
import com.kosa.board.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReplyService {
    private final ReplyRepository replyRepository;

    @Transactional(propagation = Propagation.REQUIRED)
    public Long save(ReplyDTO replyDTO) {
        replyRepository.save(replyDTO);
        return replyDTO.getId();
    }

    public List<ReplyDTO> findAll(Long commentId) {
        return replyRepository.findAll(commentId);
    }

    public ReplyDTO findById(Long id) {
        return replyRepository.findById(id);
    }

    public ReplyDTO findByIdOrThrow(Long id) {
        ReplyDTO dto = findById(id);
        if (dto == null) {
            throw new ResourceNotFoundException("Reply not found with id " + id);
        }
        return dto;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void update(ReplyDTO replyDTO) {
        replyRepository.update(replyDTO);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void delete(Long id) {
        replyRepository.delete(id);
    }
}
