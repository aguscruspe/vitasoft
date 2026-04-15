package com.vitasoft.service;

import com.vitasoft.dto.ImportResultDTO;
import com.vitasoft.dto.PagoRequest;
import com.vitasoft.model.Banco;
import com.vitasoft.model.EstadoPago;
import com.vitasoft.model.Pago;
import com.vitasoft.model.Proveedor;
import com.vitasoft.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ProveedorService proveedorService;

    public List<Pago> buscar(EstadoPago estado, LocalDate desde, LocalDate hasta, Banco banco) {
        return pagoRepository.buscarConFiltros(estado, desde, hasta, banco);
    }

    public Pago obtener(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado: " + id));
    }

    public Pago actualizar(Long id, PagoRequest request) {
        Pago pago = obtener(id);
        if (request.getProveedorId() != null) {
            Proveedor prov = proveedorService.obtener(request.getProveedorId());
            pago.setProveedor(prov);
        }
        if (request.getMonto() != null) pago.setMonto(request.getMonto());
        if (request.getConcepto() != null) pago.setConcepto(request.getConcepto());
        if (request.getFechaPago() != null) pago.setFechaPago(request.getFechaPago());
        return pagoRepository.save(pago);
    }

    public void eliminar(Long id) {
        Pago pago = obtener(id);
        pago.setEstado(EstadoPago.ELIMINADO);
        pagoRepository.save(pago);
    }

    /**
     * Importa un archivo Excel con columnas:
     *   nombre | cuit | cbu | monto | concepto | fechaPago (dd/MM/yyyy o serial de Excel)
     * La primera fila se asume header y se descarta.
     */
    public ImportResultDTO importarExcel(MultipartFile archivo) {
        ImportResultDTO result = new ImportResultDTO();
        result.setMensajesError(new ArrayList<>());

        try (Workbook workbook = WorkbookFactory.create(archivo.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();
            if (rows.hasNext()) rows.next(); // skip header

            DataFormatter df = new DataFormatter();
            int nroFila = 1;
            while (rows.hasNext()) {
                Row row = rows.next();
                nroFila++;
                try {
                    String nombre = df.formatCellValue(row.getCell(0)).trim();
                    String cuit = df.formatCellValue(row.getCell(1)).trim();
                    String cbu = df.formatCellValue(row.getCell(2)).trim();
                    String montoStr = df.formatCellValue(row.getCell(3)).trim().replace(",", ".");
                    String concepto = df.formatCellValue(row.getCell(4)).trim();
                    Cell fechaCell = row.getCell(5);

                    if (nombre.isEmpty() && cuit.isEmpty() && montoStr.isEmpty()) {
                        continue; // fila vacía
                    }

                    if (montoStr.isEmpty()) {
                        throw new IllegalArgumentException("Monto vacío");
                    }

                    BigDecimal monto = new BigDecimal(montoStr);
                    LocalDate fechaPago = null;
                    if (fechaCell != null) {
                        if (fechaCell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC
                                && org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(fechaCell)) {
                            fechaPago = fechaCell.getDateCellValue().toInstant()
                                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                        } else {
                            String s = df.formatCellValue(fechaCell).trim();
                            if (!s.isEmpty()) {
                                fechaPago = LocalDate.parse(s,
                                        java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                            }
                        }
                    }

                    Proveedor prov = proveedorService.buscarOCrear(nombre, cbu, cuit);
                    Pago pago = Pago.builder()
                            .proveedor(prov)
                            .monto(monto)
                            .concepto(concepto)
                            .estado(EstadoPago.PENDIENTE)
                            .fechaPago(fechaPago)
                            .build();
                    pagoRepository.save(pago);
                    result.setImportados(result.getImportados() + 1);
                } catch (Exception e) {
                    result.setErrores(result.getErrores() + 1);
                    result.getMensajesError().add("Fila " + nroFila + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            result.getMensajesError().add("Error procesando archivo: " + e.getMessage());
        }
        return result;
    }
}
