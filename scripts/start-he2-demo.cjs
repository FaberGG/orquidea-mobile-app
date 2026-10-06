/** Inicia la API efímera y Expo con la URL correcta para esta red local. */
const { spawn } = require('node:child_process');
const { networkInterfaces } = require('node:os');
const path = require('node:path');
const { startMockHe2Api } = require('./mock-he2-api.cjs');

function localAddress() {
  if (process.env.HE2_DEMO_HOST) return process.env.HE2_DEMO_HOST;
  const interfaces = networkInterfaces();
  const entries = Object.entries(interfaces).sort(([a], [b]) => {
    const score = (name) => (/wi-?fi|ethernet/i.test(name) ? 0 : 1);
    return score(a) - score(b);
  });
  for (const [, addresses] of entries) {
    const found = addresses?.find(
      (entry) =>
        entry.family === 'IPv4' && !entry.internal && !entry.address.startsWith('169.254.'),
    );
    if (found) return found.address;
  }
  return '127.0.0.1';
}

async function main() {
  const server = await startMockHe2Api();
  const url = `http://${localAddress()}:8080`;
  console.log('\n=== Orquídea · prueba local HE-2 (sin backend ni correos reales) ===');
  console.log(`API de prueba: ${url}`);
  console.log('Superadmin: superadmin@orquidea.test / Prueba123!');
  console.log('Admin:      admin@orquidea.test / Prueba123!');
  console.log('Pulsa w para abrir la app en el navegador o escanea el QR con Expo Go.\n');

  const cli = require.resolve('expo/bin/cli');
  const child = spawn(process.execPath, [cli, 'start', '--lan'], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      EXPO_PUBLIC_API_URL: url,
      EXPO_PUBLIC_APP_ENV: 'development',
      EXPO_NO_TELEMETRY: '1',
    },
    stdio: 'inherit',
  });
  child.once('error', (error) => {
    console.error(error);
    server.close();
    process.exitCode = 1;
  });
  child.once('exit', (code) => {
    server.close();
    process.exitCode = code ?? 1;
  });
}

main().catch((error) => {
  console.error(`No se pudo iniciar la demostración: ${error.message}`);
  process.exitCode = 1;
});
