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
    public DiningTable findByCode(@PathVariable String code, @RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return repository.findByOutletIdAndCode(outletId, code)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found: " + code));
        }
        return repository.findFirstByCode(code)
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
        if (table.getCode() == null || table.getCode().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Table code is required.");
        }
        if (table.getName() == null || table.getName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Table name is required.");
        }

        String normalizedCode = table.getCode().trim().toUpperCase();
        table.setCode(normalizedCode);
        table.setName(table.getName().trim());

        if (repository.existsByOutletIdAndCode(table.getOutletId(), normalizedCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Table code " + normalizedCode + " already exists for this outlet.");
        }

        if (table.getStatus() == null || table.getStatus().isBlank()) {
            table.setStatus("Available");
        }
        if (table.getRunningTotal() == null) {
            table.setRunningTotal(0.0);
        }

        return repository.save(table);
    }

    @PutMapping("/{code}/status")
    public DiningTable updateStatus(@PathVariable String code, @RequestParam(required = false) Long outletId, @RequestBody Map<String, Object> body) {
        Long targetOutletId = outletId;
        if (targetOutletId == null && body.containsKey("outletId")) {
            Object oid = body.get("outletId");
            if (oid instanceof Number) {
                targetOutletId = ((Number) oid).longValue();
            } else if (oid != null) {
                try {
                    targetOutletId = Long.parseLong(oid.toString());
                } catch (NumberFormatException ignored) {}
            }
        }

        DiningTable table = (targetOutletId != null)
                ? repository.findByOutletIdAndCode(targetOutletId, code).orElse(null)
                : null;
        if (table == null) {
            table = repository.findFirstByCode(code)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found: " + code));
        }

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
    public DiningTable vacateTable(@PathVariable String code, @RequestParam(required = false) Long outletId) {
        DiningTable table = (outletId != null)
                ? repository.findByOutletIdAndCode(outletId, code).orElse(null)
                : null;
        if (table == null) {
            table = repository.findFirstByCode(code)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found: " + code));
        }

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
