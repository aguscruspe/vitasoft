package com.vitasoft.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoRequest {
    private Long proveedorId;
    private BigDecimal monto;
    private String concepto;
    private LocalDate fechaPago;
}
