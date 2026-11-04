# src/features/admins/schemas/

**Responsabilidad:** validación de los formularios de administrador, alineada con el contrato.

| Archivo | Reglas | HU |
|---|---|---|
| `create-admin.schema.ts` | Nombre y apellido (mínimo 2 caracteres), correo válido y contraseña, todos obligatorios (`RegisterRequest`). La contraseña cumple `SECURE_PASSWORD_PATTERN`: mínimo 8 caracteres con mayúscula, minúscula y número (CA4, misma regla que la API) | HU-4 |
| `update-admin.schema.ts` | Nombre y apellido (máximo 100), correo válido (máximo 254) y `isEnabled` obligatorios (`AdministratorUpdateRequest`) | HU-5 |

`admin.schema.ts` valida los administradores recibidos del listado y las respuestas de edición/revocación.

Mensajes: `Debes completar todos los campos obligatorios.`, `Ingresa un correo electrónico válido.` y
`La contraseña debe tener mínimo 8 caracteres e incluir al menos una mayúscula, una minúscula y un número.`
(importados de `../constants.ts`).
