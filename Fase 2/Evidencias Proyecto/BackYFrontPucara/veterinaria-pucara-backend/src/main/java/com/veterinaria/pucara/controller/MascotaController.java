package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Mascota;
import com.veterinaria.pucara.repository.IMascotaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/mascotas")
@CrossOrigin(origins = "*")
public class MascotaController {
    private final IMascotaRepository repository;

    public MascotaController(IMascotaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Mascota>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mascota> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Mascota entity) {
        try {
            // Validaciones básicas
            if (entity.getNombre() == null || entity.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre de la mascota es requerido");
            }
            if (entity.getEspecie() == null || entity.getEspecie().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("La especie es requerida");
            }
            if (entity.getPropietario() == null || entity.getPropietario().getId() == null) {
                return ResponseEntity.badRequest().body("El propietario es requerido");
            }
            
            Mascota mascotaCreada = repository.save(entity);
            return ResponseEntity.ok(mascotaCreada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear la mascota: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Mascota entity) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        if (entity == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            entity.setId(id);
            Mascota mascotaActualizada = repository.save(entity);
            return ResponseEntity.ok(mascotaActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar la mascota: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar la mascota: " + e.getMessage());
        }
    }
}
