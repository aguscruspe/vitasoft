package com.vitasoft.service.generador;

import com.vitasoft.entity.Lote;
import com.vitasoft.entity.Pago;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Generador TXT para Banco Galicia.
 * Formato de posición fija, registros de 320 caracteres.
 *
 * Registro por pago (código "PD"):
 *   Pos  1-2    Código registro = "PD"
 *   Pos  3-8    Nro registro (correlativo, 6 dígitos)
 *   Pos  9-25   Importe en centavos (17 dígitos, zero-padded)
 *   Pos 26-28   Moneda = "001" (pesos)
 *   Pos 29-50   CBU (22 caracteres)
 *   Pos 51-58   Reservado (blancos)
 *   Pos 59-108  Nombre beneficiario (50 caracteres)
 *   Pos 109-179 Reservado (blancos)
 *   Pos 180-190 CUIT (11 dígitos)
 *   Pos 191-229 Reservado (blancos)
 *   Pos 230-320 Espacio libre (blancos)
 */
@Component
public class GeneradorGalicia implements GeneradorArchivo {

    private static final int LINEA_LEN = 320;

    @Override
    public String generarTXT(Lote lote) {
        StringBuilder sb = new StringBuilder();

        int nroRegistro = 1;
        for (Pago pago : lote.getPagos()) {
            char[] linea = new char[LINEA_LEN];
            java.util.Arrays.fill(linea, ' ');

            // Pos 1-2: Código registro "PD"
            escribir(linea, 0, 2, "PD");

            // Pos 3-8: Nro registro correlativo (6 dígitos)
            escribir(linea, 2, 6, String.format("%06d", nroRegistro));

            // Pos 9-25: Importe en centavos (17 dígitos, zero-padded)
            long centavos = pago.getMonto() != null
                    ? pago.getMonto().movePointRight(2).longValue()
                    : 0;
            escribir(linea, 8, 17, String.format("%017d", centavos));

            // Pos 26-28: Moneda "001"
            escribir(linea, 25, 3, "001");

            // Pos 29-50: CBU (22 chars)
            escribir(linea, 28, 22, safe(pago.getProveedor().getCbu()));

            // Pos 51-58: Reservado (ya son blancos)

            // Pos 59-108: Nombre beneficiario (50 chars)
            escribir(linea, 58, 50, safe(pago.getProveedor().getNombre()));

            // Pos 109-179: Reservado (ya son blancos)

            // Pos 180-190: CUIT (11 dígitos)
            escribir(linea, 179, 11, limpiarCuit(pago.getProveedor().getCuit()));

            // Pos 191-229: Reservado (ya son blancos)
            // Pos 230-320: Espacio libre (ya son blancos)

            sb.append(new String(linea)).append("\r\n");
            nroRegistro++;
        }

        return sb.toString();
    }

    /**
     * Escribe un valor en el array de caracteres en la posición indicada.
     * Trunca si excede maxLen, deja blancos si es más corto.
     */
    private void escribir(char[] linea, int posInicio, int maxLen, String valor) {
        if (valor == null) return;
        int len = Math.min(valor.length(), maxLen);
        for (int i = 0; i < len; i++) {
            if (posInicio + i < linea.length) {
                linea[posInicio + i] = valor.charAt(i);
            }
        }
    }

    private String limpiarCuit(String cuit) {
        if (cuit == null) return "";
        return cuit.replaceAll("[^0-9]", "");
    }

    private String safe(String val) {
        return val != null ? val : "";
    }
}
