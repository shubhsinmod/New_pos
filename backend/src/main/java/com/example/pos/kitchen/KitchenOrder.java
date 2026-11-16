package com.example.pos.kitchen;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "kitchen_orders")
public class KitchenOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "kot_number", nullable = false, length = 50)
    private String kotNumber;

    @Column(name = "order_number", length = 50)
    private String orderNumber;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "table_code", nullable = false, length = 50)
    private String tableCode;

    @Column(name = "order_type", nullable = false, length = 30)
    private String orderType = "Dine-In";

    @Column(nullable = false, length = 30)
    private String status = "In Kitchen"; // In Kitchen, Preparing, Ready to Serve, Completed, Cancelled

    @Column(name = "items_json", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String itemsJson;

    @Column(length = 255)
    private String notes;

    @Column(length = 50)
    private String station = "Main Kitchen"; // Main Kitchen, Tandoor, Beverages, Bar, Dessert

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes = 15;

    @Column(name = "outlet_id", nullable = false)
    private Long outletId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (updatedAt == null) updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public KitchenOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getKotNumber() { return kotNumber; }
    public void setKotNumber(String kotNumber) { this.kotNumber = kotNumber; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getTableCode() { return tableCode; }
    public void setTableCode(String tableCode) { this.tableCode = tableCode; }

    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStation() { return station; }
    public void setStation(String station) { this.station = station; }

    public Integer getPrepTimeMinutes() { return prepTimeMinutes; }
    public void setPrepTimeMinutes(Integer prepTimeMinutes) { this.prepTimeMinutes = prepTimeMinutes; }

    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
