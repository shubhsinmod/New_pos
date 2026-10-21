package com.example.pos.analytics;

import com.example.pos.billing.Bill;
import com.example.pos.billing.BillRepository;
import com.example.pos.table.DiningTable;
import com.example.pos.table.DiningTableRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final BillRepository billRepo;
    private final DiningTableRepository tableRepo;

    public AnalyticsController(BillRepository billRepo, DiningTableRepository tableRepo) {
        this.billRepo = billRepo;
        this.tableRepo = tableRepo;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam(required = false) Long outletId) {
        List<Bill> bills = (outletId != null) ? billRepo.findByOutletIdOrderByIdDesc(outletId) : billRepo.findAll();
        List<DiningTable> tables = (outletId != null) ? tableRepo.findByOutletIdOrderByIdAsc(outletId) : tableRepo.findAll();

        double totalRevenue = bills.stream().mapToDouble(b -> b.getTotal() != null ? b.getTotal() : 0.0).sum();
        double upiRevenue = bills.stream()
                .filter(b -> "UPI".equalsIgnoreCase(b.getPaymentMode()))
                .mapToDouble(b -> b.getTotal() != null ? b.getTotal() : 0.0).sum();
        double cashRevenue = bills.stream()
                .filter(b -> "CASH".equalsIgnoreCase(b.getPaymentMode()))
                .mapToDouble(b -> b.getTotal() != null ? b.getTotal() : 0.0).sum();
        double cardRevenue = bills.stream()
                .filter(b -> "CARD".equalsIgnoreCase(b.getPaymentMode()))
                .mapToDouble(b -> b.getTotal() != null ? b.getTotal() : 0.0).sum();

        long occupiedTables = tables.stream().filter(t -> !"Available".equalsIgnoreCase(t.getStatus())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalBills", bills.size());
        summary.put("upiRevenue", upiRevenue);
        summary.put("cashRevenue", cashRevenue);
        summary.put("cardRevenue", cardRevenue);
        summary.put("totalTables", tables.size());
        summary.put("occupiedTables", occupiedTables);
        summary.put("averageOrderValue", bills.isEmpty() ? 0.0 : Math.round(totalRevenue / bills.size()));

        return summary;
    }
}
