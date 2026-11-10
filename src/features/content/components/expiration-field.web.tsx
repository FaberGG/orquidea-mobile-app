import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_LABELS } from '../constants';
import { type ExpirationFieldProps } from './expiration-field.types';

/** `Date` → valor de `<input type="datetime-local">` (`aaaa-mm-ddThh:mm`, hora local). */
function toInputValue(date: Date | null): string {
  if (!date) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * HU-23 en web: el selector nativo no existe en el navegador, así que se usa el campo de fecha y
 * hora del propio navegador. Vaciarlo quita la fecha de finalización (salvo con `canClear={false}`).
 */
export function ExpirationField({
  value,
  onChange,
  hasError = false,
  canClear = true,
  hint = CONTENT_LABELS.expirationHint,
}: ExpirationFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textLabel">
        {CONTENT_LABELS.expirationLabel}
      </ThemedText>
      {createElement('input', {
        type: 'datetime-local',
        'aria-label': CONTENT_LABELS.expirationPick,
        value: toInputValue(value),
        onChange: (event: { target: { value: string } }) => {
          const text = event.target.value;
          // Sin `canClear`, vaciar el campo no quita la fecha: se conserva la anterior.
          if (!text && !canClear) return;
          onChange(text ? new Date(text) : null);
        },
        style: {
          border: `1px solid ${hasError ? theme.danger : theme.border}`,
          borderRadius: Radius.pill,
          padding: `${Spacing.three - 2}px ${Spacing.three}px`,
          backgroundColor: theme.background,
          color: theme.text,
          fontSize: 14,
        },
      })}
      <ThemedText type="caption" themeColor="textMuted">
        {hint}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
});
