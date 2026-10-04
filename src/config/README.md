# src/config/ — Configuración y entorno

**Responsabilidad:** leer las variables de entorno **una sola vez**, validarlas y exponerlas tipadas. Ningún otro
archivo lee `process.env` directamente.

## Contenido

| Archivo | Contenido |
|---|---|
| `env.ts` | `getEnv()`: lee `process.env.EXPO_PUBLIC_API_URL` y `process.env.EXPO_PUBLIC_APP_ENV` la primera vez que se llama, valida (Zod) y devuelve `{ apiUrl, appEnv }`. Es perezoso para que las pruebas puedan importar módulos sin variables definidas |
| `app-config.ts` | `APP_CONFIG`: configuración no secreta derivada (timeout de peticiones; luego tamaño máximo de imagen, etc.) |
| `index.ts` | API pública |

## Reglas

- Expo solo inlinea las variables si se accede con **notación de punto** (`process.env.EXPO_PUBLIC_API_URL`),
  no con corchetes ni desestructuración.
- Las variables `EXPO_PUBLIC_*` quedan visibles en el binario: **nunca** secretos.
- Si falta una variable obligatoria, la app falla al iniciar en desarrollo con un mensaje claro.
- Toda variable nueva se agrega también a `.env.example` con un comentario.
- Para builds en EAS, las variables se definen por entorno con `eas env` (no en archivos versionados).
