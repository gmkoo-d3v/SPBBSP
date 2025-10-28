package com.kosa.board.service;

import com.kosa.board.dto.UserDTO;
import com.kosa.board.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void save(UserDTO userDTO) {
        // 비밀번호 암호화
        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        userDTO.setEnabled(true);

        // role이 없으면 기본값 설정
        if (userDTO.getRole() == null || userDTO.getRole().isEmpty()) {
            userDTO.setRole("ROLE_USER");
        }

        userRepository.save(userDTO);
    }

    public UserDTO findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public UserDTO findById(Long id) {
        return userRepository.findById(id);
    }

    public List<UserDTO> findAll() {
        return userRepository.findAll();
    }

    public void update(UserDTO userDTO) {
        userRepository.update(userDTO);
    }

    public void delete(Long id) {
        userRepository.delete(id);
    }

    public boolean checkDuplicate(String username) {
        UserDTO user = userRepository.findByUsername(username);
        return user != null;
    }
}
