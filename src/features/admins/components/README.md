# src/features/admins/components/

**Responsabilidad:** pantallas y componentes visuales de la gestión de administradores.

| Componente | Descripción | HU |
|---|---|---|
| `AdminListScreen` | Listado de administradores y botón para crear uno nuevo | HU-5 |
| `CreateAdminScreen` | Formulario + botón **CREAR ADMINISTRADOR** | HU-4 |
| `EditAdminScreen` | Formulario de edición + **GUARDAR CAMBIOS** y **REVOCAR ACCESO** con confirmación | HU-5 |
| `AdminListScreen` | Listado real, búsqueda local y acceso al detalle | HU-5 |

La API impide editar una cuenta superadministradora con `PUT`; su detalle permite revocar con las reglas
del servidor. El mismo layout de navegación se conserva en todas estas pantallas.
