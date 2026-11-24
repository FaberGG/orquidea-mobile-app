#!/usr/bin/env node
/**
 * Genera el mapa base sin conexión de Popayán (`popayan-z14.pmtiles`, esquema OpenMapTiles) con Planetiler
 * y lo verifica con go-pmtiles. Ambas herramientas corren en Docker con versiones fijas, así que el único
 * requisito es Docker. Ver scripts/maps/README.md.
 *
 * Uso:
 *   npm run maps:build                       # usa ~/orquidea-mapas como carpeta de trabajo
 *   npm run maps:build -- --work-dir C:\mapas
 *   npm run maps:build -- --refresh          # descarga de nuevo el extracto de OpenStreetMap
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/** Recuadro urbano de Popayán acordado (oeste, sur, este, norte; WGS84). Incluye el humedal. */
const BOUNDS = '-76.706028,2.401735,-76.535912,2.521901';
const MAX_ZOOM = 14;
const OUTPUT_NAME = `popayan-z${MAX_ZOOM}.pmtiles`;
/** Extracto de Geofabrik que Planetiler descarga con `--area`. */
const AREA = 'colombia';
const PLANETILER_IMAGE = 'ghcr.io/onthegomap/planetiler:0.10.2';
const PMTILES_IMAGE = 'protomaps/go-pmtiles:v1.31.2';
const JAVA_MEMORY = '-Xmx4g';

function parseArgs(argv) {
  const options = { workDir: path.join(os.homedir(), 'orquidea-mapas'), refresh: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--refresh') options.refresh = true;
    else if (arg === '--work-dir') options.workDir = path.resolve(argv[++index] ?? '');
    else if (arg === '--help' || arg === '-h') options.help = true;
    else fail(`Opción desconocida: ${arg}. Usa --help.`);
  }
  return options;
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
  });
  if (result.error) fail(`No se pudo ejecutar ${command}: ${result.error.message}`);
  return result;
}

function docker(args, options) {
  return run('docker', args, options);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]);
    return;
  }

  if (docker(['info'], { capture: true }).status !== 0) {
    fail('Docker no está disponible. Instala Docker Desktop y asegúrate de que esté abierto.');
  }

  const dataDir = path.join(options.workDir, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const mount = `${dataDir}:/data`;

  if (options.refresh) {
    const sourcesDir = path.join(dataDir, 'sources');
    for (const file of fs.existsSync(sourcesDir) ? fs.readdirSync(sourcesDir) : []) {
      if (file.endsWith('.osm.pbf')) fs.rmSync(path.join(sourcesDir, file));
    }
    console.log('Se descargará de nuevo el extracto de OpenStreetMap.');
  }

  console.log(`\n▶ Generando ${OUTPUT_NAME} en ${dataDir}`);
  console.log(`  bbox ${BOUNDS} · zoom 0–${MAX_ZOOM} · ${PLANETILER_IMAGE}\n`);
  const build = docker([
    'run',
    '--rm',
    '-e',
    `JAVA_TOOL_OPTIONS=${JAVA_MEMORY}`,
    '-v',
    mount,
    PLANETILER_IMAGE,
    '--download',
    `--area=${AREA}`,
    `--bounds=${BOUNDS}`,
    `--maxzoom=${MAX_ZOOM}`,
    `--output=/data/${OUTPUT_NAME}`,
    '--force',
  ]);
  if (build.status !== 0) fail(`Planetiler terminó con código ${build.status}.`);

  console.log(`\n▶ Verificando ${OUTPUT_NAME} con ${PMTILES_IMAGE}`);
  const verify = docker([
    'run',
    '--rm',
    '-v',
    mount,
    PMTILES_IMAGE,
    'verify',
    `/data/${OUTPUT_NAME}`,
  ]);
  if (verify.status !== 0) fail('pmtiles verify encontró errores en el archivo.');

  const show = docker(['run', '--rm', '-v', mount, PMTILES_IMAGE, 'show', `/data/${OUTPUT_NAME}`], {
    capture: true,
  });
  if (show.status !== 0) fail(`pmtiles show falló:\n${show.stderr}`);
  const field = (name) =>
    show.stdout.match(new RegExp(`^${name}:?\\s+(.+)$`, 'm'))?.[1]?.trim() ?? 'desconocido';

  const outputPath = path.join(dataDir, OUTPUT_NAME);
  const sizeMb = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`
✔ Mapa offline listo
  Archivo:            ${outputPath}
  Tamaño:             ${sizeMb} MB
  Zoom:               ${field('min zoom')} – ${field('max zoom')}
  Mosaicos:           ${field('addressed tiles count')}
  Fecha de los datos: ${field('planetiler:osm:osmosisreplicationtime')} (OpenStreetMap)
  Generado:           ${field('planetiler:buildtime')} con Planetiler ${field('planetiler:version')}

Registra la fecha de los datos en scripts/maps/README.md al entregar el archivo.`);
}

main();
