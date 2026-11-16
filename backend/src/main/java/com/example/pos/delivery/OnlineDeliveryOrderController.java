package com.example.pos.delivery;

import com.example.pos.customer.Customer;
import com.example.pos.customer.CustomerRepository;
import com.example.pos.delivery.aggregator.AggregatorClientService;
import com.example.pos.kitchen.KitchenOrder;
import com.example.pos.kitchen.KitchenOrderRepository;
import com.example.pos.order.RestaurantOrder;
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
@RequestMapping("/api/delivery-orders")
@CrossOrigin(origins = "*")
public class OnlineDeliveryOrderController {

    private final OnlineDeliveryOrderRepository deliveryRepository;
    private final RestaurantOrderRepository orderRepository;
    private final KitchenOrderRepository kitchenOrderRepository;
    private final OutletRepository outletRepository;
    private final CustomerRepository customerRepository;
    private final AggregatorClientService aggregatorClientService;

    public OnlineDeliveryOrderController(
            OnlineDeliveryOrderRepository deliveryRepository,
            RestaurantOrderRepository orderRepository,
            KitchenOrderRepository kitchenOrderRepository,
            OutletRepository outletRepository,
            CustomerRepository customerRepository,
            AggregatorClientService aggregatorClientService
    ) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.kitchenOrderRepository = kitchenOrderRepository;
        this.outletRepository = outletRepository;
        this.customerRepository = customerRepository;
        this.aggregatorClientService = aggregatorClientService;
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

        OnlineDeliveryOrder saved = deliveryRepository.save(order);
        syncCustomer(saved);
        return saved;
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

        // When order is Accepted -> automatically sync/fire KOT to RestaurantOrder and KitchenOrder tables
        if ("In Kitchen".equalsIgnoreCase(newStatus) || "Accepted".equalsIgnoreCase(newStatus)) {
            RestaurantOrder kitchenKot = new RestaurantOrder();
            kitchenKot.setOrderNumber(order.getOrderNumber());
            String numOnly = order.getOrderNumber().replaceAll("[^0-9]", "");
            String displayTable = order.getPlatform() + " #" + (numOnly.isBlank() ? order.getId() : numOnly);
            kitchenKot.setTableCode(displayTable);
            kitchenKot.setOrderType("Delivery");
            kitchenKot.setStatus("In Kitchen");
            kitchenKot.setItemsJson(order.getItemsJson());
            kitchenKot.setSubtotal(order.getSubtotal());
            kitchenKot.setTax(order.getTax());
            kitchenKot.setTotal(order.getTotalAmount());
            kitchenKot.setCustomerName(order.getCustomerName());
            kitchenKot.setCustomerPhone(order.getCustomerPhone());
            String kotNotes = "[" + order.getPlatform().toUpperCase() + "] " + order.getDeliveryAddress() +
                    (order.getRiderName() != null ? " | Rider: " + order.getRiderName() : "") +
                    (order.getInstructions() != null ? " | " + order.getInstructions() : "");
            kitchenKot.setNotes(kotNotes);
            kitchenKot.setOutletId(order.getOutletId());
            RestaurantOrder savedOrder = orderRepository.save(kitchenKot);

            // Also save to dedicated kitchen_orders table
            KitchenOrder ko = new KitchenOrder();
            ko.setKotNumber(order.getOrderNumber());
            ko.setOrderNumber(order.getOrderNumber());
            ko.setOrderId(savedOrder.getId());
            ko.setTableCode(displayTable);
            ko.setOrderType("Delivery");
            ko.setStatus("In Kitchen");
            ko.setItemsJson(order.getItemsJson());
            ko.setNotes(kotNotes);
            ko.setStation("Main Kitchen");
            ko.setPrepTimeMinutes(order.getPrepTimeMinutes() != null ? order.getPrepTimeMinutes() : 15);
            ko.setOutletId(order.getOutletId());
            kitchenOrderRepository.save(ko);

            // Notify Swiggy / Zomato API that order is accepted
            aggregatorClientService.acceptOrder(order, order.getPrepTimeMinutes() != null ? order.getPrepTimeMinutes() : 15);
        } else if ("Ready for Pickup".equalsIgnoreCase(newStatus)) {
            aggregatorClientService.markFoodReady(order);
            // Sync kitchen KOT and restaurant order
            if (order.getOrderNumber() != null) {
                kitchenOrderRepository.findByKotNumber(order.getOrderNumber()).ifPresent(ko -> {
                    ko.setStatus("Ready to Serve");
                    ko.setUpdatedAt(OffsetDateTime.now());
                    kitchenOrderRepository.save(ko);
                });
                orderRepository.findByOrderNumber(order.getOrderNumber()).ifPresent(ro -> {
                    ro.setStatus("Ready to Serve");
                    orderRepository.save(ro);
                });
            }
        } else if ("Completed".equalsIgnoreCase(newStatus)) {
            // Sync kitchen KOT and restaurant order
            if (order.getOrderNumber() != null) {
                kitchenOrderRepository.findByKotNumber(order.getOrderNumber()).ifPresent(ko -> {
                    ko.setStatus("Completed");
                    ko.setUpdatedAt(OffsetDateTime.now());
                    kitchenOrderRepository.save(ko);
                });
                orderRepository.findByOrderNumber(order.getOrderNumber()).ifPresent(ro -> {
                    ro.setStatus("Completed");
                    orderRepository.save(ro);
                });
            }
        } else if ("Rejected".equalsIgnoreCase(newStatus)) {
            aggregatorClientService.rejectOrder(order, "Order rejected by restaurant staff");
            if (order.getOrderNumber() != null) {
                kitchenOrderRepository.findByKotNumber(order.getOrderNumber()).ifPresent(ko -> {
                    ko.setStatus("Cancelled");
                    ko.setUpdatedAt(OffsetDateTime.now());
                    kitchenOrderRepository.save(ko);
                });
                orderRepository.findByOrderNumber(order.getOrderNumber()).ifPresent(ro -> {
                    ro.setStatus("Cancelled");
                    orderRepository.save(ro);
                });
            }
        }

        return deliveryRepository.save(order);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        deliveryRepository.deleteById(id);
    }

    private void syncCustomer(OnlineDeliveryOrder order) {
        if (order.getCustomerPhone() != null && !order.getCustomerPhone().isBlank()) {
            String phone = order.getCustomerPhone().trim();
            customerRepository.findByPhone(phone)
                    .map(c -> {
                        if (order.getCustomerName() != null && !order.getCustomerName().isBlank()) {
                            c.setName(order.getCustomerName());
                        }
                        c.setVisits(c.getVisits() + 1);
                        c.setTotalSpent(c.getTotalSpent() + (order.getTotalAmount() != null ? order.getTotalAmount() : 0.0));
                        c.setLoyaltyPoints(c.getLoyaltyPoints() + (int) ((order.getTotalAmount() != null ? order.getTotalAmount() : 0.0) / 10));
                        c.setLastVisitAt(OffsetDateTime.now());
                        return customerRepository.save(c);
                    })
                    .orElseGet(() -> {
                        Customer c = new Customer();
                        c.setPhone(phone);
                        c.setName(order.getCustomerName() != null && !order.getCustomerName().isBlank() ? order.getCustomerName() : "Customer " + phone);
                        c.setOutletId(order.getOutletId());
                        c.setVisits(1);
                        c.setTotalSpent(order.getTotalAmount() != null ? order.getTotalAmount() : 0.0);
                        c.setLoyaltyPoints((int) ((order.getTotalAmount() != null ? order.getTotalAmount() : 0.0) / 10));
                        c.setLastVisitAt(OffsetDateTime.now());
                        return customerRepository.save(c);
                    });
        }
    }
}
