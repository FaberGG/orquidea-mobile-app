import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { type Control, Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import {
  CONSERVATION_STATUSES,
  SPECIES_FORM_CATEGORY_OPTIONS,
  SPECIES_FORM_LABELS,
  SPECIES_MESSAGES,
} from '../constants';
import { speciesFormSchema, type SpeciesFormValues } from '../schemas/species-form.schema';
import { type ConservationStatus, type SpeciesCategory, type SpeciesInput } from '../types';
import { ChipButton } from './chip-button';
import { ConservationBadge } from './conservation';
import { pickSpeciesPhoto } from './pick-species-photo';

export type SpeciesFormProps = {
  mode: 'create' | 'edit';
  title: string;
  submitLabel: string;
  defaultValues: SpeciesFormValues;
  /** Foto que ya tiene la ficha (solo al editar). */
  existingPhotoUrl: string | null;
  /** Estados que se ofrecen; al editar incluye el de la ficha aunque no esté en el diseño. */
  conservationOptions: readonly ConservationStatus[];
  isSubmitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  onSubmit: (input: SpeciesInput) => void;
};

const FIELD_ORDER = [
  'category',
  'vernacularName',
  'scientificName',
  'order',
  'family',
  'genus',
  'diet',
  'wetlandRole',
  'conservationStatus',
] as const;

/**
 * Formulario compartido de HU-7 (crear) y HU-8 (editar), según el diseño de Figma "Crear ficha" y
 * "Editar ficha". Valida con el mismo esquema en ambos casos; la foto es obligatoria solo al crear.
 */
export function SpeciesForm({
  mode,
  title,
  submitLabel,
  defaultValues,
  existingPhotoUrl,
  conservationOptions,
  isSubmitting,
  errorMessage,
  successMessage,
  onSubmit,
}: SpeciesFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesFormSchema),
    defaultValues,
  });
  const photo = useWatch({ control, name: 'photo' });
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);

  const choosePhoto = async () => {
    const result = await pickSpeciesPhoto();
    if (result.status === 'picked') {
      setPhotoError(undefined);
      setValue('photo', result.photo, { shouldDirty: true });
    }
    if (result.status === 'invalid') setPhotoError(SPECIES_MESSAGES.invalidImage);
    if (result.status === 'tooLarge') setPhotoError(SPECIES_MESSAGES.imageTooLarge);
  };

  const submit = handleSubmit((values) => {
    if (mode === 'create' && !values.photo) {
      setPhotoError(SPECIES_MESSAGES.requiredFields);
      return;
    }
    if (values.category === null || values.conservationStatus === null) return;
    onSubmit(toSpeciesInput(values, values.category, values.conservationStatus));
  });

  // El esquema produce un error por envío; se muestra uno solo, en el orden del formulario.
  const firstError = FIELD_ORDER.map((field) => errors[field]?.message).find(Boolean);
  const message = photoError ?? firstError ?? errorMessage;
  const hasPhoto = photo !== null || existingPhotoUrl !== null;

  return (
    <FormScreen>
      <SpeciesFormHeader title={title} />

      <FormSection title={SPECIES_FORM_LABELS.photoSection}>
        <PhotoField
          photoUri={photo?.uri ?? existingPhotoUrl}
          hasPhoto={hasPhoto}
          onPress={choosePhoto}
        />
      </FormSection>

      <FormSection title={SPECIES_FORM_LABELS.identificationSection}>
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange } }) => (
            <View style={styles.group}>
              <ThemedText type="label" themeColor="textLabel">
                {SPECIES_FORM_LABELS.categoryLabel}
              </ThemedText>
              <View style={styles.chipRow}>
                {SPECIES_FORM_CATEGORY_OPTIONS.map((option) => (
                  <ChipButton
                    key={option.id}
                    label={option.label}
                    icon={option.icon}
                    selected={value === option.id}
                    onPress={() => onChange(option.id)}
                  />
                ))}
              </View>
            </View>
          )}
        />
        <TextFieldController
          control={control}
          name="vernacularName"
          label={SPECIES_FORM_LABELS.vernacularName}
          placeholder={SPECIES_FORM_LABELS.vernacularNamePlaceholder}
        />
        <TextFieldController
          control={control}
          name="scientificName"
          label={SPECIES_FORM_LABELS.scientificName}
          placeholder={SPECIES_FORM_LABELS.scientificNamePlaceholder}
        />
      </FormSection>

      <FormSection title={SPECIES_FORM_LABELS.taxonomySection}>
        <TextFieldController
          control={control}
          name="order"
          label={SPECIES_FORM_LABELS.order}
          placeholder={SPECIES_FORM_LABELS.orderPlaceholder}
        />
        <TextFieldController
          control={control}
          name="family"
          label={SPECIES_FORM_LABELS.family}
          placeholder={SPECIES_FORM_LABELS.familyPlaceholder}
        />
        <TextFieldController
          control={control}
          name="genus"
          label={SPECIES_FORM_LABELS.genus}
          placeholder={SPECIES_FORM_LABELS.genusPlaceholder}
        />
      </FormSection>

      <FormSection title={SPECIES_FORM_LABELS.ecologySection}>
        <TextFieldController
          control={control}
          name="diet"
          label={SPECIES_FORM_LABELS.diet}
          placeholder={SPECIES_FORM_LABELS.dietPlaceholder}
          multiline
        />
        <TextFieldController
          control={control}
          name="wetlandRole"
          label={SPECIES_FORM_LABELS.wetlandRole}
          placeholder={SPECIES_FORM_LABELS.wetlandRolePlaceholder}
          multiline
        />
      </FormSection>

      <FormSection title={SPECIES_FORM_LABELS.conservationSection}>
        <ThemedText type="captionBold" themeColor="textMuted">
          {SPECIES_FORM_LABELS.conservationHint}
        </ThemedText>
        <Controller
          control={control}
          name="conservationStatus"
          render={({ field: { value, onChange } }) => (
            <ConservationPicker options={conservationOptions} value={value} onChange={onChange} />
          )}
        />
      </FormSection>

      <View style={styles.actions}>
        {message && <FormMessage message={message} />}
        {successMessage && !message && <FormMessage variant="success" message={successMessage} />}
        <Button
          label={submitLabel}
          onPress={() => void submit()}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
        {mode === 'edit' && (
          <Button label={SPECIES_FORM_LABELS.cancel} variant="link" onPress={() => router.back()} />
        )}
      </View>
    </FormScreen>
  );
}

/** Convierte los valores validados al cuerpo de la API. La foto nueva queda en `photo`. */
function toSpeciesInput(
  values: SpeciesFormValues,
  category: SpeciesCategory,
  conservationStatus: ConservationStatus,
): SpeciesInput {
  return {
    category,
    vernacularName: values.vernacularName,
    scientificName: values.scientificName,
    order: values.order,
    family: values.family,
    genus: values.genus,
    diet: values.diet,
    wetlandRole: values.wetlandRole,
    conservationStatus,
    photo: values.photo,
  };
}

function SpeciesFormHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={SPECIES_FORM_LABELS.back}
        onPress={() => router.back()}
        hitSlop={Spacing.two}
        style={styles.backButton}>
        <Icon name="chevronLeft" size={22} color="textLabel" />
      </Pressable>
      <ThemedText style={styles.title} themeColor="textLabel" accessibilityRole="header">
        {title}
      </ThemedText>
      <View style={styles.backButton} />
    </View>
  );
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

function PhotoField({
  photoUri,
  hasPhoto,
  onPress,
}: {
  photoUri: string | null;
  hasPhoto: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  if (hasPhoto && photoUri) {
    return (
      <View style={styles.photo}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={SPECIES_FORM_LABELS.photoChange}
          onPress={onPress}
          style={[styles.changePhoto, { backgroundColor: 'rgba(0, 15, 10, 0.55)' }]}>
          <Icon name="camera" size={16} color="onPrimary" />
          <ThemedText type="captionBold" themeColor="onPrimary">
            {SPECIES_FORM_LABELS.photoChange}
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={SPECIES_FORM_LABELS.photoUpload}
      onPress={onPress}
      style={[
        styles.photoEmpty,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
      ]}>
      <View style={[styles.photoBadge, { backgroundColor: theme.primarySoft }]}>
        <Icon name="imagePlus" size={24} color="primary" />
      </View>
      <ThemedText type="smallBold" themeColor="primary">
        {SPECIES_FORM_LABELS.photoUpload}
      </ThemedText>
      <ThemedText type="caption" themeColor="textMuted">
        {SPECIES_FORM_LABELS.photoHint}
      </ThemedText>
    </Pressable>
  );
}

function ConservationPicker({
  options,
  value,
  onChange,
}: {
  options: readonly ConservationStatus[];
  value: ConservationStatus | null;
  onChange: (value: ConservationStatus) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.conservationRow}>
      {options.map((code) => {
        const selected = value === code;
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityLabel={CONSERVATION_STATUSES[code].label}
            accessibilityState={{ selected }}
            onPress={() => onChange(code)}
            style={styles.conservationOption}>
            <View style={[styles.conservationRing, selected && { borderColor: theme.primary }]}>
              <ConservationBadge status={code} size={48} />
            </View>
            <ThemedText type="caption" themeColor="textSecondary" style={styles.conservationLabel}>
              {CONSERVATION_STATUSES[code].label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

type TextFieldControllerProps = {
  control: Control<SpeciesFormValues>;
  name: 'vernacularName' | 'scientificName' | 'order' | 'family' | 'genus' | 'diet' | 'wetlandRole';
  label: string;
  placeholder: string;
  multiline?: boolean;
};

function TextFieldController({
  control,
  name,
  label,
  placeholder,
  multiline,
}: TextFieldControllerProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { invalid } }) => (
        <TextField
          label={label}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          hasError={invalid}
          multiline={multiline}
          autoCapitalize="sentences"
        />
      )}
    />
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
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  group: {
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  photo: {
    height: 200,
    borderRadius: Radius.medium + Spacing.one,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: Spacing.two,
  },
  changePhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: 12,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.full,
  },
  photoEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    height: 160,
    borderRadius: Radius.medium + Spacing.one,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  photoBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  conservationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  conservationOption: {
    width: 64,
    alignItems: 'center',
    gap: Spacing.one,
  },
  conservationRing: {
    padding: 3,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  conservationLabel: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
});
