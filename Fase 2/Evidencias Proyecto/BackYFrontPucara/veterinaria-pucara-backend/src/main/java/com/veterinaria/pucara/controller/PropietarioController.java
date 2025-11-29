package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Propietario;
import com.veterinaria.pucara.repository.IPropietarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/propietarios")
@CrossOrigin(origins = "*")
public class PropietarioController {

    private final IPropietarioRepository repository;

    public PropietarioController(IPropietarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Propietario>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Propietario> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rut/{rut}")
    public ResponseEntity<Propietario> getByRut(@PathVariable String rut) {
        // Validar que el RUT no sea nulo o vacío
        if (rut == null || rut.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Normalizar RUT: remover puntos, guiones y espacios, convertir a mayúsculas
        String rutNormalizado = rut.replaceAll("[.\\s-]", "").toUpperCase();
        return repository.findByRut(rutNormalizado)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Propietario entity) {
        // Validar que el RUT no sea nulo o vacío (requerido para nuevos registros)
        if (entity.getRut() == null || entity.getRut().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El RUT es requerido");
        }
        
        // Normalizar RUT antes de guardar
        String rutNormalizado = entity.getRut().replaceAll("[.\\s-]", "").toUpperCase();
        entity.setRut(rutNormalizado);
        
        // Verificar si ya existe un propietario con ese RUT
        if (repository.findByRut(rutNormalizado).isPresent()) {
            // Si existe, retornar el propietario existente en lugar de error
            return ResponseEntity.ok(repository.findByRut(rutNormalizado).get());
        }
        
        try {
            return ResponseEntity.ok(repository.save(entity));
        } catch (Exception e) {
            // Si hay error de constraint único, puede ser que el RUT ya exista
            if (e.getMessage() != null && e.getMessage().contains("unique") || 
                e.getMessage() != null && e.getMessage().contains("duplicate")) {
                // Intentar buscar el propietario existente
                var existente = repository.findByRut(rutNormalizado);
                if (existente.isPresent()) {
                    return ResponseEntity.ok(existente.get());
                }
            }
            return ResponseEntity.badRequest().body("Error al crear propietario: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Propietario> update(@PathVariable Long id, @RequestBody Propietario entity) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Normalizar RUT antes de actualizar
        if (entity.getRut() != null) {
            String rutNormalizado = entity.getRut().replaceAll("[.\\s-]", "").toUpperCase();
            entity.setRut(rutNormalizado);
        }
        entity.setId(id);
        
        try {
            return ResponseEntity.ok(repository.save(entity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
