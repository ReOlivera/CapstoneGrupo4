package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.Atencion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IAtencionRepository extends JpaRepository<Atencion, Long> {
}
