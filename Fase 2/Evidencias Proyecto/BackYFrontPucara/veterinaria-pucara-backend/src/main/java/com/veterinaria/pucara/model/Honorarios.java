package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "honorarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Honorarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String periodo;
    private BigDecimal monto;
    private String estadoPago;
    private LocalDate fechaPago;

    @ManyToOne
    @JoinColumn(name = "id_veterinario")
    private Veterinario veterinario;
}
