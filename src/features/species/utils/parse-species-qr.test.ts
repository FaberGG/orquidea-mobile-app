import contract from '@/../docs/hu11/qr-contract.json';

import { parseSpeciesQr } from './parse-species-qr';

describe('parseSpeciesQr', () => {
  it.each(contract.valid)('acepta el fixture: $text', ({ text, speciesId }) => {
    expect(parseSpeciesQr(text)).toBe(speciesId);
  });

  it.each(contract.invalid)('rechaza el fixture por $reason', ({ text }) => {
    expect(parseSpeciesQr(text)).toBeNull();
  });
});
