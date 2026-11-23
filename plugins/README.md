# plugins/

Config plugins locales de Expo. Configuran el código nativo generado (`android/`, `ios/`) sin editarlo a mano (Continuous Native Generation). Se registran en `app.json` → `expo.plugins`.

## withShortCxxPath.js

Solo en Windows. Evita el error de Ninja `Filename longer than 260 characters` al compilar el C++ de `appmodules`, Reanimated, Screens, etc.

Ninja 1.10 (incluido en CMake 3.22.1, el predeterminado del SDK) no soporta rutas largas. El plugin escribe `cmake.dir` en `android/local.properties` apuntando a una versión de CMake con ninja ≥ 1.12 (por defecto `3.31.6`).

Requisitos en la máquina:

- `LongPathsEnabled=1` en Windows.
- CMake `3.31.6` instalado desde Android Studio → SDK Manager → SDK Tools → CMake (_Show Package Details_).

Para usar otra versión: `["./plugins/withShortCxxPath", { "cmakeVersion": "x.y.z" }]`.
