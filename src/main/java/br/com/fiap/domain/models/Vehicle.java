package br.com.fiap.domain.models;

import br.com.fiap.enums.CarColor;
import br.com.fiap.enums.CarBrand;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String model;
    private String version;
    private Integer vehicleYear;
    private BigDecimal price;
    private Integer mileage;

    @Enumerated(EnumType.STRING)
    private CarColor color;

    private String customColor;

    @Enumerated(EnumType.STRING)
    private CarBrand brand;
}