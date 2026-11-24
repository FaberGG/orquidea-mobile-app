/**
 * Dynamic config: Expo CLI reads app.json first and passes it here as `config`.
 * Static configuration lives in app.json. Only environment-dependent settings go here.
 *
 * HTTP traffic (cleartext): Android blocks `http://` in release builds. It is
 * allowed in every build except production (EXPO_PUBLIC_APP_ENV=production), so
 * test APKs can reach a local backend over HTTP while production requires HTTPS.
 * See docs/build/COMPILACION-ANDROID.md §4.1.
 */

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
          },
        },
      ],
    ],
  };
};
