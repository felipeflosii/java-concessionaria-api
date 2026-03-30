package br.com.fiap.services;

import br.com.fiap.models.Motorcycle;
import br.com.fiap.repositories.MotorcycleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MotorcycleService {

    @Autowired
    private MotorcycleRepository repository;

    public List<Motorcycle> getAll() {
        return repository.findAll();
    }

    public Motorcycle getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Motorcycle not found"));
    }

    public Motorcycle create(Motorcycle motorcycle) {
        motorcycle.setId(null);
        return repository.save(motorcycle);
    }

    public Motorcycle update(Long id, Motorcycle motorcycle) {
        getById(id);
        motorcycle.setId(id);
        return repository.save(motorcycle);
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }
}
