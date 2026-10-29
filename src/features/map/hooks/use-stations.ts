import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api';

import { createStation, deleteStation, getStation, listStations, updateStation } from '../api';
import { STATION_MESSAGES, stationKeys } from '../constants';
import { type StationInput } from '../types';

/** Listado de estaciones (público). */
export function useStations() {
  return useQuery({ queryKey: stationKeys.list(), queryFn: listStations });
}

/** Detalle de una estación (público). */
export function useStation(id: string) {
  return useQuery({ queryKey: stationKeys.detail(id), queryFn: () => getStation(id) });
}

/** HU-13 CA1/CA4: crea la estación; el listado (y el mapa, cuando exista) debe reflejarla. */
export function useCreateStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StationInput) => createStation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stationKeys.all }),
  });
}

/** HU-13 CA2: edita la estación. */
export function useUpdateStation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StationInput) => updateStation(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stationKeys.all }),
  });
}

/** HU-13 CA5: elimina la estación y la quita de la caché. */
export function useDeleteStation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteStation(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: stationKeys.detail(id) });
      return queryClient.invalidateQueries({ queryKey: stationKeys.list() });
    },
  });
}

/** Mensaje para un fallo al guardar: se prefiere el `mensaje` del servidor (CODIGO §10). */
export function getStationSaveErrorMessage(error: unknown): string {
  if (isApiError(error) && error.serverMessage) return error.serverMessage;
  if (isApiError(error) && error.status === 413) return STATION_MESSAGES.imageTooLarge;
  return STATION_MESSAGES.saveError;
}

/** Mensaje para un fallo al eliminar. */
export function getStationDeleteErrorMessage(error: unknown): string {
  if (isApiError(error) && error.serverMessage) return error.serverMessage;
  return STATION_MESSAGES.deleteError;
}
