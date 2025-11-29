package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "receta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String indicaciones;

    @ManyToOne
    @JoinColumn(name = "id_atencion")
    private Atencion atencion;
}
