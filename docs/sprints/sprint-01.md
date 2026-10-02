# Sprint 1 — Acceso, roles y fichas taxonómicas

**Alcance:** HE-01 (HU-1, HU-1.1, HU-2, HU-3) · HE-02 (HU-4, HU-5, HU-6) · HE-03 (HU-7, HU-8, HU-9, HU-10)

**Fuera de alcance:** HE-04 a HE-08 (QR, mapa, contenido, avistamientos, offline).

---

## 0. Tareas base (bloquean al resto)

Deben terminarse primero, en este orden. Son las únicas que tocan configuración global.

| # | Tarea | Rama sugerida | Dónde |
|---|---|---|---|
| T0.1 | Eliminar el código de demostración de la plantilla (`explore.tsx`, `hint-row`, `web-badge`, `animated-icon`, script `reset-project`, imágenes de ejemplo) y ajustar `name`/`slug` en `app.json` | `chore/issue-1-limpiar-plantilla` | `src/`, `assets/`, `scripts/` |
| T0.2 | ✅ **Hecho.** Tooling: ESLint, Prettier, reglas de import y de capas (ADR-0007, ADR-0008) | — | raíz |
| T0.3 | ✅ **Hecho** (salvo protección de ramas). CI en GitHub Actions: lint + formato + typecheck. **Pendiente:** proteger `main` y `develop` al crear el repositorio remoto | — | `.github/workflows/` |
| T0.4 | Pruebas: `jest-expo` + Testing Library (ADR-0005). Al terminar, agregar el paso `npm test` a la CI | `chore/issue-4-configurar-pruebas` | raíz, `.github/workflows/ci.yml` |
| T0.5 | Configuración: lectura y validación de `EXPO_PUBLIC_API_URL` | `feat/issue-5-config-entorno` | `src/config/` |
| T0.6 | Cliente HTTP: base URL, token, timeout, `ApiError`, refresh ante 401 | `feat/issue-6-cliente-http` | `src/lib/api/` |
| T0.7 | Almacenamiento seguro (ADR-0006) y query client (ADR-0003) | `feat/issue-7-storage-y-query` | `src/lib/storage/`, `src/lib/query/` |
| T0.8 | Permisos: roles, matriz, `can`, `usePermission`, `<Can>` + pruebas | `feat/issue-8-permisos` | `src/permissions/` |
| T0.9 | Componentes base: botón, input, mensaje de error, estado vacío, cargando | `feat/issue-9-componentes-base` | `src/components/` |
| T0.10 | Shell de navegación: layout raíz con guards, tabs (`index`, `species`, `account`), grupos `(auth)` y `(admin)` vacíos | `feat/issue-10-shell-navegacion` | `src/app/`, `src/providers/` |

> T0.5 a T0.9 pueden avanzar en paralelo una vez cerradas T0.1 y T0.2.

> **Prerrequisito externo:** contrato de la API (endpoints, formato de errores, forma del token y del rol).
> Mientras no exista, las funciones de `api/` pueden trabajar contra un mock acordado, documentado en
> `docs/architecture/API.md`.

## 1. HE-01 — Gestión de acceso

Feature: [`src/features/auth/`](../../src/features/auth/README.md)

| HU | Ruta | Piezas principales | Rama |
|---|---|---|---|
| HU-1 Iniciar sesión | `(auth)/login.tsx` | `LoginScreen`, `loginSchema`, `useLogin`, `auth.api.login`, `SessionProvider` | `feat/hu-1-login` |
| HU-1.1 Recuperar contraseña | `(auth)/forgot-password.tsx` | `ForgotPasswordScreen`, `useRequestPasswordReset` | `feat/hu-1-1-recuperar-contrasena` |
| HU-2 Registro | `(auth)/register.tsx` | `RegisterScreen`, `registerSchema`, `useRegister` | `feat/hu-2-registro` |
| HU-3 Cerrar sesión | `(tabs)/account.tsx` | `AccountScreen`, `useLogout` (limpia tokens y caché) | `feat/hu-3-cerrar-sesion` |

Notas:
- HU-1.1 CA2: mismo mensaje exista o no la cuenta.
- Restaurar la sesión al abrir la app (token guardado + `GET /me`) mientras la splash sigue visible.

## 2. HE-02 — Roles y administradores

Feature: [`src/features/admins/`](../../src/features/admins/README.md) · Permisos: `admins:*`

| HU | Ruta | Piezas principales | Rama |
|---|---|---|---|
| HU-4 Crear administrador | `(admin)/admins/new.tsx` | `CreateAdminScreen`, `adminSchema`, `useCreateAdmin` | `feat/hu-4-crear-admin` |
| HU-5 Editar / revocar | `(admin)/admins/index.tsx`, `(admin)/admins/[id].tsx` | `AdminListScreen`, `EditAdminScreen`, `useUpdateAdmin`, `useRevokeAdmin` | `feat/hu-5-editar-revocar-admin` |
| HU-6 Herencia superadmin | — | Matriz de permisos (superadmin ⊇ admin) + pruebas | `feat/hu-6-herencia-superadmin` |

Notas:
- El límite de administradores (HU-4 CA2) y la regla del único superadmin (HU-5 CA3) los valida la API;
  la app mapea el código de error al mensaje textual.
- HU-6 se cumple principalmente con T0.8; esta rama agrega las pruebas que lo demuestran.

## 3. HE-03 — Fichas taxonómicas

Feature: [`src/features/species/`](../../src/features/species/README.md) · Permisos: `species:*`

| HU | Ruta | Piezas principales | Rama |
|---|---|---|---|
| HU-10 Listado por categoría | `(tabs)/species/index.tsx`, `species/[id].tsx` | `SpeciesListScreen`, `CategorySelector`, `SpeciesCard`, `SpeciesDetailScreen`, `useSpeciesList` | `feat/hu-10-listado-fichas` |
| HU-7 Crear ficha | `(admin)/species/new.tsx` | `SpeciesForm`, `speciesSchema`, `useCreateSpecies`, selector de imagen (jpg/png) | `feat/hu-7-crear-ficha` |
| HU-8 Editar ficha | `(admin)/species/[id]/edit.tsx` | `SpeciesForm` (reutilizado), `useUpdateSpecies` | `feat/hu-8-editar-ficha` |
| HU-9 Eliminar ficha | `species/[id].tsx` (acción) | `DeleteSpeciesButton` dentro de `<Can permission="species:delete">`, diálogo de confirmación | `feat/hu-9-eliminar-ficha` |

Notas:
- Orden recomendado: HU-10 → HU-7 → HU-8 → HU-9 (el listado y el detalle son la base visual de las demás).
- `SpeciesForm` es un único componente para crear y editar.
- La subida de imágenes probablemente requiera `expo-image-picker` (ADR antes de instalar).

## 4. Criterio de cierre del sprint

- Todas las HU cumplen su Definition of Done ([CONTRIBUTING §3](../../CONTRIBUTING.md#3-definition-of-done)).
- `release/sprint-01` mergeada en `main` con tag `v0.1.0`.
- Retrospectiva técnica agregada a este documento.
