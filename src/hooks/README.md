# src/hooks/ — Hooks transversales

**Responsabilidad:** hooks reutilizables que **no pertenecen a ningún dominio**.

| Hook | Estado | Uso |
|---|---|---|
| `useColorScheme` (`use-color-scheme.ts` / `.web.ts`) | Existente | Esquema claro/oscuro del sistema |
| `useTheme` (`use-theme.ts`) | Existente | Colores del tema actual |
| `useAppFonts` (`use-app-fonts.ts`) | Existente | Carga Nunito (ADR-0009); `true` cuando la app puede pintarse |
| `useNetworkStatus` (`use-network-status.ts`) | HU11 | Estado de conectividad online/offline/desconocido y refresco puntual |
| `useDebounce` | Según necesidad | Búsquedas y filtros |

## Reglas

- Si un hook usa la API, la sesión o conceptos del dominio, pertenece a `features/<feature>/hooks/`.
- Nombre del archivo `use-<algo>.ts`; exporta `useAlgo`.
- `useNetworkStatus` no conecta el estado global de red de TanStack Query: cada flujo decide si debe
  intentar su petición, y un estado desconocido no se trata como desconexión.
