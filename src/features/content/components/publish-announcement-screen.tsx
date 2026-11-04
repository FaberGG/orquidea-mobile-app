import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChipButton } from '@/components/ui/chip-button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { FontFamily, Spacing } from '@/constants/theme';

import {
  ANNOUNCEMENT_LIMITS,
  ANNOUNCEMENT_PRIORITY_OPTIONS,
  CONTENT_LABELS,
  CONTENT_MESSAGES,
} from '../constants';
import { getPublishAnnouncementErrorMessage, useCreateAnnouncement } from '../hooks';
import { announcementFormSchema, type AnnouncementFormValues } from '../schemas';
import { ExpirationField } from './expiration-field';

const EMPTY_VALUES: AnnouncementFormValues = {
  title: '',
  description: '',
  priority: null,
  expiresAt: null,
};

// El esquema produce un error por envío; se muestra uno solo, en el orden del formulario.
const FIELD_ORDER = ['title', 'description', 'priority', 'expiresAt'] as const;

/**
 * HU-16 y HU-23: publicar un anuncio o información educativa con su prioridad (CA3) y, si se quiere,
 * una fecha y hora de finalización. Solo se llega con `announcements:publish` (el grupo `(admin)` ya
 * exige permisos de administrador). Sin diseño en Figma: sigue el estilo del formulario de fichas.
 * Al publicar, limpia el formulario y muestra la confirmación.
 */
export function PublishAnnouncementScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: EMPTY_VALUES,
  });
  const publish = useCreateAnnouncement();
  const [hasPublished, setHasPublished] = useState(false);

  const onSubmit = handleSubmit(({ title, description, priority, expiresAt }) => {
    setHasPublished(false);
    // El esquema ya exige la prioridad; esto solo le confirma el tipo a TypeScript.
    if (priority === null) return;
    publish.mutate(
      { title, description, priority, expiresAt },
      {
        onSuccess: () => {
          reset(EMPTY_VALUES);
          setHasPublished(true);
        },
      },
    );
  });

  // CA2 tiene un único mensaje para título y contenido: se muestra una sola vez.
  const validationMessage = FIELD_ORDER.map((field) => errors[field]?.message).find(Boolean);
  const errorMessage =
    validationMessage ??
    (publish.isError ? getPublishAnnouncementErrorMessage(publish.error) : undefined);

  return (
    <FormScreen>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CONTENT_LABELS.back}
          onPress={() => router.back()}
          hitSlop={Spacing.two}
          style={styles.backButton}>
          <Icon name="chevronLeft" size={22} color="textLabel" />
        </Pressable>
        <ThemedText style={styles.title} themeColor="textLabel" accessibilityRole="header">
          {CONTENT_LABELS.publishTitle}
        </ThemedText>
        <View style={styles.backButton} />
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {CONTENT_LABELS.publishSubtitle}
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
                setHasPublished(false);
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
                setHasPublished(false);
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
                      setHasPublished(false);
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
                setHasPublished(false);
                onChange(date);
              }}
              hasError={Boolean(errors.expiresAt)}
            />
          )}
        />
      </View>

      {errorMessage !== undefined ? (
        <FormMessage message={errorMessage} />
      ) : (
        hasPublished && (
          <FormMessage variant="success" message={CONTENT_MESSAGES.announcementPublished} />
        )
      )}

      <Button
        label={CONTENT_LABELS.publishButton}
        onPress={onSubmit}
        isLoading={publish.isPending}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
  },
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
