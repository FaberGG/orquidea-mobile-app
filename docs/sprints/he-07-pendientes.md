# HE-07 Reporte ciudadano — Diferencias con el diseño y pendientes

Implementación de HU-18, HU-19 y HU-20 en la pestaña **Comunidad**. El diseño de Figma (sección
*HE-07 Reporte Ciudadano*) se tomó como referencia visual; donde la API o las historias no lo permiten, se
implementó lo que existe en el backend ([`docs/api/reportes-avistamiento.md`](../api/reportes-avistamiento.md))
y la diferencia se documenta aquí como pendiente o sugerencia.

## 1. Decisiones de diseño propias

| Tema | Figma | Implementación | Motivo |
|---|---|---|---|
| Foro (HU-20) | Tarjetas con margen; foto de 220 px dentro de la tarjeta | Publicaciones sin tarjeta, separadas por una línea; **foto de borde a borde** de la pantalla, como Instagram | Pedido del equipo: la foto es el contenido principal |
| Proporción de la foto en el foro | Fija (370 × 220) | Se respeta la proporción real entre **4:5** (vertical) y **1.91:1** (horizontal); las más altas o anchas se recortan al centro | Las fotos verticales del celular (3:4, 9:16) ocuparían varias pantallas |
| Ver la foto | — | Al tocarla se abre a pantalla completa, sin recorte, con **zoom** (pellizcar o doble toque), arrastre y deslizar para cerrar, como Facebook | Pedido del equipo |
| Autor | Retrato del usuario | Iniciales sobre fondo verde suave | La API no expone foto de perfil |
| Lugar | Nombre del lugar ("Laguna Sur") | Coordenadas con ícono; al tocarlas se abren en la app de mapas | La API solo guarda `decimalLatitude` / `decimalLongitude` |
| Reino y clasificación | No aparecen en la publicación | Dos etiquetas sobre la descripción: reino y clasificación específica ("Especie sin identificar" si es desconocida) | HU-20 CA1 pide mostrarlos |
| Descripciones largas | Texto completo | Se recortan a 4 líneas con **Ver más** | Mantener el foro escaneable |
| Botón flotante | Visible para todos | Usuario registrado: abre el formulario. Visitante: aviso para iniciar sesión que lleva al login. **Administradores no lo ven** | La API responde `403` si un administrador crea un reporte (su jerarquía no incluye `USUARIO_REGISTRADO`) |
| Rechazar (HU-19) | Un toque | Pide confirmación en la misma tarjeta | El rechazo es definitivo en la API |
| Botón del formulario | "Publicar reporte" | "Enviar reporte" | HU-18 CA1 nombra el botón ENVIAR REPORTE y el reporte no se publica de inmediato |
| Campana del encabezado | Anuncios | Se muestra, pero aún no abre nada | Anuncios (HU-17) en desarrollo |

## 2. Pendientes por limitaciones de la API

Sugerencias de implementación futura. Requieren cambios en el backend antes que en la app.

| # | Diseño | Estado en la API | Sugerencia |
|---|---|---|---|
| P1 | **Varias fotos** por reporte (carrusel con contador "1/3" y puntos) | `foto` es un único archivo; `OccurrenceDto.urlFoto` es una sola URL | Aceptar `fotos[]` en el multipart y devolver `urlsFotos: string[]`. En la app: selección múltiple en `pick-sighting-photo.ts` y un carrusel horizontal paginado en `FeedPhoto` |
| P2 | **Me gusta** y **comentarios** con contadores | No existen (tampoco en las HU) | Endpoints `POST/DELETE /api/reportes-avistamiento/{id}/me-gusta` y `GET/POST …/{id}/comentarios`, con contadores en `OccurrenceDto`. Nueva HU con el Product Owner |
| P3 | Filtro **Rechazados** en Moderación, con el **motivo** del rechazo | No hay endpoint para listar rechazados; `rechazar` no recibe motivo | `GET /api/reportes-avistamiento/rechazados` y cuerpo `{ motivo }` en `rechazar`. En la app: chips Pendientes / Rechazados y un campo de motivo al confirmar el rechazo |
| P4 | Notificar al autor del rechazo (HU-19 CA2, "opcionalmente") | No existe | Depende de P3 y de un canal de notificaciones (push o correo) |
| P5 | **Nombre científico** con sugerencias de coincidencias | `OccurrenceRequest` no tiene `scientificName` | Agregar el campo y un endpoint de búsqueda de fichas (ver brecha B10 de docs/api) |
| P6 | **Grupo taxonómico** (aves, mamíferos…) | Solo `kingdom`: `ANIMALIA`, `PLANTAE`, `FUNGI`, `DESCONOCIDO` | Se ofrece el reino como chips (Animal, Planta, Hongo, Desconocido). Si se quiere un grupo más fino, agregarlo al contrato |
| P7 | Nombre del lugar | Solo coordenadas | Agregar `locality` (DwC) o resolver el nombre a partir de las estaciones del sendero (HE-05) |
| P8 | Foto de perfil del autor | `recordedBy` es solo el nombre | Agregar foto de perfil a los usuarios |

## 3. Pendientes de la app

| # | Pendiente | Nota |
|---|---|---|
| A1 | **Elegir el punto en un mapa** ("Selecciona un punto en el mapa") | Hoy se usa la ubicación actual del teléfono (`expo-location`). Cuando exista el mapa del sendero (HE-05), agregar un selector de punto que llene las mismas coordenadas |
| A2 | Anuncios desde la campana | Enlazar cuando exista el listado de anuncios (HU-17) |
| A3 | Envío sin conexión (HU-22) | La API ya es idempotente con el campo `id`: generar el UUID en el cliente, guardar el reporte en la cola de sincronización (HE-08) y reenviarlo con el mismo `id` |
| A4 | Volver a Comunidad tras iniciar sesión | El aviso del visitante lleva a `/login`, que al entrar va a Inicio (comportamiento actual del login). Podría recibir una ruta de retorno |
| A5 | Ver los reportes propios y su estado | La API no tiene "mis reportes"; el usuario solo ve la confirmación al enviar |
