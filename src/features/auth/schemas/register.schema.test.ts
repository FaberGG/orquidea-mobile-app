import { AUTH_MESSAGES } from '../constants';
import { registerSchema, type RegisterFormValues } from './register.schema';

const VALID: RegisterFormValues = {
  firstName: 'María',
  lastName: 'Solarte',
  email: 'maria@orquidea.local',
  password: 'Clave123',
  confirmPassword: 'Clave123',
  acceptTerms: true,
};

function firstError(values: Partial<RegisterFormValues>): string | undefined {
  const result = registerSchema.safeParse({ ...VALID, ...values });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('registerSchema (HU-2)', () => {
  it('acepta datos válidos', () => {
    expect(firstError({})).toBeUndefined();
  });

  it.each(['firstName', 'lastName', 'email', 'password', 'confirmPassword'] as const)(
    'CA3: sin %s muestra "Todos los campos son obligatorios."',
    (field) => {
      expect(firstError({ [field]: '' })).toBe(AUTH_MESSAGES.registerRequiredFields);
    },
  );

  it('CA3: un nombre solo con espacios cuenta como vacío', () => {
    expect(firstError({ firstName: '   ' })).toBe(AUTH_MESSAGES.registerRequiredFields);
  });

  it('CA3 tiene prioridad sobre el formato del correo', () => {
    expect(firstError({ email: 'malo', lastName: '' })).toBe(AUTH_MESSAGES.registerRequiredFields);
  });

  it.each(['maria', 'maria@', 'maria@orquidea', '@orquidea.local'])(
    'CA4: "%s" muestra "Ingresa un correo electrónico válido."',
    (email) => {
      expect(firstError({ email })).toBe(AUTH_MESSAGES.invalidEmail);
    },
  );

  it('exige nombre y apellido de al menos 2 caracteres (contrato)', () => {
    expect(firstError({ firstName: 'M' })).toBe(AUTH_MESSAGES.nameTooShort);
    expect(firstError({ lastName: 'S' })).toBe(AUTH_MESSAGES.nameTooShort);
  });

  it('exige que las contraseñas coincidan', () => {
    expect(firstError({ confirmPassword: 'Otra123' })).toBe(AUTH_MESSAGES.passwordsDoNotMatch);
  });

  it('exige aceptar los términos', () => {
    expect(firstError({ acceptTerms: false })).toBe(AUTH_MESSAGES.termsNotAccepted);
  });
});
