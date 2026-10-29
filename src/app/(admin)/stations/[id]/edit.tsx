import { useLocalSearchParams } from 'expo-router';

import { StationEditScreen } from '@/features/map';

/** Edición de una estación (HU-13 CA2). */
export default function StationEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <StationEditScreen id={id} />;
}
