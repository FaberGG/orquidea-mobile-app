import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { type ReactNode } from 'react';

import { ApiError } from '@/lib/api';
import { RoleProvider, type Role } from '@/permissions';

import { getSpeciesQr } from '../api';
import { SPECIES_QR_EXPORT_LABELS as LABELS } from '../constants';
import { SpeciesQrExport } from './species-qr-export';

jest.mock('../api', () => ({ getSpeciesQr: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache/' },
  File: jest.fn().mockImplementation((_directory: string, name: string) => ({
    uri: `file:///cache/${name}`,
    create: jest.fn(),
    write: jest.fn(),
  })),
}));

const ID = '20bbe26b-40c5-4beb-9a0e-e00709ae2256';
const URI = `file:///cache/orquidea-ficha-${ID}.png`;
const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
let queryClient: QueryClient;

function Wrapper({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider role={role}>{children}</RoleProvider>
    </QueryClientProvider>
  );
}

async function renderExport(role: Role = 'admin') {
  return render(<SpeciesQrExport id={ID} name="Azulejo QA A" />, {
    wrapper: (props) => <Wrapper role={role} {...props} />,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });
  jest.mocked(getSpeciesQr).mockResolvedValue(PNG);
  jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
  jest.mocked(Sharing.shareAsync).mockResolvedValue();
});

afterEach(() => queryClient.clear());

describe('SpeciesQrExport', () => {
  it.each(['visitor', 'user'] as const)(
    'oculta la gestión del QR al rol %s sin descargar nada',
    async (role) => {
      await renderExport(role);
      expect(screen.queryByText(LABELS.title)).toBeNull();
      expect(getSpeciesQr).not.toHaveBeenCalled();
    },
  );

  it.each(['admin', 'superadmin'] as const)(
    'permite al rol %s obtener el PNG y compartir el archivo original',
    async (role) => {
      await renderExport(role);
      expect(getSpeciesQr).not.toHaveBeenCalled();
      await fireEvent.press(screen.getByRole('button', { name: LABELS.generate }));
      await screen.findByLabelText('Código QR de Azulejo QA A');

      expect(getSpeciesQr).toHaveBeenCalledWith(ID, expect.any(AbortSignal));
      const file = jest.mocked(File).mock.results[0].value;
      expect(file.write).toHaveBeenCalledWith(PNG);
      expect(Sharing.shareAsync).not.toHaveBeenCalled();

      await fireEvent.press(screen.getByRole('button', { name: LABELS.share }));
      await waitFor(() =>
        expect(Sharing.shareAsync).toHaveBeenCalledWith(URI, {
          mimeType: 'image/png',
          UTI: 'public.png',
          dialogTitle: LABELS.shareTitle,
        }),
      );
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: LABELS.share }).props.accessibilityState.busy,
        ).toBe(false),
      );
      expect(screen.queryByRole('alert')).toBeNull();
    },
  );

  it('permite reintentar tras un fallo de red sin abrir el menú ni crear un archivo', async () => {
    jest
      .mocked(getSpeciesQr)
      .mockRejectedValueOnce(new ApiError({ status: 0, kind: 'network', path: '/qr' }));
    await renderExport();
    await fireEvent.press(screen.getByRole('button', { name: LABELS.generate }));
    await screen.findByText(LABELS.exportError);
    expect(File).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: LABELS.generate }));
    await screen.findByLabelText('Código QR de Azulejo QA A');
    expect(screen.queryByText(LABELS.exportError)).toBeNull();
  });

  it.each([
    [401, LABELS.signIn],
    [403, LABELS.forbidden],
    [404, LABELS.notFound],
  ])(
    'explica el error HTTP %s sin ofrecer compartir una respuesta fallida',
    async (status, message) => {
      jest
        .mocked(getSpeciesQr)
        .mockRejectedValue(new ApiError({ status: Number(status), kind: 'http', path: '/qr' }));
      await renderExport();
      await fireEvent.press(screen.getByRole('button', { name: LABELS.generate }));
      await screen.findByText(message);
      expect(screen.queryByRole('button', { name: LABELS.share })).toBeNull();
      expect(File).not.toHaveBeenCalled();
    },
  );

  it('conserva la vista previa si el dispositivo no permite compartir o si el menú falla', async () => {
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValueOnce(false);
    await renderExport();
    await fireEvent.press(screen.getByRole('button', { name: LABELS.generate }));
    await fireEvent.press(await screen.findByRole('button', { name: LABELS.share }));
    await screen.findByText(LABELS.shareUnavailable);
    expect(Sharing.shareAsync).not.toHaveBeenCalled();

    jest.mocked(Sharing.shareAsync).mockRejectedValueOnce(new Error('native failure'));
    await fireEvent.press(screen.getByRole('button', { name: LABELS.share }));
    await screen.findByText(LABELS.shareError);
    expect(screen.getByLabelText('Código QR de Azulejo QA A')).toBeTruthy();
  });

  it('cancela la descarga al salir y no guarda una respuesta tardía', async () => {
    let finish: (value: Uint8Array) => void = () => undefined;
    let signal: AbortSignal | undefined;
    jest.mocked(getSpeciesQr).mockImplementation((_id, receivedSignal) => {
      signal = receivedSignal;
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    const view = await renderExport();
    await fireEvent.press(screen.getByRole('button', { name: LABELS.generate }));
    await waitFor(() => expect(signal).toBeDefined());
    expect(
      screen.getByRole('button', { name: LABELS.generate }).props.accessibilityState.disabled,
    ).toBe(true);
    await view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      finish(PNG);
    });
    expect(File).not.toHaveBeenCalled();
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });
});
