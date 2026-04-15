package com.vitasoft.dto;

import com.vitasoft.model.Banco;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcesarLoteRequest {
    private Banco banco;
    private List<Long> pagoIds;
}
