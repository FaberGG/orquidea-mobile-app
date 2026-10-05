import { AUTH_MESSAGES } from '../constants';
import { forgotPasswordSchema } from './forgot-password.schema';
import { resetPasswordSchema } from './reset-password.schema';

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.success ? undefined : result.error?.issues[0]?.message;
}

describe('forgotPasswordSchema (HU-1.1 paso 1)', () => {
  it('acepta un correo válido', () => {
    expect(forgotPasswordSchema.safeParse({ email: ' maria@orquidea.local ' }).success).toBe(true);
  });

  it('CA3: sin correo muestra "Debes ingresar tu correo electrónico."', () => {
    expect(firstError(forgotPasswordSchema.safeParse({ email: '  ' }))).toBe(
      AUTH_MESSAGES.emailRequired,
    );
  });

  it('con formato inválido muestra "Ingresa un correo electrónico válido."', () => {
    expect(firstError(forgotPasswordSchema.safeParse({ email: 'maria@' }))).toBe(
      AUTH_MESSAGES.invalidEmail,
    );
  });
});

describe('resetPasswordSchema (HU-1.1 paso 2)', () => {
  const VALID = { code: '482913', password: 'Nueva123', confirmPassword: 'Nueva123' };

  it('acepta código de 6 dígitos y contraseñas iguales', () => {
    expect(resetPasswordSchema.safeParse(VALID).success).toBe(true);
  });

  it.each(['code', 'password', 'confirmPassword'] as const)('exige %s', (field) => {
    expect(firstError(resetPasswordSchema.safeParse({ ...VALID, [field]: '' }))).toBe(
      AUTH_MESSAGES.resetRequiredFields,
    );
  });

  it.each(['12345', '1234567', '12a456'])('rechaza el código "%s"', (code) => {
    expect(firstError(resetPasswordSchema.safeParse({ ...VALID, code }))).toBe(
      AUTH_MESSAGES.invalidCode,
    );
  });

  it('exige que las contraseñas coincidan', () => {
    expect(firstError(resetPasswordSchema.safeParse({ ...VALID, confirmPassword: 'Otra' }))).toBe(
      AUTH_MESSAGES.passwordsDoNotMatch,
    );
  });
});
