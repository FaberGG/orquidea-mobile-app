import { AUTH_MESSAGES } from '../constants';
import { loginSchema } from './login.schema';

function firstError(values: { email: string; password: string }): string | undefined {
  const result = loginSchema.safeParse(values);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('loginSchema', () => {
  it('acepta correo y contraseña', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it.each([
    ['ambos vacíos', { email: '', password: '' }],
    ['sin correo', { email: '', password: 'clave' }],
    ['correo solo con espacios', { email: '   ', password: 'clave' }],
    ['sin contraseña', { email: 'a@b.co', password: '' }],
  ])('muestra "Ambos campos son obligatorios." con %s', (_case, values) => {
    expect(firstError(values)).toBe(AUTH_MESSAGES.requiredFields);
  });

  it('quita los espacios del correo', () => {
    expect(loginSchema.parse({ email: '  a@b.co ', password: 'x' }).email).toBe('a@b.co');
  });
});
