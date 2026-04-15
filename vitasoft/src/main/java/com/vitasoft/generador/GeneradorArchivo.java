package com.vitasoft.generador;

import com.vitasoft.model.Banco;
import com.vitasoft.model.Lote;

public interface GeneradorArchivo {
    String generarTXT(Lote lote);
    Banco getBanco();
}
