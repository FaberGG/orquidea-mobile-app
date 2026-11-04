import { useLocalSearchParams } from 'expo-router';

import { StationDetailScreen } from '@/features/map';

/** HU-13: "Ver estación", fuera de las pestañas (pantalla completa). Pública. */
export default function StationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StationDetailScreen id={id} />;
}
