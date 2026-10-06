import { router, type Href } from 'expo-router';
import { type DrawerContentComponentProps } from 'expo-router/drawer';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { ROLE_LABELS, useSession, type User } from '@/features/auth';
import { useTheme } from '@/hooks/use-theme';
import { Can } from '@/permissions';

import { NAVIGATION_LABELS } from '../constants';
import { DrawerItem, DrawerSection } from './drawer-item';

const AVATAR_SIZE = 56;

function getInitials(user: User) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

/**
 * Contenido del menú lateral. Sin diseño en Figma: hereda sus tokens (Nunito, Lucide, neutros y
 * green-500, radios completos de los chips). Arriba la identidad (usuario con su rol, o visitante con
 * acceso a iniciar sesión); debajo los destinos secundarios. Los que aún no existen se muestran como
 * "Próximamente"; la administración solo aparece con su permiso.
 */
export function AppDrawerContent({ navigation }: DrawerContentComponentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useSession();

  const goTo = (href: Href) => {
    navigation.closeDrawer();
    router.navigate(href);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + Spacing.four,
        },
      ]}>
      {user ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={NAVIGATION_LABELS.viewAccount}
          onPress={() => goTo('/account')}
          style={({ pressed }) => [styles.identity, pressed && styles.pressed]}>
          <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
            <ThemedText style={styles.initials} themeColor="primary">
              {getInitials(user)}
            </ThemedText>
          </View>
          <View style={styles.identityText}>
            <ThemedText style={styles.name} themeColor="textLabel" numberOfLines={1}>
              {`${user.firstName} ${user.lastName}`}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
              {user.email}
            </ThemedText>
            <View style={[styles.rolePill, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="captionBold" themeColor="textSecondary">
                {ROLE_LABELS[user.role]}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      ) : (
        <View style={styles.guest}>
          <View style={styles.identity}>
            <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
              <Icon name="user" size={28} color="navInactive" />
            </View>
            <View style={styles.identityText}>
              <ThemedText style={styles.name} themeColor="textLabel">
                {NAVIGATION_LABELS.guestName}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {NAVIGATION_LABELS.guestDescription}
              </ThemedText>
            </View>
          </View>
          <Button label={NAVIGATION_LABELS.loginButton} onPress={() => goTo('/login')} />
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Can permission="species:create">
        <DrawerSection title={NAVIGATION_LABELS.sectionContent}>
          <DrawerItem
            icon="add"
            label={NAVIGATION_LABELS.newSpecies}
            onPress={() => goTo('/species/new')}
          />
        </DrawerSection>
      </Can>

      <DrawerSection title={NAVIGATION_LABELS.sectionWetland}>
        <DrawerItem icon="wetland" label={NAVIGATION_LABELS.wetlandComponents} isComingSoon />
        <DrawerItem icon="announcements" label={NAVIGATION_LABELS.announcements} isComingSoon />
        <DrawerItem icon="offline" label={NAVIGATION_LABELS.offlineDownloads} isComingSoon />
      </DrawerSection>

      <Can permission="admins:read">
        <DrawerSection title={NAVIGATION_LABELS.sectionAdmin}>
          <DrawerItem
            icon="manageAccounts"
            label={NAVIGATION_LABELS.manageAccounts}
            onPress={() => goTo('/admins')}
          />
        </DrawerSection>
      </Can>

      <View style={styles.spacer} />
      <ThemedText type="caption" themeColor="textMuted" style={styles.footer}>
        {NAVIGATION_LABELS.appName}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  guest: {
    gap: Spacing.four,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: Radius.full,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.two,
  },
  spacer: {
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
