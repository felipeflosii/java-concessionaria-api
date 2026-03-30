package br.com.fiap.controllers;

import br.com.fiap.models.Vehicle;
import br.com.fiap.services.VehicleService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/vehicles")
@Slf4j
public class VehicleController {

    @Autowired
    private VehicleService service;

    @GetMapping
    public List<Vehicle> listAll() {
        return service.getAllVehicle();
    }

    @PostMapping
    public ResponseEntity<Vehicle> create(@Valid @RequestBody Vehicle vehicle) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.addVehicle(vehicle));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        log.info("Getting vehicle {}", id);
        return ResponseEntity.ok(service.getVehicleById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        log.info("Deleting vehicle {}", id);
        service.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @Valid @RequestBody Vehicle vehicle) {
        log.info("Updating vehicle {}", id);
        return ResponseEntity.ok(service.updateVehicle(id, vehicle));
    }
}
