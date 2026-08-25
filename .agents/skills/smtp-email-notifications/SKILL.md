---
name: smtp-email-notifications
description: Envío de correos electrónicos transaccionales mediante Nodemailer y SMTP.
---

# Skill: SMTP Email Notifications

## Plantillas y Notificaciones
- Confirmación de solicitud creada (`pending`).
- Notificación de aprobación (`approved`) o rechazo (`rejected`).
- Recordatorio de 15 minutos.
- Reporte diario en PDF.
- Idempotencia: Verificar flags `notificationSent.*` para no duplicar envíos.
