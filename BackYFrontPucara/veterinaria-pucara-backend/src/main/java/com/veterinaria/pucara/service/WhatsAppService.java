package com.veterinaria.pucara.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class WhatsAppService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.whatsapp.from:whatsapp:+14155238886}")
    private String whatsappFrom;

    @Value("${whatsapp.reminders.enabled:false}")
    private boolean remindersEnabled;

    @PostConstruct
    public void init() {
        if (remindersEnabled && accountSid != null && !accountSid.isEmpty() && 
            authToken != null && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
            System.out.println("WhatsApp Service inicializado correctamente");
        } else {
            System.out.println("WhatsApp Service deshabilitado o sin configuración");
        }
    }

    /**
     * Envía un mensaje de WhatsApp
     * @param to Número de WhatsApp del destinatario (formato: whatsapp:+56912345678)
     * @param message Mensaje a enviar
     * @return true si se envió correctamente, false en caso contrario
     */
    public boolean enviarMensaje(String to, String message) {
        if (!remindersEnabled) {
            System.out.println("Recordatorios por WhatsApp deshabilitados");
            return false;
        }

        if (accountSid == null || accountSid.isEmpty() || 
            authToken == null || authToken.isEmpty()) {
            System.out.println("Credenciales de Twilio no configuradas");
            return false;
        }

        try {
            // Asegurar que el número tenga el formato correcto
            String numeroFormateado = formatearNumeroWhatsApp(to);
            
            // Crear el mensaje
            Message mensaje = Message.creator(
                new PhoneNumber(numeroFormateado),
                new PhoneNumber(whatsappFrom),
                message
            ).create();

            System.out.println("Mensaje de WhatsApp enviado exitosamente. SID: " + mensaje.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("Error al enviar mensaje de WhatsApp: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Formatea un número de teléfono al formato de WhatsApp de Twilio
     * @param numero Número de teléfono (puede estar en diferentes formatos)
     * @return Número formateado como whatsapp:+56912345678
     */
    private String formatearNumeroWhatsApp(String numero) {
        if (numero == null || numero.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de teléfono no puede estar vacío");
        }

        // Remover espacios, guiones, paréntesis y otros caracteres
        String numeroLimpio = numero.replaceAll("[\\s\\-\\(\\)\\.]", "");

        // Si ya tiene el prefijo whatsapp:, retornarlo
        if (numeroLimpio.startsWith("whatsapp:")) {
            return numeroLimpio;
        }

        // Si comienza con +, agregar whatsapp:
        if (numeroLimpio.startsWith("+")) {
            return "whatsapp:" + numeroLimpio;
        }

        // Si comienza con 569 (código de país de Chile), agregar + y whatsapp:
        if (numeroLimpio.startsWith("569")) {
            return "whatsapp:+" + numeroLimpio;
        }

        // Si comienza con 9 (Chile sin código de país), agregar +56 y whatsapp:
        if (numeroLimpio.startsWith("9") && numeroLimpio.length() == 9) {
            return "whatsapp:+56" + numeroLimpio;
        }

        // Por defecto, agregar +56 si es un número chileno
        if (numeroLimpio.length() == 9 && numeroLimpio.matches("^9\\d{8}$")) {
            return "whatsapp:+56" + numeroLimpio;
        }

        // Si tiene 8 dígitos, asumir que es chileno
        if (numeroLimpio.length() == 8 && numeroLimpio.matches("^\\d{8}$")) {
            return "whatsapp:+569" + numeroLimpio;
        }

        // Si no coincide con ningún patrón, agregar whatsapp: y el número tal cual
        return "whatsapp:+" + numeroLimpio;
    }

    /**
     * Verifica si el servicio está habilitado y configurado
     * @return true si está listo para usar, false en caso contrario
     */
    public boolean estaHabilitado() {
        return remindersEnabled && 
               accountSid != null && !accountSid.isEmpty() && 
               authToken != null && !authToken.isEmpty();
    }
}
