/**
 * Dynamic config: Expo CLI reads app.json first and passes it here as `config`.
 * Static configuration lives in app.json. Only environment-dependent settings go here.
 *
 * HTTP traffic (cleartext): Android blocks `http://` in release builds. It is
 * allowed in every build except production (EXPO_PUBLIC_APP_ENV=production), so
 * test APKs can reach a local backend over HTTP while production requires HTTPS.
 * See docs/build/COMPILACION-ANDROID.md §4.1.
 *
 * ProGuard/R8: release builds minify Java/Kotlin. WorkManager (pulled in by
 * react-native-maps) creates its Room database by reflection (`WorkDatabase_Impl`);
 * without these rules R8 strips it and the app crashes on launch with
 * "Failed to create an instance of class androidx.work.impl.WorkDatabase".
 */
const EXTRA_PROGUARD_RULES = `
# Room / WorkManager (react-native-maps)
-keep class * extends androidx.room.RoomDatabase { <init>(); }
-keep class androidx.work.impl.WorkDatabase_Impl { *; }
-keep class androidx.work.** { *; }
`;

module.exports = ({ config }) => {
  const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';

  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: !isProduction,
            extraProguardRules: EXTRA_PROGUARD_RULES,
          },
        },
      ],
    ],
  };
};
