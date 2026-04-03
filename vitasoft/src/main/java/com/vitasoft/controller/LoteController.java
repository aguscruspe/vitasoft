package com.vitasoft.controller;

import com.vitasoft.dto.ProcesarLoteRequest;
import com.vitasoft.entity.Lote;
import com.vitasoft.service.LoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
@RequiredArgsConstructor
public class LoteController {

    private final LoteService loteService;

    /**
     * POST /api/lotes/procesar
     * Recibe lista de IDs de pagos y banco, crea el lote y genera archivos TXT + PDF.
     */
    @PostMapping("/procesar")
    public ResponseEntity<Lote> procesar(@Valid @RequestBody ProcesarLoteRequest request) {
        Lote lote = loteService.procesarLote(request.getPagoIds(), request.getBanco());
        return ResponseEntity.status(HttpStatus.CREATED).body(lote);
    }

    /**
     * GET /api/lotes
     * Lista todos los lotes generados con sus archivos.
     */
    @GetMapping
    public ResponseEntity<List<Lote>> listar() {
        return ResponseEntity.ok(loteService.listarTodos());
    }
}
