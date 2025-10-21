package com.bookaro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class BookaroApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(BookaroApplication.class);
        
        // Startup optimization
        app.setLazyInitialization(true);
        
        app.run(args);
    }
}

