import { ScrollView, StyleSheet } from 'react-native';

import { SPECIES_CATEGORY_FILTERS, type CategoryFilter } from '../constants';
import { ChipButton } from './chip-button';

export type CategoryChipsProps = {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
};

/** Filtro por categoría del listado (Figma: "Listar fichas", fila de filtros). Cada chip tiene su ícono. */
export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {SPECIES_CATEGORY_FILTERS.map((item) => (
        <ChipButton
          key={item.id}
          label={item.label}
          icon={item.icon}
          selected={value === item.id}
          onPress={() => onChange(item.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});
