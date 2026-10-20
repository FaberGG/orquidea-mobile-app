# 0015 — Escaneo QR de fichas y conectividad

## Estado

Aceptado — 17 de octubre de 2026.

## Contexto

HU11 requiere que un visitante abra la ficha taxonómica asociada a un código QR en la app, sin iniciar
sesión. No hay un catálogo separado de estaciones: el QR identifica directamente el UUID persistente
de una ficha. El móvil ya dispone de una consulta pública de detalle y TanStack Query.

La pantalla debe distinguir un QR inválido, una ficha no registrada, la falta confirmada de red y un
fallo de API. Una conexión desconocida no debe bloquear una consulta: puede haber una API accesible
aunque el módulo de red no pueda determinar el estado con certeza. La ausencia de red confirmada no
se convierte aquí en una estrategia offline persistente; esa capacidad corresponde a HU21.

## Decisión

- Generar un QR PNG desde el backend con el payload estricto
  `orquideamobileapp://species/{uuid}`. El escáner interno solo acepta esa forma y valida el UUID antes
  de consultar la API. No se aceptan enlaces externos ni parámetros arbitrarios.
- Usar `expo-camera` para lectura interna limitada a QR; no se habilita grabación de audio. El QR no
  depende de IP, dominio de desarrollo ni URL temporal del backend.
- Resolver cada lectura con una consulta pública fresca, aislada por sesión e intento, sin reintentos
  automáticos. Solo navegar tras comprobar que el ID devuelto coincide; entonces se entrega el modelo
  a la caché normal del detalle.
- Usar `expo-network` mediante el hook transversal `useNetworkStatus`. Solo la combinación
  `isConnected === false` y tipo `NONE` se considera desconexión confirmada; `UNKNOWN` o información
  incompleta se tratan como desconocidos y permiten intentar la API. Refrescar antes de resolver o
  reintentar y al volver a primer plano; una respuesta HTTP prevalece sobre un estado de red leído
  previamente.
- Limitar la solicitud del escáner a 10 segundos y cancelar su consulta al cerrar o abandonar la ruta.
  No modificar el gestor de red global de TanStack Query.
- Sin red confirmada, conservar el UUID en memoria para ofrecer Reintentar o Volver a escanear; no
  almacenar la ficha ni las imágenes en el dispositivo.

## Consecuencias

- Backend genera PNG 1024 × 1024 solo para administrador/superadministrador; la consulta de detalle
  utilizada por el lector sigue siendo pública.
- El QR interno funciona sin datos personales ni secretos, pero no promete abrir la app desde la cámara
  del sistema, un lector externo o con la app cerrada. Universal Links/App Links requieren un dominio
  y otra decisión compatible con códigos ya impresos.
- Los UUID de ficha deben permanecer estables para conservar los QR físicos.
- La conectividad del sistema es una señal orientativa. Una caída de API con red activa aparece como
  error recuperable, no como falta de internet.
- El acceso a la cámara necesita una compilación de la app que incorpore su configuración nativa; la
  validación automatizada no sustituye la prueba óptica en Android/iOS físicos.

## Alternativas consideradas

- QR con URL HTTPS universal: descartado por ahora porque no hay dominio ni destino web definidos y
  cambiaría la aceptación de apertura externa.
- UUID de estación con endpoint resolvedor: descartado mientras no se requiera mover una especie entre
  estaciones sin reimprimir.
- Mostrar offline ante cualquier error de petición: descartado porque confunde una caída de API con
  falta de conexión y oculta el error real.
- Reutilizar como prueba el detalle cacheado: descartado porque una ficha eliminada o modificada podría
  abrirse desde una lectura antigua, contrario a la verificación fresca del QR.
- Descargar una copia offline de la ficha: aplazado a HU21.

## Referencias

- [HU11 y criterios de aceptación](../requirements/Historias-Usuario.md).
- [Contrato QR compartido](../hu11/README.md).
- [Expo Network SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/network/).
- [Expo Camera SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/camera/).
