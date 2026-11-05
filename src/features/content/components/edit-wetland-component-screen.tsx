import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_MESSAGES, WETLAND_COMPONENT_LIMITS, WETLAND_LABELS } from '../constants';
import {
  getSaveWetlandComponentErrorMessage,
  useSaveWetlandComponent,
  useWetlandComponent,
} from '../hooks';
import { wetlandComponentFormSchema, type WetlandComponentFormValues } from '../schemas';
import { type NewComponentPhoto, type WetlandComponent } from '../types';
import { ComponentPhotosField } from './component-photos-field';
import { ContentScreenHeader } from './content-screen-header';
import { pickComponentPhoto } from './pick-component-photo';

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

      <ComponentPhotosField
        savedPhotos={keptPhotos}
        newPhotos={newPhotos}
        onAdd={() => void addPhoto()}
        onRemoveSaved={(photoId) => {
          markChanged();
          setRemovedPhotoIds((current) => [...current, photoId]);
        }}
        onRemoveNew={(removed) => {
          markChanged();
          setNewPhotos((current) => current.filter((item) => item.uri !== removed.uri));
        }}
      />

      {errorMessage !== undefined ? (
        <FormMessage message={errorMessage} />
      ) : (
        hasSaved && <FormMessage variant="success" message={CONTENT_MESSAGES.componentUpdated} />
      )}

      <Button
        label={WETLAND_LABELS.saveButton}
        onPress={() => onSubmit()}
        isLoading={save.isPending}
      />
    </FormScreen>
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
});
