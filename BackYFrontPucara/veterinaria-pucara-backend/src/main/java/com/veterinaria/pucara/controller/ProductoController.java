package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Producto;
import com.veterinaria.pucara.repository.IProductoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final IProductoRepository repository;

    public ProductoController(IProductoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> getAll() {
        try {
            return ResponseEntity.ok(repository.findAll());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Producto entity) {
        if (entity == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (entity.getNombre() == null || entity.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre del producto es requerido");
            }
            Producto productoCreado = repository.save(entity);
            return ResponseEntity.ok(productoCreado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el producto: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Producto entity) {
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
            Producto productoActualizado = repository.save(entity);
            return ResponseEntity.ok(productoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el producto: " + e.getMessage());
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
            return ResponseEntity.badRequest().body("Error al eliminar el producto: " + e.getMessage());
        }
    }
}
