import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { FormScreen } from '@/components/layout/form-screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CONTENT_MESSAGES, WETLAND_COMPONENT_ICONS, WETLAND_LABELS } from '../constants';
import { useWetlandComponents } from '../hooks';
import { type WetlandComponent } from '../types';
import { ContentScreenHeader } from './content-screen-header';

/**
 * HU-14: listado de los componentes del humedal, un botón por componente. Es público. Sin diseño en
 * Figma: usa los tokens del resto de la app (tarjetas redondeadas, ícono en círculo de marca).
 */
export function WetlandComponentsScreen() {
  const { data, isPending, isError, refetch } = useWetlandComponents();
  const theme = useTheme();

  return (
    <FormScreen>
      <ContentScreenHeader title={WETLAND_LABELS.listTitle} />
      <ThemedText type="small" themeColor="textSecondary">
        {WETLAND_LABELS.listSubtitle}
      </ThemedText>

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : isError ? (
        <EmptyState icon="wetland" title={CONTENT_MESSAGES.componentsLoadError}>
          <Button label={WETLAND_LABELS.retry} onPress={() => void refetch()} />
        </EmptyState>
      ) : data.length === 0 ? (
        <EmptyState icon="wetland" title={CONTENT_MESSAGES.componentsEmpty} />
      ) : (
        <View style={styles.list}>
          {data.map((component) => (
            <WetlandComponentButton
              key={component.type}
              component={component}
              onPress={() =>
                router.push({ pathname: '/wetland/[type]', params: { type: component.type } })
              }
            />
          ))}
        </View>
      )}
    </FormScreen>
  );
}

function WetlandComponentButton({
  component,
  onPress,
}: {
  component: WetlandComponent;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={component.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
        <Icon name={WETLAND_COMPONENT_ICONS[component.type] ?? 'wetland'} size={24} />
      </View>
      <View style={styles.cardText}>
        <ThemedText style={styles.name} themeColor="textLabel" numberOfLines={1}>
          {component.name}
        </ThemedText>
        {component.hasContent && component.description.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {component.description}
          </ThemedText>
        )}
      </View>
      <Icon name="chevronRight" size={20} color="textMuted" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.7,
  },
});
