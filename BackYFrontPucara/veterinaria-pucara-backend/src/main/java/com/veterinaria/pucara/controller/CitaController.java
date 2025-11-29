package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Cita;
import com.veterinaria.pucara.repository.ICitaRepository;
import com.veterinaria.pucara.repository.IMascotaRepository;
import com.veterinaria.pucara.repository.IServicioRepository;
import com.veterinaria.pucara.repository.IVeterinarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/citas")
@CrossOrigin(origins = "*")
public class CitaController {
    private final ICitaRepository repository;
    private final IMascotaRepository mascotaRepository;
    private final IServicioRepository servicioRepository;
    private final IVeterinarioRepository veterinarioRepository;

    public CitaController(ICitaRepository repository,
                         IMascotaRepository mascotaRepository,
                         IServicioRepository servicioRepository,
                         IVeterinarioRepository veterinarioRepository) {
        this.repository = repository;
        this.mascotaRepository = mascotaRepository;
        this.servicioRepository = servicioRepository;
        this.veterinarioRepository = veterinarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Cita>> getAll(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) Long servicioId,
            @RequestParam(required = false) String estado) {
        try {
            List<Cita> citas;
            
            // Aplicar filtros
            if (fecha != null && servicioId != null && estado != null) {
                citas = repository.findByFechaAndServicioIdAndEstado(
                    LocalDate.parse(fecha), servicioId, estado);
            } else if (fecha != null && servicioId != null) {
                citas = repository.findByFechaAndServicioId(
                    LocalDate.parse(fecha), servicioId);
            } else if (fecha != null && estado != null) {
                citas = repository.findByFechaAndEstado(
                    LocalDate.parse(fecha), estado);
            } else if (servicioId != null && estado != null) {
                citas = repository.findByServicioIdAndEstado(servicioId, estado);
            } else if (fecha != null) {
                citas = repository.findByFecha(LocalDate.parse(fecha));
            } else if (servicioId != null) {
                citas = repository.findByServicioId(servicioId);
            } else if (estado != null) {
                citas = repository.findByEstado(estado);
            } else {
                citas = repository.findAll();
            }
            
            return ResponseEntity.ok(citas);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> getById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Cita entity) {
        try {
            // Validaciones básicas
            if (entity.getFecha() == null) {
                return ResponseEntity.badRequest().body("La fecha es requerida");
            }
            if (entity.getHora() == null) {
                return ResponseEntity.badRequest().body("La hora es requerida");
            }
            if (entity.getMotivo() == null || entity.getMotivo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El motivo es requerido");
            }
            if (entity.getMascota() == null || entity.getMascota().getId() == null) {
                return ResponseEntity.badRequest().body("La mascota es requerida");
            }
            if (entity.getServicio() == null || entity.getServicio().getId() == null) {
                return ResponseEntity.badRequest().body("El servicio es requerido");
            }
            
            // Verificar que las entidades relacionadas existan
            Long mascotaId = entity.getMascota().getId();
            Long servicioId = entity.getServicio().getId();
            
            if (!mascotaRepository.existsById(mascotaId)) {
                return ResponseEntity.badRequest().body("La mascota con ID " + mascotaId + " no existe");
            }
            if (!servicioRepository.existsById(servicioId)) {
                return ResponseEntity.badRequest().body("El servicio con ID " + servicioId + " no existe");
            }
            
            // Veterinario es opcional
            if (entity.getVeterinario() != null && entity.getVeterinario().getId() != null) {
                Long veterinarioId = entity.getVeterinario().getId();
                if (!veterinarioRepository.existsById(veterinarioId)) {
                    return ResponseEntity.badRequest().body("El veterinario con ID " + veterinarioId + " no existe");
                }
            }
            
            // Cargar las entidades relacionadas completas
            mascotaRepository.findById(mascotaId).ifPresent(entity::setMascota);
            servicioRepository.findById(servicioId).ifPresent(entity::setServicio);
            if (entity.getVeterinario() != null && entity.getVeterinario().getId() != null) {
                veterinarioRepository.findById(entity.getVeterinario().getId()).ifPresent(entity::setVeterinario);
            }
            
            // Establecer estado por defecto si no se proporciona
            if (entity.getEstado() == null || entity.getEstado().trim().isEmpty()) {
                entity.setEstado("Activa");
            }
            
            Cita citaCreada = repository.save(entity);
            return ResponseEntity.ok(citaCreada);
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Error desconocido al crear la cita";
            if (e.getCause() != null) {
                errorMsg += ": " + e.getCause().getMessage();
            }
            return ResponseEntity.badRequest().body("Error al crear la cita: " + errorMsg);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Cita entity) {
        if (id == null) {
            return ResponseEntity.badRequest().body("El ID es requerido");
        }
        if (entity == null) {
            return ResponseEntity.badRequest().body("Los datos de la cita son requeridos");
        }
        try {
            return repository.findById(id)
                    .map(citaExistente -> {
                        // Actualizar solo los campos que vienen en el request
                        if (entity.getFecha() != null) {
                            citaExistente.setFecha(entity.getFecha());
                        }
                        if (entity.getHora() != null) {
                            citaExistente.setHora(entity.getHora());
                        }
                        if (entity.getMotivo() != null) {
                            citaExistente.setMotivo(entity.getMotivo());
                        }
                        if (entity.getDiagnostico() != null) {
                            citaExistente.setDiagnostico(entity.getDiagnostico());
                        }
                        if (entity.getTratamiento() != null) {
                            citaExistente.setTratamiento(entity.getTratamiento());
                        }
                        if (entity.getEstado() != null && !entity.getEstado().trim().isEmpty()) {
                            citaExistente.setEstado(entity.getEstado());
                        }
                        
                        // Actualizar relaciones si vienen en el request y verificar que existan
                        if (entity.getMascota() != null && entity.getMascota().getId() != null) {
                            Long mascotaId = entity.getMascota().getId();
                            if (!mascotaRepository.existsById(mascotaId)) {
                                throw new RuntimeException("La mascota con ID " + mascotaId + " no existe");
                            }
                            mascotaRepository.findById(mascotaId).ifPresent(citaExistente::setMascota);
                        }
                        
                        if (entity.getServicio() != null && entity.getServicio().getId() != null) {
                            Long servicioId = entity.getServicio().getId();
                            if (!servicioRepository.existsById(servicioId)) {
                                throw new RuntimeException("El servicio con ID " + servicioId + " no existe");
                            }
                            servicioRepository.findById(servicioId).ifPresent(citaExistente::setServicio);
                        }
                        
                        // Manejar veterinario (puede ser null)
                        if (entity.getVeterinario() != null) {
                            Long veterinarioId = entity.getVeterinario().getId();
                            if (veterinarioId != null) {
                                if (!veterinarioRepository.existsById(veterinarioId)) {
                                    throw new RuntimeException("El veterinario con ID " + veterinarioId + " no existe");
                                }
                                veterinarioRepository.findById(veterinarioId).ifPresent(citaExistente::setVeterinario);
                            } else {
                                // Si viene un objeto veterinario sin ID, significa que quiere null
                                citaExistente.setVeterinario(null);
                            }
                        }
                        
                        Cita citaActualizada = repository.save(citaExistente);
                        return ResponseEntity.ok(citaActualizada);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al actualizar la cita: " + e.getMessage());
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
            return ResponseEntity.badRequest().body("Error al eliminar la cita: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> updateEstado(@PathVariable Long id, @RequestBody Object request) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        
        String nuevoEstado = null;
        
        // Manejar diferentes formatos de request
        if (request instanceof java.util.Map) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> map = (java.util.Map<String, Object>) request;
            Object estadoObj = map.get("estado");
            if (estadoObj != null) {
                nuevoEstado = estadoObj.toString().trim();
            }
        } else if (request instanceof String) {
            // Si viene como string directo (JSON string entre comillas)
            nuevoEstado = ((String) request).replace("\"", "").trim();
        }
        
        if (nuevoEstado == null || nuevoEstado.isEmpty()) {
            return ResponseEntity.badRequest().body("El estado es requerido");
        }
        
        // Validar que el estado sea uno de los permitidos
        if (!nuevoEstado.equals("Activa") && !nuevoEstado.equals("Completada") && !nuevoEstado.equals("Cancelada")) {
            return ResponseEntity.badRequest().body("Estado inválido. Debe ser: Activa, Completada o Cancelada");
        }
        
        // Hacer la variable final para usar en el lambda
        final String estadoFinal = nuevoEstado;
        
        try {
            return repository.findById(id)
                    .map(cita -> {
                        cita.setEstado(estadoFinal);
                        Cita citaActualizada = repository.save(cita);
                        return ResponseEntity.ok(citaActualizada);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al actualizar el estado: " + e.getMessage());
        }
    }
}
