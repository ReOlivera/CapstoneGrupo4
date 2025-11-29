package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "servicio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Integer duracion; // Duración en minutos
    private Boolean activo = true; // Estado: true = activo, false = inactivo
    private String imagenUrl; // URL de la imagen del servicio
}
