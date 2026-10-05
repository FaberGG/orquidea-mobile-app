import { fireEvent, render, screen } from '@testing-library/react-native';
import { type BottomTabBarProps } from 'expo-router/tabs';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TabBar } from './tab-bar';

/** Áreas seguras fijas: en pruebas no hay dispositivo que las reporte. */
const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const ROUTES = [
  { key: 'index-1', name: 'index', title: 'Inicio' },
  { key: 'map-1', name: 'map', title: 'Mapas' },
];

function renderTabBar(index: number) {
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    navigate: jest.fn(),
  };
  const descriptors = Object.fromEntries(
    ROUTES.map((route) => [
      route.key,
      {
        options: {
          title: route.title,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Text>{`${route.name}-icon-${focused ? 'on' : 'off'}`}</Text>
          ),
        },
      },
    ]),
  );
  const props = {
    state: { index, routes: ROUTES.map(({ key, name }) => ({ key, name })) },
    descriptors,
    navigation,
  } as unknown as BottomTabBarProps;
  return {
    navigation,
    render: () =>
      render(
        <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
          <TabBar {...props} />
        </SafeAreaProvider>,
      ),
  };
}

describe('TabBar', () => {
  it('marca la pestaña activa y pasa el foco al ícono', async () => {
    await renderTabBar(0).render();

    expect(screen.getByRole('tab', { name: 'Inicio' }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByText('index-icon-on')).toBeTruthy();
    expect(screen.getByText('map-icon-off')).toBeTruthy();
  });

  it('navega al presionar una pestaña inactiva', async () => {
    const { navigation, render: renderIt } = renderTabBar(0);
    await renderIt();

    await fireEvent.press(screen.getByRole('tab', { name: 'Mapas' }));
    expect(navigation.navigate).toHaveBeenCalledWith('map', undefined);
  });
});
