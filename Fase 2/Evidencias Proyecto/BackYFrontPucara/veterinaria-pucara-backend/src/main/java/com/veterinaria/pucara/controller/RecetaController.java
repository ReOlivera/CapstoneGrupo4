package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Receta;
import com.veterinaria.pucara.repository.IRecetaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/recetas")
@CrossOrigin(origins = "*")
public class RecetaController {

    private final IRecetaRepository repository;

    public RecetaController(IRecetaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Receta>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Receta> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Receta> create(@RequestBody Receta entity) {
        if (entity == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(repository.save(entity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Receta> update(@PathVariable Long id, @RequestBody Receta entity) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (entity == null) {
            return ResponseEntity.badRequest().build();
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
