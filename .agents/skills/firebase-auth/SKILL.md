---
name: firebase-auth
description: Autenticación con Firebase Auth, persistencia de sesión y manejo de roles en Firestore.
---

# Skill: Firebase Auth

## Principios
1. Inicio, registro, logout y reseteo de contraseña mediante Firebase Authentication.
2. Sincronización del perfil en `users/{uid}` con rol por defecto `user`.
3. El rol `admin` no se asigna desde el cliente.
4. Escuchar cambios de estado con `onAuthStateChanged`.
