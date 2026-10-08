# Roles y permisos

## 1. Roles

| Rol | Código | Cómo se obtiene | Hereda de |
|---|---|---|---|
| Visitante | `visitor` | Sin sesión iniciada (rol implícito) | — |
| Usuario registrado | `user` | Registro (HU-2) | `visitor` |
| Administrador | `admin` | Creado por un superadministrador (HU-4) | `user` |
| Superadministrador | `superadmin` | Asignado por el equipo de desarrollo | `admin` (HU-6) |

El rol lo entrega la API en `rol` y se traduce en `features/auth/api`: `USUARIO_REGISTRADO` → `user`,
`ADMINISTRADOR` → `admin`, `SUPERADMINISTRADOR` → `superadmin`. Sin sesión, el rol es `visitor`.

Los roles son **jerárquicos**: cada rol tiene todos los permisos del anterior más los suyos.

## 2. Principio: misma interfaz, distintas capacidades

Todos los roles usan **las mismas pantallas**. Ejemplo con el detalle de una ficha taxonómica:

| Elemento | Visitante | Usuario | Admin | Superadmin |
|---|:-:|:-:|:-:|:-:|
| Ver ficha | ✔ | ✔ | ✔ | ✔ |
| Botón *Editar* (HU-8) | — | — | ✔ | ✔ |
| Botón *Eliminar* (HU-9) | — | — | ✔ | ✔ |

No existe una "pantalla de ficha para admin". Existe **una** pantalla que pregunta
*"¿el usuario actual puede `species:update`?"* para decidir si muestra el botón.

Solo se crean **rutas exclusivas** cuando la pantalla completa no tiene sentido para otros roles
(formularios de creación/edición, gestión de administradores). Esas rutas se protegen en el
layout (ver [NAVEGACION.md](NAVEGACION.md)).

## 3. Permisos, no roles, en la UI

```tsx
// ✖ Prohibido: acopla la UI al rol y rompe cuando aparezca un rol nuevo
{user.role === 'admin' && <EditButton />}

// ✔ Correcto: la UI pregunta por una capacidad
<Can permission="species:update">
  <EditButton />
</Can>
```

Los permisos se nombran `recurso:acción` en inglés.

## 4. Matriz de permisos (Sprint 1)

| Permiso | Descripción | HU | visitor | user | admin | superadmin |
|---|---|---|:-:|:-:|:-:|:-:|
| `auth:login` | Ver/usar inicio de sesión y registro | HU-1, HU-1.1, HU-2 | ✔ | — | — | — |
| `auth:logout` | Cerrar sesión | HU-3 | — | ✔ | ✔ | ✔ |
| `species:read` | Consultar listado y detalle de fichas | HU-10 | ✔ | ✔ | ✔ | ✔ |
| `species:create` | Crear ficha | HU-7 | — | — | ✔ | ✔ |
| `species:update` | Editar ficha | HU-8 | — | — | ✔ | ✔ |
| `species:delete` | Eliminar ficha | HU-9 | — | — | ✔ | ✔ |
| `admins:read` | Ver listado de administradores | HU-5 | — | — | — | ✔ |
| `admins:create` | Crear administrador | HU-4 | — | — | — | ✔ |
| `admins:update` | Editar / revocar administrador | HU-5 | — | — | — | ✔ |
| `announcements:publish` | Publicar anuncios e información educativa | HU-16 | — | — | ✔ | ✔ |

Permisos previstos para sprints futuros (no implementar aún): `sightings:create` (user+),
`sightings:review` (admin+), `map:manage`, `content:manage` (admin+).

> Al agregar un permiso: actualizar esta tabla **y** la matriz en `src/permissions/` en el mismo PR.

## 5. Implementación prevista

Ubicación: [`src/permissions/`](../../src/permissions/README.md).

| Pieza | Responsabilidad |
|---|---|
| `roles.ts` | Tipo `Role` y jerarquía |
| `permissions.ts` | Tipo `Permission` (unión de literales) y matriz `rol → permisos` |
| `can(role, permission)` | Función pura; fácil de probar unitariamente |
| `usePermission(permission)` | Hook: lee el rol de la sesión actual y devuelve `boolean` |
| `<Can permission fallback?>` | Componente que renderiza `children` solo si se tiene el permiso |

El rol actual llega desde la sesión (`features/auth`) a través del provider de sesión; `permissions/`
expone una interfaz mínima (`useCurrentRole`) para no acoplarse a los internos de auth.

## 6. Reglas

1. **Ocultar, no deshabilitar**, acciones no permitidas, salvo que el diseño indique lo contrario.
2. Las rutas exclusivas se protegen con `Stack.Protected` en su layout **además** de ocultar el acceso.
3. La validación real ocurre en el backend. Si la API responde `403`, la app muestra un mensaje genérico
   de "no tienes permisos" y refresca la sesión (el rol pudo cambiar, p. ej. HU-5 revocación).
4. Las reglas de negocio con datos del servidor (límite de 3 administradores, no revocar al único
   superadmin) **las decide la API**; la app solo muestra el mensaje correspondiente.
5. Toda lógica de permisos tiene pruebas unitarias de la matriz.
