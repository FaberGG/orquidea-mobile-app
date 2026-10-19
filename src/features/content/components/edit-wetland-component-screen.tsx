import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_MESSAGES, WETLAND_COMPONENT_LIMITS, WETLAND_LABELS } from '../constants';
import {
  getSaveWetlandComponentErrorMessage,
  useSaveWetlandComponent,
  useWetlandComponent,
} from '../hooks';
import { wetlandComponentFormSchema, type WetlandComponentFormValues } from '../schemas';
import { type NewComponentPhoto, type WetlandComponent } from '../types';
import { ContentScreenHeader } from './content-screen-header';
import { pickComponentPhoto } from './pick-component-photo';

const TILE_SIZE = 96;

/**
 * HU-15: editar el texto y las fotos de un componente. Requiere `content:manage` (el grupo `(admin)`
 * ya exige permisos de administrador). Sin diseño en Figma: sigue el estilo del formulario de fichas.
 */
export function EditWetlandComponentScreen({ type }: { type: string }) {
  const { data, isPending, isError, refetch } = useWetlandComponent(type);
  const theme = useTheme();

  if (isPending) {
    return (
      <FormScreen>
        <ContentScreenHeader title={WETLAND_LABELS.editTitle} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </FormScreen>
    );
  }

  if (isError) {
    return (
      <FormScreen>
        <ContentScreenHeader title={WETLAND_LABELS.editTitle} />
        <EmptyState icon="wetland" title={CONTENT_MESSAGES.componentsLoadError}>
          <Button label={WETLAND_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      </FormScreen>
    );
  }

  return <EditWetlandComponentForm component={data} />;
}

function EditWetlandComponentForm({ component }: { component: WetlandComponent }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WetlandComponentFormValues>({
    resolver: zodResolver(wetlandComponentFormSchema),
    defaultValues: { name: component.name, description: component.description },
  });
  const save = useSaveWetlandComponent(component.type);
  // Los cambios de fotos se aplican al presionar GUARDAR CAMBIOS, junto con el texto (HU-15 CA1).
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewComponentPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);
  const [hasSaved, setHasSaved] = useState(false);

  const keptPhotos = component.photos.filter((photo) => !removedPhotoIds.includes(photo.id));
  const photoCount = keptPhotos.length + newPhotos.length;
  const isFull = photoCount >= WETLAND_COMPONENT_LIMITS.maxPhotos;

  const markChanged = () => {
    setHasSaved(false);
    setPhotoError(undefined);
  };

  const addPhoto = async () => {
    markChanged();
    if (isFull) return;
    const result = await pickComponentPhoto();
    if (result.status === 'picked') setNewPhotos((current) => [...current, result.photo]);
    if (result.status === 'invalid') setPhotoError(CONTENT_MESSAGES.photoInvalidFormat);
    if (result.status === 'tooLarge') setPhotoError(CONTENT_MESSAGES.photoTooLarge);
  };

  const onSubmit = handleSubmit((values) => {
    markChanged();
    save.mutate(
      {
        changes: {
          ...values,
          // Si un intento anterior falló a mitad de camino, las fotos ya borradas no se repiten.
          removedPhotoIds: removedPhotoIds.filter((id) =>
            component.photos.some((photo) => photo.id === id),
          ),
          newPhotos,
        },
        listeners: {
          onPhotoAdded: (added) =>
            setNewPhotos((current) => current.filter((photo) => photo.uri !== added.uri)),
        },
      },
      {
        onSuccess: (updated) => {
          reset({ name: updated.name, description: updated.description });
          setRemovedPhotoIds([]);
          setNewPhotos([]);
          setHasSaved(true);
        },
      },
    );
  });

  const validationMessage = errors.name?.message ?? errors.description?.message;
  const errorMessage =
    validationMessage ??
    photoError ??
    (save.isError ? getSaveWetlandComponentErrorMessage(save.error) : undefined);

  return (
    <FormScreen>
      <ContentScreenHeader title={WETLAND_LABELS.editTitle} />

      <View style={styles.fields}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={WETLAND_LABELS.nameLabel}
              placeholder={WETLAND_LABELS.namePlaceholder}
              value={value}
              onChangeText={(text) => {
                markChanged();
                onChange(text);
              }}
              onBlur={onBlur}
              hasError={Boolean(errors.name)}
              maxLength={WETLAND_COMPONENT_LIMITS.nameMaxLength}
              autoCapitalize="sentences"
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label={WETLAND_LABELS.descriptionLabel}
              placeholder={WETLAND_LABELS.descriptionPlaceholder}
              value={value}
              onChangeText={(text) => {
                markChanged();
                onChange(text);
              }}
              onBlur={onBlur}
              hasError={Boolean(errors.description)}
              maxLength={WETLAND_COMPONENT_LIMITS.descriptionMaxLength}
              autoCapitalize="sentences"
              multiline
            />
          )}
        />
      </View>

      <View style={styles.photosSection}>
        <View style={styles.photosHeader}>
          <ThemedText type="label" themeColor="textLabel">
            {WETLAND_LABELS.photosSection}
          </ThemedText>
          <ThemedText type="caption" themeColor="textMuted">
            {WETLAND_LABELS.photosCounter(photoCount, WETLAND_COMPONENT_LIMITS.maxPhotos)}
          </ThemedText>
        </View>
        <ThemedText type="caption" themeColor="textMuted">
          {WETLAND_LABELS.photosHint}
        </ThemedText>
        <View style={styles.grid}>
          {keptPhotos.map((photo) => (
            <PhotoTile
              key={photo.id}
              uri={photo.url}
              onRemove={() => {
                markChanged();
                setRemovedPhotoIds((current) => [...current, photo.id]);
              }}
            />
          ))}
          {newPhotos.map((photo) => (
            <PhotoTile
              key={photo.uri}
              uri={photo.uri}
              isNew
              onRemove={() => {
                markChanged();
                setNewPhotos((current) => current.filter((item) => item.uri !== photo.uri));
              }}
            />
          ))}
          {!isFull && <AddPhotoTile onPress={() => void addPhoto()} />}
        </View>
        {isFull && (
          <ThemedText type="caption" themeColor="textSecondary">
            {CONTENT_MESSAGES.photoLimitReached}
          </ThemedText>
        )}
      </View>

      {errorMessage !== undefined ? (
        <FormMessage message={errorMessage} />
      ) : (
        hasSaved && <FormMessage variant="success" message={CONTENT_MESSAGES.componentUpdated} />
      )}

      <Button label={WETLAND_LABELS.saveButton} onPress={onSubmit} isLoading={save.isPending} />
    </FormScreen>
  );
}

function PhotoTile({
  uri,
  isNew = false,
  onRemove,
}: {
  uri: string;
  isNew?: boolean;
  onRemove: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.backgroundSelected }]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      {isNew && (
        <View style={[styles.newBadge, { backgroundColor: theme.primary }]}>
          <ThemedText type="captionBold" themeColor="onPrimary">
            {WETLAND_LABELS.newPhotoBadge}
          </ThemedText>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={WETLAND_LABELS.removePhoto}
        onPress={onRemove}
        hitSlop={Spacing.one}
        style={styles.removeButton}>
        <Icon name="close" size={14} color="onPrimary" />
      </Pressable>
    </View>
  );
}

function AddPhotoTile({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={WETLAND_LABELS.addPhoto}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        styles.addTile,
        { borderColor: theme.primary, backgroundColor: theme.primarySoft },
        pressed && styles.pressed,
      ]}>
      <Icon name="imagePlus" size={24} color="primary" />
      <ThemedText type="captionBold" themeColor="primary" style={styles.addLabel}>
        {WETLAND_LABELS.addPhoto}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  fields: {
    gap: Spacing.three,
  },
  photosSection: {
    gap: Spacing.two,
  },
  photosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addLabel: {
    fontFamily: FontFamily.bold,
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    left: Spacing.one,
    bottom: Spacing.one,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 15, 10, 0.6)',
  },
  pressed: {
    opacity: 0.7,
  },
});
