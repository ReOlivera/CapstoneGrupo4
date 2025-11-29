package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.RecordatorioWhatsApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IRecordatorioWhatsAppRepository extends JpaRepository<RecordatorioWhatsApp, Long> {
    
    // Buscar recordatorio por cita
    Optional<RecordatorioWhatsApp> findByCitaId(Long citaId);
    
    // Buscar recordatorios enviados para una cita
    @Query("SELECT r FROM RecordatorioWhatsApp r WHERE r.cita.id = :citaId AND r.enviado = true")
    List<RecordatorioWhatsApp> findEnviadosByCitaId(@Param("citaId") Long citaId);
    
    // Verificar si ya existe un recordatorio para una cita
    boolean existsByCitaId(Long citaId);
}
