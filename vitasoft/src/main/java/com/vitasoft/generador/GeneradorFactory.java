package com.vitasoft.generador;

import com.vitasoft.model.Banco;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Factory que, dado un banco, devuelve el generador TXT apropiado.
 * Spring inyecta automáticamente todas las implementaciones de GeneradorArchivo.
 */
@Component
public class GeneradorFactory {

    private final Map<Banco, GeneradorArchivo> generadores = new EnumMap<>(Banco.class);

    public GeneradorFactory(List<GeneradorArchivo> lista) {
        for (GeneradorArchivo g : lista) {
            generadores.put(g.getBanco(), g);
        }
    }

    public GeneradorArchivo get(Banco banco) {
        GeneradorArchivo gen = generadores.get(banco);
        if (gen == null) {
            throw new IllegalArgumentException("No hay generador para el banco: " + banco);
        }
        return gen;
    }
}
