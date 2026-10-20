# HU11 — Contrato compartido

## Plataformas objetivo

HU11 se implementa y valida para **Android e iOS**. La versión web no forma parte del alcance ni de
los criterios de aceptación de esta historia; no se declara compatible el escáner en navegador.
Esta delimitación no cambia la configuración web general que el resto de la aplicación pudiera usar.

El payload de cada QR está definido en [`qr-contract.json`](qr-contract.json). Su copia del backend debe
ser idéntica; las pruebas del parser de esta app recorren los casos válidos e inválidos de ese fixture.

Formato actual: `orquideamobileapp://species/{uuid}`. La app no abre URLs arbitrarias: valida el
esquema, consulta el endpoint público de la ficha y solo navega si la respuesta fresca coincide con el
UUID escaneado. Sin red, el QR válido conserva el UUID para que la persona pueda reintentar.

La generación PNG administrativa está implementada en el backend. La validación en dispositivo,
Android/iOS y conectividad real continúa pendiente; consultar [validation.md](validation.md).

Para la sesión con teléfonos, seguir la [guía paso a paso de pruebas Android/iOS](guia-pruebas-dispositivos.md).

Tras la sesión inicial del iPhone, consultar el [plan de mejoras y cierre](plan-mejoras.md). Prioriza
resolver las opciones QR no visibles, contraste, área segura y validación de guardado/compartición.

## Obtener el QR desde la app

Con una sesión de administrador o superadministrador, abrir una ficha y bajar hasta **Código QR de la
ficha**. **VER CÓDIGO QR** obtiene el PNG de la API y muestra su vista previa. **GUARDAR O COMPARTIR QR**
abre el menú del sistema: en iOS permite, entre otros destinos, guardar en Archivos; en Android los
destinos dependen de las aplicaciones instaladas. No se necesita acceso a la fototeca para este flujo.
El menú no envía ni guarda nada hasta que el usuario elige un destino. Cancelarlo no equivale a un error
ni muestra una confirmación de guardado.

El archivo se conserva en caché temporal del dispositivo para previsualizar/compartir; el guardado
duradero depende del destino seleccionado. La lectura interna sigue disponible sin sesión. Ver
[ADR 0016](../decisions/0016-exportar-qr-desde-la-app.md).
