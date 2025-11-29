package com.veterinaria.pucara.service;

import com.veterinaria.pucara.dto.LoginRequest;
import com.veterinaria.pucara.dto.LoginResponse;
import com.veterinaria.pucara.model.Usuario;
import com.veterinaria.pucara.repository.IUsuarioRepository;
import com.veterinaria.pucara.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final IUsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(IUsuarioRepository usuarioRepository, 
                      PasswordEncoder passwordEncoder, 
                      JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        System.out.println("Intento de login para usuario: " + request.getUsername());
        
        // Primero intentar buscar por username y activo
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsernameAndActivoTrue(request.getUsername());
        
        // Si no se encuentra, buscar solo por username para diagnóstico
        if (usuarioOpt.isEmpty()) {
            Optional<Usuario> usuarioInactivo = usuarioRepository.findByUsername(request.getUsername());
            if (usuarioInactivo.isPresent()) {
                Usuario u = usuarioInactivo.get();
                System.out.println("Usuario encontrado pero inactivo: " + u.getUsername() + ", activo: " + u.getActivo());
                throw new RuntimeException("Usuario inactivo. Contacte al administrador.");
            } else {
                System.out.println("Usuario no encontrado: " + request.getUsername());
                throw new RuntimeException("Usuario no encontrado");
            }
        }

        Usuario usuario = usuarioOpt.get();
        System.out.println("Usuario encontrado: " + usuario.getUsername() + ", rol: " + usuario.getRol());

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            System.out.println("Contraseña incorrecta para usuario: " + request.getUsername());
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol());
        System.out.println("Login exitoso para usuario: " + usuario.getUsername());

        return new LoginResponse(
            token,
            usuario.getUsername(),
            usuario.getRol(),
            usuario.getNombre(),
            usuario.getId()
        );
    }

    public Optional<Usuario> findByUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }
}

