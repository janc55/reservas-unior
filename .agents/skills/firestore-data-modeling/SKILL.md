---
name: firestore-data-modeling
description: Estructuración de colecciones users, reservations, equipment, dailyReports.
---

# Skill: Firestore Data Modeling

## Colecciones
- `users`: `{ uid, email, displayName, role, department, phone, createdAt, updatedAt }`
- `equipment`: `{ id, name, icon, available, quantity, description }`
- `reservations`: `{ id, userId, userName, userEmail, eventName, eventType, date, startTime, endTime, equipment, attendees, additionalNotes, status, adminNotes, createdAt, updatedAt, approvedAt, rejectedAt, notificationSent }`
- `dailyReports`: `{ id, date, reservations, pdfUrl, sentTo, createdAt }`
