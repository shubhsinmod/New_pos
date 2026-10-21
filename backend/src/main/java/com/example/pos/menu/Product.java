package com.example.pos.menu;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private Double price;

    @JsonProperty("isVeg")
    @Column(name = "is_veg", nullable = false)
    private boolean isVeg = true;

    @Column(name = "in_stock", nullable = false)
    private boolean inStock = true;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "outlet_id")
    private Long outletId;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public Product() {}

    public Product(String name, String category, Double price, boolean isVeg, boolean inStock, String description) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.isVeg = isVeg;
        this.inStock = inStock;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    @JsonProperty("isVeg")
    public boolean isVeg() { return isVeg; }

    @JsonProperty("isVeg")
    public void setVeg(boolean veg) { isVeg = veg; }

    // Also support "veg" property for backwards-compatibility
    @JsonProperty("veg")
    public boolean getVeg() { return isVeg; }

    public boolean isInStock() { return inStock; }
    public void setInStock(boolean inStock) { this.inStock = inStock; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
