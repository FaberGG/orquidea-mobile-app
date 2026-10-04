# src/app/ — Rutas (Expo Router)

**Responsabilidad:** declarar la navegación de la app. Cada archivo `.tsx` aquí es una ruta y cada
`_layout.tsx` define un navegador (Stack, Tabs) y sus guards.

> Este README no es una ruta: Expo Router solo toma archivos `.js/.jsx/.ts/.tsx`.

## Qué va aquí

- `_layout.tsx` raíz: monta `AppProviders` y el `Stack` con `Stack.Protected` según sesión y permisos.
- Archivos de ruta que **solo** renderizan una pantalla de una feature:
  ```tsx
  export { SpeciesListScreen as default } from '@/features/species';
  ```
- Opciones de navegación propias de la ruta (título, `headerShown`) y `ErrorBoundary` cuando aplique.

## Qué NO va aquí

- Lógica de negocio, llamadas a la API, validaciones, estilos complejos o componentes reutilizables.
- Archivos que no sean rutas (helpers, tipos, componentes): Expo Router los trataría como pantallas.

## Estructura prevista (Sprint 1)

| Directorio / archivo | Acceso | Contenido |
|---|---|---|
| `_layout.tsx` | — | Providers + Stack raíz con guards |
| [`(tabs)/`](%28tabs%29/README.md) | Todos | Shell principal con pestañas: inicio, fichas, cuenta |
| [`species/`](species/README.md) | Todos | Detalle de ficha `species/[id].tsx` |
| [`(auth)/`](%28auth%29/README.md) | Sin sesión | Login, registro, recuperar contraseña |
| [`(admin)/`](%28admin%29/README.md) | Admin y superadmin | Formularios de fichas y gestión de administradores |

Mapa completo y reglas de navegación: [`docs/architecture/NAVEGACION.md`](../../docs/architecture/NAVEGACION.md).

> Implementado en HU-1: `_layout.tsx` (providers, splash y guard de `(auth)`), `(tabs)/index.tsx` (inicio) y
> `(auth)/login.tsx`. `(tabs)/explore.tsx` y las pestañas de `components/app-tabs` siguen siendo la demo de la
> plantilla hasta T0.1 / T0.10 del [Sprint 1](../../docs/sprints/sprint-01.md).
