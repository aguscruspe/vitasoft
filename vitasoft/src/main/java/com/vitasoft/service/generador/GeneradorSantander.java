package com.vitasoft.service.generador;

import com.vitasoft.entity.Lote;
import org.springframework.stereotype.Component;

/**
 * Generador TXT para Banco Santander.
 * TODO: formato pendiente — implementar cuando se reciba la especificación del banco.
 */
@Component
public class GeneradorSantander implements GeneradorArchivo {

    @Override
    public String generarTXT(Lote lote) {
        // TODO: formato pendiente — implementar según especificación de Santander
        StringBuilder sb = new StringBuilder();
        sb.append("# Archivo generado para Banco Santander\r\n");
        sb.append("# Formato pendiente de definición\r\n");
        sb.append("# Lote ID: ").append(lote.getId()).append("\r\n");
        sb.append("# Cantidad de pagos: ").append(lote.getPagos().size()).append("\r\n");
        return sb.toString();
    }
}
