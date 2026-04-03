package com.vitasoft.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PagoRequest {

    private Long proveedorId;
    private BigDecimal monto;
    private String concepto;
    private String cbu;
    private LocalDate fechaPago;
}
