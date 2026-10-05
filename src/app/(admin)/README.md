# src/app/(admin)/ — Gestión de contenido

**Acceso:** administrador y superadministrador. La raíz (`src/app/_layout.tsx`) la protege con
`Stack.Protected guard={usePermission('species:create')}`; el visitante y el usuario registrado no la ven
ni pueden abrirla por enlace.

**Responsabilidad:** formularios de creación y edición. Las pantallas viven en las features; aquí solo
se declaran las rutas.

| Archivo | URL | Pantalla | HU | Estado |
|---|---|---|---|---|
| `_layout.tsx` | — | Stack sin encabezado (las pantallas dibujan el suyo) | — | ✅ |
| [`species/new.tsx`](species/README.md) | `/species/new` | `SpeciesCreateScreen` | HU-7 | ✅ |
| [`species/[id]/edit.tsx`](species/README.md) | `/species/:id/edit` | `SpeciesEditScreen` | HU-8 | ✅ |
| [`admins/`](admins/README.md) | `/admins` | Gestión de administradores (solo superadmin) | HU-4, HU-5 | Pendiente |
