package com.kosa.board.repository;

import com.kosa.board.dto.BoardDTO;
import com.kosa.board.dto.BoardFileDTO;
import com.kosa.board.dto.BoardWithDetailsDTO;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.annotations.Mapper;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class BoardRepository {
    private final SqlSessionTemplate sql;

    public BoardDTO save(BoardDTO boardDTO) {
        sql.insert("Board.save", boardDTO);
        return boardDTO;
    }


    public List<BoardDTO> findAll(){
        return sql.selectList("Board.findAll");
    }

    public void updateHits(Long id){
        sql.update("Board.updateHits", id);
    }

    public BoardDTO findById(Long id){
        return sql.selectOne("Board.findById",id);
    }

    public void update(BoardDTO boardDTO) {
        sql.update("Board.update",boardDTO);
    }

    public void delete(Long id) {
        sql.delete("Board.delete",id);
    }

    public void saveFile(BoardFileDTO boardFileDTO) {
        sql.insert("Board.saveFile", boardFileDTO);
    }

    public List<BoardFileDTO> findFile(Long id) {
        return sql.selectList("Board.findFile", id);
    }

    /**
     * N+1 문제 해결: 게시글 목록 조회 (파일 정보 포함)
     */
    public List<BoardDTO> findAllWithFiles() {
        return sql.selectList("Board.findAllWithFiles");
    }

    /**
     * N+1 문제 해결: 게시글 상세 조회 (파일 + 댓글 + 대댓글 포함)
     * - 단일 쿼리로 모든 관련 데이터를 조회
     */
    public BoardWithDetailsDTO findByIdWithDetails(Long id) {
        return sql.selectOne("Board.findByIdWithDetails", id);
    }
}
