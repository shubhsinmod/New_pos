package com.example.pos.customer;

import com.example.pos.outlet.Outlet;
import com.example.pos.outlet.OutletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository repository;
    private final OutletRepository outletRepository;

    public CustomerController(CustomerRepository repository, OutletRepository outletRepository) {
        this.repository = repository;
        this.outletRepository = outletRepository;
    }

    @GetMapping
    public List<Customer> findAll(@RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return repository.findByOutletIdOrOutletIdIsNullOrderByTotalSpentDesc(outletId);
        }
        return repository.findAllByOrderByTotalSpentDesc();
    }

    @GetMapping("/{id}")
    public Customer findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Customer saveOrUpdate(@RequestBody Customer customer) {
        if (customer.getName() == null || customer.getName().isBlank()) {
            customer.setName(customer.getPhone() != null && !customer.getPhone().isBlank() ? "Customer " + customer.getPhone() : "Walk-in Guest");
        }
        if (customer.getOutletId() == null) {
            Long defaultOid = outletRepository.findAll().stream()
                    .map(Outlet::getId)
                    .findFirst()
                    .orElse(1L);
            customer.setOutletId(defaultOid);
        }
        if (customer.getVisits() == null) customer.setVisits(1);
        if (customer.getTotalSpent() == null) customer.setTotalSpent(0.0);
        if (customer.getLoyaltyPoints() == null) customer.setLoyaltyPoints((int) (customer.getTotalSpent() / 10));
        if (customer.getLastVisitAt() == null) customer.setLastVisitAt(OffsetDateTime.now());

        if (customer.getPhone() != null && !customer.getPhone().isBlank()) {
            return repository.findByPhone(customer.getPhone().trim())
                    .map(existing -> {
                        existing.setName(customer.getName());
                        if (customer.getEmail() != null) existing.setEmail(customer.getEmail());
                        if (customer.getVisits() != null && customer.getVisits() > 1) {
                            existing.setVisits(existing.getVisits() + customer.getVisits());
                        }
                        if (customer.getTotalSpent() != null && customer.getTotalSpent() > 0) {
                            existing.setTotalSpent(existing.getTotalSpent() + customer.getTotalSpent());
                            existing.setLoyaltyPoints(existing.getLoyaltyPoints() + (int) (customer.getTotalSpent() / 10));
                        }
                        if (customer.getOutletId() != null) existing.setOutletId(customer.getOutletId());
                        existing.setLastVisitAt(OffsetDateTime.now());
                        return repository.save(existing);
                    })
                    .orElseGet(() -> repository.save(customer));
        }
        return repository.save(customer);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer customer) {
        Customer existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + id));

        if (customer.getName() != null && !customer.getName().isBlank()) existing.setName(customer.getName());
        if (customer.getPhone() != null) existing.setPhone(customer.getPhone());
        if (customer.getEmail() != null) existing.setEmail(customer.getEmail());
        if (customer.getVisits() != null) existing.setVisits(customer.getVisits());
        if (customer.getTotalSpent() != null) existing.setTotalSpent(customer.getTotalSpent());
        if (customer.getLoyaltyPoints() != null) existing.setLoyaltyPoints(customer.getLoyaltyPoints());
        if (customer.getOutletId() != null) existing.setOutletId(customer.getOutletId());
        existing.setLastVisitAt(OffsetDateTime.now());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
