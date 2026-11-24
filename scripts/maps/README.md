# scripts/maps/ — Mapa base sin conexión

**Responsabilidad:** generar de forma reproducible el mapa base offline de Popayán que se incluye en la app
(`popayan-z14.pmtiles`). Con conexión la app usa OpenFreeMap; sin conexión, este archivo. Ambos usan el esquema
**OpenMapTiles**, así que el mismo estilo sirve para los dos.

| Archivo | Contenido |
|---|---|
| `build-offline-map.cjs` | Genera el PMTiles con Planetiler y lo verifica con go-pmtiles (`npm run maps:build`) |

## Qué genera

| Parámetro | Valor |
|---|---|
| Cobertura | Recuadro urbano de Popayán, incluido el humedal: `-76.706028,2.401735,-76.535912,2.521901` (oeste, sur, este, norte; ~253 km²). Acordado con el equipo; no hace falta el municipio completo |
| Zoom | 0–14 (al acercarse más, MapLibre amplía los mosaicos de z14) |
| Esquema | OpenMapTiles (perfil por defecto de Planetiler) |
| Datos | OpenStreetMap, extracto `colombia` de Geofabrik |
| Tamaño aproximado | 1,3 MB |
| Herramientas | `ghcr.io/onthegomap/planetiler:0.10.2` y `protomaps/go-pmtiles:v1.31.2` (versiones fijas, en Docker) |

## Uso

Requisito único: **Docker Desktop** abierto (~3 GB libres en disco y 8 GB de RAM).

```bash
npm run maps:build                          # carpeta de trabajo: ~/orquidea-mapas
npm run maps:build -- --work-dir C:\mapas   # otra carpeta de trabajo
npm run maps:build -- --refresh             # vuelve a descargar OpenStreetMap (datos más recientes)
```

El script descarga lo que falte (la primera vez, ~2 GB: el extracto de Colombia y los polígonos de agua y
costas), genera `<carpeta>/data/popayan-z14.pmtiles`, ejecuta `pmtiles verify` y muestra el resumen con la
**fecha de los datos**. La carpeta de trabajo queda **fuera del repositorio** a propósito: los datos fuente
pesan gigas y Metro no debe vigilarlos.

Para revisar el resultado, arrastra el archivo a <https://pmtiles.io>.

## Cuándo regenerar

En **cada release** de la app, con `--refresh`, para que el mapa offline no se aleje de OpenFreeMap (que se
actualiza con OpenStreetMap cada semana). También después de corregir datos en OpenStreetMap: los cambios
llegan al extracto de Geofabrik en ~1 día. Si faltan datos clave (sendero, nombre del humedal, calles, río),
se corrigen en <https://www.openstreetmap.org> con el editor iD o con JOSM, nunca en el archivo generado.

Atribución obligatoria en la app: "© OpenMapTiles © OpenStreetMap contributors".

## Versión entregada

| Fecha de entrega | Fecha de los datos (OSM) | Tamaño | Planetiler | Entregado a |
|---|---|---|---|---|
| 2026-11-23 | 2026-11-23T21:21:17Z (Geofabrik `colombia-261123`) | 1,26 MB · 93 mosaicos · z0–14 | 0.10.2 | María (tareas 5 y 6 del plan del mapa) |
