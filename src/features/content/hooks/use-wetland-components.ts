import { useQuery } from '@tanstack/react-query';

import { getWetlandComponent, listWetlandComponents } from '../api';
import { wetlandComponentKeys } from '../constants';

/** HU-14: componentes del humedal (público). */
export function useWetlandComponents() {
  return useQuery({
    queryKey: wetlandComponentKeys.list(),
    queryFn: listWetlandComponents,
  });
}

/** HU-14: un componente por su tipo (`AVES`, `FLORA`…). */
export function useWetlandComponent(type: string) {
  return useQuery({
    queryKey: wetlandComponentKeys.detail(type),
    queryFn: () => getWetlandComponent(type),
  });
}
