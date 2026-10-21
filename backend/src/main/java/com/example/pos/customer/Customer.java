package com.example.pos.customer;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    private Integer visits = 1;

    @Column(name = "total_spent")
    private Double totalSpent = 0.0;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Column(name = "outlet_id")
    private Long outletId;

    @Column(name = "last_visit_at")
    private OffsetDateTime lastVisitAt;

    @PrePersist
    void onCreate() {
        if (lastVisitAt == null) lastVisitAt = OffsetDateTime.now();
    }

    public Customer() {}

    public Customer(String name, String phone, Integer visits, Double totalSpent, Integer loyaltyPoints) {
        this.name = name;
        this.phone = phone;
        this.visits = visits;
        this.totalSpent = totalSpent;
        this.loyaltyPoints = loyaltyPoints;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getVisits() { return visits; }
    public void setVisits(Integer visits) { this.visits = visits; }
    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }
    public OffsetDateTime getLastVisitAt() { return lastVisitAt; }
    public void setLastVisitAt(OffsetDateTime lastVisitAt) { this.lastVisitAt = lastVisitAt; }
}
