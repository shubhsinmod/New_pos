package com.example.pos.customer;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {
    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Customer> findAll(@RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return repository.findByOutletIdOrOutletIdIsNullOrderByTotalSpentDesc(outletId);
        }
        return repository.findAllByOrderByTotalSpentDesc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Customer saveOrUpdate(@RequestBody Customer customer) {
        if (customer.getPhone() != null && !customer.getPhone().isBlank()) {
            return repository.findByPhone(customer.getPhone())
                    .map(existing -> {
                        existing.setName(customer.getName());
                        if (customer.getVisits() != null) existing.setVisits(existing.getVisits() + customer.getVisits());
                        if (customer.getTotalSpent() != null) existing.setTotalSpent(existing.getTotalSpent() + customer.getTotalSpent());
                        if (customer.getLoyaltyPoints() != null) existing.setLoyaltyPoints(existing.getLoyaltyPoints() + customer.getLoyaltyPoints());
                        existing.setLastVisitAt(OffsetDateTime.now());
                        return repository.save(existing);
                    })
                    .orElseGet(() -> repository.save(customer));
        }
        return repository.save(customer);
    }
}
