package com.example.pos.table;

import com.example.pos.order.RestaurantOrder;
import com.example.pos.order.RestaurantOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "*")
public class DiningTableController {
    private final DiningTableRepository repository;
    private final RestaurantOrderRepository orderRepository;

    public DiningTableController(DiningTableRepository repository, RestaurantOrderRepository orderRepository) {
        this.repository = repository;
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public List<DiningTable> findAll(@RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return repository.findByOutletIdOrderByIdAsc(outletId);
        }
        return repository.findAllByOrderByIdAsc();
    }

    @GetMapping("/{code}")
    public DiningTable findByCode(@PathVariable String code) {
        return repository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found: " + code));
    }

    @GetMapping("/{code}/active-order")
    public Optional<RestaurantOrder> getActiveOrder(@PathVariable String code) {
        // Return latest active order for this table
        List<RestaurantOrder> orders = orderRepository.findByTableCodeOrderByIdDesc(code);
        return orders.stream()
                .filter(o -> !"Completed".equalsIgnoreCase(o.getStatus()))
                .findFirst()
                .or(() -> orders.stream().findFirst());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DiningTable create(@RequestBody DiningTable table) {
        if (table.getOutletId() == null) {
            table.setOutletId(1L);
        }
        return repository.save(table);
    }

    @PutMapping("/{code}/status")
    public DiningTable updateStatus(@PathVariable String code, @RequestBody Map<String, Object> body) {
        DiningTable table = repository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found: " + code));

        if (body.containsKey("status")) {
            table.setStatus((String) body.get("status"));
        }
        if (body.containsKey("runningTotal")) {
            Object rt = body.get("runningTotal");
            table.setRunningTotal(rt instanceof Number ? ((Number) rt).doubleValue() : 0.0);
        }
        if (body.containsKey("orderTime")) {
            table.setOrderTime((String) body.get("orderTime"));
        }
        if (body.containsKey("runningOrderId")) {
            table.setRunningOrderId((String) body.get("runningOrderId"));
        }
        if (body.containsKey("customerName")) {
            table.setCustomerName((String) body.get("customerName"));
        }
        if (body.containsKey("customerPhone")) {
            table.setCustomerPhone((String) body.get("customerPhone"));
        }
        if (body.containsKey("outletId")) {
            Object oid = body.get("outletId");
            if (oid instanceof Number) {
                table.setOutletId(((Number) oid).longValue());
            } else if (oid != null) {
                try {
                    table.setOutletId(Long.parseLong(oid.toString()));
                } catch (NumberFormatException ignored) {}
            }
        }

        return repository.save(table);
    }

    @PutMapping("/{code}/vacate")
    public DiningTable vacateTable(@PathVariable String code) {
        DiningTable table = repository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found: " + code));

        table.setStatus("Available");
        table.setRunningTotal(0.0);
        table.setOrderTime(null);
        table.setRunningOrderId(null);
        table.setCustomerName(null);
        table.setCustomerPhone(null);

        // Also mark any active orders for this table as Completed
        List<RestaurantOrder> activeOrders = orderRepository.findByTableCodeOrderByIdDesc(code);
        for (RestaurantOrder ord : activeOrders) {
            if (!"Completed".equalsIgnoreCase(ord.getStatus())) {
                ord.setStatus("Completed");
                orderRepository.save(ord);
            }
        }

        return repository.save(table);
    }
}
