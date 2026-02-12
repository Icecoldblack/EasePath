package com.easepath.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easepath.backend.dto.UserDto;
import com.easepath.backend.model.User;
import com.easepath.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

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

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteUser(HttpServletRequest request) {
        User currentUser = (User) request.getAttribute("currentUser");
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            userService.deleteUser(currentUser.getEmail());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Failed to delete user account for {}", currentUser.getEmail(), e);
            return ResponseEntity.internalServerError().body(null);
        }
    }
}
