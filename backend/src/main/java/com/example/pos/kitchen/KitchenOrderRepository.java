package com.example.pos.kitchen;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, Long> {
    List<KitchenOrder> findByOutletIdOrderByIdDesc(Long outletId);
    List<KitchenOrder> findByOutletIdAndStatusOrderByIdDesc(Long outletId, String status);
    List<KitchenOrder> findAllByOrderByIdDesc();
    Optional<KitchenOrder> findByKotNumber(String kotNumber);
}
