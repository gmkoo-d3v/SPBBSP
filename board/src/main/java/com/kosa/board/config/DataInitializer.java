package com.kosa.board.config;

import com.kosa.board.dto.UserDTO;
import com.kosa.board.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserService userService;

    @Override
    public void run(String... args) throws Exception {
        // admin 계정이 없으면 생성
        if (!userService.checkDuplicate("admin")) {
            UserDTO admin = new UserDTO();
            admin.setUsername("admin");
            admin.setPassword("1234");
            admin.setEmail("admin@example.com");
            admin.setRole("ROLE_ADMIN");
            userService.save(admin);
            System.out.println("Admin user created: username=admin, password=1234");
        }
    }
}
