package com.kosa.board.service;

import com.kosa.board.dto.CommentDTO;
import com.kosa.board.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;

    public void save(CommentDTO commentDTO) {
        commentRepository.save(commentDTO);
    }

    public List<CommentDTO> findAll(Long boardId) {
        return commentRepository.findAll(boardId);
    }

    public CommentDTO findById(Long id) {
        return commentRepository.findById(id);
    }

    public void update(CommentDTO commentDTO) {
        commentRepository.update(commentDTO);
    }

    public void delete(Long id) {
        commentRepository.delete(id);
    }
}
