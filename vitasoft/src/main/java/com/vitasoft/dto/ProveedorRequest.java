package com.vitasoft.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProveedorRequest {

    @NotBlank
    @Size(max = 150)
    private String nombre;

    @NotBlank
    @Size(min = 22, max = 22, message = "El CBU debe tener 22 dígitos")
    private String cbu;

    @NotBlank
    @Size(min = 11, max = 13, message = "El CUIT debe tener entre 11 y 13 caracteres")
    private String cuit;
}
