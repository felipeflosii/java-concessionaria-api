package br.com.fiap.models;

import br.com.fiap.enums.MotorcycleBrand;
import br.com.fiap.enums.VehicleColor;
import br.com.fiap.enums.VehicleStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "motorcycles")
public class Motorcycle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private MotorcycleBrand motorcycleBrand;

    @NotBlank
    private String model;

    @NotBlank
    private String version;

    @NotNull
    private Integer vehicleYear;

    @NotNull
    @PositiveOrZero
    private BigDecimal price;

    @NotNull
    @PositiveOrZero
    private Integer mileage;

    @NotNull
    @Enumerated(EnumType.STRING)
    private VehicleColor color;

    private String customColor;

    @NotNull
    @Enumerated(EnumType.STRING)
    private VehicleStatus status;
}
