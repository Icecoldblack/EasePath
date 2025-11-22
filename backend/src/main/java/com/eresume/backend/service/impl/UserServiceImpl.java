package com.eresume.backend.service.impl;

import com.eresume.backend.dto.UserDto;
import com.eresume.backend.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Override
    public UserDto createUser(UserDto user) {
        // TODO: replace with real persistence later
        user.setId(1L);
        return user;
    }

    @Override
    public UserDto getSampleUser() {
        return new UserDto(1L, "Sample User", "sample@eresume.app");
    }
}
