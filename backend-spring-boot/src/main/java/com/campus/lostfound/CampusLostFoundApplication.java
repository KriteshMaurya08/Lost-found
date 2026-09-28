package com.campus.lostfound;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application entry point for Campus Lost and Found Management System.
 * Architecture: Controller -> Service -> Direct JDBC Repository -> MySQL
 */
@SpringBootApplication
public class CampusLostFoundApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusLostFoundApplication.class, args);
        System.out.println("=================================================");
        System.out.println("Campus Lost & Found Spring Boot Backend Started!");
        System.out.println("Port: 8080 | JDBC Driver: com.mysql.cj.jdbc.Driver");
        System.out.println("=================================================");
    }
}
