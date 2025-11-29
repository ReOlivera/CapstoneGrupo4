package com.veterinaria.pucara.service;

import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class DocumentoService {

    private static final String PLANTILLAS_PATH = "/templates/documentos/";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generarCertificadoParvovirus(Map<String, Object> datos) throws IOException {
        // Cargar plantilla real desde resources
        InputStream templateStream = getClass().getResourceAsStream(PLANTILLAS_PATH + "certificado-parvovirus.docx");
        
        if (templateStream == null) {
            throw new IOException("No se encontró la plantilla: certificado-parvovirus.docx");
        }
        
        XWPFDocument document = new XWPFDocument(templateStream);
        
        // Preparar mapa de reemplazos
        Map<String, String> reemplazos = prepararReemplazos(datos);
        
        // Reemplazar placeholders en párrafos del cuerpo del documento
        reemplazarEnParrafos(document.getParagraphs(), reemplazos);
        
        // Reemplazar en tablas
        reemplazarEnTablas(document.getTables(), reemplazos);
        
        // Reemplazar en headers
        for (XWPFHeader header : document.getHeaderList()) {
            reemplazarEnParrafos(header.getParagraphs(), reemplazos);
            reemplazarEnTablas(header.getTables(), reemplazos);
        }
        
        // Reemplazar en footers
        for (XWPFFooter footer : document.getFooterList()) {
            reemplazarEnParrafos(footer.getParagraphs(), reemplazos);
            reemplazarEnTablas(footer.getTables(), reemplazos);
        }
        
        // Convertir a byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.write(baos);
        document.close();
        
        return baos.toByteArray();
    }

    public byte[] generarCertificadoAutorizacionCirugiaAnestesia(Map<String, Object> datos) throws IOException {
        // Cargar plantilla desde resources
        InputStream templateStream = getClass().getResourceAsStream(PLANTILLAS_PATH + "PLANTILLA-AUTORIZACION CIRUGIA-ANESTESIA.docx");
        
        if (templateStream == null) {
            throw new IOException("No se encontró la plantilla: PLANTILLA-AUTORIZACION CIRUGIA-ANESTESIA.docx");
        }
        
        XWPFDocument document = new XWPFDocument(templateStream);
        
        // Preparar mapa de reemplazos
        Map<String, String> reemplazos = prepararReemplazosAutorizacionCirugia(datos);
        
        // Reemplazar placeholders en párrafos del cuerpo del documento
        reemplazarEnParrafos(document.getParagraphs(), reemplazos);
        
        // Reemplazar en tablas
        reemplazarEnTablas(document.getTables(), reemplazos);
        
        // Reemplazar en headers
        for (XWPFHeader header : document.getHeaderList()) {
            reemplazarEnParrafos(header.getParagraphs(), reemplazos);
            reemplazarEnTablas(header.getTables(), reemplazos);
        }
        
        // Reemplazar en footers
        for (XWPFFooter footer : document.getFooterList()) {
            reemplazarEnParrafos(footer.getParagraphs(), reemplazos);
            reemplazarEnTablas(footer.getTables(), reemplazos);
        }
        
        // Convertir a byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.write(baos);
        document.close();
        
        return baos.toByteArray();
    }

    /**
     * Prepara el mapa de reemplazos para el certificado de autorización de cirugía y anestesia
     */
    private Map<String, String> prepararReemplazosAutorizacionCirugia(Map<String, Object> datos) {
        Map<String, String> reemplazos = new java.util.HashMap<>();
        
        // Datos de la mascota
        String nombreMascota = getString(datos, "datosMascota.nombre", "N/A");
        reemplazos.put("{PACIENTE}", nombreMascota);
        reemplazos.put("{ESPECIE}", getString(datos, "datosMascota.especie", "N/A"));
        reemplazos.put("{RAZA}", getString(datos, "datosMascota.raza", "N/A"));
        reemplazos.put("{EDAD}", getString(datos, "datosMascota.edad", "N/A"));
        reemplazos.put("{SEXO}", getString(datos, "datosMascota.sexo", "N/A"));
        
        // Datos adicionales de la mascota (del formulario)
        reemplazos.put("{COLOR}", getString(datos, "datosFormulario.color", "N/A"));
        reemplazos.put("{PESO}", getString(datos, "datosFormulario.peso", "N/A"));
        
        // Datos del propietario
        reemplazos.put("{PROPIETARIO}", getString(datos, "datosPropietario.nombre", "N/A"));
        reemplazos.put("{RUT}", getString(datos, "datosPropietario.rut", "N/A"));
        reemplazos.put("{FONO}", getString(datos, "datosPropietario.telefono", "N/A"));
        reemplazos.put("{CORREO}", getString(datos, "datosPropietario.email", "N/A"));
        
        // Datos adicionales del propietario (del formulario)
        reemplazos.put("{DIRECCION}", getString(datos, "datosFormulario.direccion", "N/A"));
        
        // Fecha (del formulario o fecha actual)
        String fecha = getString(datos, "datosFormulario.fecha");
        if (fecha != null && !fecha.isEmpty()) {
            reemplazos.put("{FECHA}", formatearFecha(fecha));
        } else {
            reemplazos.put("{FECHA}", LocalDate.now().format(DATE_FORMATTER));
        }
        
        return reemplazos;
    }

    public byte[] generarCertificadoSaludSAG(Map<String, Object> datos) throws IOException {
        // Cargar plantilla desde resources
        InputStream templateStream = getClass().getResourceAsStream(PLANTILLAS_PATH + "PLANTILLA-CERTIFICADO SALUD SAG.docx");
        
        if (templateStream == null) {
            throw new IOException("No se encontró la plantilla: PLANTILLA-CERTIFICADO SALUD SAG.docx");
        }
        
        XWPFDocument document = new XWPFDocument(templateStream);
        
        // Preparar mapa de reemplazos
        Map<String, String> reemplazos = prepararReemplazosSaludSAG(datos);
        
        // Reemplazar placeholders en párrafos del cuerpo del documento
        reemplazarEnParrafos(document.getParagraphs(), reemplazos);
        
        // Reemplazar en tablas
        reemplazarEnTablas(document.getTables(), reemplazos);
        
        // Reemplazar en headers
        for (XWPFHeader header : document.getHeaderList()) {
            reemplazarEnParrafos(header.getParagraphs(), reemplazos);
            reemplazarEnTablas(header.getTables(), reemplazos);
        }
        
        // Reemplazar en footers
        for (XWPFFooter footer : document.getFooterList()) {
            reemplazarEnParrafos(footer.getParagraphs(), reemplazos);
            reemplazarEnTablas(footer.getTables(), reemplazos);
        }
        
        // Convertir a byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.write(baos);
        document.close();
        
        return baos.toByteArray();
    }

    /**
     * Prepara el mapa de reemplazos para el certificado de salud SAG
     */
    private Map<String, String> prepararReemplazosSaludSAG(Map<String, Object> datos) {
        Map<String, String> reemplazos = new java.util.HashMap<>();
        
        // Datos de la mascota
        reemplazos.put("{NOMBRE_MASCOTA}", getString(datos, "datosMascota.nombre", "N/A"));
        reemplazos.put("{ESPECIE_MASCOTA}", getString(datos, "datosMascota.especie", "N/A"));
        reemplazos.put("{RAZA_MASCOTA}", getString(datos, "datosMascota.raza", "N/A"));
        reemplazos.put("{EDAD_MASCOTA}", getString(datos, "datosMascota.edad", "N/A"));
        reemplazos.put("{SEXO_MASCOTA}", getString(datos, "datosMascota.sexo", "N/A"));
        
        // Datos adicionales de la mascota (del formulario)
        reemplazos.put("{PESO_MASCOTA}", getString(datos, "datosFormulario.peso", "N/A"));
        reemplazos.put("{COLO_MASCOTA}", getString(datos, "datosFormulario.color", "N/A"));
        reemplazos.put("{NUMERO_CHIP}", getString(datos, "datosFormulario.numeroChip", "N/A"));
        
        // Datos del propietario
        reemplazos.put("{NOMBRE_PROPIETARIO}", getString(datos, "datosPropietario.nombre", "N/A"));
        reemplazos.put("{RUT_PROPIETARIO}", getString(datos, "datosPropietario.rut", "N/A"));
        reemplazos.put("{FONO_PROPIETARIO}", getString(datos, "datosPropietario.telefono", "N/A"));
        
        // Datos adicionales del propietario (del formulario)
        reemplazos.put("{DIRECCION_PROPIETARIO}", getString(datos, "datosFormulario.direccion", "N/A"));
        
        // Fecha del certificado (del formulario o fecha actual)
        String fechaCertificado = getString(datos, "datosFormulario.fechaCertificado");
        if (fechaCertificado != null && !fechaCertificado.isEmpty()) {
            reemplazos.put("{FECHA_CERTIFICADO}", formatearFecha(fechaCertificado));
        } else {
            reemplazos.put("{FECHA_CERTIFICADO}", LocalDate.now().format(DATE_FORMATTER));
        }
        
        // Fecha de incorporación y sitio de incorporación (del formulario)
        String fechaIncorporacion = getString(datos, "datosFormulario.fechaIncorporacion");
        if (fechaIncorporacion != null && !fechaIncorporacion.isEmpty()) {
            reemplazos.put("{FECHA_INCORPORACION}", formatearFecha(fechaIncorporacion));
        } else {
            reemplazos.put("{FECHA_INCORPORACION}", "N/A");
        }
        reemplazos.put("{SITIO_INCORPORACION}", getString(datos, "datosFormulario.sitioIncorporacion", "N/A"));
        
        return reemplazos;
    }

    public byte[] generarCertificadoRetrovirales(Map<String, Object> datos) throws IOException {
        // Cargar plantilla desde resources
        InputStream templateStream = getClass().getResourceAsStream(PLANTILLAS_PATH + "PLANTILLA-CERTIFICADO RETROVIRALES PUCARA.docx");
        
        if (templateStream == null) {
            throw new IOException("No se encontró la plantilla: PLANTILLA-CERTIFICADO RETROVIRALES PUCARA.docx");
        }
        
        XWPFDocument document = new XWPFDocument(templateStream);
        
        // Preparar mapa de reemplazos
        Map<String, String> reemplazos = prepararReemplazosRetrovirales(datos);
        
        // Reemplazar placeholders en párrafos del cuerpo del documento
        reemplazarEnParrafos(document.getParagraphs(), reemplazos);
        
        // Reemplazar en tablas
        reemplazarEnTablas(document.getTables(), reemplazos);
        
        // Reemplazar en headers
        for (XWPFHeader header : document.getHeaderList()) {
            reemplazarEnParrafos(header.getParagraphs(), reemplazos);
            reemplazarEnTablas(header.getTables(), reemplazos);
        }
        
        // Reemplazar en footers
        for (XWPFFooter footer : document.getFooterList()) {
            reemplazarEnParrafos(footer.getParagraphs(), reemplazos);
            reemplazarEnTablas(footer.getTables(), reemplazos);
        }
        
        // Convertir a byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.write(baos);
        document.close();
        
        return baos.toByteArray();
    }

    /**
     * Prepara el mapa de reemplazos para el certificado de retrovirales
     */
    private Map<String, String> prepararReemplazosRetrovirales(Map<String, Object> datos) {
        Map<String, String> reemplazos = new java.util.HashMap<>();
        
        // Datos del propietario
        reemplazos.put("{NOMBRE_PROPIETARIO}", getString(datos, "datosPropietario.nombre", "N/A"));
        
        // Datos de la mascota
        reemplazos.put("{NOMBRE_MASCOTA}", getString(datos, "datosMascota.nombre", "N/A"));
        reemplazos.put("{ESPECIE_MASCOTA}", getString(datos, "datosMascota.especie", "N/A"));
        reemplazos.put("{RAZA_MASCOTA}", getString(datos, "datosMascota.raza", "N/A"));
        reemplazos.put("{EDAD_MASCOTA}", getString(datos, "datosMascota.edad", "N/A"));
        reemplazos.put("{SEXO_MASCOTAS}", getString(datos, "datosMascota.sexo", "N/A"));
        
        // Fecha del certificado (del formulario o fecha actual)
        // Nota: El usuario especificó {FECHA_CETIFICADO} (con typo), usaré exactamente eso
        String fechaCertificado = getString(datos, "datosFormulario.fechaCertificado");
        if (fechaCertificado != null && !fechaCertificado.isEmpty()) {
            reemplazos.put("{FECHA_CETIFICADO}", formatearFecha(fechaCertificado));
        } else {
            reemplazos.put("{FECHA_CETIFICADO}", LocalDate.now().format(DATE_FORMATTER));
        }
        
        // Número de ficha (del formulario o ID de la mascota)
        String numFicha = getString(datos, "datosFormulario.numFicha");
        if (numFicha == null || numFicha.isEmpty()) {
            Object mascotaId = datos.get("mascotaId");
            numFicha = mascotaId != null ? mascotaId.toString() : "N/A";
        }
        reemplazos.put("{NUMERO_FICHA}", numFicha);
        
        // Nombre del solicitante (del formulario)
        reemplazos.put("{NOMBRE_SOLICITANTE}", getString(datos, "datosFormulario.nombreSolicitante", "N/A"));
        
        return reemplazos;
    }

    public byte[] generarCertificadoSaludPucara(Map<String, Object> datos) throws IOException {
        // Cargar plantilla desde resources
        InputStream templateStream = getClass().getResourceAsStream(PLANTILLAS_PATH + "PLANTILLA-CERTIFICADO SALUD pucara.docx");
        
        if (templateStream == null) {
            throw new IOException("No se encontró la plantilla: PLANTILLA-CERTIFICADO SALUD pucara.docx");
        }
        
        XWPFDocument document = new XWPFDocument(templateStream);
        
        // Preparar mapa de reemplazos
        Map<String, String> reemplazos = prepararReemplazosSaludPucara(datos);
        
        // Reemplazar placeholders en párrafos del cuerpo del documento
        reemplazarEnParrafos(document.getParagraphs(), reemplazos);
        
        // Reemplazar en tablas
        reemplazarEnTablas(document.getTables(), reemplazos);
        
        // Reemplazar en headers
        for (XWPFHeader header : document.getHeaderList()) {
            reemplazarEnParrafos(header.getParagraphs(), reemplazos);
            reemplazarEnTablas(header.getTables(), reemplazos);
        }
        
        // Reemplazar en footers
        for (XWPFFooter footer : document.getFooterList()) {
            reemplazarEnParrafos(footer.getParagraphs(), reemplazos);
            reemplazarEnTablas(footer.getTables(), reemplazos);
        }
        
        // Convertir a byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.write(baos);
        document.close();
        
        return baos.toByteArray();
    }

    /**
     * Prepara el mapa de reemplazos para el certificado de salud Pucara
     */
    private Map<String, String> prepararReemplazosSaludPucara(Map<String, Object> datos) {
        Map<String, String> reemplazos = new java.util.HashMap<>();
        
        // Datos de la mascota
        reemplazos.put("{NOMBRE_MASCOTA}", getString(datos, "datosMascota.nombre", "N/A"));
        reemplazos.put("{ESPECIE_MASCOTA}", getString(datos, "datosMascota.especie", "N/A"));
        reemplazos.put("{RAZA_MASCOTA}", getString(datos, "datosMascota.raza", "N/A"));
        reemplazos.put("{EDAD_MASCOTA}", getString(datos, "datosMascota.edad", "N/A"));
        reemplazos.put("{SEXO_MASCOTAS}", getString(datos, "datosMascota.sexo", "N/A"));
        
        // Datos adicionales de la mascota (del formulario)
        reemplazos.put("{PESO_MASCOTA}", getString(datos, "datosFormulario.peso", "N/A"));
        
        // Datos del propietario
        reemplazos.put("{NOMBRE_PROPIETARIO}", getString(datos, "datosPropietario.nombre", "N/A"));
        reemplazos.put("{TELEFONO_PROPIETARIO}", getString(datos, "datosPropietario.telefono", "N/A"));
        
        // Datos adicionales del propietario (del formulario)
        reemplazos.put("{DIRECCION_PROPIETARIO}", getString(datos, "datosFormulario.direccion", "N/A"));
        
        return reemplazos;
    }

    public byte[] generarCertificadoSAGIngles(Map<String, Object> datos) throws IOException {
        // Cargar plantilla desde resources
        InputStream templateStream = getClass().getResourceAsStream(PLANTILLAS_PATH + "PLANTILLA-CERT SAG INGLES.docx");
        
        if (templateStream == null) {
            throw new IOException("No se encontró la plantilla: PLANTILLA-CERT SAG INGLES.docx");
        }
        
        XWPFDocument document = new XWPFDocument(templateStream);
        
        // Preparar mapa de reemplazos
        Map<String, String> reemplazos = prepararReemplazosSAGIngles(datos);
        
        // Reemplazar placeholders en párrafos del cuerpo del documento
        reemplazarEnParrafos(document.getParagraphs(), reemplazos);
        
        // Reemplazar en tablas
        reemplazarEnTablas(document.getTables(), reemplazos);
        
        // Reemplazar en headers
        for (XWPFHeader header : document.getHeaderList()) {
            reemplazarEnParrafos(header.getParagraphs(), reemplazos);
            reemplazarEnTablas(header.getTables(), reemplazos);
        }
        
        // Reemplazar en footers
        for (XWPFFooter footer : document.getFooterList()) {
            reemplazarEnParrafos(footer.getParagraphs(), reemplazos);
            reemplazarEnTablas(footer.getTables(), reemplazos);
        }
        
        // Convertir a byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.write(baos);
        document.close();
        
        return baos.toByteArray();
    }

    /**
     * Prepara el mapa de reemplazos para el certificado SAG en inglés
     */
    private Map<String, String> prepararReemplazosSAGIngles(Map<String, Object> datos) {
        Map<String, String> reemplazos = new java.util.HashMap<>();
        
        // Datos de la mascota
        reemplazos.put("{NOMBRE_MASCOTA}", getString(datos, "datosMascota.nombre", "N/A"));
        reemplazos.put("{ESPECIE}", getString(datos, "datosMascota.especie", "N/A"));
        reemplazos.put("{RAZA}", getString(datos, "datosMascota.raza", "N/A"));
        reemplazos.put("{EDAD_MASCOYA}", getString(datos, "datosMascota.edad", "N/A")); // Nota: typo en variable original
        reemplazos.put("{SEXO}", getString(datos, "datosMascota.sexo", "N/A"));
        
        // Datos adicionales de la mascota (del formulario)
        reemplazos.put("{PESO}", getString(datos, "datosFormulario.peso", "N/A"));
        reemplazos.put("{COLOR}", getString(datos, "datosFormulario.color", "N/A"));
        reemplazos.put("{NUMERO_MICROCHIP}", getString(datos, "datosFormulario.numeroMicrochip", "N/A"));
        
        // Datos del chip (del formulario)
        String fechaChip = getString(datos, "datosFormulario.fechaChip");
        if (fechaChip != null && !fechaChip.isEmpty()) {
            reemplazos.put("{DATE_CHIP}", formatearFecha(fechaChip));
        } else {
            reemplazos.put("{DATE_CHIP}", "N/A");
        }
        reemplazos.put("{SITIO_CHIP}", getString(datos, "datosFormulario.sitioChip", "N/A"));
        
        // Datos del propietario
        reemplazos.put("{NOMBRE_PROPIETARIO}", getString(datos, "datosPropietario.nombre", "N/A"));
        reemplazos.put("{RUT}", getString(datos, "datosPropietario.rut", "N/A"));
        
        // Datos adicionales del propietario (del formulario)
        reemplazos.put("{DIRECCION}", getString(datos, "datosFormulario.direccion", "N/A"));
        reemplazos.put("{NUMERO}", getString(datos, "datosPropietario.telefono", "N/A")); // Número de teléfono
        
        return reemplazos;
    }

    /**
     * Prepara el mapa de reemplazos con los valores reales
     */
    private Map<String, String> prepararReemplazos(Map<String, Object> datos) {
        Map<String, String> reemplazos = new java.util.HashMap<>();
        
        // Datos de la mascota y propietario
        String nombreMascota = getString(datos, "datosMascota.nombre", "N/A");
        String nombrePropietario = getString(datos, "datosPropietario.nombre", "N/A");
        
        // CORRECCIÓN: El documento tiene los placeholders invertidos
        // {NOMBRE_PACIENTE} está en la sección "Paciente" → debe ser nombre de la MASCOTA
        reemplazos.put("{NOMBRE_PACIENTE}", nombreMascota);
        
        // {NOMBRE_MASCOTA} está en la sección "Propietario" → debe ser nombre del PROPIETARIO
        reemplazos.put("{NOMBRE_MASCOTA}", nombrePropietario);
        
        // Otros datos de la mascota
        reemplazos.put("{ESPECIE}", getString(datos, "datosMascota.especie", "N/A"));
        reemplazos.put("{RAZA}", getString(datos, "datosMascota.raza", "N/A"));
        reemplazos.put("{EDAD}", getString(datos, "datosMascota.edad", "N/A"));
        reemplazos.put("{SEXO}", getString(datos, "datosMascota.sexo", "N/A"));
        
        // Placeholders adicionales para propietario (por si acaso)
        reemplazos.put("{NOMBRE_PROPietario}", nombrePropietario);
        reemplazos.put("{PROPIETARIO}", nombrePropietario);
        
        // Fecha (del formulario o fecha actual)
        String fecha = getString(datos, "datosFormulario.fecha");
        if (fecha != null && !fecha.isEmpty()) {
            reemplazos.put("{FECHA}", formatearFecha(fecha));
        } else {
            reemplazos.put("{FECHA}", LocalDate.now().format(DATE_FORMATTER));
        }
        
        // Número de ficha (del formulario o ID de la mascota)
        String numFicha = getString(datos, "datosFormulario.numFicha");
        if (numFicha == null || numFicha.isEmpty()) {
            Object mascotaId = datos.get("mascotaId");
            numFicha = mascotaId != null ? mascotaId.toString() : "N/A";
        }
        reemplazos.put("{NUM_FICHA}", numFicha);
        
        // Doctor solicitante
        reemplazos.put("{DOCTOR_SOLICITANTE}", getString(datos, "datosFormulario.doctorSolicitante", "N/A"));
        
        return reemplazos;
    }
    
    /**
     * Reemplaza placeholders en una lista de párrafos
     */
    private void reemplazarEnParrafos(List<XWPFParagraph> parrafos, Map<String, String> reemplazos) {
        for (XWPFParagraph parrafo : parrafos) {
            reemplazarEnParrafo(parrafo, reemplazos);
        }
    }
    
    /**
     * Reemplaza placeholders en un párrafo
     */
    private void reemplazarEnParrafo(XWPFParagraph parrafo, Map<String, String> reemplazos) {
        String textoCompleto = parrafo.getText();
        
        // Verificar si el párrafo contiene algún placeholder
        boolean tienePlaceholder = false;
        for (String placeholder : reemplazos.keySet()) {
            if (textoCompleto.contains(placeholder)) {
                tienePlaceholder = true;
                break;
            }
        }
        
        if (!tienePlaceholder) {
            return;
        }
        
        // Reemplazar cada placeholder
        String textoReemplazado = textoCompleto;
        for (Map.Entry<String, String> entry : reemplazos.entrySet()) {
            textoReemplazado = textoReemplazado.replace(entry.getKey(), entry.getValue());
        }
        
        // Si el texto cambió, reemplazar los runs del párrafo
        if (!textoReemplazado.equals(textoCompleto)) {
            // Eliminar todos los runs existentes
            List<XWPFRun> runs = parrafo.getRuns();
            for (int i = runs.size() - 1; i >= 0; i--) {
                parrafo.removeRun(i);
            }
            
            // Agregar nuevo run con el texto reemplazado
            XWPFRun nuevoRun = parrafo.createRun();
            nuevoRun.setText(textoReemplazado);
            
            // Intentar mantener el formato del primer run original si existía
            if (!runs.isEmpty() && runs.get(0) != null) {
                XWPFRun runOriginal = runs.get(0);
                nuevoRun.setBold(runOriginal.isBold());
                nuevoRun.setItalic(runOriginal.isItalic());
                if (runOriginal.getFontSize() > 0) {
                    nuevoRun.setFontSize(runOriginal.getFontSize());
                }
                nuevoRun.setFontFamily(runOriginal.getFontFamily());
                nuevoRun.setColor(runOriginal.getColor());
            }
        }
    }
    
    /**
     * Reemplaza placeholders en tablas
     */
    private void reemplazarEnTablas(List<XWPFTable> tablas, Map<String, String> reemplazos) {
        for (XWPFTable tabla : tablas) {
            for (XWPFTableRow fila : tabla.getRows()) {
                for (XWPFTableCell celda : fila.getTableCells()) {
                    reemplazarEnParrafos(celda.getParagraphs(), reemplazos);
                }
            }
        }
    }

    private String getString(Map<String, Object> datos, String path) {
        return getString(datos, path, null);
    }
    
    @SuppressWarnings("unchecked")
    private String getString(Map<String, Object> datos, String path, String defaultValue) {
        String[] partes = path.split("\\.");
        Object current = datos;
        
        for (String parte : partes) {
            if (current == null) {
                return defaultValue;
            }
            
            if (current instanceof Map) {
                current = ((Map<String, Object>) current).get(parte);
            } else {
                return defaultValue;
            }
        }
        
        return current != null ? current.toString() : defaultValue;
    }

    private String formatearFecha(String fecha) {
        if (fecha == null || fecha.isEmpty()) {
            return "N/A";
        }
        try {
            // Si viene en formato YYYY-MM-DD
            if (fecha.contains("-") && fecha.length() == 10) {
                LocalDate date = LocalDate.parse(fecha);
                return date.format(DATE_FORMATTER);
            }
            return fecha;
        } catch (Exception e) {
            return fecha;
        }
    }
}

