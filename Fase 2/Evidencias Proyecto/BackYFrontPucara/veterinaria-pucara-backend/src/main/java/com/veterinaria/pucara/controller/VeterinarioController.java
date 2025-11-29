package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Veterinario;
import com.veterinaria.pucara.repository.IVeterinarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/veterinarios")
@CrossOrigin(origins = "*")
public class VeterinarioController {

    private final IVeterinarioRepository veterinarioRepository;

    public VeterinarioController(IVeterinarioRepository veterinarioRepository) {
        this.veterinarioRepository = veterinarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Veterinario>> getAllVeterinarios() {
        try {
            return ResponseEntity.ok(veterinarioRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Veterinario> getVeterinarioById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return veterinarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createVeterinario(@RequestBody Veterinario veterinario) {
        if (veterinario == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (veterinario.getNombre() == null || veterinario.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre del veterinario es requerido");
            }
            Veterinario veterinarioCreado = veterinarioRepository.save(veterinario);
            return ResponseEntity.ok(veterinarioCreado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el veterinario: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVeterinario(@PathVariable Long id, @RequestBody Veterinario veterinario) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        if (veterinario == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (!veterinarioRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            veterinario.setId(id);
            Veterinario veterinarioActualizado = veterinarioRepository.save(veterinario);
            return ResponseEntity.ok(veterinarioActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el veterinario: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVeterinario(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (!veterinarioRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            veterinarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar el veterinario: " + e.getMessage());
        }
    }
}
