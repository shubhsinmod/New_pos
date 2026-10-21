package com.example.pos.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    private final RestaurantOrderRepository repository;

    public OrderController(RestaurantOrderRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<RestaurantOrder> findAll(@RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return repository.findByOutletIdOrderByIdDesc(outletId);
        }
        return repository.findAllByOrderByIdDesc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RestaurantOrder create(@RequestBody RestaurantOrder order) {
        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            order.setOrderNumber("ORD-" + (System.currentTimeMillis() % 10000));
        }
        if (order.getStatus() == null) {
            order.setStatus("In Kitchen");
        }
        return repository.save(order);
    }

    @PutMapping("/{id}/status")
    public RestaurantOrder updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        RestaurantOrder order = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));

        if (body.containsKey("status")) {
            order.setStatus(body.get("status"));
        }
        return repository.save(order);
    }
}
