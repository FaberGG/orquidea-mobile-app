import { ADMIN_MESSAGES } from '../constants';
import { createAdminSchema } from './create-admin.schema';

const valid = {
  firstName: 'María',
  lastName: 'Pérez',
  email: 'maria@orquidea.co',
  password: 'Clave123',
  confirmPassword: 'Clave123',
};

describe('HU-4: validación de creación de administrador', () => {
  it('acepta y recorta nombre, apellido y correo', () => {
    expect(
      createAdminSchema.parse({
        ...valid,
        firstName: ' María ',
        lastName: ' Pérez ',
        email: ' maria@orquidea.co ',
      }),
    ).toMatchObject(valid);
  });

  it('no envía un formulario incompleto', () => {
    const result = createAdminSchema.safeParse({ ...valid, firstName: '' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe(ADMIN_MESSAGES.requiredFields);
  });

  it('rechaza un correo inválido', () => {
    const result = createAdminSchema.safeParse({ ...valid, email: 'invalido' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe(ADMIN_MESSAGES.invalidEmail);
  });

  it('rechaza una confirmación de contraseña distinta', () => {
    const result = createAdminSchema.safeParse({ ...valid, confirmPassword: 'otra' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toBe(ADMIN_MESSAGES.passwordMismatch);
  });

  it('rechaza los nombres y correos que superan los límites de la API', () => {
    expect(createAdminSchema.safeParse({ ...valid, firstName: 'A'.repeat(101) })).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({ message: ADMIN_MESSAGES.firstNameTooLong })] },
    });
    expect(createAdminSchema.safeParse({ ...valid, lastName: 'A'.repeat(101) })).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({ message: ADMIN_MESSAGES.lastNameTooLong })] },
    });
    expect(
      createAdminSchema.safeParse({ ...valid, email: `${'a'.repeat(247)}@test.co` }),
    ).toMatchObject({
      success: false,
      error: { issues: [expect.objectContaining({ message: ADMIN_MESSAGES.emailTooLong })] },
    });
  });
});
