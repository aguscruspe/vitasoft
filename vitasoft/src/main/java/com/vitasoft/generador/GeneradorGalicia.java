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
 * Generador de archivo TXT para Banco Galicia.
 * Registro de 320 caracteres, posición fija.
 *
 * Estructura:
 *  001-002: Tipo registro (2) -> "01"
 *  003-024: CBU destino (22)
 *  025-035: CUIT (11)
 *  036-085: Nombre proveedor (50)
 *  086-100: Monto (15) sin coma, con 2 decimales, relleno con ceros
 *  101-108: Fecha pago AAAAMMDD (8)
 *  109-188: Concepto (80)
 *  189-320: Relleno con espacios (132)
 */
@Component
public class GeneradorGalicia implements GeneradorArchivo {

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int LARGO_TOTAL = 320;

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
        String tipoRegistro = "01";
        String cbu = padRight(soloNumeros(pago.getProveedor().getCbu()), 22);
        String cuit = padRight(soloNumeros(pago.getProveedor().getCuit()), 11);
        String nombre = padRight(normalizar(pago.getProveedor().getNombre()), 50);
        String monto = formatearMonto(pago.getMonto());
        LocalDate fecha = pago.getFechaPago() != null ? pago.getFechaPago() : LocalDate.now();
        String fechaStr = fecha.format(FECHA_FORMATTER);
        String concepto = padRight(normalizar(pago.getConcepto() == null ? "" : pago.getConcepto()), 80);

        StringBuilder registro = new StringBuilder();
        registro.append(tipoRegistro)
                .append(cbu)
                .append(cuit)
                .append(nombre)
                .append(monto)
                .append(fechaStr)
                .append(concepto);

        while (registro.length() < LARGO_TOTAL) registro.append(' ');
        return registro.substring(0, LARGO_TOTAL);
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
        return Banco.GALICIA;
    }
}
