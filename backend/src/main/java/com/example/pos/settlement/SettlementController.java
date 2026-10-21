package com.example.pos.settlement;

import com.example.pos.billing.Bill;
import com.example.pos.billing.BillRepository;
import com.example.pos.customer.Customer;
import com.example.pos.customer.CustomerRepository;
import com.example.pos.order.RestaurantOrder;
import com.example.pos.order.RestaurantOrderRepository;
import com.example.pos.table.DiningTable;
import com.example.pos.table.DiningTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/settlements")
@CrossOrigin(origins = "*")
public class SettlementController {
    private final SettlementRepository settlementRepository;
    private final BillRepository billRepository;
    private final DiningTableRepository tableRepository;
    private final RestaurantOrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public SettlementController(
            SettlementRepository settlementRepository,
            BillRepository billRepository,
            DiningTableRepository tableRepository,
            RestaurantOrderRepository orderRepository,
            CustomerRepository customerRepository
    ) {
        this.settlementRepository = settlementRepository;
        this.billRepository = billRepository;
        this.tableRepository = tableRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public List<Settlement> findAll(@RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return settlementRepository.findByOutletIdOrderBySettledAtDesc(outletId);
        }
        return settlementRepository.findAllByOrderBySettledAtDesc();
    }

    @GetMapping("/table/{tableCode}")
    public List<Settlement> findByTableCode(@PathVariable String tableCode) {
        return settlementRepository.findByTableCodeOrderBySettledAtDesc(tableCode);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Settlement createSettlement(@RequestBody Settlement request) {
        // 1. Generate settlement & bill numbers if needed
        long timestamp = System.currentTimeMillis() % 100000;
        if (request.getSettlementNumber() == null || request.getSettlementNumber().isBlank()) {
            request.setSettlementNumber("STL-" + timestamp);
        }
        if (request.getBillNumber() == null || request.getBillNumber().isBlank()) {
            request.setBillNumber("BILL-" + timestamp);
        }
        if (request.getSettledAt() == null) {
            request.setSettledAt(LocalDateTime.now());
        }

        // 2. Save Settlement in MSSQL
        Settlement savedSettlement = settlementRepository.save(request);

        // 3. Save Bill in MSSQL
        Bill bill = new Bill();
        bill.setBillNumber(request.getBillNumber());
        bill.setOrderNumber("ORD-" + timestamp);
        bill.setTableCode(request.getTableCode());
        bill.setOrderType(request.getOrderType());
        bill.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in Guest");
        bill.setCustomerPhone(request.getCustomerPhone());
        bill.setItemsJson(request.getItemsJson());
        bill.setItemsCount(request.getItemsCount() != null ? request.getItemsCount() : 1);
        bill.setSubtotal(request.getSubtotal() != null ? request.getSubtotal() : request.getTotalAmount());
        bill.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0.0);
        bill.setTax(request.getTax() != null ? request.getTax() : 0.0);
        bill.setTotal(request.getTotalAmount());
        bill.setPaymentMode(request.getPaymentMode());
        bill.setStatus("PAID");
        bill.setOutletId(request.getOutletId());
        bill.setOutletName(request.getOutletName() != null ? request.getOutletName() : "Tableflow POS");
        billRepository.save(bill);

        // 4. Update Customer in MSSQL CRM if phone is provided
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()) {
            Optional<Customer> existingCustomer = customerRepository.findByPhone(request.getCustomerPhone());
            Customer customer = existingCustomer.orElseGet(() -> {
                Customer c = new Customer();
                c.setPhone(request.getCustomerPhone());
                c.setName(request.getCustomerName() != null ? request.getCustomerName() : "Guest");
                c.setOutletId(request.getOutletId());
                c.setVisits(0);
                c.setTotalSpent(0.0);
                c.setLoyaltyPoints(0);
                return c;
            });
            if (customer.getOutletId() == null) {
                customer.setOutletId(request.getOutletId());
            }
            customer.setVisits(customer.getVisits() + 1);
            customer.setTotalSpent(customer.getTotalSpent() + request.getTotalAmount());
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + (int) (request.getTotalAmount() / 10));
            customer.setLastVisitAt(java.time.OffsetDateTime.now());
            customerRepository.save(customer);
        }

        // 5. Update Table Status in MSSQL: Automatically Vacate & Reset Table
        if ("Dine-In".equalsIgnoreCase(request.getOrderType()) && request.getTableCode() != null) {
            Optional<DiningTable> tableOpt = tableRepository.findByCode(request.getTableCode());
            if (tableOpt.isPresent()) {
                DiningTable table = tableOpt.get();
                table.setStatus("Available");
                table.setRunningTotal(0.0);
                table.setOrderTime(null);
                table.setRunningOrderId(null);
                table.setCustomerName(null);
                table.setCustomerPhone(null);
                tableRepository.save(table);
            }

            // 6. Complete all active kitchen orders for this table
            List<RestaurantOrder> orders = orderRepository.findByTableCodeOrderByIdDesc(request.getTableCode());
            for (RestaurantOrder ord : orders) {
                if (!"Completed".equalsIgnoreCase(ord.getStatus())) {
                    ord.setStatus("Completed");
                    orderRepository.save(ord);
                }
            }
        }

        return savedSettlement;
    }
}
