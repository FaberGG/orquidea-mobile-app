# Historias de usuario y criterios de aceptación — Orquídea


**Resumen:** 8 épicas · 23 historias de usuario · 58 escenarios de aceptación.

## Índice de épicas

| Épica | Nombre | Historias |
|---|---|---|
| [HE-01](#he-01-gestión-de-acceso-de-usuarios-a-la-plataforma) | Gestión de acceso de usuarios a la plataforma | HU-1, HU-1.1, HU-2, HU-3 |
| [HE-02](#he-02-asignación-de-roles-y-permisos-de-administrador) | Asignación de roles y permisos de administrador | HU-4, HU-5, HU-6 |
| [HE-03](#he-03-gestión-de-fichas-taxonómicas-aves-plantas-e-insectos) | Gestión de fichas taxonómicas (aves, plantas e insectos) | HU-7, HU-8, HU-9, HU-10 |
| [HE-04](#he-04-acceso-a-fichas-taxonómicas-mediante-código-qr) | Acceso a fichas taxonómicas mediante código QR | HU-11 |
| [HE-05](#he-05-mapa-interactivo-georreferenciado-del-sendero) | Mapa interactivo georreferenciado del sendero | HU-12, HU-13 |
| [HE-06](#he-06-gestión-de-contenido-informativo-del-humedal) | Gestión de contenido informativo del humedal | HU-14, HU-15, HU-16, HU-17 |
| [HE-07](#he-07-reporte-ciudadano-de-avistamientos) | Reporte ciudadano de avistamientos | HU-18, HU-19, HU-20 |
| [HE-08](#he-08-funcionamiento-en-modo-offline) | Funcionamiento en modo offline | HU-21, HU-22 |

---

## HE-01 — Gestión de acceso de usuarios a la plataforma

### HU-1

> **Rol:** Yo como USUARIO (ADMINISTRADOR, SUPERADMINISTRADOR O USUARIO REGISTRADO)  
> **Quiero:** Necesito iniciar sesión en la aplicación con mi correo y contraseña.  
> **Para:** Para poder acceder a las funcionalidades correspondientes a mi rol.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Ingreso exitoso | En caso de ingresar un correo y contraseña correctos. | Clic en el botón INGRESAR. | El sistema despliega la pantalla de inicio con las opciones habilitadas para el rol del usuario. |
| 2 | Credenciales incorrectas | En caso de ingresar un correo o contraseña incorrectos. | Clic en el botón INGRESAR. | El sistema muestra el mensaje: 'Correo o contraseña incorrectos.' |
| 3 | Campos obligatorios vacíos | En caso de no ingresar correo y/o contraseña. | Clic en el botón INGRESAR. | El sistema muestra el mensaje: 'Ambos campos son obligatorios.' |
| 4 | Recuperación de contraseña | En caso de que el usuario haya olvidado su contraseña. | Clic en el enlace '¿Olvidaste tu contraseña?' | El sistema despliega la pantalla de recuperación de contraseña (HU-1.1). |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-1.1

> **Rol:** Yo como USUARIO  
> **Quiero:** Necesito recuperar mi contraseña de acceso.  
> **Para:** Para poder volver a ingresar a la aplicación.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Recuperación exitosa | En caso de ingresar un correo registrado en el sistema. | Clic en el botón ENVIAR. | El sistema muestra el mensaje: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.' |
| 2 | Correo no registrado | En caso de ingresar un correo que no existe en el sistema. | Clic en el botón ENVIAR. | El sistema muestra el mismo mensaje de envío, sin confirmar si la cuenta existe, por seguridad. |
| 3 | Campo vacío | En caso de no ingresar el correo electrónico. | Clic en el botón ENVIAR. | El sistema muestra el mensaje: 'Debes ingresar tu correo electrónico.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-2

> **Rol:** Yo como VISITANTE (usuario no logueado)  
> **Quiero:** Necesito registrarme en la aplicación con mi nombre, apellido, correo y contraseña.  
> **Para:** Para convertirme en usuario registrado y poder crear reportes de avistamientos.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Registro exitoso | En caso de ingresar todos los datos válidos y un correo no registrado previamente. | Clic en el botón REGISTRARME. | El sistema crea la cuenta, envía un correo de confirmación y redirige a la pantalla de inicio de sesión. |
| 2 | Correo ya registrado | En caso de que el correo ingresado ya exista en el sistema. | Clic en el botón REGISTRARME. | El sistema muestra el mensaje: 'Este correo ya está registrado.' |
| 3 | Campos obligatorios incompletos | En caso de no ingresar nombre, apellido, correo o contraseña. | Clic en el botón REGISTRARME. | El sistema muestra el mensaje: 'Todos los campos son obligatorios.' |
| 4 | Formato de correo inválido | En caso de que el correo ingresado no tenga un formato válido. | Clic en el botón REGISTRARME. | El sistema muestra el mensaje: 'Ingresa un correo electrónico válido.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-3

> **Rol:** Yo como USUARIO (con sesión iniciada)  
> **Quiero:** Necesito cerrar sesión.  
> **Para:** Para proteger el acceso a mi cuenta cuando termino de usar la aplicación.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Cierre de sesión exitoso | En caso de tener una sesión activa. | Clic en el botón CERRAR SESIÓN. | El sistema finaliza la sesión y redirige a la pantalla de inicio como visitante. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

---

## HE-02 — Asignación de roles y permisos de administrador

### HU-4

> **Rol:** Yo como SUPERADMINISTRADOR  
> **Quiero:** Necesito crear una nueva cuenta de administrador.  
> **Para:** Para delegar la gestión de contenido de la plataforma.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Creación exitosa | En caso de ingresar datos completos, correo no registrado, y el número de administradores actuales sea menor al límite permitido. | Clic en el botón CREAR ADMINISTRADOR. | El sistema crea la cuenta y notifica al nuevo administrador por correo electrónico. |
| 2 | Límite de administradores alcanzado | En caso de que se intente crear un nuevo administrador superando la cantidad configurada por el comité (actualmente 3, valor ajustable). | Clic en el botón CREAR ADMINISTRADOR. | El sistema muestra el mensaje: 'Has alcanzado el número de administradores configurado. Contacta al equipo de desarrollo si necesitas ampliarlo.' |
| 3 | Correo ya registrado | En caso de que el correo ingresado ya pertenezca a una cuenta existente. | Clic en el botón CREAR ADMINISTRADOR. | El sistema muestra el mensaje: 'Este correo ya está registrado.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-5

> **Rol:** Yo como SUPERADMINISTRADOR  
> **Quiero:** Necesito editar o inhabilitar de un administrador existente.  
> **Para:** Para mantener actualizado el control de acceso a la plataforma.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Edición exitosa | En caso de modificar correctamente los datos o permisos del administrador. | Clic en el botón GUARDAR CAMBIOS. | El sistema muestra el mensaje: 'Los cambios se guardaron correctamente.' |
| 2 | Revocación exitosa | En caso de eliminar el rol de administrador de una cuenta. | Clic en el botón REVOCAR ACCESO. | El sistema degrada la cuenta a usuario registrado y notifica al afectado por correo. |
| 3 | Intento de autorrevocación del único superadministrador | En caso de que el superadministrador intente revocarse a sí mismo siendo el único activo. | Clic en el botón REVOCAR ACCESO. | El sistema muestra el mensaje: 'No puedes revocar el único superadministrador de la plataforma.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-6

> **Rol:** Yo como SUPERADMINISTRADOR  
> **Quiero:** Necesito tener acceso a todas las funcionalidades de administrador (fichas taxonómicas, mapa, contenido informativo del humedal y reportes ciudadanos).  
> **Para:** Para poder actualizar directamente la información de la plataforma cuando sea necesario, además de gestionar las cuentas de administrador.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Acceso heredado a funcionalidades de administrador | En caso de que el superadministrador ingrese a cualquier módulo de gestión de contenido (fichas, mapa, componentes/anuncios, reportes ciudadanos). | Ingreso al módulo correspondiente. | El sistema le presenta las mismas opciones y permisos que tendría un administrador, sin restricciones adicionales. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

---

## HE-03 — Gestión de fichas taxonómicas (aves, plantas e insectos)

### HU-7

> **Rol:** Yo como ADMINISTRADOR o SUPERADMINISTRADOR  
> **Quiero:** Necesito crear una ficha taxonómica de una especie (orden, familia, género, nombre científico, nombre común, alimentación, rol en el humedal, estado de conservacion y foto).  
> **Para:** Para que la información esté disponible públicamente en la plataforma.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Creación exitosa | En caso de completar todos los campos obligatorios de la ficha. | Clic en el botón GUARDAR FICHA. | El sistema publica la ficha taxonómica en el listado correspondiente a su categoría (ave, planta o insecto). |
| 2 | Campos obligatorios incompletos | En caso de que falte uno o más campos obligatorios. | Clic en el botón GUARDAR FICHA. | El sistema muestra el mensaje: 'Debes completar todos los campos obligatorios.' |
| 3 | Formato de imagen no soportado | En caso de que la foto cargada no tenga un formato permitido (jpg, png). | Clic en el botón GUARDAR FICHA. | El sistema muestra el mensaje: 'El formato de la imagen no es válido.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-8

> **Rol:** Yo como ADMINISTRADOR o SUPERADMINISTRADOR  
> **Quiero:** Necesito editar una ficha taxonómica existente.  
> **Para:** Para mantener la información actualizada.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Edición exitosa | En caso de modificar correctamente uno o más campos de la ficha. | Clic en el botón GUARDAR CAMBIOS. | El sistema muestra el mensaje: 'La ficha se actualizó correctamente.' |
| 2 | Cancelar edición | En caso de decidir no guardar los cambios realizados. | Clic en el botón CANCELAR. | El sistema descarta los cambios y regresa a la ficha original. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-9

> **Rol:** Yo como ADMINISTRADOR o SUPERADMINISTRADOR  
> **Quiero:** Necesito eliminar una ficha taxonómica.  
> **Para:** Para retirar información desactualizada o incorrecta de la plataforma.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Eliminación exitosa | En caso de confirmar la eliminación de la ficha. | Clic en el botón ELIMINAR y luego en CONFIRMAR. | El sistema elimina la ficha y actualiza el listado público. |
| 2 | Cancelar eliminación | En caso de cancelar la acción de eliminar. | Clic en el botón CANCELAR. | La ficha permanece sin cambios. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-10

> **Rol:** Yo como VISITANTE  
> **Quiero:** Necesito consultar el listado de fichas taxonómicas por categoría (aves, plantas o insectos).  
> **Para:** Para conocer la biodiversidad del humedal.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Consulta exitosa | En caso de existir fichas registradas en la categoría seleccionada. | Clic en la categoría deseada. | El sistema muestra el listado de fichas de esa categoría con foto y nombre común. |
| 2 | Categoría sin fichas registradas | En caso de que no existan fichas registradas en la categoría seleccionada. | Clic en la categoría deseada. | El sistema muestra el mensaje: 'Aún no hay especies registradas en esta categoría.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

---

## HE-04 — Acceso a fichas taxonómicas mediante código QR

### HU-11

> **Rol:** Yo como VISITANTE  
> **Quiero:** Necesito escanear el código QR de una estación física del sendero.  
> **Para:** Para acceder directamente a la ficha taxonómica de la especie asociada sin buscarla manualmente.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Escaneo exitoso | En caso de que el código QR corresponda a una ficha registrada. | Escanear el código QR con la cámara del dispositivo. | El sistema abre directamente la ficha taxonómica asociada. |
| 2 | Código QR no reconocido | En caso de que el código QR no corresponda a ninguna ficha registrada. | Escanear el código QR. | El sistema muestra el mensaje: 'Este código no está asociado a ninguna ficha registrada.' |
| 3 | Escaneo sin conexión | En caso de que el dispositivo no tenga señal de datos. | Escanear el código QR. | El sistema muestra la ficha desde la información descargada previamente (modo offline), o indica que debe conectarse para poder acceder a ella. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

---

## HE-05 — Mapa interactivo georreferenciado del sendero

### HU-12

> **Rol:** Yo como VISITANTE  
> **Quiero:** Necesito visualizar el mapa interactivo con las estaciones del sendero.  
> **Para:** Para orientarme durante mi recorrido por el humedal.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Visualización exitosa | En caso de ingresar a la sección de mapa. | Clic en MAPA. | El sistema muestra el mapa con todas las estaciones y puntos de interés señalados. |
| 2 | Ubicación en tiempo real habilitada | En caso de que el visitante autorice el acceso a su ubicación. | Aceptar el permiso de geolocalización. | El sistema resalta la estación más cercana a la posición actual del visitante y muestra su información. |
| 3 | Geolocalización no autorizada | En caso de que el visitante no conceda permiso de ubicación. | Rechazar el permiso de geolocalización. | El sistema muestra el mapa general sin resaltar una estación específica. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-13

> **Rol:** Yo como ADMINISTRADOR o SUPERADMINISTRADOR  
> **Quiero:** Necesito gestionar las estaciones del mapa (crear, editar o eliminar).  
> **Para:** Para mantener actualizada la información del recorrido.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Creación de estación exitosa | En caso de completar nombre, coordenadas y especie o punto asociado. | Clic en el botón GUARDAR ESTACIÓN. | El sistema agrega la nueva estación al mapa. |
| 2 | Edición exitosa | En caso de modificar los datos de una estación existente. | Clic en el botón GUARDAR CAMBIOS. | El sistema muestra el mensaje: 'La estación se actualizó correctamente.' |
| 3 | Coordenadas inválidas | En caso de que las coordenadas ingresadas no sean válidas. | Clic en el botón GUARDAR ESTACIÓN. | El sistema muestra el mensaje: 'Las coordenadas ingresadas no son válidas.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

---

## HE-06 — Gestión de contenido informativo del humedal

### HU-14

> **Rol:** Yo como VISITANTE  
> **Quiero:** Necesito consultar la información de los componentes del humedal (hídrico, de aves, de flora, entre otros).  
> **Para:** Para conocer su funcionamiento ecológico.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Consulta exitosa | En caso de que el componente tenga contenido publicado. | Clic en el botón del componente deseado. | El sistema muestra la descripción e imágenes del componente. |
| 2 | Componente sin contenido | En caso de que el componente aún no tenga información publicada. | Clic en el botón del componente deseado. | El sistema muestra el mensaje: 'La información de esta sección estará disponible próximamente.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-15

> **Rol:** Yo como ADMINISTRADOR o SUPERADMINISTRADOR  
> **Quiero:** Necesito gestionar el contenido de cada componente del humedal.  
> **Para:** Para mantenerlo actualizado.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Actualización exitosa | En caso de editar correctamente el texto o las imágenes del componente. | Clic en el botón GUARDAR CAMBIOS. | El sistema muestra el mensaje: 'El contenido del componente se actualizó correctamente.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-16

> **Rol:** Yo como ADMINISTRADOR o SUPERADMINISTRADOR  
> **Quiero:** Necesito publicar un anuncio o contenido educativo.  
> **Para:** Para informar y educar a los visitantes sobre el humedal.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Publicación exitosa | En caso de completar el título y contenido del anuncio. | Clic en el botón PUBLICAR. | El sistema publica el anuncio en la sección correspondiente, visible para todos los usuarios. |
| 2 | Campos obligatorios incompletos | En caso de que falte el título o el contenido del anuncio. | Clic en el botón PUBLICAR. | El sistema muestra el mensaje: 'Debes completar el título y el contenido del anuncio.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-17

> **Rol:** Yo como VISITANTE  
> **Quiero:** Necesito consultar la sección de anuncios e información educativa.  
> **Para:** Para aprender más sobre el humedal y sus componentes.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Consulta exitosa | En caso de existir anuncios publicados. | Clic en ANUNCIOS. | El sistema muestra el listado de anuncios ordenados por fecha de publicación. |
| 2 | Sin anuncios publicados | En caso de que no existan anuncios registrados. | Clic en ANUNCIOS. | El sistema muestra el mensaje: 'Aún no hay anuncios publicados.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

---

## HE-07 — Reporte ciudadano de avistamientos

### HU-18

> **Rol:** Yo como USUARIO REGISTRADO  
> **Quiero:** Necesito crear un reporte de avistamiento con descripción, foto opcional, reino, clasificación específica y lugar donde lo vi.  
> **Para:** Para compartir mi observación con la comunidad.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Creación exitosa | En caso de completar la descripción (obligatoria) y los demás campos disponibles. | Clic en el botón ENVIAR REPORTE. | El sistema registra el reporte con estado 'pendiente de revisión' y muestra el mensaje: 'Tu reporte fue enviado y será revisado por un administrador.' |
| 2 | Descripción vacía | En caso de no ingresar la descripción del avistamiento. | Clic en el botón ENVIAR REPORTE. | El sistema muestra el mensaje: 'La descripción es obligatoria.' |
| 3 | Reino o clasificación desconocidos | En caso de que el usuario no identifique el reino o la clasificación específica. | Seleccionar la opción 'Desconocido'. | El sistema registra el reporte con el valor 'Desconocido' en el campo correspondiente. |
| 4 | Autor automático | En caso de que el usuario tenga sesión iniciada. | Clic en el botón ENVIAR REPORTE. | El sistema asocia automáticamente el reporte al usuario autenticado, sin que este deba ingresarlo manualmente. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-19

> **Rol:** Yo como ADMINISTRADOR o SUPERADMINISTRADOR  
> **Quiero:** Necesito revisar y aprobar o rechazar un reporte ciudadano.  
> **Para:** Para garantizar que solo contenido validado se publique en el foro público.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Aprobación exitosa | En caso de que el reporte cumpla con los criterios mínimos de contenido. | Clic en el botón APROBAR. | El sistema publica el reporte en el foro público de avistamientos. |
| 2 | Rechazo | En caso de que el reporte no cumpla con los criterios (contenido inapropiado, incompleto, etc.). | Clic en el botón RECHAZAR. | El sistema retira el reporte de la cola de revisión y no lo publica; opcionalmente notifica al autor. |
| 3 | Reporte pendiente sin acción | En caso de que el reporte aún no haya sido revisado. | El administrador ingresa a la cola de revisión. | El sistema muestra el reporte marcado como 'pendiente' hasta que se tome una decisión. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-20

> **Rol:** Yo como VISITANTE o USUARIO REGISTRADO  
> **Quiero:** Necesito consultar el foro de reportes ciudadanos aprobados.  
> **Para:** Para conocer los avistamientos compartidos por la comunidad.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Consulta exitosa | En caso de existir reportes aprobados. | Clic en FORO DE AVISTAMIENTOS. | El sistema muestra el listado de reportes aprobados con foto (si tiene), descripción, reino/clasificación, lugar y autor. |
| 2 | Sin reportes aprobados | En caso de que no haya reportes aprobados aún. | Clic en FORO DE AVISTAMIENTOS. | El sistema muestra el mensaje: 'Aún no hay avistamientos publicados.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

---

## HE-08 — Funcionamiento en modo offline

### HU-21

> **Rol:** Yo como VISITANTE  
> **Quiero:** Necesito consultar las fichas taxonómicas y el mapa del sendero sin conexión a internet.  
> **Para:** Para poder usar la aplicación durante mi recorrido por el humedal, donde la señal es limitada.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Consulta offline exitosa | En caso de que la información haya sido descargada previamente en el dispositivo. | Abrir la aplicación sin conexión. | El sistema muestra las fichas y el mapa disponibles localmente. |
| 2 | Información no descargada | En caso de que la ficha o sección consultada no haya sido descargada previamente. | Intentar acceder a esa sección sin conexión. | El sistema muestra el mensaje: 'Esta información no está disponible sin conexión. Conéctate a internet para descargarla.' |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)

### HU-22

> **Rol:** Yo como USUARIO REGISTRADO  
> **Quiero:** Necesito crear un reporte ciudadano en campo sin conexión a internet.  
> **Para:** Para que se sincronicen automáticamente con la plataforma al recuperar la señal.

**Criterios de aceptación**

| N° | Título | Contexto | Evento | Resultado esperado |
|:-:|---|---|---|---|
| 1 | Registro offline exitoso | En caso de ingresar datos sin conexión. | Clic en el botón GUARDAR. | El sistema almacena la información localmente en el dispositivo, marcada como 'pendiente de sincronización.' |
| 2 | Sincronización exitosa | En caso de que el dispositivo recupere la conexión a internet. | Automático, al detectar conexión. | El sistema sincroniza los datos pendientes con la plataforma y notifica: 'Datos sincronizados correctamente.' |
| 3 | Conflicto de sincronización | En caso de que la misma ficha haya sido modificada por otro administrador mientras el dispositivo estaba sin conexión. | Al sincronizar. | El sistema notifica el conflicto y solicita al administrador confirmar cuál versión conservar. |

**Vista navegador / Vista móvil:** pendiente de diseño (Figma)
