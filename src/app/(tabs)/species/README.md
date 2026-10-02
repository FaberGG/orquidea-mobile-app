# src/app/(tabs)/species/ — Pestaña de fichas

**Acceso:** todos los roles.

**Responsabilidad:** ruta de la pestaña de biodiversidad.

| Archivo | URL | Pantalla | HU |
|---|---|---|---|
| `index.tsx` | `/species` | `SpeciesListScreen` de `@/features/species`: selector de categoría (aves, plantas, insectos) y listado con foto y nombre común | HU-10 |

Para administradores, la misma pantalla muestra el botón **Crear ficha** dentro de
`<Can permission="species:create">`, que navega a `/species/new` (grupo `(admin)`).

La categoría seleccionada puede reflejarse como parámetro de búsqueda (`/species?category=birds`) para
permitir enlaces directos.
