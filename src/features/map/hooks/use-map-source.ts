import { type StyleSpecification } from '@maplibre/maplibre-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToast } from '@/components/feedback/toast';
import { useNetworkStatus } from '@/hooks/use-network-status';

import {
  MAP_SOURCE_MESSAGES,
  MAP_SOURCE_SETTLE_MS,
  MAP_STYLE_URL,
  ONLINE_MAP_TIMEOUT_MS,
} from '../constants';
import { useOfflineTiles } from './use-offline-tiles';
import { createOfflineMapStyle } from '../utils/offline-map-style';

export type MapSourceMode = 'online' | 'offline';

export type MapSource = {
  /** `online`: OpenFreeMap. `offline`: PMTiles de Popayán incluido en la app. */
  mode: MapSourceMode;
  mapStyle: string | StyleSpecification;
  /** Conectar a `onDidFinishLoadingStyle` del mapa. */
  onStyleLoaded: () => void;
  /** Conectar a `onDidFailLoadingMap` del mapa. */
  onLoadFailed: () => void;
};

/**
 * SCRUM-84: elige solo la fuente del mapa base según la conexión.
 *
 * - Con conexión: OpenFreeMap.
 * - Sin conexión, o si OpenFreeMap falla o no carga en `ONLINE_MAP_TIMEOUT_MS`: el PMTiles de Popayán
 *   (SCRUM-85), con el estilo provisional hasta el estilo propio de SCRUM-82.
 * - Los cambios de red esperan `MAP_SOURCE_SETTLE_MS` estables, para que una red que parpadea no haga
 *   saltar el mapa. Al recuperar la red se vuelve a intentar OpenFreeMap.
 * - Avisa una vez por cambio: "Usar mapa offline" al pasar al mapa offline y "Usando mapa con conexión"
 *   cuando OpenFreeMap vuelve a cargar. El toast es uno a la vez, así que no se apila con
 *   `ConnectivityNotice`.
 *
 * Solo cambia el estilo del mapa: la cámara se conserva porque ningún estilo trae `center` ni `zoom` propios.
 */
export function useMapSource(): MapSource {
  const { status } = useNetworkStatus();
  const { show } = useToast();
  const offlineTiles = useOfflineTiles();
  const isNetworkOffline = status === 'offline';
  const [settledOffline, setSettledOffline] = useState(isNetworkOffline);
  const [onlineFailed, setOnlineFailed] = useState(false);
  const [onlineLoaded, setOnlineLoaded] = useState(false);
  const announced = useRef<MapSourceMode | null>(null);

  // Cambio de red asentado. Al volver la conexión se reintenta OpenFreeMap desde cero.
  useEffect(() => {
    if (isNetworkOffline === settledOffline) return;
    const timer = setTimeout(() => {
      setSettledOffline(isNetworkOffline);
      if (!isNetworkOffline) {
        setOnlineFailed(false);
        setOnlineLoaded(false);
      }
    }, MAP_SOURCE_SETTLE_MS);
    return () => clearTimeout(timer);
  }, [isNetworkOffline, settledOffline]);

  const mode: MapSourceMode = settledOffline || onlineFailed ? 'offline' : 'online';

  // Con conexión, si OpenFreeMap no termina de cargar a tiempo, se usa el mapa offline.
  useEffect(() => {
    if (mode !== 'online' || onlineLoaded) return;
    const timer = setTimeout(() => setOnlineFailed(true), ONLINE_MAP_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [mode, onlineLoaded]);

  useEffect(() => {
    if (mode !== 'offline' || announced.current === 'offline') return;
    announced.current = 'offline';
    show(MAP_SOURCE_MESSAGES.offline, 'info');
  }, [mode, show]);

  const offlineTilesUrl = offlineTiles.status === 'ready' ? offlineTiles.url : null;
  const offlineStyle = useMemo(
    () => (offlineTilesUrl ? createOfflineMapStyle(offlineTilesUrl) : null),
    [offlineTilesUrl],
  );

  const onStyleLoaded = useCallback(() => {
    if (mode !== 'online') return;
    setOnlineLoaded(true);
    // Al abrir con conexión no se avisa; solo al volver de offline.
    if (announced.current === 'offline') show(MAP_SOURCE_MESSAGES.online, 'info');
    announced.current = 'online';
  }, [mode, show]);

  const onLoadFailed = useCallback(() => {
    if (mode === 'online') setOnlineFailed(true);
  }, [mode]);

  return {
    mode,
    // Si el PMTiles aún no está listo (o falló), se queda el estilo en línea: el sendero y las estaciones
    // se siguen viendo desde la caché.
    mapStyle: mode === 'offline' && offlineStyle ? offlineStyle : MAP_STYLE_URL,
    onStyleLoaded,
    onLoadFailed,
  };
}
