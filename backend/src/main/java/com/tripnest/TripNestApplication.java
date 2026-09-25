package com.tripnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * TripNest Backend Application
 * Tech Stack:
 * - Java 21 LTS
 * - Spring Boot 3.3.4
 * - Spring Security with JWT & Google OAuth2 Login
 * - Spring Data JPA
 * - PostgreSQL ('tripnest' database)
 */
@SpringBootApplication
public class TripNestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TripNestApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" TripNest Spring Boot API is successfully running!");
        System.out.println(" Port: 8080 | Java 21 | Spring Security | PostgreSQL");
        System.out.println("=================================================");
    }
}
