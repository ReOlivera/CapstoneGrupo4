package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "atencion_producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtencionProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer cantidad;

    @ManyToOne
    @JoinColumn(name = "id_atencion")
    private Atencion atencion;

    @ManyToOne
    @JoinColumn(name = "id_inventario")
    private Inventario inventario;
}
