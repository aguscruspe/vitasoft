package com.vitasoft.repository;

import com.vitasoft.model.EstadoPago;
import com.vitasoft.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    @Query("SELECT p FROM Pago p LEFT JOIN p.lote l WHERE " +
            "(:estado IS NULL OR p.estado = :estado) AND " +
            "(:desde IS NULL OR p.fechaPago >= :desde) AND " +
            "(:hasta IS NULL OR p.fechaPago <= :hasta) AND " +
            "(:banco IS NULL OR l.banco = :banco)")
    List<Pago> buscarConFiltros(
            @Param("estado") EstadoPago estado,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta,
            @Param("banco") com.vitasoft.model.Banco banco);

    List<Pago> findByEstado(EstadoPago estado);
}
