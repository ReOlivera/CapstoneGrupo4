package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "atencion_personal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtencionPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_atencion")
    private Atencion atencion;

    @ManyToOne
    @JoinColumn(name = "id_personal")
    private Personal personal;
}
