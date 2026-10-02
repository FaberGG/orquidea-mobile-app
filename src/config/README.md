# src/config/ — Configuración y entorno

**Responsabilidad:** leer las variables de entorno **una sola vez**, validarlas y exponerlas tipadas. Ningún otro
archivo lee `process.env` directamente.

## Contenido previsto

| Archivo | Contenido |
|---|---|
| `env.ts` | Lee `process.env.EXPO_PUBLIC_API_URL` y `process.env.EXPO_PUBLIC_APP_ENV`, valida (Zod) y exporta `env` |
| `app-config.ts` | Configuración no secreta derivada (timeouts, tamaño máximo de imagen, etc.) |
| `index.ts` | API pública |

## Reglas

- Expo solo inlinea las variables si se accede con **notación de punto** (`process.env.EXPO_PUBLIC_API_URL`),
  no con corchetes ni desestructuración.
- Las variables `EXPO_PUBLIC_*` quedan visibles en el binario: **nunca** secretos.
- Si falta una variable obligatoria, la app falla al iniciar en desarrollo con un mensaje claro.
- Toda variable nueva se agrega también a `.env.example` con un comentario.
- Para builds en EAS, las variables se definen por entorno con `eas env` (no en archivos versionados).
