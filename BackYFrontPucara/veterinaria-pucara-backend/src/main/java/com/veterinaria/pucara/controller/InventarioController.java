package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Inventario;
import com.veterinaria.pucara.repository.IInventarioRepository;
import com.veterinaria.pucara.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/inventarios")
@CrossOrigin(origins = "*")
public class InventarioController {
    private final IInventarioRepository repository;
    private final FileStorageService fileStorageService;

    public InventarioController(IInventarioRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<Inventario>> getAll(
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String categoria) {
        try {
            List<Inventario> inventarios = repository.findAll();
            
            // Filtrar por estado activo si se solicita
            if (activo != null) {
                inventarios = inventarios.stream()
                    .filter(i -> {
                        if (activo) {
                            return "Activo".equals(i.getEstado()) && 
                                   (i.getCantidad() == null || i.getCantidad() > 0);
                        } else {
                            return !"Activo".equals(i.getEstado()) || 
                                   (i.getCantidad() != null && i.getCantidad() <= 0);
                        }
                    })
                    .collect(java.util.stream.Collectors.toList());
            }
            
            // Filtrar por categoría si se solicita
            if (categoria != null && !categoria.isEmpty()) {
                inventarios = inventarios.stream()
                    .filter(i -> categoria.equalsIgnoreCase(i.getCategoria()))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            return ResponseEntity.ok(inventarios);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventario> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam(required = false) MultipartFile imagen,
            @RequestParam String nombreProducto,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String cantidad,
            @RequestParam(required = false) String unidad,
            @RequestParam(required = false) String precio,
            @RequestParam(required = false) String stockMinimo,
            @RequestParam(required = false) String fechaIngreso,
            @RequestParam(required = false) String fechaVencimiento,
            @RequestParam(defaultValue = "Activo") String estado) {
        try {
            if (nombreProducto == null || nombreProducto.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre del producto es requerido");
            }
            
            Inventario inventario = new Inventario();
            inventario.setNombreProducto(nombreProducto.trim());
            inventario.setDescripcion(descripcion != null ? descripcion.trim() : null);
            inventario.setCategoria(categoria != null ? categoria.trim() : null);
            inventario.setCantidad(cantidad != null && !cantidad.isEmpty() ? Integer.parseInt(cantidad) : null);
            inventario.setUnidad(unidad != null ? unidad.trim() : null);
            inventario.setPrecio(precio != null && !precio.isEmpty() ? new java.math.BigDecimal(precio) : null);
            inventario.setStockMinimo(stockMinimo != null && !stockMinimo.isEmpty() ? Integer.parseInt(stockMinimo) : null);
            inventario.setEstado(estado != null ? estado.trim() : "Activo");
            
            // Manejar fechas
            if (fechaIngreso != null && !fechaIngreso.isEmpty()) {
                inventario.setFechaIngreso(java.time.LocalDate.parse(fechaIngreso));
            }
            if (fechaVencimiento != null && !fechaVencimiento.isEmpty()) {
                inventario.setFechaVencimiento(java.time.LocalDate.parse(fechaVencimiento));
            }
            
            // Guardar imagen si se proporciona
            if (imagen != null && !imagen.isEmpty()) {
                try {
                    String imagenUrl = fileStorageService.saveImage(imagen, "producto");
                    inventario.setImagenUrl(imagenUrl);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body("Error al guardar la imagen: " + e.getMessage());
                }
            }
            
            // Actualizar estado según cantidad
            if (inventario.getCantidad() != null && inventario.getCantidad() <= 0) {
                inventario.setEstado("Agotado");
            }
            
            Inventario inventarioCreado = repository.save(inventario);
            return ResponseEntity.ok(inventarioCreado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el inventario: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile imagen,
            @RequestParam String nombreProducto,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String cantidad,
            @RequestParam(required = false) String unidad,
            @RequestParam(required = false) String precio,
            @RequestParam(required = false) String stockMinimo,
            @RequestParam(required = false) String fechaIngreso,
            @RequestParam(required = false) String fechaVencimiento,
            @RequestParam(defaultValue = "Activo") String estado,
            @RequestParam(required = false) String imagenUrlActual) {
        if (id == null) {
            return ResponseEntity.badRequest().body("El ID es requerido");
        }
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (nombreProducto == null || nombreProducto.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre del producto es requerido");
        }
        
        try {
            Inventario inventario = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inventario no encontrado"));
            
            inventario.setNombreProducto(nombreProducto.trim());
            inventario.setDescripcion(descripcion != null ? descripcion.trim() : null);
            inventario.setCategoria(categoria != null ? categoria.trim() : null);
            inventario.setCantidad(cantidad != null && !cantidad.isEmpty() ? Integer.parseInt(cantidad) : inventario.getCantidad());
            inventario.setUnidad(unidad != null ? unidad.trim() : inventario.getUnidad());
            inventario.setPrecio(precio != null && !precio.isEmpty() ? new java.math.BigDecimal(precio) : inventario.getPrecio());
            inventario.setStockMinimo(stockMinimo != null && !stockMinimo.isEmpty() ? Integer.parseInt(stockMinimo) : inventario.getStockMinimo());
            inventario.setEstado(estado != null ? estado.trim() : "Activo");
            
            // Manejar fechas
            if (fechaIngreso != null && !fechaIngreso.isEmpty()) {
                inventario.setFechaIngreso(java.time.LocalDate.parse(fechaIngreso));
            }
            if (fechaVencimiento != null && !fechaVencimiento.isEmpty()) {
                inventario.setFechaVencimiento(java.time.LocalDate.parse(fechaVencimiento));
            }
            
            // Manejar imagen
            if (imagen != null && !imagen.isEmpty()) {
                // Eliminar imagen anterior si existe
                if (inventario.getImagenUrl() != null && !inventario.getImagenUrl().isEmpty()) {
                    fileStorageService.deleteImage(inventario.getImagenUrl());
                }
                // Guardar nueva imagen
                try {
                    String nuevaImagenUrl = fileStorageService.saveImage(imagen, "producto");
                    inventario.setImagenUrl(nuevaImagenUrl);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body("Error al guardar la imagen: " + e.getMessage());
                }
            } else if (imagenUrlActual != null && !imagenUrlActual.isEmpty()) {
                // Mantener imagen actual si no se sube una nueva
                inventario.setImagenUrl(imagenUrlActual);
            }
            
            // Actualizar estado según el stock y fecha de vencimiento
            if (inventario.getCantidad() != null && inventario.getCantidad() <= 0) {
                inventario.setEstado("Agotado");
            } else if (inventario.getFechaVencimiento() != null && 
                       inventario.getFechaVencimiento().isBefore(java.time.LocalDate.now())) {
                inventario.setEstado("Vencido");
            } else if (inventario.getCantidad() != null && inventario.getCantidad() > 0) {
                inventario.setEstado("Activo");
            } else if (inventario.getEstado() == null || inventario.getEstado().isEmpty()) {
                inventario.setEstado("Activo");
            }
            
            Inventario inventarioActualizado = repository.save(inventario);
            return ResponseEntity.ok(inventarioActualizado);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al actualizar el inventario: " + e.getMessage());
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

    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Object request) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        
        Integer cantidadTemp = null;
        // Manejar tanto Integer directo como objeto JSON
        if (request instanceof Integer) {
            cantidadTemp = (Integer) request;
        } else if (request instanceof java.util.Map) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> map = (java.util.Map<String, Object>) request;
            Object cantidadObj = map.get("cantidad");
            if (cantidadObj instanceof Number) {
                cantidadTemp = ((Number) cantidadObj).intValue();
            } else if (cantidadObj != null) {
                try {
                    cantidadTemp = Integer.parseInt(cantidadObj.toString());
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body("La cantidad debe ser un número válido");
                }
            }
        } else if (request instanceof Number) {
            cantidadTemp = ((Number) request).intValue();
        } else if (request != null) {
            try {
                cantidadTemp = Integer.parseInt(request.toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("La cantidad debe ser un número válido");
            }
        }
        
        if (cantidadTemp == null) {
            return ResponseEntity.badRequest().body("La cantidad es requerida");
        }
        
        final Integer cantidad = cantidadTemp;
        
        try {
            return repository.findById(id)
                    .map(inventario -> {
                        inventario.setCantidad(cantidad);
                        // Actualizar estado según el stock
                        if (cantidad <= 0) {
                            inventario.setEstado("Agotado");
                        } else if (inventario.getFechaVencimiento() != null && 
                                   inventario.getFechaVencimiento().isBefore(java.time.LocalDate.now())) {
                            inventario.setEstado("Vencido");
                        } else {
                            inventario.setEstado("Activo");
                        }
                        Inventario inventarioActualizado = repository.save(inventario);
                        return ResponseEntity.ok(inventarioActualizado);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el stock: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> updateEstado(@PathVariable Long id, @RequestBody String estado) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        if (estado == null || estado.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El estado es requerido");
        }
        try {
            return repository.findById(id)
                    .map(inventario -> {
                        inventario.setEstado(estado);
                        Inventario inventarioActualizado = repository.save(inventario);
                        return ResponseEntity.ok(inventarioActualizado);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el estado: " + e.getMessage());
        }
    }
}
