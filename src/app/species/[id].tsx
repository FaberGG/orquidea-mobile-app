import { useLocalSearchParams } from 'expo-router';

import { SpeciesDetailPager, SpeciesDetailScreen } from '@/features/species';

/**
 * Detalle de una ficha, fuera de las pestañas (pantalla completa, como en el Figma).
 *
 * `ids` (opcional, separados por coma) es la lista de origen —el listado de fichas o las fichas de una
 * estación— y permite deslizar a la ficha anterior o siguiente. Sin `ids` (p. ej. al llegar desde el mapa) o
 * con `source=qr` se muestra una sola ficha.
 */
export default function SpeciesDetailRoute() {
  const { id, source, ids } = useLocalSearchParams<{ id: string; source?: string; ids?: string }>();
  const siblings = ids ? ids.split(',').filter(Boolean) : [];
  if (source !== 'qr' && siblings.length > 1 && siblings.includes(id)) {
    return <SpeciesDetailPager ids={siblings} initialId={id} source={source} />;
  }
  return <SpeciesDetailScreen id={id} source={source} />;
}
