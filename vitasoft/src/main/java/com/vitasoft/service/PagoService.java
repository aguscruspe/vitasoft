package com.vitasoft.service;

import com.vitasoft.dto.ImportResultDTO;
import com.vitasoft.dto.PagoRequest;
import com.vitasoft.entity.Pago;
import com.vitasoft.entity.Proveedor;
import com.vitasoft.entity.enums.Banco;
import com.vitasoft.entity.enums.EstadoPago;
import com.vitasoft.repository.PagoRepository;
import com.vitasoft.repository.ProveedorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ProveedorRepository proveedorRepository;

    // -------------------------------------------------------
    // Importar pagos desde Excel (.xlsx)
    // Columnas: nombre proveedor | CUIT | CBU | monto | concepto | fecha de pago
    // -------------------------------------------------------
    @Transactional
    public ImportResultDTO importarDesdeExcel(MultipartFile file) {
        List<String> errores = new ArrayList<>();
        int totalLeidos = 0;
        int totalImportados = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();

            for (int i = 1; i <= lastRow; i++) { // Fila 0 = encabezados
                Row row = sheet.getRow(i);
                if (row == null) continue;

                totalLeidos++;
                try {
                    String nombreProveedor = getStringCell(row, 0);
                    String cuit = getStringCell(row, 1);
                    String cbu = getStringCell(row, 2);
                    BigDecimal monto = getNumericCell(row, 3);
                    String concepto = getStringCell(row, 4);
                    LocalDate fechaPago = getDateCell(row, 5);

                    if (cuit == null || cuit.isBlank()) {
                        errores.add("Fila " + (i + 1) + ": CUIT vacío");
                        continue;
                    }
                    if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
                        errores.add("Fila " + (i + 1) + ": monto inválido");
                        continue;
                    }

                    // Buscar o crear proveedor
                    Proveedor proveedor = proveedorRepository.findByCuit(cuit)
                            .orElseGet(() -> proveedorRepository.save(
                                    Proveedor.builder()
                                            .nombre(nombreProveedor != null ? nombreProveedor : "Sin nombre")
                                            .cuit(cuit)
                                            .cbu(cbu != null ? cbu : "")
                                            .build()
                            ));

                    // Si el proveedor ya existía pero el CBU viene en el Excel, actualizarlo
                    if (cbu != null && !cbu.isBlank() && (proveedor.getCbu() == null || proveedor.getCbu().isBlank())) {
                        proveedor.setCbu(cbu);
                        proveedorRepository.save(proveedor);
                    }

                    Pago pago = Pago.builder()
                            .proveedor(proveedor)
                            .monto(monto)
                            .concepto(concepto)
                            .estado(EstadoPago.PENDIENTE)
                            .fechaPago(fechaPago)
                            .build();

                    pagoRepository.save(pago);
                    totalImportados++;

                } catch (Exception e) {
                    errores.add("Fila " + (i + 1) + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            errores.add("Error al leer el archivo: " + e.getMessage());
            log.error("Error importando Excel", e);
        }

        return ImportResultDTO.builder()
                .totalLeidos(totalLeidos)
                .totalImportados(totalImportados)
                .errores(errores)
                .build();
    }

    // -------------------------------------------------------
    // Listar con filtros opcionales
    // -------------------------------------------------------
    @Transactional(readOnly = true)
    public List<Pago> listarConFiltros(EstadoPago estado, Banco banco, LocalDate desde, LocalDate hasta) {
        return pagoRepository.filtrar(estado, banco, desde, hasta);
    }

    // -------------------------------------------------------
    // Editar pago (ej: CBU faltante, monto, concepto)
    // -------------------------------------------------------
    @Transactional
    public Pago actualizar(Long id, PagoRequest request) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pago no encontrado con id: " + id));

        if (pago.getEstado() == EstadoPago.ELIMINADO) {
            throw new IllegalStateException("No se puede editar un pago eliminado");
        }

        if (request.getProveedorId() != null) {
            Proveedor proveedor = proveedorRepository.findById(request.getProveedorId())
                    .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado"));
            pago.setProveedor(proveedor);
        }
        if (request.getMonto() != null) {
            pago.setMonto(request.getMonto());
        }
        if (request.getConcepto() != null) {
            pago.setConcepto(request.getConcepto());
        }
        if (request.getFechaPago() != null) {
            pago.setFechaPago(request.getFechaPago());
        }
        // Permitir actualizar CBU del proveedor desde acá
        if (request.getCbu() != null && !request.getCbu().isBlank()) {
            pago.getProveedor().setCbu(request.getCbu());
            proveedorRepository.save(pago.getProveedor());
        }

        return pagoRepository.save(pago);
    }

    // -------------------------------------------------------
    // Eliminación lógica
    // -------------------------------------------------------
    @Transactional
    public Pago eliminar(Long id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pago no encontrado con id: " + id));

        pago.setEstado(EstadoPago.ELIMINADO);
        return pagoRepository.save(pago);
    }

    // -------------------------------------------------------
    // Helpers para leer celdas del Excel
    // -------------------------------------------------------
    private String getStringCell(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            // CUIT/CBU pueden venir como número
            long val = (long) cell.getNumericCellValue();
            return String.valueOf(val);
        }
        return null;
    }

    private BigDecimal getNumericCell(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim().replace(",", ".");
            return new BigDecimal(val);
        }
        return null;
    }

    private LocalDate getDateCell(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
        }
        if (cell.getCellType() == CellType.STRING) {
            return LocalDate.parse(cell.getStringCellValue().trim());
        }
        return null;
    }
}
