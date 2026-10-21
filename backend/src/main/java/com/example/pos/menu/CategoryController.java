package com.example.pos.menu;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    private final CategoryRepository repository;

    public CategoryController(CategoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Category> findAll(@RequestParam(required = false) Long outletId) {
        if (outletId != null) {
            return repository.findForOutlet(outletId);
        }
        return repository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Category create(@RequestBody Category category) {
        category.setActive(true);
        if (category.getOutletId() == null) {
            category.setOutletId(1L);
        }
        return repository.save(category);
    }
}
