# Especificación 01: Autenticación y perfiles

## Objetivo

Permitir que solicitantes y administradores accedan al sistema con Firebase Authentication y que cada cuenta tenga un perfil en `users`.

## Requisitos

- Registro con nombre, correo, contraseña, departamento y teléfono.
- Inicio y cierre de sesión.
- Restauración de contraseña mediante Firebase Authentication.
- Protección de rutas de solicitante y administrador.
- Creación automática del documento `users/{uid}` con rol `user`.
- El rol `admin` solo podrá asignarse mediante una operación administrativa controlada.

## Criterios de aceptación

- Un usuario registrado puede iniciar sesión y ver sus funciones de solicitante.
- Un correo o contraseña inválidos muestran un error comprensible.
- Un usuario no autenticado no puede acceder a rutas privadas.
- Un usuario `user` no puede acceder a rutas administrativas.
- Cerrar sesión elimina el acceso a las rutas privadas.
- El perfil no puede cambiar su propio rol.

## Datos y errores

Los formularios deben validar correo, contraseña, nombre y campos obligatorios antes de llamar a Firebase. Los errores de Firebase se traducirán a mensajes en español sin mostrar detalles internos.
