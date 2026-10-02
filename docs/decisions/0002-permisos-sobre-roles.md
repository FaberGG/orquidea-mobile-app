# 0002 — Control de UI por permisos derivados del rol

**Estado:** Aceptado

## Contexto

Visitante, usuario, administrador y superadministrador comparten las mismas interfaces; algunas
acciones aparecen solo para ciertos roles. El superadministrador hereda todo lo del administrador (HU-6).

## Decisión

- Roles jerárquicos mapeados a una matriz de permisos `recurso:acción` en `src/permissions/`.
- La UI consulta permisos (`<Can permission="species:update">`, `usePermission`); nunca compara roles.
- Las rutas exclusivas se protegen con `Stack.Protected` usando los mismos permisos.

## Consecuencias

- (+) Agregar o ajustar un rol solo cambia la matriz.
- (+) La matriz es una función pura, fácil de probar.
- (−) Hay que mantener la matriz sincronizada con `docs/architecture/ROLES-Y-PERMISOS.md`.

## Alternativas consideradas

- Pantallas separadas por rol: duplican la UI y divergen con el tiempo.
- `if (role === "admin")` en los componentes: frágil ante nuevos roles o la herencia entre roles.
