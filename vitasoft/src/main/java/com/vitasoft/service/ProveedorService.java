package com.vitasoft.service;

import com.vitasoft.dto.ProveedorRequest;
import com.vitasoft.entity.Proveedor;
import com.vitasoft.repository.ProveedorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    @Transactional(readOnly = true)
    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    @Transactional
    public Proveedor crear(ProveedorRequest request) {
        Proveedor proveedor = Proveedor.builder()
                .nombre(request.getNombre())
                .cbu(request.getCbu())
                .cuit(request.getCuit())
                .build();
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public Proveedor actualizar(Long id, ProveedorRequest request) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado con id: " + id));

        proveedor.setNombre(request.getNombre());
        proveedor.setCbu(request.getCbu());
        proveedor.setCuit(request.getCuit());
        return proveedorRepository.save(proveedor);
    }
}
