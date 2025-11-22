package com.eresume.backend.service;

import com.eresume.backend.dto.UserDto;

public interface UserService {

    UserDto createUser(UserDto user);

    UserDto getSampleUser();
}
