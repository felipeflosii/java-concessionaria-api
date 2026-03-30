package br.com.fiap.services;

import br.com.fiap.models.Customer;
import br.com.fiap.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository repository;

    public List<Customer> getAll() {
        return repository.findAll();
    }

    public Customer getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        return repository.save(customer);
    }

    public Customer update(Long id, Customer customer) {
        getById(id);
        customer.setId(id);
        return repository.save(customer);
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }
}
