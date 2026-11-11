import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
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
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';
import { getCurrentLocation } from '@/lib/location';

import { LOCATION_PICKER_LABELS, STATION_LABELS, STATION_MESSAGES } from '../constants';
import {
  parseCoordinate,
  stationFormSchema,
  type StationFormValues,
} from '../schemas/station-form.schema';
import { type Coordinates, type StationInput } from '../types';
import { MapLocationPicker } from './map-location-picker';
import { pickStationPhoto } from './pick-station-photo';
import { StationScreenHeader } from './station-screen-header';
import { StationSpeciesPicker } from './station-species-picker';

export type StationFormProps = {
  mode: 'create' | 'edit';
  title: string;
  submitLabel: string;
  defaultValues: StationFormValues;
  /** Foto que ya tiene la estación (solo al editar). */
  savedPhotoUrl: string | null;
  isSubmitting: boolean;
  errorMessage?: string;
  successMessage?: string;
  onSubmit: (input: StationInput) => void;
};

const FIELD_ORDER = ['name', 'description', 'latitude', 'longitude'] as const;

/**
 * Formulario de crear y editar estación (HU-13). Sin diseño en Figma: usa los tokens y la estructura del
 * formulario de fichas. Las coordenadas se escriben, se toman de la ubicación actual o, con conexión, se
 * eligen tocando el mapa (SCRUM-72).
 */
export function StationForm({
  mode,
  title,
  submitLabel,
  defaultValues,
  savedPhotoUrl,
  isSubmitting,
  errorMessage,
  successMessage,
  onSubmit,
}: StationFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StationFormValues>({ resolver: zodResolver(stationFormSchema), defaultValues });
  const photo = useWatch({ control, name: 'photo' });
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [isPickingOnMap, setIsPickingOnMap] = useState(false);
  const { status: networkStatus } = useNetworkStatus();
  const latitude = useWatch({ control, name: 'latitude' });
  const longitude = useWatch({ control, name: 'longitude' });
  const currentPoint = toCoordinates(latitude, longitude);

  const setCoordinates = ({ latitude: lat, longitude: lng }: Coordinates) => {
    setLocalError(undefined);
    setValue('latitude', lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue('longitude', lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
  };

  const choosePhoto = async () => {
    const result = await pickStationPhoto();
    if (result.status === 'picked') {
      setLocalError(undefined);
      setValue('photo', result.photo, { shouldDirty: true });
    }
    if (result.status === 'invalid') setLocalError(STATION_MESSAGES.invalidImage);
    if (result.status === 'tooLarge') setLocalError(STATION_MESSAGES.imageTooLarge);
  };

  const fillCurrentLocation = async () => {
    setIsLocating(true);
    const result = await getCurrentLocation();
    setIsLocating(false);
    if (result.status === 'located') setCoordinates(result.coordinates);
    if (result.status === 'denied') setLocalError(STATION_MESSAGES.locationDenied);
    if (result.status === 'error') setLocalError(STATION_MESSAGES.locationError);
  };

  const submit = handleSubmit((values) => {
    if (mode === 'create' && !values.photo) {
      setLocalError(STATION_MESSAGES.requiredFields);
      return;
    }
    setLocalError(undefined);
    onSubmit({
      name: values.name,
      description: values.description,
      location: {
        latitude: parseCoordinate(values.latitude),
        longitude: parseCoordinate(values.longitude),
      },
      speciesIds: values.speciesIds,
      photo: values.photo,
    });
  });

  // El esquema produce un error por campo; se muestra uno solo, en el orden del formulario.
  const firstError = FIELD_ORDER.map((field) => errors[field]?.message).find(Boolean);
  const message = localError ?? firstError ?? errorMessage;
  const photoUri = photo?.uri ?? savedPhotoUrl;

  return (
    <FormScreen>
      <StationScreenHeader title={title} />

      <FormSection title={STATION_LABELS.photoSection}>
        <PhotoField photoUri={photoUri} onPress={() => void choosePhoto()} />
      </FormSection>

      <FormSection title={STATION_LABELS.name}>
        <TextFieldController
          control={control}
          name="name"
          label={STATION_LABELS.name}
          placeholder={STATION_LABELS.namePlaceholder}
        />
        <TextFieldController
          control={control}
          name="description"
          label={STATION_LABELS.description}
          placeholder={STATION_LABELS.descriptionPlaceholder}
          multiline
        />
      </FormSection>

      <FormSection title={STATION_LABELS.locationSection}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextFieldController
              control={control}
              name="latitude"
              label={STATION_LABELS.latitude}
              placeholder={STATION_LABELS.latitudePlaceholder}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={styles.flex}>
            <TextFieldController
              control={control}
              name="longitude"
              label={STATION_LABELS.longitude}
              placeholder={STATION_LABELS.longitudePlaceholder}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
        <Button
          label={isLocating ? STATION_LABELS.locating : STATION_LABELS.useCurrentLocation}
          variant="secondary"
          onPress={() => void fillCurrentLocation()}
          isLoading={isLocating}
        />
        {/* Sin red el mapa no carga: se queda el GPS (y escribirlas a mano), como antes. */}
        {networkStatus !== 'offline' && (
          <Button
            label={currentPoint ? LOCATION_PICKER_LABELS.change : LOCATION_PICKER_LABELS.open}
            variant="secondary"
            onPress={() => setIsPickingOnMap(true)}
          />
        )}
        <MapLocationPicker
          visible={isPickingOnMap}
          value={currentPoint}
          onCancel={() => setIsPickingOnMap(false)}
          onConfirm={(point) => {
            setIsPickingOnMap(false);
            setCoordinates(point);
          }}
        />
      </FormSection>

      <FormSection title={STATION_LABELS.speciesSection}>
        <ThemedText type="caption" themeColor="textMuted">
          {STATION_LABELS.speciesHint}
        </ThemedText>
        <Controller
          control={control}
          name="speciesIds"
          render={({ field: { value, onChange } }) => (
            <StationSpeciesPicker value={value} onChange={onChange} />
          )}
        />
      </FormSection>

      {message !== undefined && <FormMessage message={message} />}
      {message === undefined && successMessage !== undefined && (
        <FormMessage message={successMessage} variant="success" />
      )}
      <Button label={submitLabel} onPress={() => submit()} isLoading={isSubmitting} />
    </FormScreen>
  );
}

/** Las coordenadas escritas, si son válidas, para abrir el mapa centrado en ellas. */
function toCoordinates(latitude: string, longitude: string): Coordinates | null {
  const lat = parseCoordinate(latitude);
  const lng = parseCoordinate(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { latitude: lat, longitude: lng };
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

function PhotoField({ photoUri, onPress }: { photoUri: string | null; onPress: () => void }) {
  const theme = useTheme();

  if (photoUri) {
    return (
      <View style={styles.photo}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={STATION_LABELS.photoChange}
          onPress={onPress}
          style={styles.changePhoto}>
          <Icon name="camera" size={16} color="onPrimary" />
          <ThemedText type="captionBold" themeColor="onPrimary">
            {STATION_LABELS.photoChange}
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={STATION_LABELS.photoUpload}
      onPress={onPress}
      style={[
        styles.photoEmpty,
        { borderColor: theme.border, backgroundColor: theme.backgroundElement },
      ]}>
      <View style={[styles.photoBadge, { backgroundColor: theme.primarySoft }]}>
        <Icon name="imagePlus" size={24} color="primary" />
      </View>
      <ThemedText type="smallBold" themeColor="primary">
        {STATION_LABELS.photoUpload}
      </ThemedText>
      <ThemedText type="caption" themeColor="textMuted">
        {STATION_LABELS.photoHint}
      </ThemedText>
    </Pressable>
  );
}

type TextFieldControllerProps = {
  control: Control<StationFormValues>;
  name: 'name' | 'description' | 'latitude' | 'longitude';
  label: string;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'numbers-and-punctuation';
};

function TextFieldController({
  control,
  name,
  label,
  placeholder,
  multiline,
  keyboardType,
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
          keyboardType={keyboardType}
          autoCapitalize={keyboardType ? 'none' : 'sentences'}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
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
    backgroundColor: 'rgba(0, 15, 10, 0.55)',
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
});
