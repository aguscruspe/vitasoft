package com.vitasoft.generador;

import com.vitasoft.model.Banco;
import com.vitasoft.model.Lote;
import com.vitasoft.model.Pago;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Generador de archivo TXT para Banco Galicia.
 * Registro de posición fija de EXACTAMENTE 320 caracteres.
 *
 * Estructura:
 *  001-002: Código registro       (2)  — "PD" fijo
 *  003-008: Nro registro          (6)  — correlativo, padding ceros izquierda
 *  009-025: Importe transferencia (17) — en CENTAVOS, padding ceros izquierda
 *  026-028: Moneda                (3)  — "001" fijo (pesos)
 *  029-050: CBU del crédito       (22) — numérico
 *  051-058: Fecha de pago         (8)  — DDMMAAAA, blancos si no se informa
 *  059-108: Nombre beneficiario   (50) — padding espacios derecha
 *  109-138: Dirección             (30) — blancos
 *  139-158: Localidad             (20) — blancos
 *  159-164: Código postal         (6)  — blancos
 *  165-179: Teléfono              (15) — blancos
 *  180-190: CUIT beneficiario     (11) — numérico
 *  191-225: Número de Orden Pago  (35) — blancos
 *  226-227: Concepto de Pago      (2)  — "01" fijo
 *  228-229: Destino Comprobantes  (2)  — "02" fijo
 *  230-320: Espacio libre         (91) — blancos
 */
@Component
public class GeneradorGalicia implements GeneradorArchivo {

    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("ddMMyyyy");
    private static final int LARGO_TOTAL = 320;

    @Override
    public String generarTXT(Lote lote) {
        StringBuilder sb = new StringBuilder();
        int correlativo = 1;
        for (Pago pago : lote.getPagos()) {
            sb.append(buildLinea(pago, correlativo));
            sb.append(System.lineSeparator());
            correlativo++;
        }
        return sb.toString();
    }

    private String buildLinea(Pago pago, int correlativo) {
        StringBuilder r = new StringBuilder(LARGO_TOTAL);

        // 001-002 (2)  Código registro
        r.append("PD");

        // 003-008 (6)  Nro registro correlativo
        r.append(String.format("%06d", correlativo));

        // 009-025 (17) Importe en centavos
        r.append(formatearMontoEnCentavos(pago.getMonto()));

        // 026-028 (3)  Moneda
        r.append("001");

        // 029-050 (22) CBU
        r.append(padDerecha(soloNumeros(pago.getProveedor().getCbu()), 22));

        // 051-058 (8)  Fecha DDMMAAAA (o blancos)
        r.append(formatearFecha(pago.getFechaPago()));

        // 059-108 (50) Nombre/Razón social
        r.append(padDerecha(normalizar(pago.getProveedor().getNombre()), 50));

        // 109-138 (30) Dirección — blancos
        r.append(blancos(30));

        // 139-158 (20) Localidad — blancos
        r.append(blancos(20));

        // 159-164 (6)  Código postal — blancos
        r.append(blancos(6));

        // 165-179 (15) Teléfono — blancos
        r.append(blancos(15));

        // 180-190 (11) CUIT
        r.append(padDerecha(soloNumeros(pago.getProveedor().getCuit()), 11));

        // 191-225 (35) Orden de Pago — blancos
        r.append(blancos(35));

        // 226-227 (2)  Concepto de Pago
        r.append("01");

        // 228-229 (2)  Destino de Comprobantes
        r.append("02");

        // 230-320 (91) Espacio libre
        r.append(blancos(91));

        if (r.length() != LARGO_TOTAL) {
            throw new IllegalStateException(
                    "Registro Galicia con largo inválido: " + r.length()
                            + " (esperado " + LARGO_TOTAL + ")");
        }
        return r.toString();
    }

    /**
     * Convierte el monto a CENTAVOS como string de 17 dígitos con padding izquierda.
     * Ejemplo: $1500.00 → 150000 → "00000000000150000"
     */
    private String formatearMontoEnCentavos(BigDecimal monto) {
        BigInteger centavos = monto.setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .abs()
                .toBigInteger();
        return String.format("%017d", centavos);
    }

    /** Formato DDMMAAAA (8 chars). Devuelve 8 blancos si no hay fecha. */
    private String formatearFecha(LocalDate fecha) {
        if (fecha == null) return blancos(8);
        return fecha.format(FECHA_FORMATTER);
    }

    /**
     * Rellena con espacios a derecha o trunca para garantizar largo exacto.
     * String.format("%-Xs", ...) solo rellena pero no trunca, por eso truncamos antes.
     */
    private String padDerecha(String s, int len) {
        String base = s == null ? "" : s;
        if (base.length() > len) base = base.substring(0, len);
        return String.format("%-" + len + "s", base);
    }

    private String blancos(int len) {
        return " ".repeat(len);
    }

    private String soloNumeros(String s) {
        if (s == null) return "";
        return s.replaceAll("[^0-9]", "");
    }

    private String normalizar(String s) {
        if (s == null) return "";
        return s.replaceAll("[^A-Za-z0-9 ]", "").toUpperCase();
    }

    @Override
    public Banco getBanco() {
        return Banco.GALICIA;
    }
}
