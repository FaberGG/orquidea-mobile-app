import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider, useToast } from './toast';

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

function Trigger() {
  const { show } = useToast();
  return (
    <Text accessibilityRole="button" onPress={() => show('Sin conexión.', 'info')}>
      mostrar
    </Text>
  );
}

function Tree() {
  return (
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('Toast', () => {
  it('se puede cerrar con su botón X antes de que se cierre solo', async () => {
    await render(<Tree />);
    await fireEvent.press(screen.getByText('mostrar'));
    expect(screen.getByText('Sin conexión.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar aviso' }));
    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.queryByText('Sin conexión.')).toBeNull();
  });

  it('se cierra solo después de unos segundos', async () => {
    await render(<Tree />);
    await fireEvent.press(screen.getByText('mostrar'));

    // Primero vence el tiempo en pantalla y luego termina la animación de salida.
    await act(async () => {
      jest.runAllTimers();
    });
    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.queryByText('Sin conexión.')).toBeNull();
  });
});
