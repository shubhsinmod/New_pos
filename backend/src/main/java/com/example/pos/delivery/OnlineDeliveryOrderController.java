package com.example.pos.delivery;

import com.example.pos.order.RestaurantOrder;
import com.example.pos.order.RestaurantOrderRepository;
import com.example.pos.outlet.Outlet;
import com.example.pos.outlet.OutletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-orders")
@CrossOrigin(origins = "*")
public class OnlineDeliveryOrderController {

    private final OnlineDeliveryOrderRepository deliveryRepository;
    private final RestaurantOrderRepository orderRepository;
    private final OutletRepository outletRepository;

    public OnlineDeliveryOrderController(
            OnlineDeliveryOrderRepository deliveryRepository,
            RestaurantOrderRepository orderRepository,
            OutletRepository outletRepository
    ) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.outletRepository = outletRepository;
    }

    @GetMapping
    public List<OnlineDeliveryOrder> findAll(
            @RequestParam(required = false) Long outletId,
            @RequestParam(required = false) String status
    ) {
        if (outletId != null && status != null && !status.isBlank() && !"All".equalsIgnoreCase(status)) {
            return deliveryRepository.findByOutletIdAndStatusOrderByCreatedAtDesc(outletId, status);
        } else if (outletId != null) {
            return deliveryRepository.findByOutletIdOrderByCreatedAtDesc(outletId);
        }
        return deliveryRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public OnlineDeliveryOrder findById(@PathVariable Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery order not found: " + id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OnlineDeliveryOrder create(@RequestBody OnlineDeliveryOrder order) {
        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            order.setOrderNumber("DEL-" + (System.currentTimeMillis() % 10000));
        }
        if (order.getPlatform() == null || order.getPlatform().isBlank()) {
            order.setPlatform("Zomato");
        }
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("Pending Acceptance");
        }
        if (order.getOutletId() == null) {
            Long defaultOutletId = outletRepository.findAll().stream()
                    .map(Outlet::getId)
                    .findFirst()
                    .orElse(1L);
            order.setOutletId(defaultOutletId);
        }
        return deliveryRepository.save(order);
    }

    @PutMapping("/{id}")
    public OnlineDeliveryOrder update(@PathVariable Long id, @RequestBody OnlineDeliveryOrder updateData) {
        OnlineDeliveryOrder existing = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery order not found: " + id));

        if (updateData.getCustomerName() != null) existing.setCustomerName(updateData.getCustomerName());
        if (updateData.getCustomerPhone() != null) existing.setCustomerPhone(updateData.getCustomerPhone());
        if (updateData.getDeliveryAddress() != null) existing.setDeliveryAddress(updateData.getDeliveryAddress());
        if (updateData.getInstructions() != null) existing.setInstructions(updateData.getInstructions());
        if (updateData.getRiderName() != null) existing.setRiderName(updateData.getRiderName());
        if (updateData.getRiderPhone() != null) existing.setRiderPhone(updateData.getRiderPhone());
        if (updateData.getRiderEta() != null) existing.setRiderEta(updateData.getRiderEta());
        if (updateData.getStatus() != null) existing.setStatus(updateData.getStatus());
        if (updateData.getPrepTimeMinutes() != null) existing.setPrepTimeMinutes(updateData.getPrepTimeMinutes());
        if (updateData.getTotalAmount() != null) existing.setTotalAmount(updateData.getTotalAmount());
        if (updateData.getItemsJson() != null) existing.setItemsJson(updateData.getItemsJson());

        return deliveryRepository.save(existing);
    }

    @PutMapping("/{id}/status")
    public OnlineDeliveryOrder updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        OnlineDeliveryOrder order = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery order not found: " + id));

        String newStatus = body.containsKey("status") ? body.get("status").toString() : order.getStatus();
        order.setStatus(newStatus);

        if (body.containsKey("prepTimeMinutes")) {
            try {
                order.setPrepTimeMinutes(Integer.parseInt(body.get("prepTimeMinutes").toString()));
            } catch (Exception ignored) {}
        }

        // When order is Accepted -> automatically sync/fire KOT to RestaurantOrder table so kitchen sees it
        if ("In Kitchen".equalsIgnoreCase(newStatus) || "Accepted".equalsIgnoreCase(newStatus)) {
            RestaurantOrder kitchenKot = new RestaurantOrder();
            kitchenKot.setOrderNumber(order.getOrderNumber());
            String numOnly = order.getOrderNumber().replaceAll("[^0-9]", "");
            kitchenKot.setTableCode(order.getPlatform() + " #" + (numOnly.isBlank() ? order.getId() : numOnly));
            kitchenKot.setOrderType("Delivery");
            kitchenKot.setStatus("In Kitchen");
            kitchenKot.setItemsJson(order.getItemsJson());
            kitchenKot.setSubtotal(order.getSubtotal());
            kitchenKot.setTax(order.getTax());
            kitchenKot.setTotal(order.getTotalAmount());
            kitchenKot.setCustomerName(order.getCustomerName());
            kitchenKot.setCustomerPhone(order.getCustomerPhone());
            kitchenKot.setNotes("[" + order.getPlatform().toUpperCase() + "] " + order.getDeliveryAddress() +
                    (order.getRiderName() != null ? " | Rider: " + order.getRiderName() : "") +
                    (order.getInstructions() != null ? " | " + order.getInstructions() : ""));
            kitchenKot.setOutletId(order.getOutletId());
            orderRepository.save(kitchenKot);
        }

        return deliveryRepository.save(order);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        deliveryRepository.deleteById(id);
    }
}
