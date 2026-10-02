# 0001 — Arquitectura por features con rutas delgadas

**Estado:** Aceptado

## Contexto

La app tendrá 8 épicas con dominios claros (acceso, administradores, fichas, QR, mapa, contenido,
avistamientos, offline). Expo Router obliga a que `src/app/` contenga las rutas; mezclar ahí la lógica
de dominio produce archivos grandes y difíciles de probar.

## Decisión

- `src/app/` contiene solo rutas, layouts y guards.
- Cada dominio vive en `src/features/<feature>/` con `api/`, `components/`, `hooks/`, `schemas/`, `types/`
  y una API pública en `index.ts`.
- Lo compartido y agnóstico del dominio va en `components/`, `lib/`, `hooks/` y `utils/`.

## Consecuencias

- (+) Un desarrollador puede trabajar una HU tocando casi solo una carpeta; hay menos conflictos de merge.
- (+) Las features se pueden probar y eliminar de forma aislada.
- (−) Requiere disciplina con las reglas de importación (se reforzarán con ESLint).

## Alternativas consideradas

- **Por tipo** (`screens/`, `services/`, `components/` globales): escala mal; los dominios quedan dispersos.
- **Lógica en `src/app/`**: acopla el dominio a la navegación y complica las pruebas.
