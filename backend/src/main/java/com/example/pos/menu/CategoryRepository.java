package com.example.pos.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByActiveTrueOrderByDisplayOrderAsc();

    @Query("SELECT c FROM Category c WHERE c.active = true AND (:outletId IS NULL OR c.outletId = :outletId) ORDER BY c.displayOrder ASC")
    List<Category> findForOutlet(@Param("outletId") Long outletId);
}
