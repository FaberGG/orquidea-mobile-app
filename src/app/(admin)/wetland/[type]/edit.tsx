import { useLocalSearchParams } from 'expo-router';

import { EditWetlandComponentScreen } from '@/features/content';

/** HU-15: editar el texto y las fotos de un componente. Requiere `content:manage`. */
export default function EditWetlandComponentRoute() {
  const { type } = useLocalSearchParams<{ type: string }>();
  return <EditWetlandComponentScreen type={type} />;
}
