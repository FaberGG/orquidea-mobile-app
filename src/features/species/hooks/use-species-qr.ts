import { useMutation } from '@tanstack/react-query';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef } from 'react';

import { isApiError } from '@/lib/api';

import { getSpeciesQr } from '../api';
import { SPECIES_QR_EXPORT_LABELS } from '../constants';

/** Solo conserva el PNG público en caché; nunca guarda la autorización en el archivo o la URI. */
export function useSpeciesQr(id: string) {
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  const download = useMutation({
    retry: false,
    mutationFn: async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const bytes = await getSpeciesQr(id, controller.signal);
      if (controller.signal.aborted) throw new Error('Descarga cancelada.');
      // Una ruta por ficha evita acumular archivos en cada intento.
      const file = new File(Paths.cache, `orquidea-ficha-${encodeURIComponent(id)}.png`);
      file.create({ overwrite: true });
      file.write(bytes);
      return file.uri;
    },
  });

  const share = useMutation({
    retry: false,
    mutationFn: async (uri: string) => {
      if (!(await Sharing.isAvailableAsync())) {
        return { unavailable: true };
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: SPECIES_QR_EXPORT_LABELS.shareTitle,
      });
      // Cerrar el menú del sistema sin elegir destino también es un resultado normal.
      return { unavailable: false };
    },
  });

  return {
    uri: download.data,
    isPreparing: download.isPending,
    isSharing: share.isPending,
    errorMessage: download.isError
      ? getSpeciesQrErrorMessage(download.error)
      : share.isError
        ? SPECIES_QR_EXPORT_LABELS.shareError
        : share.data?.unavailable
          ? SPECIES_QR_EXPORT_LABELS.shareUnavailable
          : null,
    prepare: () => {
      share.reset();
      download.mutate();
    },
    share: () => {
      if (download.data) share.mutate(download.data);
    },
  };
}

/** Errores de descarga con textos de usuario; nunca expone detalles técnicos del servidor. */
export function getSpeciesQrErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 401) return SPECIES_QR_EXPORT_LABELS.signIn;
    if (error.status === 403) return SPECIES_QR_EXPORT_LABELS.forbidden;
    if (error.status === 404) return SPECIES_QR_EXPORT_LABELS.notFound;
    if (error.status >= 400 && error.status < 500 && error.serverMessage) {
      return error.serverMessage;
    }
  }
  return SPECIES_QR_EXPORT_LABELS.exportError;
}
