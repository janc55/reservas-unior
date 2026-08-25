# Especificación 05: Gestión de equipamiento

## Objetivo

Administrar el catálogo y las cantidades disponibles de los recursos del auditorio.

## Requisitos

- Listar equipamiento activo para solicitantes y visitantes.
- Permitir al administrador crear, editar, activar, desactivar y eliminar equipamiento cuando no tenga reservas dependientes.
- Mantener `name`, `icon`, `available`, `quantity` y `description`.
- Validar que `quantity` sea un entero mayor o igual que cero.
- Comprobar cantidades nuevamente al aprobar una reserva.

## Criterios de aceptación

- Un usuario normal no puede modificar el catálogo.
- Un recurso con `available: false` no puede seleccionarse en una nueva solicitud.
- Una solicitud no puede superar la cantidad disponible.
- Cambiar la cantidad no modifica reservas históricas.
