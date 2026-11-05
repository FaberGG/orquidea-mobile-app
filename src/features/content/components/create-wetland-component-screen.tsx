import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { FormMessage } from '@/components/feedback/form-message';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';

import { CONTENT_MESSAGES, WETLAND_COMPONENT_LIMITS, WETLAND_LABELS } from '../constants';
import { getCreateWetlandComponentErrorMessage, useCreateWetlandComponent } from '../hooks';
import { wetlandComponentFormSchema, type WetlandComponentFormValues } from '../schemas';
import { type NewComponentPhoto } from '../types';
import { ComponentPhotosField } from './component-photos-field';
import { ContentScreenHeader } from './content-screen-header';
import { pickComponentPhoto } from './pick-component-photo';

const EMPTY_VALUES: WetlandComponentFormValues = { name: '', description: '' };

type Result = { kind: 'created' } | { kind: 'createdWithoutSomePhotos' };

/**
 * HU-25: crear un componente del humedal con nombre, descripción e imágenes. Requiere
 * `content:manage` (el grupo `(admin)` ya exige permisos de administrador). Al guardar, el componente
 * aparece en la sección de componentes (CA1) y el formulario queda vacío para crear otro.
 */
export function CreateWetlandComponentScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WetlandComponentFormValues>({
    resolver: zodResolver(wetlandComponentFormSchema),
    defaultValues: EMPTY_VALUES,
  });
  const create = useCreateWetlandComponent();
  const [photos, setPhotos] = useState<NewComponentPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<Result | null>(null);

  const markChanged = () => {
    setResult(null);
    setPhotoError(undefined);
  };

  const addPhoto = async () => {
    markChanged();
    const picked = await pickComponentPhoto();
    if (picked.status === 'picked') setPhotos((current) => [...current, picked.photo]);
    // HU-25 CA4
    if (picked.status === 'invalid') setPhotoError(CONTENT_MESSAGES.photoInvalidFormat);
    if (picked.status === 'tooLarge') setPhotoError(CONTENT_MESSAGES.photoTooLarge);
  };

  const onSubmit = handleSubmit((values) => {
    markChanged();
    create.mutate(
      { ...values, photos },
      {
        onSuccess: ({ photoError: uploadError }) => {
          reset(EMPTY_VALUES);
          setPhotos([]);
          setResult({ kind: uploadError ? 'createdWithoutSomePhotos' : 'created' });
        },
      },
    );
  });

  // CA2 tiene un único mensaje para nombre y descripción: se muestra una sola vez.
  const validationMessage = errors.name?.message ?? errors.description?.message;
  const errorMessage =
    validationMessage ??
    photoError ??
    (create.isError ? getCreateWetlandComponentErrorMessage(create.error) : undefined);

  return (
    <FormScreen>
      <ContentScreenHeader title={WETLAND_LABELS.createTitle} />
      <ThemedText type="small" themeColor="textSecondary">
        {WETLAND_LABELS.createSubtitle}
      </ThemedText>

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
        newPhotos={photos}
        onAdd={() => void addPhoto()}
        onRemoveNew={(removed) => {
          markChanged();
          setPhotos((current) => current.filter((item) => item.uri !== removed.uri));
        }}
      />

      {errorMessage !== undefined ? (
        <FormMessage message={errorMessage} />
      ) : result?.kind === 'created' ? (
        <FormMessage variant="success" message={CONTENT_MESSAGES.componentCreated} />
      ) : (
        result?.kind === 'createdWithoutSomePhotos' && (
          <FormMessage message={CONTENT_MESSAGES.componentCreatedWithoutSomePhotos} />
        )
      )}

      <Button
        label={WETLAND_LABELS.createButton}
        onPress={() => void onSubmit()}
        isLoading={create.isPending}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.three,
  },
});
