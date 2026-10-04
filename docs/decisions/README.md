# docs/decisions/ — Architecture Decision Records (ADR)

Registro de decisiones técnicas relevantes: **qué** se decidió, **por qué** y qué alternativas se descartaron.
Evita repetir discusiones y da contexto a quien llegue después.

## Cuándo escribir un ADR

- Al agregar una dependencia que define cómo se escribe código (estado, formularios, navegación, pruebas…).
- Al cambiar una regla de arquitectura o una convención.
- Al elegir entre alternativas con *trade-offs* no evidentes.

## Formato

Archivo `NNNN-titulo-en-kebab-case.md` con las secciones: **Estado** (Propuesto / Aceptado / Reemplazado por NNNN),
**Contexto**, **Decisión**, **Consecuencias** y **Alternativas consideradas**. Los ADR aceptados no se editan:
se reemplazan con uno nuevo.

## Índice

| # | Decisión | Estado |
|---|---|---|
| [0001](0001-arquitectura-por-features.md) | Arquitectura por features con rutas delgadas | Aceptado |
| [0002](0002-permisos-sobre-roles.md) | Control de UI por permisos derivados del rol | Aceptado |
| [0003](0003-estado-de-servidor-tanstack-query.md) | TanStack Query para el estado de servidor | Propuesto |
| [0004](0004-formularios-rhf-zod.md) | React Hook Form + Zod para formularios y validación | Propuesto |
| [0005](0005-pruebas-jest-expo.md) | jest-expo + React Native Testing Library | Propuesto |
| [0006](0006-almacenamiento-seguro-de-sesion.md) | Sesión en expo-secure-store | Propuesto |
| [0007](0007-herramientas-de-calidad.md) | ESLint, Prettier, husky, commitlint y GitHub Actions | Reemplazado parcialmente por 0008 |
| [0008](0008-sin-validaciones-al-hacer-commit.md) | Sin validaciones al hacer commit; la calidad se verifica en el PR | Aceptado |
| [0009](0009-tipografia-nunito-e-iconos-expo-symbols.md) | Tipografía Nunito e íconos con expo-symbols | Propuesto |

Los ADR *Propuestos* se aceptan (o se modifican) al ejecutar la tarea del Sprint 1 que instala la dependencia.
