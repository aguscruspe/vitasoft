package com.vitasoft.controller;

import com.vitasoft.dto.ImportResultDTO;
import com.vitasoft.dto.PagoRequest;
import com.vitasoft.model.Banco;
import com.vitasoft.model.EstadoPago;
import com.vitasoft.model.Pago;
import com.vitasoft.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @PostMapping("/importar")
    public ResponseEntity<ImportResultDTO> importar(@RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(pagoService.importarExcel(archivo));
    }

    @GetMapping
    public ResponseEntity<List<Pago>> buscar(
            @RequestParam(required = false) Banco banco,
            @RequestParam(required = false) EstadoPago estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(pagoService.buscar(estado, desde, hasta, banco));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pago> actualizar(@PathVariable Long id, @RequestBody PagoRequest request) {
        return ResponseEntity.ok(pagoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pagoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
