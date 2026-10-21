package com.example.pos.table;

import jakarta.persistence.*;

@Entity
@Table(name = "dining_tables")
public class DiningTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String zone;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false, length = 30)
    private String status = "Available"; // Available, Occupied, Billed, Reserved

    @Column(name = "running_total")
    private Double runningTotal = 0.0;

    @Column(name = "order_time", length = 50)
    private String orderTime;

    @Column(name = "running_order_id", length = 50)
    private String runningOrderId;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    @Column(name = "outlet_id")
    private Long outletId;

    public DiningTable() {}

    public DiningTable(String code, String name, String zone, Integer seats, String status, Double runningTotal, String orderTime) {
        this.code = code;
        this.name = name;
        this.zone = zone;
        this.seats = seats;
        this.status = status;
        this.runningTotal = runningTotal;
        this.orderTime = orderTime;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Double getRunningTotal() { return runningTotal; }
    public void setRunningTotal(Double runningTotal) { this.runningTotal = runningTotal; }
    public String getOrderTime() { return orderTime; }
    public void setOrderTime(String orderTime) { this.orderTime = orderTime; }
    public String getRunningOrderId() { return runningOrderId; }
    public void setRunningOrderId(String runningOrderId) { this.runningOrderId = runningOrderId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }
}
