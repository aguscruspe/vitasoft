package com.vitasoft.controller;

import com.vitasoft.dto.ProcesarLoteRequest;
import com.vitasoft.model.ArchivoGenerado;
import com.vitasoft.model.Lote;
import com.vitasoft.service.LoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class LoteController {

    private final LoteService loteService;

    @PostMapping("/api/lotes/procesar")
    public ResponseEntity<Lote> procesar(@RequestBody ProcesarLoteRequest request) {
        return ResponseEntity.ok(loteService.procesar(request));
    }

    @GetMapping("/api/lotes")
    public ResponseEntity<List<Lote>> listar() {
        return ResponseEntity.ok(loteService.listar());
    }

    @GetMapping("/api/lotes/{id}")
    public ResponseEntity<Lote> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(loteService.obtener(id));
    }

    @GetMapping("/archivos/{id}/descargar")
    public ResponseEntity<Resource> descargar(@PathVariable Long id) {
        ArchivoGenerado archivo = loteService.obtenerArchivo(id);
        File file = new File(archivo.getRuta());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        MediaType mediaType = switch (archivo.getTipo()) {
            case PDF -> MediaType.APPLICATION_PDF;
            case TXT -> MediaType.TEXT_PLAIN;
        };

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getName() + "\"")
                .body(resource);
    }
}
