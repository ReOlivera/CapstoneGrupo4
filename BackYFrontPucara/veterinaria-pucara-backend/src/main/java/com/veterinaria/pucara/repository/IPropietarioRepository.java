package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.Propietario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IPropietarioRepository extends JpaRepository<Propietario, Long> {
    Optional<Propietario> findByRut(String rut);
}
