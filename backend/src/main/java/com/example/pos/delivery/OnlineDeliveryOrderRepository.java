package com.example.pos.delivery;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OnlineDeliveryOrderRepository extends JpaRepository<OnlineDeliveryOrder, Long> {
    List<OnlineDeliveryOrder> findAllByOrderByCreatedAtDesc();
    List<OnlineDeliveryOrder> findByOutletIdOrderByCreatedAtDesc(Long outletId);
    List<OnlineDeliveryOrder> findByOutletIdAndStatusOrderByCreatedAtDesc(Long outletId, String status);
}
