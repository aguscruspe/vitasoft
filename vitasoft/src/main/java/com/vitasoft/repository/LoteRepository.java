package com.vitasoft.repository;

import com.vitasoft.entity.Lote;
import com.vitasoft.entity.enums.Banco;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoteRepository extends JpaRepository<Lote, Long> {
    List<Lote> findByEstado(String estado);
    List<Lote> findByBanco(Banco banco);
}
