package com.veterinaria.pucara.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
            
            @Override
            public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                // Configurar ruta para servir archivos estáticos de servicios
                registry.addResourceHandler("/assets/servicios/**")
                        .addResourceLocations("file:src/main/resources/static/assets/servicios/",
                                              "classpath:/static/assets/servicios/");
                // Configurar ruta para servir archivos estáticos de productos
                registry.addResourceHandler("/assets/productos/**")
                        .addResourceLocations("file:src/main/resources/static/assets/productos/",
                                              "classpath:/static/assets/productos/");
            }
        };
    }
}
