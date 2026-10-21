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

    public ProductController(ProductRepository repository) {
        this.repository = repository;
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
