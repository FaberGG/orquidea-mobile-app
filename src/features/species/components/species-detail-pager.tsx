import { useMemo, useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';

import { SpeciesDetailScreen } from './species-detail-screen';
import { SpeciesPagerContext } from './species-pager-context';

export type SpeciesDetailPagerProps = {
  /** Fichas entre las que se desliza, en el orden en que se mostraban en la lista de origen. */
  ids: string[];
  /** Ficha con la que abre. */
  initialId: string;
  source?: string;
};

/**
 * Detalle con paso a la ficha anterior o siguiente deslizando hacia los lados. Cada página es el detalle
 * normal de una ficha; solo se montan la actual y sus vecinas. Las fotos del encabezado tienen su propio
 * deslizamiento: el del paginador se apaga mientras el dedo está sobre la foto, así que para cambiar de ficha
 * se desliza en el resto de la pantalla.
 */
export function SpeciesDetailPager({ ids, initialId, source }: SpeciesDetailPagerProps) {
  const { width } = useWindowDimensions();
  const initialIndex = Math.max(0, ids.indexOf(initialId));
  const listRef = useRef<FlatList<string>>(null);
  const [swipeEnabled, setSwipeEnabled] = useState(true);
  const pager = useMemo(
    () => ({
      setSwipeEnabled: (enabled: boolean) => {
        // Se apaga directo en el componente nativo: el estado de React se aplica un cuadro después y un
        // deslizamiento rápido sobre la foto podría empezar antes, moviendo el paginador.
        listRef.current?.getNativeScrollRef()?.setNativeProps({ scrollEnabled: enabled });
        setSwipeEnabled(enabled);
      },
    }),
    [],
  );

  return (
    <SpeciesPagerContext value={pager}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        scrollEnabled={swipeEnabled}
        data={ids}
        keyExtractor={(id) => id}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={1}
        windowSize={3}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <SpeciesDetailScreen id={item} source={source} />
          </View>
        )}
      />
    </SpeciesPagerContext>
  );
}
