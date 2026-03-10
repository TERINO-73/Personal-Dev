package com.jesusterino.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class DevPersonalAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevPersonalAppApplication.class, args);
    }
}
