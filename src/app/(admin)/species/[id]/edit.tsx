import { useLocalSearchParams } from 'expo-router';

import { SpeciesEditScreen } from '@/features/species';

/** Edición de una ficha (HU-8). */
export default function SpeciesEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SpeciesEditScreen id={id} />;
}
