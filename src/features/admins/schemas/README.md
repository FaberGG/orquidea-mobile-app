# src/features/admins/schemas/

**Responsabilidad:** validación de los formularios de administrador, alineada con el contrato.

| Archivo | Reglas | HU |
|---|---|---|
| `create-admin.schema.ts` | Nombre y apellido (mínimo 2 caracteres), correo válido y contraseña, todos obligatorios (`RegisterRequest`) | HU-4 |
| `update-admin.schema.ts` | Nombre y apellido (máximo 100), correo válido (máximo 254) y `isEnabled` obligatorios (`AdministratorUpdateRequest`) | HU-5 |

`create-admin.schema.ts` y `register-response.schema.ts` están implementados para HU-4.

Mensajes: `Debes completar todos los campos obligatorios.` e `Ingresa un correo electrónico válido.`
(importados de `../constants.ts`).
