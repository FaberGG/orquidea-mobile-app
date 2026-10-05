import { useLocalSearchParams } from 'expo-router';

import { SpeciesDetailScreen } from '@/features/species';

/** Detalle de una ficha, fuera de las pestañas (pantalla completa, como en el Figma). */
export default function SpeciesDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SpeciesDetailScreen id={id} />;
}
