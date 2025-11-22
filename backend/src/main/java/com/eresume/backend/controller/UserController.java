package com.eresume.backend.controller;

import com.eresume.backend.dto.UserDto;
import com.eresume.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.createUser(userDto));
    }

    @GetMapping("/sample")
    public ResponseEntity<UserDto> getSampleUser() {
        return ResponseEntity.ok(userService.getSampleUser());
    }
}
