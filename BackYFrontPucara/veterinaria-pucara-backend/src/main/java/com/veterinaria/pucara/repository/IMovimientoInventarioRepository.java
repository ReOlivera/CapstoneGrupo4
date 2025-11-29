package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IMovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {
}
