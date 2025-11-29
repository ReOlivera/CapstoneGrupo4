package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "atencion_servicio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtencionServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;

    @ManyToOne
    @JoinColumn(name = "id_atencion")
    private Atencion atencion;

    @ManyToOne
    @JoinColumn(name = "id_servicio")
    private Servicio servicio;
}
