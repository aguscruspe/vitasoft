package com.vitasoft.service.generador;

import com.vitasoft.entity.Lote;

/**
 * Strategy interface para generación de archivos TXT
 * con formato específico por banco.
 */
public interface GeneradorArchivo {

    /**
     * Genera el contenido del archivo TXT según el formato del banco.
     *
     * @param lote Lote con sus pagos cargados
     * @return Contenido completo del archivo TXT
     */
    String generarTXT(Lote lote);
}
