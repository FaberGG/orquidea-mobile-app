const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_CMAKE_VERSION = '3.31.6';

/**
 * Config plugin to avoid Windows' MAX_PATH (260 characters) limit when
 * building native C++ code (appmodules, Reanimated, Screens, Worklets...).
 *
 * Ninja embeds the absolute source path in object file names
 * (`.../C_/dev/.../node_modules/...cpp.o`), so moving the `.cxx` folder is not
 * enough. The fix is a long-path-aware ninja (>= 1.12), which ships with the
 * Android SDK's newer CMake packages (the default, 3.22.1, ships 1.10.2).
 *
 * It sets `cmake.dir` in `android/local.properties`, which AGP reads for every
 * module before evaluation (setting `externalNativeBuild.cmake.version` from the
 * root build.gradle fails: "It is too late to set version").
 *
 * Requirements: `LongPathsEnabled=1` in Windows and the chosen CMake version
 * installed from the Android Studio SDK Manager (SDK Tools > CMake).
 *
 * Optional: ["./plugins/withShortCxxPath", { "cmakeVersion": "3.31.6" }]
 */
function getAndroidSdkDir() {
  return (
    process.env.ANDROID_HOME ??
    process.env.ANDROID_SDK_ROOT ??
    path.join(
      process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local'),
      'Android',
      'Sdk',
    )
  );
}

module.exports = function withShortCxxPath(config, props = {}) {
  const cmakeVersion = props.cmakeVersion ?? DEFAULT_CMAKE_VERSION;

  return withDangerousMod(config, [
    'android',
    (config) => {
      if (process.platform !== 'win32') {
        return config;
      }

      const cmakeDir = path.join(getAndroidSdkDir(), 'cmake', cmakeVersion);
      if (!fs.existsSync(cmakeDir)) {
        console.warn(
          `[withShortCxxPath] CMake ${cmakeVersion} not found at ${cmakeDir}. ` +
            'Install it from Android Studio > SDK Manager > SDK Tools > CMake.',
        );
        return config;
      }

      const propsFile = path.join(config.modRequest.platformProjectRoot, 'local.properties');
      const current = fs.existsSync(propsFile) ? fs.readFileSync(propsFile, 'utf8') : '';
      const lines = current.split(/\r?\n/).filter((line) => line && !line.startsWith('cmake.dir='));
      lines.push(`cmake.dir=${cmakeDir.replace(/\\/g, '/')}`);
      fs.writeFileSync(propsFile, `${lines.join('\n')}\n`);

      return config;
    },
  ]);
};
