package com.example.pos.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByOrderByIdAsc();
    List<Product> findByCategoryOrderByIdAsc(String category);

    @Query("SELECT p FROM Product p WHERE (:outletId IS NULL OR p.outletId = :outletId) ORDER BY p.id ASC")
    List<Product> findForOutlet(@Param("outletId") Long outletId);

    @Query("SELECT p FROM Product p WHERE (:outletId IS NULL OR p.outletId = :outletId) AND p.category = :category ORDER BY p.id ASC")
    List<Product> findForOutletAndCategory(@Param("outletId") Long outletId, @Param("category") String category);
}
