package com.veterinaria.pucara.service;

import com.veterinaria.pucara.model.Usuario;
import com.veterinaria.pucara.repository.IUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Optional;

@Service
public class UserInitService {

    @Autowired
    private IUsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        // Crear usuario administrador por defecto si no existe
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRol("ADMIN");
            admin.setNombre("Administrador");
            admin.setEmail("admin@veterinariapucara.cl");
            admin.setActivo(true);
            usuarioRepository.save(admin);
            System.out.println("Usuario administrador creado: admin / admin123");
        }

        // Crear o actualizar usuario recepcionista por defecto
        Optional<Usuario> recepcionistaOpt = usuarioRepository.findByUsername("recepcionista");
        if (recepcionistaOpt.isEmpty()) {
            // Crear nuevo usuario recepcionista
            Usuario recepcionista = new Usuario();
            recepcionista.setUsername("recepcionista");
            recepcionista.setPassword(passwordEncoder.encode("recepcionista123"));
            recepcionista.setRol("RECEPCIONISTA");
            recepcionista.setNombre("Recepcionista");
            recepcionista.setEmail("recepcionista@veterinariapucara.cl");
            recepcionista.setActivo(true);
            usuarioRepository.save(recepcionista);
            System.out.println("Usuario recepcionista creado: recepcionista / recepcionista123");
        } else {
            // Actualizar usuario existente para asegurar que tenga la configuración correcta
            Usuario recepcionista = recepcionistaOpt.get();
            boolean necesitaActualizacion = false;
            
            if (!recepcionista.getActivo()) {
                recepcionista.setActivo(true);
                necesitaActualizacion = true;
                System.out.println("Usuario recepcionista estaba inactivo, se activó");
            }
            
            if (!"RECEPCIONISTA".equals(recepcionista.getRol())) {
                recepcionista.setRol("RECEPCIONISTA");
                necesitaActualizacion = true;
                System.out.println("Rol del usuario recepcionista actualizado a RECEPCIONISTA");
            }
            
            // Siempre actualizar la contraseña para asegurar que sea "recepcionista123"
            // Esto corrige cualquier problema de contraseña incorrecta
            String nuevaPasswordEncriptada = passwordEncoder.encode("recepcionista123");
            recepcionista.setPassword(nuevaPasswordEncriptada);
            necesitaActualizacion = true;
            System.out.println("Contraseña del usuario recepcionista actualizada a 'recepcionista123'");
            
            if (necesitaActualizacion) {
                usuarioRepository.save(recepcionista);
                System.out.println("Usuario recepcionista actualizado correctamente: recepcionista / recepcionista123");
            }
        }
    }
}

