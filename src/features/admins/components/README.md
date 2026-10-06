# src/features/admins/components/

**Responsabilidad:** pantallas y componentes visuales de la gestión de administradores.

| Componente | Descripción | HU |
|---|---|---|
| `AdminListScreen` | Listado de administradores y botón para crear uno nuevo | HU-5 |
| `CreateAdminScreen` | Formulario + botón **CREAR ADMINISTRADOR** | HU-4 |
| `EditAdminScreen` | Formulario de edición + **GUARDAR CAMBIOS** y **REVOCAR ACCESO** con confirmación | HU-5 |
| `AdminListScreen` | Listado real, búsqueda local y acceso al detalle | HU-5 |

La API impide editar una cuenta superadministradora con `PUT`; su detalle permite revocar con las reglas
del servidor. Al revocarse, el superadministrador conserva la sesión y recibe el rol actualizado. Mientras
se guarda o revoca una cuenta, las acciones incompatibles quedan bloqueadas. El mismo layout compartido se
conserva en todas estas pantallas.
