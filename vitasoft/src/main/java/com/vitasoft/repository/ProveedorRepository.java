package com.vitasoft.repository;

import com.vitasoft.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    Optional<Proveedor> findByCuit(String cuit);
    Optional<Proveedor> findByCbu(String cbu);
    boolean existsByCuit(String cuit);
    boolean existsByCbu(String cbu);
}
