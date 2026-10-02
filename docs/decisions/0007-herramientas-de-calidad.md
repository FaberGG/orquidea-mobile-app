# 0007 — Herramientas de calidad: ESLint, Prettier, husky, commitlint y GitHub Actions

**Estado:** Aceptado

## Contexto

Las convenciones de `docs/conventions/` solo sirven si se cumplen de forma consistente en un equipo con
distintos editores y sistemas operativos (Windows incluido). Revisar a mano el formato, el orden de imports
o el formato de los commits es costoso y propenso a errores.

## Decisión

- **ESLint 9 (configuración *flat*)** con `eslint-config-expo`, siguiendo la guía oficial de Expo (SDK 53+).
  Reglas propias en `eslint.config.js`: orden de imports, fronteras entre capas con `no-restricted-imports`
  por carpeta, sin `any` ni `@ts-ignore` e `import type` obligatorio para los tipos.
- **Prettier** integrado con `eslint-plugin-prettier/recommended` (recomendado por Expo): el formato
  incorrecto es un error de lint. Markdown excluido (tablas extensas en la documentación).
- **`.gitattributes` con `eol=lf`** para que Windows no convierta a CRLF y rompa Prettier.
- **husky + lint-staged**: corrige y formatea solo los archivos en *staging* antes de cada commit.
- **commitlint** con `@commitlint/config-conventional`; lista de alcances como advertencia.
- **GitHub Actions** (`ci.yml`): lint, formato, typecheck y commitlint del rango de commits del PR.

## Consecuencias

- (+) Las reglas de arquitectura se verifican automáticamente, no solo en la revisión de código.
- (+) La CI y los hooks locales ejecutan los mismos comandos (`npm run lint`, `format:check`, `typecheck`).
- (−) `expo-env.d.ts` no se versiona y lo genera `expo start`; la CI lo crea antes del typecheck y en local
  hay que ejecutar `npx expo start` una vez después de clonar.
- (−) Las reglas de capas están basadas en rutas de carpeta: si se crea una capa nueva, hay que actualizar
  `eslint.config.js`.

## Alternativas consideradas

- **Biome**: más rápido, pero sin las reglas de Expo, React Compiler ni `eslint-plugin-import` equivalentes.
- **Prettier separado de ESLint** (solo `eslint-config-prettier`): menos ruido en el editor, pero se aparta de
  la guía oficial de Expo; se puede revisar si los errores de formato molestan durante el desarrollo.
- **eslint-plugin-boundaries**: más expresivo para capas, pero es una dependencia extra; `no-restricted-imports`
  basta por ahora.
