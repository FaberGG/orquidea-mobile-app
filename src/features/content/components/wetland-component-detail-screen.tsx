import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isApiError } from '@/lib/api';
import { Can } from '@/permissions';

import { CONTENT_MESSAGES, WETLAND_COMPONENT_ICONS, WETLAND_LABELS } from '../constants';
import { useWetlandComponent } from '../hooks';
import { type WetlandComponent } from '../types';
import { ContentScreenHeader } from './content-screen-header';
import { formatDate } from './format-date';

const PHOTO_WIDTH = 280;
const PHOTO_HEIGHT = 200;

/**
 * HU-14: descripción e imágenes de un componente (CA1). Si aún no tiene información publicada,
 * muestra el mensaje de CA2. Con `content:manage` aparece el botón para editarlo (HU-15).
 */
export function WetlandComponentDetailScreen({ type }: { type: string }) {
  const { data, isPending, isError, error, refetch } = useWetlandComponent(type);
  const theme = useTheme();

  if (isPending) {
    return (
      <FormScreen>
        <ContentScreenHeader title="" />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </FormScreen>
    );
  }

  if (isError) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <FormScreen>
        <ContentScreenHeader title="" />
        <EmptyState
          icon="wetland"
          title={
            notFound ? CONTENT_MESSAGES.componentNotFound : CONTENT_MESSAGES.componentsLoadError
          }>
          {!notFound && <Button label={WETLAND_LABELS.retry} onPress={() => void refetch()} />}
        </EmptyState>
      </FormScreen>
    );
  }

  return (
    <FormScreen>
      <ContentScreenHeader title={data.name} />
      {data.hasContent ? (
        <WetlandComponentContent component={data} />
      ) : (
        // HU-14 CA2
        <EmptyState
          icon={WETLAND_COMPONENT_ICONS[data.type] ?? 'wetland'}
          title={CONTENT_MESSAGES.componentWithoutContent}
        />
      )}
      <Can permission="content:manage">
        <Button
          label={WETLAND_LABELS.editButton}
          onPress={() => router.push({ pathname: '/wetland/[type]/edit', params: { type } })}
        />
      </Can>
    </FormScreen>
  );
}

function WetlandComponentContent({ component }: { component: WetlandComponent }) {
  const theme = useTheme();
  const updatedAt = component.updatedAt ? formatDate(component.updatedAt) : null;

  return (
    <View style={styles.content}>
      {component.photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photos}
          accessibilityLabel={WETLAND_LABELS.photosSection}>
          {component.photos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.url }}
              style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}
              contentFit="cover"
              accessible
              accessibilityLabel={WETLAND_LABELS.photoOf(component.name)}
            />
          ))}
        </ScrollView>
      )}
      <ThemedText style={styles.description} themeColor="textSecondary">
        {component.description}
      </ThemedText>
      {updatedAt !== null && (
        <ThemedText type="caption" themeColor="textMuted">
          {WETLAND_LABELS.updatedAt(updatedAt)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  content: {
    gap: Spacing.three,
  },
  photos: {
    gap: Spacing.three,
  },
  photo: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    borderRadius: Radius.card,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 23,
  },
});
