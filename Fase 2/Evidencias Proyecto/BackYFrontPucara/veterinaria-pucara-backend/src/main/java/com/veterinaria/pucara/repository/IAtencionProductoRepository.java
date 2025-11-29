package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.AtencionProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IAtencionProductoRepository extends JpaRepository<AtencionProducto, Long> {
}
