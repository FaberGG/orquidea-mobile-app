# 0012 — Subida de fotos con expo-file-system

**Estado:** Aceptado. Complementa [0011](0011-seleccion-de-fotos-expo-image-picker.md): el selector elige la
foto y este módulo la sube.

## Contexto

Al crear y editar una ficha con foto, la subida con `fetch` + `FormData` fallaba en Android (Expo Go): la
foto llegaba vacía y la API respondía `400 El formato de la imagen no es válido.`. Leer el archivo de caché del
selector con `fetch(uri).blob()` devolvía solo 14 bytes de los 277 KB.

## Decisión

- La foto se sube con `new File(uri).upload(url, { uploadType: UploadType.MULTIPART, … })` de
  `expo-file-system`, el módulo nativo de Expo. Vive en `src/lib/api/multipart.ts`.
- Los campos de texto viajan como `parameters` del mismo envío; sin foto nueva se sigue usando `apiClient`.
- `uploadMultipart` conserva las reglas del cliente HTTP: encabezado `Authorization`, `ApiError` con
  `serverMessage` y `body`, y cierre de sesión ante `401`.

## Consecuencias

- (+) La foto llega completa en Android y iOS.
- (+) Un solo punto de subida de archivos para futuras features (avistamientos con foto).
- (−) El nombre del archivo en la petición lo toma la URI local (p. ej. `…jpeg`); si la API exige otra
  extensión, habrá que renombrar la copia antes de subir.
- (−) La subida no tiene tiempo de espera propio; la ruta usa el del sistema.

## Alternativas consideradas

- `fetch` con `Blob`: falla en Android, ver contexto.
- `expo-blob`: aún no lo probamos; agregaría la misma lectura del archivo por otro camino.
