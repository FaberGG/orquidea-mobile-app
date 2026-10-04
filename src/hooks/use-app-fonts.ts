import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito';

/**
 * Carga la tipografía Nunito del diseño. Devuelve `true` cuando la app puede pintarse: fuentes
 * listas o fallo de carga (en ese caso se usa la fuente del sistema en lugar de bloquear la app).
 */
export function useAppFonts(): boolean {
  const [isLoaded, error] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });
  return isLoaded || error !== null;
}
