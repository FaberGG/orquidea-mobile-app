# src/features/auth/schemas/

**Responsabilidad:** esquemas de validación (Zod) de los formularios de acceso. Los mensajes se importan de
`../constants.ts`, nunca se escriben aquí.

| Archivo | Reglas | HU |
|---|---|---|
| `login.schema.ts` | correo y contraseña obligatorios → `Ambos campos son obligatorios.` | HU-1 |
| `forgot-password.schema.ts` | correo obligatorio → `Debes ingresar tu correo electrónico.` | HU-1.1 |
| `reset-password.schema.ts` | correo, código (6 dígitos, `d{6}`) y nueva contraseña obligatorios | HU-1.1 |
| `auth-dto.schema.ts` | Validación de `LoginResponse` y `AuthenticatedUserDto` antes de mapearlos | HU-1 |
| `register.schema.ts` | un solo mensaje por envío, en este orden: campos vacíos (CA3) → formato de correo (CA4) → nombre/apellido de 2+ caracteres (contrato) → contraseñas iguales → términos aceptados (diseño) | HU-2 |

Los tipos de los formularios se infieren del esquema (`z.infer<typeof loginSchema>`). Cada esquema tiene pruebas.
