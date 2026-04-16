package com.vitasoft.generador;

import com.vitasoft.model.Banco;
import com.vitasoft.model.Lote;
import com.vitasoft.model.Pago;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Generador de archivo TXT para Banco Credicoop.
 * Formato de posición fija según especificación bancaria.
 *
 * Estructura de registro por línea:
 *  1. CBU               (22) alfanumérico
 *  2. Monto             (16) 13 enteros + "," + 2 decimales  (ej: "0000000001500,00")
 *  3. TitularDesc       (100) nombre del titular, padding derecha con espacios
 *  4. TitularCuit       (11) CUIT sin puntos ni guiones
 *  5. TipoCuentaDestino (3)  CCP/CAP/CCA/CAD/CCD — default CCP
 *  6. CuentaDestino     (18) numérico, padding izquierda con ceros
 *  7. CuentaDestinoPBF  (18) numérico, padding izquierda con ceros
 *  8. esCuentaPropia    (1)  S/N — default N
 *  9. TipoPersona       (1)  J/F — default J
 * 10. Concepto          (3)  FAC/HON/ALQ/... — default FAC
 * 11. DescConcepto      (12) padding derecha con espacios
 * 12. Observaciones     (60) padding derecha con espacios
 * 13. Email             (100) padding derecha con espacios
 */
@Component
public class GeneradorCredicoop implements GeneradorArchivo {

    /** Mapeo de código de concepto (3 letras) a su descripción legible. */
    private static final Map<String, String> DESCRIPCIONES_CONCEPTO = Map.of(
            "FAC", "Factura",
            "HON", "Honorarios",
            "ALQ", "Alquiler",
            "PRE", "Préstamo",
            "SEG", "Seguros",
            "CUO", "Cuota",
            "ROP", "Reintegro OS y Prepagas",
            "VAR", "Varios"
    );

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
        // 1. CBU (22)
        String cbu = truncarYPadDerecha(soloAlfanumerico(pago.getProveedor().getCbu()), 22);

        // 2. Monto (16 = %013d,%02d)
        String monto = formatearMonto(pago.getMonto());

        // 3. TitularDesc (100)
        String titularDesc = String.format("%-100s", truncar(normalizar(pago.getProveedor().getNombre()), 100));

        // 4. TitularCuit (11)
        String titularCuit = truncarYPadDerecha(soloNumeros(pago.getProveedor().getCuit()), 11);

        // 5. TipoCuentaDestino (3) — default CCP
        String tipoCuentaDestino = "CCP";

        // 6. CuentaDestino (18) — no está en el modelo, se rellena con ceros
        String cuentaDestino = String.format("%018d", 0L);

        // 7. CuentaDestinoPBF (18) — no está en el modelo, se rellena con ceros
        String cuentaDestinoPBF = String.format("%018d", 0L);

        // 8. esCuentaPropia (1) — default N
        String esCuentaPropia = "N";

        // 9. TipoPersona (1) — default J
        String tipoPersona = "J";

        // 10. Concepto (3)
        String conceptoCodigo = obtenerCodigoConcepto(pago.getConcepto());

        // 11. DescConcepto (12) — descripción derivada del código (FAC → "Factura", etc.)
        String descConcepto = String.format("%-12s", truncar(obtenerDescripcionConcepto(conceptoCodigo), 12));

        // 12. Observaciones (60)
        String observaciones = String.format("%-60s", "");

        // 13. Email (100)
        String email = String.format("%-100s", "");

        return cbu + monto + titularDesc + titularCuit + tipoCuentaDestino
                + cuentaDestino + cuentaDestinoPBF + esCuentaPropia + tipoPersona
                + conceptoCodigo + descConcepto + observaciones + email;
    }

    /**
     * Formatea el monto como 13 dígitos enteros + "," + 2 dígitos decimales.
     * Ejemplo: 1500.00 → "0000000001500,00"
     */
    private String formatearMonto(BigDecimal monto) {
        BigDecimal escalado = monto.setScale(2, RoundingMode.HALF_UP).abs();
        long enteros = escalado.toBigInteger().longValue();
        int centavos = escalado.remainder(BigDecimal.ONE).movePointRight(2).intValue();
        return String.format("%013d,%02d", enteros, centavos);
    }

    /** Devuelve la descripción asociada al código, o "Varios" si el código no está mapeado. */
    private String obtenerDescripcionConcepto(String codigo) {
        return DESCRIPCIONES_CONCEPTO.getOrDefault(codigo, "Varios");
    }

    /**
     * Extrae el código de 3 letras del concepto (FAC, HON, ALQ, etc.).
     * Si el concepto empieza con 3 letras mayúsculas se usan como código;
     * en caso contrario se devuelve "FAC" por defecto.
     */
    private String obtenerCodigoConcepto(String concepto) {
        if (concepto == null || concepto.isBlank()) return "FAC";
        String trimmed = concepto.trim().toUpperCase();
        if (trimmed.length() >= 3) {
            String prefijo = trimmed.substring(0, 3);
            if (prefijo.matches("[A-Z]{3}")) return prefijo;
        }
        return "FAC";
    }

    private String soloNumeros(String s) {
        if (s == null) return "";
        return s.replaceAll("[^0-9]", "");
    }

    private String soloAlfanumerico(String s) {
        if (s == null) return "";
        return s.replaceAll("[^A-Za-z0-9]", "");
    }

    private String normalizar(String s) {
        if (s == null) return "";
        return s.replaceAll("[^A-Za-z0-9 ]", "").toUpperCase();
    }

    private String truncar(String s, int len) {
        if (s == null) return "";
        return s.length() > len ? s.substring(0, len) : s;
    }

    /**
     * String.format("%-Xs", ...) solo rellena pero no trunca.
     * Este helper garantiza largo exacto: trunca si sobra y padding derecha si falta.
     */
    private String truncarYPadDerecha(String s, int len) {
        return String.format("%-" + len + "s", truncar(s, len));
    }

    @Override
    public Banco getBanco() {
        return Banco.CREDICOOP;
    }
}
