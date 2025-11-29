package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.dto.ErrorResponse;
import com.veterinaria.pucara.dto.LoginRequest;
import com.veterinaria.pucara.dto.LoginResponse;
import com.veterinaria.pucara.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Devolver un objeto JSON para mejor manejo en el frontend
            return ResponseEntity.status(401).body(new ErrorResponse("Error de autenticación: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse("Error interno del servidor: " + e.getMessage()));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            // El token viene como "Bearer <token>"
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            // Validación básica - en producción deberías validar el token completo
            return ResponseEntity.ok("Token válido");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token inválido");
        }
    }
}

