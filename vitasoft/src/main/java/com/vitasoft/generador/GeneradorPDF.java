package com.vitasoft.generador;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.vitasoft.model.Lote;
import com.vitasoft.model.Pago;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

/**
 * Generador de PDF del lote con iText7.
 * Incluye encabezado (banco, fecha, total) y tabla de pagos.
 */
@Component
public class GeneradorPDF {

    public void generarPDF(Lote lote, String rutaDestino) throws IOException {
        try (PdfWriter writer = new PdfWriter(rutaDestino);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            doc.add(new Paragraph("VITASOFT - Comprobante de Lote de Pagos")
                    .setBold().setFontSize(16).setTextAlignment(TextAlignment.CENTER));

            doc.add(new Paragraph("Lote N°: " + lote.getId()));
            doc.add(new Paragraph("Banco: " + lote.getBanco()));
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            doc.add(new Paragraph("Fecha de creación: "
                    + (lote.getFechaCreacion() == null ? "-" : lote.getFechaCreacion().format(fmt))));
            doc.add(new Paragraph("Estado: " + lote.getEstado()));

            BigDecimal total = BigDecimal.ZERO;

            Table table = new Table(UnitValue.createPercentArray(new float[]{1, 4, 3, 3, 3}))
                    .useAllAvailableWidth();
            table.addHeaderCell(new Cell().add(new Paragraph("#").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Proveedor").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("CUIT").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("CBU").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Monto").setBold()));

            int i = 1;
            if (lote.getPagos() != null) {
                for (Pago pago : lote.getPagos()) {
                    table.addCell(String.valueOf(i++));
                    table.addCell(pago.getProveedor() != null ? safe(pago.getProveedor().getNombre()) : "-");
                    table.addCell(pago.getProveedor() != null ? safe(pago.getProveedor().getCuit()) : "-");
                    table.addCell(pago.getProveedor() != null ? safe(pago.getProveedor().getCbu()) : "-");
                    table.addCell("$ " + pago.getMonto().toPlainString());
                    total = total.add(pago.getMonto());
                }
            }

            doc.add(table);
            doc.add(new Paragraph("\nTOTAL: $ " + total.toPlainString())
                    .setBold().setTextAlignment(TextAlignment.RIGHT));
        }
    }

    private String safe(String s) {
        return s == null ? "-" : s;
    }
}
