package com.veterinaria.pucara.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    // Rutas donde se guardarán las imágenes (relativa al directorio del proyecto)
    private static final String UPLOAD_DIR_SERVICIOS = "src/main/resources/static/assets/servicios/";
    private static final String UPLOAD_DIR_PRODUCTOS = "src/main/resources/static/assets/productos/";
    private static final String PUBLIC_PATH_SERVICIOS = "/assets/servicios/";
    private static final String PUBLIC_PATH_PRODUCTOS = "/assets/productos/";
    
    // Tamaño máximo: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
    
    // Tipos de archivo permitidos
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"};

    /**
     * Guarda un archivo de imagen y retorna la ruta pública
     * @param file Archivo a guardar
     * @param tipo Tipo de imagen: "servicio" o "producto"
     */
    public String saveImage(MultipartFile file, String tipo) throws IOException {
        // Validar archivo
        validateFile(file);
        
        // Determinar directorio según el tipo
        String uploadDir;
        String publicPath;
        if ("producto".equalsIgnoreCase(tipo)) {
            uploadDir = UPLOAD_DIR_PRODUCTOS;
            publicPath = PUBLIC_PATH_PRODUCTOS;
        } else {
            // Por defecto, servicios
            uploadDir = UPLOAD_DIR_SERVICIOS;
            publicPath = PUBLIC_PATH_SERVICIOS;
        }
        
        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        
        // Guardar archivo
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Retornar ruta pública
        return publicPath + uniqueFilename;
    }
    
    /**
     * Guarda un archivo de imagen para servicios (método de compatibilidad)
     */
    public String saveImage(MultipartFile file) throws IOException {
        return saveImage(file, "servicio");
    }

    /**
     * Elimina un archivo de imagen
     */
    public boolean deleteImage(String imagePath) {
        try {
            if (imagePath == null || imagePath.isEmpty()) {
                return false;
            }
            
            // Determinar directorio según la ruta
            String uploadDir;
            String publicPath;
            if (imagePath.contains("/productos/")) {
                uploadDir = UPLOAD_DIR_PRODUCTOS;
                publicPath = PUBLIC_PATH_PRODUCTOS;
            } else {
                uploadDir = UPLOAD_DIR_SERVICIOS;
                publicPath = PUBLIC_PATH_SERVICIOS;
            }
            
            // Extraer nombre del archivo de la ruta pública
            String filename = imagePath.replace(publicPath, "");
            Path filePath = Paths.get(uploadDir, filename);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return true;
            }
            return false;
        } catch (IOException e) {
            System.err.println("Error al eliminar archivo: " + e.getMessage());
            return false;
        }
    }

    /**
     * Valida el archivo antes de guardarlo
     */
    private void validateFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("El archivo está vacío");
        }
        
        // Validar tamaño
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IOException("El archivo es demasiado grande. Tamaño máximo: 5MB");
        }
        
        // Validar tipo
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedType(contentType)) {
            throw new IOException("Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP");
        }
    }

    /**
     * Verifica si el tipo de archivo está permitido
     */
    private boolean isAllowedType(String contentType) {
        for (String allowedType : ALLOWED_TYPES) {
            if (contentType.equalsIgnoreCase(allowedType)) {
                return true;
            }
        }
        return false;
    }
}

