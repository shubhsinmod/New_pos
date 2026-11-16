package com.example.pos.table;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {
    List<DiningTable> findAllByOrderByIdAsc();
    List<DiningTable> findByOutletIdOrderByIdAsc(Long outletId);
    Optional<DiningTable> findByOutletIdAndCode(Long outletId, String code);
    Optional<DiningTable> findFirstByCode(String code);
    default Optional<DiningTable> findByCode(String code) {
        return findFirstByCode(code);
    }
    boolean existsByOutletIdAndCode(Long outletId, String code);
}
