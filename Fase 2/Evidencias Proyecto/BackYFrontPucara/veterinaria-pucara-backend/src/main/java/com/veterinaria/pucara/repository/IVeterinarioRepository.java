package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IVeterinarioRepository extends JpaRepository<Veterinario, Long> {
}
