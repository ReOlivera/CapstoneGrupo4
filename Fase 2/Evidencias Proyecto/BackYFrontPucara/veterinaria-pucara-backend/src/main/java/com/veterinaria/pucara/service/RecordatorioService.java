package com.veterinaria.pucara.service;

import com.veterinaria.pucara.model.Cita;
import com.veterinaria.pucara.model.RecordatorioWhatsApp;
import com.veterinaria.pucara.repository.ICitaRepository;
import com.veterinaria.pucara.repository.IRecordatorioWhatsAppRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RecordatorioService {

    @Autowired
    private ICitaRepository citaRepository;

    @Autowired
    private IRecordatorioWhatsAppRepository recordatorioRepository;

    @Autowired
    private WhatsAppService whatsAppService;

    private static final String ESTADO_ACTIVA = "Activa";
    private static final int HORAS_ANTICIPACION = 24;

    /**
     * Tarea programada que se ejecuta cada hora para verificar citas pendientes
     * y enviar recordatorios 24 horas antes
     */
    @Scheduled(cron = "0 0 * * * ?") // Se ejecuta cada hora en el minuto 0
    public void enviarRecordatorios() {
        if (!whatsAppService.estaHabilitado()) {
            System.out.println("Recordatorios por WhatsApp deshabilitados o no configurados");
            return;
        }

        System.out.println("Iniciando verificación de recordatorios de citas...");

        try {
            // Obtener fecha y hora actual
            LocalDateTime ahora = LocalDateTime.now();
            LocalDate fechaRecordatorio = ahora.toLocalDate();

            // Buscar citas activas que están programadas para mañana (24 horas después)
            LocalDate fechaCita = fechaRecordatorio.plusDays(1);

            List<Cita> citasParaRecordar = citaRepository.findByFechaAndEstado(fechaCita, ESTADO_ACTIVA);

            System.out.println("Encontradas " + citasParaRecordar.size() + " citas para mañana");

            int recordatoriosEnviados = 0;
            int recordatoriosFallidos = 0;

            for (Cita cita : citasParaRecordar) {
                try {
                    // Verificar si ya se envió un recordatorio para esta cita
                    if (recordatorioRepository.existsByCitaId(cita.getId())) {
                        System.out.println("Ya existe un recordatorio para la cita ID: " + cita.getId());
                        continue;
                    }

                    // Verificar que la cita tenga mascota y propietario con teléfono
                    if (cita.getMascota() == null || 
                        cita.getMascota().getPropietario() == null ||
                        cita.getMascota().getPropietario().getTelefono() == null ||
                        cita.getMascota().getPropietario().getTelefono().trim().isEmpty()) {
                        System.out.println("La cita ID " + cita.getId() + " no tiene teléfono de contacto");
                        continue;
                    }

                    // Crear y guardar el recordatorio antes de enviarlo
                    RecordatorioWhatsApp recordatorio = new RecordatorioWhatsApp();
                    recordatorio.setCita(cita);
                    recordatorio.setNumeroWhatsApp(cita.getMascota().getPropietario().getTelefono());
                    recordatorio.setFechaEnvio(ahora);
                    recordatorio.setEnviado(false);
                    recordatorio = recordatorioRepository.save(recordatorio);

                    // Generar mensaje de recordatorio
                    String mensaje = generarMensajeRecordatorio(cita);
                    recordatorio.setMensajeEnviado(mensaje);

                    // Enviar mensaje de WhatsApp
                    boolean enviado = whatsAppService.enviarMensaje(
                        cita.getMascota().getPropietario().getTelefono(),
                        mensaje
                    );

                    if (enviado) {
                        recordatorio.setEnviado(true);
                        recordatorioRepository.save(recordatorio);
                        recordatoriosEnviados++;
                        System.out.println("Recordatorio enviado exitosamente para la cita ID: " + cita.getId());
                    } else {
                        recordatorio.setError("Error al enviar mensaje de WhatsApp");
                        recordatorioRepository.save(recordatorio);
                        recordatoriosFallidos++;
                        System.out.println("Error al enviar recordatorio para la cita ID: " + cita.getId());
                    }

                } catch (Exception e) {
                    System.err.println("Error al procesar recordatorio para la cita ID " + 
                                     cita.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                    recordatoriosFallidos++;
                }
            }

            System.out.println("Proceso de recordatorios completado. " +
                             "Enviados: " + recordatoriosEnviados + ", " +
                             "Fallidos: " + recordatoriosFallidos);

        } catch (Exception e) {
            System.err.println("Error en el proceso de recordatorios: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Genera el mensaje de recordatorio personalizado para una cita
     */
    private String generarMensajeRecordatorio(Cita cita) {
        StringBuilder mensaje = new StringBuilder();
        
        mensaje.append("🐾 *Recordatorio de Cita - Veterinaria Pucará*\n\n");
        
        if (cita.getMascota() != null && cita.getMascota().getPropietario() != null) {
            mensaje.append("Hola ").append(cita.getMascota().getPropietario().getNombre()).append(",\n\n");
        }
        
        mensaje.append("Te recordamos que tienes una cita agendada:\n\n");
        
        if (cita.getMascota() != null) {
            mensaje.append("🐕 *Mascota:* ").append(cita.getMascota().getNombre()).append("\n");
        }
        
        mensaje.append("📅 *Fecha:* ").append(formatearFecha(cita.getFecha())).append("\n");
        
        if (cita.getHora() != null) {
            mensaje.append("⏰ *Hora:* ").append(formatearHora(cita.getHora())).append("\n");
        }
        
        if (cita.getServicio() != null) {
            mensaje.append("⚕️ *Servicio:* ").append(cita.getServicio().getNombre()).append("\n");
        }
        
        if (cita.getMotivo() != null && !cita.getMotivo().trim().isEmpty()) {
            mensaje.append("📝 *Motivo:* ").append(cita.getMotivo()).append("\n");
        }
        
        mensaje.append("\n");
        mensaje.append("📍 *Ubicación:* [Agregar dirección de la veterinaria]\n");
        mensaje.append("📞 *Teléfono:* [Agregar teléfono de contacto]\n\n");
        mensaje.append("¡Te esperamos! 🐾");
        
        return mensaje.toString();
    }

    /**
     * Formatea una fecha en formato legible
     */
    private String formatearFecha(LocalDate fecha) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, d 'de' MMMM 'de' yyyy")
            .withLocale(java.util.Locale.forLanguageTag("es"));
        return fecha.format(formatter);
    }

    /**
     * Formatea una hora en formato legible
     */
    private String formatearHora(java.time.LocalTime hora) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return hora.format(formatter) + " hrs";
    }

    /**
     * Método manual para enviar un recordatorio de una cita específica
     * Útil para pruebas o envío inmediato
     */
    public boolean enviarRecordatorioManualmente(Long citaId) {
        try {
            Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada con ID: " + citaId));

            if (cita.getMascota() == null || 
                cita.getMascota().getPropietario() == null ||
                cita.getMascota().getPropietario().getTelefono() == null ||
                cita.getMascota().getPropietario().getTelefono().trim().isEmpty()) {
                throw new RuntimeException("La cita no tiene teléfono de contacto");
            }

            String mensaje = generarMensajeRecordatorio(cita);
            return whatsAppService.enviarMensaje(
                cita.getMascota().getPropietario().getTelefono(),
                mensaje
            );
        } catch (Exception e) {
            System.err.println("Error al enviar recordatorio manual: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
