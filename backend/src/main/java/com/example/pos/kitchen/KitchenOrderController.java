package com.example.pos.kitchen;

import com.example.pos.order.RestaurantOrderRepository;
import com.example.pos.outlet.Outlet;
import com.example.pos.outlet.OutletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kitchen-orders")
@CrossOrigin(origins = "*")
public class KitchenOrderController {
    private final KitchenOrderRepository repository;
    private final OutletRepository outletRepository;
    private final RestaurantOrderRepository orderRepository;

    public KitchenOrderController(
            KitchenOrderRepository repository,
            OutletRepository outletRepository,
            RestaurantOrderRepository orderRepository
    ) {
        this.repository = repository;
        this.outletRepository = outletRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public List<KitchenOrder> findAll(
            @RequestParam(required = false) Long outletId,
            @RequestParam(required = false) String status
    ) {
        if (outletId != null) {
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("All")) {
                return repository.findByOutletIdAndStatusOrderByIdDesc(outletId, status);
            }
            return repository.findByOutletIdOrderByIdDesc(outletId);
        }
        return repository.findAllByOrderByIdDesc();
    }

    @GetMapping("/{id}")
    public KitchenOrder findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kitchen order not found: " + id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public KitchenOrder create(@RequestBody KitchenOrder order) {
        if (order.getKotNumber() == null || order.getKotNumber().isBlank()) {
            order.setKotNumber("KOT-" + (100 + (long)(Math.random() * 900)));
        }
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("In Kitchen");
        }
        if (order.getStation() == null || order.getStation().isBlank()) {
            order.setStation("Main Kitchen");
        }
        if (order.getPrepTimeMinutes() == null) {
            order.setPrepTimeMinutes(15);
        }
        if (order.getOutletId() == null) {
            Long defaultOutletId = outletRepository.findAll().stream()
                    .map(Outlet::getId)
                    .findFirst()
                    .orElse(1L);
            order.setOutletId(defaultOutletId);
        }
        if (order.getCreatedAt() == null) {
            order.setCreatedAt(OffsetDateTime.now());
        }
        order.setUpdatedAt(OffsetDateTime.now());
        return repository.save(order);
    }

    @PutMapping("/{id}/status")
    public KitchenOrder updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        KitchenOrder order = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kitchen order not found: " + id));

        if (body.containsKey("status")) {
            String newStatus = String.valueOf(body.get("status"));
            order.setStatus(newStatus);

            // Sync with restaurant_orders table if matching orderNumber / kotNumber exists
            String refNum = order.getOrderNumber() != null ? order.getOrderNumber() : order.getKotNumber();
            if (refNum != null && !refNum.isBlank()) {
                orderRepository.findByOrderNumber(refNum).ifPresent(ro -> {
                    ro.setStatus(newStatus);
                    orderRepository.save(ro);
                });
            }
        }
        if (body.containsKey("prepTimeMinutes")) {
            try {
                order.setPrepTimeMinutes(Integer.parseInt(String.valueOf(body.get("prepTimeMinutes"))));
            } catch (Exception ignored) {}
        }
        order.setUpdatedAt(OffsetDateTime.now());
        return repository.save(order);
    }

    @PutMapping("/{id}")
    public KitchenOrder update(@PathVariable Long id, @RequestBody KitchenOrder update) {
        KitchenOrder order = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kitchen order not found: " + id));

        if (update.getKotNumber() != null) order.setKotNumber(update.getKotNumber());
        if (update.getTableCode() != null) order.setTableCode(update.getTableCode());
        if (update.getOrderType() != null) order.setOrderType(update.getOrderType());
        if (update.getStatus() != null) {
            order.setStatus(update.getStatus());
            String refNum = order.getOrderNumber() != null ? order.getOrderNumber() : order.getKotNumber();
            if (refNum != null && !refNum.isBlank()) {
                orderRepository.findByOrderNumber(refNum).ifPresent(ro -> {
                    ro.setStatus(update.getStatus());
                    orderRepository.save(ro);
                });
            }
        }
        if (update.getItemsJson() != null) order.setItemsJson(update.getItemsJson());
        if (update.getNotes() != null) order.setNotes(update.getNotes());
        if (update.getStation() != null) order.setStation(update.getStation());
        if (update.getPrepTimeMinutes() != null) order.setPrepTimeMinutes(update.getPrepTimeMinutes());
        order.setUpdatedAt(OffsetDateTime.now());
        return repository.save(order);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Kitchen order not found: " + id);
        }
        repository.deleteById(id);
    }
}
