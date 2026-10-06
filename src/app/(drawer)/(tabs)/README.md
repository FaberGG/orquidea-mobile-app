# src/app/(drawer)/(tabs)/ — Barra inferior

**Acceso:** todos los roles, incluido el visitante sin sesión.

**Responsabilidad:** pestañas inferiores que son la base común de la app. Son las mismas para todos los
roles; lo que cambia según el rol se resuelve dentro de cada pantalla con permisos (`<Can>`), no
creando pestañas distintas. Diseño: Figma, HE-3 → "Listar fichas" (`bottom-nav`).

| Archivo | URL | Pestaña | Pantalla | HU |
|---|---|---|---|---|
| `_layout.tsx` | — | — | `AppTabsLayout` de `@/features/navigation` (`TabBar` y `AppHeader` propios) | — |
| `index.tsx` ✅ | `/` | Inicio | `SpeciesListScreen` de `@/features/species`: chips de categoría y listado | HU-10 |
| `community.tsx` ✅ | `/community` | Comunidad | `CommunityScreen` de `@/features/sightings` (por ahora estado vacío) | HU-18, HU-19, HU-20 |
| `map.tsx` ✅ | `/map` | Mapas | `MapScreen` de `@/features/map` (por ahora estado vacío) | HU-12, HU-13 |
| `account.tsx` ✅ | `/account` | Usuario | `AccountScreen` de `@/features/auth`: visitante → iniciar sesión o registrarse; con sesión → datos, rol y **CERRAR SESIÓN** | HU-3 |
| [`admins/`](admins/README.md) | `/admins` y `/admins/new` | Oculta | Gestión de administradores desde el menú lateral, solo para superadministrador | HU-4, HU-5 |

Para administradores, Inicio mostrará **Crear ficha** dentro de `<Can permission="species:create">`, que
navega a `/species/new` (grupo `(admin)`). La categoría seleccionada puede reflejarse como parámetro de
búsqueda (`/?category=birds`) para permitir enlaces directos.
