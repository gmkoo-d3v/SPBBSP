package com.kosa.board.config;

import com.kosa.board.dto.UserDTO;
import com.kosa.board.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // admin 계정이 없으면 생성 (민감정보 미노출)
        if (!userService.checkDuplicate("admin")) {
            UserDTO admin = new UserDTO();
            admin.setUsername("admin");
            admin.setPassword("1234");
            admin.setEmail("admin@example.com");
            admin.setRole("ROLE_ADMIN");
            userService.save(admin);
            log.info("Default admin user created: username=admin");
        }
    }
}
