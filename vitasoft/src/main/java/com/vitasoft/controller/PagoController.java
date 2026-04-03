package com.vitasoft.controller;

import com.vitasoft.dto.ImportResultDTO;
import com.vitasoft.dto.PagoRequest;
import com.vitasoft.entity.Pago;
import com.vitasoft.entity.enums.Banco;
import com.vitasoft.entity.enums.EstadoPago;
import com.vitasoft.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    /**
     * POST /api/pagos/importar
     * Recibe archivo Excel (.xlsx) multipart y crea pagos con estado PENDIENTE.
     */
    @PostMapping("/importar")
    public ResponseEntity<ImportResultDTO> importar(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ImportResultDTO.builder()
                            .totalLeidos(0)
                            .totalImportados(0)
                            .errores(List.of("El archivo está vacío"))
                            .build()
            );
        }

        ImportResultDTO result = pagoService.importarDesdeExcel(file);
        HttpStatus status = result.getErrores().isEmpty() ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(result);
    }

    /**
     * GET /api/pagos?estado=PENDIENTE&banco=CREDICOOP&desde=2025-01-01&hasta=2025-12-31
     * Todos los parámetros son opcionales.
     */
    @GetMapping
    public ResponseEntity<List<Pago>> listar(
            @RequestParam(required = false) EstadoPago estado,
            @RequestParam(required = false) Banco banco,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        return ResponseEntity.ok(pagoService.listarConFiltros(estado, banco, desde, hasta));
    }

    /**
     * PUT /api/pagos/{id}
     * Edita datos de un pago (ej: CBU faltante, monto, concepto).
     */
    @PutMapping("/{id}")
    public ResponseEntity<Pago> actualizar(@PathVariable Long id, @RequestBody PagoRequest request) {
        return ResponseEntity.ok(pagoService.actualizar(id, request));
    }

    /**
     * DELETE /api/pagos/{id}
     * Eliminación lógica: cambia estado a ELIMINADO.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Long id) {
        pagoService.eliminar(id);
        return ResponseEntity.ok(Map.of("message", "Pago eliminado correctamente", "id", id.toString()));
    }
}
