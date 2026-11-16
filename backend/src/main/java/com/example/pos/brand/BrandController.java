package com.example.pos.brand;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin(origins = "*")
public class BrandController {
    private final BrandRepository repository;

    public BrandController(BrandRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Brand> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Brand findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found: " + id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Brand create(@RequestBody Brand brand) {
        if (brand.getName() == null || brand.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Brand name is required");
        }
        if (brand.getCode() == null || brand.getCode().isBlank()) {
            brand.setCode(brand.getName().substring(0, Math.min(3, brand.getName().length())).toUpperCase());
        }
        return repository.save(brand);
    }

    @PutMapping("/{id}")
    public Brand update(@PathVariable Long id, @RequestBody Brand update) {
        Brand existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found: " + id));

        if (update.getName() != null) existing.setName(update.getName());
        if (update.getCode() != null) existing.setCode(update.getCode());
        if (update.getLogoUrl() != null) existing.setLogoUrl(update.getLogoUrl());
        if (update.getCorporateEmail() != null) existing.setCorporateEmail(update.getCorporateEmail());
        if (update.getCorporatePhone() != null) existing.setCorporatePhone(update.getCorporatePhone());
        if (update.getGstin() != null) existing.setGstin(update.getGstin());
        existing.setActive(update.isActive());

        return repository.save(existing);
    }
}
