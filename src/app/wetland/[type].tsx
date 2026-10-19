import { useLocalSearchParams } from 'expo-router';

import { WetlandComponentDetailScreen } from '@/features/content';

/** HU-14: detalle de un componente del humedal, fuera de las pestañas (pantalla completa). */
export default function WetlandComponentRoute() {
  const { type } = useLocalSearchParams<{ type: string }>();
  return <WetlandComponentDetailScreen type={type} />;
}
