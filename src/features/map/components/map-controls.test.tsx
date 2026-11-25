import { fireEvent, render, screen } from '@testing-library/react-native';

import { MapControls } from './map-controls';

it('permite crear estaciones sin ofrecer edición ni exportación del recorrido', async () => {
  const onCreateStation = jest.fn();

  await render(
    <MapControls
      canManageMap
      isLocating={false}
      nearest={null}
      onLocate={jest.fn()}
      onCreateStation={onCreateStation}
    />,
  );

  await fireEvent.press(screen.getByRole('button', { name: 'Gestionar mapa' }));

  expect(screen.queryByRole('button', { name: /trazar|exportar/i })).toBeNull();

  await fireEvent.press(screen.getByRole('button', { name: 'Crear estación' }));

  expect(onCreateStation).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: 'Crear estación' })).toBeNull();
});
