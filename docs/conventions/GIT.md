# Convenciones de Git: ramas, commits y Pull Requests

## 1. Ramas

### Ramas permanentes

| Rama | Propósito | Protección |
|---|---|---|
| `main` | Código estable y liberado. Cada merge corresponde a una versión. | Sin push directo. Solo merge desde `release/*` o `hotfix/*`. |
| `develop` | Integración continua del sprint en curso. | Sin push directo. Solo vía PR aprobado. |

### Ramas de trabajo

Se crean desde `develop` (salvo `hotfix/*`, que sale de `main`) y se eliminan después del merge.

**Formato:** `<tipo>/<hu-o-issue>-<descripcion-corta>`

- Todo en minúsculas, palabras separadas con `-`, sin tildes ni `ñ`.
- `<hu-o-issue>`: `hu-7`, `hu-1.1` → `hu-1-1`, o `issue-42` si no hay HU.
- Descripción de 2 a 5 palabras.

| Tipo | Uso | Ejemplo |
|---|---|---|
| `feat/` | Nueva funcionalidad | `feat/hu-1-login` |
| `fix/` | Corrección de error | `fix/hu-10-lista-vacia` |
| `refactor/` | Cambio interno sin alterar comportamiento | `refactor/issue-31-cliente-http` |
| `docs/` | Solo documentación | `docs/issue-5-guia-navegacion` |
| `test/` | Agregar o corregir pruebas | `test/hu-4-permisos-admins` |
| `chore/` | Configuración, dependencias, tooling | `chore/issue-2-eslint-prettier` |
| `release/` | Preparar una versión | `release/sprint-01` |
| `hotfix/` | Corrección urgente sobre `main` | `hotfix/issue-60-crash-login` |

## 2. Commits

Se usa **[Conventional Commits 1.0](https://www.conventionalcommits.org/es/v1.0.0/)**.

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Reglas

- **tipo**: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`, `build`, `ci`, `chore`, `revert`.
- **alcance** (opcional pero recomendado): la feature o capa afectada:
  `auth`, `admins`, `species`, `permissions`, `api`, `storage`, `ui`, `navigation`, `config`, `deps`.
- **descripción**: en español, modo imperativo, minúscula inicial, sin punto final, máx. 72 caracteres.
  - ✔ `feat(auth): agrega formulario de inicio de sesión`
  - ✖ `Agregué el login.`
- **cuerpo**: explica el *porqué* cuando no es obvio. Líneas de máx. 100 caracteres.
- **footer**: referencia a la HU/issue: `Refs: HU-1` o `Closes #12`.
- **Cambios incompatibles**: `!` después del tipo/alcance y footer `BREAKING CHANGE: ...`.
- Un commit = un cambio lógico. No mezclar refactor con funcionalidad.

| Tipo | Cuándo | Ejemplo |
|---|---|---|
| `feat` | Funcionalidad nueva para el usuario | `feat(species): muestra listado de fichas por categoría` |
| `fix` | Corrige un error | `fix(auth): muestra mensaje correcto con credenciales inválidas` |
| `refactor` | Reestructura sin cambiar comportamiento | `refactor(api): centraliza manejo de errores http` |
| `perf` | Mejora de rendimiento | `perf(species): pagina el listado de fichas` |
| `style` | Formato, sin cambio de lógica | `style: aplica prettier` |
| `test` | Pruebas | `test(permissions): cubre matriz de superadmin` |
| `docs` | Documentación | `docs(readme): agrega pasos de instalación` |
| `build` | Dependencias, configuración de build/EAS | `build(deps): agrega expo-secure-store` |
| `ci` | Pipelines de integración continua | `ci: ejecuta lint y typecheck en PRs` |
| `chore` | Mantenimiento sin impacto en el código de la app | `chore: elimina código de la plantilla` |
| `revert` | Revierte un commit | `revert: feat(auth): agrega recordar sesión` |

Ejemplo completo:

```
feat(admins): impide crear administradores sobre el límite configurado

La API responde 409 con el mensaje del criterio de aceptación 2 de HU-4;
se muestra el campo mensaje de la respuesta.

Refs: HU-4
```

## 3. Pull Requests

- Destino: `develop` (o `main` solo para `release/*` y `hotfix/*`).
- **Título** en formato Conventional Commit (se usa como mensaje del *squash*):
  `feat(auth): inicio de sesión con correo y contraseña (HU-1)`.
- Completar la plantilla `.github/pull_request_template.md`.
- PRs pequeños: idealmente < 400 líneas cambiadas. Una HU grande se divide en varios PRs.
- Requisitos para merge:
  - 1 aprobación como mínimo.
  - Lint y typecheck en verde.
  - Rama actualizada con `develop`.
  - Conversaciones resueltas.
- Estrategia: **Squash and merge** hacia `develop`; **merge commit** de `release/*` hacia `main`
  (para conservar el historial del sprint).
- Borrar la rama remota tras el merge.

## 4. Versionado y releases

- [SemVer](https://semver.org/lang/es/): `MAJOR.MINOR.PATCH`, sincronizado con `version` de `app.json`.
- Al cierre de cada sprint: `release/sprint-0X` → PR a `main` → tag `vX.Y.Z` → merge de vuelta a `develop`.
- Los *hotfix* incrementan `PATCH` y se mergean en `main` y `develop`.

## 5. Automatización

**No hay validaciones al hacer commit** (sin hooks de Git): cada integrante commitea libremente en su rama
(ver [ADR-0008](../decisions/0008-sin-validaciones-al-hacer-commit.md)). La convención de commits de §2 es
una guía del equipo y se revisa en el PR.

| Herramienta | Qué valida | Archivo |
|---|---|---|
| **GitHub Actions** | En PR y push a `main`/`develop`: lint, formato y tipos | `.github/workflows/ci.yml` |

Como el merge es *squash*, lo que queda en el historial de `develop` es el **título del PR**: ese sí debe
cumplir Conventional Commits y lo verifica quien revisa.

### Pendiente (requiere el repositorio en GitHub)

Configurar en *Settings → Branches* la protección de `main` y `develop`: PR obligatorio, 1 aprobación,
*status check* `Lint, formato y tipos` requerido, rama actualizada antes del merge.
