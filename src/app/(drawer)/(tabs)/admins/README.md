# Rutas de gestión de administradores (HE-2)

Estas rutas viven dentro del layout compartido: conservan menú lateral y barra inferior con Inicio, Comunidad,
Mapas y Usuario. `admins` es una ruta oculta de la barra inferior; el acceso está en el menú lateral y requiere
`admins:read`. El layout redirige a Inicio si falta ese permiso.
Espera a que se restaure la sesión antes de decidir, para no perder enlaces directos por una redirección prematura.

- `index.tsx` (`/admins`): listado real y búsqueda local por nombre o correo.
- `new.tsx` (`/admins/new`): formulario de HU-4 para registrar una cuenta de administrador.
- `[id].tsx` (`/admins/:id`): edición, habilitación e inhabilitación y revocación con confirmación.
- `_layout.tsx`: encabezado compartido con menú a la izquierda y acción contextual a la derecha.
