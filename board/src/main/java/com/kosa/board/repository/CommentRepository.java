package com.kosa.board.repository;

import com.kosa.board.dto.CommentDTO;
import com.kosa.board.dto.CommentWithRepliesDTO;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CommentRepository {
    private final SqlSessionTemplate sql;

    public void save(CommentDTO commentDTO) {
        sql.insert("Comment.save", commentDTO);
    }

    public List<CommentDTO> findAll(Long boardId) {
        return sql.selectList("Comment.findAll", boardId);
    }

    public CommentDTO findById(Long id) {
        return sql.selectOne("Comment.findById", id);
    }

    public void update(CommentDTO commentDTO) {
        sql.update("Comment.update", commentDTO);
    }

    public void delete(Long id) {
        sql.delete("Comment.delete", id);
    }

    /**
     * N+1 문제 해결: 댓글 + 대댓글을 한번에 조회
     */
    public List<CommentWithRepliesDTO> findAllWithReplies(Long boardId) {
        return sql.selectList("Comment.findAllWithReplies", boardId);
    }
}
