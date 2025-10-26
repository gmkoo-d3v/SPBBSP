package com.kosa.board.service;

import com.kosa.board.dto.BoardDTO;
import com.kosa.board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;

    public void save(BoardDTO boardDTO){
        boardRepository.save(boardDTO);
    }

    public List<BoardDTO> findAll(){
        return boardRepository.findAll();
    }
}
