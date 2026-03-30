package br.com.fiap.controllers;

import br.com.fiap.models.Sale;
import br.com.fiap.services.SaleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    @Autowired
    private SaleService service;

    @GetMapping
    public List<Sale> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<Sale> create(@Valid @RequestBody Sale sale) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(sale));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sale> update(@PathVariable Long id, @Valid @RequestBody Sale sale) {
        return ResponseEntity.ok(service.update(id, sale));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
