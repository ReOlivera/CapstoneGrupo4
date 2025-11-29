package com.veterinaria.pucara.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerarDocumentoRequest {
    private String documentoId;
    private Long mascotaId;
    private Long propietarioId;
    private Map<String, Object> datosMascota;
    private Map<String, Object> datosPropietario;
    private Map<String, Object> datosFormulario;
}

