import { render, screen } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';

import { SpeciesDetailPager } from './species-detail-pager';

jest.mock('./species-detail-screen', () => ({
  SpeciesDetailScreen: ({ id }: { id: string }) => <MockText>{`ficha ${id}`}</MockText>,
}));

describe('SpeciesDetailPager', () => {
  it('abre en la ficha indicada y monta solo la actual y sus vecinas', async () => {
    await render(
      <SpeciesDetailPager ids={['a', 'b', 'c', 'd', 'e', 'f']} initialId="d" source={undefined} />,
    );

    expect(screen.getByText('ficha d')).toBeTruthy();
    expect(screen.queryByText('ficha a')).toBeNull();
  });
});
