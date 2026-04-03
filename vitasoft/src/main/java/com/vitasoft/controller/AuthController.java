package com.vitasoft.controller;

import com.vitasoft.dto.JwtResponse;
import com.vitasoft.dto.LoginRequest;
import com.vitasoft.dto.RegisterRequest;
import com.vitasoft.entity.Usuario;
import com.vitasoft.entity.enums.Rol;
import com.vitasoft.repository.UsuarioRepository;
import com.vitasoft.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * POST /api/auth/login
     * Recibe email y contraseña, devuelve JWT con email y rol.
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        // El rol viene como "ROLE_ADMINISTRADOR" → extraemos solo el nombre
        String rol = userDetails.getAuthorities().iterator().next()
                .getAuthority().replace("ROLE_", "");

        String token = jwtUtil.generateToken(userDetails.getUsername(), rol);

        return ResponseEntity.ok(
                JwtResponse.builder()
                        .token(token)
                        .email(userDetails.getUsername())
                        .rol(rol)
                        .build()
        );
    }

    /**
     * POST /api/auth/register
     * Solo un ADMINISTRADOR autenticado puede crear nuevos usuarios.
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El email ya está registrado"));
        }

        // Si no se especifica rol, default OPERADOR
        Rol rol = Rol.OPERADOR;
        if (request.getRol() != null) {
            try {
                rol = Rol.valueOf(request.getRol().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Rol inválido. Valores permitidos: ADMINISTRADOR, OPERADOR"));
            }
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .contrasena(passwordEncoder.encode(request.getPassword()))
                .rol(rol)
                .enabled(true)
                .build();

        usuarioRepository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Usuario registrado exitosamente",
                        "email", usuario.getEmail(),
                        "rol", usuario.getRol().name()
                ));
    }
}
