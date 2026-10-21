package com.example.pos.settlement;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findAllByOrderBySettledAtDesc();
    List<Settlement> findByOutletIdOrderBySettledAtDesc(Long outletId);
    Optional<Settlement> findBySettlementNumber(String settlementNumber);
    Optional<Settlement> findByBillNumber(String billNumber);
    List<Settlement> findByTableCodeOrderBySettledAtDesc(String tableCode);
}
