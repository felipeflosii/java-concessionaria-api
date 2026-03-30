package br.com.fiap.services;

import br.com.fiap.enums.VehicleStatus;
import br.com.fiap.models.Sale;
import br.com.fiap.repositories.CustomerRepository;
import br.com.fiap.repositories.SaleRepository;
import br.com.fiap.repositories.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public List<Sale> getAll() {
        return saleRepository.findAll();
    }

    public Sale getById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale not found"));
    }

    public Sale create(Sale sale) {
        sale.setId(null);
        hydrateAndValidateRelations(sale);
        return saleRepository.save(sale);
    }

    public Sale update(Long id, Sale sale) {
        getById(id);
        sale.setId(id);
        hydrateAndValidateRelations(sale);
        return saleRepository.save(sale);
    }

    public void delete(Long id) {
        getById(id);
        saleRepository.deleteById(id);
    }

    private void hydrateAndValidateRelations(Sale sale) {
        if (sale.getVehicle() == null || sale.getVehicle().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vehicle.id is required");
        }

        if (sale.getCustomer() == null || sale.getCustomer().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "customer.id is required");
        }

        var vehicle = vehicleRepository.findById(sale.getVehicle().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        var customer = customerRepository.findById(sale.getCustomer().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (vehicle.getStatus() != VehicleStatus.DISPONIVEL) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vehicle is not available for sale");
        }

        vehicle.setStatus(VehicleStatus.VENDIDO);
        vehicleRepository.save(vehicle);

        sale.setVehicle(vehicle);
        sale.setCustomer(customer);
    }
}
