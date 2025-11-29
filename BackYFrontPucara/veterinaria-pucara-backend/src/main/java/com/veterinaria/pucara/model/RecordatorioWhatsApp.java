package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recordatorio_whatsapp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecordatorioWhatsApp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cita", nullable = false)
    private Cita cita;

    @Column(nullable = false)
    private String numeroWhatsApp;

    @Column(nullable = false)
    private LocalDateTime fechaEnvio;

    @Column(nullable = false)
    private Boolean enviado = false;

    private String mensajeEnviado;
    private String error;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
