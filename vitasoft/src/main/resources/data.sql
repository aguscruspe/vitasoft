-- Sincroniza el hash del usuario admin (BCrypt de 'admin123')
UPDATE usuarios
SET contrasena = '$2a$10$7dXTeHiMD/OWxwAcCVhm..cMbYtjBr.cXKsr1ZbogCQjgXld5zG9C',
    rol = 'ADMINISTRADOR'
WHERE email = 'admin@vitasoft.com';
