import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MinTouchSize, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_LABELS } from '../constants';
import { type ExpirationFieldProps } from './expiration-field.types';
import { formatDateTime, getDefaultExpiration } from './format-date';

/**
 * HU-23: fecha y hora de finalización opcional. En Android se abren dos diálogos seguidos (fecha y
 * luego hora); en iOS, el selector de fecha y hora aparece debajo del campo con un botón "Listo".
 * La validación (posterior a la fecha actual) la hace el formulario al publicar.
 */
export function ExpirationField({
  value,
  onChange,
  hasError = false,
  canClear = true,
  hint = CONTENT_LABELS.expirationHint,
}: ExpirationFieldProps) {
  const theme = useTheme();
  const [isIosPickerOpen, setIsIosPickerOpen] = useState(false);
  const [iosDraft, setIosDraft] = useState<Date>(() => value ?? getDefaultExpiration());

  const openPicker = () => {
    const initial = value ?? getDefaultExpiration();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (event, pickedDate) => {
          if (event.type !== 'set' || !pickedDate) return;
          DateTimePickerAndroid.open({
            value: pickedDate,
            mode: 'time',
            onChange: (timeEvent, pickedTime) => {
              if (timeEvent.type !== 'set' || !pickedTime) return;
              const combined = new Date(pickedDate);
              combined.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
              onChange(combined);
            },
          });
        },
      });
      return;
    }
    setIosDraft(initial);
    setIsIosPickerOpen(true);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textLabel">
        {CONTENT_LABELS.expirationLabel}
      </ThemedText>
      <View
        style={[
          styles.field,
          {
            borderColor: hasError ? theme.danger : theme.border,
            backgroundColor: theme.background,
          },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CONTENT_LABELS.expirationPick}
          accessibilityValue={{
            text: value ? formatDateTime(value) : CONTENT_LABELS.expirationEmpty,
          }}
          onPress={openPicker}
          style={styles.pick}>
          <Icon name="calendar" size={20} />
          <ThemedText type="small" themeColor={value ? 'text' : 'textMuted'}>
            {value ? formatDateTime(value) : CONTENT_LABELS.expirationEmpty}
          </ThemedText>
        </Pressable>
        {value && canClear && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={CONTENT_LABELS.expirationClear}
            hitSlop={Spacing.two}
            onPress={() => {
              setIsIosPickerOpen(false);
              onChange(null);
            }}>
            <Icon name="close" size={18} color="textSecondary" />
          </Pressable>
        )}
      </View>
      <ThemedText type="caption" themeColor="textMuted">
        {hint}
      </ThemedText>

      {isIosPickerOpen && (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={iosDraft}
            mode="datetime"
            display="inline"
            minimumDate={new Date()}
            onChange={(_event, pickedDate) => {
              if (pickedDate) setIosDraft(pickedDate);
            }}
          />
          <Button
            label={CONTENT_LABELS.expirationDone}
            variant="link"
            onPress={() => {
              const chosen = new Date(iosDraft);
              chosen.setSeconds(0, 0);
              onChange(chosen);
              setIsIosPickerOpen(false);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.pill,
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.three,
  },
  pick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 14,
  },
  iosPicker: {
    alignItems: 'center',
  },
});
