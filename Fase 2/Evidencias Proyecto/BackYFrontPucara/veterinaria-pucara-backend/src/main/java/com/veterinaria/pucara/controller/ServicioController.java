package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Servicio;
import com.veterinaria.pucara.repository.IAtencionServicioRepository;
import com.veterinaria.pucara.repository.ICitaRepository;
import com.veterinaria.pucara.repository.IServicioRepository;
import com.veterinaria.pucara.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/servicios")
@CrossOrigin(origins = "*")
public class ServicioController {

    private final IServicioRepository repository;
    private final FileStorageService fileStorageService;
    private final ICitaRepository citaRepository;
    private final IAtencionServicioRepository atencionServicioRepository;

    public ServicioController(IServicioRepository repository, 
                             FileStorageService fileStorageService,
                             ICitaRepository citaRepository,
                             IAtencionServicioRepository atencionServicioRepository) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
        this.citaRepository = citaRepository;
        this.atencionServicioRepository = atencionServicioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Servicio>> getAll(
            @RequestParam(required = false) Boolean activo) {
        try {
            List<Servicio> servicios;
            if (activo != null) {
                // Filtrar por estado activo/inactivo
                servicios = repository.findAll().stream()
                    .filter(s -> s.getActivo() != null && s.getActivo().equals(activo))
                    .collect(java.util.stream.Collectors.toList());
            } else {
                servicios = repository.findAll();
            }
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> getById(@PathVariable Long id) {
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
            @RequestParam String nombre,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String precio,
            @RequestParam(required = false) String duracion,
            @RequestParam(defaultValue = "true") Boolean activo) {
        try {
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre del servicio es requerido");
            }
            
            Servicio servicio = new Servicio();
            servicio.setNombre(nombre.trim());
            servicio.setDescripcion(descripcion != null ? descripcion.trim() : null);
            servicio.setPrecio(precio != null && !precio.isEmpty() ? new java.math.BigDecimal(precio) : null);
            servicio.setDuracion(duracion != null && !duracion.isEmpty() ? Integer.parseInt(duracion) : null);
            servicio.setActivo(activo);
            
            // Guardar imagen si se proporciona
            if (imagen != null && !imagen.isEmpty()) {
                try {
                    String imagenUrl = fileStorageService.saveImage(imagen);
                    servicio.setImagenUrl(imagenUrl);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body("Error al guardar la imagen: " + e.getMessage());
                }
            }
            
            Servicio servicioCreado = repository.save(servicio);
            return ResponseEntity.ok(servicioCreado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear el servicio: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile imagen,
            @RequestParam String nombre,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) String precio,
            @RequestParam(required = false) String duracion,
            @RequestParam(defaultValue = "true") Boolean activo,
            @RequestParam(required = false) String imagenUrlActual) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            if (!repository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            Servicio servicio = repository.findById(id).orElse(null);
            if (servicio == null) {
                return ResponseEntity.notFound().build();
            }
            
            servicio.setNombre(nombre.trim());
            servicio.setDescripcion(descripcion != null ? descripcion.trim() : null);
            servicio.setPrecio(precio != null && !precio.isEmpty() ? new java.math.BigDecimal(precio) : null);
            servicio.setDuracion(duracion != null && !duracion.isEmpty() ? Integer.parseInt(duracion) : null);
            servicio.setActivo(activo);
            
            // Manejar imagen
            if (imagen != null && !imagen.isEmpty()) {
                // Eliminar imagen anterior si existe
                if (servicio.getImagenUrl() != null && !servicio.getImagenUrl().isEmpty()) {
                    fileStorageService.deleteImage(servicio.getImagenUrl());
                }
                // Guardar nueva imagen
                try {
                    String nuevaImagenUrl = fileStorageService.saveImage(imagen);
                    servicio.setImagenUrl(nuevaImagenUrl);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body("Error al guardar la imagen: " + e.getMessage());
                }
            } else if (imagenUrlActual != null && !imagenUrlActual.isEmpty()) {
                // Mantener imagen actual si no se sube una nueva
                servicio.setImagenUrl(imagenUrlActual);
            }
            
            Servicio servicioActualizado = repository.save(servicio);
            return ResponseEntity.ok(servicioActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el servicio: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().body("El ID del servicio es requerido");
        }
        try {
            // Verificar si el servicio existe
            Servicio servicio = repository.findById(id).orElse(null);
            if (servicio == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verificar si hay citas asociadas
            List<com.veterinaria.pucara.model.Cita> citasAsociadas = citaRepository.findByServicioId(id);
            if (citasAsociadas != null && !citasAsociadas.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    "No se puede eliminar el servicio porque tiene " + citasAsociadas.size() + 
                    " cita(s) asociada(s). Por favor, elimina o modifica las citas primero."
                );
            }
            
            // Verificar si hay atenciones-servicio asociadas
            List<com.veterinaria.pucara.model.AtencionServicio> atencionesServicio = atencionServicioRepository.findByServicioId(id);
            if (atencionesServicio != null && !atencionesServicio.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    "No se puede eliminar el servicio porque tiene " + atencionesServicio.size() + 
                    " atención(es) asociada(s). Por favor, elimina o modifica las atenciones primero."
                );
            }
            
            // Eliminar la imagen del servicio si existe
            if (servicio.getImagenUrl() != null && !servicio.getImagenUrl().isEmpty()) {
                try {
                    fileStorageService.deleteImage(servicio.getImagenUrl());
                } catch (Exception e) {
                    // Log el error pero continuar con la eliminación del servicio
                    System.err.println("Error al eliminar la imagen del servicio: " + e.getMessage());
                }
            }
            
            // Eliminar el servicio
            repository.deleteById(id);
            return ResponseEntity.ok().body("Servicio eliminado correctamente");
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Capturar errores de integridad referencial
            String mensaje = e.getMessage();
            if (mensaje != null && mensaje.contains("foreign key")) {
                return ResponseEntity.badRequest().body(
                    "No se puede eliminar el servicio porque tiene citas asociadas. " +
                    "Por favor, elimina o modifica las citas primero."
                );
            }
            return ResponseEntity.badRequest().body("Error de integridad de datos: " + mensaje);
        } catch (Exception e) {
            // Capturar cualquier otro error y mostrar el mensaje real
            String mensajeError = e.getMessage();
            if (mensajeError == null || mensajeError.isEmpty()) {
                mensajeError = e.getClass().getSimpleName();
            }
            return ResponseEntity.badRequest().body("Error al eliminar el servicio: " + mensajeError);
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> updateEstado(@PathVariable Long id, @RequestBody Boolean activo) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        if (activo == null) {
            return ResponseEntity.badRequest().body("El estado (activo) es requerido");
        }
        try {
            return repository.findById(id)
                    .map(servicio -> {
                        servicio.setActivo(activo);
                        Servicio servicioActualizado = repository.save(servicio);
                        return ResponseEntity.ok(servicioActualizado);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el estado: " + e.getMessage());
        }
    }
}
