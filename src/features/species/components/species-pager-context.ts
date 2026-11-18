import { createContext, useContext } from 'react';

/**
 * Lo que el paginador de fichas le ofrece a cada detalle: apagar su deslizamiento mientras el dedo está
 * sobre la foto del encabezado (que tiene su propio deslizador de fotos).
 */
export const SpeciesPagerContext = createContext<{
  setSwipeEnabled: (enabled: boolean) => void;
} | null>(null);

export function useSpeciesPager() {
  return useContext(SpeciesPagerContext);
}
