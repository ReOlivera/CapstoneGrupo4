package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IHistorialClinicoRepository extends JpaRepository<HistorialClinico, Long> {
}
