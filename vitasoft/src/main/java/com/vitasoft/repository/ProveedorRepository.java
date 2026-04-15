package com.vitasoft.repository;

import com.vitasoft.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    Optional<Proveedor> findByCuit(String cuit);
    Optional<Proveedor> findByCbu(String cbu);
}
