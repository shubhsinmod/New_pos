package com.example.pos.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findAllByOrderByIdDesc();
    List<Bill> findByOutletIdOrderByIdDesc(Long outletId);
    Optional<Bill> findByBillNumber(String billNumber);
}
