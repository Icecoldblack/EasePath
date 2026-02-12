package com.easepath.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EasePathApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasePathApplication.class, args);
    }
}
