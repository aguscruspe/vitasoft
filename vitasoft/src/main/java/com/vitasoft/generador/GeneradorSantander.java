package com.vitasoft.generador;

import com.vitasoft.model.Banco;
import com.vitasoft.model.Lote;
import org.springframework.stereotype.Component;

/**
 * Generador de archivo TXT para Banco Santander.
 * TODO: Implementar formato según spec bancaria de Santander.
 */
@Component
public class GeneradorSantander implements GeneradorArchivo {

    @Override
    public String generarTXT(Lote lote) {
        // TODO: Implementar formato Santander (placeholder)
        StringBuilder sb = new StringBuilder();
        sb.append("TODO: Formato Santander pendiente de implementación").append(System.lineSeparator());
        sb.append("Lote ID: ").append(lote.getId()).append(System.lineSeparator());
        sb.append("Cantidad de pagos: ").append(lote.getPagos() == null ? 0 : lote.getPagos().size());
        return sb.toString();
    }

    @Override
    public Banco getBanco() {
        return Banco.SANTANDER;
    }
}
