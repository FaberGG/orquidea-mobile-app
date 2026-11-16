import * as FileSystem from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { z } from 'zod';

import { type TrailMap } from '../types';

const pointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
const packageSchema = z.object({
  format: z.literal(1),
  savedAt: z.string(),
  mapVersion: z.string(),
  photos: z
    .object({
      available: z.number().int().nonnegative(),
      saved: z.number().int().nonnegative(),
    })
    .optional(),
  segment: z.object({
    id: z.union([z.string().uuid(), z.string().regex(/^local-[a-z0-9-]+$/i)]),
    name: z.string(),
    order: z.number(),
    coordinates: z.array(pointSchema).min(2),
  }),
  stations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      coordinates: pointSchema,
      photoUri: z.string().nullable().optional(),
    }),
  ),
});

export type OfflineTrail = z.infer<typeof packageSchema>;

function nearTrail(
  point: { latitude: number; longitude: number },
  line: { latitude: number; longitude: number }[],
): boolean {
  const longitudeScale = Math.cos((point.latitude * Math.PI) / 180);
  const xy = (p: typeof point) => ({
    x: (p.longitude - point.longitude) * 111320 * longitudeScale,
    y: (p.latitude - point.latitude) * 111320,
  });
  return line.slice(1).some((end, index) => {
    const a = xy(line[index]);
    const b = xy(end);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy;
    const fraction =
      lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / lengthSquared));
    return Math.hypot(a.x + fraction * dx, a.y + fraction * dy) <= 250;
  });
}

function directory(): string {
  if (!FileSystem.documentDirectory) throw new Error('Almacenamiento no disponible.');
  return `${FileSystem.documentDirectory}senderos-offline/`;
}

function fileUri(id: string): string {
  if (!z.string().uuid().safeParse(id).success && !/^local-[a-z0-9-]+$/i.test(id)) {
    throw new Error('Identificador inválido.');
  }
  return `${directory()}${id}.json`;
}

function isManagedPhotoUri(uri: string, segmentId: string): boolean {
  return uri.startsWith(`${directory()}${segmentId}-photo-`);
}

async function deleteDownloadedPhotos(uris: string[]): Promise<void> {
  await Promise.all(
    uris.map((uri) => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined)),
  );
}

/** Guarda por tramo la geometría, estaciones y fotos disponibles en el servidor del proyecto. */
export async function downloadTrail(map: TrailMap, segmentId: string): Promise<OfflineTrail> {
  const segment = map.segments.find((item) => item.id === segmentId);
  if (!segment) throw new Error('No se encontró el tramo.');

  const previous = (await readOfflineTrails()).find((item) => item.segment.id === segmentId);
  const nearbyStations = map.stations.filter((station) =>
    nearTrail(station.coordinates, segment.coordinates),
  );
  const downloadedPhotoUris: string[] = [];
  const stations: OfflineTrail['stations'] = [];
  let availablePhotos = 0;

  await FileSystem.makeDirectoryAsync(directory(), { intermediates: true });

  for (const [index, station] of nearbyStations.entries()) {
    let photoUri: string | null = null;
    if (station.photoUrl) {
      availablePhotos += 1;
      const suffix = `${Date.now()}-${index}`;
      const temporaryUri = `${directory()}${segmentId}-photo-download-${suffix}.tmp`;
      const destination = `${directory()}${segmentId}-photo-${suffix}.jpg`;
      try {
        const response = await FileSystem.downloadAsync(station.photoUrl, temporaryUri);
        if (response.status >= 200 && response.status < 300) {
          const context = ImageManipulator.manipulate(response.uri, {
            maxWidth: 1280,
            maxHeight: 1280,
          });
          let rendered: Awaited<ReturnType<typeof context.renderAsync>> | null = null;
          try {
            rendered = await context.renderAsync();
            if (Math.max(rendered.width, rendered.height) > 960) {
              const isLandscape = rendered.width >= rendered.height;
              rendered.release();
              context.reset();
              context.resize(isLandscape ? { width: 960 } : { height: 960 });
              rendered = await context.renderAsync();
            }
            const compactPhoto = await rendered.saveAsync({
              format: SaveFormat.JPEG,
              compress: 0.7,
            });
            await FileSystem.moveAsync({ from: compactPhoto.uri, to: destination });
            photoUri = destination;
            downloadedPhotoUris.push(destination);
          } finally {
            context.release();
            rendered?.release();
          }
          await FileSystem.deleteAsync(temporaryUri, { idempotent: true });
        } else {
          await FileSystem.deleteAsync(temporaryUri, { idempotent: true });
        }
      } catch {
        await FileSystem.deleteAsync(temporaryUri, { idempotent: true }).catch(() => undefined);
        await FileSystem.deleteAsync(destination, { idempotent: true }).catch(() => undefined);
        photoUri = null;
      }
    }
    if (!photoUri) {
      const previousPhoto = previous?.stations.find((item) => item.id === station.id)?.photoUri;
      if (previousPhoto && isManagedPhotoUri(previousPhoto, segmentId)) {
        const info = await FileSystem.getInfoAsync(previousPhoto).catch(() => ({ exists: false }));
        if (info.exists) photoUri = previousPhoto;
      }
    }
    stations.push({
      id: station.id,
      name: station.name,
      description: station.description,
      coordinates: station.coordinates,
      photoUri,
    });
  }

  const pack = packageSchema.parse({
    format: 1,
    savedAt: new Date().toISOString(),
    mapVersion: map.version,
    segment,
    photos: {
      available: availablePhotos,
      saved: stations.filter((station) => station.photoUri !== null).length,
    },
    stations,
  });
  try {
    await FileSystem.writeAsStringAsync(fileUri(segmentId), JSON.stringify(pack));
  } catch (error) {
    await deleteDownloadedPhotos(downloadedPhotoUris);
    throw error;
  }

  const currentPhotoUris = new Set(
    stations.flatMap((station) => (station.photoUri ? [station.photoUri] : [])),
  );
  await deleteDownloadedPhotos(
    previous?.stations
      .map((station) => station.photoUri)
      .filter(
        (uri): uri is string =>
          typeof uri === 'string' &&
          isManagedPhotoUri(uri, segmentId) &&
          !currentPhotoUris.has(uri),
      ) ?? [],
  );
  return pack;
}

export async function readOfflineTrails(): Promise<OfflineTrail[]> {
  const info = await FileSystem.getInfoAsync(directory());
  if (!info.exists) return [];
  const files = await FileSystem.readDirectoryAsync(directory());
  const packs = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => {
        try {
          const parsed = packageSchema.safeParse(
            JSON.parse(await FileSystem.readAsStringAsync(`${directory()}${file}`)),
          );
          return parsed.success ? parsed.data : null;
        } catch {
          return null;
        }
      }),
  );
  return packs
    .filter((pack): pack is OfflineTrail => pack !== null)
    .sort((a, b) => a.segment.order - b.segment.order);
}

export async function deleteOfflineTrail(id: string): Promise<void> {
  const existing = (await readOfflineTrails()).find((pack) => pack.segment.id === id);
  await FileSystem.deleteAsync(fileUri(id), { idempotent: true });
  await deleteDownloadedPhotos(
    existing?.stations
      .map((station) => station.photoUri)
      .filter((uri): uri is string => typeof uri === 'string' && isManagedPhotoUri(uri, id)) ?? [],
  );
}
