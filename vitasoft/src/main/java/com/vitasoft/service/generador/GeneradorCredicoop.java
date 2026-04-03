package com.vitasoft.service.generador;

import com.vitasoft.entity.Lote;
import com.vitasoft.entity.Pago;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Generador TXT para Banco Credicoop.
 * Formato de posición fija, un registro por línea.
 *
 * Campos por registro:
 *   CBU              22 chars  alfanumérico
 *   Monto            15 chars  13 enteros + 2 decimales, separador coma
 *   TitularDesc     100 chars  nombre del proveedor
 *   TitularCui       11 chars  CUIT sin guiones
 *   TipoCuentaDest    3 chars  CCP/CCA/CAP/CAD/CCD
 *   CuentaDestino    18 chars
 *   CuentaDestinoPBF 18 chars
 *   esCuentaPropia    1 char   S/N
 *   TipoPersona       1 char   J/F
 *   Concepto          3 chars  FAC, HON, ALQ, etc.
 *   DescConcepto     12 chars
 *   Observaciones    60 chars
 *   Email           100 chars
 */
@Component
public class GeneradorCredicoop implements GeneradorArchivo {

    private static final int CBU_LEN = 22;
    private static final int MONTO_LEN = 15;
    private static final int TITULAR_DESC_LEN = 100;
    private static final int TITULAR_CUI_LEN = 11;
    private static final int TIPO_CUENTA_DEST_LEN = 3;
    private static final int CUENTA_DESTINO_LEN = 18;
    private static final int CUENTA_DESTINO_PBF_LEN = 18;
    private static final int ES_CUENTA_PROPIA_LEN = 1;
    private static final int TIPO_PERSONA_LEN = 1;
    private static final int CONCEPTO_LEN = 3;
    private static final int DESC_CONCEPTO_LEN = 12;
    private static final int OBSERVACIONES_LEN = 60;
    private static final int EMAIL_LEN = 100;

    @Override
    public String generarTXT(Lote lote) {
        StringBuilder sb = new StringBuilder();

        for (Pago pago : lote.getPagos()) {
            String cbu = padRight(safe(pago.getProveedor().getCbu()), CBU_LEN);
            String monto = formatMonto(pago.getMonto());
            String titularDesc = padRight(safe(pago.getProveedor().getNombre()), TITULAR_DESC_LEN);
            String titularCui = padRight(limpiarCuit(pago.getProveedor().getCuit()), TITULAR_CUI_LEN);
            String tipoCuentaDest = padRight(detectarTipoCuenta(pago.getProveedor().getCbu()), TIPO_CUENTA_DEST_LEN);
            String cuentaDestino = padRight(extraerCuenta(pago.getProveedor().getCbu()), CUENTA_DESTINO_LEN);
            String cuentaDestinoPBF = padRight("", CUENTA_DESTINO_PBF_LEN);
            String esCuentaPropia = padRight("N", ES_CUENTA_PROPIA_LEN);
            String tipoPersona = padRight("J", TIPO_PERSONA_LEN);
            String concepto = padRight(detectarConcepto(pago.getConcepto()), CONCEPTO_LEN);
            String descConcepto = padRight(safe(pago.getConcepto()), DESC_CONCEPTO_LEN);
            String observaciones = padRight("", OBSERVACIONES_LEN);
            String email = padRight("", EMAIL_LEN);

            sb.append(cbu)
              .append(monto)
              .append(titularDesc)
              .append(titularCui)
              .append(tipoCuentaDest)
              .append(cuentaDestino)
              .append(cuentaDestinoPBF)
              .append(esCuentaPropia)
              .append(tipoPersona)
              .append(concepto)
              .append(descConcepto)
              .append(observaciones)
              .append(email)
              .append("\r\n");
        }

        return sb.toString();
    }

    /**
     * Formatea monto a 15 chars: 13 enteros + 2 decimales, separador coma.
     * Ej: 12345.67 → "0000000012345,67"  (15 chars)
     */
    private String formatMonto(BigDecimal monto) {
        if (monto == null) monto = BigDecimal.ZERO;
        long centavos = monto.movePointRight(2).longValue();
        long parteEntera = centavos / 100;
        long parteDecimal = centavos % 100;
        // 13 dígitos enteros + coma + 2 decimales = 16... ajusto a 15: 12 enteros + coma + 2 dec
        String formatted = String.format("%012d,%02d", parteEntera, parteDecimal);
        // Asegurar 15 caracteres exactos
        return padRight(formatted, MONTO_LEN);
    }

    /**
     * Detecta tipo de cuenta a partir del CBU.
     * Posiciones 5-6 del CBU indican tipo de cuenta.
     */
    private String detectarTipoCuenta(String cbu) {
        if (cbu == null || cbu.length() < 6) return "CCA";
        String tipo = cbu.substring(4, 5);
        return switch (tipo) {
            case "4" -> "CCA"; // Cuenta corriente
            case "3" -> "CAP"; // Caja de ahorro en pesos
            default -> "CCA";
        };
    }

    /**
     * Extrae número de cuenta desde el CBU (posiciones 9 a 21).
     */
    private String extraerCuenta(String cbu) {
        if (cbu == null || cbu.length() < 22) return "";
        return cbu.substring(8, 21);
    }

    /**
     * Detecta código de concepto a partir del texto del concepto del pago.
     */
    private String detectarConcepto(String concepto) {
        if (concepto == null) return "VAR";
        String upper = concepto.toUpperCase();
        if (upper.contains("FACTURA") || upper.contains("FAC")) return "FAC";
        if (upper.contains("HONORARIO") || upper.contains("HON")) return "HON";
        if (upper.contains("ALQUILER") || upper.contains("ALQ")) return "ALQ";
        if (upper.contains("SERVICIO") || upper.contains("SER")) return "HAB";
        return "VAR";
    }

    private String limpiarCuit(String cuit) {
        if (cuit == null) return "";
        return cuit.replaceAll("[^0-9]", "");
    }

    private String safe(String val) {
        return val != null ? val : "";
    }

    private String padRight(String s, int len) {
        if (s == null) s = "";
        if (s.length() > len) return s.substring(0, len);
        return String.format("%-" + len + "s", s);
    }
}
