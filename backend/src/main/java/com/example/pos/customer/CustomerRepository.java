package com.example.pos.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findAllByOrderByTotalSpentDesc();
    List<Customer> findByOutletIdOrderByTotalSpentDesc(Long outletId);
    List<Customer> findByOutletIdOrOutletIdIsNullOrderByTotalSpentDesc(Long outletId);
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByPhoneAndOutletId(String phone, Long outletId);
    Optional<Customer> findByNameIgnoreCase(String name);
}
