# src/features/auth/schemas/

**Responsabilidad:** esquemas de validación (Zod) de los formularios de acceso. Los mensajes se importan de
`../constants.ts`, nunca se escriben aquí.

| Archivo | Reglas | HU |
|---|---|---|
| `login.schema.ts` | correo y contraseña obligatorios → `Ambos campos son obligatorios.` | HU-1 |
| `forgot-password.schema.ts` | correo obligatorio → `Debes ingresar tu correo electrónico.` | HU-1.1 |
| `reset-password.schema.ts` | correo, código (6 dígitos, `d{6}`) y nueva contraseña obligatorios | HU-1.1 |
| `register.schema.ts` | todos los campos obligatorios; nombre y apellido de mínimo 2 caracteres (contrato); formato de correo válido | HU-2 |

Los tipos de los formularios se infieren del esquema (`z.infer<typeof loginSchema>`). Cada esquema tiene pruebas.
