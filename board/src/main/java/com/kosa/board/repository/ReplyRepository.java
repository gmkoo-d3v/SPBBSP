package com.kosa.board.repository;

import com.kosa.board.dto.ReplyDTO;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ReplyRepository {
    private final SqlSessionTemplate sql;

    public void save(ReplyDTO replyDTO) {
        sql.insert("Reply.save", replyDTO);
    }

    public List<ReplyDTO> findAll(Long commentId) {
        return sql.selectList("Reply.findAll", commentId);
    }

    public ReplyDTO findById(Long id) {
        return sql.selectOne("Reply.findById", id);
    }

    public void update(ReplyDTO replyDTO) {
        sql.update("Reply.update", replyDTO);
    }

    public void delete(Long id) {
        sql.delete("Reply.delete", id);
    }
}
