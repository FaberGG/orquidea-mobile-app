# Rutas de gestión de administradores (HE-2)

Estas rutas viven en la pila raíz, fuera de las pestañas (como `stations/`): el acceso está en el menú lateral y
requiere `admins:read` (`Stack.Protected` en el layout raíz y redirección en este layout si falta el permiso).
Espera a que se restaure la sesión antes de decidir, para no perder enlaces directos por una redirección prematura.

- `index.tsx` (`/admins`): listado real y búsqueda local por nombre o correo.
- `new.tsx` (`/admins/new`): formulario de HU-4 para registrar una cuenta de administrador.
- `[id].tsx` (`/admins/:id`): edición, habilitación e inhabilitación y revocación con confirmación.
- `_layout.tsx`: encabezado compartido con botón de volver a la izquierda y acción contextual a la derecha.
