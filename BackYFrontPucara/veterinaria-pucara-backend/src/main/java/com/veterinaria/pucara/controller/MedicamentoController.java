package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Medicamento;
import com.veterinaria.pucara.repository.IMedicamentoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/medicamentos")
@CrossOrigin(origins = "*")
public class MedicamentoController {
    private final IMedicamentoRepository repository;

    public MedicamentoController(IMedicamentoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Medicamento>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicamento> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Medicamento entity) {
        if (entity == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (entity.getNombre() == null || entity.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre del medicamento es requerido");
            }
            Medicamento medicamentoCreado = repository.save(entity);
            return ResponseEntity.ok(medicamentoCreado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el medicamento: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Medicamento entity) {
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
            Medicamento medicamentoActualizado = repository.save(entity);
            return ResponseEntity.ok(medicamentoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el medicamento: " + e.getMessage());
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
            return ResponseEntity.badRequest().body("Error al eliminar el medicamento: " + e.getMessage());
        }
    }
}
