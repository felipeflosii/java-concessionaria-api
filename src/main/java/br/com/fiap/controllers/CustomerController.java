package br.com.fiap.controllers;

import br.com.fiap.models.Customer;
import br.com.fiap.services.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService service;

    @GetMapping
    public List<Customer> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @Valid @RequestBody Customer customer) {
        return ResponseEntity.ok(service.update(id, customer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
