package com.vitasoft.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProcesarLoteRequest {

    @NotEmpty(message = "Debe incluir al menos un pago")
    private List<Long> pagoIds;

    @NotNull(message = "Debe seleccionar un banco")
    private String banco;
}
