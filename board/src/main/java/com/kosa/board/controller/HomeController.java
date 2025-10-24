package com.kosa.board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Collections;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        System.out.println("HomeController.index");
        return "index";
    }

}
