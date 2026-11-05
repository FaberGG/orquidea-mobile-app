import { router, type Href } from 'expo-router';

import { STATION_LABELS } from '../constants';
import { getStationSaveErrorMessage, useCreateStation } from '../hooks';
import { StationForm } from './station-form';
import { type StationFormValues } from '../schemas/station-form.schema';

export const EMPTY_STATION_FORM_VALUES: StationFormValues = {
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  photo: null,
  speciesIds: [],
};

/**
 * HU-13 CA1/CA4: crear una estación (GUARDAR ESTACIÓN). Solo con `stations:manage` (ruta `(admin)`). Al
 * guardarla abre su detalle, donde se ven sus fichas asociadas.
 */
export function StationCreateScreen() {
  const create = useCreateStation();

  return (
    <StationForm
      mode="create"
      title={STATION_LABELS.createTitle}
      submitLabel={STATION_LABELS.createSubmit}
      defaultValues={EMPTY_STATION_FORM_VALUES}
      savedPhotoUrl={null}
      isSubmitting={create.isPending}
      errorMessage={create.isError ? getStationSaveErrorMessage(create.error) : undefined}
      onSubmit={(input) =>
        create.mutate(input, {
          onSuccess: (station) =>
            router.replace({
              pathname: '/stations/[id]',
              params: { id: station.id },
            } as unknown as Href),
        })
      }
    />
  );
}
