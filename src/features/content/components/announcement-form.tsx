import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChipButton } from '@/components/ui/chip-button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { ANNOUNCEMENT_LIMITS, ANNOUNCEMENT_PRIORITY_OPTIONS, CONTENT_LABELS } from '../constants';
import { createAnnouncementFormSchema, type AnnouncementFormValues } from '../schemas';
import { type AnnouncementInput } from '../types';
import { ContentScreenHeader } from './content-screen-header';
import { ExpirationField } from './expiration-field';

// El esquema produce un error por envío; se muestra uno solo, en el orden del formulario.
const FIELD_ORDER = ['title', 'description', 'priority', 'expiresAt'] as const;

type AnnouncementFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  defaultValues: AnnouncementFormValues;
  /** Al editar: fecha de finalización que ya tiene el anuncio (no se valida si no cambia). */
  currentExpiresAt?: Date | null;
  /** Al editar no se puede quitar una fecha de finalización ya puesta (la API no lo permite). */
  canClearExpiration?: boolean;
  isPending: boolean;
  /** Error del servidor, ya traducido a texto. */
  serverError?: string;
  /** Confirmación tras guardar; se oculta en cuanto el usuario vuelve a editar. */
  successMessage?: string;
  /** El usuario cambió algún campo (para ocultar la confirmación anterior). */
  onEdit: () => void;
  /** Valores ya validados. `reset` vuelve a dejar el formulario con los valores dados. */
  onSubmit: (values: AnnouncementInput, reset: (values: AnnouncementFormValues) => void) => void;
};

/**
 * Formulario de anuncio (HU-16, HU-23 y edición de SCRUM-71): título, contenido, prioridad y fecha de
 * finalización opcional. Sin diseño en Figma: sigue el estilo del formulario de fichas.
 */
export function AnnouncementForm({
  title,
  subtitle,
  submitLabel,
  defaultValues,
  currentExpiresAt = null,
  canClearExpiration = true,
  isPending,
  serverError,
  successMessage,
  onEdit,
  onSubmit,
}: AnnouncementFormProps) {
  const schema = useMemo(() => createAnnouncementFormSchema(currentExpiresAt), [currentExpiresAt]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const submit = handleSubmit(({ title: text, description, priority, expiresAt }) => {
    // El esquema ya exige la prioridad; esto solo le confirma el tipo a TypeScript.
    if (priority === null) return;
    onSubmit({ title: text, description, priority, expiresAt }, reset);
  });

  // HU-16 CA2 tiene un único mensaje para título y contenido: se muestra una sola vez.
  const validationMessage = FIELD_ORDER.map((field) => errors[field]?.message).find(Boolean);
  const errorMessage = validationMessage ?? serverError;

  return (
    <FormScreen>
      <ContentScreenHeader title={title} />

      <ThemedText type="small" themeColor="textSecondary">
        {subtitle}
      </ThemedText>

      <View style={styles.fields}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={CONTENT_LABELS.titleLabel}
              placeholder={CONTENT_LABELS.titlePlaceholder}
              value={value}
              onChangeText={(text) => {
                onEdit();
                onChange(text);
              }}
              onBlur={onBlur}
              hasError={Boolean(errors.title)}
              maxLength={ANNOUNCEMENT_LIMITS.titleMaxLength}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={CONTENT_LABELS.descriptionLabel}
              placeholder={CONTENT_LABELS.descriptionPlaceholder}
              value={value}
              onChangeText={(text) => {
                onEdit();
                onChange(text);
              }}
              onBlur={onBlur}
              hasError={Boolean(errors.description)}
              maxLength={ANNOUNCEMENT_LIMITS.descriptionMaxLength}
              autoCapitalize="sentences"
              multiline
            />
          )}
        />

        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value } }) => (
            <View style={styles.group}>
              <ThemedText type="label" themeColor="textLabel">
                {CONTENT_LABELS.priorityLabel}
              </ThemedText>
              <View style={styles.chipRow} accessibilityRole="radiogroup">
                {ANNOUNCEMENT_PRIORITY_OPTIONS.map((option) => (
                  <ChipButton
                    key={option.id}
                    label={option.label}
                    accessibilityRole="radio"
                    selected={value === option.id}
                    onPress={() => {
                      onEdit();
                      onChange(option.id);
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="expiresAt"
          render={({ field: { onChange, value } }) => (
            <ExpirationField
              value={value}
              onChange={(date) => {
                onEdit();
                onChange(date);
              }}
              hasError={Boolean(errors.expiresAt)}
              canClear={canClearExpiration}
              hint={canClearExpiration ? undefined : CONTENT_LABELS.expirationLockedHint}
            />
          )}
        />
      </View>

      {errorMessage !== undefined ? (
        <FormMessage message={errorMessage} />
      ) : (
        successMessage !== undefined && <FormMessage variant="success" message={successMessage} />
      )}

      <Button label={submitLabel} onPress={() => submit()} isLoading={isPending} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.three,
  },
  group: {
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
