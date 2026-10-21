package com.example.pos.settlement;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "settlements")
public class Settlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "settlement_number", nullable = false, unique = true, length = 50)
    private String settlementNumber;

    @Column(name = "bill_number", nullable = false, length = 50)
    private String billNumber;

    @Column(name = "table_code", length = 30)
    private String tableCode;

    @Column(name = "order_type", length = 30)
    private String orderType = "Dine-In";

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    @Column(name = "items_json", columnDefinition = "NVARCHAR(MAX)")
    private String itemsJson;

    @Column(name = "items_count")
    private Integer itemsCount;

    private Double subtotal;
    private Double discount;
    private Double tax;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "payment_mode", nullable = false, length = 30)
    private String paymentMode; // UPI, CASH, CARD

    @Column(name = "cash_tendered")
    private Double cashTendered;

    @Column(name = "change_returned")
    private Double changeReturned;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "outlet_name", length = 150)
    private String outletName;

    @Column(name = "outlet_id")
    private Long outletId;

    @Column(name = "cashier_name", length = 100)
    private String cashierName = "Admin User";

    @Column(length = 30)
    private String status = "COMPLETED";

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @PrePersist
    public void prePersist() {
        if (this.settledAt == null) {
            this.settledAt = LocalDateTime.now();
        }
        if (this.settlementNumber == null) {
            this.settlementNumber = "STL-" + (System.currentTimeMillis() % 100000);
        }
    }

    public Settlement() {}

    public Long getId() { return id; }
    public String getSettlementNumber() { return settlementNumber; }
    public void setSettlementNumber(String settlementNumber) { this.settlementNumber = settlementNumber; }
    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }
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
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
    public Double getCashTendered() { return cashTendered; }
    public void setCashTendered(Double cashTendered) { this.cashTendered = cashTendered; }
    public Double getChangeReturned() { return changeReturned; }
    public void setChangeReturned(Double changeReturned) { this.changeReturned = changeReturned; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }
    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }
    public String getCashierName() { return cashierName; }
    public void setCashierName(String cashierName) { this.cashierName = cashierName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }
}
