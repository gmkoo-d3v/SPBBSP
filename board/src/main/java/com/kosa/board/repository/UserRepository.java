package com.kosa.board.repository;

import com.kosa.board.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserRepository {
    private final SqlSessionTemplate sql;

    public void save(UserDTO userDTO) {
        sql.insert("User.save", userDTO);
    }

    public UserDTO findByUsername(String username) {
        return sql.selectOne("User.findByUsername", username);
    }

    public UserDTO findById(Long id) {
        return sql.selectOne("User.findById", id);
    }

    public List<UserDTO> findAll() {
        return sql.selectList("User.findAll");
    }

    public void update(UserDTO userDTO) {
        sql.update("User.update", userDTO);
    }

    public void delete(Long id) {
        sql.delete("User.delete", id);
    }
}
