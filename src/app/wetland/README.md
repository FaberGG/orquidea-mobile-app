# src/app/wetland/ — Componentes del humedal

**Acceso:** todos los roles (consultar es público, HU-14).

**Responsabilidad:** rutas de consulta de los componentes del humedal (aves, flora, insectos…), fuera de
las pestañas para mostrarse a pantalla completa. Se entra desde el menú lateral → Humedal →
Componentes del humedal.

| Archivo | URL | Pantalla | HU | Estado |
|---|---|---|---|---|
| `index.tsx` | `/wetland` | `WetlandComponentsScreen` de `@/features/content` | HU-14 | ✅ |
| `[type].tsx` | `/wetland/:type` (ej. `/wetland/AVES`) | `WetlandComponentDetailScreen` | HU-14 | ✅ |

El botón **EDITAR CONTENIDO** del detalle solo aparece con `content:manage` y lleva a
`/wetland/:type/edit`, declarada en [`(admin)/`](../(admin)/README.md) (HU-15).
