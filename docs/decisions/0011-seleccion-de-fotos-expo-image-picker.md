# 0011 — Selección de fotos con expo-image-picker

**Estado:** Aceptado

## Contexto

Crear y editar una ficha (HU-7, HU-8) requiere elegir una fotografía de la galería del dispositivo, con
formato jpg o png y un máximo de 10 MB (docs/api, `TaxonRequest.foto`). La app no tenía un selector de imágenes.

## Decisión

- Usar `expo-image-picker` (módulo oficial de Expo, instalado con `npx expo install`).
- La selección vive en `src/features/species/components/pick-species-photo.ts`: abre la galería, valida el
  tipo y el tamaño en el dispositivo y devuelve la foto o un motivo de rechazo. La validación se repite en la
  API (413 y 400), pero evita subidas inútiles.
- No se pide permiso de cámara: solo se usa la galería.

## Consecuencias

- (+) Interfaz de selección nativa en iOS, Android y web, sin código por plataforma.
- (+) La validación de tipo y tamaño queda en una sola función, probada aparte.
- (−) Una dependencia nativa más. Expo Go la incluye; las builds de desarrollo la necesitan al regenerarse.

## Alternativas consideradas

- `react-native-image-picker`: no es un módulo de Expo, y hay que mantener su configuración nativa.
- Subir cualquier archivo sin validar: la API lo rechazaría, con peor experiencia.
