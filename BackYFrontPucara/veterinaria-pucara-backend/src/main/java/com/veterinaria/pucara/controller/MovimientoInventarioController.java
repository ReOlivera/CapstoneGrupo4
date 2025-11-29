package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.MovimientoInventario;
import com.veterinaria.pucara.repository.IMovimientoInventarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/movimientos")
@CrossOrigin(origins = "*")
public class MovimientoInventarioController {
    private final IMovimientoInventarioRepository repository;

    public MovimientoInventarioController(IMovimientoInventarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<MovimientoInventario>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoInventario> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MovimientoInventario> create(@RequestBody MovimientoInventario entity) {
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
    public ResponseEntity<MovimientoInventario> update(@PathVariable Long id, @RequestBody MovimientoInventario entity) {
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
