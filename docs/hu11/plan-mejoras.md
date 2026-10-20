# HU11 — Plan de mejoras y cierre tras la prueba en iPhone

Fecha de corte: 19 de octubre de 2026. Estado: plan preparado; ejecución de las mejoras pendiente.

Este plan continúa la implementación local existente. No reinicia la historia ni da por aprobada la
exportación administrativa porque sus pruebas automáticas hayan pasado. Todo se mantiene local hasta
la autorización del usuario para subir el paquete completo.

## 1. Objetivo y alcance

Dejar un recorrido utilizable de extremo a extremo en Android e iOS:

1. Visitante: Inicio → escanear QR → ficha correcta → volver al escáner o cerrar.
2. Administrador/superadministrador: Inicio → abrir ficha → obtener QR → previsualizar → elegir destino
   para guardarlo o compartirlo → comprobar el PNG guardado y su lectura.
3. Fallos: explicar QR ajeno, ficha inexistente, falta de conexión, fallo de servidor y permiso de
   cámara bloqueado, permitiendo recuperarse sin cerrar la aplicación.

Los criterios originales siguen siendo abrir la ficha asociada, mostrar el mensaje de código no
registrado y resolver la ausencia de red con el aviso de conexión permitido por la HU. Obtener y
compartir el PNG desde la app es la ampliación administrativa solicitada en esta conversación.

Fuera de este ciclo: web, persistencia offline de fichas (HU21), enlaces universales, apertura externa
con la app cerrada, estaciones editables independientes de la ficha y cambios de HU17.

## 2. Punto de partida y evidencia

### Confirmado en la sesión del iPhone

- La aplicación abre en Expo Go.
- El usuario pudo entrar al escáner y conceder acceso a la cámara.
- Los QR A y B abrieron los nombres y datos de sus fichas respectivas.
- Se pudo regresar desde el detalle al escáner.
- La linterna encendió.
- Al salir al inicio del iPhone y regresar, la cámara volvió a mostrar imagen.

No se confirmó de forma separada el apagado de linterna, una nueva lectura tras segundo plano,
la exportación del archivo, todos los caminos de permisos ni el comportamiento en Android.

### Problemas y brechas

- **HU11-M01 / P0:** el usuario inició sesión y reporta que no ve las opciones de QR. Existe el panel
  en el código, pero la causa en el teléfono no está determinada. No atribuirlo sin comprobar a caché,
  permisos o falta de desplazamiento.
- **HU11-M02 / P1:** flecha de volver poco visible en modo oscuro, confirmada en capturas. En el código
  el icono usa `onPrimary`, que en oscuro es verde oscuro, sobre un fondo negro translúcido; además,
  el círculo mide 36 puntos sin ampliación táctil.
- **HU11-M03 / P1:** el título del escáner invade la barra superior del iPhone. La pantalla no usa
  insets propios y su ruta tiene el encabezado desactivado; utiliza el título compartido de 48 puntos.
- **HU11-M04 / P1:** posible conflicto visual entre cámara y «+». La captura sin «+» no demuestra un
  solapamiento. El código ya los organiza en fila; falta comprobar ambos con un rol administrativo.
- **HU11-M05 / P1:** obtener/guardar/compartir está implementado, pero no probado en el selector nativo.
- **HU11-M06 / P1:** falta completar errores, conectividad, recuperación y permisos en ambos sistemas.
- **HU11-M07 / P2:** A y B comparten una ilustración provisional. No es una prueba válida de que cada
  ficha carga una foto diferente.
- **HU11-M08 / P2:** el engranaje azul aparece superpuesto en las capturas. Su origen no está confirmado;
  comprobar si es una herramienta del entorno antes de atribuirlo a Terravia.

### Base técnica ya disponible

- Backend: generación de PNG 1024 × 1024 por UUID y autorización administrativa.
- Payload estable: `orquideamobileapp://species/{uuid}`; no incluir IP local, token ni datos personales.
- Frontend: panel `SpeciesQrExport`, permiso `species:download-qr`, descarga autenticada, validación de
  firma PNG, archivo temporal y selector nativo de compartir.
- El cliente solicita `image/png, application/json`: API real comprobada con 200 PNG, 401 JSON y 404
  JSON. Solicitar solo PNG provocaba errores de negociación; conservar la corrección.
- Última regresión completa: 33 suites y 258 pruebas aprobadas. Después del ajuste del encabezado,
  las dos suites afectadas se repitieron: 22 pruebas aprobadas.
- Tipos, lint, formato y exportaciones Android/iOS aprobados en la implementación previa a este ciclo.
  Volver a comprobar lo necesario tras las mejoras, sin confundir exportación con instalación física.

## 3. Orden de ejecución

Completar las partes 1 a 4 localmente. Después ejecutar la parte 5 con teléfonos y preparar el cierre de
la parte 6. Si no hay teléfono disponible, terminar la preparación y dejar los casos físicos pendientes,
sin marcarlos como aprobados. No publicar cambios como paso automático.

### Parte 1 — Resolver la ausencia de las opciones QR (P0)

**Objetivo:** demostrar qué versión, rol y pantalla está usando el teléfono y corregir la causa real.

Pasos:

1. Identificar el servidor Expo y comprobar que sirve `revision-orquidea-mobile-hu11`, no otro checkout.
   Hay antecedentes de servidores de desarrollo en 8082 y 8083: registrar cuál usa el teléfono y
   conservar una única referencia para la prueba, sin detener procesos ajenos.
2. Hacer una recarga completa del proyecto servido después de instalar `expo-sharing`. Si persiste el
   problema, reiniciar ese servidor con caché limpia; evitar borrar datos o reinstalar por defecto.
3. Confirmar en Usuario el rol efectivo de la sesión de Terravia y contrastarlo con la respuesta de la
   API. La sesión de Expo no es la sesión de Terravia. No registrar contraseñas ni tokens.
4. Recorrer login → `toUser` → `SessionProvider` → `RoleProvider` → permiso `species:download-qr`.
5. Abrir el detalle desde Inicio, sin depender del escáner, y comprobar que `SpeciesQrExport` se
   monta dentro de la ficha. Revisar hasta qué punto se desplazó la pantalla y si el panel queda fuera
   de la vista o tapado por el área inferior.
6. Reproducir también con superadministrador y luego con visitante/usuario. Corregir versión, sesión,
   montaje o ubicación según la evidencia, sin mostrar el botón a todos como solución.
7. Añadir una prueba de integración en `species-screens.test.tsx` que afirme explícitamente la
   presencia de la acción QR en el detalle para admin y superadmin y su ausencia para visitor/user.
   Las pruebas aisladas del panel ya existen y no sustituyen esta comprobación.

Archivos principales: `species-detail-screen.tsx`, `species-qr-export.tsx`,
`permissions.ts`, `app-providers.tsx` y flujo de sesión de auth.

**Entrega:** causa registrada, corrección local, prueba de integración y procedimiento reproducible
para cargar el proyecto correcto. La confirmación visual en teléfono sigue pendiente si no está presente.

**Cierre:** una cuenta administrativa encuentra la acción QR al abrir una ficha normal; los roles sin
permiso no la ven. Si la prueba física no puede ejecutarse, no cerrar M01 como resuelto en dispositivo.

### Parte 2 — Corregir navegación, contraste y encabezados (P1)

**Objetivo:** que entrar, volver y cerrar sea legible y operable en ambos temas y tamaños de pantalla.

Pasos:

1. Dar al botón de volver una superficie opaca y colores de primer plano/fondo compatibles con cada
   tema. No cambiar globalmente `onPrimary`, porque otros botones lo usan correctamente.
2. Ampliar su área táctil a un mínimo de 44 × 44 puntos, mantener la etiqueta accesible «Volver» y
   comprobarlo sobre foto clara, foto oscura y ausencia de foto.
3. Aplicar área segura superior e inferior a todos los estados del escáner: solicitud de permiso,
   cámara activa, carga, error y acceso a configuración.
4. Usar un tamaño de encabezado adecuado para esta pantalla, con salto de línea y crecimiento del
   texto del sistema. No reducir globalmente el título compartido para resolver un único caso.
5. Ajustar el espacio de cámara al espacio disponible; permitir desplazamiento cuando el texto crezca.
   Cerrar, Reintentar y linterna deben seguir alcanzables sin quedar debajo del indicador de inicio.
6. En Inicio, conservar «+» para crear ficha y diferenciar el lector con un icono QR reconocible.
   Mantener controles en fila, áreas táctiles de al menos 44 puntos y separación sin solapamiento.
   Usar tokens y estilos compartidos, no un posicionamiento absoluto sobre el mismo punto.
7. Probar ambos controles con admin/superadmin en el iPhone antes de declarar que había o que se
   corrigió una colisión. Verificar también que al visitante solo le aparece el lector.

Archivos principales: `species-detail-screen.tsx`, `species-qr-scanner-screen.tsx`,
`app-tabs-layout.tsx`, `app-header.tsx`, `scan-species-qr-button.tsx`, `icon.tsx` y tokens si hacen falta.

**Entrega:** controles corregidos y capturas comparativas de los mismos estados cuando haya dispositivo.

**Cierre:** no hay superposición con la barra del sistema; volver/cerrar y cámara/«+» se distinguen y
se pulsan de manera independiente en claro/oscuro, con texto normal y ampliado.

### Parte 3 — Hacer visible y completo el recorrido administrativo QR (P1)

**Objetivo:** que una persona administradora descubra y use la exportación sin instrucciones técnicas.

Diseño previsto:

- Añadir un acceso visible **Código QR** dentro de las acciones de la ficha, próximo a su identificación,
  para no depender de llegar al final de todos los campos. Reutilizar el panel existente como destino
  de la acción, sin crear una segunda implementación de descarga.
- Presentar la vista previa con nombre común y científico de la ficha y un fondo que conserve los
  márgenes blancos del PNG, incluso en tema oscuro.
- Conservar **VER CÓDIGO QR** para obtener el archivo y **GUARDAR O COMPARTIR QR** para abrir el menú.
  Añadir una indicación breve de que la persona elige el destino en el menú del teléfono.

Pasos:

1. Resolver M01 antes de mover elementos: un cambio de ubicación no sustituye identificar si el
   teléfono estaba ejecutando una versión anterior o una sesión sin permiso.
2. Integrar el acceso visible respetando `species:download-qr` y el mismo detalle para todos los roles.
3. Mantener estados de preparación, error y reintento y evitar solicitudes o menús duplicados por
   pulsaciones repetidas. No pedir permisos de fototeca para compartir un archivo.
4. Ofrecer recuperación si el archivo temporal ya no existe; permitir obtenerlo de nuevo sin salir de
   la ficha. No intentar compartir una URI obsoleta indefinidamente.
5. Verificar cancelación del selector: conservar vista previa y no anunciar guardado o envío exitoso.
6. Guardar un PNG en Archivos en iOS y en un destino disponible en Android; registrar el destino real,
   sin prometer opciones que no ofrezca ese dispositivo.
7. Mostrar el PNG guardado en otra pantalla o en papel y escanearlo con Terravia; debe abrir la misma
   ficha. No evaluar esta lectura con la cámara externa del sistema, fuera del alcance actual.

Archivos principales: `species-qr-export.tsx`, `use-species-qr.ts`, constantes y detalle de ficha.

**Entrega:** acceso administrativo visible, vista previa identificada, guardado/compartición y cancelación
recuperables, con evidencias físicas por plataforma cuando estén disponibles.

**Cierre:** encontrar el acceso → obtener PNG → guardarlo → volver a leerlo funciona sin herramientas
del backend. La evidencia debe acreditar el archivo en su destino, no solo que se abrió el selector.

### Parte 4 — Endurecer integración, permisos y preparación de QA (P1/P2)

**Objetivo:** disponer de datos y respuestas confiables para probar caminos de éxito y fallo.

Pasos:

1. Mantener el endpoint QR restringido a admin/superadmin y el detalle/escáner públicos. Verificar 401,
   403, 404 y fallos de API; el cliente debe recibir mensajes JSON y nunca guardarlos como PNG.
2. Mantener verificación de firma binaria, timeout, cancelación, nombres por UUID y ausencia de tokens
   en archivos, enlaces, mensajes o evidencias. Probar descarga interrumpida y reintento.
3. Añadir cobertura backend de negociación PNG/JSON si no existe, para evitar regresión del caso que
   produjo 500 con `Accept` exclusivamente PNG. No alterar globalmente los manejadores de error sin
   una reproducción y una necesidad comprobadas.
4. Preparar A y B con fotografías diferentes y coherentes con las especies, en el entorno aislado de
   QA. Comprobar que el cambio de imagen no cambia el QR ni el UUID. Preservar datos ajenos a QA.
5. Preparar un QR de formato válido para un UUID inexistente y otro ajeno al contrato; etiquetarlos X
   y Z. Registrar el contenido esperado y confirmar primero que X responde 404.
6. Preparar escenarios controlados de red: sin conexión real, API detenida/inaccesible con Wi-Fi activo
   y recuperación. El modo avión por sí solo no prueba falta de red si se deja Wi-Fi conectado.
7. Identificar la superposición azul del entorno sin retirarla ni atribuirla a Terravia por suposición.

**Entrega:** conjunto A/B/X/Z reproducible, dos imágenes distintas, casos de API y procedimiento de
red, sin credenciales en documentos versionados. Cambios de backend solo si los casos los justifican.

**Cierre:** los datos y estados esperados de cada prueba son conocidos antes de probar el teléfono.

### Parte 5 — Completar validación física Android/iOS (P1)

**Objetivo:** acreditar por separado la HU original y la ampliación administrativa.

Ejecutar los casos de `guia-pruebas-dispositivos.md` por plataforma, incluyendo:

1. Entrada pública y permiso de cámara concedido, denegado y bloqueado con regreso desde Ajustes.
2. A/B, imágenes diferentes, lectura repetida sin apilar fichas y regreso al escáner.
3. Z/X con el texto exacto «Este código no está asociado a ninguna ficha registrada.» y recuperación.
4. Falta de red con aviso de conexión, Reintentar al recuperarla y una API caída sin confundirla con
   un código inválido o con falta de internet confirmada.
5. Linterna encendida y apagada; segundo plano, regreso y nueva lectura; salida durante una consulta
   sin navegación tardía.
6. Usuario/visitante sin exportación, admin y superadmin con acceso visible; guardado real, cancelación
   y lectura del PNG exportado.
7. Temas claro/oscuro, texto ampliado, VoiceOver/TalkBack, controles táctiles y navegación habitual.
8. Lectura desde pantalla y muestra impresa con los márgenes originales. Registrar condiciones.
9. Validar en Expo Go y después en compilación propia cuando esté disponible. Registrar diferencias
   de permisos o configuración nativa; la exportación de bundles no acredita una instalación propia.

**Entrega:** registro por caso, plataforma, modelo, versión del SO, modo de ejecución, resultado y
evidencia. Registrar aprobado/fallido/pendiente, sin extrapolar iPhone a Android.

**Cierre:** CA1, CA2 y CA3 acreditados en Android e iOS; administración y fallos visuales corregidos y
repetidos. Lo no probado debe continuar explícitamente pendiente.

### Parte 6 — Regresión y paquete local de entrega

**Objetivo:** dejar el conjunto listo para revisión y posterior subida, sin publicarlo automáticamente.

Pasos:

1. Revisar el diff para separar las mejoras HU11 de cambios preexistentes y del trabajo HU17. No
   restablecer ni incluir cambios ajenos por conveniencia.
2. Ejecutar tipos, lint y formato; pruebas de los cambios y regresión pertinente. Revisar advertencias
   o handles de Jest sin ocultar fallos ni usar un resultado de pruebas como evidencia física.
3. Exportar Android/iOS tras los cambios finales y ejecutar comprobaciones backend si se modificó.
4. Actualizar este plan, `validation.md`, guía, README de directorios tocados y decisiones técnicas si
   cambia el recorrido. Distinguir evidencia histórica de resultados vigentes.
5. Preparar resumen de cambios, defectos resueltos, casos ejecutados, pendientes reales y pasos para
   levantar la misma versión local. Mantener `.env.local`, cuentas, tokens y PNG temporales fuera del
   paquete versionable.
6. Presentar el paquete para revisión. Commit, push y PR quedan sujetos a la instrucción posterior
   del usuario; conservar el prefijo de rama `feature/`.

**Entrega:** código local comprobado, evidencia ordenada y lista de archivos preparada para revisión.

**Cierre:** sin bloqueos P0/P1 abiertos y con validación física suficiente para la entrega acordada. Si
faltan dispositivos o instalación propia, comunicar la limitación y no afirmar cierre completo.

## 4. Primer trabajo a ejecutar al retomar

Empezar por **Parte 1: opciones QR no visibles**. Reproducir el estado de sesión y proyecto cargado,
añadir la comprobación de presencia en el detalle completo y corregir su causa. Después abordar juntos
contraste, área segura y encabezado. No pedir repetir todas las pruebas del usuario antes de tener
estas correcciones y una versión identificada listas para cargar.

## 5. Referencias

- [Resultados y hallazgos de la sesión](validation.md).
- [Guía de pruebas Android/iOS](guia-pruebas-dispositivos.md).
- [Contrato y recorrido administrativo actual](README.md).
- [Requisitos HU11 y criterios de aceptación](../requirements/Historias-Usuario.md#hu-11).
- [ADR 0015 — lector y conectividad](../decisions/0015-escaneo-qr-y-conectividad.md).
- [ADR 0016 — obtener/compartir PNG](../decisions/0016-exportar-qr-desde-la-app.md).
