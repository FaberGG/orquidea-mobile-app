import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TrailDrawingPanelProps = {
  name: string;
  pointCount: number;
  stationNames: string[];
  message: string | null;
  isSaving: boolean;
  isExporting: boolean;
  onNameChange: (name: string) => void;
  onUndo: () => void;
  onClear: () => void;
  onCancel: () => void;
  onSaveLocally: () => void;
  onExport: () => void;
};

/** Controles del trazado manual y exportación GPX. */
export function TrailDrawingPanel({
  name,
  pointCount,
  stationNames,
  message,
  isSaving,
  isExporting,
  onNameChange,
  onUndo,
  onClear,
  onCancel,
  onSaveLocally,
  onExport,
}: TrailDrawingPanelProps) {
  const theme = useTheme();
  const isBusy = isSaving || isExporting;

  return (
    <View style={[styles.panel, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor="textLabel">
        Trazar sendero
      </ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        Toca las estaciones en el orden del recorrido para conectarlas. Agrega toques en el mapa
        entre estaciones para ajustar el camino. Mantén pulsado un punto intermedio para moverlo.
      </ThemedText>
      {stationNames.length > 0 && (
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2}>
          Paradas:{' '}
          {stationNames.map((stationName, index) => `${index + 1}. ${stationName}`).join('  →  ')}
        </ThemedText>
      )}
      {message && (
        <ThemedText type="caption" themeColor="danger">
          {message}
        </ThemedText>
      )}
      <ThemedText type="captionBold" themeColor="primary">
        {pointCount} {pointCount === 1 ? 'punto' : 'puntos'} · mínimo 2
      </ThemedText>
      <TextInput
        accessibilityLabel="Nombre del sendero"
        value={name}
        onChangeText={onNameChange}
        placeholder="Nombre del sendero"
        placeholderTextColor={theme.textMuted}
        maxLength={150}
        returnKeyType="done"
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor: theme.backgroundElement,
          },
        ]}
      />
      <View style={styles.linkRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deshacer último punto"
          accessibilityState={{ disabled: pointCount === 0 }}
          disabled={pointCount === 0 || isBusy}
          onPress={onUndo}>
          <ThemedText type="smallBold" themeColor={pointCount === 0 ? 'textMuted' : 'primary'}>
            Deshacer punto
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar puntos"
          accessibilityState={{ disabled: pointCount === 0 }}
          disabled={pointCount === 0 || isBusy}
          onPress={onClear}>
          <ThemedText type="smallBold" themeColor={pointCount === 0 ? 'textMuted' : 'danger'}>
            Limpiar
          </ThemedText>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <View style={styles.action}>
          <Button label="CANCELAR" variant="secondary" onPress={onCancel} disabled={isBusy} />
        </View>
        <View style={[styles.action, styles.saveAction]}>
          <Button
            label="GUARDAR EN MAPA"
            onPress={onSaveLocally}
            disabled={pointCount < 2 || name.trim().length === 0}
            isLoading={isSaving}
          />
        </View>
      </View>
      <Button
        label="EXPORTAR GPX"
        variant="secondary"
        onPress={onExport}
        disabled={pointCount < 2 || name.trim().length === 0}
        isLoading={isExporting}
      />
      <ThemedText type="caption" themeColor="textMuted">
        Guardar en mapa conserva la ruta en este iPhone. Para que la vean todos los usuarios debe
        publicarse en el servidor.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    gap: Spacing.two,
    padding: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.card,
    elevation: 5,
  },
  input: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
  saveAction: {
    flex: 1.5,
  },
});
