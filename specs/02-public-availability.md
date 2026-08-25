# Especificación 02: Disponibilidad pública

## Objetivo

Mostrar de forma pública las fechas y horarios ocupados del auditorio sin exponer datos personales de los solicitantes.

## Requisitos

- Consultar `reservations` filtrando por `status == approved`.
- Permitir seleccionar una fecha.
- Mostrar horarios ocupados y horarios disponibles dentro del horario operativo configurado.
- No mostrar nombre, correo, departamento ni notas de los solicitantes.
- Indicar estados de carga, error y ausencia de reservas.
- Usar la zona horaria `America/La_Paz`.

## Criterios de aceptación

- Una reserva `pending`, `rejected` o `cancelled` no bloquea visualmente el horario.
- Una reserva `approved` sí bloquea el intervalo correspondiente.
- Los intervalos adyacentes, por ejemplo `10:00-11:00` y `11:00-12:00`, no se consideran solapados.
- La consulta usa los índices requeridos por Firestore.
- Un visitante puede consultar disponibilidad sin iniciar sesión.
