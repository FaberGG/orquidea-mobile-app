import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useId, useRef } from 'react';

import { getSpecies } from '../api';
import { SPECIES_QR_TIMEOUT_MS, speciesKeys, speciesQrKeys } from '../constants';

/** Fuerza una consulta fresca por intento y publica el resultado verificado en la caché normal. */
export function useQrResolution() {
  const queryClient = useQueryClient();
  const sessionId = useId();
  const attempt = useRef(0);
  const activeKey = useRef<readonly unknown[] | null>(null);

  const resolve = useCallback(
    async (speciesId: string) => {
      const currentAttempt = ++attempt.current;
      const queryKey = speciesQrKeys.resolve(sessionId, currentAttempt, speciesId);
      activeKey.current = queryKey;
      const species = await queryClient.fetchQuery({
        queryKey,
        queryFn: ({ signal }) =>
          getSpecies(speciesId, { signal, timeoutMs: SPECIES_QR_TIMEOUT_MS }),
        retry: false,
        staleTime: 0,
        gcTime: 0,
        networkMode: 'always',
      });

      if (species.id !== speciesId || attempt.current !== currentAttempt) {
        throw new Error('La ficha recibida no coincide con el código QR.');
      }
      queryClient.setQueryData(speciesKeys.detail(speciesId), species);
      return species;
    },
    [queryClient, sessionId],
  );

  const cancel = useCallback(async () => {
    attempt.current += 1;
    const queryKey = activeKey.current;
    activeKey.current = null;
    if (queryKey) await queryClient.cancelQueries({ queryKey, exact: true });
  }, [queryClient]);

  return { resolve, cancel };
}
