package com.example.pos.outlet;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class OutletService {
    private final OutletRepository repository;

    public OutletService(OutletRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Outlet> findAll() {
        return repository.findAll();
    }

    @Transactional
    public Outlet create(OutletRequest request) {
        String code = request.code().trim().toUpperCase();
        if (repository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Outlet code already exists");
        }
        Outlet outlet = new Outlet();
        outlet.setName(request.name().trim());
        outlet.setCode(code);
        outlet.setPhone(blankToNull(request.phone()));
        outlet.setEmail(blankToNull(request.email()));
        outlet.setAddress(blankToNull(request.address()));
        outlet.setGstin(blankToNull(request.gstin()));
        outlet.setActive(request.active() == null || request.active());
        return repository.save(outlet);
    }

    @Transactional
    public Outlet update(Long id, OutletRequest request) {
        Outlet outlet = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Outlet not found: " + id));

        String code = request.code().trim().toUpperCase();
        if (!outlet.getCode().equalsIgnoreCase(code) && repository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Outlet code already exists");
        }

        outlet.setName(request.name().trim());
        outlet.setCode(code);
        outlet.setPhone(blankToNull(request.phone()));
        outlet.setEmail(blankToNull(request.email()));
        outlet.setAddress(blankToNull(request.address()));
        outlet.setGstin(blankToNull(request.gstin()));
        if (request.active() != null) {
            outlet.setActive(request.active());
        }
        return repository.save(outlet);
    }

    @Transactional
    public Outlet toggleActive(Long id) {
        Outlet outlet = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Outlet not found: " + id));
        outlet.setActive(!outlet.isActive());
        return repository.save(outlet);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
