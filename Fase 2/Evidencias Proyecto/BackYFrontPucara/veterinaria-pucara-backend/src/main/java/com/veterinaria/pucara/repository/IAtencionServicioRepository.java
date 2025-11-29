package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.AtencionServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAtencionServicioRepository extends JpaRepository<AtencionServicio, Long> {
    
    // Buscar por servicio
    @Query("SELECT a FROM AtencionServicio a WHERE a.servicio.id = :servicioId")
    List<AtencionServicio> findByServicioId(@Param("servicioId") Long servicioId);
}
