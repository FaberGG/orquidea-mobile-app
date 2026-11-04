import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { type Control, Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChipButton } from '@/components/ui/chip-button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { type SaveSpeciesProgress } from '../api';
import {
  CONSERVATION_STATUSES,
  SPECIES_FORM_CATEGORY_OPTIONS,
  SPECIES_FORM_LABELS,
  SPECIES_MESSAGES,
} from '../constants';
import {
  SPECIES_PHOTO_LIMIT,
  speciesFormSchema,
  type SpeciesFormValues,
} from '../schemas/species-form.schema';
import {
  type ConservationStatus,
  type SpeciesCategory,
  type SpeciesInput,
  type SpeciesPhotoItem,
} from '../types';
import { ConservationBadge } from './conservation';
import { pickSpeciesPhotos, type RejectedPhotoReason } from './pick-species-photo';
import { SpeciesPhotosField } from './species-photos-field';

export type SpeciesFormProps = {
  mode: 'create' | 'edit';
  title: string;
  submitLabel: string;
  defaultValues: SpeciesFormValues;
  /** Fotos que ya tiene la ficha, en orden (solo al editar). */
  savedPhotos: SpeciesPhotoItem[];
  /** Estados que se ofrecen; al editar incluye el de la ficha aunque no esté en el diseño. */
  conservationOptions: readonly ConservationStatus[];
  isSubmitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  /** `progress` avisa qué fotos ya se guardaron, para no repetirlas si el guardado falla a medias. */
  onSubmit: (input: SpeciesInput, progress: SaveSpeciesProgress) => void;
};

const REJECTED_PHOTO_MESSAGES: Record<RejectedPhotoReason, string> = {
  invalid: SPECIES_MESSAGES.invalidImage,
  tooLarge: SPECIES_MESSAGES.imageTooLarge,
  overLimit: SPECIES_MESSAGES.photoLimitReached,
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
 * "Editar ficha". Valida con el mismo esquema en ambos casos. La ficha tiene siempre al menos una foto y
 * hasta `SPECIES_PHOTO_LIMIT` (HU-7 v2.0); la primera es la principal.
 */
export function SpeciesForm({
  mode,
  title,
  submitLabel,
  defaultValues,
  savedPhotos,
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
    getValues,
    formState: { errors },
  } = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesFormSchema),
    defaultValues,
  });
  const newPhotos = useWatch({ control, name: 'newPhotos' });
  const removedPhotoIds = useWatch({ control, name: 'removedPhotoIds' });
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);
  // Fotos ya quitadas en el servidor durante un guardado que falló después: no se vuelven a quitar.
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);

  const keptPhotos = savedPhotos.filter(
    (photo) => photo.id === null || !removedPhotoIds.includes(photo.id),
  );
  const photoCount = keptPhotos.length + newPhotos.length;

  const addPhotos = async () => {
    const result = await pickSpeciesPhotos(SPECIES_PHOTO_LIMIT - photoCount);
    if (result.status === 'cancelled') return;
    setPhotoError(result.rejected ? REJECTED_PHOTO_MESSAGES[result.rejected] : undefined);
    if (result.photos.length > 0) {
      setValue('newPhotos', [...newPhotos, ...result.photos], { shouldDirty: true });
    }
  };

  const progress: SaveSpeciesProgress = {
    onPhotoRemoved: (photoId) => setDeletedPhotoIds((current) => [...current, photoId]),
    onPhotoAdded: (added) =>
      setValue(
        'newPhotos',
        getValues('newPhotos').filter((photo) => photo.uri !== added.uri),
      ),
  };

  const submit = handleSubmit((values) => {
    // Al crear se exige al menos una foto; al editar, quitar la última no se permite desde el campo.
    if (mode === 'create' && photoCount === 0) {
      setPhotoError(SPECIES_MESSAGES.requiredFields);
      return;
    }
    if (values.category === null || values.conservationStatus === null) return;
    const pendingRemovals = values.removedPhotoIds.filter(
      (id) => savedPhotos.some((photo) => photo.id === id) && !deletedPhotoIds.includes(id),
    );
    onSubmit(
      toSpeciesInput(
        { ...values, removedPhotoIds: pendingRemovals },
        values.category,
        values.conservationStatus,
      ),
      progress,
    );
  });

  // El esquema produce un error por envío; se muestra uno solo, en el orden del formulario.
  const firstError = FIELD_ORDER.map((field) => errors[field]?.message).find(Boolean);
  const message = photoError ?? firstError ?? errorMessage;

  return (
    <FormScreen>
      <SpeciesFormHeader title={title} />

      <FormSection title={SPECIES_FORM_LABELS.photoSection}>
        <SpeciesPhotosField
          savedPhotos={keptPhotos}
          newPhotos={newPhotos}
          onAdd={() => void addPhotos()}
          onRemoveSaved={(photoId) => {
            setPhotoError(undefined);
            setValue('removedPhotoIds', [...removedPhotoIds, photoId], { shouldDirty: true });
          }}
          onRemoveNew={(uri) => {
            setPhotoError(undefined);
            setValue(
              'newPhotos',
              newPhotos.filter((photo) => photo.uri !== uri),
              { shouldDirty: true },
            );
          }}
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

/** Convierte los valores validados al cuerpo de la API. */
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
    newPhotos: values.newPhotos,
    removedPhotoIds: values.removedPhotoIds,
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
