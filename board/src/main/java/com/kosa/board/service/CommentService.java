package com.kosa.board.service;

import com.kosa.board.api.exception.ResourceNotFoundException;
import com.kosa.board.dto.CommentDTO;
import com.kosa.board.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {
    private final CommentRepository commentRepository;

    @Transactional(propagation = Propagation.REQUIRED)
    public Long save(CommentDTO commentDTO) {
        commentRepository.save(commentDTO);
        return commentDTO.getId();
    }

    public List<CommentDTO> findAll(Long boardId) {
        return commentRepository.findAll(boardId);
    }

    public CommentDTO findById(Long id) {
        return commentRepository.findById(id);
    }

    public CommentDTO findByIdOrThrow(Long id) {
        CommentDTO dto = findById(id);
        if (dto == null) {
            throw new ResourceNotFoundException("Comment not found with id " + id);
        }
        return dto;
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void update(CommentDTO commentDTO) {
        commentRepository.update(commentDTO);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void delete(Long id) {
        commentRepository.delete(id);
    }
}
