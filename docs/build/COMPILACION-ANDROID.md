# Compilación Android

Cómo compilar la app para Android en Windows: la **build de desarrollo** (para programar con Metro) y el
**APK standalone** (instalable, sin Metro, para pruebas y demostraciones).

La carpeta `android/` **no se versiona**: se genera con Continuous Native Generation (CNG) a partir de
`app.json` y de los config plugins. Nunca la edites a mano; cualquier cambio nativo va en `app.json` o en
[`plugins/`](../../plugins/README.md).

## 1. Requisitos

| Herramienta | Versión probada | Notas |
|---|---|---|
| Node.js | 22.x | `node -v` |
| JDK | 17 o superior (probado con 22) | `java -version` |
| Android Studio + Android SDK | — | Define `ANDROID_HOME` (por defecto `%LOCALAPPDATA%\Android\Sdk`) |
| CMake del SDK | **3.31.6** | Android Studio → SDK Manager → SDK Tools → marca _Show Package Details_ → CMake 3.31.6 |
| Rutas largas en Windows | `LongPathsEnabled = 1` | Ver abajo |
| `adb` | del SDK (`platform-tools`) | Para instalar en un dispositivo o emulador |

Habilitar rutas largas (PowerShell **como administrador**, una sola vez; reinicia la terminal después):

```powershell
New-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force
```

Comprobar que CMake 3.31.6 trae un ninja compatible con rutas largas (debe ser ≥ 1.12):

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\cmake\3.31.6\bin\ninja.exe" --version   # 1.12.1
```

### Por qué CMake 3.31.6 (error `Filename longer than 260 characters`)

Al compilar el C++ de `appmodules`, Reanimated, Screens, etc., Ninja mete la ruta absoluta del código fuente
dentro del nombre de cada archivo objeto, por ejemplo:

```
rnreanimated_autolinked_build/CMakeFiles/react_codegen_rnreanimated.dir/C_/dev/Repositorios/Proyecto-Humedal-Orquidea/orquidea-mobile-app/node_modules/react-native-reanimated/.../ComponentDescriptors.cpp.o
```

Con la ruta de este repositorio eso supera los 260 caracteres. CMake 3.22.1 (el predeterminado del SDK)
incluye ninja 1.10.2, que no soporta rutas largas; ninja 1.12+ sí, siempre que Windows tenga
`LongPathsEnabled = 1`.

El plugin [`plugins/withShortCxxPath.js`](../../plugins/README.md) (registrado en `app.json`) escribe
`cmake.dir` en `android/local.properties` para que **todos** los módulos usen CMake 3.31.6. Si esa versión no
está instalada, el prebuild muestra un aviso `[withShortCxxPath]` y la compilación vuelve a fallar con el error
anterior.

## 2. Variables de entorno

La app lee `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_APP_ENV` (ver [`.env.example`](../../.env.example)). Copia
`.env.example` a `.env.local` y ajusta los valores.

- Los valores `EXPO_PUBLIC_*` se **incrustan en el JavaScript al compilar**. En el APK standalone no se pueden
  cambiar después: si cambias `.env.local`, vuelve a compilar.
- La URL debe ser alcanzable **desde el teléfono**: `localhost` no sirve. En el emulador usa `10.0.2.2`; en un
  dispositivo físico, la IP de tu PC en la misma red (o el servidor desplegado).
- No pongas secretos ahí: quedan visibles dentro del APK.

## 3. Build de desarrollo

Usa `expo-dev-client`; el JavaScript se sirve desde Metro, con recarga en caliente.

```powershell
npx expo run:android          # o: npm run android
```

La primera vez genera `android/` (prebuild), compila (varios minutos) e instala en el dispositivo o emulador
conectado. Después basta con `npx expo start` mientras no cambien dependencias nativas, `app.json` ni los
plugins.

Regenerar `android/` desde cero (tras cambiar `app.json`, un plugin o una dependencia nativa):

```powershell
npx expo prebuild --platform android --clean
```

## 4. APK standalone

Un APK **release** lleva el JavaScript empaquetado dentro: se instala y funciona sin Metro ni PC.

### 4.1 Antes de compilar: tráfico HTTP

Android bloquea en las builds release el tráfico HTTP sin cifrar (`http://`). La build de desarrollo lo
permite, así que algo que funciona en desarrollo puede fallar en el APK con errores de red.

[`app.config.js`](../../app.config.js) lo resuelve según `EXPO_PUBLIC_APP_ENV` con `expo-build-properties`
(`android.usesCleartextTraffic`):

| `EXPO_PUBLIC_APP_ENV` | HTTP (`http://`) | Cuándo |
|---|---|---|
| `development` / `staging` (o sin definir) | Permitido | Builds de desarrollo y APK de prueba contra un backend local |
| `production` | **Bloqueado**: la API debe ir por HTTPS | Perfil `production` de EAS (lo fija `eas.json`) |

- El valor se lee **al generar `android/`** (prebuild). En local sale de `.env.local` o de la terminal. Si
  lo cambias, regenera con `npx expo prebuild --platform android --clean`.
- Comprobar qué se aplicará antes de compilar: `npx expo config --json` (busca `expo-build-properties`), o
  en `android/app/src/main/AndroidManifest.xml` el atributo `android:usesCleartextTraffic`.
- Para compilar en local un APK con la configuración de producción (PowerShell):
  `$env:EXPO_PUBLIC_APP_ENV='production'; npx expo prebuild --platform android --clean`.

### 4.2 Opción A: compilar en local (Gradle)

```powershell
npx expo prebuild --platform android      # solo si android/ no existe o cambió la configuración
cd android
.\gradlew.bat app:assembleRelease
```

El APK queda en:

```
android/app/build/outputs/apk/release/app-release.apk
```

Instalarlo en un dispositivo conectado por USB (con depuración USB activa) o en un emulador:

```powershell
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

O compilar e instalar en un paso: `npx expo run:android --variant release`.

Notas:

- **Firma**: la plantilla firma el release con `debug.keystore`. Sirve para instalar y probar, **no** para
  publicar en Google Play. Para publicar, usa EAS (opción B), que gestiona la firma.
- **Tamaño**: por defecto incluye las 4 arquitecturas (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`). Para
  un APK más pequeño, solo para teléfonos modernos:
  `.\gradlew.bat app:assembleRelease -PreactNativeArchitectures=arm64-v8a`
  (no funciona en emuladores x86_64).
- Si aparece `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, ya hay instalada una versión firmada con otra clave:
  desinstálala primero (`adb uninstall com.adme0408.terraviadev`).

### 4.3 Opción B: compilar en la nube (EAS Build)

EAS compila en servidores Linux, así que no aplica el límite de rutas de Windows ni hace falta el SDK local.
Requiere una cuenta de Expo con acceso al proyecto (`owner: adme0408` en `app.json`).

```powershell
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Al terminar, EAS muestra un enlace y un QR para descargar el APK. Perfiles en [`eas.json`](../../eas.json):

| Perfil | Resultado | Uso |
|---|---|---|
| `development` | APK con `expo-dev-client` | Desarrollo contra Metro, sin compilar en local |
| `preview` | APK standalone, distribución interna | Pruebas y demostraciones |
| `production` | AAB (formato de Google Play), `versionCode` autoincremental, `EXPO_PUBLIC_APP_ENV=production` (HTTP bloqueado) | Publicación |

`.env.local` está en `.gitignore`, así que **no se sube a EAS**. Define las variables en el entorno de EAS
antes de compilar (o en la web de expo.dev → proyecto → Environment variables):

```powershell
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_URL --value https://api.ejemplo.org --visibility plaintext
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_APP_ENV --value staging --visibility plaintext
```

## 5. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `ninja: error: Stat(...): Filename longer than 260 characters` | ninja 1.10 de CMake 3.22.1 | Instala CMake 3.31.6, verifica `LongPathsEnabled = 1` y ejecuta `npx expo prebuild --platform android --clean` |
| Aviso `[withShortCxxPath] CMake 3.31.6 not found` | Falta esa versión de CMake | Instálala desde el SDK Manager o pasa otra con `{ "cmakeVersion": "x.y.z" }` en `app.json` |
| `It is too late to set version` | `android/` generado con una versión anterior del plugin | `npx expo prebuild --platform android --clean` |
| El APK release se cierra al abrirlo; `adb logcat -b crash` muestra `Failed to create an instance of class androidx.work.impl.WorkDatabase` | R8 (minificación del release) eliminó clases de Room/WorkManager (las trae `react-native-maps`) | Reglas `extraProguardRules` en `app.config.js`; regenera `android/`. Para otros cierres al abrir, revisa `adb logcat -b crash` y agrega la regla `-keep` que corresponda |
| El APK abre pero no carga datos | URL `localhost`, `http://` en una build `production` o variable no definida en EAS | Revisa la sección 2 y la 4.1 |
| Cambié `app.json` o un plugin y no se refleja | `android/` desactualizado | `npx expo prebuild --platform android --clean` |
| Compilación C++ rara tras cambiar de CMake | Caché vieja en `.cxx` | Borra `android\app\.cxx` y `android\app\build`, o `npx expo run:android --no-build-cache` |
