package com.example.pos.menu;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductRepository repository;
    private final CategoryRepository categoryRepository;

    public ProductController(ProductRepository repository, CategoryRepository categoryRepository) {
        this.repository = repository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Product> findAll(@RequestParam(required = false) String category, @RequestParam(required = false) Long outletId) {
        if (category != null && !category.equalsIgnoreCase("All")) {
            return repository.findForOutletAndCategory(outletId, category);
        }
        return repository.findForOutlet(outletId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@RequestBody Product product) {
        if (product.getPrice() == null) product.setPrice(0.0);
        if (product.getOutletId() == null) {
            product.setOutletId(1L);
        }

        // Auto-link category_id and category name
        if (product.getCategoryId() == null && product.getCategory() != null) {
            categoryRepository.findForOutlet(product.getOutletId()).stream()
                    .filter(c -> c.getName().equalsIgnoreCase(product.getCategory()))
                    .findFirst()
                    .ifPresent(c -> product.setCategoryId(c.getId()));
        } else if (product.getCategoryId() != null && (product.getCategory() == null || product.getCategory().isBlank())) {
            categoryRepository.findById(product.getCategoryId())
                    .ifPresent(c -> product.setCategory(c.getName()));
        }

        return repository.save(product);
    }

    @PutMapping("/{id}/stock")
    public Product toggleStock(@PathVariable Long id, @RequestBody(required = false) Map<String, Boolean> body) {
        Product p = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (body != null && body.containsKey("inStock")) {
            p.setInStock(body.get("inStock"));
        } else {
            p.setInStock(!p.isInStock());
        }
        return repository.save(p);
    }
}
