# src/app/(admin)/ — Rutas de gestión

**Acceso:** administrador y superadministrador. Protegido en el layout raíz con
`<Stack.Protected guard={can('species:create')}>`.

**Responsabilidad:** pantallas que **solo** tienen sentido para roles de gestión (formularios de creación y
edición, administración de cuentas). Las acciones sobre pantallas compartidas (p. ej. botón Eliminar en el
detalle de una ficha) **no** van aquí: se muestran con `<Can>` en la pantalla común.

| Directorio / archivo | Acceso | Contenido |
|---|---|---|
| `_layout.tsx` | admin+ | Stack; anida `Stack.Protected` con `can('admins:read')` para `admins/` |
| [`species/`](species/README.md) | admin+ | Crear y editar fichas (HU-7, HU-8) |
| [`admins/`](admins/README.md) | solo superadmin | Gestión de administradores (HU-4, HU-5) |

El grupo `(admin)` no agrega segmento a la URL. El nombre del grupo indica el tipo de acceso, no un "panel aparte".

> Ocultar estas rutas en la UI no es seguridad: la API valida cada petición (ver
> [ROLES-Y-PERMISOS](../../../docs/architecture/ROLES-Y-PERMISOS.md)).
