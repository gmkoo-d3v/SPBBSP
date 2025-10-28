package com.kosa.board.controller;

import com.kosa.board.dto.UserDTO;
import com.kosa.board.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                            @RequestParam(value = "logout", required = false) String logout,
                            Model model) {
        if (error != null) {
            model.addAttribute("error", "아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        if (logout != null) {
            model.addAttribute("message", "로그아웃되었습니다.");
        }
        return "login";
    }

    @GetMapping("/signup")
    public String signupPage() {
        return "signup";
    }

    @PostMapping("/signup")
    public String signup(@ModelAttribute UserDTO userDTO, Model model) {
        // 중복 체크
        if (userService.checkDuplicate(userDTO.getUsername())) {
            model.addAttribute("error", "이미 존재하는 사용자 이름입니다.");
            return "signup";
        }

        // role 설정 (기본값은 ROLE_USER)
        if (userDTO.getRole() == null || userDTO.getRole().isEmpty()) {
            userDTO.setRole("ROLE_USER");
        }

        userService.save(userDTO);
        return "redirect:/login";
    }
}
