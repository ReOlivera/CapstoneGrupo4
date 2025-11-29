package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.model.Cita;
import com.veterinaria.pucara.repository.ICitaRepository;
import com.veterinaria.pucara.service.RecordatorioService;
import com.veterinaria.pucara.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recordatorios")
@CrossOrigin(origins = "*")
public class RecordatorioController {

    @Autowired
    private RecordatorioService recordatorioService;

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private ICitaRepository citaRepository;

    /**
     * Endpoint de prueba para verificar el estado del servicio de WhatsApp
     */
    @GetMapping("/estado")
    public ResponseEntity<Map<String, Object>> getEstado() {
        Map<String, Object> estado = new HashMap<>();
        estado.put("whatsappHabilitado", whatsAppService.estaHabilitado());
        estado.put("mensaje", whatsAppService.estaHabilitado() 
            ? "Servicio de WhatsApp habilitado y configurado" 
            : "Servicio de WhatsApp deshabilitado o no configurado");
        estado.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(estado);
    }

    /**
     * Endpoint de prueba para enviar un mensaje de WhatsApp a un número específico
     * Útil para probar la conexión con Twilio
     */
    @PostMapping("/probar-envio")
    public ResponseEntity<Map<String, Object>> probarEnvio(@RequestBody Map<String, String> request) {
        Map<String, Object> resultado = new HashMap<>();
        
        String numero = request.get("numero");
        String mensaje = request.getOrDefault("mensaje", "🐾 Prueba de WhatsApp - Veterinaria Pucará\n\nEste es un mensaje de prueba del sistema de recordatorios.");
        
        if (numero == null || numero.trim().isEmpty()) {
            resultado.put("exito", false);
            resultado.put("error", "El número de teléfono es requerido");
            return ResponseEntity.badRequest().body(resultado);
        }

        try {
            boolean enviado = whatsAppService.enviarMensaje(numero, mensaje);
            resultado.put("exito", enviado);
            resultado.put("numero", numero);
            resultado.put("mensaje", enviado ? "Mensaje enviado exitosamente" : "Error al enviar mensaje");
            resultado.put("timestamp", LocalDateTime.now());
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            resultado.put("exito", false);
            resultado.put("error", e.getMessage());
            resultado.put("timestamp", LocalDateTime.now());
            return ResponseEntity.status(500).body(resultado);
        }
    }

    /**
     * Endpoint para enviar recordatorio manual de una cita específica
     * Útil para probar el sistema sin esperar 24 horas
     */
    @PostMapping("/enviar/{citaId}")
    public ResponseEntity<Map<String, Object>> enviarRecordatorioManual(@PathVariable Long citaId) {
        Map<String, Object> resultado = new HashMap<>();
        
        try {
            boolean enviado = recordatorioService.enviarRecordatorioManualmente(citaId);
            resultado.put("exito", enviado);
            resultado.put("citaId", citaId);
            resultado.put("mensaje", enviado ? "Recordatorio enviado exitosamente" : "Error al enviar recordatorio");
            resultado.put("timestamp", LocalDateTime.now());
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            resultado.put("exito", false);
            resultado.put("error", e.getMessage());
            resultado.put("timestamp", LocalDateTime.now());
            return ResponseEntity.status(500).body(resultado);
        }
    }

    /**
     * Endpoint para obtener citas que recibirán recordatorio mañana
     * Útil para verificar qué citas están programadas
     */
    @GetMapping("/citas-pendientes")
    public ResponseEntity<Map<String, Object>> getCitasPendientes() {
        Map<String, Object> resultado = new HashMap<>();
        
        try {
            LocalDate fechaRecordatorio = LocalDate.now();
            LocalDate fechaCita = fechaRecordatorio.plusDays(1);
            
            List<Cita> citas = citaRepository.findByFechaAndEstado(fechaCita, "Activa");
            
            resultado.put("fechaRecordatorio", fechaRecordatorio.toString());
            resultado.put("fechaCita", fechaCita.toString());
            resultado.put("totalCitas", citas.size());
            resultado.put("citas", citas.stream().map(cita -> {
                Map<String, Object> citaInfo = new HashMap<>();
                citaInfo.put("id", cita.getId());
                citaInfo.put("fecha", cita.getFecha());
                citaInfo.put("hora", cita.getHora());
                citaInfo.put("estado", cita.getEstado());
                if (cita.getMascota() != null) {
                    citaInfo.put("mascota", cita.getMascota().getNombre());
                    if (cita.getMascota().getPropietario() != null) {
                        citaInfo.put("propietario", cita.getMascota().getPropietario().getNombre());
                        citaInfo.put("telefono", cita.getMascota().getPropietario().getTelefono());
                    }
                }
                if (cita.getServicio() != null) {
                    citaInfo.put("servicio", cita.getServicio().getNombre());
                }
                return citaInfo;
            }).toList());
            resultado.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            resultado.put("error", e.getMessage());
            resultado.put("timestamp", LocalDateTime.now());
            return ResponseEntity.status(500).body(resultado);
        }
    }

    /**
     * Endpoint para ejecutar manualmente el proceso de recordatorios
     * Útil para probar sin esperar la ejecución programada
     */
    @PostMapping("/ejecutar-ahora")
    public ResponseEntity<Map<String, Object>> ejecutarRecordatoriosAhora() {
        Map<String, Object> resultado = new HashMap<>();
        
        try {
            recordatorioService.enviarRecordatorios();
            resultado.put("exito", true);
            resultado.put("mensaje", "Proceso de recordatorios ejecutado manualmente");
            resultado.put("timestamp", LocalDateTime.now());
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            resultado.put("exito", false);
            resultado.put("error", e.getMessage());
            resultado.put("timestamp", LocalDateTime.now());
            return ResponseEntity.status(500).body(resultado);
        }
    }
}
