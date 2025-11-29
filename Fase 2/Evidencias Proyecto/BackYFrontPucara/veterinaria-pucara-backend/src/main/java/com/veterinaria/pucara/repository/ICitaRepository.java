package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ICitaRepository extends JpaRepository<Cita, Long> {
    
    // Buscar por estado
    List<Cita> findByEstado(String estado);
    
    // Buscar por fecha
    List<Cita> findByFecha(LocalDate fecha);
    
    // Buscar por servicio
    @Query("SELECT c FROM Cita c WHERE c.servicio.id = :servicioId")
    List<Cita> findByServicioId(@Param("servicioId") Long servicioId);
    
    // Buscar por fecha y estado
    List<Cita> findByFechaAndEstado(LocalDate fecha, String estado);
    
    // Buscar por servicio y estado
    @Query("SELECT c FROM Cita c WHERE c.servicio.id = :servicioId AND c.estado = :estado")
    List<Cita> findByServicioIdAndEstado(@Param("servicioId") Long servicioId, @Param("estado") String estado);
    
    // Buscar por fecha y servicio
    @Query("SELECT c FROM Cita c WHERE c.fecha = :fecha AND c.servicio.id = :servicioId")
    List<Cita> findByFechaAndServicioId(@Param("fecha") LocalDate fecha, @Param("servicioId") Long servicioId);
    
    // Buscar por fecha, servicio y estado
    @Query("SELECT c FROM Cita c WHERE c.fecha = :fecha AND c.servicio.id = :servicioId AND c.estado = :estado")
    List<Cita> findByFechaAndServicioIdAndEstado(@Param("fecha") LocalDate fecha, @Param("servicioId") Long servicioId, @Param("estado") String estado);
    
    // Buscar citas activas en un rango de fechas (para recordatorios)
    @Query("SELECT c FROM Cita c WHERE c.fecha BETWEEN :fechaInicio AND :fechaFin AND c.estado = :estado")
    List<Cita> findByFechaBetweenAndEstado(@Param("fechaInicio") LocalDate fechaInicio, 
                                            @Param("fechaFin") LocalDate fechaFin, 
                                            @Param("estado") String estado);
}
