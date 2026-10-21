package com.example.pos.outlet;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/outlets")
@CrossOrigin(origins = "*")
public class OutletController {
    private final OutletService service;

    public OutletController(OutletService service) {
        this.service = service;
    }

    @GetMapping
    public List<Outlet> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Outlet create(@Valid @RequestBody OutletRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public Outlet update(@PathVariable Long id, @Valid @RequestBody OutletRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/toggle-active")
    public Outlet toggleActive(@PathVariable Long id) {
        return service.toggleActive(id);
    }
}
