# 0016 — Obtener y compartir el QR desde la ficha

## Estado

Aceptado — 19 de octubre de 2026. Ampliación solicitada por el usuario durante la prueba física HU11.

## Contexto

La API ya genera PNG 1024 × 1024 con el identificador estable de una ficha. Faltaba una forma de
obtenerlos desde Android/iOS para preparar códigos impresos sin herramientas de backend.

## Decisión

- Incorporar un panel en el detalle compartido con permiso `species:download-qr`, exclusivo de admin y
  superadmin, alineado con el endpoint existente. El escáner y la consulta de fichas permanecen públicos.
- Obtener el PNG original bajo demanda con el cliente HTTP, conservando autorización, timeout e
  interceptores de sesión. Verificar su firma binaria antes de escribirlo.
- Guardar temporalmente un archivo por UUID en `Paths.cache` con `expo-file-system` ya instalado.
  Cancelar la solicitud al desmontar el panel y descartar respuestas tardías. No persistir credenciales.
- Usar `expo-sharing` SDK 57 para abrir el selector nativo de destinos con MIME `image/png` y UTI
  `public.png`. La API está incluida en Expo Go; el flujo sigue requiriendo prueba física en cada SO.
- Solo compartir hacia otras aplicaciones. No habilitar extensiones para recibir archivos ni permisos
  de galería. La persona decide el destino y confirma el guardado o envío.
- No anunciar éxito al cerrar el selector: la API de compartir no acredita que se haya guardado.

## Consecuencias

El PNG se puede previsualizar y exportar sin regenerarlo en el cliente ni cambiar el contrato impreso.
La caché puede ser eliminada por el sistema; para conservarlo hay que elegir un destino permanente.
No se elimina el archivo al resolver `shareAsync`, porque Android puede entregar el contenido al
destino después de ese momento. La ruta por UUID limita la acumulación por intentos repetidos.

## Alternativas consideradas

- Generar otro QR en JavaScript: duplicaría el contrato y la lógica del backend.
- Compartir la URL autenticada del endpoint: el destinatario no podría descargar sin sesión.
- Guardado directo en la galería: añade permisos y dependencias innecesarios para exportar un PNG.
- Recibir archivos de otras apps: no forma parte de esta necesidad.

## Referencias

- [Expo FileSystem SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/).
- [Expo Sharing SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/sharing/).
- [Contrato y uso HU11](../hu11/README.md).
