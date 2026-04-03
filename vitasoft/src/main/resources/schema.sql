-- ============================================
-- Script SQL - VitaSoft - Pagos Masivos
-- Base de datos: vitasoft_db
-- ============================================

CREATE DATABASE IF NOT EXISTS vitasoft_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE vitasoft_db;

-- ============================================
-- Tabla: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    contrasena  VARCHAR(255)    NOT NULL,
    rol         VARCHAR(30)     NOT NULL DEFAULT 'USER',
    enabled     TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Tabla: proveedores
-- ============================================
CREATE TABLE IF NOT EXISTS proveedores (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150)    NOT NULL,
    cbu         VARCHAR(22)     NOT NULL UNIQUE,
    cuit        VARCHAR(13)     NOT NULL UNIQUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Tabla: lotes
-- ============================================
CREATE TABLE IF NOT EXISTS lotes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    banco           VARCHAR(100)    NOT NULL,
    estado          VARCHAR(30)     NOT NULL DEFAULT 'PENDIENTE',
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Tabla: pagos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id    BIGINT          NOT NULL,
    monto           DECIMAL(15,2)   NOT NULL,
    concepto        VARCHAR(255),
    estado          VARCHAR(30)     NOT NULL DEFAULT 'PENDIENTE',
    fecha_pago      DATE,
    lote_id         BIGINT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_pagos_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_pagos_lote
        FOREIGN KEY (lote_id) REFERENCES lotes(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- Tabla: archivos
-- ============================================
CREATE TABLE IF NOT EXISTS archivos (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo              VARCHAR(30)     NOT NULL,
    ruta              VARCHAR(500)    NOT NULL,
    fecha_generacion  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lote_id           BIGINT,

    CONSTRAINT fk_archivos_lote
        FOREIGN KEY (lote_id) REFERENCES lotes(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- Índices
-- ============================================
CREATE INDEX idx_pagos_estado     ON pagos(estado);
CREATE INDEX idx_pagos_fecha      ON pagos(fecha_pago);
CREATE INDEX idx_lotes_estado     ON lotes(estado);
CREATE INDEX idx_archivos_tipo    ON archivos(tipo);
