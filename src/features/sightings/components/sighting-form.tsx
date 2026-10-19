import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { HeaderIconButton } from '@/components/layout/app-header';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChipButton } from '@/components/ui/chip-button';
import { TextField } from '@/components/ui/text-field';
import { FontFamily, Spacing } from '@/constants/theme';

import {
  KINGDOM_OPTIONS,
  SIGHTING_FORM_LABELS,
  SIGHTING_LIMITS,
  SIGHTINGS_MESSAGES,
} from '../constants';
import { sightingFormSchema, type SightingFormValues } from '../schemas/sighting-form.schema';
import { type SightingInput } from '../types';
import { InfoNote } from './info-note';
import { pickSightingPhoto } from './pick-sighting-photo';
import { SightingLocationField } from './sighting-location-field';
import { SightingPhotoField } from './sighting-photo-field';

export const EMPTY_SIGHTING_FORM_VALUES: SightingFormValues = {
  photo: null,
  kingdom: null,
  vernacularName: '',
  isVernacularNameUnknown: false,
  remarks: '',
  location: null,
};

export type SightingFormProps = {
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (input: SightingInput) => void;
};

/**
 * Formulario de HU-18 (Figma: "Publicar reporte ciudadano"), ajustado a la API: una foto, reino y
 * clasificación específica (con opción "Desconocido", CA3), descripción obligatoria (CA2) y lugar
 * como coordenadas. El autor no se pide: lo asigna el servidor (CA4).
 */
export function SightingForm({ isSubmitting, errorMessage, onSubmit }: SightingFormProps) {
  const { control, handleSubmit, setValue, formState } = useForm<SightingFormValues>({
    resolver: zodResolver(sightingFormSchema),
    defaultValues: EMPTY_SIGHTING_FORM_VALUES,
  });
  const photo = useWatch({ control, name: 'photo' });
  const isVernacularNameUnknown = useWatch({ control, name: 'isVernacularNameUnknown' });
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);

  const choosePhoto = async () => {
    const result = await pickSightingPhoto();
    if (result.status === 'picked') {
      setPhotoError(undefined);
      setValue('photo', result.photo, { shouldDirty: true });
    }
    if (result.status === 'invalid') setPhotoError(SIGHTINGS_MESSAGES.invalidImage);
    if (result.status === 'tooLarge') setPhotoError(SIGHTINGS_MESSAGES.imageTooLarge);
  };

  const submit = handleSubmit((values) => onSubmit(toSightingInput(values)));

  const { errors } = formState;
  const validationMessage = errors.remarks?.message ?? errors.vernacularName?.message;
  const message = photoError ?? validationMessage ?? errorMessage;

  return (
    <FormScreen>
      <View style={styles.header}>
        <HeaderIconButton
          icon="chevronLeft"
          accessibilityLabel={SIGHTING_FORM_LABELS.back}
          onPress={() => router.back()}
        />
        <ThemedText style={styles.title} themeColor="textLabel" accessibilityRole="header">
          {SIGHTING_FORM_LABELS.title}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.intro}>
        <ThemedText style={styles.sectionTitle} themeColor="textLabel">
          {SIGHTING_FORM_LABELS.introTitle}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {SIGHTING_FORM_LABELS.introDescription}
        </ThemedText>
      </View>

      <FormSection title={SIGHTING_FORM_LABELS.photoSection}>
        <SightingPhotoField
          photoUri={photo?.uri ?? null}
          onPick={() => void choosePhoto()}
          onRemove={() => {
            setPhotoError(undefined);
            setValue('photo', null, { shouldDirty: true });
          }}
        />
      </FormSection>

      <FormSection title={SIGHTING_FORM_LABELS.classificationSection}>
        <Controller
          control={control}
          name="kingdom"
          render={({ field: { value, onChange } }) => (
            <View style={styles.group}>
              <ThemedText type="label" themeColor="textLabel">
                {SIGHTING_FORM_LABELS.kingdomLabel}
              </ThemedText>
              <View style={styles.chips} accessibilityRole="radiogroup">
                {KINGDOM_OPTIONS.map((option) => (
                  <ChipButton
                    key={option.id}
                    label={option.label}
                    accessibilityRole="radio"
                    selected={value === option.id}
                    onPress={() => onChange(value === option.id ? null : option.id)}
                  />
                ))}
              </View>
            </View>
          )}
        />
        <Controller
          control={control}
          name="vernacularName"
          render={({ field: { value, onChange, onBlur }, fieldState: { invalid } }) => (
            <TextField
              label={SIGHTING_FORM_LABELS.vernacularName}
              placeholder={SIGHTING_FORM_LABELS.vernacularNamePlaceholder}
              value={isVernacularNameUnknown ? '' : value}
              onChangeText={onChange}
              onBlur={onBlur}
              editable={!isVernacularNameUnknown}
              hasError={invalid}
              maxLength={SIGHTING_LIMITS.vernacularNameMaxLength}
              autoCapitalize="sentences"
            />
          )}
        />
        <Controller
          control={control}
          name="isVernacularNameUnknown"
          render={({ field: { value, onChange } }) => (
            <Checkbox
              isChecked={value}
              onChange={onChange}
              accessibilityLabel={SIGHTING_FORM_LABELS.vernacularNameUnknown}>
              <ThemedText type="small" themeColor="textSecondary">
                {SIGHTING_FORM_LABELS.vernacularNameUnknown}
              </ThemedText>
            </Checkbox>
          )}
        />
      </FormSection>

      <FormSection title={SIGHTING_FORM_LABELS.remarksSection}>
        <Controller
          control={control}
          name="remarks"
          render={({ field: { value, onChange, onBlur }, fieldState: { invalid } }) => (
            <View style={styles.group}>
              <TextField
                label={SIGHTING_FORM_LABELS.remarksLabel}
                placeholder={SIGHTING_FORM_LABELS.remarksPlaceholder}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                hasError={invalid}
                maxLength={SIGHTING_LIMITS.remarksMaxLength}
                autoCapitalize="sentences"
                multiline
              />
              <ThemedText type="caption" themeColor="textMuted" style={styles.counter}>
                {`${value.length}/${SIGHTING_LIMITS.remarksMaxLength}`}
              </ThemedText>
            </View>
          )}
        />
      </FormSection>

      <FormSection title={SIGHTING_FORM_LABELS.locationSection}>
        <Controller
          control={control}
          name="location"
          render={({ field: { value, onChange } }) => (
            <SightingLocationField value={value} onChange={onChange} />
          )}
        />
      </FormSection>

      <View style={styles.group}>
        <ThemedText type="label" themeColor="textLabel">
          {SIGHTING_FORM_LABELS.reviewNoteTitle}
        </ThemedText>
        <InfoNote
          text={SIGHTING_FORM_LABELS.reviewNote}
          boldText={SIGHTING_FORM_LABELS.reviewNoteBold}
        />
      </View>

      <View style={styles.actions}>
        {message && <FormMessage message={message} />}
        <Button
          label={SIGHTING_FORM_LABELS.submit}
          onPress={() => void submit()}
          isLoading={isSubmitting}
        />
        <Button
          label={SIGHTING_FORM_LABELS.cancel}
          variant="secondary"
          disabled={isSubmitting}
          onPress={() => router.back()}
        />
      </View>
    </FormScreen>
  );
}

/** Valores validados → cuerpo de la API. Sin reino elegido o con "No sé" se envía "Desconocido". */
function toSightingInput(values: SightingFormValues): SightingInput {
  return {
    remarks: values.remarks,
    kingdom: values.kingdom ?? 'unknown',
    vernacularName: values.isVernacularNameUnknown ? '' : values.vernacularName,
    location: values.location,
    photo: values.photo,
  };
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle} themeColor="textLabel" accessibilityRole="header">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  intro: {
    gap: Spacing.two,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  group: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  counter: {
    alignSelf: 'flex-end',
  },
  actions: {
    gap: 10,
  },
});
