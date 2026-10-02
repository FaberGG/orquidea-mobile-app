# 0003 — TanStack Query para el estado de servidor

**Estado:** Propuesto

## Contexto

Casi todos los datos vienen de la API (fichas, administradores, sesión). Se necesita caché, estados
de carga y error, reintentos, invalidación tras mutaciones y, en HE-08, persistencia offline.

## Decisión

Usar `@tanstack/react-query`. El query client se configura en `src/lib/query/`; los hooks de query y mutation
viven en cada feature, y las claves de caché se centralizan por feature.

## Consecuencias

- (+) Elimina los `useEffect` + `useState` manuales para pedir datos.
- (+) Soporta persistencia de caché (base del modo offline de HE-08).
- (−) Curva de aprendizaje de la invalidación y las claves.

## Alternativas consideradas

- Redux Toolkit Query: más ceremonia y un store global que no se necesita.
- `fetch` manual en hooks: reimplementa la caché y los estados en cada pantalla.
