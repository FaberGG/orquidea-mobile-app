# Arquitectura

## 1. Principios

1. **Organización por funcionalidad (feature-based).** El código de un dominio (auth, fichas,
   administradores…) vive junto en `src/features/<feature>/`. Lo que es realmente compartido sube a
   `components/`, `lib/`, `hooks/`, `utils/`.
2. **Rutas delgadas.** `src/app/` solo declara rutas y layouts (Expo Router). Cada archivo de ruta
   importa y renderiza una pantalla de una feature; no contiene lógica, llamadas a la API ni estilos complejos.
3. **Una sola base de UI para todos los roles.** Visitante, usuario, administrador y superadministrador
   comparten pantallas. Lo que cambia según el rol se resuelve con **permisos**, no con pantallas
   duplicadas. Ver [ROLES-Y-PERMISOS.md](ROLES-Y-PERMISOS.md).
4. **La API es la fuente de verdad.** La app oculta/inhabilita acciones según permisos para dar una buena
   experiencia, pero **nunca** asume que eso es seguridad: el backend valida cada petición.
5. **Estado de servidor ≠ estado de cliente.** Los datos de la API se gestionan con una librería de
   *server state* (caché, reintentos, invalidación). El estado de UI local se queda en el componente.
6. **Dependencias en una sola dirección** (ver §3).

## 2. Capas y directorios

```
src/
├── app/            Capa de RUTAS        Expo Router: layouts, guards, pantallas delgadas
├── features/       Capa de DOMINIO      auth · admins · species · (map, content, sightings… en sprints futuros)
│   └── <feature>/
│       ├── api/          llamadas HTTP del dominio + mapeo DTO ⇄ modelo
│       ├── components/   componentes y pantallas propias del dominio
│       ├── hooks/        hooks de datos (queries/mutations) y de lógica de pantalla
│       ├── schemas/      validaciones de formularios y de respuestas
│       ├── types/        modelos de dominio
│       ├── constants.ts  mensajes de los criterios de aceptación, claves de caché, etc.
│       └── index.ts      API pública de la feature (lo único importable desde fuera)
├── permissions/    Roles, matriz de permisos, <Can/>, usePermission
├── providers/      Composición de providers (sesión, caché de servidor, tema)
├── components/     UI compartida y agnóstica del dominio (ui/, layout/, feedback/)
├── lib/            Infraestructura: api/ (cliente HTTP), storage/ (almacenamiento seguro), query/
├── hooks/          Hooks transversales (tema, conectividad, etc.)
├── config/         Lectura/validación de variables de entorno
├── constants/      Tokens de diseño (tema) y constantes globales
├── types/          Tipos globales (respuestas genéricas de la API, utilidades de tipos)
└── utils/          Funciones puras (formato, fechas, strings)
```

## 3. Reglas de dependencia

Una capa solo puede importar de las capas **debajo** de ella:

```
app  ──►  features  ──►  permissions · components · hooks  ──►  lib · config · constants · types · utils
```

| Desde \ Hacia | app | features | permissions | components | hooks | lib | config/constants/types/utils |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **app** | ✔ | ✔ (solo `index.ts`) | ✔ | ✔ | ✔ | ✖ | ✔ |
| **features** | ✖ | ✔ otra feature solo vía su `index.ts` | ✔ | ✔ | ✔ | ✔ | ✔ |
| **permissions** | ✖ | ✖* | — | ✖ | ✔ | ✖ | ✔ |
| **components** | ✖ | ✖ | ✖ | ✔ | ✔ | ✖ | ✔ |
| **lib** | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |

\* `permissions` recibe el rol actual a través de un hook de sesión inyectado por `providers/`;
no importa internals de `features/auth`. Ver [ROLES-Y-PERMISOS.md](ROLES-Y-PERMISOS.md#5-implementación-prevista).

Reglas clave:

- `components/` **no conoce el dominio**: no importa features ni permisos. Si un componente necesita
  saber de fichas o roles, pertenece a una feature.
- Las features **no importan archivos internos** de otras features (`@/features/auth/hooks/…` ✖),
  solo su barrel (`@/features/auth` ✔). Si dos features comparten mucho, se extrae a una capa inferior.
- `lib/` no conoce la app: podría copiarse a otro proyecto.

## 4. Flujo de datos

```
Pantalla (features/x/components/XScreen.tsx)
   │  usa
   ▼
Hook de datos (features/x/hooks/use-x.ts)  ── query / mutation con caché
   │  llama
   ▼
Función de API (features/x/api/x.api.ts)  ── construye la petición, mapea DTO → modelo
   │  usa
   ▼
Cliente HTTP (lib/api)  ── baseURL, token Bearer, timeout, normalización de errores, refresh
   │
   ▼
API REST
```

- Los componentes **nunca** llaman `fetch` ni al cliente HTTP directamente.
- Los DTO (forma del JSON de la API) se mapean a modelos de dominio en `api/`; el resto de la app solo
  ve modelos. Así un cambio de contrato del backend se corrige en un solo lugar.
- Los errores HTTP se normalizan en `lib/api` a un tipo `ApiError` (status, código, mensaje). Cada
  feature traduce los códigos conocidos a los mensajes exactos de los criterios de aceptación.

## 5. Integración con la API

- URL base desde `EXPO_PUBLIC_API_URL` (leída y validada en `src/config/`).
- Autenticación por token (se espera JWT de acceso + refresh, a confirmar con el equipo backend).
  - Tokens en **`expo-secure-store`** (Keychain/Keystore). En web, fallback a `localStorage`
    (la versión web no es objetivo principal).
  - El cliente adjunta `Authorization: Bearer <token>`; ante `401` intenta refresh una vez y, si falla,
    cierra la sesión.
- El **rol** del usuario lo entrega la API (en el login o en `GET /me`); la app no lo infiere.
- El contrato de endpoints se documentará en `docs/architecture/API.md` cuando el backend lo publique
  (idealmente generando tipos desde OpenAPI).

## 6. Estado

| Tipo | Dónde | Herramienta |
|---|---|---|
| Datos de la API (fichas, admins…) | Caché de servidor | TanStack Query (ver ADR-0003) |
| Sesión (usuario, rol, tokens) | `features/auth` + `providers/` | React Context + SecureStore |
| Estado de formulario | Componente | React Hook Form + Zod (ver ADR-0004) |
| Estado de UI efímero | Componente | `useState` |

No se introduce un store global (Redux/Zustand) salvo necesidad demostrada y ADR.

## 7. Preparado para lo que viene

La estructura anticipa las épicas futuras sin implementarlas:

- **HE-04 (QR)** → `features/qr/` + ruta que resuelve un código a `species/[id]`.
- **HE-05 (mapa)** → `features/map/`.
- **HE-06 (contenido)** → `features/content/`.
- **HE-07 (avistamientos)** → `features/sightings/`.
- **HE-08 (offline)** → persistencia de la caché de servidor y cola de sincronización en `lib/`; por eso
  todo acceso a datos debe pasar por hooks de query desde el Sprint 1.
