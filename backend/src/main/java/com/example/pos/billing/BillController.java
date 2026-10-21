package com.example.pos.billing;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {
    private final BillRepository repository;

    public BillController(BillRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Bill> findAll(@RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return repository.findByOutletIdOrderByIdDesc(outletId);
        }
        return repository.findAllByOrderByIdDesc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Bill create(@RequestBody Bill bill) {
        if (bill.getBillNumber() == null || bill.getBillNumber().isBlank()) {
            bill.setBillNumber("BILL-" + (9000 + (System.currentTimeMillis() % 1000)));
        }
        if (bill.getStatus() == null) {
            bill.setStatus("PAID");
        }
        return repository.save(bill);
    }
}
