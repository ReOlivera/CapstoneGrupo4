package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.AtencionPersonal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IAtencionPersonalRepository extends JpaRepository<AtencionPersonal, Long> {
}
