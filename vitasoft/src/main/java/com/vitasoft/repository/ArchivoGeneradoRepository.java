package com.vitasoft.repository;

import com.vitasoft.model.ArchivoGenerado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArchivoGeneradoRepository extends JpaRepository<ArchivoGenerado, Long> {
    List<ArchivoGenerado> findByLoteId(Long loteId);
}
