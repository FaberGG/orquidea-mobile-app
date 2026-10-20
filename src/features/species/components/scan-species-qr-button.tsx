import { router } from 'expo-router';

import { HeaderIconButton } from '@/components/layout/app-header';

import { SPECIES_QR_LABELS } from '../constants';

/** Entrada al escáner QR desde Inicio, disponible para cualquier rol. */
export function ScanSpeciesQrButton() {
  return (
    <HeaderIconButton
      icon="camera"
      accessibilityLabel={SPECIES_QR_LABELS.title}
      onPress={() => router.push('/qr')}
    />
  );
}
