package com.example.pos.outlet;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OutletRepository extends JpaRepository<Outlet, Long> {
    boolean existsByCodeIgnoreCase(String code);
    Optional<Outlet> findByCodeIgnoreCase(String code);
}
