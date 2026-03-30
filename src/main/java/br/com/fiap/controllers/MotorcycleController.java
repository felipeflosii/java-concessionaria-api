package br.com.fiap.controllers;

import br.com.fiap.models.Motorcycle;
import br.com.fiap.services.MotorcycleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/motorcycles")
@CrossOrigin(origins = "*")
public class MotorcycleController {

    @Autowired
    private MotorcycleService service;

    @GetMapping
    public List<Motorcycle> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Motorcycle> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<Motorcycle> create(@Valid @RequestBody Motorcycle motorcycle) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(motorcycle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Motorcycle> update(@PathVariable Long id, @Valid @RequestBody Motorcycle motorcycle) {
        return ResponseEntity.ok(service.update(id, motorcycle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
