package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IHorarioRepository extends JpaRepository<Horario, Long> {
}
