# HU11 — Preparación y evidencia

## Alcance de plataformas

Objetivos de esta historia: **Android e iOS**. Web queda fuera de alcance y no se contará como
plataforma implementada o validada para HU11. Las pruebas pendientes deben registrar por separado
resultados Android e iOS; la configuración web genérica de la aplicación no altera este alcance.

## Registro inicial — 17 de octubre de 2026

| Dato | Estado |
|---|---|
| Rama de trabajo | `feature/hu11-qr` |
| Rama base | `origin/dev` |
| Commit base | `e9728aa` |
| Worktree HU11 | `revision-orquidea-mobile-hu11` |
| Worktree original | Conservado en `revision-orquidea-mobile` sobre `feature/hu17-announcements` |
| Árbol de trabajo HU11 | Limpio al iniciar, salvo este registro |
| Node instalado | `24.15.0`; el proyecto fija Node 22 en `.nvmrc` |
| Gestor Node 22 | No se encontró `nvm` en PATH |
| Dependencias npm en este worktree | Instaladas localmente desde `package-lock.json`, incluidas `expo-camera` y `expo-network` |
| Archivo `.env.local` en el worktree | No existe |
| URL en el checkout original | Configurada como `localhost:8080`; solo sirve para el mismo PC |
| API y RustFS locales | No responden; requieren el backend y Docker operativos |
| ADB / dispositivo Android | `adb` no está disponible en PATH; teléfono aún no validado |

No se incluyeron valores de `.env.local`, secretos, tokens ni datos personales. La URL local anterior
se registra solo como hallazgo de configuración y aún no se ha copiado a este worktree.

## Resultado de esta etapa

- Worktree limpio de HU11 creado desde `origin/dev`.
- La rama original `feature/hu17-announcements` y sus cambios se conservaron intactos.
- La preparación de Git está lista. La comprobación integral del entorno queda pendiente de disponer
  de Node 22, dependencias npm, una API accesible desde el teléfono y un Android para validación.

## Implementación local iniciada

- Se incorporó una pantalla de escaneo QR con solicitud de permiso contextual, cámara trasera y lectura solo de QR.
- El parser acepta únicamente `orquideamobileapp://species/{uuid}`; pruebas unitarias: 7 aprobadas.
- El escáner abre la ficha con la consulta pública existente y distingue QR inválido/no registrado, sin conexión y error de servidor.
- Se añadió entrada directa en Inicio y en el menú lateral.
- Cada escaneo consulta el backend con clave de caché aislada por sesión/intento, límite de 10 segundos, sin reintento automático; valida el UUID de respuesta y solo entonces precarga el detalle normal y navega.
- La lectura se pausa al perder foco o al dejar la app en segundo plano; la consulta se cancela al salir.
- TypeScript, ESLint focalizado y Prettier pasan localmente.
- No se probó el flujo en dispositivo: Android/ADB no disponible, falta `.env.local` y la API no está levantada.

## Validación de implementación — 17 de octubre de 2026

- `tsc --noEmit`: aprobado.
- ESLint focalizado sobre archivos de la implementación: aprobado. El lint completo del repositorio no se completó; se interrumpió por tardar más de lo razonable sin producir salida.
- `format:check`: aprobado.
- Pruebas focalizadas de contrato/parser, resolución, conectividad y cliente HTTP: 4 suites, 32/32 pruebas aprobadas.
- Suite completa: 29 suites aprobadas y 1 suite HU8 fallida durante esa ejecución (228/230 pruebas). Al repetir aisladamente `species-form.test.tsx`, pasó 7/7; la suite emite advertencias de configuración de `act(...)` y handles abiertos. Se registra como resultado inestable del entorno/suite existente, no como HU11 validada ni como fallo reproducible de HU11.
- Resolución pública con API real, compilación y permisos de cámara en teléfono: pendientes.
- El detector de conectividad se centralizó en `useNetworkStatus`; el flujo refresca su estado antes
  de resolver/reintentar y al volver a primer plano. El ADR 0013 registra el contrato y los límites.
- El hook cubre conexión inicial, refresco manual, estado desconocido, limpieza de listener y que una
  lectura inicial tardía no sobrescriba un evento de red posterior; además distingue `NONE` de un
  tipo `UNKNOWN` que también pueda venir acompañado de `isConnected: false`.
- La pantalla incorpora roles/etiquetas para progreso, errores, cierre y linterna, y anuncios accesibles
  para cambios de estado. Los textos y superficies usan colores del tema; el marco de cámara permanece
  oscuro con guía blanca por contraste. Lector de pantalla, tamaño de texto y contraste aún requieren
  revisión en dispositivo.
- Los intentos de resolución usan una generación para descartar respuestas después de reintentar,
  cerrar, perder foco o pasar a segundo plano. Si se interrumpe una consulta al salir del escáner, al
  volver se conserva el UUID y se ofrece un error recuperable; una respuesta tardía no navega ni
  sobrescribe el estado actual.
- Tras este ajuste, TypeScript, ESLint focalizado y las 4 suites focalizadas volvieron a pasar
  (32/32 pruebas). Jest necesitó ubicar su caché dentro de `node_modules` porque el directorio
  temporal predeterminado de Windows denegó la operación de escritura.

## Validación pendiente

- Repetir comprobaciones con la versión Node 22 declarada por el proyecto.
- Probar permiso concedido/denegado, escaneo válido e inválido y pérdida de red en iPhone y Android físicos cuando se disponga de ambos.
- Validar permisos y configuración nativa en una compilación propia. La apertura de fichas desde cámara externa/app cerrada queda fuera del alcance del lector interno actual.
- Probar consulta real contra la API backend cuando sus pruebas y servicios estén disponibles.

## Actualización de estado — 19 de octubre de 2026

- El usuario confirmó que traerá un iPhone y un Android para la sesión de pruebas posterior; por ahora no se ejecutaron pruebas físicas y no se da por validada ninguna de las dos plataformas objetivo.
- Los fixtures de contrato QR de backend y frontend se compararon y quedaron idénticos byte por byte.
- `npm run typecheck`: aprobado.
- `npx eslint src --ext .ts,.tsx`: aprobado para todo `src`.
- `npx prettier --check .`: aprobado.
- Regresión completa `npx jest --runInBand --cacheDirectory node_modules/.cache/jest-hu11`: **31 suites y 236 pruebas aprobadas**. Jest avisó que el proceso no finalizó inmediatamente por handles asíncronos abiertos en el conjunto de pruebas; no hubo suites ni pruebas fallidas.
- Este resultado completo supersede el resultado anterior inestable de HU8: en la ejecución más reciente todas las suites pasaron. Se mantienen las advertencias existentes de `act(...)` como deuda del entorno de pruebas, no como fallo de HU11.
- No se hizo commit ni push. La validación de integración con API/PNG reales sigue condicionada a ejecutar el backend.

## Sesión física iOS — 19 de octubre de 2026 (en curso)

- Dispositivo: iPhone; modelo y versión de iOS pendientes de registrar. Ejecución en Expo Go.
- El usuario abrió Terravia y confirmó que el escáner está disponible y muestra la cámara.
- Primera lectura del QR A generado por la API local de QA: el usuario confirmó que abrió la ficha esperada, «Azulejo QA A», UUID `20bbe26b-40c5-4beb-9a0e-e00709ae2256`.
- Hallazgo IOS-UI-01, pendiente de corrección: el usuario reporta que el botón para volver desde el detalle tiene poca visibilidad en modo oscuro. Revisar contraste y superficie del control; repetir la comprobación en el mismo dispositivo tras corregir. No se ha determinado todavía la causa.
- Siguiente comprobación: regresar al escáner y leer QR B, «Orquídea QA B», UUID `38a3b452-224e-4dd5-b803-fda4b269218d`, para verificar reactivación de cámara y ausencia de datos cruzados.
- La prueba inicial no acredita aún el caso completo A/B, el resto de casos iOS ni la plataforma Android.

### Evidencia A/B y disposición visual

- El usuario aportó tres capturas: detalle B («Orquídea QA B»), escáner con cámara activa y detalle A («Azulejo QA A»). Los nombres y datos taxonómicos visibles corresponden a cada ficha; el recorrido A → escáner → B está confirmado por el intercambio y las capturas. La consulta real y el regreso a la cámara funcionan en esta sesión.
- Ambas fichas tienen la misma ilustración provisional, porque así se prepararon los datos de QA. No se considera un fallo de carga; queda pendiente comprobar imágenes distintas para completar esa parte del caso 03.
- Hallazgo IOS-UI-01 confirmado visualmente: flecha oscura sobre superficie oscura en el botón de volver del detalle; el control apenas se distingue.
- Hallazgo IOS-UI-02, pendiente de corrección: el título «Escanear código QR» invade el área superior reservada a hora, indicadores y enlace del sistema en el iPhone. Revisar espaciado y área segura; volver a probar con los ajustes de texto de este dispositivo, todavía no registrados.
- El control circular azul con engranaje aparece sobre las pantallas. Su origen no está confirmado; no se atribuye por ahora a un componente de Terravia.
- Siguiente comprobación: linterna y recuperación de cámara tras enviar la app a segundo plano. Los resultados siguen pendientes hasta confirmación del usuario.

### Linterna y comprobación de segundo plano

- El usuario confirmó que la linterna encendió correctamente en el iPhone. El apagado no se confirmó explícitamente.
- El usuario indicó «Fui a inicio de sesión y todo bien». Falta aclarar si se refiere al inicio del iPhone o a la pantalla de inicio de sesión de Terravia. No se da todavía por verificada la recuperación de cámara ni una nueva lectura tras segundo plano.
- Aclaración posterior del usuario: sí salió al inicio del iPhone y regresó a Terravia con la cámara funcionando. Recuperación visual tras segundo plano confirmada; una nueva lectura posterior no se confirmó de forma explícita.
- Siguiente comprobación: leer desde el escáner interno el QR de desarrollo de Expo, ajeno al contrato de ficha. Debe mostrar «Este código no está asociado a ninguna ficha registrada.» y permitir volver a escanear sin abrir un enlace externo.

### Encabezado de Inicio — revisión pendiente con sesión administrativa

- Hallazgo IOS-UI-03: el usuario advierte posible choque visual entre el acceso de cámara/QR y el «+» de crear ficha en Inicio. La captura solo muestra la cámara; todavía no acredita una superposición cuando aparecen ambas acciones.
- Inspección local: las acciones están en una fila con separación de 8 puntos; el «+» se muestra mediante `species:create` únicamente a admin/superadmin. No ocupan la misma posición absoluta, pero falta comprobar distribución, áreas táctiles y claridad de ambos controles en el iPhone con sesión administrativa.
- Acción pendiente: probar Inicio como admin/superadmin en claro/oscuro y con texto ampliado; ajustar la disposición si quedan apretados o se solapan. Mantener acceso público al escáner y acceso restringido a crear ficha.

## Ampliación local — obtener y compartir QR desde la app (19 de octubre de 2026)

- Solicitada expresamente por el usuario durante la sesión física. Se añadió un panel al detalle de
  ficha, visible solo mediante `species:download-qr` para admin/superadmin. No se añadieron rutas ni
  cambios al backend.
- El PNG se obtiene bajo demanda desde la API autenticada, se verifica su firma, se muestra la vista
  previa y se ofrece el selector nativo para guardar o compartir. La descarga se cancela al desmontar;
  cancelar el selector no se anuncia como error ni como guardado exitoso.
- Se incorporó `expo-sharing` compatible con SDK 57 y se documentó en ADR 0014. No se habilitan
  extensiones para recibir archivos ni permisos de fototeca.
- TypeScript, `npm run lint`, `npm run format:check` y `git diff --check`: aprobados.
- Regresión completa tras el cambio: **33 suites y 258 pruebas aprobadas**, sin pruebas fallidas.
  Incluye roles permitidos/ocultos, descarga PNG, reintento, errores 401/403/404, disponibilidad de
  compartir, cancelación al desmontar, firma binaria e interceptores de sesión. Persisten advertencias
  de `act(...)` y handles abiertos en el conjunto de pruebas; no equivalen a validación física.
- Verificación HTTP real de QA: la cuenta administrativa local inicia sesión y el endpoint QR de A
  responde 200, `image/png`, 1447 bytes. No se registran credenciales ni tokens en este documento.
- Durante la integración se detectó que solicitar exclusivamente `image/png` impedía negociar los
  errores JSON del backend (respondía 500). Se ajustó el cliente a `Accept: image/png, application/json`.
  Verificado contra la API real tras el ajuste: ficha existente → 200 PNG; ficha inexistente → 404 JSON;
  petición sin sesión → 401 JSON. La firma PNG se sigue validando antes de guardar un éxito.
- Exportación con bytecode Hermes para Android e iOS: aprobada. El primer intento falló por permisos
  de escritura del directorio temporal aislado; la repetición fuera del aislamiento completó ambas
  plataformas. Esto verifica compilación, no reemplaza la prueba del selector nativo en teléfono.
- El usuario confirmó que en el iPhone el flujo de **GUARDAR O COMPARTIR QR** y el guardado en Archivos
  funcionaron correctamente. La lectura del PNG exportado desde otra pantalla y la comprobación de los
  roles usuario registrado y superadministrador siguen pendientes. Tras cerrar sesión, el usuario
  confirmó que **Editar**, **Eliminar** y **Código QR** dejaron de aparecer en la ficha; esto confirma
  el estado esperado para visitante. Tras iniciar sesión de nuevo como administradora, confirmó que
  las opciones volvieron a aparecer, lo que valida el ciclo visitante → administradora en iOS.
  Android y compilación propia también siguen pendientes de validación física.
- Sin commit ni push, conforme a la instrucción del usuario.

## Reporte posterior y plan de mejoras — 19 de octubre de 2026

- El usuario confirmó que inició sesión en Terravia y después reportó que, al cargar la aplicación,
  no encontró las opciones para obtener/compartir QR. Se registra como HU11-M01 / P0: recorrido
  administrativo no validado en teléfono. La causa no está determinada; no se atribuye a caché ni al
  rol sin verificar. Que el panel exista en el código y pase pruebas aisladas no resuelve el reporte.
- Se preparó [plan-mejoras.md](plan-mejoras.md) con seis partes, objetivos, tareas, entregables y
  criterios de cierre. El plan añade la prueba de presencia del panel en el detalle completo y mantiene
  los hallazgos visuales, la comprobación Android/iOS y los casos aún pendientes.
- En esta etapa se documenta el plan; no se declara corregida la ausencia del panel ni se han
  implementado las nuevas mejoras visuales. Sin commit ni push.
