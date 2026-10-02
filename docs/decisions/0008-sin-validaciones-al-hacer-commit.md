# 0008 — Sin validaciones al hacer commit; la calidad se verifica en el PR

**Estado:** Aceptado · Reemplaza parcialmente a [0007](0007-herramientas-de-calidad.md)

## Contexto

ADR-0007 introdujo hooks de Git (husky + lint-staged + commitlint) que bloqueaban el commit si el código
tenía errores de lint o formato, o si el mensaje no cumplía Conventional Commits. El equipo decidió que el
flujo de commits locales no debe depender de esas validaciones: los commits en una rama de trabajo son
borradores y no deben frenar al desarrollador.

## Decisión

- Se retiran `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, la carpeta `.husky/`,
  `commitlint.config.js` y el job de commitlint de la CI.
- Se mantienen ESLint, Prettier y TypeScript, ejecutables a mano (`npm run lint`, `format`, `typecheck`) y en
  el editor (formato al guardar).
- La **CI en el PR** (lint, formato y tipos) es el único punto obligatorio de control.
- La convención de commits sigue siendo la guía del equipo; el título del PR (mensaje del *squash*) la cumple
  y se revisa en la revisión de código.

## Consecuencias

- (+) Commitear es libre y rápido; no hay bloqueos locales ni diferencias entre sistemas operativos.
- (−) Los errores de lint/formato se descubren más tarde (en la CI). Se mitiga con el formato al guardar en
  VS Code y ejecutando `npm run lint` antes de abrir el PR.
- (−) Los mensajes de commit intermedios pueden no seguir la convención; no afecta a `develop` gracias al *squash*.
