package com.veterinaria.pucara.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "inventario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreProducto;
    private String descripcion;
    private String categoria; // Vacuna, Medicamento, Alimento, Insumo
    private Integer cantidad; // Stock actual
    private String unidad; // unidades, ml, kg, etc.
    private BigDecimal precio;
    private Integer stockMinimo;
    private LocalDate fechaIngreso;
    private LocalDate fechaVencimiento;
    private String estado; // Activo, Agotado, Vencido
    private String imagenUrl; // URL de la imagen del producto
}
