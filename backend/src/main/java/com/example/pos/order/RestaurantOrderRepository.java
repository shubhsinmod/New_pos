package com.example.pos.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RestaurantOrderRepository extends JpaRepository<RestaurantOrder, Long> {
    List<RestaurantOrder> findAllByOrderByIdDesc();
    List<RestaurantOrder> findByOutletIdOrderByIdDesc(Long outletId);
    Optional<RestaurantOrder> findByOrderNumber(String orderNumber);
    List<RestaurantOrder> findByTableCodeOrderByIdDesc(String tableCode);
}
