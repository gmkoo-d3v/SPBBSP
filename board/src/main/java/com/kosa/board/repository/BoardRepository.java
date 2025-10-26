package com.kosa.board.repository;

import com.kosa.board.dto.BoardDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BoardRepository {

    void save(BoardDTO boardDTO);

    List<BoardDTO> findAll();
}
