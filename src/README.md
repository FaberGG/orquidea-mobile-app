# src/

Todo el código fuente de la app. El alias `@/` apunta a esta carpeta (`@/features/auth`, `@/lib/api`…).

| Directorio | Capa | Responsabilidad |
|---|---|---|
| [`app/`](app/README.md) | Rutas | Rutas y layouts de Expo Router. Pantallas delgadas y guards por permisos |
| [`features/`](features/README.md) | Dominio | Un módulo por dominio funcional (auth, admins, species, …) |
| [`permissions/`](permissions/README.md) | Dominio transversal | Roles, matriz de permisos, `<Can/>` y `usePermission` |
| [`providers/`](providers/README.md) | Composición | Árbol de providers globales (sesión, caché, tema) |
| [`components/`](components/README.md) | UI compartida | Componentes reutilizables sin conocimiento del dominio |
| [`hooks/`](hooks/README.md) | Compartido | Hooks transversales (tema, color scheme, conectividad) |
| [`lib/`](lib/README.md) | Infraestructura | Cliente HTTP, almacenamiento seguro, query client |
| [`config/`](config/README.md) | Infraestructura | Variables de entorno validadas y configuración de la app |
| [`constants/`](constants/README.md) | Base | Tokens de diseño y constantes globales |
| [`types/`](types/README.md) | Base | Tipos globales compartidos |
| [`utils/`](utils/README.md) | Base | Funciones puras reutilizables |

Las capas solo dependen hacia abajo. Ver
[reglas de dependencia](../docs/architecture/ARQUITECTURA.md#3-reglas-de-dependencia).

> `global.css` es el CSS global para la versión web (usado por `constants/theme.ts`).
