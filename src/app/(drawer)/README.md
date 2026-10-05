# src/app/(drawer)/ — Menú lateral

**Acceso:** todos los roles, incluido el visitante sin sesión.

**Responsabilidad:** navegador *drawer* que envuelve las pestañas principales. El contenido del menú
(identidad del usuario, destinos secundarios y administración con `<Can>`) vive en
[`@/features/navigation`](../../features/navigation/README.md); esta carpeta solo declara la ruta.

| Archivo | Contenido |
|---|---|
| `_layout.tsx` | `AppDrawerLayout` (`expo-router/drawer`, incluido en el SDK 57) |
| [`(tabs)/`](%28tabs%29/README.md) | Barra inferior: Inicio, Comunidad, Mapas, Usuario |

El menú se abre con el botón de menú del encabezado de cada pestaña o deslizando desde el borde izquierdo.
