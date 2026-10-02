# Reglas de codificación y buenas prácticas

Estas reglas son obligatorias. Lo que pueda automatizarse se verifica con ESLint/Prettier/TypeScript;
lo demás, en la revisión de código.

## 0. Reglas verificadas automáticamente

| Regla | Herramienta | Configuración |
|---|---|---|
| Formato (comillas simples, 100 columnas, comas finales, LF) | Prettier | `.prettierrc.json`, `.gitattributes` |
| Reglas de Expo/React/hooks/React Compiler | ESLint (`eslint-config-expo`) | `eslint.config.js` |
| Orden de imports (externos → `@/` → relativos, alfabético, línea en blanco entre grupos) | ESLint `import/order` | `eslint.config.js` |
| Sin imports internos de otra feature (`@/features/x/...`) | ESLint `no-restricted-imports` | `eslint.config.js` |
| Sin rutas relativas de más de un nivel (`../../`) | ESLint `no-restricted-imports` | `eslint.config.js` |
| Fronteras entre capas (§4 y [ARQUITECTURA §3](../architecture/ARQUITECTURA.md#3-reglas-de-dependencia)) | ESLint `no-restricted-imports` por carpeta | `eslint.config.js` |
| Sin `any`, sin `@ts-ignore`, `import type` para tipos | ESLint `@typescript-eslint` | `eslint.config.js` |
| `===` obligatorio; `console.log` genera advertencia | ESLint | `eslint.config.js` |
| Tipos estrictos | TypeScript `strict` | `tsconfig.json` |

Si una regla debe desactivarse en una línea, usa `// eslint-disable-next-line <regla>` **con un comentario
que explique por qué**. Desactivar reglas para un archivo completo requiere aprobación en el PR.

## 1. Idioma

| Qué | Idioma |
|---|---|
| Código (variables, funciones, tipos, archivos, rutas, permisos) | **Inglés** |
| Textos visibles para el usuario | **Español** (textuales a los criterios de aceptación) |
| Comentarios, documentación, commits, PRs | **Español** |

## 2. TypeScript

- `strict: true` siempre. Prohibido `any`; usar `unknown` y estrechar el tipo.
- Prohibido `@ts-ignore`; si es inevitable, `@ts-expect-error` con comentario del motivo.
- Prohibido el operador de aserción no nula `!` salvo justificación.
- `type` para uniones, props y modelos; `interface` solo si se necesita extender/declarar merge.
- Uniones de literales en vez de `enum`: `type Role = 'visitor' | 'user' | 'admin' | 'superadmin'`.
- Tipar explícitamente el retorno de funciones exportadas de `api/`, `lib/` y `utils/`.
- Los datos externos (respuestas de API, parámetros de ruta, almacenamiento) se validan antes de usarse.

## 3. Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos y carpetas | `kebab-case` | `login-form.tsx`, `use-session.ts` |
| Componentes | `PascalCase` | `LoginForm`, `SpeciesCard` |
| Pantallas | `PascalCase` + sufijo `Screen` | `SpeciesListScreen` |
| Hooks | `camelCase` con prefijo `use` | `useSpeciesList` |
| Funciones / variables | `camelCase`, verbos para funciones | `fetchSpecies`, `isLoading` |
| Booleanos | prefijo `is/has/can/should` | `isAuthenticated`, `canEdit` |
| Constantes globales | `SCREAMING_SNAKE_CASE` | `MAX_IMAGE_SIZE_MB` |
| Tipos | `PascalCase`, sin prefijo `I`/`T` | `Species`, `SpeciesDto` |
| Props | `<Componente>Props` | `SpeciesCardProps` |
| Archivos de API | `<recurso>.api.ts` | `species.api.ts` |
| Esquemas | `<nombre>.schema.ts` | `login.schema.ts` |
| Pruebas | `<archivo>.test.ts(x)` | `can.test.ts` |
| Específicos de plataforma | `.ios.tsx` / `.android.tsx` / `.web.tsx` | `map-view.web.tsx` |

## 4. Imports y exports

- Usar el alias `@/` (→ `src/`) y `@/assets/`. Prohibido `../../..` más de un nivel hacia arriba.
- **Exports con nombre** en todo el código. Única excepción: archivos de ruta en `src/app/`
  (Expo Router exige `export default`).
- Cada feature expone su API pública en `index.ts`. Desde fuera solo se importa `@/features/<feature>`.
- Orden de imports (separados por línea en blanco): 1) librerías externas, 2) alias `@/`, 3) relativos.
- Respetar las [reglas de dependencia entre capas](../architecture/ARQUITECTURA.md#3-reglas-de-dependencia).

## 5. Componentes

- Solo componentes funcionales. Un componente exportado por archivo (subcomponentes privados permitidos).
- Archivos de más de ~200 líneas son señal para dividir.
- Separar **presentación** de **datos**: la pantalla obtiene datos con hooks y los pasa por props a
  componentes presentacionales que no conocen la API.
- Props mínimas y explícitas; evitar pasar objetos enteros cuando se usan dos campos.
- Toda pantalla que carga datos debe manejar **cargando**, **vacío**, **error** y **éxito**
  (usar los componentes de `components/feedback/`).
- **React Compiler está activo**: no agregar `useMemo`, `useCallback` ni `React.memo` por defecto;
  solo con una medición que lo justifique.
- No usar `useEffect` para derivar estado ni para pedir datos (para eso están los hooks de query).

## 6. Estilos y UI

- `StyleSheet.create` al final del archivo; nada de objetos de estilo inline salvo valores dinámicos.
- Prohibido hardcodear colores, tamaños de fuente o espaciados: usar los tokens de
  `@/constants/theme` (`Colors`, `Spacing`, `Fonts`) y los componentes temáticos.
- Soportar **tema claro y oscuro** siempre.
- Respetar áreas seguras (`react-native-safe-area-context`).
- Imágenes con `expo-image`; listas con `FlatList` (o `FlashList` si se adopta), nunca `ScrollView` + `map`
  para listas de longitud variable.

## 7. Accesibilidad

- Todo elemento interactivo tiene `accessibilityRole` y `accessibilityLabel` si no tiene texto visible.
- Área táctil mínima 44×44 pt (usar `hitSlop` si el ícono es más pequeño).
- No transmitir información solo con color. Respetar el tamaño de fuente del sistema.

## 8. Datos, API y estado

- Ningún componente llama a `fetch` o al cliente HTTP: siempre `api/` → `hooks/` → componente.
- Mapear DTO → modelo de dominio en `api/`. El resto de la app no conoce la forma del JSON.
- Claves de caché centralizadas por feature (`speciesKeys.list(category)`), nunca strings sueltos.
- Tras una mutación, invalidar las queries afectadas (p. ej. crear ficha → invalidar listado de su categoría).
- Ver la tabla de estado en [ARQUITECTURA.md §6](../architecture/ARQUITECTURA.md#6-estado).

## 9. Formularios y mensajes

- Formularios con React Hook Form + esquemas Zod en `features/<feature>/schemas/`.
- Los mensajes de los criterios de aceptación se copian **textualmente** a `features/<feature>/constants.ts`
  y se referencian desde ahí; nunca se reescriben inline.
  ```ts
  export const AUTH_MESSAGES = {
    invalidCredentials: 'Correo o contraseña incorrectos.',
    requiredFields: 'Ambos campos son obligatorios.',
  } as const;
  ```
- Las validaciones del cliente mejoran la UX; las del servidor son las definitivas.

## 10. Errores

- Todo error de red se normaliza en `lib/api` a `ApiError`. Las features traducen códigos a mensajes.
- Nunca mostrar al usuario mensajes técnicos, stack traces ni respuestas crudas del servidor.
- Prohibido el `catch` vacío. Si un error se ignora a propósito, comentar por qué.
- Usar *error boundaries* de Expo Router (`ErrorBoundary` exportado desde el layout/ruta) para errores de render.

## 11. Seguridad

- Tokens **solo** en `expo-secure-store` (vía `lib/storage`). Prohibido AsyncStorage/estado plano para tokens.
- Ningún secreto en el repositorio ni en variables `EXPO_PUBLIC_*`.
- No registrar (`console.log`) tokens, contraseñas ni datos personales.
- La UI por permisos no es seguridad: el backend valida (ver [ROLES-Y-PERMISOS](../architecture/ROLES-Y-PERMISOS.md)).
- HU-1.1: el mensaje de recuperación es el mismo exista o no la cuenta (no filtrar información).

## 12. Pruebas

- Herramientas previstas: `jest-expo` + `@testing-library/react-native` (ver ADR-0005).
- Ubicación: junto al código en una carpeta `__tests__/` o como `archivo.test.ts`.
- Obligatorio probar: matriz de permisos, esquemas de validación, mapeadores DTO, utilidades puras.
- Recomendado: pruebas de componentes para los escenarios de los criterios de aceptación.
- Las pruebas describen el comportamiento en español: `it('muestra "Ambos campos son obligatorios." si faltan datos')`.

## 13. Comentarios y código muerto

- Comentar el **porqué**, no el **qué**. Funciones públicas de `lib/` y `permissions/` con JSDoc breve.
- No dejar código comentado, `console.log` ni `TODO` sin issue asociado (`// TODO(#23): ...`).

## 14. Plataforma y Expo

- Antes de usar una API de Expo, consultar la documentación de **SDK 57** (las APIs cambian entre versiones).
- Dependencias solo con `npx expo install`. Preferir módulos de Expo sobre terceros.
- Nunca crear ni editar `ios/` o `android/` a mano: configurar en `app.json` y *config plugins*.
- Código específico de plataforma con extensiones de archivo (`.ios.tsx`, `.web.tsx`) antes que `Platform.OS` disperso.
