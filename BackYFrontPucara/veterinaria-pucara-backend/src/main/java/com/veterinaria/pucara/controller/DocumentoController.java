package com.veterinaria.pucara.controller;

import com.veterinaria.pucara.dto.GenerarDocumentoRequest;
import com.veterinaria.pucara.service.DocumentoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/documentos")
@CrossOrigin(origins = "*")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @PostMapping("/generar")
    public ResponseEntity<?> generarDocumento(@RequestBody GenerarDocumentoRequest request) {
        try {
            // Validaciones básicas
            if (request.getDocumentoId() == null || request.getDocumentoId().isEmpty()) {
                return ResponseEntity.badRequest().body("El ID del documento es requerido");
            }

            if (request.getMascotaId() == null) {
                return ResponseEntity.badRequest().body("El ID de la mascota es requerido");
            }

            byte[] documentoBytes = null;
            String nombreArchivo = "";
            String contentType = "";

            // Convertir request a Map para el servicio
            Map<String, Object> datos = new HashMap<>();
            datos.put("documentoId", request.getDocumentoId());
            datos.put("mascotaId", request.getMascotaId());
            datos.put("propietarioId", request.getPropietarioId());
            datos.put("datosMascota", request.getDatosMascota());
            datos.put("datosPropietario", request.getDatosPropietario());
            datos.put("datosFormulario", request.getDatosFormulario());

            // Generar documento según el tipo
            switch (request.getDocumentoId()) {
                case "certificado-parvovirus":
                    documentoBytes = documentoService.generarCertificadoParvovirus(datos);
                    nombreArchivo = "Certificado_Parvovirus_" + 
                        (request.getDatosMascota() != null && request.getDatosMascota().get("nombre") != null 
                            ? request.getDatosMascota().get("nombre").toString() 
                            : "documento") + ".docx";
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                case "certificado-autorizacion-cirugia-anestesia":
                    documentoBytes = documentoService.generarCertificadoAutorizacionCirugiaAnestesia(datos);
                    nombreArchivo = "Certificado_Autorizacion_Cirugia_Anestesia_" + 
                        (request.getDatosMascota() != null && request.getDatosMascota().get("nombre") != null 
                            ? request.getDatosMascota().get("nombre").toString() 
                            : "documento") + ".docx";
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                case "certificado-salud-sag":
                    documentoBytes = documentoService.generarCertificadoSaludSAG(datos);
                    nombreArchivo = "Certificado_Salud_SAG_" + 
                        (request.getDatosMascota() != null && request.getDatosMascota().get("nombre") != null 
                            ? request.getDatosMascota().get("nombre").toString() 
                            : "documento") + ".docx";
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                case "certificado-retrovirales":
                    documentoBytes = documentoService.generarCertificadoRetrovirales(datos);
                    nombreArchivo = "Certificado_Retrovirales_" + 
                        (request.getDatosMascota() != null && request.getDatosMascota().get("nombre") != null 
                            ? request.getDatosMascota().get("nombre").toString() 
                            : "documento") + ".docx";
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                case "certificado-salud-pucara":
                    documentoBytes = documentoService.generarCertificadoSaludPucara(datos);
                    nombreArchivo = "Certificado_Salud_Pucara_" + 
                        (request.getDatosMascota() != null && request.getDatosMascota().get("nombre") != null 
                            ? request.getDatosMascota().get("nombre").toString() 
                            : "documento") + ".docx";
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                case "certificado-sag-ingles":
                    documentoBytes = documentoService.generarCertificadoSAGIngles(datos);
                    nombreArchivo = "Certificado_SAG_Ingles_" + 
                        (request.getDatosMascota() != null && request.getDatosMascota().get("nombre") != null 
                            ? request.getDatosMascota().get("nombre").toString() 
                            : "documento") + ".docx";
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                default:
                    return ResponseEntity.badRequest().body("Tipo de documento no soportado: " + request.getDocumentoId());
            }

            if (documentoBytes == null || documentoBytes.length == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al generar el documento");
            }

            // Preparar headers para descarga
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", nombreArchivo);
            headers.setContentLength(documentoBytes.length);

            return ResponseEntity.ok()
                .headers(headers)
                .body(documentoBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al generar el documento: " + e.getMessage());
        }
    }

    @GetMapping("/listar")
    public ResponseEntity<?> listarDocumentos() {
        try {
            Map<String, Object> documentos = new HashMap<>();
            documentos.put("documentos", java.util.Arrays.asList(
                Map.of(
                    "id", "certificado-parvovirus",
                    "nombre", "Certificado Parvovirus",
                    "descripcion", "Certificado de vacunación contra parvovirus"
                ),
                Map.of(
                    "id", "certificado-autorizacion-cirugia-anestesia",
                    "nombre", "Certificado de Autorización de Cirugía y Anestesia",
                    "descripcion", "Certificado de autorización para procedimientos quirúrgicos y anestesia"
                ),
                Map.of(
                    "id", "certificado-salud-sag",
                    "nombre", "Certificado de Salud SAG",
                    "descripcion", "Certificado de salud para el Servicio Agrícola y Ganadero"
                ),
                Map.of(
                    "id", "certificado-retrovirales",
                    "nombre", "Certificado Retrovirales",
                    "descripcion", "Certificado de análisis retrovirales"
                ),
                Map.of(
                    "id", "certificado-salud-pucara",
                    "nombre", "Certificado de Salud Pucara",
                    "descripcion", "Certificado de salud general de la clínica Pucara"
                ),
                Map.of(
                    "id", "certificado-sag-ingles",
                    "nombre", "Certificado SAG Inglés",
                    "descripcion", "Certificado de salud SAG en inglés"
                )
            ));
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al listar documentos: " + e.getMessage());
        }
    }
}

