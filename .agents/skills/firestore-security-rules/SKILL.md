---
name: firestore-security-rules
description: Reglas de seguridad para Firestore limitando accesos por autenticación y rol.
---

# Skill: Firestore Security Rules

## Reglas Clave
- `users`: Lectura por propio usuario o admin. Creación propia solo con role `user`. Update sin cambiar rol.
- `reservations`: Lectura por autenticado. Creación por autenticado con status `pending`. Update por admin o por propietario si sigue `pending`.
- `equipment`: Lectura pública, escritura solo admin.
- `dailyReports`: Solo admin.
