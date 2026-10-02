# 0005 — jest-expo + React Native Testing Library

**Estado:** Propuesto

## Contexto

Se requieren pruebas unitarias (permisos, esquemas, mapeadores) y de componentes (criterios de aceptación).

## Decisión

Usar `jest-expo` como preset (recomendado por Expo) y `@testing-library/react-native` para los componentes.
Las pruebas se ubican junto al código (`__tests__/` o `*.test.ts(x)`).

## Consecuencias

- (+) Integración oficial con los módulos de Expo y mocks incluidos.
- (−) Las pruebas E2E quedan fuera del alcance por ahora (evaluar Maestro en sprints futuros).
