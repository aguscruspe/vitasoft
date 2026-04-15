package com.vitasoft.generador;

import com.vitasoft.model.Banco;
import com.vitasoft.model.Lote;
import com.vitasoft.model.Pago;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Generador de archivo TXT para Banco Credicoop.
 * Formato de posición fija según especificación bancaria.
 *
 * Estructura de registro (100 caracteres):
 *  - 001-022: CBU destino (22)
 *  - 023-037: Monto (15) sin coma, con 2 decimales, relleno con ceros a la izquierda
 *  - 038-048: CUIT (11)
 *  - 049-078: Nombre proveedor (30)
 *  - 079-088: Fecha de pago AAAAMMDD + 2 reservados (10)
 *  - 089-100: Concepto (12) truncado / padded
 */
@Component
public class GeneradorCredicoop implements GeneradorArchivo {

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Override
    public String generarTXT(Lote lote) {
        StringBuilder sb = new StringBuilder();
        for (Pago pago : lote.getPagos()) {
            sb.append(buildLinea(pago));
            sb.append(System.lineSeparator());
        }
        return sb.toString();
    }

    private String buildLinea(Pago pago) {
        String cbu = padRight(soloNumeros(pago.getProveedor().getCbu()), 22);
        String monto = formatearMonto(pago.getMonto());
        String cuit = padRight(soloNumeros(pago.getProveedor().getCuit()), 11);
        String nombre = padRight(normalizar(pago.getProveedor().getNombre()), 30);
        LocalDate fecha = pago.getFechaPago() != null ? pago.getFechaPago() : LocalDate.now();
        String fechaStr = fecha.format(FECHA_FORMATTER) + "  ";
        String concepto = padRight(normalizar(pago.getConcepto() == null ? "" : pago.getConcepto()), 12);

        return cbu + monto + cuit + nombre + fechaStr + concepto;
    }

    private String formatearMonto(BigDecimal monto) {
        BigDecimal escalado = monto.setScale(2, RoundingMode.HALF_UP);
        String sinPunto = escalado.movePointRight(2).toBigInteger().toString();
        return padLeftZeros(sinPunto, 15);
    }

    private String soloNumeros(String s) {
        if (s == null) return "";
        return s.replaceAll("[^0-9]", "");
    }

    private String normalizar(String s) {
        if (s == null) return "";
        return s.replaceAll("[^A-Za-z0-9 ]", "").toUpperCase();
    }

    private String padRight(String s, int len) {
        if (s == null) s = "";
        if (s.length() >= len) return s.substring(0, len);
        StringBuilder sb = new StringBuilder(s);
        while (sb.length() < len) sb.append(' ');
        return sb.toString();
    }

    private String padLeftZeros(String s, int len) {
        if (s == null) s = "";
        if (s.length() >= len) return s.substring(s.length() - len);
        StringBuilder sb = new StringBuilder();
        while (sb.length() + s.length() < len) sb.append('0');
        sb.append(s);
        return sb.toString();
    }

    @Override
    public Banco getBanco() {
        return Banco.CREDICOOP;
    }
}
