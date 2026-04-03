package com.vitasoft.service.generador;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.vitasoft.entity.Lote;
import com.vitasoft.entity.Pago;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;

/**
 * Genera un PDF con tabla de pagos del lote.
 * Columnas: Proveedor, CUIT, CBU, Monto, Concepto
 * Encabezado: fecha, banco, total del lote.
 */
@Component
public class GeneradorPDF {

    private static final DateTimeFormatter FMT_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public void generar(Lote lote, Path destino) throws IOException {
        try (PdfWriter writer = new PdfWriter(destino.toFile());
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document doc = new Document(pdfDoc)) {

            // --- Encabezado ---
            doc.add(new Paragraph("Resumen de Lote de Pagos")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            doc.add(new Paragraph(" "));

            BigDecimal total = lote.getPagos().stream()
                    .map(Pago::getMonto)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            doc.add(new Paragraph("Lote ID: " + lote.getId()).setFontSize(11));
            doc.add(new Paragraph("Banco: " + lote.getBanco().name()).setFontSize(11));
            doc.add(new Paragraph("Fecha: " + lote.getFechaCreacion().format(FMT_FECHA)).setFontSize(11));
            doc.add(new Paragraph("Cantidad de pagos: " + lote.getPagos().size()).setFontSize(11));
            doc.add(new Paragraph("Total del lote: $" + total.toPlainString())
                    .setFontSize(12).setBold());

            doc.add(new Paragraph(" "));

            // --- Tabla de pagos ---
            Table table = new Table(UnitValue.createPercentArray(new float[]{25, 12, 23, 15, 25}))
                    .useAllAvailableWidth();

            // Header
            String[] headers = {"Proveedor", "CUIT", "CBU", "Monto", "Concepto"};
            for (String h : headers) {
                table.addHeaderCell(new Cell()
                        .add(new Paragraph(h).setBold().setFontSize(10)));
            }

            // Filas
            for (Pago pago : lote.getPagos()) {
                table.addCell(cell(safe(pago.getProveedor().getNombre())));
                table.addCell(cell(safe(pago.getProveedor().getCuit())));
                table.addCell(cell(safe(pago.getProveedor().getCbu())));
                table.addCell(cell("$" + (pago.getMonto() != null ? pago.getMonto().toPlainString() : "0")));
                table.addCell(cell(safe(pago.getConcepto())));
            }

            doc.add(table);

            // --- Pie ---
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("TOTAL: $" + total.toPlainString())
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT));
        }
    }

    private Cell cell(String text) {
        return new Cell().add(new Paragraph(text).setFontSize(9));
    }

    private String safe(String val) {
        return val != null ? val : "";
    }
}
