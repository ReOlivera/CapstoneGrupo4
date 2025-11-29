package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.Honorarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IHonorariosRepository extends JpaRepository<Honorarios, Long> {
}
