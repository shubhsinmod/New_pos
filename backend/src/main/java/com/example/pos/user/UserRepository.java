package com.example.pos.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findAllByOrderByCreatedAtDesc();
    List<User> findByOutletIdOrderByCreatedAtDesc(Long outletId);
    boolean existsByUsername(String username);
}
