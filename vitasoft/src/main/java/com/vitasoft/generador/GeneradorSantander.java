package com.vitasoft.generador;

import com.vitasoft.model.Banco;
import com.vitasoft.model.Lote;
import com.vitasoft.model.Pago;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

/**
 * Generador de archivo TXT para Banco Santander Río — pagos masivos.
 *
 * El archivo se compone de:
 *   - 1 registro Header  (tipo "H")
 *   - N registros Detalle (tipo "D"), uno por pago
 *   - 1 registro Trailer (tipo "T")
 *
 * Cada registro debe tener EXACTAMENTE 650 caracteres.
 *
 * Los datos "de empresa" (CUIT empresa, nro acuerdo) se inyectan vía
 * application.properties:
 *   santander.cuit-empresa=XXXXXXXXXXX
 *   santander.nro-acuerdo=NN
 */
@Component
public class GeneradorSantander implements GeneradorArchivo {

    private static final int LARGO_REGISTRO = 650;
    private static final DateTimeFormatter FECHA_AAAAMMDD = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter FECHA_AAAAMM = DateTimeFormatter.ofPattern("yyyyMM");

    @Value("${santander.cuit-empresa:00000000000}")
    private String cuitEmpresa;

    @Value("${santander.nro-acuerdo:00}")
    private String nroAcuerdo;

    @Override
    public String generarTXT(Lote lote) {
        StringBuilder archivo = new StringBuilder();
        List<Pago> pagos = lote.getPagos() == null ? Collections.emptyList() : lote.getPagos();

        // Header
        archivo.append(buildHeader()).append(System.lineSeparator());

        // Detalle (N), acumulando total e importe
        BigInteger totalCentavos = BigInteger.ZERO;
        int cantidad = 0;
        for (Pago pago : pagos) {
            archivo.append(buildDetalle(pago)).append(System.lineSeparator());
            totalCentavos = totalCentavos.add(aCentavos(pago.getMonto()));
            cantidad++;
        }

        // Trailer
        archivo.append(buildTrailer(totalCentavos, cantidad)).append(System.lineSeparator());

        return archivo.toString();
    }

    // ==============================================================
    // HEADER
    // ==============================================================
    private String buildHeader() {
        StringBuilder r = new StringBuilder(LARGO_REGISTRO);

        // 001      (1)  Tipo registro
        r.append("H");

        // 002-018  (17) Nro acuerdo = CUIT(11) + "0" + "013" + nroAcuerdo(2)
        String cuit = padLeftZeros(soloNumeros(cuitEmpresa), 11);
        String acuerdo = padLeftZeros(soloNumeros(nroAcuerdo), 2);
        r.append(cuit).append("0").append("013").append(acuerdo);

        // 019-021  (3)  Código de canal
        r.append("007");

        // 022-026  (5)  Número de envío
        r.append("00001");

        // 027-031  (5)  Reservado
        r.append("00000");

        // 032-038  (7)  Reservado (espacios)
        r.append(blancos(7));

        // 039      (1)  Validación CUIL
        r.append(" ");

        // 040-650  (611) Reservado (espacios)
        r.append(blancos(611));

        verificarLargo(r, "Header");
        return r.toString();
    }

    // ==============================================================
    // DETALLE
    // ==============================================================
    private String buildDetalle(Pago pago) {
        StringBuilder r = new StringBuilder(LARGO_REGISTRO);

        // 001      (1)  Tipo registro
        r.append("D");

        // 002      (1)  Reservado
        r.append(" ");

        // 003      (1)  Código moneda (0 = pesos)
        r.append("0");

        // 004-018  (15) Nro beneficiario = id del pago
        long id = pago.getId() == null ? 0L : pago.getId();
        r.append(String.format("%015d", id));

        // 019-020  (2)  Tipo comprobante
        r.append("RC");

        // 021-035  (15) Nro comprobante = AAAAMM alineado a la izquierda, ceros a la derecha
        //                Ej: fecha 2026-04-15 → "202604000000000"
        LocalDate fecha = pago.getFechaPago() != null ? pago.getFechaPago() : LocalDate.now();
        r.append(String.format("%-15s", fecha.format(FECHA_AAAAMM)).replace(' ', '0'));

        // 036-039  (4)  Reservado
        r.append("0000");

        // 040-069  (30) Nombre beneficiario
        r.append(padDerecha(normalizar(pago.getProveedor().getNombre()), 30));

        // 070-120  (51) Dirección (espacios)
        r.append(blancos(51));

        // 121-125  (5)  Reservado
        r.append("00000");

        // 126-129  (4)  Reservado (espacios)
        r.append(blancos(4));

        // 130-212  (83) Reservado (ceros)
        r.append(ceros(83));

        // 213-223  (11) Reservado (espacios)
        r.append(blancos(11));

        // 224-234  (11) CUIT beneficiario
        r.append(padLeftZeros(soloNumeros(pago.getProveedor().getCuit()), 11));

        // 235-396  (162) Reservado (espacios)
        r.append(blancos(162));

        // 397      (1)  Marca agrupación
        r.append("N");

        // 398-401  (4)  País
        r.append("0054");

        // 402-427  (26) CBU: 4 ceros + CBU(22)
        String cbu = padLeftZeros(soloNumeros(pago.getProveedor().getCbu()), 22);
        r.append("0000").append(cbu);

        // 428-435  (8)  Reservado
        r.append("00000000");

        // 436-443  (8)  Fecha pago AAAAMMDD
        r.append(fecha.format(FECHA_AAAAMMDD));

        // 444-458  (15) Importe (centavos, 15 chars)
        r.append(formatearImporte(pago.getMonto()));

        // 459-460  (2)  Forma de pago (52 = otros bancos, SNP)
        r.append("52");

        // 461-463  (3)  Reservado (espacios)
        r.append(blancos(3));

        // 464-474  (11) Reservado (ceros)
        r.append("00000000000");

        // 475-477  (3)  Reservado (espacios)
        r.append(blancos(3));

        // 478-488  (11) Reservado (ceros)
        r.append("00000000000");

        // 489-491  (3)  Reservado (espacios)
        r.append(blancos(3));

        // 492-502  (11) Reservado (ceros)
        r.append("00000000000");

        // 503-505  (3)  Reservado (espacios)
        r.append(blancos(3));

        // 506-530  (25) Reservado (ceros)
        r.append(ceros(25));

        // 531      (1)  Reservado (espacio)
        r.append(" ");

        // 532-548  (17) Reservado (ceros)
        r.append(ceros(17));

        // 549-650  (102) Reservado (espacios)
        r.append(blancos(102));

        verificarLargo(r, "Detalle");
        return r.toString();
    }

    // ==============================================================
    // TRAILER
    // ==============================================================
    private String buildTrailer(BigInteger totalCentavos, int cantidadDetalles) {
        StringBuilder r = new StringBuilder(LARGO_REGISTRO);

        // 001      (1)  Tipo registro
        r.append("T");

        // 002-016  (15) Reservado (ceros)
        r.append(ceros(15));

        // 017-031  (15) Importe total (centavos)
        r.append(String.format("%015d", totalCentavos));

        // 032-038  (7)  Cantidad registros detalle
        r.append(String.format("%07d", cantidadDetalles));

        // 039-650  (612) Reservado (espacios)
        r.append(blancos(612));

        verificarLargo(r, "Trailer");
        return r.toString();
    }

    // ==============================================================
    // Helpers
    // ==============================================================

    private BigInteger aCentavos(BigDecimal monto) {
        if (monto == null) return BigInteger.ZERO;
        return monto.setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .abs()
                .toBigInteger();
    }

    /** Importe en centavos como 15 chars con padding ceros. Ej: $1500.00 → "000000000150000". */
    private String formatearImporte(BigDecimal monto) {
        return String.format("%015d", aCentavos(monto));
    }

    private void verificarLargo(StringBuilder r, String tipo) {
        if (r.length() != LARGO_REGISTRO) {
            throw new IllegalStateException(
                    "Registro Santander " + tipo + " con largo inválido: "
                            + r.length() + " (esperado " + LARGO_REGISTRO + ")");
        }
    }

    private String padDerecha(String s, int len) {
        String base = s == null ? "" : s;
        if (base.length() > len) base = base.substring(0, len);
        return String.format("%-" + len + "s", base);
    }

    private String padLeftZeros(String s, int len) {
        String base = s == null ? "" : s;
        if (base.length() > len) return base.substring(base.length() - len);
        StringBuilder sb = new StringBuilder(len);
        while (sb.length() + base.length() < len) sb.append('0');
        sb.append(base);
        return sb.toString();
    }

    private String blancos(int len) {
        return " ".repeat(len);
    }

    private String ceros(int len) {
        return "0".repeat(len);
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
        return Banco.SANTANDER;
    }
}
