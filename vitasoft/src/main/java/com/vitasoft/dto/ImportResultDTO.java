package com.vitasoft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class ImportResultDTO {

    private int totalLeidos;
    private int totalImportados;
    private List<String> errores;
}
