package com.vitasoft.service;

import com.vitasoft.entity.ArchivoGenerado;
import com.vitasoft.entity.Lote;
import com.vitasoft.entity.Pago;
import com.vitasoft.entity.enums.Banco;
import com.vitasoft.entity.enums.EstadoPago;
import com.vitasoft.entity.enums.TipoArchivo;
import com.vitasoft.repository.LoteRepository;
import com.vitasoft.repository.PagoRepository;
import com.vitasoft.service.generador.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoteService {

    private final LoteRepository loteRepository;
    private final PagoRepository pagoRepository;

    // Strategy: generadores TXT por banco
    private final GeneradorCredicoop generadorCredicoop;
    private final GeneradorGalicia generadorGalicia;
    private final GeneradorSantander generadorSantander;

    // Generador PDF
    private final GeneradorPDF generadorPDF;

    @Value("${app.archivos.ruta-base}")
    private String rutaBase;

    private static final DateTimeFormatter TS_FMT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    // -------------------------------------------------------
    // Procesar lote: crea lote, asocia pagos, genera archivos
    // -------------------------------------------------------
    @Transactional
    public Lote procesarLote(List<Long> pagoIds, String bancoStr) {
        Banco banco;
        try {
            banco = Banco.valueOf(bancoStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Banco inválido: " + bancoStr + ". Valores: CREDICOOP, GALICIA, SANTANDER");
        }

        // Validar que todos los pagos existan y estén PENDIENTES
        List<Pago> pagos = pagoIds.stream()
                .map(id -> pagoRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Pago no encontrado: " + id)))
                .toList();

        for (Pago p : pagos) {
            if (p.getEstado() != EstadoPago.PENDIENTE) {
                throw new IllegalStateException(
                        "El pago id=" + p.getId() + " no está en estado PENDIENTE");
            }
            if (p.getLote() != null) {
                throw new IllegalStateException(
                        "El pago id=" + p.getId() + " ya pertenece al lote id=" + p.getLote().getId());
            }
        }

        // Crear lote
        Lote lote = Lote.builder()
                .banco(banco)
                .estado("GENERADO")
                .fechaCreacion(LocalDateTime.now())
                .build();
        lote = loteRepository.save(lote);

        // Asociar pagos al lote y marcar como PROCESADO
        for (Pago p : pagos) {
            p.setLote(lote);
            p.setEstado(EstadoPago.PROCESADO);
        }
        pagoRepository.saveAll(pagos);

        // Refrescar la lista de pagos en el lote para los generadores
        lote.setPagos(pagos.stream().toList());

        // Generar archivos TXT (Strategy) y PDF
        try {
            String txtPath = guardarTxt(lote);
            String pdfPath = guardarPdf(lote);

            lote.getArchivos().add(ArchivoGenerado.builder()
                    .tipo(TipoArchivo.TXT)
                    .ruta(txtPath)
                    .fechaGeneracion(LocalDateTime.now())
                    .lote(lote)
                    .build());

            lote.getArchivos().add(ArchivoGenerado.builder()
                    .tipo(TipoArchivo.PDF)
                    .ruta(pdfPath)
                    .fechaGeneracion(LocalDateTime.now())
                    .lote(lote)
                    .build());

            loteRepository.save(lote);

        } catch (IOException e) {
            log.error("Error generando archivos para lote {}", lote.getId(), e);
            lote.setEstado("ERROR");
            loteRepository.save(lote);
            throw new RuntimeException("Error generando archivos del lote: " + e.getMessage(), e);
        }

        return lote;
    }

    // -------------------------------------------------------
    // Listar lotes con sus archivos
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public List<Lote> listarTodos() {
        return loteRepository.findAll();
    }

    // -------------------------------------------------------
    // Selecciona el generador Strategy según el banco
    // -------------------------------------------------------
    private GeneradorArchivo seleccionarGenerador(Banco banco) {
        return switch (banco) {
            case CREDICOOP -> generadorCredicoop;
            case GALICIA -> generadorGalicia;
            case SANTANDER -> generadorSantander;
        };
    }

    // -------------------------------------------------------
    // Genera TXT usando el Strategy y lo guarda en disco
    // -------------------------------------------------------
    private String guardarTxt(Lote lote) throws IOException {
        Path dir = Paths.get(rutaBase, "txt");
        Files.createDirectories(dir);

        String fileName = String.format("lote_%d_%s_%s.txt",
                lote.getId(),
                lote.getBanco().name(),
                LocalDateTime.now().format(TS_FMT));

        Path filePath = dir.resolve(fileName);

        // Usar Strategy para generar el contenido
        GeneradorArchivo generador = seleccionarGenerador(lote.getBanco());
        String contenido = generador.generarTXT(lote);

        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath.toFile()))) {
            writer.print(contenido);
        }

        log.info("TXT generado: {}", filePath);
        return filePath.toString();
    }

    // -------------------------------------------------------
    // Genera PDF y lo guarda en disco
    // -------------------------------------------------------
    private String guardarPdf(Lote lote) throws IOException {
        Path dir = Paths.get(rutaBase, "pdf");
        Files.createDirectories(dir);

        String fileName = String.format("lote_%d_%s_%s.pdf",
                lote.getId(),
                lote.getBanco().name(),
                LocalDateTime.now().format(TS_FMT));

        Path filePath = dir.resolve(fileName);

        generadorPDF.generar(lote, filePath);

        log.info("PDF generado: {}", filePath);
        return filePath.toString();
    }
}
