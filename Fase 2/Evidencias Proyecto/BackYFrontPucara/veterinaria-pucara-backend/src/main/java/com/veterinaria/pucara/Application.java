package com.veterinaria.pucara;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.veterinaria.pucara.repository")
@EnableScheduling // Habilitar tareas programadas para recordatorios de WhatsApp
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
