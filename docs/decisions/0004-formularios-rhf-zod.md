# 0004 — React Hook Form + Zod para formularios y validación

**Estado:** Propuesto

## Contexto

El Sprint 1 incluye 7 formularios (login, registro, recuperación, crear/editar admin, crear/editar ficha)
con validaciones y mensajes exactos definidos en los criterios de aceptación.

## Decisión

Usar `react-hook-form` + `zod` + `@hookform/resolvers`. Los esquemas viven en `features/<feature>/schemas/`
y usan los mensajes de `features/<feature>/constants.ts`. Zod también puede validar respuestas de la API.

## Consecuencias

- (+) Validación declarativa, tipos inferidos del esquema y pocos re-renders.
- (−) Dos dependencias adicionales.

## Alternativas consideradas

- Formik + Yup: más re-renders y menor integración de tipos.
- Validación manual: duplicada y propensa a errores.
