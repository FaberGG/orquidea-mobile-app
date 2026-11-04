# src/app/stations/ — Estaciones del sendero (HU-13)

**Acceso:** todos los roles.

**Responsabilidad:** rutas públicas de las estaciones, fuera de las pestañas (pantalla completa). Mientras el mapa
(HU-12) no exista, se llega desde el menú lateral (**Estaciones del sendero**); luego la entrada principal será
tocar una estación en el mapa.

| Archivo | URL | Pantalla | HU | Estado |
|---|---|---|---|---|
| `index.tsx` | `/stations` | `StationsListScreen` de `@/features/map` | HU-13 | ✅ (contrato inferido) |
| `[id].tsx` | `/stations/:id` | `StationDetailScreen` ("Ver estación") de `@/features/map` | HU-13 | ✅ (contrato inferido) |

Crear (`/stations/new`) y editar (`/stations/:id/edit`) viven en [`(admin)/`](../(admin)/README.md). En la
pantalla, **+**, **Editar estación** y **ELIMINAR** solo aparecen con `stations:manage`.
