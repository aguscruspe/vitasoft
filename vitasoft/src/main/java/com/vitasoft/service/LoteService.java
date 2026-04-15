package com.vitasoft.service;

import com.vitasoft.dto.ProcesarLoteRequest;
import com.vitasoft.generador.GeneradorArchivo;
import com.vitasoft.generador.GeneradorFactory;
import com.vitasoft.generador.GeneradorPDF;
import com.vitasoft.model.ArchivoGenerado;
import com.vitasoft.model.EstadoLote;
import com.vitasoft.model.EstadoPago;
import com.vitasoft.model.Lote;
import com.vitasoft.model.Pago;
import com.vitasoft.model.TipoArchivo;
import com.vitasoft.repository.ArchivoGeneradoRepository;
import com.vitasoft.repository.LoteRepository;
import com.vitasoft.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoteService {

    private final LoteRepository loteRepository;
    private final PagoRepository pagoRepository;
    private final ArchivoGeneradoRepository archivoRepository;
    private final GeneradorFactory generadorFactory;
    private final GeneradorPDF generadorPDF;

    private static final String CARPETA_SALIDA = "archivos_generados";

    public List<Lote> listar() {
        return loteRepository.findAll();
    }

    public Lote obtener(Long id) {
        return loteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lote no encontrado: " + id));
    }

    @Transactional
    public Lote procesar(ProcesarLoteRequest request) {
        List<Pago> pagos = pagoRepository.findAllById(request.getPagoIds());
        if (pagos.isEmpty()) {
            throw new RuntimeException("No hay pagos para procesar");
        }

        Lote lote = Lote.builder()
                .fechaCreacion(LocalDateTime.now())
                .banco(request.getBanco())
                .estado(EstadoLote.PROCESADO)
                .pagos(new ArrayList<>())
                .build();
        lote = loteRepository.save(lote);

        for (Pago p : pagos) {
            p.setLote(lote);
            p.setEstado(EstadoPago.PROCESADO);
            pagoRepository.save(p);
        }
        lote.setPagos(pagos);

        try {
            Path carpeta = Paths.get(CARPETA_SALIDA);
            if (!Files.exists(carpeta)) Files.createDirectories(carpeta);

            GeneradorArchivo gen = generadorFactory.get(request.getBanco());
            String contenidoTxt = gen.generarTXT(lote);
            String nombreTxt = "lote_" + lote.getId() + "_" + request.getBanco() + ".txt";
            Path rutaTxt = carpeta.resolve(nombreTxt);
            Files.writeString(rutaTxt, contenidoTxt, StandardCharsets.UTF_8);

            archivoRepository.save(ArchivoGenerado.builder()
                    .tipo(TipoArchivo.TXT)
                    .ruta(rutaTxt.toAbsolutePath().toString())
                    .fechaGeneracion(LocalDateTime.now())
                    .lote(lote)
                    .build());

            String nombrePdf = "lote_" + lote.getId() + "_" + request.getBanco() + ".pdf";
            Path rutaPdf = carpeta.resolve(nombrePdf);
            generadorPDF.generarPDF(lote, rutaPdf.toAbsolutePath().toString());

            archivoRepository.save(ArchivoGenerado.builder()
                    .tipo(TipoArchivo.PDF)
                    .ruta(rutaPdf.toAbsolutePath().toString())
                    .fechaGeneracion(LocalDateTime.now())
                    .lote(lote)
                    .build());

        } catch (IOException e) {
            throw new RuntimeException("Error generando archivos: " + e.getMessage(), e);
        }

        return lote;
    }

    public ArchivoGenerado obtenerArchivo(Long archivoId) {
        return archivoRepository.findById(archivoId)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado: " + archivoId));
    }
}
