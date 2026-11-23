# Utilidades de sesión

`session-user-storage.ts` guarda el último usuario confirmado por la API (`id`, nombre, apellido, correo y rol) en el
almacenamiento seguro (`@/lib/storage`, clave `orquidea.session-user`), junto al token (ADR-0006). `SessionProvider`
lo usa para abrir la app **sin conexión** con la sesión iniciada mientras el token siga vigente (HU-21).

- `getSessionUser()` valida lo guardado con zod; un valor inválido se borra y devuelve `null`.
- `saveSessionUser(user)` guarda solo los campos de `User`.
- `clearSessionUser()` lo borra (cierre de sesión, `401`, token vencido).

Es una copia de apoyo: las funciones **no lanzan errores**. Un fallo del almacenamiento nunca impide iniciar o
cerrar sesión ni abrir la app; en el peor caso, la sesión no está disponible sin conexión. La API sigue siendo la
que autoriza: el rol guardado solo decide qué muestra la interfaz hasta que `GET /yo` lo confirma.
