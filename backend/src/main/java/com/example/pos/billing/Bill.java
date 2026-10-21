package com.example.pos.billing;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bills")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true, length = 50)
    private String billNumber;

    @Column(name = "order_number", length = 50)
    private String orderNumber;

    @Column(name = "table_code", length = 50)
    private String tableCode;

    @Column(name = "order_type", length = 30)
    private String orderType = "Dine-In";

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    @Column(name = "items_json", columnDefinition = "NVARCHAR(MAX)")
    private String itemsJson;

    @Column(name = "items_count")
    private Integer itemsCount = 0;

    private Double subtotal = 0.0;
    private Double discount = 0.0;
    private Double tax = 0.0;
    private Double total = 0.0;

    @Column(name = "payment_mode", nullable = false, length = 30)
    private String paymentMode = "CASH"; // UPI, CASH, CARD

    @Column(nullable = false, length = 30)
    private String status = "PAID";

    @Column(name = "outlet_name", length = 150)
    private String outletName;

    @Column(name = "outlet_id")
    private Long outletId;

    @Column(name = "outlet_address", columnDefinition = "NVARCHAR(MAX)")
    private String outletAddress;

    @Column(length = 20)
    private String gstin;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public Bill() {}

    public Long getId() { return id; }
    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public String getTableCode() { return tableCode; }
    public void setTableCode(String tableCode) { this.tableCode = tableCode; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }
    public Integer getItemsCount() { return itemsCount; }
    public void setItemsCount(Integer itemsCount) { this.itemsCount = itemsCount; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }
    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }
    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }
    public String getOutletAddress() { return outletAddress; }
    public void setOutletAddress(String outletAddress) { this.outletAddress = outletAddress; }
    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
