import { onlineManager } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { getOfflineFileUri } from '@/lib/offline';

import { OfflineImage } from './offline-image';

jest.mock('@/lib/offline', () => ({
  ...jest.requireActual('@/lib/offline'),
  getOfflineFileUri: jest.fn(() => null),
}));

const FOTO = 'https://r2.example/azulejo-2.jpg';
const fallback = <Text>no disponible</Text>;
const sourceOf = () => JSON.stringify(screen.getByTestId('foto').props.source);

beforeEach(() => jest.mocked(getOfflineFileUri).mockImplementation(() => null));
afterEach(() => onlineManager.setOnline(true));

describe('OfflineImage (HU-21)', () => {
  it('usa la copia descargada si existe, también sin conexión', async () => {
    jest.mocked(getOfflineFileUri).mockReturnValue('file:///offline/azulejo-2.jpg');
    onlineManager.setOnline(false);
    await render(<OfflineImage testID="foto" uri={FOTO} unavailableFallback={fallback} />);

    expect(sourceOf()).toContain('file:///offline/azulejo-2.jpg');
    expect(screen.queryByText('no disponible')).toBeNull();
  });

  it('con conexión y sin copia usa la URL remota', async () => {
    await render(<OfflineImage testID="foto" uri={FOTO} unavailableFallback={fallback} />);

    expect(sourceOf()).toContain(FOTO);
  });

  it('sin conexión y sin copia muestra el aviso', async () => {
    onlineManager.setOnline(false);
    await render(<OfflineImage uri={FOTO} unavailableFallback={fallback} />);

    expect(screen.getByText('no disponible')).toBeTruthy();
  });
});
