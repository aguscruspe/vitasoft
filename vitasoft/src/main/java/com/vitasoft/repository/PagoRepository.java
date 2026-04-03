package com.vitasoft.repository;

import com.vitasoft.entity.Pago;
import com.vitasoft.entity.enums.Banco;
import com.vitasoft.entity.enums.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByLoteId(Long loteId);
    List<Pago> findByEstado(EstadoPago estado);
    List<Pago> findByProveedorId(Long proveedorId);

    @Query("""
        SELECT p FROM Pago p
        JOIN FETCH p.proveedor
        LEFT JOIN p.lote l
        WHERE (:estado IS NULL OR p.estado = :estado)
          AND (:banco IS NULL OR l.banco = :banco)
          AND (:desde IS NULL OR p.fechaPago >= :desde)
          AND (:hasta IS NULL OR p.fechaPago <= :hasta)
        ORDER BY p.fechaPago DESC
    """)
    List<Pago> filtrar(
            @Param("estado") EstadoPago estado,
            @Param("banco") Banco banco,
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta
    );
}
