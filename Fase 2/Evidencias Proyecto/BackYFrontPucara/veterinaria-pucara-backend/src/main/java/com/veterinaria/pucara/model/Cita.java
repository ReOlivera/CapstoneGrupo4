package com.veterinaria.pucara.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "cita")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate fecha;
    
    @JsonFormat(pattern = "HH:mm:ss")
    @Column(nullable = false)
    private LocalTime hora;
    private String motivo;
    private String diagnostico;
    private String tratamiento;
    private String estado; // Activa, Completada, Cancelada

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_mascota")
    private Mascota mascota;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_veterinario")
    private Veterinario veterinario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_servicio")
    private Servicio servicio;
}
