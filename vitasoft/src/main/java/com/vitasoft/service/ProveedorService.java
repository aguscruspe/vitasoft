package com.vitasoft.service;

import com.vitasoft.dto.ProveedorRequest;
import com.vitasoft.model.Proveedor;
import com.vitasoft.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public List<Proveedor> listar() {
        return proveedorRepository.findAll();
    }

    public Proveedor obtener(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado: " + id));
    }

    public Proveedor crear(ProveedorRequest request) {
        Proveedor p = Proveedor.builder()
                .nombre(request.getNombre())
                .cbu(request.getCbu())
                .cuit(request.getCuit())
                .build();
        return proveedorRepository.save(p);
    }

    public Proveedor actualizar(Long id, ProveedorRequest request) {
        Proveedor p = obtener(id);
        p.setNombre(request.getNombre());
        p.setCbu(request.getCbu());
        p.setCuit(request.getCuit());
        return proveedorRepository.save(p);
    }

    public Proveedor buscarOCrear(String nombre, String cbu, String cuit) {
        return proveedorRepository.findByCuit(cuit)
                .orElseGet(() -> proveedorRepository.save(
                        Proveedor.builder().nombre(nombre).cbu(cbu).cuit(cuit).build()));
    }
}
