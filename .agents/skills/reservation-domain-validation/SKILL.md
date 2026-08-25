---
name: reservation-domain-validation
description: Validaciones del dominio de reservas (fechas, horas, solapamientos, equipamiento).
---

# Skill: Reservation Domain Validation

## Reglas de Solapamiento
Un rango nuevo `[nuevoInicio, nuevoFin]` solapa con una reserva aprobada `[existInicio, existFin]` si:
`nuevoInicio < existFin AND nuevoFin > existInicio`

- Intervalos adyacentes (`10:00-11:00` y `11:00-12:00`) NO solapan.
- Las horas deben ser validas en formato `HH:MM` de 24h.
- `startTime < endTime`.
- Zona horaria de referencia: `America/La_Paz`.
