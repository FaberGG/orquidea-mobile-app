# HU11 — Guía de pruebas en Android e iOS

Preparada el 19 de octubre de 2026. Usaremos esta guía juntos cuando estén disponibles los teléfonos.
Cada caso se ejecuta en ambos equipos y se registra por separado. Todas las pruebas funcionales se
hacen en la aplicación móvil; Swagger y el navegador sirven únicamente para preparar y comprobar la API.

## 1. Cómo iniciaremos la sesión

Puedes escribirme: **«Ya tengo el iPhone y el Android. Iniciemos la guía HU11 desde el paso 1».**

1. Me indicas el modelo y la versión del sistema de cada teléfono, y si tienen Expo Go instalado.
2. Yo reviso la versión local de los repositorios, Docker, API, conexión y QR de prueba.
3. Preparamos primero el teléfono disponible; luego repetimos los mismos casos en el otro.
4. Tú operas la cámara y los ajustes del teléfono. Yo preparo el entorno, reviso las respuestas y
   registro los resultados que me comuniques.
5. Si aparece un fallo, me dices el ID del caso, el teléfono, qué pulsaste y qué ocurrió. Lo revisamos
   antes de seguir con pruebas que dependan de ese resultado.

Un resultado solo se marca aprobado cuando se haya observado. Si falta preparación o no logramos
provocar la condición necesaria, se registra pendiente, con el motivo.

## 2. Qué necesitamos tener a mano

- PC con este proyecto y Docker Desktop en funcionamiento.
- Un iPhone y un Android con batería suficiente, cámara trasera y acceso a sus ajustes.
- PC y teléfonos conectados a una misma red Wi-Fi que permita comunicación entre dispositivos.
- Pantalla del PC o una segunda pantalla para mostrar los PNG. Para el caso impreso, una muestra en papel.
- Dos fichas de QA distintas, una cuenta administrativa para obtener los QR y acceso público al detalle.
- Una versión móvil compatible con el proyecto, que actualmente utiliza Expo SDK 57.

Las credenciales se introducen localmente. En el registro de pruebas anotamos modelos, versiones y
resultados; no copiamos contraseñas, tokens ni archivos de configuración privados.

## 3. Preparación del PC y del backend — la hago yo contigo

### Paso 3.1 — Confirmar qué implementación vamos a probar

1. Comprobar la rama local `feature/hu11-qr` en los dos worktrees HU11.
2. Identificar la versión del código, incluso si los cambios todavía no tienen commit.
3. Confirmar que la API elegida para QA incluye `GET /api/fichas-taxonomicas/{id}/qr` en
   `/v3/api-docs` o Swagger. Una API que responde al listado puede estar ejecutando una versión anterior.
4. Preparar una API de QA con la implementación HU11 y su configuración, conservando los datos existentes.

Los archivos Compose actuales fijan nombres de contenedores y volúmenes. Yo revisaré cómo arrancar
la versión de QA antes de ejecutar instrucciones de arranque: levantar otro Compose sin ajustar el
entorno puede colisionar con el stack que ya está encendido.

### Paso 3.2 — Comprobar la conexión desde el teléfono

1. Obtener la IPv4 del PC en la red Wi-Fi activa. Ejemplo ilustrativo: `192.168.1.50`.
2. Anotar la URL real de la API. Si usa el puerto habitual: `http://192.168.1.50:8080`.
3. En cada teléfono, abrir esa URL con `/api/fichas-taxonomicas` al final.
4. Debe responder JSON, aunque sea una lista vacía. Si no responde, resolvemos red, puerto, servicio
   o firewall antes de probar el lector.
5. Revisar una `urlFoto` devuelta por la API y abrirla también desde el teléfono. Si apunta a
   `localhost`, hay que configurar el acceso público al almacenamiento para la red del teléfono.

En un teléfono físico, `localhost` identifica ese teléfono. Para este entorno se usa la IP del PC;
`10.0.2.2` es una dirección de emulador Android y no se usa aquí.

En el frontend, preparar `.env.local` con la IP y puerto reales. Ejemplo:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.50:8080
EXPO_PUBLIC_APP_ENV=development
```

La URL base no lleva `/api`: las rutas de la app ya lo incluyen. Tras cambiarla, reiniciamos el servidor
de desarrollo y recargamos la app. Si cambia la IP del PC, revisamos también la URL pública de las fotos.

### Paso 3.3 — Preparar cuatro QR identificados

1. **QR A:** generado por nuestra API para una ficha existente. Anotar UUID, nombre y foto esperados.
2. **QR B:** generado por nuestra API para una segunda ficha, con nombre y foto distintos.
3. **QR X:** formato válido `orquideamobileapp://species/{uuid}`, pero UUID que devuelve 404 en esta API.
4. **QR Z:** contenido ajeno al contrato, por ejemplo `https://example.com`.

Para obtener A y B:

1. Abrir Swagger en la API de QA y ejecutar `POST /api/autenticacion/iniciar-sesion` con
   `correo` y `contrasena` de la cuenta administrativa.
2. Copiar el campo `token` de la respuesta y usarlo en **Authorize** del esquema Bearer.
3. Ejecutar `GET /api/fichas-taxonomicas/{uuid}/qr` para cada ficha.
4. Guardar la respuesta PNG: `orquidea-ficha-{uuid}.png`. Si Swagger no ofrece descarga directa,
   yo guardo la respuesta usando la misma sesión.
5. Confirmar estado 200, tipo `image/png`, tamaño 1024 × 1024 y payload con el UUID correspondiente.
6. Mostrar cada imagen completa, con su margen blanco, sin estirarla ni taparla con el nombre del caso.

X y Z los preparo con un generador local de pruebas. El backend no genera QR para un UUID inexistente;
no vamos a crear ni borrar fichas reales para simular ese caso. El UUID de X debe comprobarse contra
la misma API que consulta la app.

## 4. Abrir el proyecto en los teléfonos

### Paso 4.1 — Primera sesión con Expo Go

Expo Camera SDK 57 está incluido en Expo Go; lo usaremos para una primera comprobación en dispositivos
físicos si la versión instalada es compatible con este proyecto. La configuración propia del plugin
de cámara requiere una compilación de la aplicación para verificarse por completo.
([Expo Camera SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/camera/)).

Desde el worktree móvil HU11, con las dependencias ya preparadas, inicio:

```powershell
npx expo start --go --lan --port 8082
```

Usamos 8082 para evitar el 8081 reservado por pgAdmin en el Compose actual; verificaremos que esté libre.

**En Android:**

1. Abrir Expo Go y usar su opción de escanear el QR de desarrollo mostrado en el PC.
2. Esperar a que cargue Orquídea y aparezca Inicio.
3. Si no existe esa opción en la versión instalada, usar el método de apertura que muestre Expo Go
   y revisar juntos el mensaje concreto.

**En iPhone:**

1. Iniciar sesión en Expo Go y en Expo CLI con la misma cuenta Expo; si hace falta, ejecutar
   `npx expo login` en el PC.
2. Leer el QR de desarrollo con la cámara del iPhone y abrir el enlace en Expo Go.
3. Permitir el acceso a la red local si se solicita y esperar a que aparezca Inicio.

La documentación vigente de Expo indica la misma Wi-Fi y, para Expo Go en un iPhone físico, la misma
cuenta en CLI y teléfono. ([Inicio de desarrollo](https://docs.expo.dev/get-started/start-developing/)).

**Hay dos QR diferentes:** el QR de Expo abre el proyecto; los PNG A/B/X/Z se leen dentro de
**Orquídea → Inicio → Escanear código QR**. Para HU11 no exigimos que la cámara del sistema abra
directamente una ficha con la app cerrada.

Si Expo Go informa SDK incompatible o falta de módulo nativo, registramos el error y preparamos una
compilación compatible; no contamos ese bloqueo de arranque como prueba ejecutada del lector.

### Paso 4.2 — Validación con una compilación propia

Para comprobar los permisos y la configuración nativa de Orquídea repetiremos los casos en una
compilación propia que incorpore los cambios de cámara. Los bundles exportados anteriormente no son
archivos APK o IPA instalables. Actualmente el repositorio no tiene `eas.json` ni `expo-dev-client`
configurados, por lo que esta vía requiere preparación adicional.

- Android: preparar e instalar una compilación de QA con el código HU11.
- iPhone desde este PC Windows: usar la distribución firmada del equipo o EAS con la cuenta,
  certificados y registro del dispositivo que correspondan. Compilar localmente para iOS requiere
  macOS/Xcode; EAS puede compilar en la nube desde Windows. Para instalar un build EAS en un iPhone
  físico necesitamos acceso a una membresía Apple Developer del equipo; confirmaremos esa disponibilidad
  antes de elegir esta vía. La documentación de Expo también describe la alternativa local con
  macOS/Xcode sin membresía de pago.
- Confirmar en ambos que API y fotos sean accesibles desde la app instalada. Que una URL HTTP abra
  en el navegador no demuestra que la configuración de red nativa permita esa misma petición.

Estas opciones y requisitos están documentados en
[development builds de Expo](https://docs.expo.dev/develop/development-builds/introduction/).
Si usamos un development client instalado, yo iniciaré el servidor con `--dev-client` en lugar de `--go`.

## 5. Casos funcionales — repetir completos en Android e iOS

Usa `AND-01`, `AND-02`… para Android y `IOS-01`, `IOS-02`… para iPhone. Mantén la misma API y los
mismos QR durante la comparación.

### Caso 01 — Entrada como visitante

1. Cerrar la sesión de Orquídea si había una cuenta abierta.
2. Entrar en Inicio y pulsar el acceso QR.
3. Volver a Inicio y repetir desde el menú lateral.

**Esperado:** el lector está disponible sin iniciar sesión. No solicita una cuenta para consultar la ficha.

### Caso 02 — Permisos de cámara

1. Con el permiso de cámara sin conceder, abrir el lector y pulsar **PERMITIR CÁMARA**.
2. Denegar el permiso en el aviso del sistema.
3. Comprobar que la app sigue abierta y permite cerrar el lector.
4. Volver a intentarlo. Si el sistema ya no permite preguntar, pulsar **ABRIR CONFIGURACIÓN**.
5. Activar Cámara en los ajustes y volver a Orquídea.

**Esperado:** se explica la necesidad del permiso y se recupera el lector al concederlo. No se exige
que el sistema muestre el aviso una segunda vez: depende de la plataforma y del historial de permisos.

En Android, buscar **Ajustes → Aplicaciones → Orquídea o Expo Go → Permisos → Cámara**. En iOS,
buscar Orquídea o Expo Go en Ajustes y activar Cámara. Las rutas pueden variar según la versión.
En Expo Go, el permiso pertenece a Expo Go; el texto personalizado de Orquídea se valida en su propia
compilación. Si el permiso ya estaba concedido, preparar el estado inicial desde Ajustes y registrarlo.

### Caso 03 — QR A y QR B abren su ficha correcta — CA1

1. Mostrar QR A en el PC y enfocarlo con el lector interno.
2. Comprobar que abre la ficha y coinciden nombre común, nombre científico, taxonomía y foto.
3. Pulsar **Volver** en la ficha y enfocar QR B.
4. Comprobar los datos propios de B y regresar al lector.

**Esperado:** cada QR abre su ficha, sin cruces de datos. La cámara vuelve a estar disponible al regresar.

### Caso 04 — Lectura repetida y salida

1. Mantener QR A frente a la cámara mientras se resuelve la primera lectura.
2. Comprobar cuántas fichas se abren.
3. Volver al lector y pulsar **Cerrar escáner**.
4. Repetir la apertura y cierre varias veces.

**Esperado:** una sola apertura por intento, regreso normal y ninguna navegación posterior al cierre.
Si regresamos al lector y dejamos A delante, una nueva lectura sí puede abrir A otra vez.

### Caso 05 — QR ajeno y ficha inexistente — CA2

1. Escanear QR Z y comprobar el mensaje.
2. Pulsar **VOLVER A ESCANEAR** y escanear QR X.

**Esperado en ambos:** `Este código no está asociado a ninguna ficha registrada.`
El lector no abre un navegador externo ni presenta el caso como falta de conexión.

### Caso 06 — Sin conexión y recuperación — CA3

1. Con red, dejar cargada la app y abierto el lector.
2. Activar modo avión y comprobar además que Wi-Fi y datos móviles estén desactivados.
3. Escanear QR A.
4. Volver a activar la Wi-Fi de QA y esperar a que se conecte.
5. Pulsar **REINTENTAR**, sin leer otra vez el QR.

**Esperado:** sin red aparece `Conéctate a internet para acceder a esta ficha.`; al recuperar la
conexión, abre A. No se ofrece una ficha descargada: esta entrega usa la alternativa de aviso prevista en CA3.

En Expo Go o development client, mantener la app cargada durante el corte; no recargar ni cerrarla
completamente, porque también perdería acceso al servidor de desarrollo. Recuperar solo datos móviles
no basta para llegar a la API privada del PC: hay que volver a la Wi-Fi de QA.

### Caso 07 — API inaccesible con Wi-Fi activa

1. Mantener Wi-Fi y servidor de desarrollo disponibles.
2. Yo provoco una indisponibilidad controlada solo en la API de QA.
3. Escanear A y esperar la respuesta o el límite de la petición, configurado en 10 segundos.
4. Yo restauro la API; pulsar **REINTENTAR**.

**Esperado:** `No pudimos cargar la ficha. Inténtalo de nuevo.`; sin espera indefinida ni mensaje de
QR desconocido. Tras la recuperación abre A. Anotamos el tiempo observado sin exigir precisión al segundo.

### Caso 08 — Segundo plano, bloqueo y linterna

1. Abrir el lector, encender la linterna y cambiar a otra app.
2. Volver a Orquídea y comprobar que la linterna quedó apagada y el lector puede seguir funcionando.
3. Repetir bloqueando y desbloqueando el teléfono.
4. Si podemos mantener una consulta pendiente, cambiar de app durante esa consulta y regresar.

**Esperado:** no se mantiene la linterna al salir, la vista de cámara se pausa fuera del lector y una
respuesta antigua no abre una ficha inesperadamente. Si se interrumpió una consulta, debe poder reintentarse
o volver a escanear. El indicador de cámara del sistema puede tardar en desaparecer; registramos lo observado.

### Caso 09 — Cancelar una consulta pendiente

1. Yo preparo una respuesta demorada en QA para que se vea **Buscando ficha…**.
2. Escanear A y pulsar **Cerrar escáner** antes de recibir la respuesta.
3. Esperar a que la respuesta demorada termine.
4. Abrir nuevamente el lector y escanear B.

**Esperado:** A no se abre después de cancelar; B resuelve normalmente. Si no logramos observar una
consulta pendiente, dejamos este caso pendiente y no lo marcamos aprobado por cerrar una consulta ya terminada.

### Caso 10 — Datos actualizados con el mismo QR

1. Consultar A y volver al lector.
2. Yo modifico un dato identificable de la ficha de QA, conservando su UUID.
3. Escanear el mismo PNG A y comparar el dato.

**Esperado:** aparecen los datos actualizados sin generar otro QR. Si probamos una fotografía nueva,
verificamos también su URL y carga; una foto que no carga se registra separadamente del resultado de la ficha.

### Caso 11 — Pantalla, impresión y luz

1. Escanear A desde la pantalla con iluminación normal, ajustando distancia y evitando reflejos.
2. Repetir con una impresión que conserve los márgenes blancos y las proporciones del PNG.
3. Repetir con poca luz y probar encender/apagar la linterna.

**Esperado:** lectura utilizable y controles operables. Registrar tamaño impreso, distancia aproximada
y condiciones que funcionaron; no extrapolar esas medidas a todas las cámaras o placas.

### Caso 12 — Accesibilidad y regresión

1. Probar tema claro y oscuro; aumentar el tamaño del texto desde el sistema.
2. Activar TalkBack en Android o VoiceOver en iPhone y recorrer título, estado, errores y controles.
3. Revisar que Cerrar, Reintentar y configuración de permisos sigan accesibles.
4. Volver a Inicio, comprobar las cuatro pestañas y abrir una ficha por la lista normal.
5. Con una cuenta autorizada, comprobar que el acceso QR convive con **Crear ficha** en Inicio.
6. En Android, probar el botón/gesto Atrás del sistema; en iOS, el control Volver de la app.

**Esperado:** textos legibles, controles alcanzables, anuncios comprensibles y navegación habitual
conservada. Desactivar el lector de pantalla al terminar si no se va a usar en los siguientes casos.

### Caso 13 — Obtener y compartir el QR desde la app (gestión administrativa)

1. Como visitante o usuario registrado, abrir una ficha: no debe aparecer el panel **Código QR de la ficha**.
2. Iniciar sesión con una cuenta administrativa de QA. Abrir A y bajar al panel.
3. Pulsar **VER CÓDIGO QR**: debe aparecer la imagen sin abrir todavía un destino de envío.
4. Pulsar **GUARDAR O COMPARTIR QR**. Cancelar el menú del sistema: el QR debe seguir visible, sin
   aviso de error ni afirmación de que se guardó.
5. Abrir el menú de nuevo y guardar el PNG en un destino disponible. En iOS, probar **Guardar en
   Archivos**. En Android, registrar el destino realmente disponible en ese dispositivo.
6. Comprobar que el archivo guardado es PNG y conserva los márgenes blancos. Mostrarlo en otro
   dispositivo y leerlo con el escáner de Terravia: debe abrir la ficha A, no B.
7. Repetir con la segunda ficha y con superadministrador. Verificar tema claro y oscuro.
8. Si la descarga falla por red, reintentar. Para 401/403/404 usar una sesión o dato de QA controlado;
   comprobar que no se comparte una respuesta fallida como imagen.

**Esperado:** descarga autorizada del PNG original y elección explícita del destino. El selector no
garantiza guardado: solo se registra como exportación efectiva tras comprobar el archivo en el destino.
No solicitar permisos de cámara o fototeca para descargar/compartir. No guardar credenciales en las
evidencias ni en el PNG. Este caso amplía la gestión administrativa pedida durante la sesión HU11.

## 6. Qué me comunicas si algo falla

Puedes usar este formato:

```text
Caso: IOS-03
Equipo y sistema: ...
Modo: Expo Go / compilación propia, versión ...
Acción: escaneé A desde la pantalla del PC
Esperado: abrir la ficha A con su foto
Observado: ...
¿La API abre desde el teléfono?: sí / no / no comprobado
¿Se repite?: siempre / a veces / una vez
```

Si hay un error en pantalla, copia su texto literal o adjunta una captura en el chat. Yo revisaré los
registros de API y desarrollo junto con lo que ocurrió en el dispositivo.

Para orientar la revisión:

- **No carga el proyecto:** comprobar versión de Expo Go, cuenta en iPhone, Wi-Fi y puerto de desarrollo.
- **La API no abre desde el teléfono:** comprobar IP, servicio, firewall y aislamiento de la Wi-Fi.
- **La API abre en el navegador, pero falla en la app:** comprobar URL incorporada al bundle, recarga,
  permiso de red local y política de red de la compilación.
- **Abre la ficha sin foto:** revisar `urlFoto` y almacenamiento, además del detalle público.
- **Vista de cámara negra:** comprobar permiso de la app anfitriona, regreso a primer plano y versión instalada.
- **A funciona y B no:** contrastar payload, UUID y existencia de B en esa misma API.
- **Expo conecta mediante túnel pero la API no:** el túnel del servidor de desarrollo no publica la API
  ni el almacenamiento local; su accesibilidad se comprueba por separado.

## 7. Registro y cierre de la sesión

Copiamos esta ficha una vez por plataforma y por modo de ejecución si usamos Expo Go y compilación propia:

```text
Fecha:
Plataforma y modelo:
Versión del sistema:
Modo y versión de la aplicación:
Versión del código frontend/backend:
API utilizada (sin credenciales):
UUID A y B de QA:

01 Entrada pública: pendiente
02 Permisos: pendiente
03 Fichas A/B: pendiente
04 Repetición y cierre: pendiente
05 QR Z/X: pendiente
06 Sin red y recuperación: pendiente
07 API inaccesible: pendiente
08 Segundo plano y linterna: pendiente
09 Cancelación pendiente: pendiente
10 Datos actualizados: pendiente
11 Pantalla/impresión/luz: pendiente
12 Accesibilidad/regresión: pendiente
13 Obtener/guardar/compartir QR administrativo: pendiente

Por cada caso: aprobado / fallido / pendiente, observación y evidencia.
Correcciones necesarias:
Casos a repetir tras corregir:
```

Yo incorporaré los resultados observados a [validation.md](validation.md). CA1, CA2 y CA3 deben quedar
acreditados por separado en Android e iOS. Si falta una compilación propia, una muestra impresa o un
caso controlado, se deja indicado; la validación de lógica y los bundles ya generados no acreditan por sí
solos los permisos, la lectura óptica o el comportamiento de una instalación distribuida.
