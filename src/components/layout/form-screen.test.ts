import { getKeyboardScrollDelta, KEYBOARD_INPUT_MARGIN } from './form-screen';

describe('getKeyboardScrollDelta (Acta 17: campos tapados por el teclado)', () => {
  it('no desplaza si el campo ya se ve encima del teclado', () => {
    expect(
      getKeyboardScrollDelta({ inputBottom: 300, windowHeight: 800, keyboardHeight: 300 }),
    ).toBe(0);
  });

  it('desplaza lo justo para dejar el campo encima del teclado, con margen', () => {
    // El teclado empieza en 500; el campo termina en 650.
    expect(
      getKeyboardScrollDelta({ inputBottom: 650, windowHeight: 800, keyboardHeight: 300 }),
    ).toBe(150 + KEYBOARD_INPUT_MARGIN);
  });
});
