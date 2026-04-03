package com.vitasoft.repository;

import com.vitasoft.entity.ArchivoGenerado;
import com.vitasoft.entity.enums.TipoArchivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArchivoGeneradoRepository extends JpaRepository<ArchivoGenerado, Long> {
    List<ArchivoGenerado> findByLoteId(Long loteId);
    List<ArchivoGenerado> findByTipo(TipoArchivo tipo);
}
