package com.veterinaria.pucara.repository;

import com.veterinaria.pucara.model.RecetaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IRecetaItemRepository extends JpaRepository<RecetaItem, Long> {
}
