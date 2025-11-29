package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Cita;
import com.veterinaria.pucara.model.Propietario;
import com.veterinaria.pucara.model.HistorialClinico;
import com.veterinaria.pucara.repository.ICitaRepository;
import com.veterinaria.pucara.repository.IPropietarioRepository;
import com.veterinaria.pucara.repository.IMascotaRepository;
import com.veterinaria.pucara.repository.IServicioRepository;
import com.veterinaria.pucara.repository.IHistorialClinicoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final ICitaRepository citaRepository;
    private final IPropietarioRepository propietarioRepository;
    private final IMascotaRepository mascotaRepository;
    private final IServicioRepository servicioRepository;
    private final IHistorialClinicoRepository historialClinicoRepository;

    public AdminController(ICitaRepository citaRepository,
                          IPropietarioRepository propietarioRepository,
                          IMascotaRepository mascotaRepository,
                          IServicioRepository servicioRepository,
                          IHistorialClinicoRepository historialClinicoRepository) {
        this.citaRepository = citaRepository;
        this.propietarioRepository = propietarioRepository;
        this.mascotaRepository = mascotaRepository;
        this.servicioRepository = servicioRepository;
        this.historialClinicoRepository = historialClinicoRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Estadísticas generales
        stats.put("totalCitas", citaRepository.count());
        stats.put("totalPropietarios", propietarioRepository.count());
        stats.put("totalMascotas", mascotaRepository.count());
        
        // Citas de hoy
        LocalDate today = LocalDate.now();
        long citasHoy = 0;
        for (Cita cita : citaRepository.findAll()) {
            if (cita.getFecha() != null && cita.getFecha().equals(today)) {
                citasHoy++;
            }
        }
        stats.put("citasHoy", citasHoy);
        
        // Citas pendientes (futuras o de hoy)
        long citasPendientes = 0;
        for (Cita cita : citaRepository.findAll()) {
            if (cita.getFecha() != null && 
                (cita.getFecha().isAfter(today) || cita.getFecha().equals(today))) {
                citasPendientes++;
            }
        }
        stats.put("citasPendientes", citasPendientes);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/citas/recent")
    public ResponseEntity<List<Cita>> getRecentCitas(@RequestParam(defaultValue = "10") int limit) {
        List<Cita> allCitas = new ArrayList<>(citaRepository.findAll());
        // Ordenar por fecha descendente
        allCitas.sort((a, b) -> {
            if (a.getFecha() == null && b.getFecha() == null) return 0;
            if (a.getFecha() == null) return 1;
            if (b.getFecha() == null) return -1;
            return b.getFecha().compareTo(a.getFecha());
        });
        
        // Limitar resultados
        int size = Math.min(limit, allCitas.size());
        List<Cita> recentCitas = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            recentCitas.add(allCitas.get(i));
        }
        
        return ResponseEntity.ok(recentCitas);
    }

    @GetMapping("/propietarios/recent")
    public ResponseEntity<List<Propietario>> getRecentPropietarios(@RequestParam(defaultValue = "10") int limit) {
        List<Propietario> allPropietarios = new ArrayList<>(propietarioRepository.findAll());
        int size = Math.min(limit, allPropietarios.size());
        List<Propietario> recentPropietarios = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            recentPropietarios.add(allPropietarios.get(i));
        }
        return ResponseEntity.ok(recentPropietarios);
    }

    @GetMapping("/reportes")
    public ResponseEntity<Map<String, Object>> getReportes() {
        Map<String, Object> reportes = new HashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        // 1. Citas mensuales (últimos 12 meses)
        Map<String, Long> citasMensuales = new HashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 11; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String monthKey = month.format(monthFormatter);
            citasMensuales.put(monthKey, 0L);
        }
        
        for (Cita cita : citaRepository.findAll()) {
            if (cita.getFecha() != null) {
                String monthKey = cita.getFecha().format(monthFormatter);
                citasMensuales.put(monthKey, citasMensuales.getOrDefault(monthKey, 0L) + 1);
            }
        }
        reportes.put("citasMensuales", citasMensuales);
        
        // 2. Servicios más solicitados
        Map<String, Long> serviciosCount = new HashMap<>();
        for (Cita cita : citaRepository.findAll()) {
            if (cita.getServicio() != null && cita.getServicio().getNombre() != null) {
                String servicioNombre = cita.getServicio().getNombre();
                serviciosCount.put(servicioNombre, serviciosCount.getOrDefault(servicioNombre, 0L) + 1);
            }
        }
        // Ordenar y tomar top 10
        List<Map<String, Object>> serviciosMasSolicitados = serviciosCount.entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
            .limit(10)
            .map(entry -> {
                Map<String, Object> item = new HashMap<>();
                item.put("nombre", entry.getKey());
                item.put("cantidad", entry.getValue());
                return item;
            })
            .collect(Collectors.toList());
        reportes.put("serviciosMasSolicitados", serviciosMasSolicitados);
        
        // 3. Mascotas atendidas por especie
        Map<String, Long> especiesCount = new HashMap<>();
        for (Cita cita : citaRepository.findAll()) {
            if (cita.getMascota() != null && cita.getMascota().getEspecie() != null) {
                String especie = cita.getMascota().getEspecie();
                especiesCount.put(especie, especiesCount.getOrDefault(especie, 0L) + 1);
            }
        }
        List<Map<String, Object>> mascotasPorEspecie = especiesCount.entrySet().stream()
            .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
            .map(entry -> {
                Map<String, Object> item = new HashMap<>();
                item.put("especie", entry.getKey());
                item.put("cantidad", entry.getValue());
                return item;
            })
            .collect(Collectors.toList());
        reportes.put("mascotasPorEspecie", mascotasPorEspecie);
        
        // 4. Propietarios nuevos por mes (últimos 12 meses)
        Map<String, Long> propietariosMensuales = new HashMap<>();
        for (int i = 11; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            String monthKey = month.format(monthFormatter);
            propietariosMensuales.put(monthKey, 0L);
        }
        
        // Nota: Si Propietario no tiene fecha de creación, usamos el orden de inserción aproximado
        // En un caso real, deberías agregar un campo fechaCreacion a Propietario
        List<Propietario> allPropietarios = new ArrayList<>(propietarioRepository.findAll());
        // Por ahora, distribuimos los propietarios en los últimos meses de forma aproximada
        int propietariosPorMes = Math.max(1, allPropietarios.size() / 12);
        int index = 0;
        for (int i = 11; i >= 0 && index < allPropietarios.size(); i--) {
            LocalDate month = now.minusMonths(i);
            String monthKey = month.format(monthFormatter);
            long count = Math.min(propietariosPorMes, allPropietarios.size() - index);
            propietariosMensuales.put(monthKey, count);
            index += propietariosPorMes;
        }
        reportes.put("propietariosMensuales", propietariosMensuales);
        
        // 5. Vacunas aplicadas (a través de historial clínico)
        // Contamos historiales que mencionen "vacuna" en la descripción
        long vacunasAplicadas = 0;
        for (HistorialClinico historial : historialClinicoRepository.findAll()) {
            if (historial.getDescripcion() != null && 
                historial.getDescripcion().toLowerCase().contains("vacuna")) {
                vacunasAplicadas++;
            }
        }
        reportes.put("vacunasAplicadas", vacunasAplicadas);
        
        // Estadísticas adicionales
        reportes.put("totalCitas", citaRepository.count());
        reportes.put("totalMascotas", mascotaRepository.count());
        reportes.put("totalPropietarios", propietarioRepository.count());
        reportes.put("totalServicios", servicioRepository.count());
        
        return ResponseEntity.ok(reportes);
    }
}

