package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.HorarioPersonal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IHorarioPersonalRepository extends JpaRepository<HorarioPersonal, Long> {
}
