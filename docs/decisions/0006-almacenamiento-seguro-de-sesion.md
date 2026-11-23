# 0006 — Sesión en expo-secure-store

**Estado:** Propuesto

## Contexto

HU-1 y HU-3 requieren mantener y cerrar la sesión. La API entrega un único JWT (sin token de renovación) que es un dato sensible.

## Decisión

Guardar el token con `expo-secure-store` (Keychain en iOS, Keystore en Android), encapsulado en
`src/lib/storage/`. En web se usa `localStorage` como fallback (web no es plataforma prioritaria).
El estado de sesión se expone mediante un Context (`features/auth` + `providers/`), siguiendo el
patrón de autenticación de Expo Router (SDK 53+).

## Consecuencias

- (+) Tokens cifrados por el sistema operativo.
- (−) SecureStore tiene un límite de tamaño por valor: guardar solo el token y su vencimiento, no el perfil completo.
- Actualización (HU-21, sesión sin conexión): además del token se guarda, en otra clave (`orquidea.session-user`),
  el último usuario confirmado por la API con solo los campos de `User` (id, nombre, apellido, correo y rol; unos
  cientos de bytes). Permite abrir la app sin conexión con la sesión iniciada mientras el token siga vigente; se
  borra al cerrar sesión, con un `401` o al vencer el token. Ver `src/features/auth/utils/README.md`.

## Alternativas consideradas

- AsyncStorage: no está cifrado. Descartado para credenciales.
