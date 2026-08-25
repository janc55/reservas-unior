# Especificaciones por módulos

Estas especificaciones descomponen el SDD en unidades implementables. Todas deben respetar [constitution.md](../constitution.md).

## Módulos

| Documento | Módulo | Dependencias |
| --- | --- | --- |
| [01-authentication.md](01-authentication.md) | Autenticación y perfiles | Firebase Authentication, `users` |
| [02-public-availability.md](02-public-availability.md) | Disponibilidad pública | `reservations`, índices |
| [03-reservations.md](03-reservations.md) | Solicitudes y cancelaciones | Autenticación, disponibilidad, equipamiento |
| [04-administration.md](04-administration.md) | Aprobación y administración | Roles, reservas, equipamiento |
| [05-equipment.md](05-equipment.md) | Gestión de equipamiento | Rol administrador |
| [06-notifications-reports.md](06-notifications-reports.md) | Correos, recordatorios y reportes | Cloud Functions, SMTP, Storage |
| [07-security-and-qa.md](07-security-and-qa.md) | Seguridad y pruebas | Todos los módulos |

## Contratos transversales

- Zona horaria: `America/La_Paz`.
- Fecha: `YYYY-MM-DD`.
- Hora: `HH:MM` en formato de 24 horas.
- Estados de reserva: `pending`, `approved`, `rejected`, `cancelled`.
- Gestor de paquetes: `pnpm`.
- Disponibilidad pública: únicamente reservas `approved`.
