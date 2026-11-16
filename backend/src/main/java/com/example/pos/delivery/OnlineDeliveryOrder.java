package com.example.pos.delivery;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "online_delivery_orders")
public class OnlineDeliveryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "platform", nullable = false, length = 50)
    private String platform; // Zomato, Swiggy, Dunzo, ONDC, Direct

    @Column(name = "order_number", nullable = false, length = 50)
    private String orderNumber;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "instructions", length = 500)
    private String instructions;

    @Column(name = "items_json", columnDefinition = "NVARCHAR(MAX)")
    private String itemsJson;

    private Double subtotal = 0.0;
    private Double tax = 0.0;

    @Column(name = "delivery_fee")
    private Double deliveryFee = 0.0;

    @Column(name = "packaging_fee")
    private Double packagingFee = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount = 0.0;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus = "PAID (Online Gateway)";

    @Column(name = "rider_name", length = 100)
    private String riderName;

    @Column(name = "rider_phone", length = 30)
    private String riderPhone;

    @Column(name = "rider_eta", length = 50)
    private String riderEta;

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes = 15;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "Pending Acceptance"; // Pending Acceptance, In Kitchen, Ready for Pickup, Dispatched, Completed, Rejected

    @Column(name = "outlet_id")
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

    public OnlineDeliveryOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(Double deliveryFee) { this.deliveryFee = deliveryFee; }
    public Double getDeliveryCharges() { return deliveryFee; }
    public void setDeliveryCharges(Double deliveryCharges) { this.deliveryFee = deliveryCharges; }

    public Double getPackagingFee() { return packagingFee; }
    public void setPackagingFee(Double packagingFee) { this.packagingFee = packagingFee; }
    public Double getPackagingCharges() { return packagingFee; }
    public void setPackagingCharges(Double packagingCharges) { this.packagingFee = packagingCharges; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getRiderName() { return riderName; }
    public void setRiderName(String riderName) { this.riderName = riderName; }

    public String getRiderPhone() { return riderPhone; }
    public void setRiderPhone(String riderPhone) { this.riderPhone = riderPhone; }

    public String getRiderEta() { return riderEta; }
    public void setRiderEta(String riderEta) { this.riderEta = riderEta; }

    public Integer getPrepTimeMinutes() { return prepTimeMinutes; }
    public void setPrepTimeMinutes(Integer prepTimeMinutes) { this.prepTimeMinutes = prepTimeMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
