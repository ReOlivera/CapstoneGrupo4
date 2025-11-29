package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IMedicamentoRepository extends JpaRepository<Medicamento, Long> {
}
