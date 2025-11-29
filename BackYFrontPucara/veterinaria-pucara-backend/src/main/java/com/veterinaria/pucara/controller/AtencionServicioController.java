package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.AtencionServicio;
import com.veterinaria.pucara.repository.IAtencionServicioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/atencionservicio")
@CrossOrigin(origins = "*")
public class AtencionServicioController {
    private final IAtencionServicioRepository repository;

    public AtencionServicioController(IAtencionServicioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<AtencionServicio>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtencionServicio> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AtencionServicio> create(@RequestBody AtencionServicio entity) {
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
    public ResponseEntity<AtencionServicio> update(@PathVariable Long id, @RequestBody AtencionServicio entity) {
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
